import { Response } from 'express';

export class ApiResponse {
  static success(res: Response, data: any = null, message: string = 'Success', statusCode: number = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static error(res: Response, message: string = 'An error occurred', errors: any = null, statusCode: number = 500) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
    });
  }

  static created(res: Response, data: any = null, message: string = 'Resource created successfully') {
    return this.success(res, data, message, 201);
  }

  static badRequest(res: Response, message: string = 'Bad request', errors: any = null) {
    return this.error(res, message, errors, 400);
  }

  static unauthorized(res: Response, message: string = 'Unauthorized') {
    return this.error(res, message, null, 401);
  }

  static forbidden(res: Response, message: string = 'Forbidden') {
    return this.error(res, message, null, 403);
  }

  static notFound(res: Response, message: string = 'Resource not found') {
    return this.error(res, message, null, 404);
  }

  static conflict(res: Response, message: string = 'Conflict', errors: any = null) {
    return this.error(res, message, errors, 409);
  }

  static internalServerError(res: Response, message: string = 'Internal server error') {
    return this.error(res, message, null, 500);
  }
}

export default ApiResponse;