import { UserRole } from '../utils/constants';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
        emailVerified: boolean;
        kycStatus?: string;
      };
    }
  }
}

export {};