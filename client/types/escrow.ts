
export interface User {
    id?: string;
    email: string;
    kycStatus?: string;
    // Add other user fields as needed
}

export interface BankDetails {
    id: string;
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
    routingNumber?: string;
    iban?: string;
    swift?: string;
    isPrimary?: boolean;
    isVerified?: boolean;
    verifiedAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface CryptoWallet {
    id: string;
    walletAddress?: string; // Optional because server might send 'address'
    address?: string;       // Server sends this for CustodialWallet
    network: string;
    currency: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface EscrowBankBalance {
    id: string;
    escrowId: string;
    bankId: string;
    amount: string | number;
    currency: string;
    confirmedByAdmin: boolean;
    confirmedAt?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface EscrowCryptoWalletBalance {
    id: string;
    escrowId: string;
    role: 'BUYER' | 'SELLER';
    balance: string | number;
    currency: string;
    confirmedByAdmin: boolean;
    walletAddress?: string;
    createdAt: string;
    updatedAt: string;
}

export interface IEscrow {
    id: string;
    tradeType: string;
    buyerEmail: string;
    buyerId?: string;
    isBuyerInitiated: boolean;
    paymentMethod: string;
    sellerEmail: string;
    sellerId?: string;
    feePayer: string;
    buyCurrency: string;
    sellCurrency: string;
    state: string;
    counterPartyConfirmationDeadline: string; // ISO Date string

    buyerConfirmedFunding: boolean;
    sellerConfirmedFunding: boolean;
    buyerMarkedPaymentSent: boolean;
    sellerMarkedPaymentSent: boolean;

    buyerDepositWalletId?: string | null;
    sellerDepositWalletId?: string | null;
    sellerBankId?: string | null;
    buyerDepositBankId?: string | null;

    buyerDepositAmount: string | number; // API might return string for decimals
    sellerDepositAmount: string | number;

    createdAt: string;
    updatedAt: string;

    // Virtual / Include fields
    buyer?: User;
    seller?: User;

    buyerRecipientDetails?: CryptoWallet; // Depending on trade type
    sellerRecipientDetails?: BankDetails | CryptoWallet; // Bank for C2F, Wallet for C2C

    bankBalance?: EscrowBankBalance;
    cryptoBalances?: EscrowCryptoWalletBalance[];
}
