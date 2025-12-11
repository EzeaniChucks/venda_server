import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedCityAndStateToAllEntities1765132316055 implements MigrationInterface {
    name = 'AddedCityAndStateToAllEntities1765132316055'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "riders" ADD "state" character varying`);
        await queryRunner.query(`ALTER TABLE "riders" ADD "city" character varying`);
        await queryRunner.query(`ALTER TABLE "riders" ADD "address" character varying`);
        await queryRunner.query(`ALTER TABLE "customers" ADD "state" character varying DEFAULT 'Abuja'`);
        await queryRunner.query(`ALTER TABLE "customers" ADD "city" character varying DEFAULT 'Wuse'`);
        await queryRunner.query(`ALTER TABLE "customers" ADD "latitude" numeric(10,7)`);
        await queryRunner.query(`ALTER TABLE "customers" ADD "longitude" numeric(10,7)`);
        await queryRunner.query(`ALTER TABLE "customers" ADD "address" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "address"`);
        await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "longitude"`);
        await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "latitude"`);
        await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "city"`);
        await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "state"`);
        await queryRunner.query(`ALTER TABLE "riders" DROP COLUMN "address"`);
        await queryRunner.query(`ALTER TABLE "riders" DROP COLUMN "city"`);
        await queryRunner.query(`ALTER TABLE "riders" DROP COLUMN "state"`);
    }

}
