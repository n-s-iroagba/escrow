import CustodialWalletRepository from '../repositories/CustodialWalletRepository';
import CustodialWallet, { ICustodialWallet } from '../models/CustodialWallet';

class CustodialWalletService {
    async createWallet(data: Partial<ICustodialWallet>): Promise<CustodialWallet> {
        return await CustodialWalletRepository.create(data);
    }

    async getAllWallets(): Promise<CustodialWallet[]> {
        return await CustodialWalletRepository.findAll();
    }

    async getWalletById(id: string): Promise<CustodialWallet | null> {
        return await CustodialWalletRepository.findById(id);
    }

    async updateWallet(id: string, data: Partial<ICustodialWallet>): Promise<CustodialWallet | null> {
        const [affectedCount] = await CustodialWalletRepository.update(id, data);
        if (affectedCount === 0) return null;
        return await this.getWalletById(id);
    }
}

export default new CustodialWalletService();
