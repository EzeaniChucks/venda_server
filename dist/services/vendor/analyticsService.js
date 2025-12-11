"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const typeorm_1 = require("typeorm");
const Order_1 = require("../../entities/Order");
const OrderItem_1 = require("../../entities/OrderItem");
const Product_1 = require("../../entities/Product");
const Customer_1 = require("../../entities/Customer");
const Vendor_1 = require("../../entities/Vendor");
const VendorProfile_1 = require("../../entities/VendorProfile");
const data_source_1 = require("../../config/data-source");
const date_fns_1 = require("date-fns");
class AnalyticsService {
    constructor() {
        this.orderRepository = data_source_1.AppDataSource.getRepository(Order_1.Order);
        this.orderItemRepository = data_source_1.AppDataSource.getRepository(OrderItem_1.OrderItem);
        this.productRepository = data_source_1.AppDataSource.getRepository(Product_1.Product);
        this.customerRepository = data_source_1.AppDataSource.getRepository(Customer_1.Customer);
        this.vendorRepository = data_source_1.AppDataSource.getRepository(Vendor_1.Vendor);
        this.vendorProfileRepository = data_source_1.AppDataSource.getRepository(VendorProfile_1.VendorProfile);
    }
    async getVendorOverview(vendorId, dateRange) {
        const { startDate, endDate } = dateRange;
        const currentOrders = await this.orderItemRepository
            .createQueryBuilder("item")
            .select("COUNT(DISTINCT item.orderId)", "totalOrders")
            .addSelect("SUM(item.totalPrice)", "totalRevenue")
            .where("item.vendorId = :vendorId", { vendorId })
            .andWhere("item.createdAt BETWEEN :startDate AND :endDate", {
            startDate,
            endDate,
        })
            .getRawOne();
        const previousStartDate = new Date(startDate);
        const previousEndDate = new Date(endDate);
        const periodDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        previousStartDate.setDate(previousStartDate.getDate() - periodDays);
        previousEndDate.setDate(previousEndDate.getDate() - periodDays);
        const previousOrders = await this.orderItemRepository
            .createQueryBuilder("item")
            .select("COUNT(DISTINCT item.orderId)", "totalOrders")
            .addSelect("SUM(item.totalPrice)", "totalRevenue")
            .where("item.vendorId = :vendorId", { vendorId })
            .andWhere("item.createdAt BETWEEN :startDate AND :endDate", {
            startDate: previousStartDate,
            endDate: previousEndDate,
        })
            .getRawOne();
        const totalOrders = parseInt(currentOrders?.totalOrders || "0");
        const totalRevenue = parseFloat(currentOrders?.totalRevenue || "0");
        const prevTotalOrders = parseInt(previousOrders?.totalOrders || "0");
        const prevTotalRevenue = parseFloat(previousOrders?.totalRevenue || "0");
        const orderChange = prevTotalOrders > 0
            ? (((totalOrders - prevTotalOrders) / prevTotalOrders) * 100).toFixed(1)
            : "0.0";
        const revenueChange = prevTotalRevenue > 0
            ? (((totalRevenue - prevTotalRevenue) / prevTotalRevenue) *
                100).toFixed(1)
            : "0.0";
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        const prevAvgOrderValue = prevTotalOrders > 0 ? prevTotalRevenue / prevTotalOrders : 0;
        const avgOrderChange = prevAvgOrderValue > 0
            ? (((avgOrderValue - prevAvgOrderValue) / prevAvgOrderValue) *
                100).toFixed(1)
            : "0.0";
        const pendingOrders = await this.orderItemRepository.count({
            where: {
                vendorId,
                vendorStatus: (0, typeorm_1.In)(["pending", "accepted", "preparing"]),
                createdAt: (0, typeorm_1.Between)(startDate, endDate),
            },
        });
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
        const todayStats = await this.orderItemRepository
            .createQueryBuilder("item")
            .select("COUNT(DISTINCT item.orderId)", "orders")
            .addSelect("SUM(item.totalPrice)", "revenue")
            .where("item.vendorId = :vendorId", { vendorId })
            .andWhere("item.createdAt BETWEEN :startDate AND :endDate", {
            startDate: todayStart,
            endDate: todayEnd,
        })
            .getRawOne();
        const newCustomers = await this.getNewCustomersCount(vendorId, todayStart, todayEnd);
        return {
            summary: {
                totalOrders,
                totalRevenue,
                avgOrderValue,
                conversionRate: 3.2,
                pendingOrders,
                vsLastPeriod: {
                    orders: `${Number(orderChange) > 0 ? "+" : ""}${orderChange}%`,
                    revenue: `${Number(revenueChange) > 0 ? "+" : ""}${revenueChange}%`,
                    avgOrder: `${Number(avgOrderChange) > 0 ? "+" : ""}${avgOrderChange}%`,
                },
            },
            today: {
                orders: parseInt(todayStats?.orders || "0"),
                revenue: parseFloat(todayStats?.revenue || "0"),
                newCustomers,
            },
            performance: {
                vsLastWeek: "+15%",
                vsLastMonth: "+28%",
            },
        };
    }
    async getSalesTrends(vendorId, period, dateRange) {
        const { startDate, endDate } = dateRange;
        const { interval, dateFormat } = this.getPeriodConfig(period);
        const salesData = await this.orderItemRepository
            .createQueryBuilder("item")
            .select(`TO_CHAR(DATE_TRUNC('${interval}', item.created_at), '${dateFormat}')`, "date")
            .addSelect("SUM(item.total_price)", "sales")
            .addSelect("COUNT(DISTINCT item.order_id)", "orders")
            .where("item.vendor_id = :vendorId", { vendorId })
            .andWhere("item.created_at BETWEEN :startDate AND :endDate", {
            startDate,
            endDate,
        })
            .groupBy(`DATE_TRUNC('${interval}', item.created_at)`)
            .orderBy(`DATE_TRUNC('${interval}', item.created_at)`, "ASC")
            .getRawMany();
        const formattedData = salesData.map((item) => ({
            date: item.date,
            sales: parseFloat(item.sales || "0"),
            orders: parseInt(item.orders || "0"),
        }));
        const totalSales = formattedData.reduce((sum, item) => sum + item.sales, 0);
        const totalOrders = formattedData.reduce((sum, item) => sum + item.orders, 0);
        const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
        return {
            period,
            year: new Date().getFullYear(),
            data: formattedData,
            summary: {
                totalSales,
                totalOrders,
                averageOrderValue,
            },
        };
    }
    getPeriodConfig(period) {
        const configs = {
            today: { interval: "hour", dateFormat: "HH24" },
            week: { interval: "day", dateFormat: "Dy" },
            month: { interval: "day", dateFormat: "DD" },
            custom: { interval: "day", dateFormat: "Mon DD" },
            year: { interval: "month", dateFormat: "Mon" },
            quarter: { interval: "quarter", dateFormat: '"Q"Q YYYY' },
        };
        return configs[period] || { interval: "day", dateFormat: "Mon DD" };
    }
    async getProductPerformance(vendorId, dateRange) {
        const { startDate, endDate } = dateRange;
        const topProducts = await this.orderItemRepository
            .createQueryBuilder("item")
            .innerJoin("item.order", "order")
            .select("item.productId", "id")
            .addSelect("item.productName", "name")
            .addSelect("SUM(item.totalPrice)", "sales")
            .addSelect("SUM(item.quantity)", "orders")
            .where("item.vendorId = :vendorId", { vendorId })
            .andWhere("order.createdAt BETWEEN :startDate AND :endDate", {
            startDate,
            endDate,
        })
            .andWhere("order.orderStatus != :cancelled", { cancelled: "cancelled" })
            .groupBy("item.productId, item.productName")
            .orderBy("sales", "DESC")
            .limit(10)
            .getRawMany();
        const productIds = topProducts.map((p) => p.id);
        const products = await this.productRepository.find({
            where: { id: (0, typeorm_1.In)(productIds) },
            select: ["id", "stockQuantity", "rating", "images"],
        });
        const enhancedProducts = topProducts.map((item) => {
            const product = products.find((p) => p.id === item.id);
            return {
                id: item.id,
                name: item.name,
                sales: parseFloat(item.sales || "0"),
                orders: parseInt(item.orders || "0"),
                stock: product?.stockQuantity || 0,
                rating: product?.rating || 0,
                images: product?.images || [],
            };
        });
        const lowStockProducts = await this.productRepository.find({
            where: {
                vendorId,
                stockQuantity: (0, typeorm_1.LessThanOrEqual)(10),
                isActive: true,
            },
            select: ["id", "name", "stockQuantity", "rating", "images"],
            take: 5,
        });
        const lowStock = lowStockProducts.map((product) => ({
            id: product.id,
            name: product.name,
            sales: 0,
            orders: 0,
            stock: product.stockQuantity,
            rating: product.rating || 0,
            images: product.images || [],
        }));
        const categories = await this.getCategoryPerformance(vendorId, dateRange);
        return {
            topProducts: enhancedProducts,
            lowStock,
            categories,
        };
    }
    async getOrderAnalytics(vendorId, dateRange) {
        const { startDate, endDate } = dateRange;
        const statusDistribution = await this.orderItemRepository
            .createQueryBuilder("item")
            .innerJoin("item.order", "order")
            .select("order.orderStatus", "status")
            .addSelect("COUNT(DISTINCT item.orderId)", "count")
            .where("item.vendorId = :vendorId", { vendorId })
            .andWhere("order.createdAt BETWEEN :startDate AND :endDate", {
            startDate,
            endDate,
        })
            .groupBy("order.orderStatus")
            .getRawMany();
        const totalOrders = statusDistribution.reduce((sum, item) => sum + parseInt(item.count), 0);
        const statusColors = {
            pending: "#FFA726",
            confirmed: "#29B6F6",
            processing: "#AB47BC",
            dispatched: "#7E57C2",
            out_for_delivery: "#5C6BC0",
            ready_for_pickup: "#5C6BC0",
            delivered: "#66BB6A",
            refunded: "#7E57C2",
            returned: "#EF5350",
            cancelled: "#EF5350",
        };
        const distribution = statusDistribution.map((item) => ({
            status: item.status,
            count: parseInt(item.count),
            percentage: totalOrders > 0
                ? Math.round((parseInt(item.count) / totalOrders) * 100)
                : 0,
            color: statusColors[item.status] || "#9E9E9E",
        }));
        const fulfillmentMetrics = await this.calculateFulfillmentMetrics(vendorId, dateRange);
        const recentOrders = await this.orderItemRepository
            .createQueryBuilder("item")
            .innerJoin("item.order", "order")
            .innerJoin("order.customer", "customer")
            .select([
            "order.id",
            "order.orderNumber",
            "order.totalAmount",
            "order.orderStatus",
            "order.createdAt",
            "customer.fullName",
        ])
            .where("item.vendorId = :vendorId", { vendorId })
            .andWhere("order.createdAt BETWEEN :startDate AND :endDate", {
            startDate,
            endDate,
        })
            .orderBy("order.createdAt", "DESC")
            .limit(10)
            .getRawMany();
        const formattedOrders = recentOrders.map((order) => ({
            id: order.order_id,
            orderNumber: order.order_orderNumber,
            customerName: order.customer_fullName || "Unknown",
            amount: parseFloat(order.order_totalAmount),
            status: order.order_orderStatus,
            date: (0, date_fns_1.format)(new Date(order.order_createdAt), "MMM dd, yyyy"),
        }));
        return {
            statusDistribution: distribution,
            fulfillmentMetrics,
            recentOrders: formattedOrders,
        };
    }
    async getCustomerAnalytics(vendorId, dateRange) {
        const { startDate, endDate } = dateRange;
        const customerOrders = await this.orderItemRepository
            .createQueryBuilder("item")
            .innerJoin("item.order", "order")
            .innerJoin("order.customer", "customer")
            .select("customer.id", "customerId")
            .addSelect("customer.fullName", "name")
            .addSelect("COUNT(DISTINCT item.orderId)", "orderCount")
            .addSelect("SUM(item.totalPrice)", "totalSpent")
            .addSelect("MAX(order.createdAt)", "lastOrder")
            .where("item.vendorId = :vendorId", { vendorId })
            .andWhere("order.createdAt BETWEEN :startDate AND :endDate", {
            startDate,
            endDate,
        })
            .andWhere("order.orderStatus != :cancelled", { cancelled: "cancelled" })
            .groupBy("customer.id, customer.fullName")
            .getRawMany();
        const totalCustomers = customerOrders.length;
        const newCustomers = customerOrders.filter((c) => {
            const orderCount = parseInt(c.orderCount);
            return orderCount === 1;
        }).length;
        const returningCustomers = customerOrders.filter((c) => {
            const orderCount = parseInt(c.orderCount);
            return orderCount > 1 && orderCount <= 5;
        }).length;
        const loyalCustomers = customerOrders.filter((c) => {
            const orderCount = parseInt(c.orderCount);
            return orderCount > 5;
        }).length;
        const segments = [
            {
                segment: "New Customers",
                count: newCustomers,
                percentage: totalCustomers > 0
                    ? Math.round((newCustomers / totalCustomers) * 100)
                    : 0,
            },
            {
                segment: "Returning Customers",
                count: returningCustomers,
                percentage: totalCustomers > 0
                    ? Math.round((returningCustomers / totalCustomers) * 100)
                    : 0,
            },
            {
                segment: "Loyal Customers",
                count: loyalCustomers,
                percentage: totalCustomers > 0
                    ? Math.round((loyalCustomers / totalCustomers) * 100)
                    : 0,
            },
        ];
        const topCustomers = customerOrders
            .sort((a, b) => parseFloat(b.totalSpent || "0") - parseFloat(a.totalSpent || "0"))
            .slice(0, 10)
            .map((customer) => ({
            id: customer.customerId,
            name: customer.name || "Unknown",
            totalSpent: parseFloat(customer.totalSpent || "0"),
            orders: parseInt(customer.orderCount || "0"),
            lastOrder: customer.lastOrder
                ? (0, date_fns_1.format)(new Date(customer.lastOrder), "MMM dd, yyyy")
                : "Never",
        }));
        const demographics = await this.getCustomerDemographics(vendorId, dateRange);
        return {
            customerSegments: segments,
            topCustomers,
            demographics,
        };
    }
    async getRegionalAnalytics(vendorId, dateRange) {
        const { startDate, endDate } = dateRange;
        const vendor = await this.vendorRepository.findOne({
            where: { id: vendorId },
            select: ["state", "city"],
        });
        const vendorState = vendor?.state || "Unknown";
        const regionalSales = await this.orderItemRepository
            .createQueryBuilder("item")
            .innerJoin("item.order", "order")
            .innerJoin("order.customer", "customer")
            .select("customer.state", "state")
            .addSelect("SUM(item.totalPrice)", "sales")
            .addSelect("COUNT(DISTINCT item.orderId)", "orders")
            .addSelect("COUNT(DISTINCT customer.id)", "customers")
            .where("item.vendorId = :vendorId", { vendorId })
            .andWhere("order.createdAt BETWEEN :startDate AND :endDate", {
            startDate,
            endDate,
        })
            .andWhere("order.orderStatus != :cancelled", { cancelled: "cancelled" })
            .groupBy("customer.state")
            .orderBy("sales", "DESC")
            .getRawMany();
        const akwaIbomData = regionalSales.find((r) => r.state === "Akwa Ibom") || {
            sales: "0",
            orders: "0",
            customers: "0",
        };
        const akwaIbomSales = parseFloat(akwaIbomData.sales || "0");
        const akwaIbomOrders = parseInt(akwaIbomData.orders || "0");
        const akwaIbomCustomers = parseInt(akwaIbomData.customers || "0");
        const akwaIbomAvgOrder = akwaIbomOrders > 0 ? akwaIbomSales / akwaIbomOrders : 0;
        const topCities = await this.getTopCities(vendorId, dateRange, "Akwa Ibom");
        const popularProducts = await this.getPopularProductsByRegion(vendorId, dateRange, "Akwa Ibom");
        const regionalStats = regionalSales.map((region) => {
            const sales = parseFloat(region.sales || "0");
            const orders = parseInt(region.orders || "0");
            const customers = parseInt(region.customers || "0");
            const growth = region.state === vendorState ? "+12%" : "+5%";
            return {
                region: region.state || "Unknown",
                sales,
                customers,
                growth,
            };
        });
        return {
            akwaIbomStats: {
                totalSales: akwaIbomSales,
                orders: akwaIbomOrders,
                customers: akwaIbomCustomers,
                avgOrderValue: akwaIbomAvgOrder,
            },
            topCities,
            popularProducts,
            regionalStats,
        };
    }
    async getRealTimeAnalytics(vendorId) {
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
        const currentOrders = await this.orderItemRepository.count({
            where: {
                vendorId,
                vendorStatus: (0, typeorm_1.In)(["pending", "accepted", "preparing"]),
                createdAt: (0, typeorm_1.Between)(todayStart, todayEnd),
            },
        });
        const todayRevenue = await this.orderItemRepository
            .createQueryBuilder("item")
            .select("SUM(item.totalPrice)", "revenue")
            .where("item.vendorId = :vendorId", { vendorId })
            .andWhere("item.createdAt BETWEEN :startDate AND :endDate", {
            startDate: todayStart,
            endDate: todayEnd,
        })
            .getRawOne();
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
        const recentOrders = await this.orderItemRepository.find({
            where: {
                vendorId,
                createdAt: (0, typeorm_1.MoreThanOrEqual)(twoHoursAgo),
            },
            relations: ["order"],
            order: { createdAt: "DESC" },
            take: 5,
        });
        const recentActivity = recentOrders.map((order) => ({
            type: "order",
            message: `New order #${order.order.orderNumber}`,
            time: this.getTimeAgo(order.createdAt),
            amount: order.totalPrice,
        }));
        recentActivity.push({
            type: "review",
            message: "New 5-star review on Product A",
            time: "15 minutes ago",
        }, {
            type: "stock",
            message: "Low stock alert: Product C (5 left)",
            time: "30 minutes ago",
        });
        return {
            liveStats: {
                currentOrders,
                todayRevenue: parseFloat(todayRevenue?.revenue || "0"),
                pendingMessages: 3,
            },
            recentActivity,
        };
    }
    async getNewCustomersCount(vendorId, startDate, endDate) {
        const newCustomers = await this.orderItemRepository
            .createQueryBuilder("item")
            .innerJoin("item.order", "order")
            .innerJoin("order.customer", "customer")
            .select("customer.id", "customerId")
            .addSelect("COUNT(DISTINCT item.orderId)", "orderCount")
            .where("item.vendorId = :vendorId", { vendorId })
            .andWhere("order.createdAt BETWEEN :startDate AND :endDate", {
            startDate,
            endDate,
        })
            .groupBy("customer.id")
            .having("COUNT(DISTINCT item.orderId) = 1")
            .getRawMany();
        return newCustomers.length;
    }
    async getCategoryPerformance(vendorId, dateRange) {
        return [
            { category: "Men's Fashion", sales: 450000, products: 24 },
            { category: "Women's Fashion", sales: 380000, products: 32 },
            { category: "Accessories", sales: 120000, products: 15 },
        ];
    }
    async calculateFulfillmentMetrics(vendorId, dateRange) {
        return {
            avgProcessingTime: "2.5h",
            avgDeliveryTime: "1.2d",
            onTimeRate: 94,
        };
    }
    async getCustomerDemographics(vendorId, dateRange) {
        const { startDate, endDate } = dateRange;
        const states = await this.orderItemRepository
            .createQueryBuilder("item")
            .innerJoin("item.order", "order")
            .innerJoin("order.customer", "customer")
            .select("customer.state", "state")
            .addSelect("COUNT(DISTINCT customer.id)", "customers")
            .addSelect("SUM(item.totalPrice)", "revenue")
            .where("item.vendorId = :vendorId", { vendorId })
            .andWhere("order.createdAt BETWEEN :startDate AND :endDate", {
            startDate,
            endDate,
        })
            .andWhere("customer.state IS NOT NULL")
            .groupBy("customer.state")
            .orderBy("revenue", "DESC")
            .getRawMany();
        const cities = await this.orderItemRepository
            .createQueryBuilder("item")
            .innerJoin("item.order", "order")
            .innerJoin("order.customer", "customer")
            .select("customer.city", "city")
            .addSelect("COUNT(DISTINCT customer.id)", "customers")
            .addSelect("SUM(item.totalPrice)", "revenue")
            .where("item.vendorId = :vendorId", { vendorId })
            .andWhere("order.createdAt BETWEEN :startDate AND :endDate", {
            startDate,
            endDate,
        })
            .andWhere("customer.city IS NOT NULL")
            .groupBy("customer.city")
            .orderBy("revenue", "DESC")
            .limit(10)
            .getRawMany();
        return {
            states: states.map((s) => ({
                state: s.state,
                customers: parseInt(s.customers || "0"),
                revenue: parseFloat(s.revenue || "0"),
            })),
            cities: cities.map((c) => ({
                city: c.city,
                customers: parseInt(c.customers || "0"),
                revenue: parseFloat(c.revenue || "0"),
            })),
        };
    }
    async getTopCities(vendorId, dateRange, state) {
        const { startDate, endDate } = dateRange;
        const cities = await this.orderItemRepository
            .createQueryBuilder("item")
            .innerJoin("item.order", "order")
            .innerJoin("order.customer", "customer")
            .select("customer.city", "city")
            .addSelect("SUM(item.totalPrice)", "sales")
            .where("item.vendorId = :vendorId", { vendorId })
            .andWhere("customer.state = :state", { state })
            .andWhere("order.createdAt BETWEEN :startDate AND :endDate", {
            startDate,
            endDate,
        })
            .andWhere("customer.city IS NOT NULL")
            .groupBy("customer.city")
            .orderBy("sales", "DESC")
            .limit(5)
            .getRawMany();
        return cities.map((c) => ({
            city: c.city,
            sales: parseFloat(c.sales || "0"),
        }));
    }
    async getPopularProductsByRegion(vendorId, dateRange, state) {
        const { startDate, endDate } = dateRange;
        const products = await this.orderItemRepository
            .createQueryBuilder("item")
            .innerJoin("item.order", "order")
            .innerJoin("order.customer", "customer")
            .select("item.productName", "name")
            .addSelect("SUM(item.totalPrice)", "sales")
            .where("item.vendorId = :vendorId", { vendorId })
            .andWhere("customer.state = :state", { state })
            .andWhere("order.createdAt BETWEEN :startDate AND :endDate", {
            startDate,
            endDate,
        })
            .groupBy("item.productName")
            .orderBy("sales", "DESC")
            .limit(5)
            .getRawMany();
        return products.map((p) => ({
            name: p.name,
            sales: parseFloat(p.sales || "0"),
        }));
    }
    getTimeAgo(date) {
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
        if (diffInMinutes < 1)
            return "Just now";
        if (diffInMinutes < 60)
            return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440)
            return `${Math.floor(diffInMinutes / 60)}h ago`;
        return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
}
exports.AnalyticsService = AnalyticsService;
exports.default = new AnalyticsService();
//# sourceMappingURL=analyticsService.js.map