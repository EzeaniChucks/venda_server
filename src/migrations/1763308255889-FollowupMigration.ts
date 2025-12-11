import { MigrationInterface, QueryRunner } from "typeorm";

export class FollowupMigration1763308255889 implements MigrationInterface {
  name = "FollowupMigration1763308255889";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "user_id"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "user_id" character varying`
    );
  }
}
