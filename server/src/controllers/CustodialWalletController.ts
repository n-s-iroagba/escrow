import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import ApiResponse from '../utils/apiResponse';
import CustodialWalletService from '../services/CustodialWalletService';

export const createWallet = asyncHandler(async (req: Request, res: Response) => {
    const wallet = await CustodialWalletService.createWallet(req.body);
    return ApiResponse.created(res, wallet, 'Wallet created successfully');
});

export const getWallets = asyncHandler(async (req: Request, res: Response) => {
    const wallets = await CustodialWalletService.getAllWallets();
    return ApiResponse.success(res, wallets, 'Wallets retrieved successfully');
});

export const getWallet = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const wallet = await CustodialWalletService.getWalletById(id);
    if (!wallet) {
        return ApiResponse.notFound(res, 'Wallet not found');
    }
    return ApiResponse.success(res, wallet, 'Wallet retrieved successfully');
});

export const updateWallet = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updatedWallet = await CustodialWalletService.updateWallet(id, req.body);
    if (!updatedWallet) {
        return ApiResponse.notFound(res, 'Wallet not found or update failed');
    }
    return ApiResponse.success(res, updatedWallet, 'Wallet updated successfully');
});
