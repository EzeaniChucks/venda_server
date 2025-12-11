import { MigrationInterface, QueryRunner } from "typeorm";

export class MovedProfileImageFromVendorToVendorProfile1764948992324
  implements MigrationInterface
{
  name = "MovedProfileImageFromVendorToVendorProfile1764948992324";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "vendors" DROP COLUMN "avatar_url"`);
    await queryRunner.query(
      `ALTER TABLE "vendor_profiles" ADD "avatar_url" text`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vendor_profiles" DROP COLUMN "avatar_url"`
    );
    await queryRunner.query(`ALTER TABLE "vendors" ADD "avatar_url" text`);
  }
}
