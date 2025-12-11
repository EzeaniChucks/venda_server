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
exports.Customer = void 0;
const typeorm_1 = require("typeorm");
const Cart_1 = require("./Cart");
const Wishlist_1 = require("./Wishlist");
const Order_1 = require("./Order");
const Transaction_1 = require("./Transaction");
const PaymentMethod_1 = require("./PaymentMethod");
let Customer = class Customer {
};
exports.Customer = Customer;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], Customer.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Customer.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "password_hash" }),
    __metadata("design:type", String)
], Customer.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "full_name" }),
    __metadata("design:type", String)
], Customer.prototype, "fullName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "avatar_url", type: "text", nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "profileImage", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, default: "Abuja" }),
    __metadata("design:type", String)
], Customer.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, default: "Wuse" }),
    __metadata("design:type", String)
], Customer.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 7, nullable: true }),
    __metadata("design:type", Number)
], Customer.prototype, "latitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 7, nullable: true }),
    __metadata("design:type", Number)
], Customer.prototype, "longitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "fcm_token", type: "text", nullable: true }),
    __metadata("design:type", Object)
], Customer.prototype, "fcmToken", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "device_os",
        type: "enum",
        enum: ["ANDROID", "IOS", "WEB"],
        nullable: true,
    }),
    __metadata("design:type", String)
], Customer.prototype, "deviceOs", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "fcm_token_updated_at",
        type: "timestamp",
        nullable: true,
    }),
    __metadata("design:type", Date)
], Customer.prototype, "fcmTokenUpdatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "jsonb",
        default: { balance: 0, pendingBalance: 0 },
    }),
    __metadata("design:type", Object)
], Customer.prototype, "wallet", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "is_active", default: true }),
    __metadata("design:type", Boolean)
], Customer.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "is_verified", default: false }),
    __metadata("design:type", Boolean)
], Customer.prototype, "isVerified", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], Customer.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], Customer.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Cart_1.Cart, (cart) => cart.customer),
    __metadata("design:type", Array)
], Customer.prototype, "cartItems", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Wishlist_1.Wishlist, (wishlist) => wishlist.customer),
    __metadata("design:type", Array)
], Customer.prototype, "wishlistItems", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Order_1.Order, (order) => order.customer),
    __metadata("design:type", Array)
], Customer.prototype, "orders", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Transaction_1.Transaction, (transaction) => transaction.customer),
    __metadata("design:type", Array)
], Customer.prototype, "transactions", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => PaymentMethod_1.PaymentMethod, (paymentMethod) => paymentMethod.customer),
    __metadata("design:type", Array)
], Customer.prototype, "paymentMethods", void 0);
exports.Customer = Customer = __decorate([
    (0, typeorm_1.Entity)("customers")
], Customer);
//# sourceMappingURL=Customer.js.map