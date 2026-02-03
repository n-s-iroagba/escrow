import Bank, { IBank } from '../models/Bank';

class BankRepository {
    async findAll(): Promise<Bank[]> {
        return await Bank.findAll();
    }

    async findById(id: string): Promise<Bank | null> {
        return await Bank.findByPk(id);
    }

    async findByCurrency(currency: string): Promise<Bank[]> {
        return await Bank.findAll({ where: { currency } });
    }

    async update(id: string, data: Partial<IBank>): Promise<[number, Bank[]]> {
        return await Bank.update(data, {
            where: { id },
            returning: true,
        });
    }
}

export default new BankRepository();
