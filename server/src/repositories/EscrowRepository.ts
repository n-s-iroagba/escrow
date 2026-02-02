import { Escrow } from '../models';
import { IEscrow } from '../models/Escrow';

class EscrowRepository {
    async create(data: Partial<IEscrow>): Promise<Escrow> {
        return await Escrow.create(data as any);
    }

    async findById(id: string): Promise<Escrow | null> {
        return await Escrow.findByPk(id);
    }

    async findByEmail(email: string): Promise<Escrow[]> {
        const { Op } = require('sequelize');
        return await Escrow.findAll({
            where: {
                [Op.or]: [
                    { buyerEmail: email },
                    { sellerEmail: email },
                ]
            }
        });
    }

    async findAllByUserId(userId: string, role?: 'buyer' | 'seller'): Promise<Escrow[]> {
        const { Op } = require('sequelize');
        const whereClause: any = {};

        if (role === 'buyer') {
            whereClause.buyerId = userId;
        } else if (role === 'seller') {
            whereClause.sellerId = userId;
        } else {
            whereClause[Op.or] = [
                { buyerId: userId },
                { sellerId: userId }
            ];
        }

        return await Escrow.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']]
        });
    }

    async findAll(): Promise<Escrow[]> {
        return await Escrow.findAll({
            order: [['createdAt', 'DESC']]
        });
    }
}

export default new EscrowRepository();
