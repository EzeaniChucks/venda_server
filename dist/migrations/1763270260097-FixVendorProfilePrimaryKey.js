"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FixVendorProfilePrimaryKey1763270260097 = void 0;
class FixVendorProfilePrimaryKey1763270260097 {
    constructor() {
        this.name = "FixVendorProfilePrimaryKey1763270260097";
    }
    async up(queryRunner) {
        const table = await queryRunner.getTable("vendor_profiles");
        const hasUserId = table?.columns.find((c) => c.name === "user_id");
        const hasVendorId = table?.columns.find((c) => c.name === "vendor_id");
        const hasId = table?.columns.find((c) => c.name === "id");
        if (hasId) {
            await queryRunner.query(`
                ALTER TABLE vendor_profiles 
                DROP CONSTRAINT IF EXISTS vendor_profiles_pkey CASCADE
            `);
            await queryRunner.query(`
                ALTER TABLE vendor_profiles 
                DROP COLUMN id
            `);
        }
        if (hasUserId && !hasVendorId) {
            await queryRunner.query(`
                ALTER TABLE vendor_profiles 
                RENAME COLUMN user_id TO vendor_id
            `);
        }
        await queryRunner.query(`
            ALTER TABLE vendor_profiles 
            ADD PRIMARY KEY (vendor_id)
        `);
        await queryRunner.query(`
            ALTER TABLE vendor_profiles 
            DROP CONSTRAINT IF EXISTS vendor_profiles_vendor_id_fkey
        `);
        await queryRunner.query(`
            ALTER TABLE vendor_profiles 
            ADD CONSTRAINT vendor_profiles_vendor_id_fkey 
            FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE vendor_profiles 
            DROP CONSTRAINT IF EXISTS vendor_profiles_pkey
        `);
        await queryRunner.query(`
            ALTER TABLE vendor_profiles 
            RENAME COLUMN vendor_id TO user_id
        `);
        await queryRunner.query(`
            ALTER TABLE vendor_profiles 
            ADD COLUMN id uuid DEFAULT gen_random_uuid() PRIMARY KEY
        `);
    }
}
exports.FixVendorProfilePrimaryKey1763270260097 = FixVendorProfilePrimaryKey1763270260097;
//# sourceMappingURL=1763270260097-FixVendorProfilePrimaryKey.js.map