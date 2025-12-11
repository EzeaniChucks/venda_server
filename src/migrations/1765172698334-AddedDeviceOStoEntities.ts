import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedDeviceOStoEntities1765172698334
  implements MigrationInterface
{
  name = "AddedDeviceOStoEntities1765172698334";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "riders" DROP COLUMN "push_token"`);
    await queryRunner.query(`ALTER TABLE "vendors" DROP COLUMN "push_token"`);
    await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "push_token"`);
    await queryRunner.query(`ALTER TABLE "riders" ADD "fcm_token" text`);
    await queryRunner.query(
      `CREATE TYPE "public"."riders_device_os_enum" AS ENUM('ANDROID', 'IOS', 'WEB')`
    );
    await queryRunner.query(
      `ALTER TABLE "riders" ADD "device_os" "public"."riders_device_os_enum"`
    );
    await queryRunner.query(
      `ALTER TABLE "riders" ADD "fcm_token_updated_at" TIMESTAMP`
    );
    await queryRunner.query(`ALTER TABLE "vendors" ADD "fcm_token" text`);
    await queryRunner.query(
      `CREATE TYPE "public"."vendors_device_os_enum" AS ENUM('ANDROID', 'IOS', 'WEB')`
    );
    await queryRunner.query(
      `ALTER TABLE "vendors" ADD "device_os" "public"."vendors_device_os_enum"`
    );
    await queryRunner.query(
      `ALTER TABLE "vendors" ADD "fcm_token_updated_at" TIMESTAMP`
    );
    await queryRunner.query(`ALTER TABLE "customers" ADD "fcm_token" text`);
    await queryRunner.query(
      `CREATE TYPE "public"."customers_device_os_enum" AS ENUM('ANDROID', 'IOS', 'WEB')`
    );
    await queryRunner.query(
      `ALTER TABLE "customers" ADD "device_os" "public"."customers_device_os_enum"`
    );
    await queryRunner.query(
      `ALTER TABLE "customers" ADD "fcm_token_updated_at" TIMESTAMP`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "customers" DROP COLUMN "fcm_token_updated_at"`
    );
    await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "device_os"`);
    await queryRunner.query(`DROP TYPE "public"."customers_device_os_enum"`);
    await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "fcm_token"`);
    await queryRunner.query(
      `ALTER TABLE "vendors" DROP COLUMN "fcm_token_updated_at"`
    );
    await queryRunner.query(`ALTER TABLE "vendors" DROP COLUMN "device_os"`);
    await queryRunner.query(`DROP TYPE "public"."vendors_device_os_enum"`);
    await queryRunner.query(`ALTER TABLE "vendors" DROP COLUMN "fcm_token"`);
    await queryRunner.query(
      `ALTER TABLE "riders" DROP COLUMN "fcm_token_updated_at"`
    );
    await queryRunner.query(`ALTER TABLE "riders" DROP COLUMN "device_os"`);
    await queryRunner.query(`DROP TYPE "public"."riders_device_os_enum"`);
    await queryRunner.query(`ALTER TABLE "riders" DROP COLUMN "fcm_token"`);
    await queryRunner.query(`ALTER TABLE "customers" ADD "push_token" text`);
    await queryRunner.query(`ALTER TABLE "vendors" ADD "push_token" text`);
    await queryRunner.query(`ALTER TABLE "riders" ADD "push_token" text`);
  }
}
