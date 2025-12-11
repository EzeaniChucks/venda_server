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
exports.FashionPost = void 0;
const typeorm_1 = require("typeorm");
const Vendor_1 = require("./Vendor");
const Product_1 = require("./Product");
const PostLike_1 = require("./PostLike");
const PostComment_1 = require("./PostComment");
let FashionPost = class FashionPost {
};
exports.FashionPost = FashionPost;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], FashionPost.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vendor_id' }),
    __metadata("design:type", String)
], FashionPost.prototype, "vendorId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], FashionPost.prototype, "caption", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ['image', 'video', 'carousel', 'styling_tip'], default: 'image' }),
    __metadata("design:type", String)
], FashionPost.prototype, "postType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Array)
], FashionPost.prototype, "media", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'product_id', nullable: true }),
    __metadata("design:type", String)
], FashionPost.prototype, "productId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], FashionPost.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', name: 'like_count', default: 0 }),
    __metadata("design:type", Number)
], FashionPost.prototype, "likeCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', name: 'comment_count', default: 0 }),
    __metadata("design:type", Number)
], FashionPost.prototype, "commentCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', name: 'view_count', default: 0 }),
    __metadata("design:type", Number)
], FashionPost.prototype, "viewCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', name: 'share_count', default: 0 }),
    __metadata("design:type", Number)
], FashionPost.prototype, "shareCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], FashionPost.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_featured', default: false }),
    __metadata("design:type", Boolean)
], FashionPost.prototype, "isFeatured", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], FashionPost.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], FashionPost.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Vendor_1.Vendor),
    (0, typeorm_1.JoinColumn)({ name: 'vendor_id' }),
    __metadata("design:type", Vendor_1.Vendor)
], FashionPost.prototype, "vendor", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Product_1.Product, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'product_id' }),
    __metadata("design:type", Product_1.Product)
], FashionPost.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => PostLike_1.PostLike, like => like.post),
    __metadata("design:type", Array)
], FashionPost.prototype, "likes", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => PostComment_1.PostComment, comment => comment.post),
    __metadata("design:type", Array)
], FashionPost.prototype, "comments", void 0);
exports.FashionPost = FashionPost = __decorate([
    (0, typeorm_1.Entity)('fashion_posts')
], FashionPost);
//# sourceMappingURL=FashionPost.js.map