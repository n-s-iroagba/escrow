import { Router } from 'express';
import { initiateEscrow, getEscrow, getUserEscrows, getAllEscrows, getFundingDetails, markAsFunded, adminUpdateEscrow, validateCounterparty, getBanksByCurrency } from '../controllers/EscrowController';

const router = Router();

// Validation endpoints
router.post('/validate-counterparty', validateCounterparty);
router.get('/banks/:currency', getBanksByCurrency);

// Escrow CRUD
router.post('/initiate', initiateEscrow);
router.get('/all', getAllEscrows);
router.get('/my-escrows', getUserEscrows);
router.get('/', getUserEscrows);
router.get('/:id/funding-details', getFundingDetails);
router.post('/:id/fund', markAsFunded);
router.put('/:id/admin-update', adminUpdateEscrow);
router.get('/:id', getEscrow);

export default router;
