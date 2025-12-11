"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckingProductsMigration1764337467329 = void 0;
class CheckingProductsMigration1764337467329 {
    constructor() {
        this.name = "CheckingProductsMigration1764337467329";
    }
    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "products" 
            ALTER COLUMN "images" TYPE text[] 
            USING CASE 
                WHEN images IS NULL THEN NULL 
                ELSE string_to_array(images, ',') 
            END
        `);
        await queryRunner.query(`
            ALTER TABLE "products" 
            ALTER COLUMN "styles_tags" TYPE text[] 
            USING CASE 
                WHEN styles_tags IS NULL THEN NULL 
                ELSE string_to_array(styles_tags, ',') 
            END
        `);
        await queryRunner.query(`
            ALTER TABLE "products" 
            ALTER COLUMN "sizes" TYPE text[] 
            USING CASE 
                WHEN sizes IS NULL THEN NULL 
                ELSE string_to_array(sizes, ',') 
            END
        `);
        await queryRunner.query(`
            ALTER TABLE "products" 
            ALTER COLUMN "colors" TYPE text[] 
            USING CASE 
                WHEN colors IS NULL THEN NULL 
                ELSE string_to_array(colors, ',') 
            END
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "products" 
            ALTER COLUMN "images" TYPE text 
            USING array_to_string(images, ',')
        `);
        await queryRunner.query(`
            ALTER TABLE "products" 
            ALTER COLUMN "styles_tags" TYPE text 
            USING array_to_string(styles_tags, ',')
        `);
        await queryRunner.query(`
            ALTER TABLE "products" 
            ALTER COLUMN "sizes" TYPE text 
            USING array_to_string(sizes, ',')
        `);
        await queryRunner.query(`
            ALTER TABLE "products" 
            ALTER COLUMN "colors" TYPE text 
            USING array_to_string(colors, ',')
        `);
    }
}
exports.CheckingProductsMigration1764337467329 = CheckingProductsMigration1764337467329;
//# sourceMappingURL=1764337467329-CheckingProductsMigration.js.map