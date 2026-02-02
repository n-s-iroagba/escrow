import { Router } from 'express';
import { initiateEscrow, getEscrow, getUserEscrows, getAllEscrows, getFundingDetails, markAsFunded, adminUpdateEscrow } from '../controllers/EscrowController';
// Add auth middleware if required. Assuming public for now or protected.
// Usually user needs to be logged in to initiate.
// import { protect } from '../middlewares/auth';

const router = Router();

router.post('/initiate', initiateEscrow);
router.get('/all', getAllEscrows);
router.get('/my-escrows', getUserEscrows);
router.get('/', getUserEscrows);
router.get('/:id/funding-details', getFundingDetails);
router.post('/:id/fund', markAsFunded);
router.put('/:id/admin-update', adminUpdateEscrow);
router.get('/:id', getEscrow);

export default router;
