"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddProductImagePublicURLToProductEntity1764483634577 = void 0;
class AddProductImagePublicURLToProductEntity1764483634577 {
    constructor() {
        this.name = "AddProductImagePublicURLToProductEntity1764483634577";
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "products" ADD "image_public_ids" text array`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "image_public_ids"`);
    }
}
exports.AddProductImagePublicURLToProductEntity1764483634577 = AddProductImagePublicURLToProductEntity1764483634577;
//# sourceMappingURL=1764483634577-AddProductImagePublicURLToProductEntity.js.map