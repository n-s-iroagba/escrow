import { Router } from 'express';
import { createSellerCryptoWallet } from '../controllers/SellerCryptoWalletController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', createSellerCryptoWallet);

export default router;
