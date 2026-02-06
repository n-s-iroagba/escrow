import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import ApiResponse from '../utils/apiResponse';
import User from '../models/User';
import EmailService from '../services/EmailService';
import jwt from 'jsonwebtoken';

import crypto from 'crypto';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access_secret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh_secret';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

const generateTokens = (userId: string, email: string) => {
    const accessToken = jwt.sign({ id: userId, email: email }, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
    const refreshToken = jwt.sign({ id: userId }, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
    return { accessToken, refreshToken };
};

export const register = asyncHandler(async (req: Request, res: Response) => {
    const { email, username, password, role } = req.body;
    const { Op } = require('sequelize');
    const Escrow = require('../models/Escrow').default; // Dynamic import to avoid circular dependency issues if any, or just standard require

    // Check for existing email
    const existingUserByEmail = await User.findOne({ where: { email } });
    if (existingUserByEmail) {
        return ApiResponse.error(res, 'user with this email already exists', 400);
    }

    // Check for existing username
    if (username) {
        const existingUserByUsername = await User.findOne({ where: { username } });
        if (existingUserByUsername) {
            return ApiResponse.error(res, 'user with this username already exists', 400);
        }
    }

    // Check if user has any associated escrows (Pending Invite)
    const existingEscrows = await Escrow.findAll({
        where: {
            [Op.or]: [
                { buyerEmail: email },
                { sellerEmail: email }
            ]
        }
    });

    const isInvitedUser = existingEscrows.length > 0;

    // In development, use fixed OTP for testing; in production use random
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const verificationToken = isDevelopment ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await User.create({
        email,
        username,
        password,
        role: role || 'CLIENT', // Default to client if not specified
        emailVerified: isInvitedUser, // Auto-verify if invited
        emailVerificationToken: isInvitedUser ? null : verificationToken,
        emailVerificationTokenExpires: isInvitedUser ? null : verificationTokenExpires,
        kycStatus: role === 'ADMIN' ? 'VERIFIED' : 'NOT_SUBMITTED'
    } as any);

    let accessToken = undefined;

    if (isInvitedUser) {
        // Link user to escrows
        for (const escrow of existingEscrows) {
            if (escrow.buyerEmail === email) {
                escrow.buyerId = user.id;
            }
            if (escrow.sellerEmail === email) {
                escrow.sellerId = user.id;
            }
            await escrow.save();
        }

        // Send Welcome Email
        await EmailService.sendWelcomeWithFundingInstructions(email, existingEscrows, username);

        // Generate tokens for auto-login
        const tokens = generateTokens(user.id, user.email);
        accessToken = tokens.accessToken;

        // Set Refresh Token Cookie
        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
    } else {
        // Standard flow
        await EmailService.sendVerificationEmail(email, verificationToken, username);
    }

    // Return response
    return ApiResponse.success(res, {
        id: user.id,
        email: user.email,
        username: user.username,
        emailVerified: user.emailVerified, // Frontend needs this to decide redirect
        role: user.role,
        verificationToken: isInvitedUser ? null : verificationToken,
        accessToken // Include token if invited
    }, isInvitedUser ? 'Registration successful. Welcome aboard!' : 'Registration successful. Please check your email to verify your account.', 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    console.log(email, password);
    const user = await User.findOne({ where: { email } });
    if (!user) {
        return ApiResponse.error(res, 'Invalid credentials', 401);
    }

    const bcrypt = await import('bcrypt');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return ApiResponse.error(res, 'Invalid credentials', 401);
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    const { accessToken, refreshToken } = generateTokens(user.id, user.email);

    // Set Refresh Token Cookie
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict', // or 'lax' depending on frontend hosting
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return ApiResponse.success(res, {
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
            emailVerified: user.emailVerified,
            kycStatus: user.kycStatus
        },
        accessToken
    }, 'Login successful', 200);
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    return ApiResponse.success(res, null, 'Logged out successfully', 200);
});

export const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
        return ApiResponse.error(res, 'Refresh token not found', 401);
    }

    try {
        const decoded: any = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
        const user = await User.findByPk(decoded.id);

        if (!user) {
            return ApiResponse.error(res, 'User not found', 401);
        }

        const tokens = generateTokens(user.id, user.email);

        // Rotate refresh token
        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return ApiResponse.success(res, { accessToken: tokens.accessToken }, 'Token refreshed', 200);

    } catch (error) {
        return ApiResponse.error(res, 'Invalid refresh token', 403);
    }
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.body;

    const user = await User.findOne({
        where: {
            emailVerificationToken: token,
            // emailVerificationTokenExpires: { [Op.gt]: new Date() } // Need Op
        }
    });

    // Manual expiry check to avoid importing Op if lazy
    if (!user || (user.emailVerificationTokenExpires && user.emailVerificationTokenExpires < new Date())) {
        return ApiResponse.error(res, 'Invalid or expired verification token', 400);
    }

    user.emailVerified = true;
    user.emailVerificationToken = null; // clear
    user.emailVerificationTokenExpires = null;
    const tokens = generateTokens(user.id, user.email);
    await user.save();

    return ApiResponse.success(res, { user, accessToken: tokens.accessToken }, 'Email verified successfully', 200);
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
        // Generic response for security
        return ApiResponse.success(res, null, 'If that email exists, a reset link has been sent.', 200);
    }

    const isDevelopment = process.env.NODE_ENV !== 'production';
    // Use fixed token 'abcdef' in development for testing
    const resetToken = isDevelopment ? 'abcdef' : crypto.randomBytes(32).toString('hex');

    user.passwordResetToken = resetToken;
    user.passwordResetTokenExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
    await user.save();

    await EmailService.sendPasswordResetEmail(email, resetToken);

    return ApiResponse.success(res, null, 'If that email exists, a reset link has been sent.', 200);
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;

    const user = await User.findOne({ where: { passwordResetToken: token } });

    if (!user || (user.passwordResetTokenExpires && user.passwordResetTokenExpires < new Date())) {
        return ApiResponse.error(res, 'Invalid or expired reset token', 400);
    }

    user.password = newPassword; // Hook will hash it
    user.passwordResetToken = null;
    user.passwordResetTokenExpires = null;
    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Generate tokens for auto-login
    const { accessToken, refreshToken } = generateTokens(user.id, user.email);

    // Set Refresh Token Cookie
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return ApiResponse.success(res, {
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
            emailVerified: user.emailVerified,
        },
        accessToken
    }, 'Password reset successfully', 200);
});

export const resendVerification = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
        return ApiResponse.error(res, 'User not found', 404);
    }

    if (user.emailVerified) {
        return ApiResponse.error(res, 'Email already verified', 400);
    }

    // Generate new token
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const verificationToken = isDevelopment ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    user.emailVerificationToken = verificationToken;
    user.emailVerificationTokenExpires = verificationTokenExpires;
    await user.save();

    await EmailService.sendVerificationEmail(email, verificationToken, user.username || '');

    return ApiResponse.success(res, null, 'Verification email sent successfully', 200);
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    if (!userId) {
        return ApiResponse.error(res, 'Authentication required', 401);
    }

    const user = await User.findByPk(userId);
    if (!user) {
        return ApiResponse.error(res, 'User not found', 404);
    }

    return ApiResponse.success(res, {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        emailVerified: user.emailVerified,
        kycStatus: user.kycStatus,
        createdAt: user.createdAt
    }, 'User details retrieved', 200);
});
