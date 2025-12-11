"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RenameUserIdToVendorId1763292274209 = void 0;
class RenameUserIdToVendorId1763292274209 {
    constructor() {
        this.name = "RenameUserIdToVendorId1763292274209";
    }
    async up(queryRunner) {
        const table = await queryRunner.getTable("vendor_profiles");
        const hasUserId = table?.columns.find((c) => c.name === "user_id");
        const hasVendorId = table?.columns.find((c) => c.name === "vendor_id");
        if (hasUserId && !hasVendorId) {
            await queryRunner.query(`
                ALTER TABLE vendor_profiles 
                RENAME COLUMN user_id TO vendor_id
            `);
        }
    }
    async down(queryRunner) {
        const table = await queryRunner.getTable("vendor_profiles");
        const hasVendorId = table?.columns.find((c) => c.name === "vendor_id");
        const hasUserId = table?.columns.find((c) => c.name === "user_id");
        if (hasVendorId && !hasUserId) {
            await queryRunner.query(`
                ALTER TABLE vendor_profiles 
                RENAME COLUMN vendor_id TO user_id
            `);
        }
    }
}
exports.RenameUserIdToVendorId1763292274209 = RenameUserIdToVendorId1763292274209;
//# sourceMappingURL=1763292274209-RenameUserIdToVendorId.js.map