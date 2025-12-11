"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddBankCodeToVendorProfileEntities1764945724593 = void 0;
class AddBankCodeToVendorProfileEntities1764945724593 {
    constructor() {
        this.name = "AddBankCodeToVendorProfileEntities1764945724593";
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "vendor_profiles" ADD "bank_code" character varying`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "vendor_profiles" DROP COLUMN "bank_code"`);
    }
}
exports.AddBankCodeToVendorProfileEntities1764945724593 = AddBankCodeToVendorProfileEntities1764945724593;
//# sourceMappingURL=1764945724593-AddBankCodeToVendorProfileEntities.js.map