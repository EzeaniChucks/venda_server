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
exports.Rider = void 0;
const typeorm_1 = require("typeorm");
const Order_1 = require("./Order");
const Transaction_1 = require("./Transaction");
let Rider = class Rider {
};
exports.Rider = Rider;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], Rider.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Rider.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "password_hash" }),
    __metadata("design:type", String)
], Rider.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "full_name" }),
    __metadata("design:type", String)
], Rider.prototype, "fullName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Rider.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "avatar_url", type: "text", nullable: true }),
    __metadata("design:type", String)
], Rider.prototype, "profileImage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "fcm_token", type: "text", nullable: true }),
    __metadata("design:type", Object)
], Rider.prototype, "fcmToken", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "device_os",
        type: "enum",
        enum: ["ANDROID", "IOS", "WEB"],
        nullable: true,
    }),
    __metadata("design:type", String)
], Rider.prototype, "deviceOs", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "fcm_token_updated_at",
        type: "timestamp",
        nullable: true,
    }),
    __metadata("design:type", Date)
], Rider.prototype, "fcmTokenUpdatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "jsonb",
        default: { balance: 0, pendingBalance: 0 },
    }),
    __metadata("design:type", Object)
], Rider.prototype, "wallet", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "is_approved", default: false }),
    __metadata("design:type", Boolean)
], Rider.prototype, "isApproved", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "is_active", default: true }),
    __metadata("design:type", Boolean)
], Rider.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "is_verified", default: false }),
    __metadata("design:type", Boolean)
], Rider.prototype, "isVerified", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "is_available", default: false }),
    __metadata("design:type", Boolean)
], Rider.prototype, "isAvailable", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "document_verification_status", default: "not_submitted" }),
    __metadata("design:type", String)
], Rider.prototype, "documentVerificationStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Rider.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Rider.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Rider.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 7, nullable: true }),
    __metadata("design:type", Number)
], Rider.prototype, "latitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 7, nullable: true }),
    __metadata("design:type", Number)
], Rider.prototype, "longitude", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], Rider.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], Rider.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Order_1.Order, (order) => order.rider),
    __metadata("design:type", Array)
], Rider.prototype, "deliveries", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Transaction_1.Transaction, (transaction) => transaction.customer),
    __metadata("design:type", Array)
], Rider.prototype, "transactions", void 0);
exports.Rider = Rider = __decorate([
    (0, typeorm_1.Entity)("riders")
], Rider);
//# sourceMappingURL=Rider.js.map