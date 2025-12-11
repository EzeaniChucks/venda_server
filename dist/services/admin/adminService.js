"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const data_source_1 = require("../../config/data-source");
const entities_1 = require("../../entities");
class AdminService {
    constructor() {
        this.customerRepository = data_source_1.AppDataSource.getRepository(entities_1.Customer);
        this.vendorRepository = data_source_1.AppDataSource.getRepository(entities_1.Vendor);
        this.riderRepository = data_source_1.AppDataSource.getRepository(entities_1.Rider);
        this.productRepository = data_source_1.AppDataSource.getRepository(entities_1.Product);
        this.orderRepository = data_source_1.AppDataSource.getRepository(entities_1.Order);
        this.vendorProfileRepository = data_source_1.AppDataSource.getRepository(entities_1.VendorProfile);
        this.riderDocumentRepository = data_source_1.AppDataSource.getRepository(entities_1.RiderDocument);
    }
    async getUsers(filters = {}) {
        const { role, is_active, page = 1, limit = 20 } = filters;
        let repository;
        let tableName = '';
        switch (role) {
            case 'customer':
                repository = this.customerRepository;
                tableName = 'customer';
                break;
            case 'vendor':
                repository = this.vendorRepository;
                tableName = 'vendor';
                break;
            case 'rider':
                repository = this.riderRepository;
                tableName = 'rider';
                break;
            default:
                const customers = await this.customerRepository.find({ skip: (page - 1) * limit, take: limit });
                const vendors = await this.vendorRepository.find({ skip: (page - 1) * limit, take: limit });
                const riders = await this.riderRepository.find({ skip: (page - 1) * limit, take: limit });
                return [
                    ...customers.map(u => ({ ...u, role: 'customer' })),
                    ...vendors.map(u => ({ ...u, role: 'vendor' })),
                    ...riders.map(u => ({ ...u, role: 'rider' }))
                ].slice(0, limit);
        }
        const queryBuilder = repository.createQueryBuilder(tableName);
        if (is_active !== undefined) {
            queryBuilder.where(`${tableName}.isActive = :isActive`, { isActive: is_active });
        }
        const users = await queryBuilder
            .orderBy(`${tableName}.createdAt`, 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getMany();
        return users.map((u) => ({ ...u, role }));
    }
    async updateUserStatus(userId, role, isActive) {
        let repository;
        switch (role) {
            case 'customer':
                repository = this.customerRepository;
                break;
            case 'vendor':
                repository = this.vendorRepository;
                break;
            case 'rider':
                repository = this.riderRepository;
                break;
            default:
                throw new Error('Invalid role');
        }
        const user = await repository.findOne({ where: { id: userId } });
        if (!user) {
            throw new Error('User not found');
        }
        user.isActive = isActive;
        return await repository.save(user);
    }
    async getProductsForApproval(filters = {}) {
        const { is_approved, page = 1, limit = 20 } = filters;
        const queryBuilder = this.productRepository
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.vendor', 'vendor')
            .leftJoinAndSelect('vendor.vendorProfile', 'vendorProfile');
        if (is_approved !== undefined) {
            queryBuilder.where('product.isApproved = :isApproved', { isApproved: is_approved });
        }
        const products = await queryBuilder
            .orderBy('product.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getMany();
        return products.map(p => ({
            ...p,
            vendor_name: p.vendor?.email,
            business_name: p.vendor?.vendorProfile?.businessName
        }));
    }
    async updateProductApproval(productId, isApproved) {
        const product = await this.productRepository.findOne({
            where: { id: productId }
        });
        if (!product) {
            throw new Error('Product not found');
        }
        product.isApproved = isApproved;
        return await this.productRepository.save(product);
    }
    async getAnalytics() {
        const customersCount = await this.customerRepository.count({ where: { isActive: true } });
        const vendorsCount = await this.vendorRepository.count({ where: { isActive: true } });
        const ridersCount = await this.riderRepository.count({ where: { isActive: true } });
        const productsStats = await this.productRepository
            .createQueryBuilder('product')
            .select('COUNT(*)', 'total_products')
            .addSelect('SUM(CASE WHEN product.is_approved = true THEN 1 ELSE 0 END)', 'approved_products')
            .addSelect('SUM(CASE WHEN product.is_approved = false THEN 1 ELSE 0 END)', 'pending_products')
            .where('product.isActive = true')
            .getRawOne();
        const ordersStats = await this.orderRepository
            .createQueryBuilder('order')
            .select('COUNT(*)', 'total_orders')
            .addSelect('SUM(order.final_amount)', 'total_revenue')
            .addSelect('SUM(CASE WHEN order.order_status = \'delivered\' THEN 1 ELSE 0 END)', 'completed_orders')
            .addSelect('SUM(CASE WHEN order.order_status = \'pending\' THEN 1 ELSE 0 END)', 'pending_orders')
            .getRawOne();
        return {
            users: {
                total_users: customersCount + vendorsCount + ridersCount,
                customers: customersCount,
                vendors: vendorsCount,
                riders: ridersCount
            },
            products: productsStats,
            orders: ordersStats
        };
    }
    async approveVendor(vendorId, isApproved) {
        const profile = await this.vendorProfileRepository.findOne({
            where: { vendorId }
        });
        if (!profile) {
            throw new Error('Vendor not found');
        }
        profile.isApproved = isApproved;
        return await this.vendorProfileRepository.save(profile);
    }
    async approveRider(riderId, isApproved) {
        const rider = await this.riderRepository.findOne({
            where: { id: riderId }
        });
        if (!rider) {
            throw new Error('Rider not found');
        }
        rider.isApproved = isApproved;
        return await this.riderRepository.save(rider);
    }
}
exports.AdminService = AdminService;
exports.default = new AdminService();
//# sourceMappingURL=adminService.js.map