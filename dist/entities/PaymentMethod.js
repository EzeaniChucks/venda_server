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
exports.PaymentMethod = void 0;
const typeorm_1 = require("typeorm");
const Customer_1 = require("./Customer");
let PaymentMethod = class PaymentMethod {
};
exports.PaymentMethod = PaymentMethod;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PaymentMethod.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'customer_id' }),
    __metadata("design:type", String)
], PaymentMethod.prototype, "customerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'authorization_code' }),
    __metadata("design:type", String)
], PaymentMethod.prototype, "authorizationCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'card_type' }),
    __metadata("design:type", String)
], PaymentMethod.prototype, "cardType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last4' }),
    __metadata("design:type", String)
], PaymentMethod.prototype, "last4", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'exp_month' }),
    __metadata("design:type", String)
], PaymentMethod.prototype, "expMonth", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'exp_year' }),
    __metadata("design:type", String)
], PaymentMethod.prototype, "expYear", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PaymentMethod.prototype, "bank", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'country_code' }),
    __metadata("design:type", String)
], PaymentMethod.prototype, "countryCode", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PaymentMethod.prototype, "brand", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_default', default: false }),
    __metadata("design:type", Boolean)
], PaymentMethod.prototype, "isDefault", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], PaymentMethod.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], PaymentMethod.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], PaymentMethod.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Customer_1.Customer),
    (0, typeorm_1.JoinColumn)({ name: 'customer_id' }),
    __metadata("design:type", Customer_1.Customer)
], PaymentMethod.prototype, "customer", void 0);
exports.PaymentMethod = PaymentMethod = __decorate([
    (0, typeorm_1.Entity)('payment_methods')
], PaymentMethod);
//# sourceMappingURL=PaymentMethod.js.map