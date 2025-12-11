"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Vendor = void 0;
const typeorm_1 = require("typeorm");
const Product_1 = require("./Product");
const VendorProfile_1 = require("./VendorProfile");
const Transaction_1 = require("./Transaction");
let Vendor = class Vendor {
};
exports.Vendor = Vendor;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], Vendor.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Vendor.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "password_hash" }),
    __metadata("design:type", String)
], Vendor.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "business_name" }),
    __metadata("design:type", String)
], Vendor.prototype, "businessName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "fcm_token", type: "text", nullable: true }),
    __metadata("design:type", Object)
], Vendor.prototype, "fcmToken", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "device_os",
        type: "enum",
        enum: ["ANDROID", "IOS", "WEB"],
        nullable: true,
    }),
    __metadata("design:type", String)
], Vendor.prototype, "deviceOs", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "fcm_token_updated_at",
        type: "timestamp",
        nullable: true,
    }),
    __metadata("design:type", Date)
], Vendor.prototype, "fcmTokenUpdatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "jsonb",
        default: { balance: 0, pendingBalance: 0 },
    }),
    __metadata("design:type", Object)
], Vendor.prototype, "wallet", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "is_approved", default: false }),
    __metadata("design:type", Boolean)
], Vendor.prototype, "isApproved", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "is_active", default: true }),
    __metadata("design:type", Boolean)
], Vendor.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "is_verified", default: false }),
    __metadata("design:type", Boolean)
], Vendor.prototype, "isVerified", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "subscription_tier", type: "varchar", nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "subscriptionTier", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "subscription_expires", type: "timestamp", nullable: true }),
    __metadata("design:type", Date)
], Vendor.prototype, "subscriptionExpires", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "is_verified_akwa_ibom", default: false }),
    __metadata("design:type", Boolean)
], Vendor.prototype, "isVerifiedAkwaIbom", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "vendor_of_month_count", type: "integer", default: 0 }),
    __metadata("design:type", Number)
], Vendor.prototype, "vendorOfMonthCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 7, nullable: true }),
    __metadata("design:type", Number)
], Vendor.prototype, "latitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 7, nullable: true }),
    __metadata("design:type", Number)
], Vendor.prototype, "longitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], Vendor.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], Vendor.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Product_1.Product, (product) => product.vendor),
    __metadata("design:type", Array)
], Vendor.prototype, "products", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => VendorProfile_1.VendorProfile, (profile) => profile.vendor),
    __metadata("design:type", VendorProfile_1.VendorProfile)
], Vendor.prototype, "vendorProfile", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Transaction_1.Transaction, (transaction) => transaction.vendor),
    __metadata("design:type", Array)
], Vendor.prototype, "transactions", void 0);
exports.Vendor = Vendor = __decorate([
    (0, typeorm_1.Entity)("vendors")
], Vendor);
//# sourceMappingURL=Vendor.js.map