import Escrow, { IEscrow } from '../models/Escrow';
import EscrowRepository from '../repositories/EscrowRepository';
import User from '../models/User';
import sendEmail from '../config/mailer';
import { TradeType, EscrowState } from '../utils/constants';
import SellerBankAccountRepository from '../repositories/SellerBankAccountRepository';
import SellerCryptoWalletRepository from '../repositories/SellerCryptoWalletRepository';
import BuyerCryptoWalletRepository from '../repositories/BuyerCryptoWalletRepository';
import CustodialWalletRepository from '../repositories/CustodialWalletRepository';
import EscrowBankBalance from '../models/EscrowBankBalance';
import EscrowCryptoWalletBalance from '../models/EscrowCryptoWalletBalance';

interface IInitiateEscrowPayload extends Partial<IEscrow> {
    paymentMethod?: string; // This is payload, but check Escrow model for storage
    counterPartyEmail: string;
    bankDetails?: {
        accountNumber: string;
        accountHolderName: string;
        routingNumber?: string;
        iban?: string;
        swift?: string;
    };
    walletDetails?: {
        walletAddress: string;
        network?: string;
    };
}

class EscrowService {
    async initiateEscrow(data: IInitiateEscrowPayload, initiatorEmail: string): Promise<Escrow> {
        const {
            tradeType,
            amount,
            paymentMethod,
            counterPartyEmail,
            bankDetails,
            walletDetails,
            buyCurrency,
            sellCurrency,
            isBuyerInitiated,
            ...rest
        } = data;

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

        // 2. Asset Reception Logic (Wallets/Banks)
        if (isBuyerInitiated) {
            // Buyer receiving Crypto?
            if (walletDetails && buyerId) {
                await BuyerCryptoWalletRepository.create({
                    buyerId: buyerId,
                    currency: buyCurrency,
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
                        currency: sellCurrency,
                        walletAddress: walletDetails.walletAddress,
                        network: walletDetails.network || 'mainnet'
                    });
                }
            } else if (tradeType === TradeType.CRYPTO_TO_FIAT) {
                // Seller receiving Fiat
                if (bankDetails && sellerId) {
                    await SellerBankAccountRepository.create({
                        sellerId: sellerId,
                        accountNumber: bankDetails.accountNumber,
                        accountHolderName: bankDetails.accountHolderName,
                        routingNumber: bankDetails.routingNumber,
                        iban: bankDetails.iban,
                        swift: bankDetails.swift,
                        isPrimary: true,
                        isVerified: false
                    });
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
            isBuyerInitiated,
            buyerEmail,
            sellerEmail,
            buyerId,
            sellerId,
            state: EscrowState.INITIALIZED,
            // Default dates/flags handled by model/DB if not present
            counterPartyConfirmationDeadline: data.counterPartyConfirmationDeadline || new Date(Date.now() + 24 * 60 * 60 * 1000)
        });

        // 4. Send Notification
        if (sendEmail) {
            await sendEmail({
                to: counterPartyEmail,
                subject: 'You have a new Escrow Transaction',
                text: `Hello, you have been invited to an escrow transaction by ${initiatorEmail}. Amount: ${amount} ${isBuyerInitiated ? buyCurrency : sellCurrency}. Please log in to view details.`
            });
        }

        return escrow;
    }

    async getEscrowById(id: string): Promise<any> {
        const escrow = await EscrowRepository.findById(id);
        if (!escrow) return null;

        const buyer = await User.findOne({ where: { id: escrow.buyerId } });
        const seller = await User.findOne({ where: { id: escrow.sellerId } });

        let recipientDetails: any = null;

        // Fetch reception details based on trade logic
        if (escrow.isBuyerInitiated) {
            // Buyer receiving (e.g. Crypto)
            if (escrow.buyerId) {
                recipientDetails = await BuyerCryptoWalletRepository.findByBuyerIdAndCurrency(escrow.buyerId, escrow.buyCurrency);
            }
        } else {
            // Seller Initiated
            if (escrow.tradeType === TradeType.CRYPTO_TO_CRYPTO && escrow.sellerId) {
                recipientDetails = await SellerCryptoWalletRepository.findBySellerIdAndCurrency(escrow.sellerId, escrow.sellCurrency);
            } else if (escrow.tradeType === TradeType.CRYPTO_TO_FIAT && escrow.sellerId) {
                // For bank, might need to find specific one or primary. 
                // Assuming we created one as primary during initiation.
                recipientDetails = await SellerBankAccountRepository.findPrimaryBySellerId(escrow.sellerId);
            }
        }

        return {
            ...escrow.toJSON(),
            buyer: buyer ? { email: buyer.email, kycStatus: buyer.kycStatus } : null,
            seller: seller ? { email: seller.email, kycStatus: seller.kycStatus } : null,
            recipientDetails
        };
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
            const fundsWallet = await CustodialWalletRepository.findByCurrency(escrow.buyCurrency); // Payer funds
            const assetWallet = await CustodialWalletRepository.findByCurrency(escrow.sellCurrency); // Seller funds

            // Check if balances exist
            const existingBalance = await EscrowCryptoWalletBalance.findOne({ where: { escrowId, role: 'BUYER' } }); // Simplified role check

            return {
                type: 'CRYPTO_WALLET',
                fundsWallet,
                assetWallet,
                hasFunded: !!existingBalance
            };

        } else if (escrow.tradeType === TradeType.CRYPTO_TO_FIAT) {
            // Check for linked Bank Balance to see if a specific bank was assigned
            const balanceRecord = await EscrowBankBalance.findOne({ where: { escrowId } });

            let adminBank;
            if (balanceRecord) {
                const BankRepository = require('../repositories/BankRepository').default;
                adminBank = await BankRepository.findById(balanceRecord.bankId);
            } else {
                const banks = await import('../repositories/BankRepository').then(m => m.default.findAll());
                adminBank = banks[0];
            }

            const assetWallet = await CustodialWalletRepository.findByCurrency(escrow.sellCurrency);

            return {
                type: 'BANK_AND_WALLET',
                adminBank,
                assetWallet,
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
