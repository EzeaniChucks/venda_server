"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddedDeviceOStoEntities1765172698334 = void 0;
class AddedDeviceOStoEntities1765172698334 {
    constructor() {
        this.name = "AddedDeviceOStoEntities1765172698334";
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "riders" DROP COLUMN "push_token"`);
        await queryRunner.query(`ALTER TABLE "vendors" DROP COLUMN "push_token"`);
        await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "push_token"`);
        await queryRunner.query(`ALTER TABLE "riders" ADD "fcm_token" text`);
        await queryRunner.query(`CREATE TYPE "public"."riders_device_os_enum" AS ENUM('ANDROID', 'IOS', 'WEB')`);
        await queryRunner.query(`ALTER TABLE "riders" ADD "device_os" "public"."riders_device_os_enum"`);
        await queryRunner.query(`ALTER TABLE "riders" ADD "fcm_token_updated_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "vendors" ADD "fcm_token" text`);
        await queryRunner.query(`CREATE TYPE "public"."vendors_device_os_enum" AS ENUM('ANDROID', 'IOS', 'WEB')`);
        await queryRunner.query(`ALTER TABLE "vendors" ADD "device_os" "public"."vendors_device_os_enum"`);
        await queryRunner.query(`ALTER TABLE "vendors" ADD "fcm_token_updated_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "customers" ADD "fcm_token" text`);
        await queryRunner.query(`CREATE TYPE "public"."customers_device_os_enum" AS ENUM('ANDROID', 'IOS', 'WEB')`);
        await queryRunner.query(`ALTER TABLE "customers" ADD "device_os" "public"."customers_device_os_enum"`);
        await queryRunner.query(`ALTER TABLE "customers" ADD "fcm_token_updated_at" TIMESTAMP`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "fcm_token_updated_at"`);
        await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "device_os"`);
        await queryRunner.query(`DROP TYPE "public"."customers_device_os_enum"`);
        await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "fcm_token"`);
        await queryRunner.query(`ALTER TABLE "vendors" DROP COLUMN "fcm_token_updated_at"`);
        await queryRunner.query(`ALTER TABLE "vendors" DROP COLUMN "device_os"`);
        await queryRunner.query(`DROP TYPE "public"."vendors_device_os_enum"`);
        await queryRunner.query(`ALTER TABLE "vendors" DROP COLUMN "fcm_token"`);
        await queryRunner.query(`ALTER TABLE "riders" DROP COLUMN "fcm_token_updated_at"`);
        await queryRunner.query(`ALTER TABLE "riders" DROP COLUMN "device_os"`);
        await queryRunner.query(`DROP TYPE "public"."riders_device_os_enum"`);
        await queryRunner.query(`ALTER TABLE "riders" DROP COLUMN "fcm_token"`);
        await queryRunner.query(`ALTER TABLE "customers" ADD "push_token" text`);
        await queryRunner.query(`ALTER TABLE "vendors" ADD "push_token" text`);
        await queryRunner.query(`ALTER TABLE "riders" ADD "push_token" text`);
    }
}
exports.AddedDeviceOStoEntities1765172698334 = AddedDeviceOStoEntities1765172698334;
//# sourceMappingURL=1765172698334-AddedDeviceOStoEntities.js.map