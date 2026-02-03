import { Request, Response, NextFunction } from 'express';
import ApiResponse from '../utils/apiResponse';
import env from '../config/env';
import User from '../models/User';

/**
 * Middleware to ensure only the super admin can manage custodial wallets
 * This is a critical security measure since custodial wallets hold platform funds
 */
export const verifyCustodialWalletAccess = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Check if user is authenticated (assumes auth middleware runs first)
        const userId = (req as any).user?.id;

        if (!userId) {
            ApiResponse.error(
                res,
                'Authentication required',
                401
            );
            return;
        }

        // Get the user from database
        const user = await User.findByPk(userId);

        if (!user) {
            ApiResponse.error(
                res,
                'User not found',
                404
            );
            return;
        }

        // Check if user is admin
        if (user.role !== 'ADMIN') {
            ApiResponse.error(
                res,
                'Access denied. Admin privileges required.',
                403
            );
            return;
        }

        // Get the authorized super admin email from environment
        const superAdminEmail = env.CUSTODIAL_WALLET_ADMIN_EMAIL;

        if (!superAdminEmail) {
            console.error('⚠️ CUSTODIAL_WALLET_ADMIN_EMAIL not configured in environment');
            ApiResponse.error(
                res,
                'Custodial wallet management is not properly configured',
                500
            );
            return;
        }

        // Check if the admin's email matches the authorized email
        if (user.email !== superAdminEmail) {
            console.warn(`⚠️ Unauthorized custodial wallet access attempt by admin: ${user.email}`);
            ApiResponse.error(
                res,
                'Access denied. Only the designated super administrator can manage custodial wallets.',
                403
            );
            return;
        }

        // User is authorized - proceed
        console.log(`✅ Custodial wallet access granted to super admin: ${user.email}`);
        next();

    } catch (error) {
        console.error('Error in custodial wallet access verification:', error);
        ApiResponse.error(
            res,
            'Error verifying access permissions',
            500
        );
        return;
    }
};
