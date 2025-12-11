import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAgeCategoryColumeToProductEntity1764478442059
  implements MigrationInterface
{
  name = "AddAgeCategoryColumeToProductEntity1764478442059";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" ADD "ageCategory" character varying NOT NULL DEFAULT 'adult'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "ageCategory"`);
  }
}
