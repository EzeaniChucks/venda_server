import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFCMPushTokenToEntities1763872408747 implements MigrationInterface {
    name = 'AddFCMPushTokenToEntities1763872408747'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "riders" ADD "push_token" text`);
        await queryRunner.query(`ALTER TABLE "vendors" ADD "push_token" text`);
        await queryRunner.query(`ALTER TABLE "customers" ADD "push_token" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "push_token"`);
        await queryRunner.query(`ALTER TABLE "vendors" DROP COLUMN "push_token"`);
        await queryRunner.query(`ALTER TABLE "riders" DROP COLUMN "push_token"`);
    }

}
