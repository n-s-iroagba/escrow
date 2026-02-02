import Bank, { IBank } from '../models/Bank';

class BankRepository {
    async findAll(): Promise<Bank[]> {
        return await Bank.findAll();
    }

    async findById(id: string): Promise<Bank | null> {
        return await Bank.findByPk(id);
    }

    async update(id: string, data: Partial<IBank>): Promise<[number, Bank[]]> {
        return await Bank.update(data, {
            where: { id },
            returning: true, // For Postgres
        });
    }
}

export default new BankRepository();
