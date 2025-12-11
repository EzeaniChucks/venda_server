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
exports.DeliveryPartner = void 0;
const typeorm_1 = require("typeorm");
let DeliveryPartner = class DeliveryPartner {
};
exports.DeliveryPartner = DeliveryPartner;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DeliveryPartner.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], DeliveryPartner.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], DeliveryPartner.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], DeliveryPartner.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], DeliveryPartner.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], DeliveryPartner.prototype, "serviceCities", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], DeliveryPartner.prototype, "serviceTypes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, name: 'base_rate' }),
    __metadata("design:type", Number)
], DeliveryPartner.prototype, "baseRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, name: 'per_km_rate', nullable: true }),
    __metadata("design:type", Number)
], DeliveryPartner.prototype, "perKmRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ['pending', 'active', 'inactive', 'suspended'], default: 'pending' }),
    __metadata("design:type", String)
], DeliveryPartner.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 3, scale: 2, nullable: true, default: 0 }),
    __metadata("design:type", Number)
], DeliveryPartner.prototype, "rating", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', name: 'total_deliveries', default: 0 }),
    __metadata("design:type", Number)
], DeliveryPartner.prototype, "totalDeliveries", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', name: 'successful_deliveries', default: 0 }),
    __metadata("design:type", Number)
], DeliveryPartner.prototype, "successfulDeliveries", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_trusted', default: false }),
    __metadata("design:type", Boolean)
], DeliveryPartner.prototype, "isTrusted", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', name: 'contact_person', nullable: true }),
    __metadata("design:type", String)
], DeliveryPartner.prototype, "contactPerson", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', name: 'business_registration', nullable: true }),
    __metadata("design:type", String)
], DeliveryPartner.prototype, "businessRegistration", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], DeliveryPartner.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], DeliveryPartner.prototype, "updatedAt", void 0);
exports.DeliveryPartner = DeliveryPartner = __decorate([
    (0, typeorm_1.Entity)('delivery_partners')
], DeliveryPartner);
//# sourceMappingURL=DeliveryPartner.js.map