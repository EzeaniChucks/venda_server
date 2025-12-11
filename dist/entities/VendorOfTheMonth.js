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
exports.VendorOfTheMonth = void 0;
const typeorm_1 = require("typeorm");
const Vendor_1 = require("./Vendor");
let VendorOfTheMonth = class VendorOfTheMonth {
};
exports.VendorOfTheMonth = VendorOfTheMonth;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], VendorOfTheMonth.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vendor_id' }),
    __metadata("design:type", String)
], VendorOfTheMonth.prototype, "vendorId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer' }),
    __metadata("design:type", Number)
], VendorOfTheMonth.prototype, "month", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer' }),
    __metadata("design:type", Number)
], VendorOfTheMonth.prototype, "year", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], VendorOfTheMonth.prototype, "recognition_reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, name: 'total_sales' }),
    __metadata("design:type", Number)
], VendorOfTheMonth.prototype, "totalSales", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', name: 'total_orders' }),
    __metadata("design:type", Number)
], VendorOfTheMonth.prototype, "totalOrders", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], VendorOfTheMonth.prototype, "rating", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'certificate_url', nullable: true }),
    __metadata("design:type", String)
], VendorOfTheMonth.prototype, "certificateUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ad_credit_amount', type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], VendorOfTheMonth.prototype, "adCreditAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'featured_on_homepage', default: true }),
    __metadata("design:type", Boolean)
], VendorOfTheMonth.prototype, "featuredOnHomepage", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], VendorOfTheMonth.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Vendor_1.Vendor),
    (0, typeorm_1.JoinColumn)({ name: 'vendor_id' }),
    __metadata("design:type", Vendor_1.Vendor)
], VendorOfTheMonth.prototype, "vendor", void 0);
exports.VendorOfTheMonth = VendorOfTheMonth = __decorate([
    (0, typeorm_1.Entity)('vendor_of_the_month'),
    (0, typeorm_1.Unique)(['month', 'year'])
], VendorOfTheMonth);
//# sourceMappingURL=VendorOfTheMonth.js.map