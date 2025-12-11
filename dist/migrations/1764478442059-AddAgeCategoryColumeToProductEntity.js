"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddAgeCategoryColumeToProductEntity1764478442059 = void 0;
class AddAgeCategoryColumeToProductEntity1764478442059 {
    constructor() {
        this.name = "AddAgeCategoryColumeToProductEntity1764478442059";
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "products" ADD "ageCategory" character varying NOT NULL DEFAULT 'adult'`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "ageCategory"`);
    }
}
exports.AddAgeCategoryColumeToProductEntity1764478442059 = AddAgeCategoryColumeToProductEntity1764478442059;
//# sourceMappingURL=1764478442059-AddAgeCategoryColumeToProductEntity.js.map