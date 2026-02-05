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

    User
} from 'lucide-react';
import { useRequiredAuth } from '@/hooks/useAuthContext';

export default function EscrowDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { data: escrow, loading, error } = useGet(API_ROUTES.ESCROWS.GET_ONE(id as string), {
        enabled: !!id
    });
    const { user } = useRequiredAuth();
    console.log(user)

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

    // Helper for status badge style
    const getStatusStyle = (state: string) => {
        switch (state) {
            case EscrowState.INITIALIZED:
                return 'bg-blue-50 text-blue-600 border-blue-200';
            case EscrowState.ONE_PARTY_FUNDED:
                return 'bg-yellow-50 text-yellow-600 border-yellow-200';
            case EscrowState.COMPLETELY_FUNDED:
                return 'bg-purple-50 text-purple-600 border-purple-200';
            case EscrowState.RELEASED:
                return 'bg-green-50 text-green-600 border-green-200';
            case EscrowState.DISPUTED:
                return 'bg-red-50 text-red-600 border-red-200';
            case EscrowState.CANCELLED:
                return 'bg-gray-50 text-gray-500 border-gray-200';
            default:
                return 'bg-gray-50 text-gray-500';
        }
    };

    const isCryptoToFiat = escrow.tradeType === TradeType.CRYPTO_TO_FIAT;

    return (
        <div className="min-h-screen bg-[#f6f8f6] p-8 font-display text-[#0d1b12]">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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
                        <button data-testid="cancel-escrow-button" className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#0d1b12] font-bold rounded-xl transition-all">
                            Cancel
                        </button>
                        <div className="flex gap-3">
                            <button data-testid="cancel-escrow-button" className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#0d1b12] font-bold rounded-xl transition-all">
                                Cancel
                            </button>

                            {/* Funding Button Logic */}
                            {(() => {
                                const isBuyer = user?.id === escrow.buyerId;
                                const isSeller = user?.id === escrow.sellerId;
                                const needsFunding = (isBuyer && !escrow.buyerConfirmedFunding) || (isSeller && !escrow.sellerConfirmedFunding);

                                if (needsFunding && escrow.state === EscrowState.INITIALIZED) {
                                    return (
                                        <button
                                            onClick={() => router.push(`/trader/escrow/${id}/fund`)}
                                            className="px-6 py-2.5 bg-[#13ec5b] hover:bg-[#10c94d] text-[#0d1b12] font-bold rounded-xl shadow-lg shadow-green-200 transition-all flex items-center gap-2"
                                        >
                                            <Wallet className="w-4 h-4" />
                                            Fund Escrow
                                        </button>
                                    );
                                }

                                return (
                                    <button data-testid="perform-action-button" className="px-6 py-2.5 bg-[#13ec5b] hover:bg-[#10c94d] text-[#0d1b12] font-bold rounded-xl shadow-lg shadow-green-200 transition-all flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4" />
                                        Perform Action
                                    </button>
                                );
                            })()}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Left Column: Transaction Details */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* Summary Card */}
                            <div data-testid="transaction-summary" className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                                <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-gray-400" />
                                    Transaction Summary
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <span className="text-gray-500 text-xs uppercase tracking-wide font-bold">Trade Type</span>
                                        <p className="font-bold text-lg mt-1">{escrow.tradeType.replace(/_/g, ' -> ')}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <span className="text-gray-500 text-xs uppercase tracking-wide font-bold">Total Amount</span>
                                        <p className="font-bold text-lg mt-1 font-mono">{escrow.amount} {escrow.buyCurrency}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <span className="text-gray-500 text-xs uppercase tracking-wide font-bold">Fee Payer</span>
                                        <p className="font-bold text-lg mt-1">{escrow.feePayer}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <span className="text-gray-500 text-xs uppercase tracking-wide font-bold">Confirmation By</span>
                                        <p className="font-bold text-lg mt-1">
                                            {new Date(escrow.counterPartyConfirmationDeadline).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Counterparty Logic */}
                            {(() => {
                                const isBuyer = user?.id === escrow.buyerId;
                                const counterparty = isBuyer ? escrow.seller : escrow.buyer;
                                const counterpartyRole = isBuyer ? 'Seller' : 'Buyer';
                                const counterpartyEmail = isBuyer ? escrow.sellerEmail : escrow.buyerEmail;

                                return (
                                    <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                                        <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl">
                                            {counterpartyEmail?.charAt(0).toUpperCase() || '?'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{counterparty?.email || counterpartyEmail}</p>
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <span>{counterpartyRole}</span>
                                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                <span className={counterparty?.kycStatus === 'VERIFIED' ? 'text-green-600 font-medium' : 'text-yellow-600'}>
                                                    {counterparty?.kycStatus === 'VERIFIED' ? 'KYC Verified' : 'Unverified'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>

                    {/* Right Column: Asset Reception (Sensitive Info) */}
                    <div className="space-y-8">
                        <div data-testid="reception-details" className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 h-full relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-[#13ec5b]"></div>
                            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                                {isCryptoToFiat ? <Building2 className="w-5 h-5 text-gray-400" /> : <Wallet className="w-5 h-5 text-gray-400" />}
                                Reception Details
                            </h3>

                            {(() => {
                                const isBuyer = user?.id === escrow.buyerId;
                                const isSeller = user?.id === escrow.sellerId;
                                const recipientDetails = isBuyer ? escrow.buyerRecipientDetails : escrow.sellerRecipientDetails;
                                const showBankDetails = isSeller && isCryptoToFiat; // Only Seller in C2F receives Fiat (Bank)

                                return recipientDetails ? (
                                    <div className="space-y-6">
                                        {showBankDetails ? (
                                            // Bank Details View
                                            <>
                                                <div>
                                                    <label className="text-xs font-bold text-gray-400 uppercase">Bank Name</label>
                                                    <p className="font-medium text-gray-900">{(recipientDetails as any).name || (recipientDetails as any).bankName || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-gray-400 uppercase">Account Holder</label>
                                                    <p className="font-medium text-gray-900">{(recipientDetails as any).accountHolderName || (recipientDetails as any).recipientName}</p>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-gray-400 uppercase">Account Number</label>
                                                    <p className="font-mono font-medium text-gray-900 bg-gray-50 p-2 rounded border border-gray-100">
                                                        {(recipientDetails as any).accountNumber}
                                                    </p>
                                                </div>
                                            </>
                                        ) : (
                                            // Wallet Details View
                                            <>
                                                <div>
                                                    <label className="text-xs font-bold text-gray-400 uppercase">Wallet Network</label>
                                                    <p className="font-medium text-gray-900">{(recipientDetails as any).network}</p>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-gray-400 uppercase">Wallet Address</label>
                                                    <p className="font-mono text-sm break-all font-medium text-gray-900 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                                        {(recipientDetails as any).walletAddress}
                                                    </p>
                                                </div>
                                            </>
                                        )}

                                        <div className="mt-6 pt-6 border-t border-gray-100">
                                            <p className="text-xs text-gray-500 flex items-start gap-2">
                                                <AlertCircle className="w-4 h-4 text-blue-500 shrink-0" />
                                                Please verify these details carefully with your counterparty before sending any funds.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-gray-400 mb-4">Details hidden or not yet provided.</p>
                                        {((isBuyer && !escrow.buyerRecipientDetails) || (isSeller && !escrow.sellerRecipientDetails)) && (
                                            <button
                                                onClick={() => router.push(`/trader/profile?action=add_reception&escrowId=${id}`)}
                                                className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold rounded-lg transition-colors text-sm"
                                            >
                                                + Add Reception Details
                                            </button>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>

                {/* Timeline Section */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-lg mb-8 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-gray-400" />
                        Transaction Timeline
                    </h3>

                    <div className="relative pl-8 border-l-2 border-gray-100 space-y-8">
                        {/* Step 1: Initialized */}
                        <div className="relative">
                            <span className="absolute -left-[41px] bg-[#13ec5b] text-white p-1 rounded-full border-4 border-white shadow-sm">
                                <CheckCircle2 className="w-5 h-5" />
                            </span>
                            <h4 className="font-bold text-gray-900">Escrow Initialized</h4>
                            <p className="text-sm text-gray-500 mt-1">Transaction created on {new Date(escrow.createdAt).toLocaleString()}</p>
                        </div>


                    </div>
                </div>

            </div>
        </div>
    );
}
