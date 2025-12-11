"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const data_source_1 = require("../../config/data-source");
const VendorSubscription_1 = require("../../entities/VendorSubscription");
const typeorm_1 = require("typeorm");
const subscriptionService_1 = __importDefault(require("./subscriptionService"));
class RenewalCronService {
    constructor() {
        this.subscriptionRepository = data_source_1.AppDataSource.getRepository(VendorSubscription_1.VendorSubscription);
        this.isRunning = false;
    }
    start() {
        node_cron_1.default.schedule("0 2 * * *", async () => {
            if (this.isRunning) {
                console.log("⏭️  Renewal job already running, skipping...");
                return;
            }
            this.isRunning = true;
            console.log("🔄 Starting subscription renewal job...");
            try {
                await this.processRenewals();
                await this.processRetries();
                await this.processExpiredSubscriptions();
            }
            catch (error) {
                console.error("❌ Error in renewal job:", error);
            }
            finally {
                this.isRunning = false;
            }
        });
        console.log("✅ Subscription renewal cron job started (runs daily at 2 AM)");
    }
    async processRenewals() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(23, 59, 59, 999);
        const subscriptionsToRenew = await this.subscriptionRepository.find({
            where: {
                endDate: (0, typeorm_1.LessThan)(tomorrow),
                autoRenew: true,
                status: VendorSubscription_1.SubscriptionStatus.ACTIVE,
            },
            relations: ["plan"],
        });
        console.log(`📋 Found ${subscriptionsToRenew.length} subscriptions to renew`);
        for (const subscription of subscriptionsToRenew) {
            try {
                const result = await subscriptionService_1.default.renewSubscription(subscription);
                if (result.success) {
                    console.log(`✅ Renewed subscription ${subscription.id}`);
                }
                else {
                    console.log(`⚠️  Failed to renew subscription ${subscription.id}: ${result.error}`);
                }
            }
            catch (error) {
                console.error(`❌ Error renewing subscription ${subscription.id}:`, error.message);
            }
        }
    }
    async processRetries() {
        const now = new Date();
        const subscriptionsToRetry = await this.subscriptionRepository.find({
            where: {
                status: VendorSubscription_1.SubscriptionStatus.GRACE_PERIOD,
                nextRetryDate: (0, typeorm_1.LessThan)(now),
                autoRenew: true,
            },
            relations: ["plan"],
        });
        console.log(`🔁 Found ${subscriptionsToRetry.length} subscriptions to retry`);
        for (const subscription of subscriptionsToRetry) {
            try {
                const result = await subscriptionService_1.default.renewSubscription(subscription);
                if (result.success) {
                    console.log(`✅ Retry successful for subscription ${subscription.id}`);
                }
                else {
                    console.log(`⚠️  Retry failed for subscription ${subscription.id}: ${result.error}`);
                }
            }
            catch (error) {
                console.error(`❌ Error retrying subscription ${subscription.id}:`, error.message);
            }
        }
    }
    async processExpiredSubscriptions() {
        const now = new Date();
        const expiredSubscriptions = await this.subscriptionRepository.find({
            where: {
                endDate: (0, typeorm_1.LessThan)(now),
                status: (0, typeorm_1.In)([
                    VendorSubscription_1.SubscriptionStatus.ACTIVE,
                    VendorSubscription_1.SubscriptionStatus.GRACE_PERIOD,
                ]),
            },
        });
        console.log(`🕐 Found ${expiredSubscriptions.length} expired subscriptions`);
        for (const subscription of expiredSubscriptions) {
            try {
                await subscriptionService_1.default.createFreeSubscription(subscription.vendorId);
                console.log(`📅 Subscription ${subscription.id} expired and vendor ${subscription.vendorId} downgraded to free tier`);
            }
            catch (error) {
                console.error(`❌ Error downgrading vendor ${subscription.vendorId}:`, error.message);
            }
        }
    }
    async runNow() {
        if (this.isRunning) {
            console.log("Job already running");
            return;
        }
        this.isRunning = true;
        console.log("🔄 Running renewal job manually...");
        try {
            await this.processRenewals();
            await this.processRetries();
            await this.processExpiredSubscriptions();
            console.log("✅ Manual renewal job completed");
        }
        catch (error) {
            console.error("❌ Error in manual renewal job:", error);
        }
        finally {
            this.isRunning = false;
        }
    }
}
exports.default = new RenewalCronService();
//# sourceMappingURL=renewalCronService.js.map