import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import ApiResponse from '../utils/apiResponse';
import BuyerCryptoWalletRepository from '../repositories/BuyerCryptoWalletRepository';
import { IBuyerCryptoWallet } from '../models/BuyerCryptoWallet';

export const createBuyerCryptoWallet = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const data: Partial<IBuyerCryptoWallet> & { escrowId?: string } = req.body;

    if (!data.walletAddress || !data.currency || !data.escrowId) {
        return ApiResponse.error(res, 'Wallet Address, Currency, and Escrow ID are required', 400);
    }

    // Validate Escrow
    const EscrowRepository = require('../repositories/EscrowRepository').default;
    const escrow = await EscrowRepository.findById(data.escrowId);
    if (!escrow) return ApiResponse.error(res, 'Escrow not found', 404);

    if (escrow.buyerId !== userId) {
        return ApiResponse.error(res, 'You are not the buyer of this escrow', 403);
    }

    // Buyer NEEDS to receive SellCurrency
    if (data.currency !== escrow.sellCurrency) {
        return ApiResponse.error(res, `Currency mismatch. You must add a wallet for ${escrow.sellCurrency} to receive funds.`, 400);
    }

    const wallet = await BuyerCryptoWalletRepository.create({
        buyerId: userId,
        currency: data.currency,
        walletAddress: data.walletAddress,
        network: data.network || 'mainnet'
    });

    return ApiResponse.created(res, wallet, 'Wallet added successfully');
});


