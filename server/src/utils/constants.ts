export const UserRole = {
  ADMIN: 'ADMIN',
  CLIENT: 'CLIENT',
} as const;

export const KycStatus = {
  NOT_SUBMITTED: 'NOT_SUBMITTED',
  SUBMITTED: 'SUBMITTED',
  VERIFIED: 'VERIFIED', // You might want to add this
  REJECTED: 'REJECTED', // You might want to add this
} as const;

export const EscrowState = {
  INITIALIZED: 'INITIALIZED',
  ONE_PARTY_FUNDED: 'ONE_PARTY_FUNDED',
  COMPLETELY_FUNDED: 'COMPLETELY_FUNDED',
  RELEASED: 'RELEASED', // You might want to add this
  DISPUTED: 'DISPUTED', // You might want to add this
  CANCELLED: 'CANCELLED', // You might want to add this
} as const;

export const TradeType = {
  CRYPTO_TO_CRYPTO: 'CRYPTO_TO_CRYPTO',
  CRYPTO_TO_FIAT: 'CRYPTO_TO_FIAT',
} as const;

export const FeePayer = {
  BUYER: 'BUYER',
  SELLER: 'SELLER',
} as const;

export const Currency = {
  // Fiat
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP',

  // Crypto
  BTC: 'BTC',
  ETH: 'ETH',
  USDT: 'USDT',
  USDC: 'USDC',
  LTC: 'LTC',
  XRP: 'XRP',
} as const;



export const PaymentMethod = {
  PAYPAL: 'PAYPAL',
  WIRE_TRANSFER: 'WIRE_TRANSFER',
  CRYPTO: 'CRYPTO',
} as const;

export enum KYCStatus {
  NOT_STARTED = 'NOT_STARTED',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export const DocumentType = {
  PASSPORT: 'PASSPORT',
  DRIVERS_LICENSE: 'DRIVERS_LICENSE',
  NATIONAL_ID: 'NATIONAL_ID',
} as const;

export const WalletRole = {
  BUYING: 'BUYING',
  SELLING: 'SELLING',
} as const;

// Token types
export const TokenType = {
  EMAIL_VERIFICATION: 'EMAIL_VERIFICATION',
  PASSWORD_RESET: 'PASSWORD_RESET',
} as const;

// Email templates
export const EmailTemplate = {
  WELCOME: 'WELCOME',
  EMAIL_VERIFICATION: 'EMAIL_VERIFICATION',
  PASSWORD_RESET: 'PASSWORD_RESET',
  ESCROW_CREATED: 'ESCROW_CREATED',
  FUNDING_RECEIVED: 'FUNDING_RECEIVED',
  ESCROW_COMPLETED: 'ESCROW_COMPLETED',
} as const;

// JWT token expiration
export const JWT_EXPIRATION = '24h';

// Default pagination
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

// Validation constants
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 128;