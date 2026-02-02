import { Router } from 'express';
import {
    register,
    login,
    logout,
    refreshAccessToken,
    verifyEmail,
    forgotPassword,
    resetPassword
} from '../controllers/AuthController';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh-token', refreshAccessToken);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
