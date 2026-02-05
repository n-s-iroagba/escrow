import Escrow, { IEscrow } from '../models/Escrow';
import EscrowRepository from '../repositories/EscrowRepository';
import User from '../models/User';
import EmailService from './EmailService';
import { TradeType, EscrowState } from '../utils/constants';
import SellerBankAccountRepository from '../repositories/SellerBankAccountRepository';
import SellerCryptoWalletRepository from '../repositories/SellerCryptoWalletRepository';
import BuyerCryptoWalletRepository from '../repositories/BuyerCryptoWalletRepository';
import CustodialWalletRepository from '../repositories/CustodialWalletRepository';
import EscrowBankBalance from '../models/EscrowBankBalance';
import EscrowCryptoWalletBalance from '../models/EscrowCryptoWalletBalance';
import BankRepository from '../repositories/BankRepository';

interface IInitiateEscrowPayload extends Partial<IEscrow> {
    paymentMethod?: string; // This is payload, but check Escrow model for storage
    counterPartyEmail: string;
    selectedBankId?: string;// if crypto to fiat the choose bank e.g two banks could exist for one currency
    bankDetails?: {
        accountNumber: string;
        accountHolderName: string;
        routingNumber?: string;
        iban?: string;
        swift?: string;
    };//sellers bank details if crypto to fiat initiator is seller
    walletDetails?: {
        walletAddress: string;
        network?: string;
    };//buyer wallet details if fiat to crypto or crypto to crypto or seller wallet(initiator wallet details if crypto to crypto)
    buyCurrency: string;
    sellCurrency: string;
    isBuyerInitiated: boolean;
    feePayer: 'buyer' | 'seller';
}

class EscrowService {
    async initiateEscrow(data: IInitiateEscrowPayload, initiatorEmail: string): Promise<Escrow> {
        const {
            tradeType,
            amount,
            paymentMethod,
            counterPartyEmail,
            selectedBankId,
            bankDetails,
            walletDetails,
            buyCurrency,
            sellCurrency,
            isBuyerInitiated,
            ...rest
        } = data;
        console.log(paymentMethod)
        // 1. Resolve Users
        let initiator = await User.findOne({ where: { email: initiatorEmail } });
        if (!initiator) throw new Error('Initiator not found');

        let counterParty = await User.findOne({ where: { email: counterPartyEmail } });

        // Shadow User Creation if not exists logic (simplified for now)
        // If we had a mechanism to create a shadow user, we'd do it here.
        // For now, we proceed. The IDs will be null if counterParty is null.

        const buyerEmail = isBuyerInitiated ? initiatorEmail : counterPartyEmail;
        const sellerEmail = isBuyerInitiated ? counterPartyEmail : initiatorEmail;
        const buyerId = isBuyerInitiated ? initiator.id : counterParty?.id;
        const sellerId = isBuyerInitiated ? counterParty?.id : initiator.id;

        // 1.5. Resolve Custodial Accounts (Wallet/Bank)
        let buyerDepositWalletId: string | undefined;
        let sellerDepositWalletId: string | undefined;
        let sellerBankId: string | undefined;
        let buyerDepositBankId: string | undefined;


        if (isBuyerInitiated) {
            if (tradeType === TradeType.CRYPTO_TO_CRYPTO) {
                // Buyer deposits BuyCurrency (Crypto) -> Custodial Wallet
                const buyerWallet = await CustodialWalletRepository.findByCurrency(buyCurrency);
                if (buyerWallet) buyerDepositWalletId = buyerWallet.id;

                // Seller deposits SellCurrency (Crypto) -> Custodial Wallet
                const sellerWallet = await CustodialWalletRepository.findByCurrency(sellCurrency);
                if (sellerWallet) sellerDepositWalletId = sellerWallet.id;

            } else if (tradeType === TradeType.CRYPTO_TO_FIAT && selectedBankId) {
                // Buyer deposits BuyCurrency (Fiat) -> Custodial Bank
                // "Seller Bank Account attached to escrow" (Platform Bank for receiving Fiat)
                const bank = await BankRepository.findById(selectedBankId);
                if (bank) {
                    buyerDepositBankId = bank.id;
                }
            }
        }

        // 2. Asset Reception Logic (Wallets/Banks) 
        if (isBuyerInitiated) {
            // Buyer receiving Crypto?
            if (walletDetails && buyerId) {
                await BuyerCryptoWalletRepository.create({
                    buyerId: buyerId,
                    currency: sellCurrency, // Buyer receives SellCurrency
                    walletAddress: walletDetails.walletAddress,
                    network: walletDetails.network || 'mainnet'
                });
            }
        } else {
            // Seller Initiated
            if (tradeType === TradeType.CRYPTO_TO_CRYPTO) {
                // Seller receiving Crypto
                if (walletDetails && sellerId) {
                    await SellerCryptoWalletRepository.create({
                        sellerId: sellerId,
                        currency: buyCurrency, // Seller receives BuyCurrency
                        walletAddress: walletDetails.walletAddress,
                        network: walletDetails.network || 'mainnet'
                    });
                }
            } else if (tradeType === TradeType.CRYPTO_TO_FIAT) {
                // Seller receiving Fiat
                if (bankDetails && sellerId) {
                    sellerBankId = (await SellerBankAccountRepository.create({
                        sellerId: sellerId,
                        accountNumber: bankDetails.accountNumber,
                        accountHolderName: bankDetails.accountHolderName,
                        routingNumber: bankDetails.routingNumber,
                        iban: bankDetails.iban,
                        swift: bankDetails.swift,
                        isPrimary: true,
                        isVerified: false
                    })).id;
                }
            }
        }

        // 3. Create Escrow
        const escrow = await EscrowRepository.create({
            ...rest,
            tradeType,
            amount,
            buyCurrency,
            sellCurrency,
            paymentMethod: paymentMethod || 'CRYPTO', // Default for C2C if not explicit
            isBuyerInitiated,
            buyerEmail,
            sellerEmail,
            buyerId,
            sellerId,
            state: EscrowState.INITIALIZED,
            // Default dates/flags handled by model/DB if not present
            counterPartyConfirmationDeadline: data.counterPartyConfirmationDeadline || new Date(Date.now() + 24 * 60 * 60 * 1000),
            buyerDepositWalletId,
            sellerDepositWalletId,
            sellerBankId,
            buyerDepositBankId
        });

        if (isBuyerInitiated && tradeType === TradeType.CRYPTO_TO_FIAT && buyerDepositBankId) {
            await EscrowBankBalance.create({
                escrowId: escrow.id,
                bankId: buyerDepositBankId,
                amount: 0,
                currency: buyCurrency,
                id: '',
                createdAt: new Date(),
                updatedAt: new Date(),
                confirmedByAdmin: true
            });
        }

        // 4. Send Notification
        await EmailService.sendEscrowInvitation(
            counterPartyEmail,
            initiatorEmail,
            Number(amount),
            isBuyerInitiated ? buyCurrency! : sellCurrency!,
            escrow.id
        );

        return escrow;
    }

    async getEscrowById(id: string): Promise<any> {
        try {
            const escrow = await EscrowRepository.findById(id);
            if (!escrow) return null;

            // Safe fetching of users
            const buyer = escrow.buyerId ? await User.findByPk(escrow.buyerId) : null;
            const seller = escrow.sellerId ? await User.findByPk(escrow.sellerId) : null;

            // Fetch reception details for both parties
            let buyerRecipientDetails: any = null;
            let sellerRecipientDetails: any = null;

            try {
                // Buyer receives sellCurrency
                if (escrow.buyerId && escrow.sellCurrency) {
                    buyerRecipientDetails = await BuyerCryptoWalletRepository.findByBuyerIdAndCurrency(escrow.buyerId, escrow.sellCurrency);
                }

                // Seller receives buyCurrency (Crypto) or Fiat (Bank)
                if (escrow.sellerId) {
                    if (escrow.tradeType === TradeType.CRYPTO_TO_CRYPTO && escrow.buyCurrency) {
                        sellerRecipientDetails = await SellerCryptoWalletRepository.findBySellerIdAndCurrency(escrow.sellerId, escrow.buyCurrency);
                    } else if (escrow.tradeType === TradeType.CRYPTO_TO_FIAT) {
                        // For bank, usually checking for the bank account linked or primary
                        sellerRecipientDetails = await SellerBankAccountRepository.findPrimaryBySellerId(escrow.sellerId);
                    }
                }
            } catch (detailsError) {
                console.error("Error fetching recipient details", detailsError);
                // Swallow error to at least return escrow details?
                // Or rethrow if critical. For now, log and proceed with null details.
            }

            return {
                ...escrow.toJSON(),
                buyer: buyer ? { email: buyer.email, kycStatus: buyer.kycStatus } : null,
                seller: seller ? { email: seller.email, kycStatus: seller.kycStatus } : null,
                buyerRecipientDetails,
                sellerRecipientDetails
            };
        } catch (error) {
            console.error(`Error in getEscrowById(${id}):`, error);
            throw error; // Propagate to controller to handle 500
        }
    }

    async getUserEscrows(userId: string, role?: 'buyer' | 'seller'): Promise<Escrow[]> {
        return await EscrowRepository.findAllByUserId(userId, role);
    }

    async getAllEscrows(): Promise<Escrow[]> {
        return await EscrowRepository.findAll();
    }

    async getFundingDetails(escrowId: string): Promise<any> {
        const escrow = await EscrowRepository.findById(escrowId);
        if (!escrow) throw new Error('Escrow not found');

        if (escrow.tradeType === TradeType.CRYPTO_TO_CRYPTO) {
            // Payer funds (Buyer sends SellCurrency, Seller sends BuyCurrency in C2C?)
            // Standard C2C: Initiator (Buyer) buys BuyCurrency by sending SellCurrency.
            // So: 
            // - Buyer sends SellCurrency -> Custodial Wallet (SellCurrency)
            // - Seller sends BuyCurrency -> Custodial Wallet (BuyCurrency)

            const buyerFundingWallet = await CustodialWalletRepository.findByCurrency(escrow.sellCurrency);
            const sellerFundingWallet = await CustodialWalletRepository.findByCurrency(escrow.buyCurrency);

            // Let's return both possible funding targets
            return {
                type: 'CRYPTO_WALLET',
                buyerFundingWallet,
                sellerFundingWallet,
                // Check if balances exist for either
                hasBuyerFunded: await EscrowCryptoWalletBalance.findOne({ where: { escrowId, role: 'BUYER' } }).then(b => !!b),
                hasSellerFunded: await EscrowCryptoWalletBalance.findOne({ where: { escrowId, role: 'SELLER' } }).then(b => !!b)
            };

        } else if (escrow.tradeType === TradeType.CRYPTO_TO_FIAT) {
            // Buyer (Crypto Payer) -> Wallet
            // Seller (Fiat Payer) -> Bank

            // User Rule: "for crypto to fiat for buyer it is the wallet" -> Buyer pays CRYPTO.
            // User Rule: "for seller it is the seller bank account" -> Seller pays FIAT.

            // Buyer (Paying Crypto) -> Needs Wallet matching their currency
            // If Buyer pays Crypto, they pay 'sellCurrency'? (What they give).
            // Let's assume Buyer gives 'sellCurrency' (Crypto).
            const buyerFundingWalletRef = await CustodialWalletRepository.findByCurrency(escrow.sellCurrency);

            // Seller (Paying Fiat) -> Needs Bank.
            // So Seller needs Platform Bank details to wire to.

            let adminBank;
            const balanceRecord = await EscrowBankBalance.findOne({ where: { escrowId } });
            if (balanceRecord) {
                const BankRepository = require('../repositories/BankRepository').default;
                adminBank = await BankRepository.findById(balanceRecord.bankId);
            } else {
                const banks = await import('../repositories/BankRepository').then(m => m.default.findAll());
                adminBank = banks[0];
            }

            return {
                type: 'MIXED',
                buyerFundingWallet: buyerFundingWalletRef,
                adminBank, // For Fiat Funder
                paymentMethod: (escrow as any).paymentMethod,
                hasFunded: !!balanceRecord
            };
        }
        return null;
    }

    async markAsFunded(escrowId: string, payload: { transactionHash?: string, wireReference?: string, amount?: number, bankId?: string }): Promise<Escrow> {
        const escrow = await EscrowRepository.findById(escrowId);
        if (!escrow) throw new Error('Escrow not found');

        // 1. Create Balance Record based on type
        if (escrow.tradeType === TradeType.CRYPTO_TO_FIAT) {
            const pm = (escrow as any).paymentMethod;
            if (pm === 'WIRE_TRANSFER' && payload.bankId) {
                // Create Bank Balance Record (Pending Admin Confirmation)
                await EscrowBankBalance.create({
                    escrowId: escrow.id,
                    bankId: payload.bankId,
                    amount: escrow.amount, // Assuming full funding
                    currency: escrow.buyCurrency, // Fiat currency being paid
                    confirmedByAdmin: false
                } as any);
            } else if (pm === 'PAYPAL') {
                // PayPal handling - might store external ID as "bankId" or separate field?
                // For now, handling as simple state update or simplified record
                console.log(`PayPal transaction ${payload.transactionHash} recorded relative to escrow ${escrow.id}`);
            }
        } else if (escrow.tradeType === TradeType.CRYPTO_TO_CRYPTO) {
            if (payload.transactionHash) {
                // Create Crypto Balance
                await EscrowCryptoWalletBalance.create({
                    escrowId: escrow.id,
                    walletAddress: '0xSenderAddress', // Ideally capture from user or leave blank if unknown
                    role: 'BUYER', // Assuming Buyer funding
                    balance: escrow.amount,
                    currency: escrow.buyCurrency,
                    confirmedByAdmin: false,
                    // Store TxHash? Model might need update or store in a 'notes' field, 
                    // or we rely on 'transactionHash' being verified by backend worker later.
                } as any);
            }
        }

        // 2. Update State
        let newState: any = EscrowState.ONE_PARTY_FUNDED;
        if (escrow.state === EscrowState.ONE_PARTY_FUNDED) {
            newState = EscrowState.COMPLETELY_FUNDED;
        } else if (escrow.state !== EscrowState.INITIALIZED) {
            return escrow;
        }

        (escrow as any).state = newState;
        if (payload.transactionHash || payload.wireReference) {
            // Optionally store reference on escrow itself if fields exist
            (escrow as any).buyerMarkedPaymentSent = true;
        }
        await escrow.save();

        return escrow;
    }

    async adminUpdateEscrow(id: string, updates: any): Promise<Escrow> {
        const escrow = await EscrowRepository.findById(id);
        if (!escrow) throw new Error('Escrow not found');

        // Update basic flags
        if (typeof updates.buyerMarkedPaymentSent === 'boolean') (escrow as any).buyerMarkedPaymentSent = updates.buyerMarkedPaymentSent;
        if (typeof updates.sellerMarkedPaymentSent === 'boolean') (escrow as any).sellerMarkedPaymentSent = updates.sellerMarkedPaymentSent;
        if (typeof updates.buyerConfirmedFunding === 'boolean') (escrow as any).buyerConfirmedFunding = updates.buyerConfirmedFunding;
        if (typeof updates.sellerConfirmedFunding === 'boolean') (escrow as any).sellerConfirmedFunding = updates.sellerConfirmedFunding;

        // Handle Amount Change
        if (updates.amount && updates.amount !== escrow.amount) {

            const newAmount = updates.amount;

            (escrow as any).amount = newAmount;

            // Sync Balances
            if (escrow.tradeType === TradeType.CRYPTO_TO_FIAT) {
                // Update Bank Balance (if exists)
                const bankBalance = await EscrowBankBalance.findOne({ where: { escrowId: escrow.id } });
                if (bankBalance) {
                    (bankBalance as any).amount = newAmount;
                    await bankBalance.save();
                }
                // If no bank balance, maybe they haven't funded yet, so nothing to update until funding.
            } else if (escrow.tradeType === TradeType.CRYPTO_TO_CRYPTO) {
                // Update Crypto Balances (Buyer and Seller wallets if they exist)
                // Typically we track what came in. If Admin says amount is different, we verify stored balance record?
                // Assuming Admin is correcting the record of what "should be" or what "is".

                const cryptoBalances = await EscrowCryptoWalletBalance.findAll({ where: { escrowId: escrow.id } });
                for (const balance of cryptoBalances) {
                    // Update all balances? Or typically there's only one relevant one per role?
                    // For now, update all associated balances to match new agreed amount
                    (balance as any).balance = newAmount;
                    await balance.save();
                }
            }
        }

        await escrow.save();
        return escrow;
    }
}

export default new EscrowService();
