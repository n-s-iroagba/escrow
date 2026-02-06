import { Router } from 'express';
import { createWallet, getWallets, getWallet, updateWallet } from '../controllers/CustodialWalletController';
import { verifyCustodialWalletAccess } from '../middleware/custodialWalletAccess';
import { authenticate } from '@/middleware/auth';


const router = Router();

/**
 * SECURITY NOTE: All custodial wallet routes are protected by:
 * 1. authenticate - Ensures user is logged in
 * 2. verifyCustodialWalletAccess - Ensures user is the designated super admin
 * 
 * Only the admin with email matching CUSTODIAL_WALLET_ADMIN_EMAIL can access these routes.
 * This is critical as custodial wallets hold platform funds.
 */
router.use(authenticate);

// Public (Authenticated) - Traders need to see available custodial wallets to deposit funds
router.get('/', getWallets);

// Super Admin Only Operations
router.use(verifyCustodialWalletAccess);

router.post('/', createWallet);
router.get('/:id', getWallet);
router.put('/:id', updateWallet);

export default router;
