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
exports.RiderLocationHistory = void 0;
const typeorm_1 = require("typeorm");
const Rider_1 = require("./Rider");
const Order_1 = require("./Order");
let RiderLocationHistory = class RiderLocationHistory {
};
exports.RiderLocationHistory = RiderLocationHistory;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], RiderLocationHistory.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'rider_id' }),
    __metadata("design:type", String)
], RiderLocationHistory.prototype, "riderId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Rider_1.Rider),
    (0, typeorm_1.JoinColumn)({ name: 'rider_id' }),
    __metadata("design:type", Rider_1.Rider)
], RiderLocationHistory.prototype, "rider", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'order_id', nullable: true }),
    __metadata("design:type", String)
], RiderLocationHistory.prototype, "orderId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Order_1.Order),
    (0, typeorm_1.JoinColumn)({ name: 'order_id' }),
    __metadata("design:type", Order_1.Order)
], RiderLocationHistory.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 7 }),
    __metadata("design:type", Number)
], RiderLocationHistory.prototype, "latitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 7 }),
    __metadata("design:type", Number)
], RiderLocationHistory.prototype, "longitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], RiderLocationHistory.prototype, "accuracy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], RiderLocationHistory.prototype, "speed", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], RiderLocationHistory.prototype, "heading", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'recorded_at' }),
    __metadata("design:type", Date)
], RiderLocationHistory.prototype, "recordedAt", void 0);
exports.RiderLocationHistory = RiderLocationHistory = __decorate([
    (0, typeorm_1.Entity)('rider_location_history')
], RiderLocationHistory);
//# sourceMappingURL=RiderLocationHistory.js.map