"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelegatedWalletTransactionFromBeingUsed1765796867081 = void 0;
class RelegatedWalletTransactionFromBeingUsed1765796867081 {
    constructor() {
        this.name = "RelegatedWalletTransactionFromBeingUsed1765796867081";
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "payment_methods" DROP CONSTRAINT IF EXISTS "FK_d8d4eb6f793843b5ee65cc5dada"`);
        await queryRunner.query(`ALTER TABLE "payment_methods" RENAME COLUMN "customer_id" TO "owner_id"`);
        await queryRunner.query(`ALTER TABLE "payment_methods" ADD COLUMN "owner_type" character varying NOT NULL DEFAULT 'customer'`);
        await queryRunner.query(`ALTER TABLE "payment_methods" ALTER COLUMN "owner_type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "riders" ALTER COLUMN "latitude" TYPE numeric(10,7)`);
        await queryRunner.query(`ALTER TABLE "riders" ALTER COLUMN "longitude" TYPE numeric(10,7)`);
        await queryRunner.query(`ALTER TABLE "payment_methods" ADD CONSTRAINT "chk_payment_methods_owner_type" CHECK (owner_type IN ('customer', 'vendor', 'rider'))`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "payment_methods" DROP CONSTRAINT IF EXISTS "chk_payment_methods_owner_type"`);
        await queryRunner.query(`ALTER TABLE "riders" ALTER COLUMN "longitude" TYPE numeric(10,6)`);
        await queryRunner.query(`ALTER TABLE "riders" ALTER COLUMN "latitude" TYPE numeric(10,6)`);
        await queryRunner.query(`ALTER TABLE "payment_methods" DROP COLUMN "owner_type"`);
        await queryRunner.query(`ALTER TABLE "payment_methods" RENAME COLUMN "owner_id" TO "customer_id"`);
        await queryRunner.query(`ALTER TABLE "payment_methods" ADD CONSTRAINT "FK_d8d4eb6f793843b5ee65cc5dada" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
}
exports.RelegatedWalletTransactionFromBeingUsed1765796867081 = RelegatedWalletTransactionFromBeingUsed1765796867081;
//# sourceMappingURL=1765796867081-RelegatedWalletTransactionFromBeingUsed.js.map