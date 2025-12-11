import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBankCodeToVendorProfileEntities1764945724593
  implements MigrationInterface
{
  name = "AddBankCodeToVendorProfileEntities1764945724593";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vendor_profiles" ADD "bank_code" character varying`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vendor_profiles" DROP COLUMN "bank_code"`
    );
  }
}
