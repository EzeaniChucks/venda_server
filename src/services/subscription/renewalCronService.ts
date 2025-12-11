import cron from "node-cron";
import { AppDataSource } from "../../config/data-source";
import {
  VendorSubscription,
  SubscriptionStatus,
} from "../../entities/VendorSubscription";
import { LessThan, In } from "typeorm";
import subscriptionService from "./subscriptionService";

class RenewalCronService {
  private subscriptionRepository =
    AppDataSource.getRepository(VendorSubscription);
  private isRunning = false;

  start() {
    // Run daily at 2 AM
    cron.schedule("0 2 * * *", async () => {
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
      } catch (error) {
        console.error("❌ Error in renewal job:", error);
      } finally {
        this.isRunning = false;
      }
    });

    console.log(
      "✅ Subscription renewal cron job started (runs daily at 2 AM)"
    );
  }

  private async processRenewals() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);

    const subscriptionsToRenew = await this.subscriptionRepository.find({
      where: {
        endDate: LessThan(tomorrow),
        autoRenew: true,
        status: SubscriptionStatus.ACTIVE,
      },
      relations: ["plan"],
    });

    console.log(
      `📋 Found ${subscriptionsToRenew.length} subscriptions to renew`
    );

    for (const subscription of subscriptionsToRenew) {
      try {
        const result = await subscriptionService.renewSubscription(
          subscription
        );
        if (result.success) {
          console.log(`✅ Renewed subscription ${subscription.id}`);
        } else {
          console.log(
            `⚠️  Failed to renew subscription ${subscription.id}: ${result.error}`
          );
        }
      } catch (error: any) {
        console.error(
          `❌ Error renewing subscription ${subscription.id}:`,
          error.message
        );
      }
    }
  }

  private async processRetries() {
    const now = new Date();

    const subscriptionsToRetry = await this.subscriptionRepository.find({
      where: {
        status: SubscriptionStatus.GRACE_PERIOD,
        nextRetryDate: LessThan(now),
        autoRenew: true,
      },
      relations: ["plan"],
    });

    console.log(
      `🔁 Found ${subscriptionsToRetry.length} subscriptions to retry`
    );

    for (const subscription of subscriptionsToRetry) {
      try {
        const result = await subscriptionService.renewSubscription(
          subscription
        );
        if (result.success) {
          console.log(
            `✅ Retry successful for subscription ${subscription.id}`
          );
        } else {
          console.log(
            `⚠️  Retry failed for subscription ${subscription.id}: ${result.error}`
          );
        }
      } catch (error: any) {
        console.error(
          `❌ Error retrying subscription ${subscription.id}:`,
          error.message
        );
      }
    }
  }

  private async processExpiredSubscriptions() {
    const now = new Date();

    const expiredSubscriptions = await this.subscriptionRepository.find({
      where: {
        endDate: LessThan(now),
        status: In([
          SubscriptionStatus.ACTIVE,
          SubscriptionStatus.GRACE_PERIOD,
        ]),
      },
    });

    console.log(
      `🕐 Found ${expiredSubscriptions.length} expired subscriptions`
    );

    for (const subscription of expiredSubscriptions) {
      // Don't manually mark as expired - let createFreeSubscription handle all state transitions atomically
      try {
        await subscriptionService.createFreeSubscription(subscription.vendorId);
        console.log(
          `📅 Subscription ${subscription.id} expired and vendor ${subscription.vendorId} downgraded to free tier`
        );
      } catch (error: any) {
        console.error(
          `❌ Error downgrading vendor ${subscription.vendorId}:`,
          error.message
        );
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
    } catch (error) {
      console.error("❌ Error in manual renewal job:", error);
    } finally {
      this.isRunning = false;
    }
  }
}

export default new RenewalCronService();
