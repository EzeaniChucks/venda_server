import { MigrationInterface, QueryRunner } from "typeorm";

export class MadeWalletTransactionMoreComprehensive1765776707978
  implements MigrationInterface
{
  name = "MadeWalletTransactionMoreComprehensive1765776707978";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "type"`);
    await queryRunner.query(`DROP TYPE "public"."transactions_type_enum"`);
    await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "purpose"`);
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD "wallet_id" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD "balance_before" numeric(10,2)`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD "balance_after" numeric(10,2)`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."transactions_transaction_type_enum" AS ENUM('wallet_funding', 'wallet_withdrawal', 'order_payment', 'refund', 'commission', 'transfer', 'wallet_payment')`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD "transaction_type" "public"."transactions_transaction_type_enum" NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD "description" text NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP COLUMN "description"`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP COLUMN "transaction_type"`
    );
    await queryRunner.query(
      `DROP TYPE "public"."transactions_transaction_type_enum"`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP COLUMN "balance_after"`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP COLUMN "balance_before"`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP COLUMN "wallet_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD "purpose" character varying NOT NULL`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."transactions_type_enum" AS ENUM('wallet_funding', 'wallet_withdrawal', 'order_payment', 'refund', 'commission', 'transfer')`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD "type" "public"."transactions_type_enum" NOT NULL`
    );
  }
}
