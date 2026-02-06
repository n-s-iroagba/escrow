import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import ApiResponse from '../utils/apiResponse';
import SellerBankAccountRepository from '../repositories/SellerBankAccountRepository';
import { ISellerBankAccount } from '../models/SellerBankAccount';

export const createSellerBankAccount = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const data: Partial<ISellerBankAccount> & { escrowId?: string } = req.body;

    if (!data.accountNumber || !data.accountHolderName || !data.escrowId) {
        return ApiResponse.error(res, 'Account Number, Holder Name, and Escrow ID are required', 400);
    }

    // Validate Escrow
    const EscrowRepository = require('../repositories/EscrowRepository').default;
    const escrow = await EscrowRepository.findById(data.escrowId);
    if (!escrow) return ApiResponse.error(res, 'Escrow not found', 404);

    if (escrow.sellerId !== userId) {
        return ApiResponse.error(res, 'You are not the seller of this escrow', 403);
    }

    if (escrow.tradeType !== 'CRYPTO_TO_FIAT') {
        return ApiResponse.error(res, 'Bank account only required for Crypto-to-Fiat trades', 400);
    }

    const bankAccount = await SellerBankAccountRepository.create({
        ...data,
        sellerId: userId,
        isPrimary: true,
        isVerified: false
    });

    return ApiResponse.created(res, bankAccount, 'Bank account added successfully');
});

export const getSellerBankAccounts = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const accounts = await SellerBankAccountRepository.findBySellerId(userId);
    return ApiResponse.success(res, accounts, 'Bank accounts retrieved successfully');
});
