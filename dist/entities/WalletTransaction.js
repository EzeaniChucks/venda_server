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
exports.WalletTransaction = void 0;
const typeorm_1 = require("typeorm");
const Wallet_1 = require("./Wallet");
const Customer_1 = require("./Customer");
let WalletTransaction = class WalletTransaction {
};
exports.WalletTransaction = WalletTransaction;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], WalletTransaction.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "uuid", name: "wallet_id", nullable: true }),
    __metadata("design:type", String)
], WalletTransaction.prototype, "walletId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "uuid", name: "customer_id" }),
    __metadata("design:type", String)
], WalletTransaction.prototype, "customerId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: ["deposit", "withdrawal", "payment", "refund"],
        name: "transaction_type",
    }),
    __metadata("design:type", String)
], WalletTransaction.prototype, "transactionType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], WalletTransaction.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 12, scale: 2, name: "balance_before" }),
    __metadata("design:type", Number)
], WalletTransaction.prototype, "balanceBefore", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 12, scale: 2, name: "balance_after" }),
    __metadata("design:type", Number)
], WalletTransaction.prototype, "balanceAfter", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], WalletTransaction.prototype, "reference", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text" }),
    __metadata("design:type", String)
], WalletTransaction.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: ["pending", "completed", "failed"],
        default: "pending",
    }),
    __metadata("design:type", String)
], WalletTransaction.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "jsonb", nullable: true }),
    __metadata("design:type", Object)
], WalletTransaction.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], WalletTransaction.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Wallet_1.Wallet, (wallet) => wallet.transactions, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "wallet_id" }),
    __metadata("design:type", Wallet_1.Wallet)
], WalletTransaction.prototype, "wallet", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Customer_1.Customer),
    (0, typeorm_1.JoinColumn)({ name: "customer_id" }),
    __metadata("design:type", Customer_1.Customer)
], WalletTransaction.prototype, "customer", void 0);
exports.WalletTransaction = WalletTransaction = __decorate([
    (0, typeorm_1.Entity)("wallet_transactions")
], WalletTransaction);
//# sourceMappingURL=WalletTransaction.js.map