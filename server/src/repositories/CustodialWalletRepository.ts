import CustodialWallet, { ICustodialWallet } from '../models/CustodialWallet';

class CustodialWalletRepository {
    async create(data: Partial<ICustodialWallet>): Promise<CustodialWallet> {
        return await CustodialWallet.create(data as any);
    }

    async findAll(): Promise<CustodialWallet[]> {
        return await CustodialWallet.findAll();
    }

    async findByCurrency(currency: string): Promise<CustodialWallet | null> {
        return await CustodialWallet.findOne({ where: { currency: currency.toUpperCase() } });
    }

    async findAllByCurrency(currency: string): Promise<CustodialWallet[]> {
        return await CustodialWallet.findAll({ where: { currency } });
    }

    async findById(id: string): Promise<CustodialWallet | null> {
        return await CustodialWallet.findByPk(id);
    }

    async update(id: string, data: Partial<ICustodialWallet>): Promise<[number, CustodialWallet[]]> {
        return await CustodialWallet.update(data, {
            where: { id },
            returning: true,
        });
    }
}

export default new CustodialWalletRepository();
