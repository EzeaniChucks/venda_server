import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSubscriptionSystem1730732000000 implements MigrationInterface {
  name = 'AddSubscriptionSystem1730732000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create subscription_plans table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "subscription_plans" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tier" character varying NOT NULL UNIQUE,
        "name" character varying NOT NULL,
        "price" decimal(10,2) NOT NULL DEFAULT 0,
        "currency" character varying(3) NOT NULL DEFAULT 'NGN',
        "productLimit" integer NOT NULL,
        "promoFeatureEnabled" boolean NOT NULL DEFAULT false,
        "homepageVisibilityEnabled" boolean NOT NULL DEFAULT false,
        "description" text,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_subscription_plans" PRIMARY KEY ("id")
      )
    `);

    // Add new columns to vendor_subscriptions if they don't exist
    const planIdExists = await queryRunner.hasColumn('vendor_subscriptions', 'plan_id');
    if (!planIdExists) {
      await queryRunner.query(`ALTER TABLE "vendor_subscriptions" ADD COLUMN "plan_id" uuid`);
    }

    const paystackAuthCodeExists = await queryRunner.hasColumn('vendor_subscriptions', 'paystack_authorization_code');
    if (!paystackAuthCodeExists) {
      await queryRunner.query(`ALTER TABLE "vendor_subscriptions" ADD COLUMN "paystack_authorization_code" varchar`);
    }

    const paystackCustomerCodeExists = await queryRunner.hasColumn('vendor_subscriptions', 'paystack_customer_code');
    if (!paystackCustomerCodeExists) {
      await queryRunner.query(`ALTER TABLE "vendor_subscriptions" ADD COLUMN "paystack_customer_code" varchar`);
    }

    const paystackEmailExists = await queryRunner.hasColumn('vendor_subscriptions', 'paystack_email');
    if (!paystackEmailExists) {
      await queryRunner.query(`ALTER TABLE "vendor_subscriptions" ADD COLUMN "paystack_email" varchar`);
    }

    const failedAttemptsExists = await queryRunner.hasColumn('vendor_subscriptions', 'failed_payment_attempts');
    if (!failedAttemptsExists) {
      await queryRunner.query(`ALTER TABLE "vendor_subscriptions" ADD COLUMN "failed_payment_attempts" int NOT NULL DEFAULT 0`);
    }

    const lastAttemptExists = await queryRunner.hasColumn('vendor_subscriptions', 'last_payment_attempt');
    if (!lastAttemptExists) {
      await queryRunner.query(`ALTER TABLE "vendor_subscriptions" ADD COLUMN "last_payment_attempt" TIMESTAMP`);
    }

    const nextRetryExists = await queryRunner.hasColumn('vendor_subscriptions', 'next_retry_date');
    if (!nextRetryExists) {
      await queryRunner.query(`ALTER TABLE "vendor_subscriptions" ADD COLUMN "next_retry_date" TIMESTAMP`);
    }

    const cancelledAtExists = await queryRunner.hasColumn('vendor_subscriptions', 'cancelled_at');
    if (!cancelledAtExists) {
      await queryRunner.query(`ALTER TABLE "vendor_subscriptions" ADD COLUMN "cancelled_at" TIMESTAMP`);
    }

    // Update tier enum to include 'free'
    await queryRunner.query(`
      DO $$ 
      BEGIN
        ALTER TABLE "vendor_subscriptions" 
        DROP CONSTRAINT IF EXISTS "vendor_subscriptions_tier_check";
        
        ALTER TABLE "vendor_subscriptions" 
        ADD CONSTRAINT "vendor_subscriptions_tier_check" 
        CHECK ("tier" IN ('free', 'starter', 'pro', 'elite'));
      END $$;
    `);

    // Update status enum to include new statuses
    await queryRunner.query(`
      DO $$ 
      BEGIN
        ALTER TABLE "vendor_subscriptions" 
        DROP CONSTRAINT IF EXISTS "vendor_subscriptions_status_check";
        
        ALTER TABLE "vendor_subscriptions" 
        ADD CONSTRAINT "vendor_subscriptions_status_check" 
        CHECK ("status" IN ('active', 'expired', 'cancelled', 'pending', 'past_due', 'grace_period'));
      END $$;
    `);

    // Add foreign key for plan
    await queryRunner.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'FK_vendor_subscriptions_plan'
        ) THEN
          ALTER TABLE "vendor_subscriptions" 
          ADD CONSTRAINT "FK_vendor_subscriptions_plan" 
          FOREIGN KEY ("plan_id") REFERENCES "subscription_plans"("id") 
          ON DELETE SET NULL ON UPDATE NO ACTION;
        END IF;
      END $$;
    `);

    // Create subscription_invoices table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "subscription_invoices" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "vendorId" uuid NOT NULL,
        "subscriptionId" uuid NOT NULL,
        "invoiceNumber" character varying NOT NULL,
        "amount" decimal(10,2) NOT NULL,
        "currency" character varying(3) NOT NULL DEFAULT 'NGN',
        "status" character varying NOT NULL DEFAULT 'pending',
        "paystackReference" character varying,
        "paystackTransactionId" character varying,
        "paidAt" TIMESTAMP,
        "periodStart" TIMESTAMP NOT NULL,
        "periodEnd" TIMESTAMP NOT NULL,
        "description" text,
        "metadata" jsonb,
        "emailSent" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_subscription_invoices" PRIMARY KEY ("id"),
        CONSTRAINT "FK_subscription_invoices_vendor" FOREIGN KEY ("vendorId") 
          REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_subscription_invoices_subscription" FOREIGN KEY ("subscriptionId") 
          REFERENCES "vendor_subscriptions"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    // Create indexes
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_subscription_invoices_vendor" ON "subscription_invoices" ("vendorId")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_subscription_invoices_subscription" ON "subscription_invoices" ("subscriptionId")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_subscription_invoices_status" ON "subscription_invoices" ("status")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "subscription_invoices"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "subscription_plans"`);
    
    // Remove added columns
    await queryRunner.query(`ALTER TABLE "vendor_subscriptions" DROP COLUMN IF EXISTS "plan_id"`);
    await queryRunner.query(`ALTER TABLE "vendor_subscriptions" DROP COLUMN IF EXISTS "paystack_authorization_code"`);
    await queryRunner.query(`ALTER TABLE "vendor_subscriptions" DROP COLUMN IF EXISTS "paystack_customer_code"`);
    await queryRunner.query(`ALTER TABLE "vendor_subscriptions" DROP COLUMN IF EXISTS "paystack_email"`);
    await queryRunner.query(`ALTER TABLE "vendor_subscriptions" DROP COLUMN IF EXISTS "failed_payment_attempts"`);
    await queryRunner.query(`ALTER TABLE "vendor_subscriptions" DROP COLUMN IF EXISTS "last_payment_attempt"`);
    await queryRunner.query(`ALTER TABLE "vendor_subscriptions" DROP COLUMN IF EXISTS "next_retry_date"`);
    await queryRunner.query(`ALTER TABLE "vendor_subscriptions" DROP COLUMN IF EXISTS "cancelled_at"`);
  }
}
