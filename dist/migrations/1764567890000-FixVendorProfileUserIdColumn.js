"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FixVendorProfileUserIdColumn1234567890000 = void 0;
class FixVendorProfileUserIdColumn1234567890000 {
    constructor() {
        this.name = "FixVendorProfileUserIdColumn1234567890000";
    }
    async up(queryRunner) {
        const table = await queryRunner.getTable("vendor_profiles");
        const hasUserId = table?.columns.find((c) => c.name === "user_id");
        const hasVendorId = table?.columns.find((c) => c.name === "vendor_id");
        if (hasUserId && !hasVendorId) {
            await queryRunner.query(`
                ALTER TABLE vendor_profiles 
                ADD COLUMN vendor_id uuid
            `);
            await queryRunner.query(`
                UPDATE vendor_profiles 
                SET vendor_id = user_id 
                WHERE user_id IS NOT NULL
            `);
            try {
                await queryRunner.query(`
                    ALTER TABLE vendor_profiles 
                    DROP CONSTRAINT IF EXISTS vendor_profiles_user_id_key
                `);
            }
            catch (error) {
                console.log("No unique constraint on user_id or already dropped");
            }
            try {
                await queryRunner.query(`
                    ALTER TABLE vendor_profiles 
                    DROP CONSTRAINT IF EXISTS vendor_profiles_user_id_fkey
                `);
            }
            catch (error) {
                console.log("No foreign key constraint on user_id or already dropped");
            }
            await queryRunner.query(`
                ALTER TABLE vendor_profiles 
                DROP COLUMN user_id
            `);
            await queryRunner.query(`
                ALTER TABLE vendor_profiles 
                ALTER COLUMN vendor_id SET NOT NULL
            `);
            await queryRunner.query(`
                ALTER TABLE vendor_profiles 
                ADD CONSTRAINT vendor_profiles_vendor_id_key UNIQUE (vendor_id)
            `);
            await queryRunner.query(`
                ALTER TABLE vendor_profiles 
                ADD CONSTRAINT vendor_profiles_vendor_id_fkey 
                FOREIGN KEY (vendor_id) REFERENCES vendors(id)
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
                ADD COLUMN user_id uuid
            `);
            await queryRunner.query(`
                UPDATE vendor_profiles 
                SET user_id = vendor_id 
                WHERE vendor_id IS NOT NULL
            `);
            try {
                await queryRunner.query(`
                    ALTER TABLE vendor_profiles 
                    DROP CONSTRAINT IF EXISTS vendor_profiles_vendor_id_key
                `);
            }
            catch (error) {
                console.log("No unique constraint on vendor_id or already dropped");
            }
            try {
                await queryRunner.query(`
                    ALTER TABLE vendor_profiles 
                    DROP CONSTRAINT IF EXISTS vendor_profiles_vendor_id_fkey
                `);
            }
            catch (error) {
                console.log("No foreign key constraint on vendor_id or already dropped");
            }
            await queryRunner.query(`
                ALTER TABLE vendor_profiles 
                DROP COLUMN vendor_id
            `);
            await queryRunner.query(`
                ALTER TABLE vendor_profiles 
                ALTER COLUMN user_id SET NOT NULL
            `);
            await queryRunner.query(`
                ALTER TABLE vendor_profiles 
                ADD CONSTRAINT vendor_profiles_user_id_key UNIQUE (user_id)
            `);
            await queryRunner.query(`
                ALTER TABLE vendor_profiles 
                ADD CONSTRAINT vendor_profiles_user_id_fkey 
                FOREIGN KEY (user_id) REFERENCES vendors(id)
            `);
        }
    }
}
exports.FixVendorProfileUserIdColumn1234567890000 = FixVendorProfileUserIdColumn1234567890000;
//# sourceMappingURL=1764567890000-FixVendorProfileUserIdColumn.js.map