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
exports.VendorProfile = void 0;
const typeorm_1 = require("typeorm");
const Vendor_1 = require("./Vendor");
let VendorProfile = class VendorProfile {
};
exports.VendorProfile = VendorProfile;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'vendor_id', unique: true }),
    __metadata("design:type", String)
], VendorProfile.prototype, "vendorId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'business_name' }),
    __metadata("design:type", String)
], VendorProfile.prototype, "businessName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', name: 'business_description', nullable: true }),
    __metadata("design:type", String)
], VendorProfile.prototype, "businessDescription", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'avatar_url', type: 'text', nullable: true }),
    __metadata("design:type", String)
], VendorProfile.prototype, "profileImage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', name: 'business_address', nullable: true }),
    __metadata("design:type", String)
], VendorProfile.prototype, "businessAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'business_phone', nullable: true }),
    __metadata("design:type", String)
], VendorProfile.prototype, "businessPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bank_account_name', nullable: true }),
    __metadata("design:type", String)
], VendorProfile.prototype, "bankAccountName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bank_account_number', nullable: true }),
    __metadata("design:type", String)
], VendorProfile.prototype, "bankAccountNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bank_name', nullable: true }),
    __metadata("design:type", String)
], VendorProfile.prototype, "bankName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bank_code', nullable: true }),
    __metadata("design:type", String)
], VendorProfile.prototype, "bankCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, name: 'total_sales', default: 0 }),
    __metadata("design:type", Number)
], VendorProfile.prototype, "totalSales", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 3, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], VendorProfile.prototype, "rating", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_approved', default: false }),
    __metadata("design:type", Boolean)
], VendorProfile.prototype, "isApproved", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], VendorProfile.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], VendorProfile.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Vendor_1.Vendor, vendor => vendor.vendorProfile),
    (0, typeorm_1.JoinColumn)({ name: 'vendor_id' }),
    __metadata("design:type", Vendor_1.Vendor)
], VendorProfile.prototype, "vendor", void 0);
exports.VendorProfile = VendorProfile = __decorate([
    (0, typeorm_1.Entity)('vendor_profiles')
], VendorProfile);
//# sourceMappingURL=VendorProfile.js.map