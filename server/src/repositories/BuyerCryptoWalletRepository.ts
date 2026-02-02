import BuyerCryptoWallet, { IBuyerCryptoWallet } from '../models/BuyerCryptoWallet';

class BuyerCryptoWalletRepository {
    async create(data: Partial<IBuyerCryptoWallet>): Promise<BuyerCryptoWallet> {
        return await BuyerCryptoWallet.create(data as any);
    }

    async findByBuyerId(buyerId: string): Promise<BuyerCryptoWallet[]> {
        return await BuyerCryptoWallet.findAll({ where: { buyerId } });
    }

    async findByBuyerIdAndCurrency(buyerId: string, currency: string): Promise<BuyerCryptoWallet | null> {
        return await BuyerCryptoWallet.findOne({ where: { buyerId, currency } });
    }
}

export default new BuyerCryptoWalletRepository();
