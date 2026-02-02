import SellerCryptoWallet, { ISellerCryptoWallet } from '../models/SellerCryptoWallet';

class SellerCryptoWalletRepository {
    async create(data: Partial<ISellerCryptoWallet>): Promise<SellerCryptoWallet> {
        return await SellerCryptoWallet.create(data as any);
    }

    async findBySellerId(sellerId: string): Promise<SellerCryptoWallet[]> {
        return await SellerCryptoWallet.findAll({ where: { sellerId } });
    }

    async findBySellerIdAndCurrency(sellerId: string, currency: string): Promise<SellerCryptoWallet | null> {
        return await SellerCryptoWallet.findOne({ where: { sellerId, currency } });
    }
}

export default new SellerCryptoWalletRepository();
