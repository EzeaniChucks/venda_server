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
exports.OrderRejection = void 0;
const typeorm_1 = require("typeorm");
const Order_1 = require("./Order");
const OrderItem_1 = require("./OrderItem");
const Vendor_1 = require("./Vendor");
const Rider_1 = require("./Rider");
let OrderRejection = class OrderRejection {
};
exports.OrderRejection = OrderRejection;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], OrderRejection.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'order_id' }),
    __metadata("design:type", String)
], OrderRejection.prototype, "orderId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Order_1.Order, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'order_id' }),
    __metadata("design:type", Order_1.Order)
], OrderRejection.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true, name: 'order_item_id' }),
    __metadata("design:type", String)
], OrderRejection.prototype, "orderItemId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => OrderItem_1.OrderItem, { nullable: true, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'order_item_id' }),
    __metadata("design:type", OrderItem_1.OrderItem)
], OrderRejection.prototype, "orderItem", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true, name: 'rider_id' }),
    __metadata("design:type", String)
], OrderRejection.prototype, "riderId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Rider_1.Rider, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'rider_id' }),
    __metadata("design:type", Rider_1.Rider)
], OrderRejection.prototype, "rider", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true, name: 'vendor_id' }),
    __metadata("design:type", String)
], OrderRejection.prototype, "vendorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Vendor_1.Vendor, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'vendor_id' }),
    __metadata("design:type", Vendor_1.Vendor)
], OrderRejection.prototype, "vendor", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'rejection_type', default: 'delivery' }),
    __metadata("design:type", String)
], OrderRejection.prototype, "rejectionType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], OrderRejection.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'rejected_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], OrderRejection.prototype, "rejectedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true, name: 'reassigned_to' }),
    __metadata("design:type", String)
], OrderRejection.prototype, "reassignedTo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true, name: 'reassigned_at' }),
    __metadata("design:type", Date)
], OrderRejection.prototype, "reassignedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], OrderRejection.prototype, "metadata", void 0);
exports.OrderRejection = OrderRejection = __decorate([
    (0, typeorm_1.Entity)('order_rejections'),
    (0, typeorm_1.Index)(['rejectedAt'])
], OrderRejection);
//# sourceMappingURL=OrderRejection.js.map