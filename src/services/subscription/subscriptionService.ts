import { AppDataSource } from "../../config/data-source";
import { Vendor } from "../../entities/Vendor";
import {
  VendorSubscription,
  SubscriptionStatus,
  SubscriptionTier,
} from "../../entities/VendorSubscription";
import { SubscriptionPlan, PlanTier } from "../../entities/SubscriptionPlan";
import {
  SubscriptionInvoice,
  InvoiceStatus,
} from "../../entities/SubscriptionInvoice";
import bankService from "../shared/bankservice.service";
import { sendEmail } from "../emailService";
import { TransactionService } from "../shared/transaction.service";
import { TransactionStatus, TransactionType } from "../../entities";

class SubscriptionService {
  private subscriptionRepository =
    AppDataSource.getRepository(VendorSubscription);
  private planRepository = AppDataSource.getRepository(SubscriptionPlan);
  private invoiceRepository = AppDataSource.getRepository(SubscriptionInvoice);
  private vendorRepository = AppDataSource.getRepository(Vendor);

  async getPlans(): Promise<SubscriptionPlan[]> {
    return await this.planRepository.find({ where: { isActive: true } });
  }

  async getPlanByTier(tier: PlanTier): Promise<SubscriptionPlan | null> {
    return await this.planRepository.findOne({
      where: { tier, isActive: true },
    });
  }

  async getVendorSubscription(
    vendorId: string
  ): Promise<VendorSubscription | null> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { vendorId },
      relations: ["plan"],
      order: { createdAt: "DESC" },
    });

    // console.log("vendor subscription:", subscription, vendorId);

    if (!subscription) {
      // return null;
      return await this.createFreeSubscription(vendorId);
    }

    const now = new Date();
    const endDate = new Date(subscription.endDate);

    // Check if subscription has expired based on endDate or invalid status
    const isExpired = endDate <= now;
    const isValid =
      (subscription.status === SubscriptionStatus.ACTIVE ||
        subscription.status === SubscriptionStatus.GRACE_PERIOD) &&
      !isExpired;

    // If expired or invalid, downgrade to free tier
    // createFreeSubscription() handles ALL the state transitions atomically under vendor lock
    if (
      (isExpired || !isValid) &&
      subscription.tier !== SubscriptionTier.FREE
    ) {
      return await this.createFreeSubscription(vendorId);
    }

    return subscription;
  }

  async createFreeSubscription(vendorId: string): Promise<VendorSubscription> {
    // Use transaction with vendor-level locking to ensure atomicity
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Lock the vendor row to serialize all subscription operations for this vendor
      await queryRunner.manager
        .createQueryBuilder(Vendor, "vendor")
        .setLock("pessimistic_write")
        .where("vendor.id = :vendorId", { vendorId })
        .getOne();

      // Re-validate: Check if there's an active subscription and whether it's actually expired
      const currentTime = new Date();
      const existingActive = await queryRunner.manager.findOne(
        VendorSubscription,
        {
          where: {
            vendorId,
            status: SubscriptionStatus.ACTIVE,
          },
          order: { createdAt: "DESC" },
        }
      );

      // If there's already an active free subscription, return it
      if (existingActive && existingActive.tier === SubscriptionTier.FREE) {
        await queryRunner.commitTransaction();
        return existingActive;
      }

      // If there's an active PAID subscription that hasn't expired, abort downgrade
      // (Another transaction must have just activated it)
      if (existingActive && new Date(existingActive.endDate) > currentTime) {
        await queryRunner.commitTransaction();
        return existingActive;
      }

      // Cancel ALL expired or invalid active subscriptions
      await queryRunner.manager
        .createQueryBuilder()
        .update(VendorSubscription)
        .set({
          status: SubscriptionStatus.EXPIRED,
          cancelledAt: new Date(),
        })
        .where("vendorId = :vendorId", { vendorId })
        .andWhere("status IN (:...statuses)", {
          statuses: [
            SubscriptionStatus.ACTIVE,
            SubscriptionStatus.GRACE_PERIOD,
            SubscriptionStatus.PAST_DUE,
          ],
        })
        .execute();

      const freePlan = await this.getPlanByTier(PlanTier.FREE);
      if (!freePlan) {
        throw new Error("Free plan not found");
      }

      const now = new Date();
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 100);

      const subscription = queryRunner.manager.create(VendorSubscription, {
        vendorId,
        planId: freePlan.id,
        tier: SubscriptionTier.FREE,
        status: SubscriptionStatus.ACTIVE,
        amount: 0,
        itemLimit: freePlan.productLimit,
        hasPromoFeature: false,
        hasHomepageVisibility: false,
        startDate: now,
        endDate,
        autoRenew: false,
      });

      const savedSubscription = await queryRunner.manager.save(subscription);
      await queryRunner.commitTransaction();
      return savedSubscription;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async initializeSubscription(
    vendorId: string,
    tier: PlanTier
  ): Promise<{ authorization_url: string; reference: string }> {
    const vendor = await this.vendorRepository.findOne({
      where: { id: vendorId },
    });
    if (!vendor) {
      throw new Error("Vendor not found");
    }

    const plan = await this.getPlanByTier(tier);
    if (!plan) {
      throw new Error("Subscription plan not found");
    }

    if (plan.price === 0) {
      throw new Error("Cannot initialize payment for free plan");
    }

    const reference = bankService.generateReference();

    const paymentData = await bankService.initializeTransaction(
      vendor.email,
      plan.price,
      {
        vendor_id: vendorId,
        plan_id: plan.id,
        tier: plan.tier,
      }
    );

    return {
      authorization_url: paymentData.data.authorization_url,
      reference: paymentData.data.reference,
    };
  }

  async verifyAndActivateSubscription(
    reference: string,
    vendorId: string
  ): Promise<VendorSubscription> {
    const verificationData = await bankService.verifyTransaction(reference);

    if (
      !verificationData.status ||
      verificationData.data.status !== "success"
    ) {
      throw new Error("Payment verification failed");
    }

    const planId = verificationData.data.metadata?.plan_id;
    if (!planId) {
      throw new Error("Plan ID not found in payment metadata");
    }

    const plan = await this.planRepository.findOne({ where: { id: planId } });
    if (!plan) {
      throw new Error("Plan not found");
    }

    // Use transaction with vendor-level locking to prevent race conditions
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Lock the vendor row to serialize all subscription operations
      await queryRunner.manager
        .createQueryBuilder(Vendor, "vendor")
        .setLock("pessimistic_write")
        .where("vendor.id = :vendorId", { vendorId })
        .getOne();

      // Deactivate ALL active subscriptions for this vendor
      await queryRunner.manager
        .createQueryBuilder()
        .update(VendorSubscription)
        .set({
          status: SubscriptionStatus.CANCELLED,
          cancelledAt: new Date(),
        })
        .where("vendorId = :vendorId", { vendorId })
        .andWhere("status IN (:...statuses)", {
          statuses: [
            SubscriptionStatus.ACTIVE,
            SubscriptionStatus.GRACE_PERIOD,
          ],
        })
        .execute();

      // Create new subscription
      const now = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      const tierMap: Record<PlanTier, SubscriptionTier> = {
        [PlanTier.FREE]: SubscriptionTier.FREE,
        [PlanTier.STARTER]: SubscriptionTier.STARTER,
        [PlanTier.PRO]: SubscriptionTier.PRO,
        [PlanTier.ELITE]: SubscriptionTier.ELITE,
      };

      const subscription = queryRunner.manager.create(VendorSubscription, {
        vendorId,
        planId: plan.id,
        tier: tierMap[plan.tier],
        status: SubscriptionStatus.ACTIVE,
        amount: plan.price,
        itemLimit: plan.productLimit,
        hasPromoFeature: plan.promoFeatureEnabled,
        hasHomepageVisibility: plan.homepageVisibilityEnabled,
        startDate: now,
        endDate,
        autoRenew: true,
        paymentReference: reference,
        paystackAuthorizationCode:
          verificationData.data.authorization.authorization_code,
        paystackCustomerCode: verificationData.data.customer.customer_code,
        paystackEmail: verificationData.data.customer.email,
      });

      const savedSubscription = await queryRunner.manager.save(subscription);
      await queryRunner.commitTransaction();

      // Create invoice (outside transaction as it's not critical for atomicity)
      const invoice = await this.createInvoice(
        savedSubscription,
        reference,
        verificationData.data.id.toString()
      );

      await this.createTransactionRecord(
        vendorId,
        plan.price,
        reference,
        savedSubscription.id,
        plan.tier,
        {
          activationDate: new Date().toISOString(),
          initialPayment: true,
          invoiceNumber: invoice.invoiceNumber,
        }
      );

      // Send confirmation email
      await this.sendSubscriptionActivatedEmail(vendorId, plan);

      return savedSubscription;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async renewSubscription(
    subscription: VendorSubscription
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (
        !subscription.paystackAuthorizationCode ||
        !subscription.paystackEmail
      ) {
        throw new Error("No payment method on file");
      }

      const plan = await this.planRepository.findOne({
        where: { id: subscription.planId },
      });
      if (!plan) {
        throw new Error("Plan not found");
      }

      const reference = bankService.generateReference();

      const chargeResult = await bankService.chargeAuthorization(
        subscription.paystackAuthorizationCode,
        subscription.paystackEmail,
        plan.price,
        reference,
        {
          vendor_id: subscription.vendorId,
          plan_id: plan.id,
          renewal: true,
        }
      );

      if (chargeResult.status && chargeResult.data.status === "success") {
        // Update subscription
        const newEndDate = new Date(subscription.endDate);
        newEndDate.setMonth(newEndDate.getMonth() + 1);

        subscription.endDate = newEndDate;
        subscription.status = SubscriptionStatus.ACTIVE;
        subscription.failedPaymentAttempts = 0;
        subscription.lastPaymentAttempt = new Date();
        subscription.nextRetryDate = undefined;

        await this.subscriptionRepository.save(subscription);

        // Create invoice
        await this.createInvoice(
          subscription,
          reference,
          chargeResult.data.id.toString()
        );

        // In renewSubscription method, add after creating invoice (around line 280):
        await this.createRenewalTransaction(
          subscription.vendorId,
          plan.price,
          reference,
          subscription.id,
          plan.tier
        );
        // Send receipt email
        await this.sendRenewalReceiptEmail(
          subscription.vendorId,
          plan,
          reference
        );

        return { success: true };
      } else {
        throw new Error(chargeResult.message || "Payment failed");
      }
    } catch (error: any) {
      subscription.failedPaymentAttempts += 1;
      subscription.lastPaymentAttempt = new Date();

      if (subscription.failedPaymentAttempts >= 3) {
        subscription.status = SubscriptionStatus.PAST_DUE;
      } else {
        subscription.status = SubscriptionStatus.GRACE_PERIOD;
        const nextRetry = new Date();
        nextRetry.setDate(nextRetry.getDate() + 2); // Retry in 2 days
        subscription.nextRetryDate = nextRetry;
      }

      await this.subscriptionRepository.save(subscription);
      await this.sendRenewalFailedEmail(subscription.vendorId);

      return { success: false, error: error.message };
    }
  }

  async cancelSubscription(vendorId: string): Promise<VendorSubscription> {
    // Use transaction with vendor-level locking
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Lock the vendor row
      await queryRunner.manager
        .createQueryBuilder(Vendor, "vendor")
        .setLock("pessimistic_write")
        .where("vendor.id = :vendorId", { vendorId })
        .getOne();

      const subscription = await queryRunner.manager.findOne(
        VendorSubscription,
        {
          where: { vendorId },
          relations: ["plan"],
          order: { createdAt: "DESC" },
        }
      );

      if (!subscription) {
        throw new Error("No active subscription found");
      }

      // Turn off auto-renewal but keep subscription active until end of period
      subscription.autoRenew = false;
      subscription.cancelledAt = new Date();
      // Keep status as ACTIVE until endDate, then cron will expire it

      const savedSubscription = await queryRunner.manager.save(subscription);
      await queryRunner.commitTransaction();
      return savedSubscription;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async upgradeSubscription(
    vendorId: string,
    newTier: PlanTier
  ): Promise<{ authorization_url: string; reference: string }> {
    return await this.initializeSubscription(vendorId, newTier);
  }

  private async createInvoice(
    subscription: VendorSubscription,
    reference: string,
    transactionId: string
  ): Promise<SubscriptionInvoice> {
    const invoiceNumber = `INV-${Date.now()}`;

    const invoice = this.invoiceRepository.create({
      vendorId: subscription.vendorId,
      subscriptionId: subscription.id,
      invoiceNumber,
      amount: subscription.amount,
      currency: "NGN",
      status: InvoiceStatus.PAID,
      paystackReference: reference,
      paystackTransactionId: transactionId,
      paidAt: new Date(),
      periodStart: subscription.startDate,
      periodEnd: subscription.endDate,
      description: `Subscription: ${subscription.tier} plan`,
      emailSent: false,
    });

    return await this.invoiceRepository.save(invoice);
  }

  private async sendSubscriptionActivatedEmail(
    vendorId: string,
    plan: SubscriptionPlan
  ) {
    const vendor = await this.vendorRepository.findOne({
      where: { id: vendorId },
    });
    if (!vendor) return;

    await sendEmail({
      to: vendor.email,
      subject: "🎉 Subscription Activated - VENDA",
      html: `
        <h1>Welcome to ${plan.name}!</h1>
        <p>Your subscription has been activated successfully.</p>
        <p><strong>Plan Details:</strong></p>
        <ul>
          <li>Product Limit: ${
            plan.productLimit === -1 ? "Unlimited" : plan.productLimit
          }</li>
          <li>Promo Features: ${
            plan.promoFeatureEnabled ? "Enabled" : "Not included"
          }</li>
          <li>Homepage Visibility: ${
            plan.homepageVisibilityEnabled ? "Enabled" : "Not included"
          }</li>
        </ul>
        <p>Thank you for choosing VENDA!</p>
      `,
    });
  }

  private async sendRenewalReceiptEmail(
    vendorId: string,
    plan: SubscriptionPlan,
    reference: string
  ) {
    const vendor = await this.vendorRepository.findOne({
      where: { id: vendorId },
    });
    if (!vendor) return;

    await sendEmail({
      to: vendor.email,
      subject: "📄 Subscription Renewed - VENDA",
      html: `
        <h1>Subscription Renewed</h1>
        <p>Your ${plan.name} subscription has been renewed successfully.</p>
        <p><strong>Payment Details:</strong></p>
        <ul>
          <li>Amount: ₦${plan.price.toLocaleString()}</li>
          <li>Reference: ${reference}</li>
          <li>Next Billing Date: ${new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toLocaleDateString()}</li>
        </ul>
      `,
    });
  }

  private async sendRenewalFailedEmail(vendorId: string) {
    const vendor = await this.vendorRepository.findOne({
      where: { id: vendorId },
    });
    if (!vendor) return;

    await sendEmail({
      to: vendor.email,
      subject: "⚠️ Subscription Renewal Failed - VENDA",
      html: `
        <h1>Subscription Renewal Failed</h1>
        <p>We were unable to process your subscription renewal.</p>
        <p>Please update your payment method to continue enjoying your subscription benefits.</p>
        <p>If payment is not received within 3 days, your subscription will be downgraded to the Free tier.</p>
      `,
    });
  }

  private async createTransactionRecord(
    vendorId: string,
    amount: number,
    reference: string,
    subscriptionId: string,
    planTier: string,
    metadata: any = {}
  ) {
    try {
      const vendor = await this.vendorRepository.findOne({
        where: { id: vendorId },
        select: ["id", "email", "businessName"],
      });

      if (!vendor) {
        console.warn(`Vendor not found for transaction: ${vendorId}`);
        return;
      }

      await TransactionService.createTransaction({
        entityId: vendorId,
        entityType: "vendor",
        amount,
        transactionType: "subscription_payment" as TransactionType,
        reference,
        description: `Subscription payment: ${planTier} plan`,
        status: "completed" as TransactionStatus,
        metadata: {
          ...metadata,
          subscriptionId,
          planTier,
          vendorName: vendor.businessName || vendor.email,
          paymentType: "subscription",
        },
      });

      console.log(`Transaction recorded for subscription: ${reference}`);
    } catch (error) {
      console.error("Error creating transaction record:", error);
      // Don't throw - transaction logging shouldn't break the main flow
    }
  }

  /**
   * Create transaction for subscription renewal
   */
  private async createRenewalTransaction(
    vendorId: string,
    amount: number,
    reference: string,
    subscriptionId: string,
    planTier: string
  ) {
    return this.createTransactionRecord(
      vendorId,
      amount,
      reference,
      subscriptionId,
      planTier,
      {
        isRenewal: true,
        renewalDate: new Date().toISOString(),
      }
    );
  }

  //THESE methods ARE FOR admin/dashboard use

  /**
   * Get subscription statistics for admin dashboard
   */
  async getSubscriptionStats(): Promise<{
    totalSubscriptions: number;
    activeSubscriptions: number;
    revenue: number;
    tierDistribution: Record<SubscriptionTier, number>;
  }> {
    const [subscriptions, revenueResult] = await Promise.all([
      this.subscriptionRepository.find({
        where: { status: SubscriptionStatus.ACTIVE },
      }),
      this.invoiceRepository
        .createQueryBuilder("invoice")
        .select("SUM(invoice.amount)", "total")
        .where("invoice.status = :status", { status: InvoiceStatus.PAID })
        .getRawOne(),
    ]);

    const tierDistribution = subscriptions.reduce((acc, sub) => {
      acc[sub.tier] = (acc[sub.tier] || 0) + 1;
      return acc;
    }, {} as Record<SubscriptionTier, number>);

    return {
      totalSubscriptions: subscriptions.length,
      activeSubscriptions: subscriptions.filter(
        (s) => new Date(s.endDate) > new Date()
      ).length,
      revenue: parseFloat(revenueResult?.total || "0"),
      tierDistribution,
    };
  }
  /**
   * Get upcoming renewals (for admin dashboard)
   */
  async getUpcomingRenewals(days: number = 7): Promise<
    Array<{
      vendorId: string;
      vendorEmail: string;
      vendorName: string;
      subscriptionId: string;
      tier: SubscriptionTier;
      endDate: Date;
      amount: number;
      autoRenew: boolean;
    }>
  > {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);

    const subscriptions = await this.subscriptionRepository
      .createQueryBuilder("subscription")
      .leftJoinAndSelect("subscription.vendor", "vendor")
      .where("subscription.status = :status", {
        status: SubscriptionStatus.ACTIVE,
      })
      .andWhere("subscription.endDate BETWEEN :now AND :cutoff", {
        now: new Date(),
        cutoff: cutoffDate,
      })
      .orderBy("subscription.endDate", "ASC")
      .getMany();

    return subscriptions.map((sub) => ({
      vendorId: sub.vendorId,
      vendorEmail: sub.vendor?.email || "",
      vendorName: sub.vendor?.businessName || "",
      subscriptionId: sub.id,
      tier: sub.tier,
      endDate: sub.endDate,
      amount: sub.amount,
      autoRenew: sub.autoRenew,
    }));
  }
}

export default new SubscriptionService();
