"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FollowupMigration1763307341645 = void 0;
class FollowupMigration1763307341645 {
    constructor() {
        this.name = "FollowupMigration1763307341645";
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "vendor_profiles" DROP COLUMN "business_name"`);
        await queryRunner.query(`ALTER TABLE "vendor_profiles" ADD "business_name" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "categories" ADD "name" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878" UNIQUE ("name")`);
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "UQ_420d9f679d41281f282f5bc7d09"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "slug"`);
        await queryRunner.query(`ALTER TABLE "categories" ADD "slug" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "UQ_420d9f679d41281f282f5bc7d09" UNIQUE ("slug")`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "products" ADD "name" character varying NOT NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "products" ADD "name" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "UQ_420d9f679d41281f282f5bc7d09"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "slug"`);
        await queryRunner.query(`ALTER TABLE "categories" ADD "slug" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "UQ_420d9f679d41281f282f5bc7d09" UNIQUE ("slug")`);
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "categories" ADD "name" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878" UNIQUE ("name")`);
        await queryRunner.query(`ALTER TABLE "vendor_profiles" DROP COLUMN "business_name"`);
        await queryRunner.query(`ALTER TABLE "vendor_profiles" ADD "business_name" character varying(255) NOT NULL`);
    }
}
exports.FollowupMigration1763307341645 = FollowupMigration1763307341645;
//# sourceMappingURL=1763307341645-FollowupMigration.js.map