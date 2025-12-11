import { QueryRunner, Repository } from 'typeorm';
import { AppDataSource } from '../../config/data-source';
import { Customer } from '../../entities/Customer';
import { Vendor } from '../../entities/Vendor';
import { Rider } from '../../entities/Rider';
import { TransactionService } from './transaction.service';
import axios from 'axios';

type Entity = Customer | Vendor | Rider;

export class WalletService {
  /**
   * Fund wallet via Paystack
   */
  static async fundWallet({
    entityId,
    entityType,
    amount,
    reference,
    channel = 'card',
    metadata = {},
    queryRunner
  }: {
    entityId: string;
    entityType: 'customer' | 'vendor' | 'rider';
    amount: number;
    reference: string;
    channel?: string;
    metadata?: any;
    queryRunner?: QueryRunner;
  }) {
    const manager = queryRunner?.manager || AppDataSource.manager;

    // Handle each entity type separately to avoid union type issues
    if (entityType === 'customer') {
      const customerRepo = manager.getRepository(Customer);
      const customer = await customerRepo.findOne({ where: { id: entityId } });
      if (!customer) throw new Error('Customer not found');

      const currentBalance = customer.wallet?.balance || 0;
      customer.wallet = {
        ...customer.wallet,
        balance: currentBalance + amount,
        pendingBalance: customer.wallet?.pendingBalance || 0
      };

      await customerRepo.save(customer);

      await TransactionService.createTransaction({
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
    } else if (entityType === 'vendor') {
      const vendorRepo = manager.getRepository(Vendor);
      const vendor = await vendorRepo.findOne({ where: { id: entityId } });
      if (!vendor) throw new Error('Vendor not found');

      const currentBalance = vendor.wallet?.balance || 0;
      vendor.wallet = {
        ...vendor.wallet,
        balance: currentBalance + amount,
        pendingBalance: vendor.wallet?.pendingBalance || 0
      };

      await vendorRepo.save(vendor);

      await TransactionService.createTransaction({
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
    } else {
      const riderRepo = manager.getRepository(Rider);
      const rider = await riderRepo.findOne({ where: { id: entityId } });
      if (!rider) throw new Error('Rider not found');

      const currentBalance = rider.wallet?.balance || 0;
      rider.wallet = {
        ...rider.wallet,
        balance: currentBalance + amount,
        pendingBalance: rider.wallet?.pendingBalance || 0
      };

      await riderRepo.save(rider);

      await TransactionService.createTransaction({
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

  /**
   * Withdraw from wallet to bank account (via Paystack Transfer)
   */
  static async withdrawWallet({
    entityId,
    entityType,
    amount,
    accountNumber,
    bankCode,
    accountName,
    narration = 'Wallet withdrawal'
  }: {
    entityId: string;
    entityType: 'customer' | 'vendor' | 'rider';
    amount: number;
    accountNumber: string;
    bankCode: string;
    accountName?: string;
    narration?: string;
  }) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

      // Get entity based on type
      let entity: Entity | null = null;
      let currentBalance = 0;
      let entityName = 'Account Holder';

      if (entityType === 'customer') {
        entity = await manager.getRepository(Customer).findOne({ where: { id: entityId } });
        if (entity && accountName) entityName = accountName;
      } else if (entityType === 'vendor') {
        const vendor = await manager.getRepository(Vendor).findOne({ where: { id: entityId } });
        entity = vendor;
        if (vendor && vendor.businessName) entityName = accountName || vendor.businessName;
      } else {
        const rider = await manager.getRepository(Rider).findOne({ where: { id: entityId } });
        entity = rider;
        entityName = accountName || 'Rider';
      }

      if (!entity) {
        throw new Error(`${entityType} not found`);
      }

      currentBalance = entity.wallet?.balance || 0;

      // Check if sufficient balance
      if (currentBalance < amount) {
        throw new Error('Insufficient wallet balance');
      }

      // Generate reference
      const reference = `WITHDRAW_${Date.now()}_${entityId.substring(0, 8)}`;

      // Create recipient on Paystack
      const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
      if (!paystackSecretKey) {
        throw new Error('Paystack not configured');
      }

      const recipientResponse = await axios.post(
        'https://api.paystack.co/transferrecipient',
        {
          type: 'nuban',
          name: entityName,
          account_number: accountNumber,
          bank_code: bankCode,
          currency: 'NGN'
        },
        {
          headers: {
            Authorization: `Bearer ${paystackSecretKey}`
          }
        }
      );

      const recipientCode = recipientResponse.data.data.recipient_code;

      // Initiate transfer
      const transferResponse = await axios.post(
        'https://api.paystack.co/transfer',
        {
          source: 'balance',
          reason: narration,
          amount: amount * 100,
          recipient: recipientCode,
          reference
        },
        {
          headers: {
            Authorization: `Bearer ${paystackSecretKey}`
          }
        }
      );

      // Deduct from wallet
      entity.wallet = {
        ...entity.wallet,
        balance: currentBalance - amount,
        pendingBalance: entity.wallet?.pendingBalance || 0
      };

      // Save based on entity type
      if (entityType === 'customer') {
        await manager.getRepository(Customer).save(entity as Customer);
      } else if (entityType === 'vendor') {
        await manager.getRepository(Vendor).save(entity as Vendor);
      } else {
        await manager.getRepository(Rider).save(entity as Rider);
      }

      // Create transaction record
      await TransactionService.createTransaction({
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
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      console.error('Withdrawal error:', error.response?.data || error.message);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get wallet balance
   */
  static async getWalletBalance(entityId: string, entityType: 'customer' | 'vendor' | 'rider') {
    let entity: Entity | null = null;

    if (entityType === 'customer') {
      entity = await AppDataSource.getRepository(Customer).findOne({ where: { id: entityId } });
    } else if (entityType === 'vendor') {
      entity = await AppDataSource.getRepository(Vendor).findOne({ where: { id: entityId } });
    } else {
      entity = await AppDataSource.getRepository(Rider).findOne({ where: { id: entityId } });
    }

    if (!entity) {
      throw new Error(`${entityType} not found`);
    }

    return entity.wallet || { balance: 0, pendingBalance: 0 };
  }
}
