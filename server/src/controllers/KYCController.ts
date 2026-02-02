import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import ApiResponse from '../utils/apiResponse';
import KYCService from '../services/KYCService';

export const submitKYC = asyncHandler(async (req: Request, res: Response) => {
    // Ideally get userId from authenticated user (req.user.id)
    // For now, assuming passed in body or header if middleware not fully rigorous on 'req.user' type yet
    const { userId, ...data } = req.body;

    // Fallback if req.user exists
    const uid = (req as any).user?.id || userId;

    const kycDoc = await KYCService.submitKYC(uid, data);
    return ApiResponse.success(res, kycDoc, 'KYC submitted successfully', 201);
});

export const getKYCStatus = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    // Or from auth
    const uid = (req as any).user?.id || userId;

    const kycDoc = await KYCService.getKYCStatus(uid);
    return ApiResponse.success(res, kycDoc, 'KYC status retrieved', 200);
});
