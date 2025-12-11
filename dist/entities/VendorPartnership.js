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
exports.VendorPartnership = void 0;
const typeorm_1 = require("typeorm");
const Vendor_1 = require("./Vendor");
let VendorPartnership = class VendorPartnership {
};
exports.VendorPartnership = VendorPartnership;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], VendorPartnership.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'requester_id' }),
    __metadata("design:type", String)
], VendorPartnership.prototype, "requesterId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'recipient_id' }),
    __metadata("design:type", String)
], VendorPartnership.prototype, "recipientId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ['collaboration', 'supplier', 'distributor', 'joint_venture', 'other'], default: 'collaboration' }),
    __metadata("design:type", String)
], VendorPartnership.prototype, "partnershipType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], VendorPartnership.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ['pending', 'accepted', 'declined', 'active', 'inactive'], default: 'pending' }),
    __metadata("design:type", String)
], VendorPartnership.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], VendorPartnership.prototype, "terms", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'accepted_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], VendorPartnership.prototype, "acceptedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'declined_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], VendorPartnership.prototype, "declinedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'decline_reason', type: 'text', nullable: true }),
    __metadata("design:type", String)
], VendorPartnership.prototype, "declineReason", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], VendorPartnership.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], VendorPartnership.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Vendor_1.Vendor),
    (0, typeorm_1.JoinColumn)({ name: 'requester_id' }),
    __metadata("design:type", Vendor_1.Vendor)
], VendorPartnership.prototype, "requester", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Vendor_1.Vendor),
    (0, typeorm_1.JoinColumn)({ name: 'recipient_id' }),
    __metadata("design:type", Vendor_1.Vendor)
], VendorPartnership.prototype, "recipient", void 0);
exports.VendorPartnership = VendorPartnership = __decorate([
    (0, typeorm_1.Entity)('vendor_partnerships')
], VendorPartnership);
//# sourceMappingURL=VendorPartnership.js.map