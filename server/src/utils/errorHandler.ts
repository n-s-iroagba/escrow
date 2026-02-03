import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';
import ApiResponse from './apiResponse';
import { logErrorToFile } from '../middlewares/requestLogger';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  let error = { ...err } as AppError;
  error.message = err.message;

  // Log error
  logger.error({
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Log to debug file
  logErrorToFile(error, req);

  // Handle specific error types
  if (err.name === 'ValidationError') {
    // Zod or Joi validation error
    error.statusCode = 400;
  } else if (err.name === 'SequelizeValidationError') {
    // Sequelize validation error
    error.statusCode = 400;
    error.message = 'Validation error';
  } else if (err.name === 'SequelizeUniqueConstraintError') {
    error.statusCode = 409;
    error.message = 'Duplicate entry';
  } else if (err.name === 'JsonWebTokenError') {
    error.statusCode = 401;
    error.message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    error.statusCode = 401;
    error.message = 'Token expired';
  } else if (err.name === 'SequelizeConnectionError') {
    error.statusCode = 503;
    error.message = 'Database connection error';
  }

  // If it's not an operational error (programming error), hide details in production
  const isOperational = error instanceof AppError && error.isOperational;

  if (process.env.NODE_ENV === 'production' && !isOperational) {
    error.message = 'Something went wrong';
    error.statusCode = 500;
  }

  // Send error response
  ApiResponse.error(
    res,
    error.message,
    process.env.NODE_ENV === 'development' ? { stack: error.stack } : null,
    error.statusCode || 500
  );
};

// Async handler wrapper
export const asyncHandler = (fn: Function) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export default errorHandler;