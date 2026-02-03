'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import API_ROUTES from '@/constants/api-routes';
import { usePost, useGet } from '@/hooks/useApiQuery';
import { TradeType, PaymentMethod } from '@/constants/enums';
import { ArrowLeft, ArrowRight, Check, ShieldCheck, Coins, Banknote, Wallet } from 'lucide-react';
import Link from 'next/link';

export default function InitiateEscrowPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);

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
        isBuyerInitiated: true,
        tradeType: TradeType.CRYPTO_TO_CRYPTO,
        buyCurrency: 'BTC',
        sellCurrency: 'USDT',
        amount: '',
        counterPartyEmail: '',
        paymentMethod: '',
        counterPartyConfirmationDeadline: '24',
        walletAddress: '',
        walletNetwork: 'mainnet',
        bankAccountNumber: '',
        bankAccountHolderName: '',
        bankRoutingNumber: '',
        bankIban: '',
        bankSwift: '',
    });

    const { post, isPending, error } = usePost(API_ROUTES.ESCROWS.CREATE, {
        onSuccess: (data) => router.push(`/trader/escrow/${data.id}`),
    });

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
            counterPartyConfirmationDeadline: new Date(Date.now() + (parseInt(formData.counterPartyConfirmationDeadline || '24') * 60 * 60 * 1000)),
        };

        const isCryptoFiat = formData.tradeType === TradeType.CRYPTO_TO_FIAT;
        if (formData.isBuyerInitiated) {
            payload.walletDetails = { walletAddress: formData.walletAddress, network: formData.walletNetwork };
        } else {
            if (isCryptoFiat) {
                payload.bankDetails = {
                    accountNumber: formData.bankAccountNumber,
                    accountHolderName: formData.bankAccountHolderName,
                    routingNumber: formData.bankRoutingNumber,
                    iban: formData.bankIban,
                    swift: formData.bankSwift
                };
            } else {
                payload.walletDetails = { walletAddress: formData.walletAddress, network: formData.walletNetwork };
            }
        }
        await post(payload);
    };

    const steps = [
        { num: 1, label: 'Transaction' },
        { num: 2, label: 'Details' },
        { num: 3, label: 'Reception' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6 lg:p-10">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-center gap-4">
                    <Link href="/trader/escrow" className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm">
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Initiate Escrow</h1>
                        <p className="text-slate-500 text-sm">Create a new secure transaction</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-200/60 overflow-hidden">
                    {/* Stepper */}
                    <div className="bg-slate-50 p-6 border-b border-slate-100">
                        <div className="flex items-center justify-between max-w-md mx-auto">
                            {steps.map((s, i) => (
                                <div key={s.num} className="flex items-center">
                                    <div className={`flex items-center gap-2 ${step >= s.num ? 'text-emerald-600' : 'text-slate-400'}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= s.num ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                            {step > s.num ? <Check className="w-4 h-4" /> : s.num}
                                        </div>
                                        <span className="font-semibold text-sm hidden sm:inline">{s.label}</span>
                                    </div>
                                    {i < steps.length - 1 && (
                                        <div className={`w-12 sm:w-20 h-0.5 mx-2 ${step > s.num ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <form data-testid="initiate-escrow-form" onSubmit={handleSubmit} className="p-8">
                        {step === 1 && (
                            <div className="space-y-8">
                                {/* Role Selection */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-3">I am the...</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            data-testid="buyer-role-button"
                                            type="button"
                                            onClick={() => handleRoleSelect('buyer')}
                                            className={`p-6 rounded-xl border-2 transition-all text-center ${formData.isBuyerInitiated ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}
                                        >
                                            <div className={`w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center ${formData.isBuyerInitiated ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                                <Coins className="w-6 h-6" />
                                            </div>
                                            <p className={`font-bold ${formData.isBuyerInitiated ? 'text-emerald-700' : 'text-slate-600'}`}>Buyer</p>
                                            <p className="text-xs text-slate-400 mt-1">I'm purchasing assets</p>
                                        </button>
                                        <button
                                            data-testid="seller-role-button"
                                            type="button"
                                            onClick={() => handleRoleSelect('seller')}
                                            className={`p-6 rounded-xl border-2 transition-all text-center ${!formData.isBuyerInitiated ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}
                                        >
                                            <div className={`w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center ${!formData.isBuyerInitiated ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                                <Banknote className="w-6 h-6" />
                                            </div>
                                            <p className={`font-bold ${!formData.isBuyerInitiated ? 'text-emerald-700' : 'text-slate-600'}`}>Seller</p>
                                            <p className="text-xs text-slate-400 mt-1">I'm selling assets</p>
                                        </button>
                                    </div>
                                </div>

                                {/* Trade Type */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Trade Type</label>
                                    <select data-testid="trade-type-select" name="tradeType" value={formData.tradeType} onChange={handleInputChange}
                                        className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all">
                                        <option value={TradeType.CRYPTO_TO_CRYPTO}>Crypto → Crypto</option>
                                        <option value={TradeType.CRYPTO_TO_FIAT}>Crypto → Fiat</option>
                                    </select>
                                </div>

                                {/* Currencies */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Buying (Receiving)</label>
                                        <select data-testid="buy-currency-select" name="buyCurrency" value={formData.buyCurrency} onChange={handleInputChange}
                                            className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 outline-none">
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
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Selling (Sending)</label>
                                        <select data-testid="sell-currency-select" name="sellCurrency" value={formData.sellCurrency} onChange={handleInputChange}
                                            className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 outline-none">
                                            <option value="BTC">BTC</option>
                                            <option value="ETH">ETH</option>
                                            <option value="USDT">USDT</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Amount */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Transaction Amount</label>
                                    <div className="relative">
                                        <input data-testid="amount-input" type="number" name="amount" value={formData.amount} onChange={handleInputChange}
                                            className="w-full h-14 px-4 pr-16 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-xl font-bold transition-all"
                                            placeholder="0.00" />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">{formData.buyCurrency}</span>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button onClick={nextStep} type="button" className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-emerald-700 transition-all">
                                        Next <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6">
                                {formData.isBuyerInitiated && formData.tradeType === TradeType.CRYPTO_TO_FIAT && (
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Payment Method</label>
                                        <select name="paymentMethod" value={formData.paymentMethod} onChange={handleInputChange}
                                            className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 outline-none">
                                            <option value="">Select Method</option>
                                            {parseFloat(formData.amount) < 60000 && <option value={PaymentMethod.PAYPAL}>PayPal</option>}
                                            <option value={PaymentMethod.WIRE_TRANSFER}>Wire Transfer</option>
                                        </select>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Counterparty Email</label>
                                    <input data-testid="counterparty-email-input" type="email" name="counterPartyEmail" value={formData.counterPartyEmail} onChange={handleInputChange}
                                        className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none"
                                        placeholder="trader@example.com" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Confirmation Deadline (Hours)</label>
                                    <input type="number" name="counterPartyConfirmationDeadline" value={formData.counterPartyConfirmationDeadline} onChange={handleInputChange}
                                        className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 outline-none"
                                        placeholder="24" />
                                </div>
                                <div className="flex justify-between pt-4">
                                    <button onClick={prevStep} type="button" className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors">Back</button>
                                    <button onClick={nextStep} type="button" className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/25">
                                        Next <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 bg-violet-100 rounded-xl">
                                        <Wallet className="w-6 h-6 text-violet-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">Reception Details</h3>
                                        <p className="text-sm text-slate-500">Where should you receive your assets?</p>
                                    </div>
                                </div>

                                {(!formData.isBuyerInitiated && formData.tradeType === TradeType.CRYPTO_TO_FIAT) ? (
                                    <>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Account Holder Name</label>
                                            <input type="text" name="bankAccountHolderName" value={formData.bankAccountHolderName} onChange={handleInputChange}
                                                className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Account Number</label>
                                            <input type="text" name="bankAccountNumber" value={formData.bankAccountNumber} onChange={handleInputChange}
                                                className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 outline-none font-mono" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">Routing Number</label>
                                                <input type="text" name="bankRoutingNumber" value={formData.bankRoutingNumber} onChange={handleInputChange}
                                                    className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 outline-none font-mono" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">SWIFT</label>
                                                <input type="text" name="bankSwift" value={formData.bankSwift} onChange={handleInputChange}
                                                    className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 outline-none font-mono uppercase" />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Wallet Address</label>
                                        <input data-testid="wallet-address-input" type="text" name="walletAddress" value={formData.walletAddress} onChange={handleInputChange}
                                            className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 outline-none font-mono"
                                            placeholder="0x..." />
                                    </div>
                                )}

                                {error && <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100">{error}</div>}

                                <div className="flex justify-between pt-4 border-t border-slate-100">
                                    <button onClick={prevStep} type="button" className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors">Back</button>
                                    <button data-testid="submit-escrow-button" type="submit" disabled={isPending}
                                        className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-emerald-700 transition-all disabled:opacity-50">
                                        <ShieldCheck className="w-5 h-5" />
                                        {isPending ? 'Creating...' : 'Initialize Escrow'}
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
