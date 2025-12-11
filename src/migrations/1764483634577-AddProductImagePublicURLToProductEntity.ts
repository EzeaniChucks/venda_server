import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProductImagePublicURLToProductEntity1764483634577
  implements MigrationInterface
{
  name = "AddProductImagePublicURLToProductEntity1764483634577";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" ADD "image_public_ids" text array`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" DROP COLUMN "image_public_ids"`
    );
  }
}
