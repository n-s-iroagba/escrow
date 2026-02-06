import { Router } from 'express';
import { createBuyerCryptoWallet } from '../controllers/BuyerCryptoWalletController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', createBuyerCryptoWallet);

export default router;
