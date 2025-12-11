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
exports.RiderDocument = void 0;
const typeorm_1 = require("typeorm");
const Rider_1 = require("./Rider");
const Admin_1 = require("./Admin");
let RiderDocument = class RiderDocument {
};
exports.RiderDocument = RiderDocument;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], RiderDocument.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'rider_id' }),
    __metadata("design:type", String)
], RiderDocument.prototype, "riderId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', name: 'drivers_license_url', nullable: true }),
    __metadata("design:type", String)
], RiderDocument.prototype, "driversLicenseUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', name: 'drivers_license_number', nullable: true }),
    __metadata("design:type", String)
], RiderDocument.prototype, "driversLicenseNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', name: 'drivers_license_expiry', nullable: true }),
    __metadata("design:type", Date)
], RiderDocument.prototype, "driversLicenseExpiry", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', name: 'drivers_license_cloudinary_id', nullable: true }),
    __metadata("design:type", String)
], RiderDocument.prototype, "driversLicenseCloudinaryId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', name: 'vehicle_type', nullable: true }),
    __metadata("design:type", String)
], RiderDocument.prototype, "vehicleType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', name: 'vehicle_registration', nullable: true }),
    __metadata("design:type", String)
], RiderDocument.prototype, "vehicleRegistration", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', name: 'vehicle_photo_url', nullable: true }),
    __metadata("design:type", String)
], RiderDocument.prototype, "vehiclePhotoUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', name: 'vehicle_photo_cloudinary_id', nullable: true }),
    __metadata("design:type", String)
], RiderDocument.prototype, "vehiclePhotoCloudinaryId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', name: 'national_id_url', nullable: true }),
    __metadata("design:type", String)
], RiderDocument.prototype, "nationalIdUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', name: 'national_id_number', nullable: true }),
    __metadata("design:type", String)
], RiderDocument.prototype, "nationalIdNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', name: 'national_id_cloudinary_id', nullable: true }),
    __metadata("design:type", String)
], RiderDocument.prototype, "nationalIdCloudinaryId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        default: 'pending'
    }),
    __metadata("design:type", String)
], RiderDocument.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', name: 'admin_notes', nullable: true }),
    __metadata("design:type", String)
], RiderDocument.prototype, "adminNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'reviewed_by', nullable: true }),
    __metadata("design:type", String)
], RiderDocument.prototype, "reviewedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', name: 'submitted_at', nullable: true }),
    __metadata("design:type", Date)
], RiderDocument.prototype, "submittedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', name: 'reviewed_at', nullable: true }),
    __metadata("design:type", Date)
], RiderDocument.prototype, "reviewedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', name: 'submission_count', default: 1 }),
    __metadata("design:type", Number)
], RiderDocument.prototype, "submissionCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', name: 'total_deliveries', default: 0 }),
    __metadata("design:type", Number)
], RiderDocument.prototype, "totalDeliveries", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 3, scale: 2, default: 0.0 }),
    __metadata("design:type", Number)
], RiderDocument.prototype, "rating", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], RiderDocument.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], RiderDocument.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Rider_1.Rider, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'rider_id' }),
    __metadata("design:type", Rider_1.Rider)
], RiderDocument.prototype, "rider", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Admin_1.Admin, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'reviewed_by' }),
    __metadata("design:type", Admin_1.Admin)
], RiderDocument.prototype, "reviewer", void 0);
exports.RiderDocument = RiderDocument = __decorate([
    (0, typeorm_1.Entity)('rider_documents')
], RiderDocument);
//# sourceMappingURL=RiderDocument.js.map