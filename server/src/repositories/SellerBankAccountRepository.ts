import SellerBankAccount, { ISellerBankAccount } from '../models/SellerBankAccount';

class SellerBankAccountRepository {
    async create(data: Partial<ISellerBankAccount>): Promise<SellerBankAccount> {
        return await SellerBankAccount.create(data as any);
    }

    async findBySellerId(sellerId: string): Promise<SellerBankAccount[]> {
        return await SellerBankAccount.findAll({ where: { sellerId } });
    }

    async findPrimaryBySellerId(sellerId: string): Promise<SellerBankAccount | null> {
        return await SellerBankAccount.findOne({ where: { sellerId, isPrimary: true } });
    }
}

export default new SellerBankAccountRepository();
