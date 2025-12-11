import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameUserIdToVendorId1763292274209 implements MigrationInterface {
  name = "RenameUserIdToVendorId1763292274209";
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if user_id exists and vendor_id doesn't
    const table = await queryRunner.getTable("vendor_profiles");
    const hasUserId = table?.columns.find((c) => c.name === "user_id");
    const hasVendorId = table?.columns.find((c) => c.name === "vendor_id");

    if (hasUserId && !hasVendorId) {
      // Simple rename operation
      await queryRunner.query(`
                ALTER TABLE vendor_profiles 
                RENAME COLUMN user_id TO vendor_id
            `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse the rename
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
