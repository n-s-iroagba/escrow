import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import ApiResponse from '../utils/apiResponse';
import SellerBankAccountRepository from '../repositories/SellerBankAccountRepository';
import { ISellerBankAccount } from '../models/SellerBankAccount';

export const createSellerBankAccount = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const data: Partial<ISellerBankAccount> = req.body;

    if (!data.accountNumber || !data.accountHolderName) {
        return ApiResponse.error(res, 'Account Number and Holder Name are required', 400);
    }

    const bankAccount = await SellerBankAccountRepository.create({
        ...data,
        sellerId: userId,
        isPrimary: true, // Default to primary for now if first one?
        isVerified: false
    });

    return ApiResponse.created(res, bankAccount, 'Bank account added successfully');
});

export const getSellerBankAccounts = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const accounts = await SellerBankAccountRepository.findBySellerId(userId);
    return ApiResponse.success(res, accounts, 'Bank accounts retrieved successfully');
});
