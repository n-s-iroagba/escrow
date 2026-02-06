'use client';

import { useGet } from '@/hooks/useApiQuery';
import API_ROUTES from '@/constants/api-routes';
import { useParams, useRouter } from 'next/navigation';
import { EscrowState, TradeType } from '@/constants/enums';
import {
    Clock,
    CheckCircle2,
    AlertCircle,
    ArrowRightLeft,
    Briefcase,
    Building2,
    Wallet,
    ShieldCheck,
    Banknote
} from 'lucide-react';
import { useRequiredAuth } from '@/hooks/useAuthContext';
import { AddBuyerWalletForm } from '@/components/escrow/AddBuyerWalletForm';
import { AddSellerWalletForm } from '@/components/escrow/AddSellerWalletForm';
import { AddSellerBankForm } from '@/components/escrow/AddSellerBankForm';

export default function EscrowDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { data: escrow, loading, error } = useGet(API_ROUTES.ESCROWS.GET_ONE(id as string), {
        enabled: !!id
    });

    const { user } = useRequiredAuth(true);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#f6f8f6]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-4 border-[#13ec5b] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium animate-pulse">Loading transaction details...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-[#f6f8f6]">
            <div className="p-8 bg-white rounded-2xl shadow-sm text-center max-w-md">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Unable to load details</h2>
                <p className="text-gray-500 mb-6">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold transition-colors"
                >
                    Retry
                </button>
            </div>
        </div>
    );

    if (!escrow) return null;

    const getStatusStyle = (state: string) => {
        switch (state) {
            case EscrowState.INITIALIZED: return 'bg-blue-50 text-blue-600 border-blue-200';
            case EscrowState.ONE_PARTY_FUNDED: return 'bg-yellow-50 text-yellow-600 border-yellow-200';
            case EscrowState.COMPLETELY_FUNDED: return 'bg-purple-50 text-purple-600 border-purple-200';
            case EscrowState.RELEASED: return 'bg-green-50 text-green-600 border-green-200';
            case EscrowState.DISPUTED: return 'bg-red-50 text-red-600 border-red-200';
            case EscrowState.CANCELLED: return 'bg-gray-50 text-gray-500 border-gray-200';
            default: return 'bg-gray-50 text-gray-500';
        }
    };

    const isCryptoToFiat = escrow.tradeType === TradeType.CRYPTO_TO_FIAT;

    return (
        <div className="min-h-screen bg-[#f6f8f6] p-4 lg:p-8 font-display text-[#0d1b12]">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header & Actions */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(escrow.state)}`}>
                                {escrow.state.replace(/_/g, ' ')}
                            </span>
                            <span className="text-gray-400 text-sm font-mono">#{escrow.id.substring(0, 8)}</span>
                        </div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            {escrow.amount} {escrow.isBuyerInitiated ? escrow.buyCurrency : escrow.sellCurrency}
                            <ArrowRightLeft className="w-5 h-5 text-gray-400" />
                            Transaction
                        </h1>
                    </div>
                    <div className="flex gap-3">
                        {escrow.state === EscrowState.INITIALIZED && (
                            <button data-testid="cancel-escrow-button" className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition-all text-sm">
                                Cancel Trade
                            </button>
                        )}

                        {(() => {
                            const isBuyer = user?.id === escrow.buyerId;
                            const isSeller = user?.id === escrow.sellerId;
                            const needsFunding = (isBuyer && !escrow.buyerConfirmedFunding) || (isSeller && !escrow.sellerConfirmedFunding);

                            if (needsFunding && escrow.state === EscrowState.INITIALIZED) {
                                return (
                                    <button
                                        onClick={() => router.push(`/trader/escrow/${id}/fund`)}
                                        className="px-6 py-2.5 bg-[#13ec5b] hover:bg-[#10c94d] text-[#0d1b12] font-bold rounded-xl shadow-lg shadow-green-200 transition-all flex items-center gap-2 text-sm"
                                    >
                                        <Wallet className="w-4 h-4" />
                                        Fund Escrow
                                    </button>
                                );
                            }
                        })()}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Left Column (8/12) - Main Info */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* Transaction Summary */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-gray-400" />
                                Trade Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <span className="text-gray-500 text-xs uppercase tracking-wide font-bold">Trade Type</span>
                                    <p className="font-bold text-base mt-1">{escrow.tradeType.replace(/_/g, ' -> ')}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <span className="text-gray-500 text-xs uppercase tracking-wide font-bold">Total Amount</span>
                                    <p className="font-bold text-base mt-1 font-mono">{escrow.amount} {escrow.buyCurrency}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <span className="text-gray-500 text-xs uppercase tracking-wide font-bold">Fee Payer</span>
                                    <p className="font-bold text-base mt-1">{escrow.feePayer}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <span className="text-gray-500 text-xs uppercase tracking-wide font-bold">Confirmation By</span>
                                    <p className="font-bold text-base mt-1">{new Date(escrow.counterPartyConfirmationDeadline).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {/* Counterparty Info (Inside Details Card now) */}
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Counterparty</h4>
                                {(() => {
                                    const isBuyer = user?.id === escrow.buyerId;
                                    const counterparty = isBuyer ? escrow.seller : escrow.buyer;
                                    const counterpartyRole = isBuyer ? 'Seller' : 'Buyer';
                                    const counterpartyEmail = isBuyer ? escrow.sellerEmail : escrow.buyerEmail;

                                    return (
                                        <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                                                {counterpartyEmail?.charAt(0).toUpperCase() || '?'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-sm">{counterparty?.email || counterpartyEmail}</p>
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <span>{counterpartyRole}</span>
                                                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                    <span className={counterparty?.kycStatus === 'VERIFIED' ? 'text-green-600 font-medium' : 'text-yellow-600'}>
                                                        {counterparty?.kycStatus === 'VERIFIED' ? 'Verified' : 'Unverified'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* Escrow Holdings / Balance */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
                            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-gray-400" />
                                Escrow Holdings
                            </h3>

                            {!escrow.bankBalance && (!escrow.cryptoBalances || escrow.cryptoBalances.length === 0) ? (
                                <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <ShieldCheck className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                    <p className="text-gray-400 text-sm italic">No funds currently held in escrow.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Fiat Balances */}
                                    {escrow.bankBalance && (
                                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Fiat Balance</span>
                                            <div className="flex items-baseline gap-2 mt-1">
                                                <p className="font-bold text-2xl text-blue-900">{escrow.bankBalance.amount}</p>
                                                <span className="font-mono text-sm font-bold text-blue-600">{escrow.bankBalance.currency}</span>
                                            </div>
                                            <div className="flex items-center gap-1 mt-2 text-xs text-blue-500">
                                                <div className={`w-2 h-2 rounded-full ${escrow.bankBalance.confirmedByAdmin ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                                {escrow.bankBalance.confirmedByAdmin ? 'Confirmed' : 'Pending'}
                                            </div>
                                        </div>
                                    )}

                                    {/* Crypto Balances */}
                                    {escrow.cryptoBalances?.map((bal: any, idx: number) => (
                                        <div key={idx} className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                                            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                                                {bal.role === 'BUYER' ? 'Buyer Deposit' : 'Seller Deposit'}
                                            </span>
                                            <div className="flex items-baseline gap-2 mt-1">
                                                <p className="font-bold text-2xl text-emerald-900">{bal.balance}</p>
                                                <span className="font-mono text-sm font-bold text-emerald-700">{bal.currency}</span>
                                            </div>
                                            <div className="flex items-center gap-1 mt-2 text-xs text-emerald-600">
                                                <div className={`w-2 h-2 rounded-full ${bal.confirmedByAdmin ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                                {bal.confirmedByAdmin ? 'Confirmed' : 'Pending'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Timeline */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-gray-400" />
                                Timeline
                            </h3>
                            <div className="relative pl-8 border-l-2 border-gray-100 space-y-8">
                                <div className="relative">
                                    <span className="absolute -left-[41px] bg-[#13ec5b] text-white p-1 rounded-full border-4 border-white shadow-sm">
                                        <CheckCircle2 className="w-5 h-5" />
                                    </span>
                                    <h4 className="font-bold text-gray-900 text-sm">Initialized</h4>
                                    <p className="text-xs text-gray-500 mt-1">{new Date(escrow.createdAt).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* Right Column (4/12) - Actionable Items */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* Reception Details Card (Crucial for User Action) */}
                        <div data-testid="reception-details" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-[#13ec5b]"></div>
                            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                                {isCryptoToFiat ? <Building2 className="w-5 h-5 text-gray-400" /> : <Wallet className="w-5 h-5 text-gray-400" />}
                                Reception Details
                            </h3>

                            {(() => {
                                const isBuyer = user?.id === escrow.buyerId;
                                const isSeller = user?.id === escrow.sellerId;
                                const recipientDetails = isBuyer ? escrow.buyerRecipientDetails : escrow.sellerRecipientDetails;

                                if (!recipientDetails) {
                                    // === MISSING DETAILS (RENDER FORMS) ===
                                    if (isBuyer) {
                                        return (
                                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="p-2 bg-white rounded-full text-blue-500 shadow-sm"><Wallet className="w-4 h-4" /></div>
                                                    <h4 className="font-bold text-sm text-blue-900">Add Receiving Wallet</h4>
                                                </div>
                                                <p className="text-xs text-blue-700 mb-4 leading-relaxed">
                                                    Required: Provide a <strong>{escrow.sellCurrency}</strong> wallet to receive assets.
                                                </p>
                                                <AddBuyerWalletForm escrowId={id as string} currency={escrow.sellCurrency} />
                                            </div>
                                        );
                                    }
                                    if (isSeller) {
                                        if (escrow.tradeType === TradeType.CRYPTO_TO_FIAT) {
                                            return (
                                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div className="p-2 bg-white rounded-full text-blue-500 shadow-sm"><Building2 className="w-4 h-4" /></div>
                                                        <h4 className="font-bold text-sm text-blue-900">Add Bank Account</h4>
                                                    </div>
                                                    <p className="text-xs text-blue-700 mb-4 leading-relaxed">
                                                        Required: Link a bank account to receive Fiat funds.
                                                    </p>
                                                    <AddSellerBankForm escrowId={id as string} />
                                                </div>
                                            );
                                        } else {
                                            return (
                                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div className="p-2 bg-white rounded-full text-blue-500 shadow-sm"><Wallet className="w-4 h-4" /></div>
                                                        <h4 className="font-bold text-sm text-blue-900">Add Receiving Wallet</h4>
                                                    </div>
                                                    <p className="text-xs text-blue-700 mb-4 leading-relaxed">
                                                        Required: Provide a <strong>{escrow.buyCurrency}</strong> wallet.
                                                    </p>
                                                    <AddSellerWalletForm escrowId={id as string} currency={escrow.buyCurrency} />
                                                </div>
                                            );
                                        }
                                    }
                                    return <p className="text-gray-400 text-sm italic">Waiting for counterparty details.</p>;
                                }

                                // === DETAILS EXIST ===
                                return (
                                    <div className="space-y-4">
                                        {(escrow.tradeType === TradeType.CRYPTO_TO_FIAT && recipientDetails.accountNumber) ? (
                                            <>
                                                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                    <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Bank Name</label>
                                                    <p className="font-medium text-sm text-gray-900">{recipientDetails.name || recipientDetails.bankName || 'N/A'}</p>
                                                </div>
                                                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                    <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Account Holder</label>
                                                    <p className="font-medium text-sm text-gray-900">{recipientDetails.accountHolderName || recipientDetails.recipientName}</p>
                                                </div>
                                                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                    <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Account Number</label>
                                                    <p className="font-mono font-medium text-sm text-gray-900">{recipientDetails.accountNumber}</p>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                    <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Network</label>
                                                    <p className="font-medium text-sm text-gray-900">{recipientDetails.network || 'Mainnet'}</p>
                                                </div>
                                                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                    <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Wallet Address</label>
                                                    <p className="font-mono text-xs break-all font-medium text-gray-700">{recipientDetails.walletAddress}</p>
                                                </div>
                                            </>
                                        )}
                                        <div className="flex items-start gap-2 pt-2">
                                            <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                            <p className="text-xs text-blue-600 leading-snug">
                                                This the receiving bank account for this transaction.
                                            </p>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Deposit Requirements (Financial Context) */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                                <Banknote className="w-5 h-5 text-gray-400" />
                                Requirements
                            </h3>
                            <div className="space-y-4">
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-slate-700 text-sm">Buyer Deposit</span>
                                        <span className="text-slate-500 text-xs font-mono bg-white px-2 py-1 rounded shadow-sm">{escrow.buyCurrency}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-slate-900 text-sm">
                                        <span>Total Required</span>
                                        <span className="font-mono">{Number(escrow.buyerDepositAmount)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-slate-900 text-sm">
                                        <span>Status</span>
                                        <span className="font-mono">{escrow.buyerConfirmedFunding ? 'Funded' : 'Not Funded'}</span>
                                    </div>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-slate-700 text-sm">Seller Deposit</span>
                                        <span className="text-slate-500 text-xs font-mono bg-white px-2 py-1 rounded shadow-sm">{escrow.sellCurrency}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-slate-900 text-sm">
                                        <span>Total Required</span>
                                        <span className="font-mono">{Number(escrow.sellerDepositAmount)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-slate-900 text-sm">
                                        <span>Status</span>
                                        <span className="font-mono">{escrow.sellerConfirmedFunding ? 'Funded' : 'Not Funded'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}