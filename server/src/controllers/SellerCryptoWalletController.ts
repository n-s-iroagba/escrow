import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import ApiResponse from '../utils/apiResponse';
import SellerCryptoWalletRepository from '../repositories/SellerCryptoWalletRepository';
import { ISellerCryptoWallet } from '../models/SellerCryptoWallet';

export const createSellerCryptoWallet = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const data: Partial<ISellerCryptoWallet> & { escrowId?: string } = req.body;

    if (!data.walletAddress || !data.currency || !data.escrowId) {
        return ApiResponse.error(res, 'Wallet Address, Currency, and Escrow ID are required', 400);
    }

    // Validate Escrow
    const EscrowRepository = require('../repositories/EscrowRepository').default;
    const escrow = await EscrowRepository.findById(data.escrowId);
    if (!escrow) return ApiResponse.error(res, 'Escrow not found', 404);

    if (escrow.sellerId !== userId) {
        return ApiResponse.error(res, 'You are not the seller of this escrow', 403);
    }

    // Seller Recipient Wallet is ONLY for C2C (Receiving BuyCurrency)
    if (escrow.tradeType !== 'CRYPTO_TO_CRYPTO') {
        return ApiResponse.error(res, 'Seller crypto wallet not required for this trade type (Use Bank Details for C2F)', 400);
    }

    if (data.currency !== escrow.buyCurrency) {
        return ApiResponse.error(res, `Currency mismatch. You must add a wallet for ${escrow.buyCurrency} to receive funds.`, 400);
    }

    const wallet = await SellerCryptoWalletRepository.create({
        sellerId: userId,
        currency: data.currency,
        walletAddress: data.walletAddress,
        network: data.network || 'mainnet'
    });

    return ApiResponse.created(res, wallet, 'Wallet added successfully');
});
