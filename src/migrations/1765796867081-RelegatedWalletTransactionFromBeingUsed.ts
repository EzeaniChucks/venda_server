import { MigrationInterface, QueryRunner } from "typeorm";

export class RelegatedWalletTransactionFromBeingUsed1765796867081
  implements MigrationInterface
{
  name = "RelegatedWalletTransactionFromBeingUsed1765796867081";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, drop the existing foreign key constraint
    await queryRunner.query(
      `ALTER TABLE "payment_methods" DROP CONSTRAINT IF EXISTS "FK_d8d4eb6f793843b5ee65cc5dada"`
    );

    // Rename customer_id to owner_id (keep the data)
    await queryRunner.query(
      `ALTER TABLE "payment_methods" RENAME COLUMN "customer_id" TO "owner_id"`
    );

    // Add owner_type column with default 'customer' for existing records
    await queryRunner.query(
      `ALTER TABLE "payment_methods" ADD COLUMN "owner_type" character varying NOT NULL DEFAULT 'customer'`
    );

    // Remove the default after adding values
    await queryRunner.query(
      `ALTER TABLE "payment_methods" ALTER COLUMN "owner_type" DROP DEFAULT`
    );

    // Update rider coordinates precision
    await queryRunner.query(
      `ALTER TABLE "riders" ALTER COLUMN "latitude" TYPE numeric(10,7)`
    );
    await queryRunner.query(
      `ALTER TABLE "riders" ALTER COLUMN "longitude" TYPE numeric(10,7)`
    );

    // Since we can't have a single foreign key reference multiple tables,
    // we'll drop the foreign key constraint entirely for now.
    // The application logic will handle validation.
    // Alternatively, we can create a check constraint to ensure valid owner_type
    await queryRunner.query(
      `ALTER TABLE "payment_methods" ADD CONSTRAINT "chk_payment_methods_owner_type" CHECK (owner_type IN ('customer', 'vendor', 'rider'))`
    );

    // Note: We're NOT adding a foreign key constraint because owner_id
    // can reference customers, vendors, or riders.
    // Application-level validation will be required.
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the check constraint
    await queryRunner.query(
      `ALTER TABLE "payment_methods" DROP CONSTRAINT IF EXISTS "chk_payment_methods_owner_type"`
    );

    // Revert rider coordinates precision
    await queryRunner.query(
      `ALTER TABLE "riders" ALTER COLUMN "longitude" TYPE numeric(10,6)`
    );
    await queryRunner.query(
      `ALTER TABLE "riders" ALTER COLUMN "latitude" TYPE numeric(10,6)`
    );

    // Revert owner_type column
    await queryRunner.query(
      `ALTER TABLE "payment_methods" DROP COLUMN "owner_type"`
    );

    // Rename owner_id back to customer_id
    await queryRunner.query(
      `ALTER TABLE "payment_methods" RENAME COLUMN "owner_id" TO "customer_id"`
    );

    // Restore the foreign key constraint to customers
    await queryRunner.query(
      `ALTER TABLE "payment_methods" ADD CONSTRAINT "FK_d8d4eb6f793843b5ee65cc5dada" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }
}
