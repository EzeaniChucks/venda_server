"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const data_source_1 = require("../../config/data-source");
const entities_1 = require("../../entities");
const VendorProfile_1 = require("../../entities/VendorProfile");
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
class AuthService {
    constructor() {
        this.customerRepository = data_source_1.AppDataSource.getRepository(entities_1.Customer);
        this.vendorRepository = data_source_1.AppDataSource.getRepository(entities_1.Vendor);
        this.riderRepository = data_source_1.AppDataSource.getRepository(entities_1.Rider);
        this.adminRepository = data_source_1.AppDataSource.getRepository(entities_1.Admin);
        this.vendorProfileRepository = data_source_1.AppDataSource.getRepository(VendorProfile_1.VendorProfile);
        this.riderDocumentRepository = data_source_1.AppDataSource.getRepository(entities_1.RiderDocument);
    }
    async register(data) {
        const role = data.role || "customer";
        await this.checkEmailExists(data.email);
        const hashedPassword = await bcrypt_1.default.hash(data.password, 10);
        let user;
        switch (role) {
            case "customer":
                const customer = this.customerRepository.create({
                    email: data.email,
                    password: hashedPassword,
                    fullName: data.fullName || "Customer",
                    phone: data.phone,
                });
                await this.customerRepository.save(customer);
                user = { ...customer, role: "customer" };
                break;
            case "vendor":
                const vendor = this.vendorRepository.create({
                    email: data.email,
                    password: hashedPassword,
                    businessName: data.businessName || data.fullName || "Vendor Business",
                    phone: data.phone,
                });
                await this.vendorRepository.save(vendor);
                if (data.businessName) {
                    const vendorProfile = this.vendorProfileRepository.create({
                        vendorId: vendor.id,
                        businessName: data.businessName,
                    });
                    await this.vendorProfileRepository.save(vendorProfile);
                }
                user = { ...vendor, role: "vendor" };
                break;
            case "rider":
                const rider = this.riderRepository.create({
                    email: data.email,
                    password: hashedPassword,
                    fullName: data.fullName || "Rider",
                    phone: data.phone,
                });
                await this.riderRepository.save(rider);
                const riderDocument = this.riderDocumentRepository.create({
                    riderId: rider.id,
                    vehicleType: data.vehicleType,
                    vehicleRegistration: data.vehicleNumber,
                    status: "pending",
                    totalDeliveries: 0,
                    rating: 0,
                });
                await this.riderDocumentRepository.save(riderDocument);
                user = { ...rider, role: "rider" };
                break;
            case "admin":
                const admin = this.adminRepository.create({
                    email: data.email,
                    password: hashedPassword,
                    fullName: data.fullName || "Admin",
                    phone: data.phone,
                });
                await this.adminRepository.save(admin);
                user = { ...admin, role: "admin" };
                break;
            default:
                throw new Error("Invalid role");
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "30d" });
        return { user, token };
    }
    async login(email, password) {
        const result = await this.findUserByEmail(email);
        if (!result) {
            throw new Error("Invalid email or password");
        }
        const { user, role } = result;
        const isValidPassword = await bcrypt_1.default.compare(password, user.password);
        if (!isValidPassword) {
            throw new Error("Invalid email or password");
        }
        if (!user.isActive) {
            throw new Error("Account is deactivated. Please contact support.");
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role }, JWT_SECRET, { expiresIn: "30d" });
        return { user: { ...user, role }, token };
    }
    async getById(userId, role) {
        switch (role) {
            case "customer":
                return await this.customerRepository.findOne({ where: { id: userId } });
            case "vendor":
                return await this.vendorRepository.findOne({ where: { id: userId } });
            case "rider":
                return await this.riderRepository.findOne({ where: { id: userId } });
            case "admin":
                return await this.adminRepository.findOne({ where: { id: userId } });
            default:
                return null;
        }
    }
    async updateProfile(userId, role, data) {
        let user = null;
        switch (role) {
            case "customer":
                user = await this.customerRepository.findOne({ where: { id: userId } });
                if (!user)
                    throw new Error("User not found");
                if (data.fullName)
                    user.fullName = data.fullName;
                if (data.phone)
                    user.phone = data.phone;
                if (data.profileImage)
                    user.profileImage = data.profileImage;
                await this.customerRepository.save(user);
                break;
            case "vendor":
                user = await this.vendorRepository.findOne({
                    where: { id: userId },
                    relations: ["vendorProfile"],
                });
                if (!user)
                    throw new Error("Vendor not found");
                const vendor = user;
                if (!vendor.vendorProfile)
                    throw new Error("Vendor Profile not found");
                if (data.businessName)
                    vendor.businessName = data.businessName;
                if (data.phone)
                    vendor.phone = data.phone;
                if (data.profileImage)
                    vendor.vendorProfile.profileImage = data.profileImage;
                if (data.state)
                    vendor.state = data.state;
                if (data.city)
                    vendor.city = data.city;
                if (data.address)
                    vendor.address = data.address;
                await this.vendorRepository.save(vendor);
                if (vendor.vendorProfile) {
                    const vendorProfile = vendor.vendorProfile;
                    if (data.businessDescription !== undefined) {
                        vendorProfile.businessDescription = data.businessDescription;
                    }
                    if (data.businessAddress !== undefined) {
                        vendorProfile.businessAddress = data.businessAddress;
                    }
                    if (data.businessPhone !== undefined) {
                        vendorProfile.businessPhone = data.businessPhone;
                    }
                    if (data.bankAccountName !== undefined) {
                        vendorProfile.bankAccountName = data.bankAccountName;
                    }
                    if (data.bankAccountNumber !== undefined) {
                        vendorProfile.bankAccountNumber = data.bankAccountNumber;
                    }
                    if (data.bankName !== undefined) {
                        vendorProfile.bankName = data.bankName;
                    }
                    if (data.bankCode !== undefined) {
                        vendorProfile.bankCode = data.bankCode;
                    }
                    await this.vendorProfileRepository.save(vendorProfile);
                }
                else {
                    const newProfile = this.vendorProfileRepository.create({
                        vendorId: userId,
                        businessName: data.businessName || vendor.businessName || "",
                        businessDescription: data.businessDescription || "",
                        businessAddress: data.businessAddress || "",
                        businessPhone: data.businessPhone || "",
                        bankAccountName: data.bankAccountName || "",
                        bankAccountNumber: data.bankAccountNumber || "",
                        bankName: data.bankName || "",
                        bankCode: data.bankCode || "",
                    });
                    await this.vendorProfileRepository.save(newProfile);
                    user = await this.vendorRepository.findOne({
                        where: { id: userId },
                        relations: ["vendorProfile"],
                    });
                }
                break;
            case "rider":
                user = await this.riderRepository.findOne({ where: { id: userId } });
                if (!user)
                    throw new Error("User not found");
                if (data.fullName)
                    user.fullName = data.fullName;
                if (data.phone)
                    user.phone = data.phone;
                if (data.profileImage)
                    user.profileImage = data.profileImage;
                await this.riderRepository.save(user);
                break;
            case "admin":
                user = await this.adminRepository.findOne({ where: { id: userId } });
                if (!user)
                    throw new Error("User not found");
                if (data.fullName)
                    user.fullName = data.fullName;
                if (data.phone)
                    user.phone = data.phone;
                if (data.profileImage)
                    user.profileImage = data.profileImage;
                await this.adminRepository.save(user);
                break;
            default:
                throw new Error("Invalid role");
        }
        if (role === "vendor" && user) {
            user = await this.vendorRepository.findOne({
                where: { id: userId },
                relations: ["vendorProfile"],
            });
        }
        return user;
    }
    async checkEmailExists(email) {
        const [customer, vendor, rider, admin] = await Promise.all([
            this.customerRepository.findOne({ where: { email } }),
            this.vendorRepository.findOne({ where: { email } }),
            this.riderRepository.findOne({ where: { email } }),
            this.adminRepository.findOne({ where: { email } }),
        ]);
        if (customer || vendor || rider || admin) {
            throw new Error("User already exists with this email");
        }
    }
    async findUserByEmail(email) {
        const customer = await this.customerRepository.findOne({
            where: { email },
        });
        if (customer)
            return { user: customer, role: "customer" };
        const vendor = await this.vendorRepository.findOne({ where: { email } });
        if (vendor)
            return { user: vendor, role: "vendor" };
        const rider = await this.riderRepository.findOne({ where: { email } });
        if (rider)
            return { user: rider, role: "rider" };
        const admin = await this.adminRepository.findOne({ where: { email } });
        if (admin)
            return { user: admin, role: "admin" };
        return null;
    }
}
exports.AuthService = AuthService;
exports.default = new AuthService();
//# sourceMappingURL=authService.service.js.map