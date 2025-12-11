"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FollowupMigration1763308255889 = void 0;
class FollowupMigration1763308255889 {
    constructor() {
        this.name = "FollowupMigration1763308255889";
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "user_id"`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "orders" ADD "user_id" character varying`);
    }
}
exports.FollowupMigration1763308255889 = FollowupMigration1763308255889;
//# sourceMappingURL=1763308255889-FollowupMigration.js.map