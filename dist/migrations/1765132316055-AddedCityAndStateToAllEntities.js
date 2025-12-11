"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddedCityAndStateToAllEntities1765132316055 = void 0;
class AddedCityAndStateToAllEntities1765132316055 {
    constructor() {
        this.name = 'AddedCityAndStateToAllEntities1765132316055';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "riders" ADD "state" character varying`);
        await queryRunner.query(`ALTER TABLE "riders" ADD "city" character varying`);
        await queryRunner.query(`ALTER TABLE "riders" ADD "address" character varying`);
        await queryRunner.query(`ALTER TABLE "customers" ADD "state" character varying DEFAULT 'Abuja'`);
        await queryRunner.query(`ALTER TABLE "customers" ADD "city" character varying DEFAULT 'Wuse'`);
        await queryRunner.query(`ALTER TABLE "customers" ADD "latitude" numeric(10,7)`);
        await queryRunner.query(`ALTER TABLE "customers" ADD "longitude" numeric(10,7)`);
        await queryRunner.query(`ALTER TABLE "customers" ADD "address" character varying`);
    }
    async down(queryRunner) {
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
exports.AddedCityAndStateToAllEntities1765132316055 = AddedCityAndStateToAllEntities1765132316055;
//# sourceMappingURL=1765132316055-AddedCityAndStateToAllEntities.js.map