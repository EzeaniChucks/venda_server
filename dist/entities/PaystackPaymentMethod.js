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
exports.PaystackPaymentMethod = void 0;
const typeorm_1 = require("typeorm");
let PaystackPaymentMethod = class PaystackPaymentMethod {
};
exports.PaystackPaymentMethod = PaystackPaymentMethod;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PaystackPaymentMethod.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'entity_type' }),
    __metadata("design:type", String)
], PaystackPaymentMethod.prototype, "entityType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'entity_id' }),
    __metadata("design:type", String)
], PaystackPaymentMethod.prototype, "entityId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'authorization_code' }),
    __metadata("design:type", String)
], PaystackPaymentMethod.prototype, "authorizationCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'card_type' }),
    __metadata("design:type", String)
], PaystackPaymentMethod.prototype, "cardType", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PaystackPaymentMethod.prototype, "channel", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PaystackPaymentMethod.prototype, "last4", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PaystackPaymentMethod.prototype, "bin", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'exp_month', nullable: true }),
    __metadata("design:type", String)
], PaystackPaymentMethod.prototype, "expMonth", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'exp_year', nullable: true }),
    __metadata("design:type", String)
], PaystackPaymentMethod.prototype, "expYear", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PaystackPaymentMethod.prototype, "bank", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'account_name', nullable: true }),
    __metadata("design:type", String)
], PaystackPaymentMethod.prototype, "accountName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PaystackPaymentMethod.prototype, "signature", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_default', default: false }),
    __metadata("design:type", Boolean)
], PaystackPaymentMethod.prototype, "isDefault", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], PaystackPaymentMethod.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], PaystackPaymentMethod.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], PaystackPaymentMethod.prototype, "updatedAt", void 0);
exports.PaystackPaymentMethod = PaystackPaymentMethod = __decorate([
    (0, typeorm_1.Entity)('paystack_payment_methods')
], PaystackPaymentMethod);
//# sourceMappingURL=PaystackPaymentMethod.js.map