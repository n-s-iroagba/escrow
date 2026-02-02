'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import API_ROUTES from '@/constants/api-routes';
import { usePost, useGet } from '@/hooks/useApiQuery';
import { TradeType, TokenType, PaymentMethod } from '@/constants/enums';

export default function InitiateEscrowPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);

    // Use user profile to pre-fill email? ideally yes but keeping simple
    // Assuming context provides user email, for now hardcoded placeholder or store

    interface FormData {
        isBuyerInitiated: boolean;
        tradeType: typeof TradeType[keyof typeof TradeType];
        buyCurrency: string;
        sellCurrency: string;
        amount: string;
        counterPartyEmail: string;
        paymentMethod: string;
        counterPartyConfirmationDeadline: string;
        walletAddress: string;
        walletNetwork: string;
        bankAccountNumber: string;
        bankAccountHolderName: string;
        bankRoutingNumber: string;
        bankIban: string;
        bankSwift: string;
    }

    const [formData, setFormData] = useState<FormData>({
        isBuyerInitiated: true, // Default to Buyer role
        tradeType: TradeType.CRYPTO_TO_CRYPTO,
        buyCurrency: 'BTC',
        sellCurrency: 'USDT',
        amount: '',
        counterPartyEmail: '',
        paymentMethod: '',
        counterPartyConfirmationDeadline: '',

        // Reception details
        walletAddress: '',
        walletNetwork: 'mainnet',

        // Bank Details (if Seller & Crypto-Fiat)
        bankAccountNumber: '',
        bankAccountHolderName: '',
        bankRoutingNumber: '',
        bankIban: '',
        bankSwift: '',
    });

    const { post, isPending, error } = usePost(API_ROUTES.ESCROWS.CREATE, {
        onSuccess: (data) => {
            router.push(`/trader/escrow/${data.id}`);
        },
    });

    const { data: banks } = useGet(API_ROUTES.BANKS.GET_ALL);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRoleSelect = (role: 'buyer' | 'seller') => {
        setFormData(prev => ({ ...prev, isBuyerInitiated: role === 'buyer' }));
    };

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload: any = {
            isBuyerInitiated: formData.isBuyerInitiated,
            tradeType: formData.tradeType,
            buyCurrency: formData.buyCurrency,
            sellCurrency: formData.sellCurrency,
            amount: parseFloat(formData.amount),
            counterPartyEmail: formData.counterPartyEmail,
            paymentMethod: formData.paymentMethod,
            // Construct deadline date
            counterPartyConfirmationDeadline: new Date(Date.now() + (parseInt(formData.counterPartyConfirmationDeadline || '24') * 60 * 60 * 1000)),
        };

        // Attach reception details based on rules
        const isCryptoFiat = formData.tradeType === TradeType.CRYPTO_TO_FIAT;

        if (formData.isBuyerInitiated) {
            // Buyer needs wallet to receive crypto
            // (Assuming buyer always buying crypto in this context based on "buyCurrency")
            payload.walletDetails = {
                walletAddress: formData.walletAddress,
                network: formData.walletNetwork
            };
        } else {
            // Seller Initiated
            if (isCryptoFiat) {
                // Seller receiving Fiat -> Bank
                payload.bankDetails = {
                    accountNumber: formData.bankAccountNumber,
                    accountHolderName: formData.bankAccountHolderName,
                    routingNumber: formData.bankRoutingNumber,
                    iban: formData.bankIban,
                    swift: formData.bankSwift
                };
            } else {
                // Crypto-Crypto -> Seller receiving Crypto -> Wallet
                payload.walletDetails = {
                    walletAddress: formData.walletAddress,
                    network: formData.walletNetwork
                };
            }
        }

        await post(payload);
    };

    return (
        <div className="min-h-screen bg-[#f6f8f6] p-8 font-display text-[#0d1b12]">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Initiate Escrow</h1>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    {/* Stepper Indicator */}
                    <div className="flex items-center gap-4 mb-8 text-sm">
                        <span className={`font-bold ${step >= 1 ? 'text-[#13ec5b]' : 'text-gray-400'}`}>1. Transaction</span>
                        <div className="h-px bg-gray-200 flex-1"></div>
                        <span className={`font-bold ${step >= 2 ? 'text-[#13ec5b]' : 'text-gray-400'}`}>2. Details</span>
                        <div className="h-px bg-gray-200 flex-1"></div>
                        <span className={`font-bold ${step >= 3 ? 'text-[#13ec5b]' : 'text-gray-400'}`}>3. Reception</span>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {step === 1 && (
                            <div className="space-y-6">
                                {/* Role Selection */}
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-700">I am the...</label>
                                    <div className="flex gap-4">
                                        <button
                                            type="button"
                                            onClick={() => handleRoleSelect('buyer')}
                                            className={`flex-1 py-3 rounded-xl border-2 transition-all font-bold ${formData.isBuyerInitiated ? 'border-[#13ec5b] bg-green-50 text-[#0d1b12]' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}
                                        >
                                            Buyer
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleRoleSelect('seller')}
                                            className={`flex-1 py-3 rounded-xl border-2 transition-all font-bold ${!formData.isBuyerInitiated ? 'border-[#13ec5b] bg-green-50 text-[#0d1b12]' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}
                                        >
                                            Seller
                                        </button>
                                    </div>
                                </div>

                                {/* Trade Type */}
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-700">Trade Type</label>
                                    <select
                                        name="tradeType"
                                        value={formData.tradeType}
                                        onChange={handleInputChange}
                                        className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 outline-none"
                                    >
                                        <option value={TradeType.CRYPTO_TO_CRYPTO}>Crypto → Crypto</option>
                                        <option value={TradeType.CRYPTO_TO_FIAT}>Crypto → Fiat</option>
                                    </select>
                                </div>

                                {/* Currencies */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-700">Buying (Receiving)</label>
                                        <select
                                            name="buyCurrency"
                                            value={formData.buyCurrency}
                                            onChange={handleInputChange}
                                            className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 outline-none"
                                        >
                                            <option value="BTC">BTC</option>
                                            <option value="ETH">ETH</option>
                                            <option value="USDT">USDT</option>
                                            {formData.tradeType === TradeType.CRYPTO_TO_FIAT && (
                                                <>
                                                    <option value="USD">USD</option>
                                                    <option value="EUR">EUR</option>
                                                </>
                                            )}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-700">Selling (Sending)</label>
                                        <select
                                            name="sellCurrency"
                                            value={formData.sellCurrency}
                                            onChange={handleInputChange}
                                            className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 outline-none"
                                        >
                                            <option value="BTC">BTC</option>
                                            <option value="ETH">ETH</option>
                                            <option value="USDT">USDT</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Amount */}
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-700">Transaction Value</label>
                                    <input
                                        type="number"
                                        name="amount"
                                        value={formData.amount}
                                        onChange={handleInputChange}
                                        className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 outline-none"
                                        placeholder="0.00"
                                    />
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button onClick={nextStep} type="button" className="px-6 py-3 bg-[#13ec5b] rounded-xl font-bold">Next</button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6">
                                {/* Payment Method (If Buyer & Crypto-Fiat) */}
                                {formData.isBuyerInitiated && formData.tradeType === TradeType.CRYPTO_TO_FIAT && (
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-700">Payment Method</label>
                                        <select
                                            name="paymentMethod"
                                            value={formData.paymentMethod}
                                            onChange={handleInputChange}
                                            className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 outline-none"
                                        >
                                            <option value="">Select Method</option>
                                            {parseFloat(formData.amount) < 60000 && <option value={PaymentMethod.PAYPAL}>PayPal</option>}
                                            <option value={PaymentMethod.WIRE_TRANSFER}>Wire Transfer</option>
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-700">Counterparty Email</label>
                                    <input
                                        type="email"
                                        name="counterPartyEmail"
                                        value={formData.counterPartyEmail}
                                        onChange={handleInputChange}
                                        className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 outline-none"
                                        placeholder="email@example.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-700">Conf. Deadline (Hours)</label>
                                    <input
                                        type="number"
                                        name="counterPartyConfirmationDeadline"
                                        value={formData.counterPartyConfirmationDeadline}
                                        onChange={handleInputChange}
                                        className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 outline-none"
                                        placeholder="24"
                                    />
                                </div>

                                <div className="flex justify-between pt-4">
                                    <button onClick={prevStep} type="button" className="px-6 py-3 bg-gray-100 rounded-xl font-bold">Back</button>
                                    <button onClick={nextStep} type="button" className="px-6 py-3 bg-[#13ec5b] rounded-xl font-bold">Next</button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6">
                                <h3 className="font-bold text-lg">Where should you receive assets?</h3>

                                {(!formData.isBuyerInitiated && formData.tradeType === TradeType.CRYPTO_TO_FIAT) ? (
                                    // Seller receiving Fiat -> Bank Form
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-gray-700">Account Holder Name</label>
                                            <input type="text" name="bankAccountHolderName" value={formData.bankAccountHolderName} onChange={handleInputChange} className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-gray-700">Account Number</label>
                                            <input type="text" name="bankAccountNumber" value={formData.bankAccountNumber} onChange={handleInputChange} className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 outline-none" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2 text-gray-700">Routing Number</label>
                                                <input type="text" name="bankRoutingNumber" value={formData.bankRoutingNumber} onChange={handleInputChange} className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-2 text-gray-700">SWIFT</label>
                                                <input type="text" name="bankSwift" value={formData.bankSwift} onChange={handleInputChange} className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 outline-none" />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    // Receiving Crypto -> Wallet Form
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-gray-700">Wallet Address</label>
                                            <input type="text" name="walletAddress" value={formData.walletAddress} onChange={handleInputChange} className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 outline-none font-mono" placeholder="0x..." />
                                        </div>
                                    </>
                                )}

                                {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</div>}

                                <div className="flex justify-between pt-4">
                                    <button onClick={prevStep} type="button" className="px-6 py-3 bg-gray-100 rounded-xl font-bold">Back</button>
                                    <button type="submit" disabled={isPending} className="px-8 py-3 bg-[#13ec5b] rounded-xl font-bold shadow-lg shadow-green-200">
                                        {isPending ? 'Initializing...' : 'Initialize Escrow'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
