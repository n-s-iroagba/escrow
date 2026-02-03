import User from '../models/User';
import crypto from 'crypto';
import EmailService from './EmailService';

class UserService {
    /**
     * Validate if a user exists by email
     */
    async validateUserByEmail(email: string): Promise<{ exists: boolean; userId?: string; isActive?: boolean }> {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return { exists: false };
        }

        return {
            exists: true,
            userId: user.id,
            isActive: user.emailVerified === true
        };
    }

    /**
     * Create a shadow user for inviting to escrow
     * Shadow users are created when counterparty doesn't exist
     */
    async createShadowUser(email: string, invitedBy: string): Promise<User> {
        // Generate a random temporary password
        const tempPassword = crypto.randomBytes(16).toString('hex');

        const user = await User.create({
            email,
            password: tempPassword,
            role: 'CLIENT',
            emailVerified: false,
            isShadowUser: true, // Mark as shadow/invited user
        } as any);

        // Send invitation email
        await EmailService.sendShadowUserInvitation(email, invitedBy);

        return user;
    }

    /**
     * Get or create user for escrow counterparty
     */
    async getOrCreateCounterparty(email: string, invitedBy: string): Promise<{ user: User; isNew: boolean }> {
        const existing = await User.findOne({ where: { email } });

        if (existing) {
            return { user: existing, isNew: false };
        }

        const newUser = await this.createShadowUser(email, invitedBy);
        return { user: newUser, isNew: true };
    }

    /**
     * Get user by ID
     */
    async getUserById(id: string): Promise<User | null> {
        return await User.findByPk(id);
    }

    /**
     * Get user by email
     */
    async getUserByEmail(email: string): Promise<User | null> {
        return await User.findOne({ where: { email } });
    }
}

export default new UserService();
