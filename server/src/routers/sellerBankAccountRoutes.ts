import { Router } from 'express';
import { createSellerBankAccount, getSellerBankAccounts } from '../controllers/SellerBankAccountController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getSellerBankAccounts);
router.post('/', createSellerBankAccount);

export default router;
