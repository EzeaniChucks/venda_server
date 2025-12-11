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
exports.Transaction = void 0;
const typeorm_1 = require("typeorm");
const Customer_1 = require("./Customer");
const Vendor_1 = require("./Vendor");
const Rider_1 = require("./Rider");
const Order_1 = require("./Order");
let Transaction = class Transaction {
};
exports.Transaction = Transaction;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], Transaction.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "entity_id" }),
    __metadata("design:type", String)
], Transaction.prototype, "entityId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "entity_type" }),
    __metadata("design:type", String)
], Transaction.prototype, "entityType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "order_id", nullable: true }),
    __metadata("design:type", String)
], Transaction.prototype, "orderId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Transaction.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: [
            "wallet_funding",
            "wallet_withdrawal",
            "order_payment",
            "refund",
            "commission",
            "transfer",
        ],
    }),
    __metadata("design:type", String)
], Transaction.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Transaction.prototype, "reference", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "payment_method", nullable: true }),
    __metadata("design:type", String)
], Transaction.prototype, "paymentMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: ["pending", "completed", "failed", "processing", "cancelled"],
        default: "pending",
    }),
    __metadata("design:type", String)
], Transaction.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Transaction.prototype, "purpose", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "jsonb", nullable: true }),
    __metadata("design:type", Object)
], Transaction.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], Transaction.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", name: "completed_at", nullable: true }),
    __metadata("design:type", Date)
], Transaction.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Customer_1.Customer, (customer) => customer.transactions, {
        nullable: true,
    }),
    (0, typeorm_1.JoinColumn)({ name: "customer_id" }),
    __metadata("design:type", Customer_1.Customer)
], Transaction.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Vendor_1.Vendor, (vendor) => vendor.transactions, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "vendor_id" }),
    __metadata("design:type", Vendor_1.Vendor)
], Transaction.prototype, "vendor", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Rider_1.Rider, (rider) => rider.transactions, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "rider_id" }),
    __metadata("design:type", Rider_1.Rider)
], Transaction.prototype, "rider", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Order_1.Order, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "order_id" }),
    __metadata("design:type", Order_1.Order)
], Transaction.prototype, "order", void 0);
exports.Transaction = Transaction = __decorate([
    (0, typeorm_1.Entity)("transactions")
], Transaction);
//# sourceMappingURL=Transaction.js.map