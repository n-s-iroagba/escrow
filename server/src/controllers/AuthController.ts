import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import ApiResponse from '../utils/apiResponse';
import User from '../models/User';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/EmailService';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access_secret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh_secret';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

const generateTokens = (userId: string) => {
    const accessToken = jwt.sign({ id: userId }, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
    const refreshToken = jwt.sign({ id: userId }, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
    return { accessToken, refreshToken };
};

export const register = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, role } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
        return ApiResponse.error(res, 'Email already in use', 400);
    }

    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await User.create({
        email,
        password,
        role: role || 'CLIENT', // Default to client if not specified, or validate allowed roles
        emailVerified: false,
        emailVerificationToken: verificationToken,
        emailVerificationTokenExpires: verificationTokenExpires
    } as any);

    await sendVerificationEmail(email, verificationToken);

    // Don't send token immediately on register? Or do we auto-login?
    // Usually require verification first or allow limited access. 
    // For now, let's just return success message.

    return ApiResponse.success(res, { id: user.id, email: user.email }, 'Registration successful. Please check your email to verify your account.', 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
        return ApiResponse.error(res, 'Invalid credentials', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return ApiResponse.error(res, 'Invalid credentials', 401);
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    const { accessToken, refreshToken } = generateTokens(user.id);

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

        const tokens = generateTokens(user.id);

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
    user.emailVerificationToken = undefined; // clear
    user.emailVerificationTokenExpires = undefined;
    await user.save();

    return ApiResponse.success(res, null, 'Email verified successfully', 200);
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
        // Generic response for security
        return ApiResponse.success(res, null, 'If that email exists, a reset link has been sent.', 200);
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetTokenExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
    await user.save();

    await sendPasswordResetEmail(email, resetToken);

    return ApiResponse.success(res, null, 'If that email exists, a reset link has been sent.', 200);
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;

    const user = await User.findOne({ where: { passwordResetToken: token } });

    if (!user || (user.passwordResetTokenExpires && user.passwordResetTokenExpires < new Date())) {
        return ApiResponse.error(res, 'Invalid or expired reset token', 400);
    }

    user.password = newPassword; // Hook will hash it
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    await user.save();

    return ApiResponse.success(res, null, 'Password reset successfully', 200);
});
