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
exports.VendorCollaboration = void 0;
const typeorm_1 = require("typeorm");
const Vendor_1 = require("./Vendor");
let VendorCollaboration = class VendorCollaboration {
};
exports.VendorCollaboration = VendorCollaboration;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], VendorCollaboration.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vendor_1_id' }),
    __metadata("design:type", String)
], VendorCollaboration.prototype, "vendor1Id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vendor_2_id' }),
    __metadata("design:type", String)
], VendorCollaboration.prototype, "vendor2Id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], VendorCollaboration.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], VendorCollaboration.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], VendorCollaboration.prototype, "productIds", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ['proposed', 'accepted', 'active', 'completed', 'rejected'], default: 'proposed' }),
    __metadata("design:type", String)
], VendorCollaboration.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_featured', default: false }),
    __metadata("design:type", Boolean)
], VendorCollaboration.prototype, "isFeatured", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'banner_image', nullable: true }),
    __metadata("design:type", String)
], VendorCollaboration.prototype, "bannerImage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'start_date', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], VendorCollaboration.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'end_date', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], VendorCollaboration.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], VendorCollaboration.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], VendorCollaboration.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Vendor_1.Vendor),
    (0, typeorm_1.JoinColumn)({ name: 'vendor_1_id' }),
    __metadata("design:type", Vendor_1.Vendor)
], VendorCollaboration.prototype, "vendor1", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Vendor_1.Vendor),
    (0, typeorm_1.JoinColumn)({ name: 'vendor_2_id' }),
    __metadata("design:type", Vendor_1.Vendor)
], VendorCollaboration.prototype, "vendor2", void 0);
exports.VendorCollaboration = VendorCollaboration = __decorate([
    (0, typeorm_1.Entity)('vendor_collaborations')
], VendorCollaboration);
//# sourceMappingURL=VendorCollaboration.js.map