import { MigrationInterface, QueryRunner } from "typeorm";

export class FixVendorProfileUserIdColumn1234567890000
  implements MigrationInterface
{
  name = "FixVendorProfileUserIdColumn1234567890000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, check if user_id column exists
    const table = await queryRunner.getTable("vendor_profiles");
    const hasUserId = table?.columns.find((c) => c.name === "user_id");
    const hasVendorId = table?.columns.find((c) => c.name === "vendor_id");

    if (hasUserId && !hasVendorId) {
      // Step 1: Add the new vendor_id column as nullable first
      await queryRunner.query(`
                ALTER TABLE vendor_profiles 
                ADD COLUMN vendor_id uuid
            `);

      // Step 2: Copy data from user_id to vendor_id
      await queryRunner.query(`
                UPDATE vendor_profiles 
                SET vendor_id = user_id 
                WHERE user_id IS NOT NULL
            `);

      // Step 3: Drop the unique constraint from user_id first (if exists)
      try {
        await queryRunner.query(`
                    ALTER TABLE vendor_profiles 
                    DROP CONSTRAINT IF EXISTS vendor_profiles_user_id_key
                `);
      } catch (error) {
        console.log("No unique constraint on user_id or already dropped");
      }

      // Step 4: Drop the foreign key constraint from user_id (if exists)
      try {
        await queryRunner.query(`
                    ALTER TABLE vendor_profiles 
                    DROP CONSTRAINT IF EXISTS vendor_profiles_user_id_fkey
                `);
      } catch (error) {
        console.log("No foreign key constraint on user_id or already dropped");
      }

      // Step 5: Drop the old user_id column
      await queryRunner.query(`
                ALTER TABLE vendor_profiles 
                DROP COLUMN user_id
            `);

      // Step 6: Add NOT NULL constraint to vendor_id
      await queryRunner.query(`
                ALTER TABLE vendor_profiles 
                ALTER COLUMN vendor_id SET NOT NULL
            `);

      // Step 7: Add unique constraint to vendor_id
      await queryRunner.query(`
                ALTER TABLE vendor_profiles 
                ADD CONSTRAINT vendor_profiles_vendor_id_key UNIQUE (vendor_id)
            `);

      // Step 8: Add foreign key constraint
      await queryRunner.query(`
                ALTER TABLE vendor_profiles 
                ADD CONSTRAINT vendor_profiles_vendor_id_fkey 
                FOREIGN KEY (vendor_id) REFERENCES vendors(id)
            `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse the process
    const table = await queryRunner.getTable("vendor_profiles");
    const hasVendorId = table?.columns.find((c) => c.name === "vendor_id");
    const hasUserId = table?.columns.find((c) => c.name === "user_id");

    if (hasVendorId && !hasUserId) {
      // Add user_id column
      await queryRunner.query(`
                ALTER TABLE vendor_profiles 
                ADD COLUMN user_id uuid
            `);

      // Copy data back
      await queryRunner.query(`
                UPDATE vendor_profiles 
                SET user_id = vendor_id 
                WHERE vendor_id IS NOT NULL
            `);

      // Drop constraints from vendor_id
      try {
        await queryRunner.query(`
                    ALTER TABLE vendor_profiles 
                    DROP CONSTRAINT IF EXISTS vendor_profiles_vendor_id_key
                `);
      } catch (error) {
        console.log("No unique constraint on vendor_id or already dropped");
      }

      try {
        await queryRunner.query(`
                    ALTER TABLE vendor_profiles 
                    DROP CONSTRAINT IF EXISTS vendor_profiles_vendor_id_fkey
                `);
      } catch (error) {
        console.log(
          "No foreign key constraint on vendor_id or already dropped"
        );
      }

      // Drop vendor_id column
      await queryRunner.query(`
                ALTER TABLE vendor_profiles 
                DROP COLUMN vendor_id
            `);

      // Add constraints to user_id
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
