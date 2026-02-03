import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import ApiResponse from '../utils/apiResponse';
import UserRepository from '../repositories/UserRepository';

export const getAllUsers = asyncHandler(async (_req: Request, res: Response) => {
    const users = await UserRepository.findAll();
    return ApiResponse.success(res, users, 'Users retrieved successfully', 200);
});
