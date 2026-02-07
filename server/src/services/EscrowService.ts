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
    amount: number;
    buyerDepositWalletId?: string;
    sellerDepositWalletId?: string;
}

class EscrowService {
    private async fetchConvertedAmount(from: string, to: string, amount: number): Promise<number> {
        try {
            const response = await fetch(`https://api.coinconvert.net/convert/${from.toLowerCase()}/${to.toLowerCase()}?amount=${amount}`);
            const data: any = await response.json();

            if (data.status === 'success' && data[to.toUpperCase()]) {
                return parseFloat(data[to.toUpperCase()]);
            }
            return 0;
        } catch (error) {
            console.error('Error converting currency:', error);
            return 0;
        }
    }

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
            buyerDepositWalletId: payloadBuyerWalletId,
            sellerDepositWalletId: payloadSellerWalletId,
            ...rest
        } = data;
        try {
            console.log('Initiate Escrow Payload:', JSON.stringify(data, null, 2));

            // Calculate Deposit Amounts
            let buyerDepositAmount = 0;
            let sellerDepositAmount = 0;

            if (isBuyerInitiated) {
                buyerDepositAmount = Number(amount);
                sellerDepositAmount = await this.fetchConvertedAmount(buyCurrency, sellCurrency, buyerDepositAmount);
            } else {
                sellerDepositAmount = Number(amount);
                buyerDepositAmount = await this.fetchConvertedAmount(sellCurrency, buyCurrency, sellerDepositAmount);
            }

            // Apply 1% Fee to Fee Payer
            if (data.feePayer === 'buyer') {
                buyerDepositAmount = buyerDepositAmount * 1.01;
            } else if (data.feePayer === 'seller') {
                sellerDepositAmount = sellerDepositAmount * 1.01;
            }

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
            let buyerDepositWalletId: string | undefined = payloadBuyerWalletId;
            let sellerDepositWalletId: string | undefined = payloadSellerWalletId;
            let sellerBankId: string | undefined;
            let buyerDepositBankId: string | undefined;


            if (isBuyerInitiated) {
                console.log(`Buyer Initiated: TradeType=${tradeType}, Buy=${buyCurrency}, Sell=${sellCurrency}`);
                if (tradeType === TradeType.CRYPTO_TO_CRYPTO) {
                    // Buyer deposits BuyCurrency (Crypto) -> Custodial Wallet
                    if (!buyerDepositWalletId) {
                        console.log(`Looking for Buyer Custodial Wallet for ${buyCurrency}`);
                        const buyerWallet = await CustodialWalletRepository.findByCurrency(buyCurrency);
                        if (buyerWallet) buyerDepositWalletId = buyerWallet.id;
                        console.log(`Found Buyer Wallet: ${buyerWallet?.id}`);
                    } else {
                        console.log(`Using Payload Buyer Wallet ID: ${buyerDepositWalletId}`);
                    }

                    // Seller deposits SellCurrency (Crypto) -> Custodial Wallet
                    // NOTE: Seller didn't choose yet (unless initiator selected for them? likely not). 
                    // Logic: If payload has it, use it. Else default.
                    if (!sellerDepositWalletId) {
                        console.log(`Looking for Seller Custodial Wallet for ${sellCurrency}`);
                        const sellerWallet = await CustodialWalletRepository.findByCurrency(sellCurrency);
                        if (sellerWallet) sellerDepositWalletId = sellerWallet.id;
                        console.log(`Found Seller Wallet: ${sellerWallet?.id}`);
                    }

                } else if (tradeType === TradeType.CRYPTO_TO_FIAT && selectedBankId) {
                    console.log(`Using Payload Bank ID: ${selectedBankId}`);
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
                console.log(`Buyer crypto details: TradeType=${tradeType}, Buy=${buyCurrency}, Sell=${sellCurrency}`);
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
                console.log(`Seller Initiated: TradeType=${tradeType}, Buy=${buyCurrency}, Sell=${sellCurrency}`);
                if (tradeType === TradeType.CRYPTO_TO_CRYPTO) {
                    // Seller deposits SellCurrency
                    // Use payload ID if valid, else default
                    if (!sellerDepositWalletId) {
                        console.log(`Looking for Seller Custodial Wallet for ${sellCurrency}`);
                        const sellerWallet = await CustodialWalletRepository.findByCurrency(sellCurrency);
                        if (sellerWallet) sellerDepositWalletId = sellerWallet.id;
                        console.log(`Found Seller Wallet: ${sellerWallet?.id}`);
                    } else {
                        console.log(`Using Payload Seller Wallet ID: ${sellerDepositWalletId}`);
                    }

                    // Buyer deposits BuyCurrency
                    if (!buyerDepositWalletId) {
                        console.log(`Looking for Buyer Custodial Wallet for ${buyCurrency}`);
                        const buyerWallet = await CustodialWalletRepository.findByCurrency(buyCurrency);
                        if (buyerWallet) buyerDepositWalletId = buyerWallet.id;
                        console.log(`Found Buyer Wallet: ${buyerWallet?.id}`);
                    }

                    // Seller receiving Crypto -> This is stored in RECIPIENT part (SellerCryptoWallet), not Escrow.sellerDepositWalletId
                    // Careful: Escrow.sellerDepositWalletId is where SELLER DEPOSITS money (Custodial).

                    // The walletDetails in payload is for where Initiator (Seller) RECEIVES money.
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

                    // Seller pays Crypto (SellCurrency) -> Custodial
                    if (!sellerDepositWalletId) {
                        const sellerWallet = await CustodialWalletRepository.findByCurrency(sellCurrency);
                        if (sellerWallet) sellerDepositWalletId = sellerWallet.id;
                    }
                }
            }

            // 3. Create Escrow
            console.log(`Creating Escrow: TradeType=${tradeType}, Buy=${buyCurrency}, Sell=${sellCurrency}`);
            const escrow = await EscrowRepository.create({
                ...rest,
                tradeType,

                buyCurrency,
                sellCurrency,
                buyerDepositAmount,
                sellerDepositAmount,
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
            console.log('Escrow created:', escrow);

            if (isBuyerInitiated && tradeType === TradeType.CRYPTO_TO_FIAT && buyerDepositBankId) {
                await EscrowBankBalance.create({
                    escrowId: escrow.id,
                    bankId: buyerDepositBankId,
                    amount: 0,
                    currency: buyCurrency,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    confirmedByAdmin: true
                });
            }

            // 4. Send Notification
            await EmailService.sendEscrowInvitation(
                counterPartyEmail,
                initiatorEmail,
                isBuyerInitiated ? buyCurrency === 'USD' || buyCurrency === 'EUR' || buyCurrency === 'GBP' ? buyerDepositAmount : amount : amount, // Show what initiator is offering? Or primary amount? 
                // Better logic: Show the PRIMARY amount/currency of the deal defined by Initiator
                isBuyerInitiated ? buyCurrency : sellCurrency,
                escrow.id,
                // tradeType removed from signature
                isBuyerInitiated ? sellerDepositAmount : buyerDepositAmount, // Counter Amount
                isBuyerInitiated ? sellCurrency : buyCurrency, // Counter Currency
                isBuyerInitiated ? 'BUYER' : 'SELLER'
            );

            return escrow;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async getEscrowById(id: string): Promise<any> {
        try {
            const escrow = await EscrowRepository.findById(id);
            if (!escrow) return null;

            // Safe fetching of users
            const buyer = escrow.buyerId ? await User.findByPk(escrow.buyerId) : null;
            const seller = escrow.sellerId ? await User.findByPk(escrow.sellerId) : null;

            // Fetch Balances
            const bankBalance = await EscrowBankBalance.findOne({ where: { escrowId: id } });
            const cryptoBalances = await EscrowCryptoWalletBalance.findAll({ where: { escrowId: id } });

            // Fetch reception details
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
                        // For C2F, Seller receives Fiat. Needs Bank Account.
                        // We fetch their primary bank account.
                        sellerRecipientDetails = await SellerBankAccountRepository.findPrimaryBySellerId(escrow.sellerId);
                    }
                }
            } catch (detailsError) {
                console.error("Error fetching recipient details", detailsError);
            }

            return {
                ...escrow.toJSON(),
                buyer: buyer ? { email: buyer.email, kycStatus: buyer.kycStatus } : null,
                seller: seller ? { email: seller.email, kycStatus: seller.kycStatus } : null,
                buyerRecipientDetails,
                sellerRecipientDetails,
                bankBalance,
                cryptoBalances
            };
        } catch (error) {
            console.error(`Error in getEscrowById(${id}):`, error);
            throw error; // Propagate to controller to handle 500
        }
    }

    async getUserEscrows(userId: string, role?: 'buyer' | 'seller'): Promise<Escrow[]> {
        try {
            return await EscrowRepository.findAllByUserId(userId, role);
        } catch (error) {
            console.error(`Error in getUserEscrows(${userId}, ${role}):`, error);
            throw error;
        }
    }

    async getAllEscrows(): Promise<Escrow[]> {
        try {
            return await EscrowRepository.findAll();
        } catch (error) {
            console.error('Error in getAllEscrows:', error);
            throw error;
        }
    }

    async getFundingDetails(escrowId: string): Promise<any> {
        try {
            console.log(`Getting funding details for ${escrowId}`);
            const escrow = await EscrowRepository.findById(escrowId);
            if (!escrow) throw new Error('Escrow not found');

            if (escrow.tradeType === TradeType.CRYPTO_TO_CRYPTO) {
                // Requirement:
                // Buyer -> Custodial Wallet for BuyCurrency
                // Seller -> Custodial Wallet for SellCurrency

                let buyerFundingWallet = null;
                if (escrow.buyerDepositWalletId) {
                    buyerFundingWallet = await CustodialWalletRepository.findById(escrow.buyerDepositWalletId);
                }
                if (!buyerFundingWallet) {
                    console.log(`Falling back to findByCurrency for Buyer (Buy: ${escrow.buyCurrency})`);
                    buyerFundingWallet = await CustodialWalletRepository.findByCurrency(escrow.buyCurrency);
                }

                let sellerFundingWallet = null;
                if (escrow.sellerDepositWalletId) {
                    sellerFundingWallet = await CustodialWalletRepository.findById(escrow.sellerDepositWalletId);
                }
                if (!sellerFundingWallet) {
                    console.log(`Falling back to findByCurrency for Seller (Sell: ${escrow.sellCurrency})`);
                    sellerFundingWallet = await CustodialWalletRepository.findByCurrency(escrow.sellCurrency);
                }

                console.log('C2C Wallets:', { buyerFundingWallet, sellerFundingWallet });

                return {
                    type: 'CRYPTO_WALLET',
                    buyerFundingWallet,
                    sellerFundingWallet,
                    hasBuyerFunded: escrow.buyerMarkedPaymentSent,
                    hasSellerFunded: escrow.sellerMarkedPaymentSent
                };

            } else if (escrow.tradeType === TradeType.CRYPTO_TO_FIAT) {
                // Requirement:
                // Buyer (if paying Fiat/Wire) -> EscrowBankBalance.bank (Bank ID)
                // Seller (Paying Crypto) -> Custodial Wallet matches SellCurrency

                // 1. Resolve Admin Bank for Buyer (Fiat Payer)
                let adminBank = null;
                // Check if specific bank attached to escrow (e.g. escrow.buyerDepositBankId from initiate)
                // Or try to find via EscrowBankBalance
                if (escrow.buyerDepositBankId) {
                    const BankRepository = require('../repositories/BankRepository').default;
                    adminBank = await BankRepository.findById(escrow.buyerDepositBankId);
                }
                if (!adminBank) {
                    // Fallback: Find primary bank or any bank
                    const BankRepository = require('../repositories/BankRepository').default;
                    const banks = await BankRepository.findAll();
                    if (banks.length > 0) adminBank = banks[0];
                }

                // 2. Resolve Wallet for Seller (Crypto Payer)
                let sellerFundingWallet = null;
                if (escrow.sellerDepositWalletId) {
                    sellerFundingWallet = await CustodialWalletRepository.findById(escrow.sellerDepositWalletId);
                }
                if (!sellerFundingWallet) {
                    console.log(`Falling back to findByCurrency for Seller C2F (Sell: ${escrow.sellCurrency})`);
                    sellerFundingWallet = await CustodialWalletRepository.findByCurrency(escrow.sellCurrency);
                }

                console.log('C2F Funding:', { adminBank, sellerFundingWallet });

                return {
                    type: 'MIXED',
                    adminBank,             // For Buyer (Fiat)
                    sellerFundingWallet,   // For Seller (Crypto)
                    paymentMethod: (escrow as any).paymentMethod,
                    hasBuyerFunded: escrow.buyerMarkedPaymentSent,
                    hasSellerFunded: escrow.sellerMarkedPaymentSent
                };
            }
            return null;
        } catch (error) {
            console.error(`Error in getFundingDetails(${escrowId}):`, error);
            throw error;
        }
    }

    async markAsFunded(escrowId: string, payload: { amount: number, role: 'BUYER' | 'SELLER', confirmed: boolean, bankId?: string }): Promise<Escrow> {
        try {
            const escrow = await EscrowRepository.findById(escrowId);
            if (!escrow) throw new Error('Escrow not found');

            const { amount, role, confirmed, bankId } = payload;

            if (escrow.tradeType === TradeType.CRYPTO_TO_FIAT) {
                if (role === 'BUYER') {
                    // Buyer pays Fiat -> Bank Balance
                    let balance = await EscrowBankBalance.findOne({ where: { escrowId: escrow.id } });

                    if (balance) {
                        (balance as any).amount = amount;
                        (balance as any).confirmedByAdmin = confirmed;
                        await balance.save();
                    } else {
                        await EscrowBankBalance.create({
                            escrowId: escrow.id,
                            amount: amount,
                            currency: escrow.buyCurrency,
                            confirmedByAdmin: confirmed,
                            bankId: bankId || escrow.buyerDepositBankId // Use payload bankId if available, else fallback to escrow default
                        } as any);
                    }

                    if (confirmed) {
                        (escrow as any).buyerConfirmedFunding = true;


                        const seller = await User.findByPk(escrow.sellerId, { include: ['kycDocument'] });

                        if (seller) {
                            const sellerName = (seller as any).kycDocument?.fullName || escrow.sellerEmail;
                            await EmailService.sendBuyerFundedNotification(
                                escrow.sellerEmail,
                                escrow.id,
                                amount,
                                escrow.buyCurrency, // Amount is in BuyCurrency (Fiat)
                                sellerName
                            );
                        }
                    }

                } else if (role === 'SELLER') {
                    // Seller pays Crypto -> Crypto Balance
                    let balance = await EscrowCryptoWalletBalance.findOne({
                        where: { escrowId: escrow.id, role: 'SELLER' }
                    });

                    if (balance) {
                        (balance as any).balance = amount;
                        (balance as any).confirmedByAdmin = confirmed;
                        await balance.save();
                    } else {
                        await EscrowCryptoWalletBalance.create({
                            escrowId: escrow.id,
                            role: 'SELLER',
                            balance: amount,
                            currency: escrow.sellCurrency,
                            confirmedByAdmin: confirmed,
                            walletAddress: 'MANUAL_ADMIN_ENTRY' // Or from payload if we had it
                        } as any);
                    }

                    if (confirmed) {
                        (escrow as any).sellerConfirmedFunding = true;

                        const buyer = await User.findByPk(escrow.buyerId, { include: ['kycDocument'] });

                        if (buyer) {
                            const buyerName = (buyer as any).kycDocument?.fullName || escrow.buyerEmail;
                            await EmailService.sendSellerFundedNotification(
                                escrow.buyerEmail,
                                escrow.id,
                                amount,
                                escrow.sellCurrency, // Amount is in SellCurrency
                                buyerName
                            );
                        }
                    }
                }
            } else if (escrow.tradeType === TradeType.CRYPTO_TO_CRYPTO) {
                // Both pay Crypto
                const currency = role === 'BUYER' ? escrow.buyCurrency : escrow.sellCurrency;

                let balance = await EscrowCryptoWalletBalance.findOne({
                    where: { escrowId: escrow.id, role: role }
                });

                if (balance) {
                    (balance as any).balance = amount;
                    (balance as any).confirmedByAdmin = confirmed;
                    await balance.save();
                } else {
                    await EscrowCryptoWalletBalance.create({
                        escrowId: escrow.id,
                        role: role,
                        balance: amount,
                        currency: currency,
                        confirmedByAdmin: confirmed,
                        walletAddress: 'MANUAL_ADMIN_ENTRY'
                    } as any);
                }

                if (confirmed) {
                    if (role === 'BUYER') {
                        (escrow as any).buyerConfirmedFunding = true;
                        // Send Email to Seller
                        const seller = await User.findByPk(escrow.sellerId, { include: ['kycDocument'] });
                        if (seller) {
                            const sellerName = (seller as any).kycDocument?.fullName || seller.email;
                            await EmailService.sendBuyerFundedNotification(
                                seller.email,
                                escrow.id,
                                amount,
                                currency,
                                sellerName
                            );
                        }
                    }
                    if (role === 'SELLER') {
                        (escrow as any).sellerConfirmedFunding = true;
                        // Send Email to Buyer
                        const buyer = await User.findByPk(escrow.buyerId, { include: ['kycDocument'] });
                        if (buyer) {
                            const buyerName = (buyer as any).kycDocument?.fullName || buyer.email;
                            await EmailService.sendSellerFundedNotification(
                                buyer.email,
                                escrow.id,
                                amount,
                                currency,
                                buyerName
                            );
                        }
                    }
                }
            }

            await escrow.save();
            return escrow;
        } catch (error) {
            console.error(`Error in markAsFunded(${escrowId}):`, error);
            throw error;
        }
    }

    async adminUpdateEscrow(id: string, updates: any): Promise<Escrow> {
        try {
            const escrow = await EscrowRepository.findById(id);
            if (!escrow) throw new Error('Escrow not found');

            // Update basic flags
            if (typeof updates.buyerMarkedPaymentSent === 'boolean') (escrow as any).buyerMarkedPaymentSent = updates.buyerMarkedPaymentSent;
            if (typeof updates.sellerMarkedPaymentSent === 'boolean') (escrow as any).sellerMarkedPaymentSent = updates.sellerMarkedPaymentSent;
            if (typeof updates.buyerConfirmedFunding === 'boolean') (escrow as any).buyerConfirmedFunding = updates.buyerConfirmedFunding;
            if (typeof updates.sellerConfirmedFunding === 'boolean') (escrow as any).sellerConfirmedFunding = updates.sellerConfirmedFunding;
            if (updates.state) (escrow as any).state = updates.state;

            // Handle Amount Change
            if (updates.amount && updates.amount
            ) {

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

            // Handle Specific Balance Updates (Admin Override)
            if (updates.balanceUpdates) {
                const balanceUpdates = Array.isArray(updates.balanceUpdates) ? updates.balanceUpdates : [updates.balanceUpdates];

                for (const update of balanceUpdates) {
                    if (update.type === 'BANK') {
                        // Update or Create Bank Balance (Fiat)
                        let balance = await EscrowBankBalance.findOne({ where: { escrowId: id } });

                        if (balance) {
                            if (update.amount !== undefined) (balance as any).amount = update.amount;
                            if (typeof update.confirmed === 'boolean') (balance as any).confirmedByAdmin = update.confirmed;
                            await balance.save();
                        } else {
                            // Create new if missing
                            await EscrowBankBalance.create({
                                escrowId: id,
                                amount: update.amount || escrow.buyerDepositAmount,
                                currency: escrow.buyCurrency,
                                confirmedByAdmin: update.confirmed || false,
                                bankId: escrow.buyerDepositBankId || update.bankId // Use existing or provided
                            } as any);
                        }
                    }
                    else if (update.type === 'CRYPTO') {
                        // Update Crypto Balance
                        // Role is required to distinguish Buyer/Seller side
                        if (!update.role) continue;

                        let balance = await EscrowCryptoWalletBalance.findOne({
                            where: { escrowId: id, role: update.role }
                        });

                        if (balance) {
                            if (update.amount !== undefined) (balance as any).balance = update.amount;
                            if (typeof update.confirmed === 'boolean') (balance as any).confirmedByAdmin = update.confirmed;
                            await balance.save();
                        } else {
                            // Create
                            // Determine currency based on role and trade type
                            let currency = '';
                            if (escrow.tradeType === TradeType.CRYPTO_TO_CRYPTO) {
                                currency = update.role === 'BUYER' ? escrow.buyCurrency : escrow.sellCurrency;
                            } else {
                                // C2F: Buyer pays Fiat (Bank), Seller pays Crypto (SellCurrency)
                                // So if role is SELLER, it's SellCurrency. 
                                // If role is BUYER, it shouldn't happen for Crypto, but maybe user wants to record crypto sent by buyer in C2F? Unlikely.
                                currency = escrow.sellCurrency;
                            }

                            if (currency) {
                                await EscrowCryptoWalletBalance.create({
                                    escrowId: id,
                                    role: update.role,
                                    balance: update.amount || escrow.buyerDepositAmount,
                                    currency: currency,
                                    confirmedByAdmin: update.confirmed || false,
                                    walletAddress: update.walletAddress || 'MANUAL_ADMIN_ENTRY'
                                } as any);
                            }
                        }
                    }
                }
            }

            await escrow.save();
            return escrow;
        } catch (error) {
            console.error(`Error in adminUpdateEscrow(${id}):`, error);
            throw error;
        }
    }
}

export default new EscrowService();
