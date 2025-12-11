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
exports.VerificationCode = void 0;
const typeorm_1 = require("typeorm");
const Customer_1 = require("./Customer");
const Vendor_1 = require("./Vendor");
const Rider_1 = require("./Rider");
const Admin_1 = require("./Admin");
let VerificationCode = class VerificationCode {
};
exports.VerificationCode = VerificationCode;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], VerificationCode.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 10 }),
    __metadata("design:type", String)
], VerificationCode.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], VerificationCode.prototype, "contact", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], VerificationCode.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], VerificationCode.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "enum", enum: ["sms", "email"] }),
    __metadata("design:type", String)
], VerificationCode.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: [
            "signup",
            "login",
            "password_reset",
            "phone_verification",
            "email_verification",
        ],
    }),
    __metadata("design:type", String)
], VerificationCode.prototype, "purpose", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "participant_type", nullable: true }),
    __metadata("design:type", String)
], VerificationCode.prototype, "participantType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "pin_id", nullable: true }),
    __metadata("design:type", String)
], VerificationCode.prototype, "pinId", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], VerificationCode.prototype, "used", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], VerificationCode.prototype, "verified", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", name: "expires_at" }),
    __metadata("design:type", Date)
], VerificationCode.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", name: "attempts", default: 0 }),
    __metadata("design:type", Number)
], VerificationCode.prototype, "attempts", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], VerificationCode.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Customer_1.Customer, { onDelete: "CASCADE", nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "customer_id" }),
    __metadata("design:type", Customer_1.Customer)
], VerificationCode.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Vendor_1.Vendor, { onDelete: "CASCADE", nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "vendor_id" }),
    __metadata("design:type", Vendor_1.Vendor)
], VerificationCode.prototype, "vendor", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Rider_1.Rider, { onDelete: "CASCADE", nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "rider_id" }),
    __metadata("design:type", Rider_1.Rider)
], VerificationCode.prototype, "rider", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Admin_1.Admin, { onDelete: "CASCADE", nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "admin_id" }),
    __metadata("design:type", Admin_1.Admin)
], VerificationCode.prototype, "admin", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "jsonb", nullable: true }),
    __metadata("design:type", Object)
], VerificationCode.prototype, "metadata", void 0);
exports.VerificationCode = VerificationCode = __decorate([
    (0, typeorm_1.Entity)("verification_codes"),
    (0, typeorm_1.Index)(["contact", "used", "createdAt"])
], VerificationCode);
//# sourceMappingURL=VerificationCode.js.map