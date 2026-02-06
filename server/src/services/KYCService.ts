import KYCDocument, { IKYCDocument } from '../models/KYCDocument';
import KYCRepository from '../repositories/KYCRepository';
import User from '../models/User';
import { KycStatus } from '../utils/constants';
import EmailService from './EmailService';

class KYCService {
    /**
     * Submit KYC documents
     */
    async submitKYC(userId: string, data: Partial<IKYCDocument>): Promise<KYCDocument> {
        const existing = await KYCRepository.findByUserId(userId);

        let kycDoc;
        if (existing) {
            // Update existing
            const [_, updated] = await KYCRepository.update(existing.id, {
                ...data,
                status: KycStatus.VERIFIED // Auto-verify
            });
            kycDoc = updated[0];
        } else {
            // Create new
            kycDoc = await KYCRepository.create({
                ...data,
                userId,
                status: KycStatus.VERIFIED // Auto-verify
            });
        }

        // Update User model kycStatus
        await User.update({ kycStatus: KycStatus.VERIFIED }, { where: { id: userId } });

        // Send confirmation email
        const user = await User.findOne({ where: { id: userId } });
        if (user) {
            await EmailService.sendKYCSubmissionConfirmation(user.email, (user as any).firstName || '');
        }

        return kycDoc;
    }

    /**
     * Get KYC status for a user
     */
    async getKYCStatus(userId: string): Promise<IKYCDocument | null> {
        return await KYCRepository.findByUserId(userId);
    }

    /**
     * Admin: Approve KYC
     */
    async approveKYC(userId: string, reviewedBy: string): Promise<KYCDocument> {
        const kycDoc = await KYCRepository.findByUserId(userId);
        if (!kycDoc) {
            throw new Error('KYC document not found');
        }

        const [_, updated] = await KYCRepository.update(kycDoc.id, {
            status: KycStatus.VERIFIED,
            reviewedBy,
            reviewedAt: new Date()
        } as any);

        // Update user KYC status
        await User.update(
            { kycStatus: KycStatus.VERIFIED },
            { where: { id: userId } }
        );

        // Send approval email
        const user = await User.findOne({ where: { id: userId } });
        if (user) {
            await EmailService.sendKYCApproval(user.email, (user as any).firstName || '');
        }

        return updated[0];
    }

    /**
     * Admin: Reject KYC
     */
    async rejectKYC(userId: string, reason: string, reviewedBy: string): Promise<KYCDocument> {
        const kycDoc = await KYCRepository.findByUserId(userId);
        if (!kycDoc) {
            throw new Error('KYC document not found');
        }

        const [_, updated] = await KYCRepository.update(kycDoc.id, {
            status: KycStatus.REJECTED,
            rejectionReason: reason,
            reviewedBy,
            reviewedAt: new Date()
        } as any);

        // Update user KYC status
        await User.update(
            { kycStatus: KycStatus.REJECTED },
            { where: { id: userId } }
        );

        // Send rejection email
        const user = await User.findOne({ where: { id: userId } });
        if (user) {
            await EmailService.sendKYCRejection(user.email, reason, (user as any).firstName || '');
        }

        return updated[0];
    }

    /**
     * Admin: Get all pending KYC documents
     */
    async getPendingKYCs(): Promise<KYCDocument[]> {
        return await KYCDocument.findAll({
            where: { status: KycStatus.PENDING },
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'email', 'firstName', 'lastName']
            }],
            order: [['createdAt', 'ASC']]
        });
    }

    /**
     * Admin: Get all KYC documents
     */
    async getAllKYCs(status?: string): Promise<KYCDocument[]> {
        const where: any = {};
        if (status) {
            where.status = status;
        }

        return await KYCDocument.findAll({
            where,
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'email', 'firstName', 'lastName', 'role']
            }],
            order: [['createdAt', 'DESC']]
        });
    }

    /**
     * Get KYC statistics
     */
    async getKYCStats(): Promise<{
        total: number;
        pending: number;
        approved: number;
        rejected: number;
    }> {
        const [total, pending, approved, rejected] = await Promise.all([
            KYCDocument.count(),
            KYCDocument.count({ where: { status: KycStatus.PENDING } }),
            KYCDocument.count({ where: { status: KycStatus.VERIFIED } }),
            KYCDocument.count({ where: { status: KycStatus.REJECTED } })
        ]);

        return { total, pending, approved, rejected };
    }
}

export default new KYCService();
