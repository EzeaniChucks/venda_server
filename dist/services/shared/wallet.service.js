"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletService = void 0;
const data_source_1 = require("../../config/data-source");
const Customer_1 = require("../../entities/Customer");
const Vendor_1 = require("../../entities/Vendor");
const Rider_1 = require("../../entities/Rider");
const transaction_service_1 = require("./transaction.service");
const axios_1 = __importDefault(require("axios"));
class WalletService {
    static async fundWallet({ entityId, entityType, amount, reference, channel = 'card', metadata = {}, queryRunner }) {
        const manager = queryRunner?.manager || data_source_1.AppDataSource.manager;
        if (entityType === 'customer') {
            const customerRepo = manager.getRepository(Customer_1.Customer);
            const customer = await customerRepo.findOne({ where: { id: entityId } });
            if (!customer)
                throw new Error('Customer not found');
            const currentBalance = customer.wallet?.balance || 0;
            customer.wallet = {
                ...customer.wallet,
                balance: currentBalance + amount,
                pendingBalance: customer.wallet?.pendingBalance || 0
            };
            await customerRepo.save(customer);
            await transaction_service_1.TransactionService.createTransaction({
                entityId,
                entityType,
                amount,
                type: 'wallet_funding',
                reference,
                paymentMethod: channel,
                status: 'completed',
                purpose: `Wallet funded with ₦${amount}`,
                metadata: {
                    channel,
                    ...metadata,
                    previousBalance: currentBalance,
                    newBalance: customer.wallet.balance
                },
                queryRunner
            });
            return customer;
        }
        else if (entityType === 'vendor') {
            const vendorRepo = manager.getRepository(Vendor_1.Vendor);
            const vendor = await vendorRepo.findOne({ where: { id: entityId } });
            if (!vendor)
                throw new Error('Vendor not found');
            const currentBalance = vendor.wallet?.balance || 0;
            vendor.wallet = {
                ...vendor.wallet,
                balance: currentBalance + amount,
                pendingBalance: vendor.wallet?.pendingBalance || 0
            };
            await vendorRepo.save(vendor);
            await transaction_service_1.TransactionService.createTransaction({
                entityId,
                entityType,
                amount,
                type: 'wallet_funding',
                reference,
                paymentMethod: channel,
                status: 'completed',
                purpose: `Wallet funded with ₦${amount}`,
                metadata: {
                    channel,
                    ...metadata,
                    previousBalance: currentBalance,
                    newBalance: vendor.wallet.balance
                },
                queryRunner
            });
            return vendor;
        }
        else {
            const riderRepo = manager.getRepository(Rider_1.Rider);
            const rider = await riderRepo.findOne({ where: { id: entityId } });
            if (!rider)
                throw new Error('Rider not found');
            const currentBalance = rider.wallet?.balance || 0;
            rider.wallet = {
                ...rider.wallet,
                balance: currentBalance + amount,
                pendingBalance: rider.wallet?.pendingBalance || 0
            };
            await riderRepo.save(rider);
            await transaction_service_1.TransactionService.createTransaction({
                entityId,
                entityType,
                amount,
                type: 'wallet_funding',
                reference,
                paymentMethod: channel,
                status: 'completed',
                purpose: `Wallet funded with ₦${amount}`,
                metadata: {
                    channel,
                    ...metadata,
                    previousBalance: currentBalance,
                    newBalance: rider.wallet.balance
                },
                queryRunner
            });
            return rider;
        }
    }
    static async withdrawWallet({ entityId, entityType, amount, accountNumber, bankCode, accountName, narration = 'Wallet withdrawal' }) {
        const queryRunner = data_source_1.AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const manager = queryRunner.manager;
            let entity = null;
            let currentBalance = 0;
            let entityName = 'Account Holder';
            if (entityType === 'customer') {
                entity = await manager.getRepository(Customer_1.Customer).findOne({ where: { id: entityId } });
                if (entity && accountName)
                    entityName = accountName;
            }
            else if (entityType === 'vendor') {
                const vendor = await manager.getRepository(Vendor_1.Vendor).findOne({ where: { id: entityId } });
                entity = vendor;
                if (vendor && vendor.businessName)
                    entityName = accountName || vendor.businessName;
            }
            else {
                const rider = await manager.getRepository(Rider_1.Rider).findOne({ where: { id: entityId } });
                entity = rider;
                entityName = accountName || 'Rider';
            }
            if (!entity) {
                throw new Error(`${entityType} not found`);
            }
            currentBalance = entity.wallet?.balance || 0;
            if (currentBalance < amount) {
                throw new Error('Insufficient wallet balance');
            }
            const reference = `WITHDRAW_${Date.now()}_${entityId.substring(0, 8)}`;
            const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
            if (!paystackSecretKey) {
                throw new Error('Paystack not configured');
            }
            const recipientResponse = await axios_1.default.post('https://api.paystack.co/transferrecipient', {
                type: 'nuban',
                name: entityName,
                account_number: accountNumber,
                bank_code: bankCode,
                currency: 'NGN'
            }, {
                headers: {
                    Authorization: `Bearer ${paystackSecretKey}`
                }
            });
            const recipientCode = recipientResponse.data.data.recipient_code;
            const transferResponse = await axios_1.default.post('https://api.paystack.co/transfer', {
                source: 'balance',
                reason: narration,
                amount: amount * 100,
                recipient: recipientCode,
                reference
            }, {
                headers: {
                    Authorization: `Bearer ${paystackSecretKey}`
                }
            });
            entity.wallet = {
                ...entity.wallet,
                balance: currentBalance - amount,
                pendingBalance: entity.wallet?.pendingBalance || 0
            };
            if (entityType === 'customer') {
                await manager.getRepository(Customer_1.Customer).save(entity);
            }
            else if (entityType === 'vendor') {
                await manager.getRepository(Vendor_1.Vendor).save(entity);
            }
            else {
                await manager.getRepository(Rider_1.Rider).save(entity);
            }
            await transaction_service_1.TransactionService.createTransaction({
                entityId,
                entityType,
                amount,
                type: 'wallet_withdrawal',
                reference,
                paymentMethod: 'bank_transfer',
                status: 'processing',
                purpose: narration,
                metadata: {
                    accountNumber,
                    bankCode,
                    recipientCode,
                    transferCode: transferResponse.data.data.transfer_code,
                    paystackStatus: transferResponse.data.data.status,
                    previousBalance: currentBalance,
                    newBalance: entity.wallet.balance
                },
                queryRunner
            });
            await queryRunner.commitTransaction();
            return {
                success: true,
                reference,
                transferCode: transferResponse.data.data.transfer_code,
                status: transferResponse.data.data.status
            };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            console.error('Withdrawal error:', error.response?.data || error.message);
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    static async getWalletBalance(entityId, entityType) {
        let entity = null;
        if (entityType === 'customer') {
            entity = await data_source_1.AppDataSource.getRepository(Customer_1.Customer).findOne({ where: { id: entityId } });
        }
        else if (entityType === 'vendor') {
            entity = await data_source_1.AppDataSource.getRepository(Vendor_1.Vendor).findOne({ where: { id: entityId } });
        }
        else {
            entity = await data_source_1.AppDataSource.getRepository(Rider_1.Rider).findOne({ where: { id: entityId } });
        }
        if (!entity) {
            throw new Error(`${entityType} not found`);
        }
        return entity.wallet || { balance: 0, pendingBalance: 0 };
    }
}
exports.WalletService = WalletService;
//# sourceMappingURL=wallet.service.js.map