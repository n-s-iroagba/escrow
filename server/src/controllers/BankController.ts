import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import ApiResponse from '../utils/apiResponse';
import BankService from '../services/BankService';

export const createBank = asyncHandler(async (_req: Request, res: Response) => {
    const bank = await BankService.createBank(req.body);
    return ApiResponse.created(res, bank, 'Bank created successfully');
});

export const getBanks = asyncHandler(async (_req: Request, res: Response) => {
    const banks = await BankService.getAllBanks();
    return ApiResponse.success(res, banks, 'Banks retrieved successfully');
});

export const getBank = asyncHandler(async (_req: Request, res: Response) => {
    const { id } = req.params;
    const bank = await BankService.getBankById(id);
    if (!bank) {
        return ApiResponse.notFound(res, 'Bank not found');
    }
    return ApiResponse.success(res, bank, 'Bank retrieved successfully');
});

export const updateBank = asyncHandler(async (_req: Request, res: Response) => {
    const { id } = req.params;
    const updatedBank = await BankService.updateBank(id, req.body);
    if (!updatedBank) {
        return ApiResponse.notFound(res, 'Bank not found or update failed');
    }
    return ApiResponse.success(res, updatedBank, 'Bank updated successfully');
});
