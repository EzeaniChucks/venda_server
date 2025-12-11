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
exports.Product = void 0;
const typeorm_1 = require("typeorm");
const Vendor_1 = require("./Vendor");
const Category_1 = require("./Category");
const Cart_1 = require("./Cart");
const Wishlist_1 = require("./Wishlist");
let Product = class Product {
};
exports.Product = Product;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], Product.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Product.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Product.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "decimal",
        precision: 10,
        scale: 2,
        name: "discount_price",
        nullable: true,
    }),
    __metadata("design:type", Number)
], Product.prototype, "discountPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", name: "stock_quantity", default: 0 }),
    __metadata("design:type", Number)
], Product.prototype, "stockQuantity", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "images",
        type: "text",
        array: true,
        nullable: true,
    }),
    __metadata("design:type", Array)
], Product.prototype, "images", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "image_public_ids",
        type: "text",
        array: true,
        nullable: true,
    }),
    __metadata("design:type", Array)
], Product.prototype, "imagePublicIds", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "gender", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", default: "adult" }),
    __metadata("design:type", String)
], Product.prototype, "ageCategory", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", array: true, nullable: true }),
    __metadata("design:type", Array)
], Product.prototype, "sizes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", array: true, nullable: true }),
    __metadata("design:type", Array)
], Product.prototype, "colors", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "is_active", default: true }),
    __metadata("design:type", Boolean)
], Product.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "is_approved", default: false }),
    __metadata("design:type", Boolean)
], Product.prototype, "isApproved", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "is_featured", default: false, nullable: true }),
    __metadata("design:type", Boolean)
], Product.prototype, "isFeatured", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "decimal",
        precision: 3,
        scale: 2,
        nullable: true,
        default: 0,
    }),
    __metadata("design:type", Number)
], Product.prototype, "rating", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "integer",
        name: "total_reviews",
        default: 0,
        nullable: true,
    }),
    __metadata("design:type", Number)
], Product.prototype, "totalReviews", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", name: "total_sales", default: 0, nullable: true }),
    __metadata("design:type", Number)
], Product.prototype, "totalSales", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "category_id", nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "categoryId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "vendor_id", nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "vendorId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "made_in_nigeria", default: false }),
    __metadata("design:type", Boolean)
], Product.prototype, "madeInNigeria", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "origin_state", nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "originState", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "origin_city", nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "originCity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "styles_tags", type: "text", array: true, nullable: true }),
    __metadata("design:type", Array)
], Product.prototype, "stylesTags", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], Product.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], Product.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Category_1.Category, (category) => category.products),
    (0, typeorm_1.JoinColumn)({ name: "category_id" }),
    __metadata("design:type", Category_1.Category)
], Product.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Vendor_1.Vendor, (vendor) => vendor.products),
    (0, typeorm_1.JoinColumn)({ name: "vendor_id" }),
    __metadata("design:type", Vendor_1.Vendor)
], Product.prototype, "vendor", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Cart_1.Cart, (cart) => cart.product),
    __metadata("design:type", Array)
], Product.prototype, "cartItems", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Wishlist_1.Wishlist, (wishlist) => wishlist.product),
    __metadata("design:type", Array)
], Product.prototype, "wishlistItems", void 0);
exports.Product = Product = __decorate([
    (0, typeorm_1.Entity)("products")
], Product);
//# sourceMappingURL=Product.js.map