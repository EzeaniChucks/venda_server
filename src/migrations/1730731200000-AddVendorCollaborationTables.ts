import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVendorCollaborationTables1730731200000 implements MigrationInterface {
  name = 'AddVendorCollaborationTables1730731200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ensure UUID extension is available
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    
    // Handle vendor_collaborations table
    const vendorCollabTableExists = await queryRunner.hasTable('vendor_collaborations');
    
    if (!vendorCollabTableExists) {
      // Create vendor_collaborations table if it doesn't exist
      await queryRunner.query(`
        CREATE TABLE "vendor_collaborations" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "vendor_1_id" uuid NOT NULL,
          "vendor_2_id" uuid NOT NULL,
          "title" character varying NOT NULL,
          "description" text NOT NULL,
          "product_ids" jsonb,
          "status" character varying NOT NULL DEFAULT 'proposed',
          "is_featured" boolean NOT NULL DEFAULT false,
          "banner_image" character varying,
          "start_date" TIMESTAMP,
          "end_date" TIMESTAMP,
          "created_at" TIMESTAMP NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_vendor_collaborations" PRIMARY KEY ("id"),
          CONSTRAINT "CHK_vendor_collaborations_status" CHECK ("status" IN ('proposed', 'accepted', 'active', 'completed', 'rejected'))
        )
      `);

      // Add foreign keys for vendor_collaborations
      await queryRunner.query(`
        ALTER TABLE "vendor_collaborations" 
        ADD CONSTRAINT "FK_vendor_collaborations_vendor1" 
        FOREIGN KEY ("vendor_1_id") REFERENCES "vendors"("id") 
        ON DELETE CASCADE ON UPDATE NO ACTION
      `);
      await queryRunner.query(`
        ALTER TABLE "vendor_collaborations" 
        ADD CONSTRAINT "FK_vendor_collaborations_vendor2" 
        FOREIGN KEY ("vendor_2_id") REFERENCES "vendors"("id") 
        ON DELETE CASCADE ON UPDATE NO ACTION
      `);
    } else {
      // Table exists - ensure all columns are present with ALTER TABLE
      const productIdsColumnExists = await queryRunner.hasColumn('vendor_collaborations', 'product_ids');
      if (!productIdsColumnExists) {
        await queryRunner.query(`ALTER TABLE "vendor_collaborations" ADD COLUMN "product_ids" jsonb`);
      }

      const statusColumnExists = await queryRunner.hasColumn('vendor_collaborations', 'status');
      if (!statusColumnExists) {
        await queryRunner.query(`ALTER TABLE "vendor_collaborations" ADD COLUMN "status" character varying NOT NULL DEFAULT 'proposed'`);
      }
      
      const isFeaturedColumnExists = await queryRunner.hasColumn('vendor_collaborations', 'is_featured');
      if (!isFeaturedColumnExists) {
        await queryRunner.query(`ALTER TABLE "vendor_collaborations" ADD COLUMN "is_featured" boolean NOT NULL DEFAULT false`);
      }

      const bannerImageColumnExists = await queryRunner.hasColumn('vendor_collaborations', 'banner_image');
      if (!bannerImageColumnExists) {
        await queryRunner.query(`ALTER TABLE "vendor_collaborations" ADD COLUMN "banner_image" character varying`);
      }

      const startDateColumnExists = await queryRunner.hasColumn('vendor_collaborations', 'start_date');
      if (!startDateColumnExists) {
        await queryRunner.query(`ALTER TABLE "vendor_collaborations" ADD COLUMN "start_date" TIMESTAMP`);
      }

      const endDateColumnExists = await queryRunner.hasColumn('vendor_collaborations', 'end_date');
      if (!endDateColumnExists) {
        await queryRunner.query(`ALTER TABLE "vendor_collaborations" ADD COLUMN "end_date" TIMESTAMP`);
      }

      // Add status check constraint if not exists
      await queryRunner.query(`
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'CHK_vendor_collaborations_status'
          ) THEN
            ALTER TABLE "vendor_collaborations" 
            ADD CONSTRAINT "CHK_vendor_collaborations_status" 
            CHECK ("status" IN ('proposed', 'accepted', 'active', 'completed', 'rejected'));
          END IF;
        END $$;
      `);

      // Add foreign keys if not exist
      await queryRunner.query(`
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'FK_vendor_collaborations_vendor1'
          ) THEN
            ALTER TABLE "vendor_collaborations" 
            ADD CONSTRAINT "FK_vendor_collaborations_vendor1" 
            FOREIGN KEY ("vendor_1_id") REFERENCES "vendors"("id") 
            ON DELETE CASCADE ON UPDATE NO ACTION;
          END IF;
        END $$;
      `);
      await queryRunner.query(`
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'FK_vendor_collaborations_vendor2'
          ) THEN
            ALTER TABLE "vendor_collaborations" 
            ADD CONSTRAINT "FK_vendor_collaborations_vendor2" 
            FOREIGN KEY ("vendor_2_id") REFERENCES "vendors"("id") 
            ON DELETE CASCADE ON UPDATE NO ACTION;
          END IF;
        END $$;
      `);
    }

    // Create vendor_messages table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "vendor_messages" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "sender_id" uuid NOT NULL,
        "receiver_id" uuid NOT NULL,
        "message" text NOT NULL,
        "is_read" boolean NOT NULL DEFAULT false,
        "collaboration_id" uuid,
        "attachments" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_vendor_messages" PRIMARY KEY ("id")
      )
    `);

    // Create indexes for vendor_messages
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_vendor_messages_sender" ON "vendor_messages" ("sender_id")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_vendor_messages_receiver" ON "vendor_messages" ("receiver_id")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_vendor_messages_conversation" ON "vendor_messages" ("sender_id", "receiver_id")
    `);

    // Add foreign keys for vendor_messages
    await queryRunner.query(`
      ALTER TABLE "vendor_messages" 
      ADD CONSTRAINT "FK_vendor_messages_sender" 
      FOREIGN KEY ("sender_id") REFERENCES "vendors"("id") 
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "vendor_messages" 
      ADD CONSTRAINT "FK_vendor_messages_receiver" 
      FOREIGN KEY ("receiver_id") REFERENCES "vendors"("id") 
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // Create vendor_partnerships table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "vendor_partnerships" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "requester_id" uuid NOT NULL,
        "recipient_id" uuid NOT NULL,
        "partnership_type" character varying NOT NULL DEFAULT 'collaboration',
        "message" text NOT NULL,
        "status" character varying NOT NULL DEFAULT 'pending',
        "terms" jsonb,
        "accepted_at" TIMESTAMP,
        "declined_at" TIMESTAMP,
        "decline_reason" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_vendor_partnerships" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_vendor_partnerships_type" CHECK ("partnership_type" IN ('collaboration', 'supplier', 'distributor', 'joint_venture', 'other')),
        CONSTRAINT "CHK_vendor_partnerships_status" CHECK ("status" IN ('pending', 'accepted', 'declined', 'active', 'inactive'))
      )
    `);

    // Create indexes for vendor_partnerships
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_vendor_partnerships_requester" ON "vendor_partnerships" ("requester_id")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_vendor_partnerships_recipient" ON "vendor_partnerships" ("recipient_id")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_vendor_partnerships_status" ON "vendor_partnerships" ("status")
    `);

    // Add foreign keys for vendor_partnerships
    await queryRunner.query(`
      ALTER TABLE "vendor_partnerships" 
      ADD CONSTRAINT "FK_vendor_partnerships_requester" 
      FOREIGN KEY ("requester_id") REFERENCES "vendors"("id") 
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "vendor_partnerships" 
      ADD CONSTRAINT "FK_vendor_partnerships_recipient" 
      FOREIGN KEY ("recipient_id") REFERENCES "vendors"("id") 
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Note: This does NOT drop vendor_collaborations as it may have been created before this migration
    
    // Drop vendor_partnerships table
    await queryRunner.query(`
      ALTER TABLE "vendor_partnerships" DROP CONSTRAINT IF EXISTS "FK_vendor_partnerships_recipient"
    `);
    await queryRunner.query(`
      ALTER TABLE "vendor_partnerships" DROP CONSTRAINT IF EXISTS "FK_vendor_partnerships_requester"
    `);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_vendor_partnerships_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_vendor_partnerships_recipient"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_vendor_partnerships_requester"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "vendor_partnerships"`);

    // Drop vendor_messages table
    await queryRunner.query(`
      ALTER TABLE "vendor_messages" DROP CONSTRAINT IF EXISTS "FK_vendor_messages_receiver"
    `);
    await queryRunner.query(`
      ALTER TABLE "vendor_messages" DROP CONSTRAINT IF EXISTS "FK_vendor_messages_sender"
    `);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_vendor_messages_conversation"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_vendor_messages_receiver"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_vendor_messages_sender"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "vendor_messages"`);
  }
}
