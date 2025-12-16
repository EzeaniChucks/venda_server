"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const data_source_1 = require("../../config/data-source");
const Customer_1 = require("../../entities/Customer");
const Vendor_1 = require("../../entities/Vendor");
const Rider_1 = require("../../entities/Rider");
const PaymentMethod_1 = require("../../entities/PaymentMethod");
const transaction_service_1 = require("./transaction.service");
const paystack_1 = require("../../config/paystack");
const uuid_1 = require("uuid");
const crypto_1 = __importDefault(require("crypto"));
class PaymentService {
    static async initializePayment(params) {
        const { entityId, entityType, amount, purpose, email, type, metadata } = params;
        const reference = `VENDA-${type.toUpperCase()}-${(0, uuid_1.v4)()}`;
        const paymentData = await (0, paystack_1.initializePayment)({
            email,
            amount,
            reference,
            entityType,
            entityId,
            purpose,
            callbackUrl: this.getCallbackUrl(type),
        });
        let transactionType;
        switch (type) {
            case "wallet_funding":
                transactionType = "wallet_funding";
                break;
            case "order_payment":
                transactionType = "order_payment";
                break;
            case "service_payment":
                transactionType = "commission";
                break;
            default:
                transactionType = "wallet_funding";
        }
        await transaction_service_1.TransactionService.createTransaction({
            entityId,
            entityType,
            amount,
            transactionType,
            reference,
            description: purpose,
            status: "pending",
            metadata: {
                entityType,
                entityId,
                paymentType: type,
                paystackReference: reference,
                ...metadata,
            },
        });
        return {
            authorizationUrl: paymentData.data.authorization_url,
            accessCode: paymentData.data.access_code,
            reference: paymentData.data.reference,
        };
    }
    static async registerFrontendPayment(req, params) {
        const { reference, entityId, entityType, amount, purpose, type, email, metadata = {}, currency = "NGN", expectedAmount, } = params;
        if (!reference ||
            !entityId ||
            !entityType ||
            !amount ||
            !purpose ||
            !type) {
            throw new Error("Missing required parameters");
        }
        if (amount <= 0) {
            throw new Error("Amount must be greater than 0");
        }
        if (expectedAmount && expectedAmount !== amount) {
            throw new Error("Amount mismatch with expected amount");
        }
        let transaction = await transaction_service_1.TransactionService.getTransactionByReference(reference);
        if (transaction) {
            if (transaction.entityId !== entityId ||
                transaction.entityType !== entityType) {
                console.warn(`Security alert: Registration data mismatch for reference ${reference}`);
                throw new Error("Payment registration data mismatch. Please contact support.");
            }
            return {
                success: true,
                message: "Payment already registered",
                data: {
                    transactionId: transaction.id,
                    reference: transaction.reference,
                    status: transaction.status,
                    amount: transaction.amount,
                    entityId: transaction.entityId,
                    entityType: transaction.entityType,
                    paymentType: transaction.metadata?.paymentType || type,
                    createdAt: transaction.createdAt,
                    metadata: transaction.metadata,
                },
            };
        }
        const transactionType = this.mapPaymentTypeToTransactionType(type);
        transaction = await transaction_service_1.TransactionService.createTransaction({
            entityId,
            entityType,
            amount,
            transactionType,
            reference,
            description: purpose,
            status: "pending",
            metadata: {
                entityType,
                entityId,
                paymentType: type,
                currency,
                customerEmail: email,
                initializedFrom: "frontend",
                purpose,
                registeredAt: new Date().toISOString(),
                registeredIp: this.getClientIP(req),
                userAgent: this.getUserAgent(req),
                ...metadata,
            },
        });
        return {
            success: true,
            message: "Payment registered successfully",
            data: {
                transactionId: transaction.id,
                reference: transaction.reference,
                status: transaction.status,
                amount: transaction.amount,
                entityId: transaction.entityId,
                entityType: transaction.entityType,
                paymentType: type,
                createdAt: transaction.createdAt,
                metadata: transaction.metadata,
            },
        };
    }
    static mapPaymentTypeToTransactionType(paymentType) {
        const map = {
            wallet_funding: "wallet_funding",
            order_payment: "order_payment",
            service_payment: "commission",
            subscription: "subscription",
            donation: "donation",
            other: "other",
        };
        return map[paymentType] || "other";
    }
    static async verifyPayment(reference) {
        const verificationData = await (0, paystack_1.verifyPayment)(reference);
        if (!verificationData.status) {
            throw new Error("Payment verification failed");
        }
        const paymentInfo = verificationData.data;
        let transaction = await transaction_service_1.TransactionService.getTransactionByReference(reference);
        if (!transaction) {
            const metadata = paymentInfo.metadata || {};
            throw new Error("Transaction not found. Please register payment first or ensure metadata is properly set.");
        }
        if (transaction.status === "completed") {
            return {
                message: "Payment already processed",
                data: paymentInfo,
            };
        }
        const { entityType, entityId } = transaction;
        if (!entityType || !entityId) {
            throw new Error("Invalid transaction metadata. Missing entity information.");
        }
        if (paymentInfo.status === "success") {
            await this.handleSuccessfulPayment(paymentInfo, transaction, entityType, entityId);
        }
        else {
            await this.handleFailedPayment(transaction);
            throw new Error("Payment was not successful");
        }
        return {
            amount: paymentInfo.amount / 100,
            reference: paymentInfo.reference,
            status: paymentInfo.status,
            transactionId: transaction.id,
            entityType,
            entityId,
        };
    }
    static async chargeSavedPaymentMethod(params) {
        const { entityId, entityType, amount, paymentMethodId, purpose } = params;
        const paymentMethod = await data_source_1.AppDataSource.getRepository(PaymentMethod_1.PaymentMethod).findOne({
            where: {
                id: paymentMethodId,
                ownerId: entityId,
                ownerType: entityType,
                isActive: true,
            },
        });
        if (!paymentMethod) {
            throw new Error("Payment method not found or inactive");
        }
        let entity;
        let email;
        switch (entityType) {
            case "customer":
                entity = await data_source_1.AppDataSource.getRepository(Customer_1.Customer).findOne({
                    where: { id: entityId },
                });
                email = entity?.email;
                break;
            case "vendor":
                entity = await data_source_1.AppDataSource.getRepository(Vendor_1.Vendor).findOne({
                    where: { id: entityId },
                });
                email =
                    entity?.email || entity?.businessEmail || `${entityId}@vendor.com`;
                break;
            case "rider":
                entity = await data_source_1.AppDataSource.getRepository(Rider_1.Rider).findOne({
                    where: { id: entityId },
                });
                email = entity?.email || `${entityId}@rider.com`;
                break;
            default:
                throw new Error(`Invalid entity type: ${entityType}`);
        }
        if (!entity) {
            throw new Error(`${entityType} not found`);
        }
        if (!email) {
            throw new Error("Email is required for payment");
        }
        const reference = `VENDA-SAVED-CARD-${(0, uuid_1.v4)()}`;
        const chargeData = await (0, paystack_1.chargeAuthorization)({
            email,
            amount,
            authorizationCode: paymentMethod.authorizationCode,
            reference,
            entityType,
            entityId,
            purpose,
            paymentMethodId,
        });
        if (!chargeData.status || chargeData.data.status !== "success") {
            throw new Error(chargeData.message || "Failed to charge card");
        }
        const balanceBefore = entity.wallet?.balance || 0;
        const balanceAfter = balanceBefore + amount;
        entity.wallet = {
            ...entity.wallet,
            balance: balanceAfter,
            pendingBalance: entity.wallet?.pendingBalance || 0,
        };
        switch (entityType) {
            case "customer":
                await data_source_1.AppDataSource.getRepository(Customer_1.Customer).save(entity);
                break;
            case "vendor":
                await data_source_1.AppDataSource.getRepository(Vendor_1.Vendor).save(entity);
                break;
            case "rider":
                await data_source_1.AppDataSource.getRepository(Rider_1.Rider).save(entity);
                break;
        }
        await transaction_service_1.TransactionService.createTransaction({
            entityId,
            entityType,
            amount,
            transactionType: "wallet_funding",
            reference,
            description: purpose,
            status: "completed",
            balanceBefore,
            balanceAfter,
            paymentMethod: "card",
            metadata: {
                paymentMethodId,
                paystackData: chargeData.data,
                paymentType: "wallet_funding",
            },
        });
        return {
            amount,
            reference,
            newBalance: entity.wallet.balance,
        };
    }
    static async getPaymentMethods(ownerId, ownerType) {
        const paymentMethods = await data_source_1.AppDataSource.getRepository(PaymentMethod_1.PaymentMethod).find({
            where: { ownerId, ownerType, isActive: true },
            order: { isDefault: "DESC", createdAt: "DESC" },
        });
        return paymentMethods.map((pm) => ({
            id: pm.id,
            cardType: pm.cardType,
            last4: pm.last4,
            expMonth: pm.expMonth,
            expYear: pm.expYear,
            bank: pm.bank,
            brand: pm.brand,
            isDefault: pm.isDefault,
            createdAt: pm.createdAt,
            ownerType: pm.ownerType,
        }));
    }
    static async setDefaultPaymentMethod(ownerId, ownerType, paymentMethodId) {
        const queryRunner = data_source_1.AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const manager = queryRunner.manager;
            await manager
                .getRepository(PaymentMethod_1.PaymentMethod)
                .createQueryBuilder()
                .update(PaymentMethod_1.PaymentMethod)
                .set({ isDefault: false })
                .where("ownerId = :ownerId AND ownerType = :ownerType", {
                ownerId,
                ownerType,
            })
                .execute();
            const paymentMethod = await manager.getRepository(PaymentMethod_1.PaymentMethod).findOne({
                where: { id: paymentMethodId, ownerId, ownerType, isActive: true },
            });
            if (!paymentMethod) {
                throw new Error("Payment method not found");
            }
            paymentMethod.isDefault = true;
            await manager.getRepository(PaymentMethod_1.PaymentMethod).save(paymentMethod);
            await queryRunner.commitTransaction();
            return { success: true, paymentMethod };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    static async deletePaymentMethod(ownerId, ownerType, paymentMethodId) {
        const queryRunner = data_source_1.AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const manager = queryRunner.manager;
            const paymentMethod = await manager.getRepository(PaymentMethod_1.PaymentMethod).findOne({
                where: { id: paymentMethodId, ownerId, ownerType },
            });
            if (!paymentMethod) {
                throw new Error("Payment method not found");
            }
            if (paymentMethod.isDefault) {
                const otherMethods = await manager.getRepository(PaymentMethod_1.PaymentMethod).find({
                    where: {
                        ownerId,
                        ownerType,
                        isActive: true,
                        id: paymentMethodId,
                    },
                });
                if (otherMethods.length > 0) {
                    throw new Error("Cannot delete default payment method. Set another as default first.");
                }
            }
            paymentMethod.isActive = false;
            await manager.getRepository(PaymentMethod_1.PaymentMethod).save(paymentMethod);
            await queryRunner.commitTransaction();
            return { success: true };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    static async savePaymentMethod(params) {
        const queryRunner = data_source_1.AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const manager = queryRunner.manager;
            if (params.isDefault) {
                await manager
                    .getRepository(PaymentMethod_1.PaymentMethod)
                    .createQueryBuilder()
                    .update(PaymentMethod_1.PaymentMethod)
                    .set({ isDefault: false })
                    .where("ownerId = :ownerId AND ownerType = :ownerType", {
                    ownerId: params.ownerId,
                    ownerType: params.ownerType,
                })
                    .execute();
            }
            const paymentMethod = manager.getRepository(PaymentMethod_1.PaymentMethod).create({
                ownerId: params.ownerId,
                ownerType: params.ownerType,
                authorizationCode: params.authorizationCode,
                cardType: params.cardType,
                last4: params.last4,
                expMonth: params.expMonth,
                expYear: params.expYear,
                bank: params.bank,
                countryCode: params.countryCode,
                brand: params.brand,
                isDefault: params.isDefault || false,
                isActive: true,
            });
            const savedPaymentMethod = await manager
                .getRepository(PaymentMethod_1.PaymentMethod)
                .save(paymentMethod);
            await queryRunner.commitTransaction();
            return savedPaymentMethod;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    static async getBanks(country = "nigeria") {
        const banksData = await (0, paystack_1.listBanks)(country);
        return banksData.data;
    }
    static async resolveBankAccount(accountNumber, bankCode) {
        const accountData = await (0, paystack_1.resolveAccountNumber)(accountNumber, bankCode);
        return accountData.data;
    }
    static async handleWebhook(body, headers) {
        const hash = crypto_1.default
            .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
            .update(JSON.stringify(body))
            .digest("hex");
        if (hash !== headers["x-paystack-signature"]) {
            throw new Error("Invalid webhook signature");
        }
        const event = body.event;
        switch (event) {
            case "charge.success":
                await this.handleChargeSuccess(body.data);
                break;
            case "transfer.success":
            case "transfer.failed":
            case "transfer.reversed":
                await this.handleTransferEvent(event, body.data);
                break;
            case "subscription.create":
            case "subscription.disable":
                await this.handleSubscriptionEvent(event, body.data);
                break;
            default:
                console.log(`Unhandled webhook event: ${event}`);
        }
        return { success: true };
    }
    static async handleChargeSuccess(data) {
        const { reference, amount, metadata } = data;
        const verification = await (0, paystack_1.verifyPayment)(reference);
        if (!verification.status || verification.data.status !== "success") {
            throw new Error("Invalid charge success event");
        }
        const paymentType = metadata?.paymentType || "wallet_funding";
        switch (paymentType) {
            case "wallet_funding":
                await this.processWalletFunding(verification.data, metadata);
                break;
            case "order_payment":
                await this.processOrderPayment(verification.data, metadata);
                break;
            case "service_payment":
                await this.processServicePayment(verification.data, metadata);
                break;
            default:
                console.log(`Unknown payment type: ${paymentType}`);
        }
    }
    static async handleTransferEvent(event, data) {
        const { reference, status } = data;
        const transaction = await transaction_service_1.TransactionService.getTransactionByReference(reference);
        if (!transaction) {
            console.error(`Transaction not found for reference: ${reference}`);
            return;
        }
        let newStatus;
        switch (status) {
            case "success":
                newStatus = "completed";
                break;
            case "failed":
            case "reversed":
                newStatus = "failed";
                break;
            default:
                newStatus = transaction.status;
        }
        await transaction_service_1.TransactionService.updateTransactionStatus(reference, {
            status: newStatus,
            metadata: {
                ...transaction.metadata,
                paystackStatus: status,
                webhookProcessedAt: new Date().toISOString(),
            },
        });
    }
    static async handleSubscriptionEvent(event, data) {
        console.log(`Subscription event: ${event}`, data);
    }
    static async processWalletFunding(paymentInfo, metadata) {
        const { entityType, entityId } = metadata;
        let entityRepo;
        switch (entityType) {
            case "customer":
                entityRepo = data_source_1.AppDataSource.getRepository(Customer_1.Customer);
                break;
            case "vendor":
                entityRepo = data_source_1.AppDataSource.getRepository(Vendor_1.Vendor);
                break;
            case "rider":
                entityRepo = data_source_1.AppDataSource.getRepository(Rider_1.Rider);
                break;
            default:
                throw new Error(`Invalid entity type: ${entityType}`);
        }
        const user = await entityRepo.findOne({ where: { id: entityId } });
        if (!user) {
            throw new Error(`${entityType} not found`);
        }
        const amount = paymentInfo.amount / 100;
        const balanceBefore = user.wallet?.balance || 0;
        const balanceAfter = balanceBefore + amount;
        user.wallet = {
            ...user.wallet,
            balance: balanceAfter,
            pendingBalance: user.wallet?.pendingBalance || 0,
        };
        await entityRepo.save(user);
        await transaction_service_1.TransactionService.updateTransactionStatus(paymentInfo.reference, {
            status: "completed",
            balanceBefore,
            balanceAfter,
            metadata: {
                ...metadata,
                paystackData: paymentInfo,
                processedAt: new Date().toISOString(),
            },
        });
        if (paymentInfo.authorization) {
            await this.uploadPaymentMethod(entityId, entityType, paymentInfo);
        }
    }
    static async processOrderPayment(paymentInfo, metadata) {
        console.log("Processing order payment:", metadata);
    }
    static async processServicePayment(paymentInfo, metadata) {
        console.log("Processing service payment:", metadata);
    }
    static async handleSuccessfulPayment(paymentInfo, transaction, entityType, entityId) {
        let entityRepo;
        let user;
        switch (entityType) {
            case "customer":
                entityRepo = data_source_1.AppDataSource.getRepository(Customer_1.Customer);
                user = await entityRepo.findOne({ where: { id: entityId } });
                break;
            case "vendor":
                entityRepo = data_source_1.AppDataSource.getRepository(Vendor_1.Vendor);
                user = await entityRepo.findOne({ where: { id: entityId } });
                break;
            case "rider":
                entityRepo = data_source_1.AppDataSource.getRepository(Rider_1.Rider);
                user = await entityRepo.findOne({ where: { id: entityId } });
                break;
            default:
                throw new Error(`Invalid entity type: ${entityType}`);
        }
        if (!user) {
            throw new Error(`${entityType} not found`);
        }
        const amount = Number(paymentInfo.amount) / 100;
        const balanceBefore = Number(user.wallet?.balance) || 0;
        const balanceAfter = balanceBefore + amount;
        user.wallet = {
            ...user.wallet,
            balance: balanceAfter,
            pendingBalance: user.wallet?.pendingBalance || 0,
        };
        await entityRepo.save(user);
        await transaction_service_1.TransactionService.updateTransactionStatus(paymentInfo.reference, {
            status: "completed",
            balanceBefore,
            balanceAfter,
            metadata: {
                ...transaction.metadata,
                paystackData: paymentInfo,
            },
        });
        if (paymentInfo.authorization) {
            await this.uploadPaymentMethod(entityId, entityType, paymentInfo);
        }
    }
    static async handleFailedPayment(transaction) {
        await transaction_service_1.TransactionService.updateTransactionStatus(transaction.reference, {
            status: "failed",
        });
    }
    static async uploadPaymentMethod(entityId, entityType, paymentInfo) {
        const { authorization } = paymentInfo;
        const existingPaymentMethod = await data_source_1.AppDataSource.getRepository(PaymentMethod_1.PaymentMethod).findOne({
            where: {
                ownerId: entityId,
                ownerType: entityType,
                authorizationCode: authorization.authorization_code,
                isActive: true,
            },
        });
        if (existingPaymentMethod) {
            return existingPaymentMethod;
        }
        let isDefault = false;
        const existingMethods = await data_source_1.AppDataSource.getRepository(PaymentMethod_1.PaymentMethod).find({
            where: { ownerId: entityId, ownerType: entityType, isActive: true },
        });
        if (existingMethods.length === 0) {
            isDefault = true;
        }
        const paymentMethod = await this.savePaymentMethod({
            ownerId: entityId,
            ownerType: entityType,
            authorizationCode: authorization.authorization_code,
            cardType: authorization.card_type,
            last4: authorization.last4,
            expMonth: authorization.exp_month,
            expYear: authorization.exp_year,
            bank: authorization.bank,
            countryCode: authorization.country_code,
            brand: authorization.brand,
            isDefault,
        });
        return paymentMethod;
    }
    static getCallbackUrl(type) {
        const baseUrl = process.env.APP_URL || "http://localhost:3000";
        switch (type) {
            case "wallet_funding":
                return `${baseUrl}/api/payments/verify`;
            case "order_payment":
                return `${baseUrl}/api/orders/callback`;
            case "service_payment":
                return `${baseUrl}/api/services/callback`;
            default:
                return `${baseUrl}/api/payments/verify`;
        }
    }
    static getClientIP(req) {
        const ip = req.ip || req.headers["x-forwarded-for"];
        return ip || "unknown";
    }
    static getUserAgent(req) {
        return req.headers["user-agent"] || "unknown";
    }
}
exports.PaymentService = PaymentService;
//# sourceMappingURL=payments.service.js.map