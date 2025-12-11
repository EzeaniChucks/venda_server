"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovedProfileImageFromVendorToVendorProfile1764948992324 = void 0;
class MovedProfileImageFromVendorToVendorProfile1764948992324 {
    constructor() {
        this.name = "MovedProfileImageFromVendorToVendorProfile1764948992324";
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "vendors" DROP COLUMN "avatar_url"`);
        await queryRunner.query(`ALTER TABLE "vendor_profiles" ADD "avatar_url" text`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "vendor_profiles" DROP COLUMN "avatar_url"`);
        await queryRunner.query(`ALTER TABLE "vendors" ADD "avatar_url" text`);
    }
}
exports.MovedProfileImageFromVendorToVendorProfile1764948992324 = MovedProfileImageFromVendorToVendorProfile1764948992324;
//# sourceMappingURL=1764948992324-MovedProfileImageFromVendorToVendorProfile.js.map