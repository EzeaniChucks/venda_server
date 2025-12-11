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
exports.InfluencerPick = void 0;
const typeorm_1 = require("typeorm");
let InfluencerPick = class InfluencerPick {
};
exports.InfluencerPick = InfluencerPick;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], InfluencerPick.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], InfluencerPick.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'influencer_name' }),
    __metadata("design:type", String)
], InfluencerPick.prototype, "influencerName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'influencer_image', nullable: true }),
    __metadata("design:type", String)
], InfluencerPick.prototype, "influencerImage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], InfluencerPick.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Array)
], InfluencerPick.prototype, "productIds", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'banner_image', nullable: true }),
    __metadata("design:type", String)
], InfluencerPick.prototype, "bannerImage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], InfluencerPick.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ['draft', 'published', 'archived'], default: 'draft' }),
    __metadata("design:type", String)
], InfluencerPick.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_featured', default: false }),
    __metadata("design:type", Boolean)
], InfluencerPick.prototype, "isFeatured", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'publish_date', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], InfluencerPick.prototype, "publishDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expire_date', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], InfluencerPick.prototype, "expireDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', name: 'view_count', default: 0 }),
    __metadata("design:type", Number)
], InfluencerPick.prototype, "viewCount", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], InfluencerPick.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], InfluencerPick.prototype, "updatedAt", void 0);
exports.InfluencerPick = InfluencerPick = __decorate([
    (0, typeorm_1.Entity)('influencer_picks')
], InfluencerPick);
//# sourceMappingURL=InfluencerPick.js.map