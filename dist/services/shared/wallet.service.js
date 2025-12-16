"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletService = void 0;
const data_source_1 = require("../../config/data-source");
const Customer_1 = require("../../entities/Customer");
const Vendor_1 = require("../../entities/Vendor");
const Rider_1 = require("../../entities/Rider");
const transaction_service_1 = require("./transaction.service");
const Transaction_1 = require("../../entities/Transaction");
const paystack_1 = require("../../config/paystack");
const uuid_1 = require("uuid");
class WalletService {
    static async fundWallet({ entityId, entityType, amount, reference, channel = "card", metadata = {}, queryRunner, }) {
        const manager = queryRunner?.manager || data_source_1.AppDataSource.manager;
        if (entityType === "customer") {
            const customerRepo = manager.getRepository(Customer_1.Customer);
            const customer = await customerRepo.findOne({ where: { id: entityId } });
            if (!customer)
                throw new Error("Customer not found");
            const currentBalance = customer.wallet?.balance || 0;
            customer.wallet = {
                ...customer.wallet,
                balance: currentBalance + amount,
                pendingBalance: customer.wallet?.pendingBalance || 0,
            };
            await customerRepo.save(customer);
            await transaction_service_1.TransactionService.createTransaction({
                entityId,
                entityType,
                amount,
                transactionType: "wallet_funding",
                reference,
                paymentMethod: channel,
                status: "completed",
                description: `Wallet funded with ₦${amount}`,
                metadata: {
                    channel,
                    ...metadata,
                    previousBalance: currentBalance,
                    newBalance: customer.wallet.balance,
                },
                queryRunner,
            });
            return customer;
        }
        else if (entityType === "vendor") {
            const vendorRepo = manager.getRepository(Vendor_1.Vendor);
            const vendor = await vendorRepo.findOne({ where: { id: entityId } });
            if (!vendor)
                throw new Error("Vendor not found");
            const currentBalance = vendor.wallet?.balance || 0;
            vendor.wallet = {
                ...vendor.wallet,
                balance: currentBalance + amount,
                pendingBalance: vendor.wallet?.pendingBalance || 0,
            };
            await vendorRepo.save(vendor);
            await transaction_service_1.TransactionService.createTransaction({
                entityId,
                entityType,
                amount,
                transactionType: "wallet_funding",
                reference,
                paymentMethod: channel,
                status: "completed",
                description: `Wallet funded with ₦${amount}`,
                metadata: {
                    channel,
                    ...metadata,
                    previousBalance: currentBalance,
                    newBalance: vendor.wallet.balance,
                },
                queryRunner,
            });
            return vendor;
        }
        else {
            const riderRepo = manager.getRepository(Rider_1.Rider);
            const rider = await riderRepo.findOne({ where: { id: entityId } });
            if (!rider)
                throw new Error("Rider not found");
            const currentBalance = rider.wallet?.balance || 0;
            rider.wallet = {
                ...rider.wallet,
                balance: currentBalance + amount,
                pendingBalance: rider.wallet?.pendingBalance || 0,
            };
            await riderRepo.save(rider);
            await transaction_service_1.TransactionService.createTransaction({
                entityId,
                entityType,
                amount,
                transactionType: "wallet_funding",
                reference,
                paymentMethod: channel,
                status: "completed",
                description: `Wallet funded with ₦${amount}`,
                metadata: {
                    channel,
                    ...metadata,
                    previousBalance: currentBalance,
                    newBalance: rider.wallet.balance,
                },
                queryRunner,
            });
            return rider;
        }
    }
    static async withdrawWallet(params) {
        const queryRunner = data_source_1.AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        let entity = null;
        let transaction = null;
        const { entityId, entityType, amount, accountNumber, bankCode, accountName, narration, } = params;
        try {
            const manager = queryRunner.manager;
            entity = await this.getEntity(manager, entityId, entityType);
            if (!entity) {
                throw new Error(`${entityType} not found`);
            }
            if (!entity.wallet) {
                throw new Error(`${entityType} wallet not found`);
            }
            const entityName = this.getEntityName(entity, entityType, accountName);
            const currentBalance = entity.wallet.balance || 0;
            if (currentBalance < amount) {
                throw new Error("Insufficient wallet balance");
            }
            const reference = `WITHDRAW_${Date.now()}_${(0, uuid_1.v4)().substring(0, 8)}`;
            const newBalance = currentBalance - amount;
            transaction = await this.createWithdrawalTransaction(manager, entity, entityType, amount, reference, accountNumber, bankCode, narration, currentBalance, newBalance);
            entity.wallet = {
                ...entity.wallet,
                balance: newBalance,
                pendingBalance: (entity.wallet.pendingBalance || 0) + amount,
            };
            await this.saveEntity(manager, entity, entityType);
            const paystackResult = await this.processPaystackTransfer({
                entityName,
                accountNumber,
                bankCode,
                amount,
                reference,
                narration,
            });
            const requiresOtp = paystackResult.status === "otp";
            const updatedMetadata = {
                ...transaction.metadata,
                transferReference: paystackResult.reference,
                transferCode: paystackResult.transfer_code,
                recipientCode: paystackResult.recipient_code,
                requiresOtp,
                paystackStatus: paystackResult.status,
                lastOtpSent: requiresOtp ? new Date().toISOString() : undefined,
                otpAttempts: 0,
                accountNumber,
                bankCode,
            };
            let transactionStatus;
            if (requiresOtp) {
                transactionStatus = "pending";
            }
            else if (paystackResult.status === "pending") {
                transactionStatus = "processing";
            }
            else if (paystackResult.status === "success") {
                transactionStatus = "completed";
                entity.wallet.pendingBalance = Math.max(0, entity.wallet.pendingBalance - amount);
                await this.saveEntity(manager, entity, entityType);
            }
            else {
                transactionStatus = "failed";
                await this.revertWalletChanges(manager, entity, entityType, amount, currentBalance);
            }
            transaction.metadata = updatedMetadata;
            transaction.status = transactionStatus;
            if (transactionStatus === "completed") {
                transaction.completedAt = new Date();
            }
            await manager.getRepository(Transaction_1.Transaction).save(transaction);
            await queryRunner.commitTransaction();
            return {
                success: true,
                reference,
                requiresOtp,
                transferCode: paystackResult.transfer_code,
                status: transactionStatus,
                message: requiresOtp
                    ? "OTP required to complete transfer"
                    : "Transfer initiated successfully",
            };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            if (entity && transaction) {
                await this.revertFailedWithdrawal(entity, entityType, transaction.amount);
            }
            console.error("Withdrawal error:", error.message);
            throw new Error(error.message || "Failed to process withdrawal");
        }
        finally {
            await queryRunner.release();
        }
    }
    static async finalizeWithdrawalOTP(reference, otp) {
        const queryRunner = data_source_1.AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const manager = queryRunner.manager;
            const transaction = await manager.getRepository(Transaction_1.Transaction).findOne({
                where: {
                    reference,
                    transactionType: "wallet_withdrawal",
                },
            });
            if (!transaction) {
                throw new Error("Transaction not found");
            }
            if (transaction.status === "completed") {
                throw new Error("Transaction already completed");
            }
            if (!["pending", "processing"].includes(transaction.status)) {
                throw new Error(`Transaction cannot be finalized (status: ${transaction.status})`);
            }
            const otpAttempts = transaction.metadata?.otpAttempts || 0;
            if (otpAttempts >= this.MAX_OTP_ATTEMPTS) {
                await this.handleMaxOtpAttempts(transaction);
                throw new Error("Maximum OTP attempts exceeded");
            }
            const transferCode = transaction.metadata?.transferCode;
            if (!transferCode) {
                throw new Error("Transfer reference not found");
            }
            const finalizeResult = await (0, paystack_1.finalizeTransfer)(transferCode, otp);
            if (!finalizeResult.status) {
                await this.handleOtpFailure(transaction, finalizeResult.message);
                const remainingAttempts = this.MAX_OTP_ATTEMPTS - (transaction.metadata?.otpAttempts || 0) - 1;
                throw new Error(`Invalid OTP. Attempts remaining: ${remainingAttempts}`);
            }
            transaction.status = "completed";
            transaction.completedAt = new Date();
            transaction.metadata = {
                ...transaction.metadata,
                finalizedAt: new Date().toISOString(),
                paystackStatus: "success",
            };
            await manager.getRepository(Transaction_1.Transaction).save(transaction);
            await this.clearPendingBalance(transaction.entityId, transaction.entityType, transaction.amount);
            await queryRunner.commitTransaction();
            return {
                success: true,
                message: "Withdrawal completed successfully",
                reference,
                amount: transaction.amount,
            };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    static async resendWithdrawalOTP(reference) {
        const transaction = await data_source_1.AppDataSource.manager
            .getRepository(Transaction_1.Transaction)
            .findOne({
            where: {
                reference,
                transactionType: "wallet_withdrawal",
            },
        });
        if (!transaction) {
            throw new Error("Transaction not found");
        }
        const lastOtpSent = transaction.metadata?.lastOtpSent;
        if (lastOtpSent) {
            const timeDiff = Date.now() - new Date(lastOtpSent).getTime();
            if (timeDiff < this.OTP_RESEND_INTERVAL) {
                throw new Error(`Please wait ${Math.ceil((this.OTP_RESEND_INTERVAL - timeDiff) / 1000)} seconds before requesting another OTP`);
            }
        }
        const transferCode = transaction.metadata?.transferCode;
        if (!transferCode) {
            throw new Error("Transfer reference not found");
        }
        const resendResult = await (0, paystack_1.resendTransferOtp)(transferCode);
        if (!resendResult.status) {
            throw new Error(resendResult.message || "Failed to resend OTP");
        }
        transaction.metadata = {
            ...transaction.metadata,
            lastOtpSent: new Date().toISOString(),
        };
        transaction.status = "pending";
        await data_source_1.AppDataSource.manager.getRepository(Transaction_1.Transaction).save(transaction);
        return {
            success: true,
            message: "OTP resent successfully",
            reference,
        };
    }
    static async getWalletBalance(entityId, entityType) {
        const entity = await this.getEntity(data_source_1.AppDataSource.manager, entityId, entityType);
        if (!entity) {
            throw new Error(`${entityType} not found`);
        }
        return {
            balance: entity.wallet?.balance || 0,
            pendingBalance: entity.wallet?.pendingBalance || 0,
            availableBalance: (entity.wallet?.balance || 0) - (entity.wallet?.pendingBalance || 0),
        };
    }
    static async handleTransferWebhook(data) {
        const { reference, status, transfer_code } = data;
        const queryRunner = data_source_1.AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const manager = queryRunner.manager;
            const transaction = await manager.getRepository(Transaction_1.Transaction).findOne({
                where: {
                    reference,
                    transactionType: "wallet_withdrawal",
                },
            });
            if (!transaction) {
                throw new Error("Transaction not found");
            }
            if (transaction.status !== "completed") {
                let transactionStatus = transaction.status;
                if (status === "success") {
                    transactionStatus = "completed";
                    transaction.completedAt = new Date();
                    await this.clearPendingBalance(transaction.entityId, transaction.entityType, transaction.amount);
                }
                else if (status === "failed") {
                    transactionStatus = "failed";
                    await this.revertFailedWithdrawal({ id: transaction.entityId }, transaction.entityType, transaction.amount);
                }
                transaction.status = transactionStatus;
                transaction.metadata = {
                    ...transaction.metadata,
                    paystackStatus: status,
                    webhookReceivedAt: new Date().toISOString(),
                };
                await manager.getRepository(Transaction_1.Transaction).save(transaction);
            }
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
    static async getEntity(manager, entityId, entityType) {
        switch (entityType) {
            case "customer":
                return await manager.getRepository(Customer_1.Customer).findOne({
                    where: { id: entityId },
                });
            case "vendor":
                return await manager.getRepository(Vendor_1.Vendor).findOne({
                    where: { id: entityId },
                });
            case "rider":
                return await manager.getRepository(Rider_1.Rider).findOne({
                    where: { id: entityId },
                });
            default:
                throw new Error(`Invalid entity type: ${entityType}`);
        }
    }
    static getEntityName(entity, entityType, accountName) {
        if (accountName)
            return accountName;
        if (entityType === "vendor" && entity.businessName) {
            return entity.businessName;
        }
        if (entity.fullName)
            return entity.fullName;
        if (entity.firstName && entity.lastName) {
            return `${entity.firstName} ${entity.lastName}`;
        }
        return "Account Holder";
    }
    static async saveEntity(manager, entity, entityType) {
        switch (entityType) {
            case "customer":
                await manager.getRepository(Customer_1.Customer).save(entity);
                break;
            case "vendor":
                await manager.getRepository(Vendor_1.Vendor).save(entity);
                break;
            case "rider":
                await manager.getRepository(Rider_1.Rider).save(entity);
                break;
        }
    }
    static async createWithdrawalTransaction(manager, entity, entityType, amount, reference, accountNumber, bankCode, description, balanceBefore, balanceAfter) {
        const transactionData = {
            entityId: entity.id,
            entityType,
            amount,
            transactionType: "wallet_withdrawal",
            reference,
            description,
            status: "pending",
            balanceBefore,
            balanceAfter,
            walletId: entity.wallet?.id,
            metadata: {
                accountNumber,
                bankCode,
                createdAt: new Date().toISOString(),
            },
        };
        switch (entityType) {
            case "customer":
                transactionData.customer = entity;
                break;
            case "vendor":
                transactionData.vendor = entity;
                break;
            case "rider":
                transactionData.rider = entity;
                break;
        }
        const transaction = manager
            .getRepository(Transaction_1.Transaction)
            .create(transactionData);
        const savedTransaction = await manager
            .getRepository(Transaction_1.Transaction)
            .save(transaction);
        if (!savedTransaction) {
            throw new Error("Could not create transaction record");
        }
        return savedTransaction;
    }
    static async processPaystackTransfer(params) {
        const recipientResult = await (0, paystack_1.createTransferRecipient)({
            type: "nuban",
            name: params.entityName,
            account_number: params.accountNumber,
            bank_code: params.bankCode,
            currency: "NGN",
        });
        const transferResult = await (0, paystack_1.initiateTransfer)(recipientResult.data.recipient_code, params.amount, params.reference, params.narration);
        return {
            ...transferResult.data,
            recipient_code: recipientResult.data.recipient_code,
        };
    }
    static async revertWalletChanges(manager, entity, entityType, amount, originalBalance) {
        entity.wallet = {
            ...entity.wallet,
            balance: originalBalance,
            pendingBalance: Math.max(0, entity.wallet.pendingBalance - amount),
        };
        await this.saveEntity(manager, entity, entityType);
    }
    static async clearPendingBalance(entityId, entityType, amount) {
        const manager = data_source_1.AppDataSource.manager;
        const entity = await this.getEntity(manager, entityId, entityType);
        if (entity && entity.wallet) {
            entity.wallet.pendingBalance = Math.max(0, entity.wallet.pendingBalance - amount);
            await this.saveEntity(manager, entity, entityType);
        }
    }
    static async revertFailedWithdrawal(entity, entityType, amount) {
        const manager = data_source_1.AppDataSource.manager;
        const updatedEntity = await this.getEntity(manager, entity.id, entityType);
        if (updatedEntity && updatedEntity.wallet) {
            updatedEntity.wallet = {
                ...updatedEntity.wallet,
                balance: (updatedEntity.wallet.balance || 0) + amount,
                pendingBalance: Math.max(0, updatedEntity.wallet.pendingBalance - amount),
            };
            await this.saveEntity(manager, updatedEntity, entityType);
        }
    }
    static async handleMaxOtpAttempts(transaction) {
        transaction.status = "failed";
        transaction.metadata = {
            ...transaction.metadata,
            failureReason: "MAX_OTP_ATTEMPTS_EXCEEDED",
        };
        await data_source_1.AppDataSource.manager.getRepository(Transaction_1.Transaction).save(transaction);
        await this.revertFailedWithdrawal({ id: transaction.entityId }, transaction.entityType, transaction.amount);
    }
    static async handleOtpFailure(transaction, errorMessage) {
        const otpAttempts = (transaction.metadata?.otpAttempts || 0) + 1;
        const isMaxAttemptsReached = otpAttempts >= this.MAX_OTP_ATTEMPTS;
        transaction.metadata = {
            ...transaction.metadata,
            otpAttempts,
            lastOtpAttempt: new Date().toISOString(),
            lastOtpError: errorMessage,
        };
        if (isMaxAttemptsReached) {
            transaction.status = "failed";
            transaction.metadata.failureReason = "MAX_OTP_ATTEMPTS_EXCEEDED";
            await this.revertFailedWithdrawal({ id: transaction.entityId }, transaction.entityType, transaction.amount);
        }
        else {
            transaction.status = "pending";
        }
        await data_source_1.AppDataSource.manager.getRepository(Transaction_1.Transaction).save(transaction);
    }
    static async makePayment(params) {
        const queryRunner = data_source_1.AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const manager = queryRunner.manager;
            const { entityId, entityType, amount, orderId, description, reference: providedReference, metadata = {}, } = params;
            const entity = await this.getEntity(manager, entityId, entityType);
            if (!entity) {
                throw new Error(`${entityType} not found`);
            }
            if (!entity.wallet) {
                throw new Error(`${entityType} wallet not found`);
            }
            const currentBalance = entity.wallet.balance || 0;
            if (currentBalance < amount) {
                throw new Error("Insufficient wallet balance");
            }
            const reference = providedReference || `PAY_${Date.now()}_${(0, uuid_1.v4)().substring(0, 8)}`;
            const newBalance = currentBalance - amount;
            const transactionData = {
                entityId,
                entityType,
                amount,
                transactionType: "wallet_payment",
                reference,
                description,
                status: "completed",
                balanceBefore: currentBalance,
                balanceAfter: newBalance,
                orderId,
                completedAt: new Date(),
                metadata: {
                    ...metadata,
                    createdAt: new Date().toISOString(),
                },
            };
            switch (entityType) {
                case "customer":
                    transactionData.customer = entity;
                    break;
                case "vendor":
                    transactionData.vendor = entity;
                    break;
                case "rider":
                    transactionData.rider = entity;
                    break;
            }
            const transaction = manager
                .getRepository(Transaction_1.Transaction)
                .create(transactionData);
            await manager.getRepository(Transaction_1.Transaction).save(transaction);
            entity.wallet.balance = newBalance;
            await this.saveEntity(manager, entity, entityType);
            await queryRunner.commitTransaction();
            return {
                success: true,
                reference,
                amount,
                newBalance,
                transactionId: transaction.id,
            };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    static async getTransactions(params) {
        const { entityId, entityType, page = 1, limit = 20, startDate, endDate, transactionType, status, } = params;
        const skip = (page - 1) * limit;
        const queryBuilder = data_source_1.AppDataSource.manager
            .getRepository(Transaction_1.Transaction)
            .createQueryBuilder("transaction")
            .where("transaction.entityId = :entityId", { entityId })
            .andWhere("transaction.entityType = :entityType", { entityType })
            .orderBy("transaction.createdAt", "DESC")
            .skip(skip)
            .take(limit);
        if (startDate) {
            queryBuilder.andWhere("transaction.createdAt >= :startDate", {
                startDate,
            });
        }
        if (endDate) {
            queryBuilder.andWhere("transaction.createdAt <= :endDate", { endDate });
        }
        if (transactionType) {
            queryBuilder.andWhere("transaction.transactionType = :transactionType", {
                transactionType,
            });
        }
        if (status) {
            queryBuilder.andWhere("transaction.status = :status", { status });
        }
        const [transactions, total] = await queryBuilder.getManyAndCount();
        return {
            transactions,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }
}
exports.WalletService = WalletService;
WalletService.MAX_OTP_ATTEMPTS = 3;
WalletService.OTP_RESEND_INTERVAL = 60 * 1000;
//# sourceMappingURL=wallet.service.js.map