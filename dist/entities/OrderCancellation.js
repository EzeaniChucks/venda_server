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
exports.OrderCancellation = void 0;
const typeorm_1 = require("typeorm");
const Order_1 = require("./Order");
const Vendor_1 = require("./Vendor");
const Customer_1 = require("./Customer");
const Rider_1 = require("./Rider");
let OrderCancellation = class OrderCancellation {
};
exports.OrderCancellation = OrderCancellation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], OrderCancellation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'order_id' }),
    __metadata("design:type", String)
], OrderCancellation.prototype, "orderId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Order_1.Order, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'order_id' }),
    __metadata("design:type", Order_1.Order)
], OrderCancellation.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true, name: 'vendor_id' }),
    __metadata("design:type", String)
], OrderCancellation.prototype, "vendorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Vendor_1.Vendor, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'vendor_id' }),
    __metadata("design:type", Vendor_1.Vendor)
], OrderCancellation.prototype, "vendor", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true, name: 'customer_id' }),
    __metadata("design:type", String)
], OrderCancellation.prototype, "customerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Customer_1.Customer, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'customer_id' }),
    __metadata("design:type", Customer_1.Customer)
], OrderCancellation.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true, name: 'rider_id' }),
    __metadata("design:type", String)
], OrderCancellation.prototype, "riderId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Rider_1.Rider, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'rider_id' }),
    __metadata("design:type", Rider_1.Rider)
], OrderCancellation.prototype, "rider", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], OrderCancellation.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cancelled_by' }),
    __metadata("design:type", String)
], OrderCancellation.prototype, "cancelledBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'refund_status', default: 'not_applicable' }),
    __metadata("design:type", String)
], OrderCancellation.prototype, "refundStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'refund_amount' }),
    __metadata("design:type", Number)
], OrderCancellation.prototype, "refundAmount", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'cancelled_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], OrderCancellation.prototype, "cancelledAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], OrderCancellation.prototype, "metadata", void 0);
exports.OrderCancellation = OrderCancellation = __decorate([
    (0, typeorm_1.Entity)('order_cancellations'),
    (0, typeorm_1.Index)(['cancelledBy', 'cancelledAt'])
], OrderCancellation);
//# sourceMappingURL=OrderCancellation.js.map