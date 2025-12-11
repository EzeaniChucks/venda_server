"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddFCMPushTokenToEntities1763872408747 = void 0;
class AddFCMPushTokenToEntities1763872408747 {
    constructor() {
        this.name = 'AddFCMPushTokenToEntities1763872408747';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "riders" ADD "push_token" text`);
        await queryRunner.query(`ALTER TABLE "vendors" ADD "push_token" text`);
        await queryRunner.query(`ALTER TABLE "customers" ADD "push_token" text`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "push_token"`);
        await queryRunner.query(`ALTER TABLE "vendors" DROP COLUMN "push_token"`);
        await queryRunner.query(`ALTER TABLE "riders" DROP COLUMN "push_token"`);
    }
}
exports.AddFCMPushTokenToEntities1763872408747 = AddFCMPushTokenToEntities1763872408747;
//# sourceMappingURL=1763872408747-AddFCMPushTokenToEntities.js.map