import BankRepository from '../repositories/BankRepository';
import Bank, { IBank } from '../models/Bank';

class BankService {
    async createBank(data: Partial<IBank>): Promise<Bank> {
        return await Bank.create(data as any);
    }

    async getAllBanks(): Promise<Bank[]> {
        return await BankRepository.findAll();
    }

    async getBankById(id: string): Promise<Bank | null> {
        return await BankRepository.findById(id);
    }

    async updateBank(id: string, data: Partial<IBank>): Promise<Bank | null> {
        const [affectedCount] = await BankRepository.update(id, data);
        if (affectedCount === 0) return null;

        // If returning is supported and we get rows back, return updated.
        // Otherwise fetch again. Sequentialize returns [number, model[]]
        // Depending on dialect. If we assume generic, safe way is findById.
        // But let's assume standard behavior or just fetch.
        return await this.getBankById(id);
    }
}

export default new BankService();
