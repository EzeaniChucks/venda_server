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
exports.VendorMessage = void 0;
const typeorm_1 = require("typeorm");
const Vendor_1 = require("./Vendor");
let VendorMessage = class VendorMessage {
};
exports.VendorMessage = VendorMessage;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], VendorMessage.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sender_id' }),
    __metadata("design:type", String)
], VendorMessage.prototype, "senderId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'receiver_id' }),
    __metadata("design:type", String)
], VendorMessage.prototype, "receiverId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], VendorMessage.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_read', default: false }),
    __metadata("design:type", Boolean)
], VendorMessage.prototype, "isRead", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'collaboration_id', nullable: true }),
    __metadata("design:type", String)
], VendorMessage.prototype, "collaborationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], VendorMessage.prototype, "attachments", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], VendorMessage.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Vendor_1.Vendor),
    (0, typeorm_1.JoinColumn)({ name: 'sender_id' }),
    __metadata("design:type", Vendor_1.Vendor)
], VendorMessage.prototype, "sender", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Vendor_1.Vendor),
    (0, typeorm_1.JoinColumn)({ name: 'receiver_id' }),
    __metadata("design:type", Vendor_1.Vendor)
], VendorMessage.prototype, "receiver", void 0);
exports.VendorMessage = VendorMessage = __decorate([
    (0, typeorm_1.Entity)('vendor_messages')
], VendorMessage);
//# sourceMappingURL=VendorMessage.js.map