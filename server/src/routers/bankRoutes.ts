import { Router } from 'express';
import { createBank, getBanks, getBank, updateBank } from '../controllers/BankController';

const router = Router();

router.get('/', getBanks);
router.post('/', createBank);
router.get('/:id', getBank);
router.put('/:id', updateBank);

export default router;
