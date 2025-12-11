"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const data_source_1 = require("../../config/data-source");
const Customer_1 = require("../../entities/Customer");
const Vendor_1 = require("../../entities/Vendor");
const Rider_1 = require("../../entities/Rider");
const PaymentMethod_1 = require("../../entities/PaymentMethod");
const WalletTransaction_1 = require("../../entities/WalletTransaction");
const auth_1 = require("../../middleware/auth");
const paystack_1 = require("../../config/paystack");
const uuid_1 = require("uuid");
const router = (0, express_1.Router)();
router.post('/initialize', auth_1.authenticate, async (req, res) => {
    try {
        const { amount, purpose = 'Wallet Funding' } = req.body;
        const userId = req.user.id;
        const userType = req.user.role;
        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid amount'
            });
        }
        let email;
        let entityRepo;
        switch (userType) {
            case 'customer':
                entityRepo = data_source_1.AppDataSource.getRepository(Customer_1.Customer);
                break;
            case 'vendor':
                entityRepo = data_source_1.AppDataSource.getRepository(Vendor_1.Vendor);
                break;
            case 'rider':
                entityRepo = data_source_1.AppDataSource.getRepository(Rider_1.Rider);
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid user type'
                });
        }
        const user = await entityRepo.findOne({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        email = user.email;
        const reference = `VENDA-${userType.toUpperCase()}-${(0, uuid_1.v4)()}`;
        const paymentData = await (0, paystack_1.initializePayment)({
            email,
            amount,
            reference,
            entityType: userType,
            entityId: userId,
            purpose,
        });
        const transaction = data_source_1.AppDataSource.getRepository(WalletTransaction_1.WalletTransaction).create({
            customerId: userId,
            amount,
            transactionType: 'deposit',
            balanceBefore: 0,
            balanceAfter: 0,
            status: 'pending',
            reference,
            description: purpose,
            metadata: {
                entityType: userType,
                entityId: userId,
                paystackReference: reference,
            },
        });
        await data_source_1.AppDataSource.getRepository(WalletTransaction_1.WalletTransaction).save(transaction);
        res.json({
            success: true,
            message: 'Payment initialized successfully',
            data: {
                authorizationUrl: paymentData.data.authorization_url,
                accessCode: paymentData.data.access_code,
                reference: paymentData.data.reference,
            },
        });
    }
    catch (error) {
        console.error('Payment initialization error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to initialize payment',
        });
    }
});
router.get('/verify/:reference', async (req, res) => {
    try {
        const { reference } = req.params;
        const verificationData = await (0, paystack_1.verifyPayment)(reference);
        if (verificationData.status === false) {
            return res.status(400).json({
                success: false,
                message: 'Payment verification failed',
            });
        }
        const paymentInfo = verificationData.data;
        const { entityType, entityId, purpose } = paymentInfo.metadata;
        const transaction = await data_source_1.AppDataSource.getRepository(WalletTransaction_1.WalletTransaction).findOne({
            where: { reference },
        });
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found',
            });
        }
        if (transaction.status === 'completed') {
            return res.json({
                success: true,
                message: 'Payment already processed',
                data: paymentInfo,
            });
        }
        if (paymentInfo.status === 'success') {
            let entityRepo;
            let user;
            switch (entityType) {
                case 'customer':
                    entityRepo = data_source_1.AppDataSource.getRepository(Customer_1.Customer);
                    user = await entityRepo.findOne({ where: { id: entityId } });
                    break;
                case 'vendor':
                    entityRepo = data_source_1.AppDataSource.getRepository(Vendor_1.Vendor);
                    user = await entityRepo.findOne({ where: { id: entityId } });
                    break;
                case 'rider':
                    entityRepo = data_source_1.AppDataSource.getRepository(Rider_1.Rider);
                    user = await entityRepo.findOne({ where: { id: entityId } });
                    break;
            }
            if (user) {
                const amount = paymentInfo.amount / 100;
                const balanceBefore = user.wallet?.balance || 0;
                const balanceAfter = balanceBefore + amount;
                user.wallet = {
                    balance: balanceAfter,
                    pendingBalance: user.wallet?.pendingBalance || 0,
                };
                if (entityType === 'customer') {
                    await data_source_1.AppDataSource.getRepository(Customer_1.Customer).save(user);
                }
                else if (entityType === 'vendor') {
                    await data_source_1.AppDataSource.getRepository(Vendor_1.Vendor).save(user);
                }
                else if (entityType === 'rider') {
                    await data_source_1.AppDataSource.getRepository(Rider_1.Rider).save(user);
                }
                transaction.status = 'completed';
                transaction.balanceBefore = balanceBefore;
                transaction.balanceAfter = balanceAfter;
                transaction.metadata = {
                    ...transaction.metadata,
                    paystackData: paymentInfo,
                };
                await data_source_1.AppDataSource.getRepository(WalletTransaction_1.WalletTransaction).save(transaction);
                if (entityType === 'customer' && paymentInfo.authorization) {
                    const existingPaymentMethod = await data_source_1.AppDataSource.getRepository(PaymentMethod_1.PaymentMethod).findOne({
                        where: {
                            customerId: entityId,
                            authorizationCode: paymentInfo.authorization.authorization_code,
                        },
                    });
                    if (!existingPaymentMethod) {
                        const paymentMethod = data_source_1.AppDataSource.getRepository(PaymentMethod_1.PaymentMethod).create({
                            customerId: entityId,
                            authorizationCode: paymentInfo.authorization.authorization_code,
                            cardType: paymentInfo.authorization.card_type,
                            last4: paymentInfo.authorization.last4,
                            expMonth: paymentInfo.authorization.exp_month,
                            expYear: paymentInfo.authorization.exp_year,
                            bank: paymentInfo.authorization.bank,
                            countryCode: paymentInfo.authorization.country_code,
                            brand: paymentInfo.authorization.brand,
                            isDefault: false,
                            isActive: true,
                        });
                        await data_source_1.AppDataSource.getRepository(PaymentMethod_1.PaymentMethod).save(paymentMethod);
                    }
                }
            }
            res.json({
                success: true,
                message: 'Payment verified and wallet funded successfully',
                data: {
                    amount: paymentInfo.amount / 100,
                    reference: paymentInfo.reference,
                    status: paymentInfo.status,
                    newBalance: user?.wallet?.balance || 0,
                },
            });
        }
        else {
            transaction.status = 'failed';
            await data_source_1.AppDataSource.getRepository(WalletTransaction_1.WalletTransaction).save(transaction);
            res.status(400).json({
                success: false,
                message: 'Payment was not successful',
                data: paymentInfo,
            });
        }
    }
    catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to verify payment',
        });
    }
});
router.post('/charge-saved-card', auth_1.authenticate, async (req, res) => {
    try {
        const { amount, paymentMethodId, purpose = 'Wallet Funding' } = req.body;
        const userId = req.user.id;
        const userType = req.user.role;
        if (userType !== 'customer') {
            return res.status(403).json({
                success: false,
                message: 'Only customers can use saved cards',
            });
        }
        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid amount',
            });
        }
        const paymentMethod = await data_source_1.AppDataSource.getRepository(PaymentMethod_1.PaymentMethod).findOne({
            where: { id: paymentMethodId, customerId: userId, isActive: true },
        });
        if (!paymentMethod) {
            return res.status(404).json({
                success: false,
                message: 'Payment method not found or inactive',
            });
        }
        const customer = await data_source_1.AppDataSource.getRepository(Customer_1.Customer).findOne({
            where: { id: userId },
        });
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found',
            });
        }
        const reference = `VENDA-SAVED-CARD-${(0, uuid_1.v4)()}`;
        const chargeData = await (0, paystack_1.chargeAuthorization)({
            email: customer.email,
            amount,
            authorizationCode: paymentMethod.authorizationCode,
            reference,
            entityType: 'customer',
            entityId: userId,
            purpose,
            paymentMethodId,
        });
        if (chargeData.status && chargeData.data.status === 'success') {
            const balanceBefore = customer.wallet?.balance || 0;
            const balanceAfter = balanceBefore + amount;
            customer.wallet = {
                balance: balanceAfter,
                pendingBalance: customer.wallet?.pendingBalance || 0,
            };
            await data_source_1.AppDataSource.getRepository(Customer_1.Customer).save(customer);
            const transaction = data_source_1.AppDataSource.getRepository(WalletTransaction_1.WalletTransaction).create({
                customerId: userId,
                amount,
                transactionType: 'deposit',
                balanceBefore,
                balanceAfter,
                status: 'completed',
                reference,
                description: purpose,
                metadata: {
                    paymentMethodId,
                    paystackData: chargeData.data,
                },
            });
            await data_source_1.AppDataSource.getRepository(WalletTransaction_1.WalletTransaction).save(transaction);
            res.json({
                success: true,
                message: 'Card charged successfully',
                data: {
                    amount,
                    reference,
                    newBalance: customer.wallet.balance,
                },
            });
        }
        else {
            res.status(400).json({
                success: false,
                message: chargeData.message || 'Failed to charge card',
                data: chargeData,
            });
        }
    }
    catch (error) {
        console.error('Charge saved card error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to charge saved card',
        });
    }
});
router.get('/payment-methods', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const userType = req.user.role;
        if (userType !== 'customer') {
            return res.status(403).json({
                success: false,
                message: 'Only customers can view payment methods',
            });
        }
        const paymentMethods = await data_source_1.AppDataSource.getRepository(PaymentMethod_1.PaymentMethod).find({
            where: { customerId: userId, isActive: true },
            order: { isDefault: 'DESC', createdAt: 'DESC' },
        });
        res.json({
            success: true,
            data: paymentMethods.map(pm => ({
                id: pm.id,
                cardType: pm.cardType,
                last4: pm.last4,
                expMonth: pm.expMonth,
                expYear: pm.expYear,
                bank: pm.bank,
                brand: pm.brand,
                isDefault: pm.isDefault,
            })),
        });
    }
    catch (error) {
        console.error('Get payment methods error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get payment methods',
        });
    }
});
router.delete('/payment-methods/:id', auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userType = req.user.role;
        if (userType !== 'customer') {
            return res.status(403).json({
                success: false,
                message: 'Only customers can delete payment methods',
            });
        }
        const paymentMethod = await data_source_1.AppDataSource.getRepository(PaymentMethod_1.PaymentMethod).findOne({
            where: { id, customerId: userId },
        });
        if (!paymentMethod) {
            return res.status(404).json({
                success: false,
                message: 'Payment method not found',
            });
        }
        paymentMethod.isActive = false;
        await data_source_1.AppDataSource.getRepository(PaymentMethod_1.PaymentMethod).save(paymentMethod);
        res.json({
            success: true,
            message: 'Payment method deleted successfully',
        });
    }
    catch (error) {
        console.error('Delete payment method error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete payment method',
        });
    }
});
exports.default = router;
//# sourceMappingURL=payments.js.map