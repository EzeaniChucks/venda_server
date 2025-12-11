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
exports.VendorSubscription = exports.SubscriptionStatus = exports.SubscriptionTier = void 0;
const typeorm_1 = require("typeorm");
const Vendor_1 = require("./Vendor");
const SubscriptionPlan_1 = require("./SubscriptionPlan");
var SubscriptionTier;
(function (SubscriptionTier) {
    SubscriptionTier["FREE"] = "free";
    SubscriptionTier["STARTER"] = "starter";
    SubscriptionTier["PRO"] = "pro";
    SubscriptionTier["ELITE"] = "elite";
})(SubscriptionTier || (exports.SubscriptionTier = SubscriptionTier = {}));
var SubscriptionStatus;
(function (SubscriptionStatus) {
    SubscriptionStatus["ACTIVE"] = "active";
    SubscriptionStatus["EXPIRED"] = "expired";
    SubscriptionStatus["CANCELLED"] = "cancelled";
    SubscriptionStatus["PENDING"] = "pending";
    SubscriptionStatus["PAST_DUE"] = "past_due";
    SubscriptionStatus["GRACE_PERIOD"] = "grace_period";
})(SubscriptionStatus || (exports.SubscriptionStatus = SubscriptionStatus = {}));
let VendorSubscription = class VendorSubscription {
};
exports.VendorSubscription = VendorSubscription;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], VendorSubscription.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vendor_id' }),
    __metadata("design:type", String)
], VendorSubscription.prototype, "vendorId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'plan_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], VendorSubscription.prototype, "planId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', default: 'free' }),
    __metadata("design:type", String)
], VendorSubscription.prototype, "tier", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', default: 'active' }),
    __metadata("design:type", String)
], VendorSubscription.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], VendorSubscription.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', name: 'item_limit', default: 10 }),
    __metadata("design:type", Number)
], VendorSubscription.prototype, "itemLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'has_promo_feature', default: false }),
    __metadata("design:type", Boolean)
], VendorSubscription.prototype, "hasPromoFeature", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'has_homepage_visibility', default: false }),
    __metadata("design:type", Boolean)
], VendorSubscription.prototype, "hasHomepageVisibility", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'start_date', type: 'timestamp' }),
    __metadata("design:type", Date)
], VendorSubscription.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'end_date', type: 'timestamp' }),
    __metadata("design:type", Date)
], VendorSubscription.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'auto_renew', default: true }),
    __metadata("design:type", Boolean)
], VendorSubscription.prototype, "autoRenew", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', name: 'payment_reference', nullable: true }),
    __metadata("design:type", String)
], VendorSubscription.prototype, "paymentReference", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', name: 'paystack_authorization_code', nullable: true }),
    __metadata("design:type", String)
], VendorSubscription.prototype, "paystackAuthorizationCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', name: 'paystack_customer_code', nullable: true }),
    __metadata("design:type", String)
], VendorSubscription.prototype, "paystackCustomerCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', name: 'paystack_email', nullable: true }),
    __metadata("design:type", String)
], VendorSubscription.prototype, "paystackEmail", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', name: 'failed_payment_attempts', default: 0 }),
    __metadata("design:type", Number)
], VendorSubscription.prototype, "failedPaymentAttempts", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', name: 'last_payment_attempt', nullable: true }),
    __metadata("design:type", Date)
], VendorSubscription.prototype, "lastPaymentAttempt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', name: 'next_retry_date', nullable: true }),
    __metadata("design:type", Date)
], VendorSubscription.prototype, "nextRetryDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', name: 'cancelled_at', nullable: true }),
    __metadata("design:type", Date)
], VendorSubscription.prototype, "cancelledAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], VendorSubscription.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], VendorSubscription.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Vendor_1.Vendor),
    (0, typeorm_1.JoinColumn)({ name: 'vendor_id' }),
    __metadata("design:type", Vendor_1.Vendor)
], VendorSubscription.prototype, "vendor", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => SubscriptionPlan_1.SubscriptionPlan, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'plan_id' }),
    __metadata("design:type", SubscriptionPlan_1.SubscriptionPlan)
], VendorSubscription.prototype, "plan", void 0);
exports.VendorSubscription = VendorSubscription = __decorate([
    (0, typeorm_1.Entity)('vendor_subscriptions')
], VendorSubscription);
//# sourceMappingURL=VendorSubscription.js.map