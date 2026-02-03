import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import ApiResponse from '../utils/apiResponse';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access_secret';

/**
 * Middleware to authenticate requests using JWT tokens
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            ApiResponse.error(
                res,
                'Access token required',
                401
            );
            return;
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        try {
            // Verify token
            const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as { id: string };

            // Attach user ID to request object
            (req as any).user = { id: decoded.id };

            next();
        } catch (error) {
            ApiResponse.error(
                res,
                'Invalid or expired token',
                401
            );
            return;
        }
    } catch (error) {
        console.error('Authentication error:', error);
        ApiResponse.error(
            res,
            'Authentication failed',
            500
        );
        return;
    }
};

/**
 * Middleware to verify user has admin role
 */
export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user?.id;

        if (!userId) {
            ApiResponse.error(
                res,
                'Authentication required',
                401
            );
            return;
        }

        const User = require('../models/User').default;
        const user = await User.findByPk(userId);

        if (!user) {
            ApiResponse.error(
                res,
                'User not found',
                404
            );
            return;
        }

        if (user.role !== 'ADMIN') {
            ApiResponse.error(
                res,
                'Admin access required',
                403
            );
            return;
        }

        // Attach full user to request for downstream use
        (req as any).user = user;

        next();
    } catch (error) {
        console.error('Admin verification error:', error);
        ApiResponse.error(
            res,
            'Authorization failed',
            500
        );
        return;
    }
};
