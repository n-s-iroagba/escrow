import BankRepository from '../repositories/BankRepository';
import Bank, { IBank } from '../models/Bank';

class BankService {
    /**
     * Create a new bank account
     */
    async createBank(data: Partial<IBank>): Promise<Bank> {
        return await Bank.create(data as any);
    }

    /**
     * Get all bank accounts
     */
    async getAllBanks(): Promise<Bank[]> {
        return await BankRepository.findAll();
    }

    /**
     * Get bank by ID
     */
    async getBankById(id: string): Promise<Bank | null> {
        return await BankRepository.findById(id);
    }

    /**
     * Get banks by currency
     */
    async getBanksByCurrency(currency: string): Promise<Bank[]> {
        return await Bank.findAll({ where: { currency } });
    }

    /**
     * Update bank account
     */
    async updateBank(id: string, data: Partial<IBank>): Promise<Bank | null> {
        const [affectedCount] = await BankRepository.update(id, data);
        if (affectedCount === 0) return null;
        return await this.getBankById(id);
    }

    /**
     * Delete bank account
     */
    async deleteBank(id: string): Promise<boolean> {
        const result = await Bank.destroy({ where: { id } });
        return result > 0;
    }

    /**
     * Check if bank account number exists
     */
    async bankExists(accountNumber: string): Promise<boolean> {
        const bank = await Bank.findOne({ where: { accountNumber } });
        return !!bank;
    }

    /**
     * Get bank statistics
     */
    async getBankStats(): Promise<{
        total: number;
        byCurrency: Record<string, number>;
    }> {
        const banks = await this.getAllBanks();
        const byCurrency: Record<string, number> = {};

        banks.forEach(bank => {
            if (!byCurrency[bank.currency]) {
                byCurrency[bank.currency] = 0;
            }
            byCurrency[bank.currency]++;
        });

        return {
            total: banks.length,
            byCurrency
        };
    }
}

export default new BankService();
