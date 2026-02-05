import { Router } from 'express';
import { initiateEscrow, getEscrow, getUserEscrows, getAllEscrows, getFundingDetails, markAsFunded, adminUpdateEscrow, validateCounterparty, getBanksByCurrency } from '../controllers/EscrowController';
import { authenticate } from '@/middleware/auth';

const router = Router();

// Validation endpoints
router.post('/validate-counterparty', validateCounterparty);
router.get('/banks/:currency', authenticate, getBanksByCurrency);

// Escrow CRUD
router.post('/initiate', authenticate, initiateEscrow);
router.get('/all', authenticate, getAllEscrows);
router.get('/my-escrows', authenticate, getUserEscrows);
router.get('/', authenticate, getUserEscrows);
router.get('/:id/funding-details', authenticate, getFundingDetails);
router.post('/:id/fund', authenticate, markAsFunded);
router.put('/:id/admin-update', authenticate, adminUpdateEscrow);
router.get('/:id', authenticate, getEscrow);

export default router;
