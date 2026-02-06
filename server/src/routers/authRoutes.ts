import { Router } from 'express';
import {
    register,
    login,
    logout,
    refreshAccessToken,
    verifyEmail,
    forgotPassword,
    resetPassword,
    resendVerification,
    getMe
} from '../controllers/AuthController';
import { authenticate } from '@/middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh-token', refreshAccessToken);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/resend-verification', resendVerification);
router.get('/me', authenticate, getMe);

export default router;
