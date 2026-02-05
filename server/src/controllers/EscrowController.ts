import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import ApiResponse from '../utils/apiResponse';
import EscrowService from '../services/EscrowService';

export const initiateEscrow = asyncHandler(async (req: Request, res: Response) => {
    const escrow = await EscrowService.initiateEscrow(req.body, (req as any).user?.email);
    return ApiResponse.success(res, escrow, 'Escrow initiated successfully', 201);
});

export const getEscrow = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const escrow = await EscrowService.getEscrowById(id);

    if (!escrow) {
        return ApiResponse.error(res, 'Escrow not found', 404);
    }

    return ApiResponse.success(res, escrow, 'Escrow details retrieved successfully', 200);
});

export const getUserEscrows = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    if (!userId) {
        return ApiResponse.error(res, 'Authentication required', 401);
    }
    const { role } = req.query;

    const escrows = await EscrowService.getUserEscrows(userId, role as 'buyer' | 'seller');
    return ApiResponse.success(res, escrows, 'User escrows retrieved', 200);
});

export const getAllEscrows = asyncHandler(async (_req: Request, res: Response) => {
    const escrows = await EscrowService.getAllEscrows();
    return ApiResponse.success(res, escrows, 'All escrows retrieved', 200);
});

export const getFundingDetails = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const details = await EscrowService.getFundingDetails(id);
    return ApiResponse.success(res, details, 'Funding details retrieved', 200);
});

export const markAsFunded = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    // Pass entire body as payload
    const escrow = await EscrowService.markAsFunded(id, req.body);
    return ApiResponse.success(res, escrow, 'Escrow marked as funded', 200);
});

export const adminUpdateEscrow = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const escrow = await EscrowService.adminUpdateEscrow(id, req.body);
    return ApiResponse.success(res, escrow, 'Escrow updated by admin', 200);
});

export const validateCounterparty = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
        return ApiResponse.error(res, 'Email is required', 400);
    }

    const UserService = require('../services/UserService').default;
    const result = await UserService.validateUserByEmail(email);

    return ApiResponse.success(res, result, 'Counterparty validation complete', 200);
});

export const getBanksByCurrency = asyncHandler(async (req: Request, res: Response) => {
    const { currency } = req.params;

    const BankRepository = require('../repositories/BankRepository').default;
    const banks = await BankRepository.findByCurrency(currency);

    return ApiResponse.success(res, banks, 'Banks retrieved', 200);
});
