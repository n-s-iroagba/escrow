import { Router } from 'express';
import { submitKYC, getKYCStatus } from '../controllers/KYCController';

const router = Router();

// Assuming /kyc prefix
router.post('/submit', submitKYC);
router.get('/status/:userId?', getKYCStatus); // Optional param if admin or self

export default router;
