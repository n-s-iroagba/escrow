import KYCDocument, { IKYCDocument } from '../models/KYCDocument';

class KYCRepository {
    async create(data: Partial<IKYCDocument>): Promise<KYCDocument> {
        return await KYCDocument.create(data as any);
    }

    async findByUserId(userId: string): Promise<KYCDocument | null> {
        return await KYCDocument.findOne({ where: { userId } });
    }

    async update(id: string, data: Partial<IKYCDocument>): Promise<[number, KYCDocument[]]> {
        return await KYCDocument.update(data, {
            where: { id },
            returning: true,
        });
    }
}

export default new KYCRepository();
