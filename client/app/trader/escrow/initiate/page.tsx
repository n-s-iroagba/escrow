'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import API_ROUTES from '@/constants/api-routes';
import { usePost, useGet } from '@/hooks/useApiQuery';
import { TradeType, PaymentMethod, FeePayer } from '@/constants/enums';
import { ArrowLeft, ArrowRight, Check, ShieldCheck, Coins, Banknote, Wallet, AlertCircle, UserCheck, Building2 } from 'lucide-react';
import Link from 'next/link';
import { useRequiredAuth } from '@/hooks/useAuthContext';

// Define crypto and fiat currencies
const CRYPTO_CURRENCIES = ['BTC', 'ETH', 'USDT', 'USDC', 'LTC', 'XRP'];
const FIAT_CURRENCIES = ['USD', 'EUR', 'GBP'];

// $60,000 threshold for payment method restrictions
const WIRE_TRANSFER_THRESHOLD = 60000;

interface Bank {
    id: string;
    name: string;
    currency: string;
    accountNumber?: string;
}

interface FormData {
    isBuyerInitiated: boolean;
    tradeType: typeof TradeType[keyof typeof TradeType];
    buyCurrency: string;
    sellCurrency: string;
    amount: string;
    counterPartyEmail: string;
    paymentMethod: string;
    feePayer: typeof FeePayer[keyof typeof FeePayer];
    counterPartyConfirmationDeadline: string;
    selectedBankId?: string;  // if crypto to fiat the choose bank e.g two banks could exist for one currency
    buyerDepositWalletId?: string, // if crypto to crypto and initiator is buyer initiator should select wallet custodial wallet based of network since currency has been picked
    sellerDepositWalletId?: string,// if initiator is seller initiator should be able to pick baseed of network as buyer initiator for c2c

    bankDetails: {
        accountNumber: string;
        accountHolderName: string;
        routingNumber: string;
        iban: string;
        swift: string;
    };
    //sellers bank details if crypto to fiat initiator is seller
    walletDetails: {
        walletAddress: string;
        network: string;
    };//buyer wallet details if fiat to crypto or crypto to crypto or seller wallet(initiator wallet details if crypto to crypto)
}

export default function InitiateEscrowPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [counterpartyStatus, setCounterpartyStatus] = useState<{
        checked: boolean;
        exists: boolean;
        message: string;
    }>({ checked: false, exists: false, message: '' });

    const [convertedAmount, setConvertedAmount] = useState<number | null>(null);

    const [formData, setFormData] = useState<FormData>({
        isBuyerInitiated: true,
        tradeType: TradeType.CRYPTO_TO_CRYPTO,
        buyCurrency: 'BTC',
        sellCurrency: 'USDT',
        amount: '',
        counterPartyEmail: '',
        paymentMethod: PaymentMethod.CRYPTO,
        feePayer: FeePayer.BUYER,
        counterPartyConfirmationDeadline: '24',

        buyerDepositWalletId: '',
        sellerDepositWalletId: '',
        bankDetails: {
            accountNumber: '',
            accountHolderName: '',
            routingNumber: '',
            iban: '',
            swift: ''
        },
        walletDetails: {
            walletAddress: '',
            network: 'mainnet'
        }
    });
    const { user } = useRequiredAuth();

    // Determine if trade involves fiat
    const isCryptoToFiat = formData.tradeType === TradeType.CRYPTO_TO_FIAT;
    const isBuyer = formData.isBuyerInitiated;
    const amount = parseFloat(formData.amount) || 0;

    // Determine available currencies based on trade type and role
    const availableBuyCurrencies = useMemo(() => {
        if (isCryptoToFiat) {
            // Crypto to Fiat: Buyer receives Fiat, Seller receives Crypto
            return isBuyer ? FIAT_CURRENCIES : CRYPTO_CURRENCIES;
        }
        // Crypto to Crypto: Both receive crypto
        return CRYPTO_CURRENCIES;
    }, [isCryptoToFiat, isBuyer]);

    const availableSellCurrencies = useMemo(() => {
        if (isCryptoToFiat) {
            // Crypto to Fiat: Buyer sends Crypto, Seller sends Fiat
            return isBuyer ? CRYPTO_CURRENCIES : FIAT_CURRENCIES;
        }
        // Crypto to Crypto: Both send crypto
        return CRYPTO_CURRENCIES;
    }, [isCryptoToFiat, isBuyer]);

    // Determine available payment methods based on trade type and amount
    const availablePaymentMethods = useMemo(() => {
        if (!isCryptoToFiat || !isBuyer) {
            return [{ value: PaymentMethod.CRYPTO, label: 'Cryptocurrency' }];
        }

        // Crypto to Fiat + Buyer
        if (amount >= WIRE_TRANSFER_THRESHOLD) {
            return [{ value: PaymentMethod.WIRE_TRANSFER, label: 'Wire Transfer (Required for amounts ≥$60,000)' }];
        }

        return [
            { value: PaymentMethod.PAYPAL, label: 'PayPal' },
            { value: PaymentMethod.WIRE_TRANSFER, label: 'Wire Transfer' },
        ];
    }, [isCryptoToFiat, isBuyer, amount]);

    // Fetch banks by currency for buyer in Crypto to Fiat
    const shouldFetchBanks = isCryptoToFiat && isBuyer && !!formData.buyCurrency;
    const { data: banks } = useGet<Bank[]>(
        shouldFetchBanks ? API_ROUTES.ESCROWS.GET_BANKS_BY_CURRENCY(formData.buyCurrency) : null,
        { enabled: shouldFetchBanks }
    );

    // Validate counterparty
    const { post: validateCounterparty, isPending: isValidating } = usePost<{ email: string }, { exists: boolean; userId?: string }>(
        API_ROUTES.ESCROWS.VALIDATE_COUNTERPARTY
    );

    // Create escrow
    const { post, isPending, error } = usePost(API_ROUTES.ESCROWS.CREATE, {
        onSuccess: (data: any) => router.push(`/trader/escrow/${data.id}`),
    });

    // Reset currencies when trade type or role changes
    useEffect(() => {
        if (isCryptoToFiat) {
            if (isBuyer) {
                setFormData(prev => ({
                    ...prev,
                    buyCurrency: 'USD',
                    sellCurrency: 'BTC',
                    paymentMethod: amount >= WIRE_TRANSFER_THRESHOLD ? PaymentMethod.WIRE_TRANSFER : PaymentMethod.PAYPAL
                }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    buyCurrency: 'BTC',
                    sellCurrency: 'USD',
                    paymentMethod: PaymentMethod.CRYPTO
                }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                buyCurrency: 'BTC',
                sellCurrency: 'USDT',
                paymentMethod: PaymentMethod.CRYPTO
            }));
        }
    }, [formData.tradeType, formData.isBuyerInitiated]);

    // Auto-restrict payment method for large amounts
    useEffect(() => {
        if (isCryptoToFiat && isBuyer && amount >= WIRE_TRANSFER_THRESHOLD) {
            setFormData(prev => ({ ...prev, paymentMethod: PaymentMethod.WIRE_TRANSFER }));
        }
    }, [amount, isCryptoToFiat, isBuyer]);

    // Fetch conversion rate for visual feedback
    useEffect(() => {
        const fetchConversion = async () => {
            if (!amount || amount <= 0) {
                setConvertedAmount(null);
                return;
            }

            const from = isBuyer ? formData.buyCurrency : formData.sellCurrency;
            const to = isBuyer ? formData.sellCurrency : formData.buyCurrency;

            try {
                const res = await fetch(`https://api.coinconvert.net/convert/${from.toLowerCase()}/${to.toLowerCase()}?amount=${amount}`);
                const data = await res.json();
                if (data.status === 'success' && data[to]) {
                    setConvertedAmount(parseFloat(data[to]));
                } else {
                    setConvertedAmount(null);
                }
            } catch (err) {
                console.error("Conversion error", err);
                setConvertedAmount(null);
            }
        };

        const timeout = setTimeout(fetchConversion, 800);
        return () => clearTimeout(timeout);
    }, [amount, isBuyer, formData.buyCurrency, formData.sellCurrency]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent as keyof FormData] as any,
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        // Reset counterparty status when email changes
        if (name === 'counterPartyEmail') {
            setCounterpartyStatus({ checked: false, exists: false, message: '' });
        }
    };

    const handleRoleSelect = (role: 'buyer' | 'seller') => {
        setFormData(prev => ({ ...prev, isBuyerInitiated: role === 'buyer' }));
    };

    const handleFeePayerSelect = (payer: typeof FeePayer[keyof typeof FeePayer]) => {
        setFormData(prev => ({ ...prev, feePayer: payer }));
    };

    const handleValidateCounterparty = async () => {
        if (!formData.counterPartyEmail) return;

        const result = await validateCounterparty({ email: formData.counterPartyEmail });
        if (result) {
            setCounterpartyStatus({
                checked: true,
                exists: result.exists,
                message: result.exists
                    ? 'User found! They will be notified of this escrow.'
                    : 'User not registered. They will receive an invitation to join.'
            });
        }
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
            feePayer: formData.feePayer,
            counterPartyConfirmationDeadline: new Date(Date.now() + (parseInt(formData.counterPartyConfirmationDeadline || '24') * 60 * 60 * 1000)),
        };

        // Add preferred bank for buyer in Crypto to Fiat (mapped to selectedBankId)
        if (formData.selectedBankId) {
            payload.selectedBankId = formData.selectedBankId;
        }

        // Add asset reception details
        // Logic corresponds to form visibility: 
        // Seller in C2F provides Bank Details. Everyone else provides Wallet Details (or Platform Bank selection for Buyer C2F).
        if (!isBuyer && isCryptoToFiat) {
            // Seller C2F -> Bank Details
            payload.bankDetails = formData.bankDetails;
        } else {
            // Buyer (Any) or Seller (C2C) -> Wallet Details
            // Note: Buyer in C2F also sees Wallet Input in Step 3
            if (formData.walletDetails.walletAddress) {
                payload.walletDetails = formData.walletDetails;
            }
        }

        await post(payload);
    };

    const steps = [
        { num: 1, label: 'Transaction' },
        { num: 2, label: 'Details' },
        { num: 3, label: 'Reception' },
    ];

    // Determine deadline label based on role
    const deadlineLabel = isBuyer
        ? 'Seller Confirmation Deadline (Hours)'
        : 'Buyer Confirmation Deadline (Hours)';

    // Determine amount label based on role
    const amountLabel = isBuyer
        ? `Purchase Amount (${formData.buyCurrency})`
        : `Sale Amount (${formData.sellCurrency})`;

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
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Buyer's Currency</label>
                                        <select data-testid="buy-currency-select" name="buyCurrency" value={formData.buyCurrency} onChange={handleInputChange}
                                            className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 outline-none">
                                            {availableBuyCurrencies.map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-slate-400 mt-1">Currency the buyer sends</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Seller's Currency</label>
                                        <select data-testid="sell-currency-select" name="sellCurrency" value={formData.sellCurrency} onChange={handleInputChange}
                                            className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 outline-none">
                                            {availableSellCurrencies.map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-slate-400 mt-1">Currency the seller sends</p>
                                    </div>
                                </div>

                                {/* Amount */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">{amountLabel}</label>
                                    <div className="relative">
                                        <input data-testid="amount-input" type="number" name="amount" value={formData.amount} onChange={handleInputChange}
                                            className="w-full h-14 px-4 pr-16 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-xl font-bold transition-all"
                                            placeholder="0.00" />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">
                                            {isBuyer ? formData.buyCurrency : formData.sellCurrency}
                                        </span>
                                    </div>
                                    {amount > 0 && convertedAmount !== null && (
                                        <div className="mt-2 text-sm text-slate-500 flex justify-between px-1">
                                            <span>Your Deposit: <span className="font-semibold text-slate-700">{amount} {isBuyer ? formData.buyCurrency : formData.sellCurrency}</span></span>
                                            <span>Counterparty Deposit: <span className="font-semibold text-emerald-600">~{convertedAmount} {isBuyer ? formData.sellCurrency : formData.buyCurrency}</span></span>
                                        </div>
                                    )}
                                </div>

                                {/* Fee Payer Selection */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-3">Escrow Fee Payer</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            data-testid="fee-buyer-button"
                                            type="button"
                                            onClick={() => handleFeePayerSelect(FeePayer.BUYER)}
                                            className={`p-4 rounded-xl border-2 transition-all text-center ${formData.feePayer === FeePayer.BUYER ? 'border-violet-500 bg-violet-50' : 'border-slate-200 hover:border-slate-300'}`}
                                        >
                                            <p className={`font-bold ${formData.feePayer === FeePayer.BUYER ? 'text-violet-700' : 'text-slate-600'}`}>Buyer Pays Fee</p>
                                        </button>
                                        <button
                                            data-testid="fee-seller-button"
                                            type="button"
                                            onClick={() => handleFeePayerSelect(FeePayer.SELLER)}
                                            className={`p-4 rounded-xl border-2 transition-all text-center ${formData.feePayer === FeePayer.SELLER ? 'border-violet-500 bg-violet-50' : 'border-slate-200 hover:border-slate-300'}`}
                                        >
                                            <p className={`font-bold ${formData.feePayer === FeePayer.SELLER ? 'text-violet-700' : 'text-slate-600'}`}>Seller Pays Fee</p>
                                        </button>
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
                                {/* Payment Method for Buyer in Crypto to Fiat */}
                                {isCryptoToFiat && isBuyer && (
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Payment Method</label>
                                        <select
                                            data-testid="payment-method-select"
                                            name="paymentMethod"
                                            value={formData.paymentMethod}
                                            onChange={handleInputChange}
                                            disabled={amount >= WIRE_TRANSFER_THRESHOLD}
                                            className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 outline-none disabled:opacity-60"
                                        >
                                            {availablePaymentMethods.map(pm => (
                                                <option key={pm.value} value={pm.value}>{pm.label}</option>
                                            ))}
                                        </select>
                                        {amount >= WIRE_TRANSFER_THRESHOLD && (
                                            <p className="mt-2 text-amber-600 text-sm flex items-center gap-1">
                                                <AlertCircle className="w-4 h-4" />
                                                Wire Transfer is required for transactions ≥$60,000
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Preferred Bank for Buyer in Crypto to Fiat */}
                                {isCryptoToFiat && isBuyer && banks && banks.length > 0 && formData.paymentMethod !== PaymentMethod.PAYPAL && (
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            <span className="flex items-center gap-2">
                                                <Building2 className="w-4 h-4" />
                                                Preferred Bank (for receiving {formData.buyCurrency})
                                            </span>
                                        </label>
                                        <select
                                            data-testid="preferred-bank-select"
                                            name="selectedBankId"
                                            value={formData.selectedBankId}
                                            onChange={handleInputChange}
                                            className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 outline-none"
                                        >
                                            <option value="">Select a bank...</option>
                                            {banks.map(bank => (
                                                <option key={bank.id} value={bank.id}>{bank.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* Counterparty Email */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Counterparty Email</label>
                                    <div className="flex gap-2">
                                        <input
                                            data-testid="counterparty-email-input"
                                            type="email"
                                            name="counterPartyEmail"
                                            value={formData.counterPartyEmail}
                                            onChange={handleInputChange}
                                            className="flex-1 h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none"
                                            placeholder="trader@example.com"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleValidateCounterparty}
                                            disabled={!formData.counterPartyEmail || isValidating}
                                            className="px-4 rounded-xl bg-slate-100 text-slate-600 font-medium hover:bg-slate-200 disabled:opacity-50 transition-colors"
                                        >
                                            {isValidating ? 'Checking...' : 'Validate'}
                                        </button>
                                    </div>
                                    {counterpartyStatus.checked && (
                                        <div className={`mt-2 p-3 rounded-lg flex items-center gap-2 ${counterpartyStatus.exists ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                                            {counterpartyStatus.exists ? <UserCheck className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                            <span className="text-sm">{counterpartyStatus.message}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Confirmation Deadline */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">{deadlineLabel}</label>
                                    <input
                                        data-testid="deadline-input"
                                        type="number"
                                        name="counterPartyConfirmationDeadline"
                                        value={formData.counterPartyConfirmationDeadline}
                                        onChange={handleInputChange}
                                        className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 outline-none"
                                        placeholder="24"
                                        min="1"
                                        max="168"
                                    />
                                    <p className="mt-1 text-slate-400 text-xs">Time for counterparty to confirm the transaction (1-168 hours)</p>
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
                                        <h3 className="font-bold text-slate-900">Asset Reception Details</h3>
                                        <p className="text-sm text-slate-500">
                                            {isBuyer
                                                ? `Where should you receive ${formData.sellCurrency}?`
                                                : `Where should you receive ${formData.buyCurrency}?`
                                            }
                                        </p>
                                    </div>
                                </div>

                                {/* Bank Details for Seller in Crypto to Fiat */}
                                {!isBuyer && isCryptoToFiat ? (
                                    <>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Account Holder Name</label>
                                            <input
                                                data-testid="bank-holder-input"
                                                type="text"
                                                name="bankDetails.accountHolderName"
                                                value={formData.bankDetails?.accountHolderName || ''}
                                                onChange={handleInputChange}
                                                className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Account Number</label>
                                            <input
                                                data-testid="bank-account-input"
                                                type="text"
                                                name="bankDetails.accountNumber"
                                                value={formData.bankDetails?.accountNumber || ''}
                                                onChange={handleInputChange}
                                                className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 outline-none font-mono"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">Routing Number</label>
                                                <input
                                                    type="text"
                                                    name="bankDetails.routingNumber"
                                                    value={formData.bankDetails?.routingNumber || ''}
                                                    onChange={handleInputChange}
                                                    className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 outline-none font-mono"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">SWIFT</label>
                                                <input
                                                    type="text"
                                                    name="bankDetails.swift"
                                                    value={formData.bankDetails?.swift || ''}
                                                    onChange={handleInputChange}
                                                    className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 outline-none font-mono uppercase"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">IBAN (Optional)</label>
                                            <input
                                                type="text"
                                                name="bankDetails.iban"
                                                value={formData.bankDetails?.iban || ''}
                                                onChange={handleInputChange}
                                                className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 outline-none font-mono uppercase"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    /* Wallet Details for Buyer or Seller in Crypto to Crypto */
                                    <>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Wallet Address</label>
                                            <input
                                                data-testid="wallet-address-input"
                                                type="text"
                                                name="walletDetails.walletAddress"
                                                value={formData.walletDetails?.walletAddress || ''}
                                                onChange={handleInputChange}
                                                className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 outline-none font-mono"
                                                placeholder="0x..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Network</label>
                                            <select
                                                name="walletDetails.network"
                                                value={formData.walletDetails?.network || 'mainnet'}
                                                onChange={handleInputChange}
                                                className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                                            >
                                                <option value="mainnet">Mainnet</option>
                                                <option value="testnet">Testnet</option>
                                            </select>
                                        </div>
                                    </>
                                )}

                                {error && <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100">{error}</div>}

                                <div className="flex justify-between pt-4 border-t border-slate-100">
                                    <button onClick={prevStep} type="button" className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors">Back</button>
                                    <button
                                        data-testid="submit-escrow-button"
                                        type="submit"
                                        disabled={isPending}
                                        className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-emerald-700 transition-all disabled:opacity-50"
                                    >
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

