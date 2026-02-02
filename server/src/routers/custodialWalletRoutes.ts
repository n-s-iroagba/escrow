import { Router } from 'express';
import { createWallet, getWallets, getWallet, updateWallet } from '../controllers/CustodialWalletController';

const router = Router();

router.get('/', getWallets);
router.post('/', createWallet);
router.get('/:id', getWallet);
router.put('/:id', updateWallet);

export default router;
