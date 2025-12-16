"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../../config/data-source");
const Vendor_1 = require("../../entities/Vendor");
const VendorSubscription_1 = require("../../entities/VendorSubscription");
const SubscriptionPlan_1 = require("../../entities/SubscriptionPlan");
const SubscriptionInvoice_1 = require("../../entities/SubscriptionInvoice");
const bankservice_service_1 = __importDefault(require("../shared/bankservice.service"));
const emailService_1 = require("../emailService");
const transaction_service_1 = require("../shared/transaction.service");
class SubscriptionService {
    constructor() {
        this.subscriptionRepository = data_source_1.AppDataSource.getRepository(VendorSubscription_1.VendorSubscription);
        this.planRepository = data_source_1.AppDataSource.getRepository(SubscriptionPlan_1.SubscriptionPlan);
        this.invoiceRepository = data_source_1.AppDataSource.getRepository(SubscriptionInvoice_1.SubscriptionInvoice);
        this.vendorRepository = data_source_1.AppDataSource.getRepository(Vendor_1.Vendor);
    }
    async getPlans() {
        return await this.planRepository.find({ where: { isActive: true } });
    }
    async getPlanByTier(tier) {
        return await this.planRepository.findOne({
            where: { tier, isActive: true },
        });
    }
    async getVendorSubscription(vendorId) {
        const subscription = await this.subscriptionRepository.findOne({
            where: { vendorId },
            relations: ["plan"],
            order: { createdAt: "DESC" },
        });
        if (!subscription) {
            return await this.createFreeSubscription(vendorId);
        }
        const now = new Date();
        const endDate = new Date(subscription.endDate);
        const isExpired = endDate <= now;
        const isValid = (subscription.status === VendorSubscription_1.SubscriptionStatus.ACTIVE ||
            subscription.status === VendorSubscription_1.SubscriptionStatus.GRACE_PERIOD) &&
            !isExpired;
        if ((isExpired || !isValid) &&
            subscription.tier !== VendorSubscription_1.SubscriptionTier.FREE) {
            return await this.createFreeSubscription(vendorId);
        }
        return subscription;
    }
    async createFreeSubscription(vendorId) {
        const queryRunner = data_source_1.AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            await queryRunner.manager
                .createQueryBuilder(Vendor_1.Vendor, "vendor")
                .setLock("pessimistic_write")
                .where("vendor.id = :vendorId", { vendorId })
                .getOne();
            const currentTime = new Date();
            const existingActive = await queryRunner.manager.findOne(VendorSubscription_1.VendorSubscription, {
                where: {
                    vendorId,
                    status: VendorSubscription_1.SubscriptionStatus.ACTIVE,
                },
                order: { createdAt: "DESC" },
            });
            if (existingActive && existingActive.tier === VendorSubscription_1.SubscriptionTier.FREE) {
                await queryRunner.commitTransaction();
                return existingActive;
            }
            if (existingActive && new Date(existingActive.endDate) > currentTime) {
                await queryRunner.commitTransaction();
                return existingActive;
            }
            await queryRunner.manager
                .createQueryBuilder()
                .update(VendorSubscription_1.VendorSubscription)
                .set({
                status: VendorSubscription_1.SubscriptionStatus.EXPIRED,
                cancelledAt: new Date(),
            })
                .where("vendorId = :vendorId", { vendorId })
                .andWhere("status IN (:...statuses)", {
                statuses: [
                    VendorSubscription_1.SubscriptionStatus.ACTIVE,
                    VendorSubscription_1.SubscriptionStatus.GRACE_PERIOD,
                    VendorSubscription_1.SubscriptionStatus.PAST_DUE,
                ],
            })
                .execute();
            const freePlan = await this.getPlanByTier(SubscriptionPlan_1.PlanTier.FREE);
            if (!freePlan) {
                throw new Error("Free plan not found");
            }
            const now = new Date();
            const endDate = new Date();
            endDate.setFullYear(endDate.getFullYear() + 100);
            const subscription = queryRunner.manager.create(VendorSubscription_1.VendorSubscription, {
                vendorId,
                planId: freePlan.id,
                tier: VendorSubscription_1.SubscriptionTier.FREE,
                status: VendorSubscription_1.SubscriptionStatus.ACTIVE,
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
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async initializeSubscription(vendorId, tier) {
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
        const reference = bankservice_service_1.default.generateReference();
        const paymentData = await bankservice_service_1.default.initializeTransaction(vendor.email, plan.price, {
            vendor_id: vendorId,
            plan_id: plan.id,
            tier: plan.tier,
        });
        return {
            authorization_url: paymentData.data.authorization_url,
            reference: paymentData.data.reference,
        };
    }
    async verifyAndActivateSubscription(reference, vendorId) {
        const verificationData = await bankservice_service_1.default.verifyTransaction(reference);
        if (!verificationData.status ||
            verificationData.data.status !== "success") {
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
        const queryRunner = data_source_1.AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            await queryRunner.manager
                .createQueryBuilder(Vendor_1.Vendor, "vendor")
                .setLock("pessimistic_write")
                .where("vendor.id = :vendorId", { vendorId })
                .getOne();
            await queryRunner.manager
                .createQueryBuilder()
                .update(VendorSubscription_1.VendorSubscription)
                .set({
                status: VendorSubscription_1.SubscriptionStatus.CANCELLED,
                cancelledAt: new Date(),
            })
                .where("vendorId = :vendorId", { vendorId })
                .andWhere("status IN (:...statuses)", {
                statuses: [
                    VendorSubscription_1.SubscriptionStatus.ACTIVE,
                    VendorSubscription_1.SubscriptionStatus.GRACE_PERIOD,
                ],
            })
                .execute();
            const now = new Date();
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + 1);
            const tierMap = {
                [SubscriptionPlan_1.PlanTier.FREE]: VendorSubscription_1.SubscriptionTier.FREE,
                [SubscriptionPlan_1.PlanTier.STARTER]: VendorSubscription_1.SubscriptionTier.STARTER,
                [SubscriptionPlan_1.PlanTier.PRO]: VendorSubscription_1.SubscriptionTier.PRO,
                [SubscriptionPlan_1.PlanTier.ELITE]: VendorSubscription_1.SubscriptionTier.ELITE,
            };
            const subscription = queryRunner.manager.create(VendorSubscription_1.VendorSubscription, {
                vendorId,
                planId: plan.id,
                tier: tierMap[plan.tier],
                status: VendorSubscription_1.SubscriptionStatus.ACTIVE,
                amount: plan.price,
                itemLimit: plan.productLimit,
                hasPromoFeature: plan.promoFeatureEnabled,
                hasHomepageVisibility: plan.homepageVisibilityEnabled,
                startDate: now,
                endDate,
                autoRenew: true,
                paymentReference: reference,
                paystackAuthorizationCode: verificationData.data.authorization.authorization_code,
                paystackCustomerCode: verificationData.data.customer.customer_code,
                paystackEmail: verificationData.data.customer.email,
            });
            const savedSubscription = await queryRunner.manager.save(subscription);
            await queryRunner.commitTransaction();
            const invoice = await this.createInvoice(savedSubscription, reference, verificationData.data.id.toString());
            await this.createTransactionRecord(vendorId, plan.price, reference, savedSubscription.id, plan.tier, {
                activationDate: new Date().toISOString(),
                initialPayment: true,
                invoiceNumber: invoice.invoiceNumber,
            });
            await this.sendSubscriptionActivatedEmail(vendorId, plan);
            return savedSubscription;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async renewSubscription(subscription) {
        try {
            if (!subscription.paystackAuthorizationCode ||
                !subscription.paystackEmail) {
                throw new Error("No payment method on file");
            }
            const plan = await this.planRepository.findOne({
                where: { id: subscription.planId },
            });
            if (!plan) {
                throw new Error("Plan not found");
            }
            const reference = bankservice_service_1.default.generateReference();
            const chargeResult = await bankservice_service_1.default.chargeAuthorization(subscription.paystackAuthorizationCode, subscription.paystackEmail, plan.price, reference, {
                vendor_id: subscription.vendorId,
                plan_id: plan.id,
                renewal: true,
            });
            if (chargeResult.status && chargeResult.data.status === "success") {
                const newEndDate = new Date(subscription.endDate);
                newEndDate.setMonth(newEndDate.getMonth() + 1);
                subscription.endDate = newEndDate;
                subscription.status = VendorSubscription_1.SubscriptionStatus.ACTIVE;
                subscription.failedPaymentAttempts = 0;
                subscription.lastPaymentAttempt = new Date();
                subscription.nextRetryDate = undefined;
                await this.subscriptionRepository.save(subscription);
                await this.createInvoice(subscription, reference, chargeResult.data.id.toString());
                await this.createRenewalTransaction(subscription.vendorId, plan.price, reference, subscription.id, plan.tier);
                await this.sendRenewalReceiptEmail(subscription.vendorId, plan, reference);
                return { success: true };
            }
            else {
                throw new Error(chargeResult.message || "Payment failed");
            }
        }
        catch (error) {
            subscription.failedPaymentAttempts += 1;
            subscription.lastPaymentAttempt = new Date();
            if (subscription.failedPaymentAttempts >= 3) {
                subscription.status = VendorSubscription_1.SubscriptionStatus.PAST_DUE;
            }
            else {
                subscription.status = VendorSubscription_1.SubscriptionStatus.GRACE_PERIOD;
                const nextRetry = new Date();
                nextRetry.setDate(nextRetry.getDate() + 2);
                subscription.nextRetryDate = nextRetry;
            }
            await this.subscriptionRepository.save(subscription);
            await this.sendRenewalFailedEmail(subscription.vendorId);
            return { success: false, error: error.message };
        }
    }
    async cancelSubscription(vendorId) {
        const queryRunner = data_source_1.AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            await queryRunner.manager
                .createQueryBuilder(Vendor_1.Vendor, "vendor")
                .setLock("pessimistic_write")
                .where("vendor.id = :vendorId", { vendorId })
                .getOne();
            const subscription = await queryRunner.manager.findOne(VendorSubscription_1.VendorSubscription, {
                where: { vendorId },
                relations: ["plan"],
                order: { createdAt: "DESC" },
            });
            if (!subscription) {
                throw new Error("No active subscription found");
            }
            subscription.autoRenew = false;
            subscription.cancelledAt = new Date();
            const savedSubscription = await queryRunner.manager.save(subscription);
            await queryRunner.commitTransaction();
            return savedSubscription;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async upgradeSubscription(vendorId, newTier) {
        return await this.initializeSubscription(vendorId, newTier);
    }
    async createInvoice(subscription, reference, transactionId) {
        const invoiceNumber = `INV-${Date.now()}`;
        const invoice = this.invoiceRepository.create({
            vendorId: subscription.vendorId,
            subscriptionId: subscription.id,
            invoiceNumber,
            amount: subscription.amount,
            currency: "NGN",
            status: SubscriptionInvoice_1.InvoiceStatus.PAID,
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
    async sendSubscriptionActivatedEmail(vendorId, plan) {
        const vendor = await this.vendorRepository.findOne({
            where: { id: vendorId },
        });
        if (!vendor)
            return;
        await (0, emailService_1.sendEmail)({
            to: vendor.email,
            subject: "🎉 Subscription Activated - VENDA",
            html: `
        <h1>Welcome to ${plan.name}!</h1>
        <p>Your subscription has been activated successfully.</p>
        <p><strong>Plan Details:</strong></p>
        <ul>
          <li>Product Limit: ${plan.productLimit === -1 ? "Unlimited" : plan.productLimit}</li>
          <li>Promo Features: ${plan.promoFeatureEnabled ? "Enabled" : "Not included"}</li>
          <li>Homepage Visibility: ${plan.homepageVisibilityEnabled ? "Enabled" : "Not included"}</li>
        </ul>
        <p>Thank you for choosing VENDA!</p>
      `,
        });
    }
    async sendRenewalReceiptEmail(vendorId, plan, reference) {
        const vendor = await this.vendorRepository.findOne({
            where: { id: vendorId },
        });
        if (!vendor)
            return;
        await (0, emailService_1.sendEmail)({
            to: vendor.email,
            subject: "📄 Subscription Renewed - VENDA",
            html: `
        <h1>Subscription Renewed</h1>
        <p>Your ${plan.name} subscription has been renewed successfully.</p>
        <p><strong>Payment Details:</strong></p>
        <ul>
          <li>Amount: ₦${plan.price.toLocaleString()}</li>
          <li>Reference: ${reference}</li>
          <li>Next Billing Date: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</li>
        </ul>
      `,
        });
    }
    async sendRenewalFailedEmail(vendorId) {
        const vendor = await this.vendorRepository.findOne({
            where: { id: vendorId },
        });
        if (!vendor)
            return;
        await (0, emailService_1.sendEmail)({
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
    async createTransactionRecord(vendorId, amount, reference, subscriptionId, planTier, metadata = {}) {
        try {
            const vendor = await this.vendorRepository.findOne({
                where: { id: vendorId },
                select: ["id", "email", "businessName"],
            });
            if (!vendor) {
                console.warn(`Vendor not found for transaction: ${vendorId}`);
                return;
            }
            await transaction_service_1.TransactionService.createTransaction({
                entityId: vendorId,
                entityType: "vendor",
                amount,
                transactionType: "subscription_payment",
                reference,
                description: `Subscription payment: ${planTier} plan`,
                status: "completed",
                metadata: {
                    ...metadata,
                    subscriptionId,
                    planTier,
                    vendorName: vendor.businessName || vendor.email,
                    paymentType: "subscription",
                },
            });
            console.log(`Transaction recorded for subscription: ${reference}`);
        }
        catch (error) {
            console.error("Error creating transaction record:", error);
        }
    }
    async createRenewalTransaction(vendorId, amount, reference, subscriptionId, planTier) {
        return this.createTransactionRecord(vendorId, amount, reference, subscriptionId, planTier, {
            isRenewal: true,
            renewalDate: new Date().toISOString(),
        });
    }
    async getSubscriptionStats() {
        const [subscriptions, revenueResult] = await Promise.all([
            this.subscriptionRepository.find({
                where: { status: VendorSubscription_1.SubscriptionStatus.ACTIVE },
            }),
            this.invoiceRepository
                .createQueryBuilder("invoice")
                .select("SUM(invoice.amount)", "total")
                .where("invoice.status = :status", { status: SubscriptionInvoice_1.InvoiceStatus.PAID })
                .getRawOne(),
        ]);
        const tierDistribution = subscriptions.reduce((acc, sub) => {
            acc[sub.tier] = (acc[sub.tier] || 0) + 1;
            return acc;
        }, {});
        return {
            totalSubscriptions: subscriptions.length,
            activeSubscriptions: subscriptions.filter((s) => new Date(s.endDate) > new Date()).length,
            revenue: parseFloat(revenueResult?.total || "0"),
            tierDistribution,
        };
    }
    async getUpcomingRenewals(days = 7) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() + days);
        const subscriptions = await this.subscriptionRepository
            .createQueryBuilder("subscription")
            .leftJoinAndSelect("subscription.vendor", "vendor")
            .where("subscription.status = :status", {
            status: VendorSubscription_1.SubscriptionStatus.ACTIVE,
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
exports.default = new SubscriptionService();
//# sourceMappingURL=subscriptionService.js.map