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
exports.SavedLocation = void 0;
const typeorm_1 = require("typeorm");
const Customer_1 = require("./Customer");
let SavedLocation = class SavedLocation {
};
exports.SavedLocation = SavedLocation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SavedLocation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_id' }),
    __metadata("design:type", String)
], SavedLocation.prototype, "customerId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SavedLocation.prototype, "label", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ['home', 'work', 'other'], default: 'other' }),
    __metadata("design:type", String)
], SavedLocation.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], SavedLocation.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 7, nullable: true }),
    __metadata("design:type", Number)
], SavedLocation.prototype, "latitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 7, nullable: true }),
    __metadata("design:type", Number)
], SavedLocation.prototype, "longitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'street_address', nullable: true }),
    __metadata("design:type", String)
], SavedLocation.prototype, "streetAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], SavedLocation.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], SavedLocation.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'postal_code', nullable: true }),
    __metadata("design:type", String)
], SavedLocation.prototype, "postalCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], SavedLocation.prototype, "country", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'delivery_instructions', type: 'text', nullable: true }),
    __metadata("design:type", String)
], SavedLocation.prototype, "deliveryInstructions", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_default', default: false }),
    __metadata("design:type", Boolean)
], SavedLocation.prototype, "isDefault", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], SavedLocation.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], SavedLocation.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Customer_1.Customer),
    (0, typeorm_1.JoinColumn)({ name: 'customer_id' }),
    __metadata("design:type", Customer_1.Customer)
], SavedLocation.prototype, "customer", void 0);
exports.SavedLocation = SavedLocation = __decorate([
    (0, typeorm_1.Entity)('saved_locations')
], SavedLocation);
//# sourceMappingURL=SavedLocation.js.map