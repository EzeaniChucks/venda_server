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
exports.Order = void 0;
const typeorm_1 = require("typeorm");
const Customer_1 = require("./Customer");
const Rider_1 = require("./Rider");
const OrderItem_1 = require("./OrderItem");
let Order = class Order {
};
exports.Order = Order;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], Order.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "order_number", unique: true }),
    __metadata("design:type", String)
], Order.prototype, "orderNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "customer_id", nullable: true }),
    __metadata("design:type", String)
], Order.prototype, "customerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 2, name: "total_amount" }),
    __metadata("design:type", Number)
], Order.prototype, "totalAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "decimal",
        precision: 10,
        scale: 2,
        name: "delivery_fee",
        default: 0,
        nullable: true,
    }),
    __metadata("design:type", Number)
], Order.prototype, "deliveryFee", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "decimal",
        precision: 10,
        scale: 2,
        name: "discount_amount",
        default: 0,
        nullable: true,
    }),
    __metadata("design:type", Number)
], Order.prototype, "discountAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 2, name: "final_amount" }),
    __metadata("design:type", Number)
], Order.prototype, "finalAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "varchar",
        name: "order_status",
        default: "pending",
        nullable: true,
    }),
    __metadata("design:type", String)
], Order.prototype, "orderStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", name: "payment_method" }),
    __metadata("design:type", String)
], Order.prototype, "paymentMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "varchar",
        name: "payment_status",
        default: "pending",
        nullable: true,
    }),
    __metadata("design:type", String)
], Order.prototype, "paymentStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", name: "delivery_address" }),
    __metadata("design:type", String)
], Order.prototype, "deliveryAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "delivery_city", nullable: true }),
    __metadata("design:type", String)
], Order.prototype, "deliveryCity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "delivery_state", nullable: true }),
    __metadata("design:type", String)
], Order.prototype, "deliveryState", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "delivery_postal_code", nullable: true }),
    __metadata("design:type", String)
], Order.prototype, "deliveryPostalCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "delivery_phone", nullable: true }),
    __metadata("design:type", String)
], Order.prototype, "deliveryPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", name: "delivery_notes", nullable: true }),
    __metadata("design:type", String)
], Order.prototype, "deliveryNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "uuid", name: "rider_id", nullable: true }),
    __metadata("design:type", Object)
], Order.prototype, "riderId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "timestamp",
        name: "estimated_delivery_date",
        nullable: true,
    }),
    __metadata("design:type", Date)
], Order.prototype, "estimatedDeliveryDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", name: "delivered_at", nullable: true }),
    __metadata("design:type", Date)
], Order.prototype, "deliveredAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", name: "cancelled_at", nullable: true }),
    __metadata("design:type", Date)
], Order.prototype, "cancelledAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", name: "cancellation_reason", nullable: true }),
    __metadata("design:type", String)
], Order.prototype, "cancellationReason", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], Order.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], Order.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Customer_1.Customer, (customer) => customer.orders),
    (0, typeorm_1.JoinColumn)({ name: "customer_id" }),
    __metadata("design:type", Customer_1.Customer)
], Order.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Rider_1.Rider, (rider) => rider.deliveries),
    (0, typeorm_1.JoinColumn)({ name: "rider_id" }),
    __metadata("design:type", Rider_1.Rider)
], Order.prototype, "rider", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => OrderItem_1.OrderItem, (orderItem) => orderItem.order),
    __metadata("design:type", Array)
], Order.prototype, "orderItems", void 0);
exports.Order = Order = __decorate([
    (0, typeorm_1.Entity)("orders")
], Order);
//# sourceMappingURL=Order.js.map