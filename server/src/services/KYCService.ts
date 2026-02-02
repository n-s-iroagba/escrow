import KYCDocument, { IKYCDocument } from '../models/KYCDocument';
import KYCRepository from '../repositories/KYCRepository';
import User from '../models/User';
import { KYCStatus } from '../utils/constants';

class KYCService {
    async submitKYC(userId: string, data: Partial<IKYCDocument>): Promise<KYCDocument> {
        const existing = await KYCRepository.findByUserId(userId);

        let kycDoc;
        if (existing) {
            // Update existing
            const [_, updated] = await KYCRepository.update(existing.id, {
                ...data,
                status: KYCStatus.PENDING // Reset to pending on re-submission
            });
            kycDoc = updated[0];
        } else {
            // Create new
            kycDoc = await KYCRepository.create({
                ...data,
                userId,
                status: KYCStatus.PENDING
            });
        }

        // Optionally update User model kycStatus if you replicate it there
        // await User.update({ kycStatus: KYCStatus.PENDING }, { where: { id: userId } });

        return kycDoc;
    }

    async getKYCStatus(userId: string): Promise<KYCDocument | null> {
        return await KYCRepository.findByUserId(userId);
    }
}

export default new KYCService();
