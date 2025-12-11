import { MigrationInterface, QueryRunner } from "typeorm";

export class FixVendorProfilePrimaryKey1763270260097
  implements MigrationInterface
{
  name = "FixVendorProfilePrimaryKey1763270260097";
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check current table structure
    const table = await queryRunner.getTable("vendor_profiles");
    const hasUserId = table?.columns.find((c) => c.name === "user_id");
    const hasVendorId = table?.columns.find((c) => c.name === "vendor_id");
    const hasId = table?.columns.find((c) => c.name === "id");

    if (hasId) {
      // If there's an id column, we need to drop it and make vendor_id the primary key
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
      // Rename user_id to vendor_id and make it primary key
      await queryRunner.query(`
                ALTER TABLE vendor_profiles 
                RENAME COLUMN user_id TO vendor_id
            `);
    }

    // Make vendor_id the primary key
    await queryRunner.query(`
            ALTER TABLE vendor_profiles 
            ADD PRIMARY KEY (vendor_id)
        `);

    // Ensure foreign key constraint exists
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

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse the changes
    await queryRunner.query(`
            ALTER TABLE vendor_profiles 
            DROP CONSTRAINT IF EXISTS vendor_profiles_pkey
        `);

    await queryRunner.query(`
            ALTER TABLE vendor_profiles 
            RENAME COLUMN vendor_id TO user_id
        `);

    // Add back id column if it existed
    await queryRunner.query(`
            ALTER TABLE vendor_profiles 
            ADD COLUMN id uuid DEFAULT gen_random_uuid() PRIMARY KEY
        `);
  }
}
