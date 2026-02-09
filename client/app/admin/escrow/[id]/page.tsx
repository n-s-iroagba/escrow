'use client';

import { useGet, usePut } from '@/hooks/useApiQuery';
import API_ROUTES from '@/constants/api-routes';
import { useParams, useRouter } from 'next/navigation';
import { EscrowState, TradeType } from '@/constants/enums';
import {
    ArrowLeft,
    Edit,

    Banknote,
    Coins,
    CheckCircle,

    Clock,
    User,
    ArrowRightLeft,
    Ban,
    Unlock
} from 'lucide-react';
import { useRequiredAuth } from '@/hooks/useAuthContext';

export default function AdminEscrowDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const { user } = useRequiredAuth();
    const { data: escrow, loading, refetch } = useGet(API_ROUTES.ESCROWS.GET_ONE(id));

    const { put: updateState, isPending: isUpdating } = usePut(
        API_ROUTES.ESCROWS.ADMIN_UPDATE(id),
        { onSuccess: () => refetch() }
    );

    const handleStateChange = (newState: string) => {
        if (confirm(`Are you sure you want to change status to ${newState}?`)) {
            updateState({ state: newState });
        }
    };

    if (loading) return <div className="p-12 text-center text-gray-500">Loading escrow details...</div>;
    if (!escrow) return <div className="p-12 text-center text-red-500">Escrow not found</div>;

    const isFunded = escrow.state === EscrowState.COMPLETELY_FUNDED;
    const isCryptoToFiat = escrow.tradeType === TradeType.CRYPTO_TO_FIAT;

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-display">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Navigation & Header */}
                <div>
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-4 font-bold text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </button>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-3xl font-bold text-gray-900">Escrow #{id.substring(0, 8)}</h1>
                                <StatusBadge state={escrow.state} />
                            </div>
                            <p className="text-gray-500 flex items-center gap-2 text-sm">
                                Created on {new Date(escrow.createdAt).toLocaleString()}
                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                <span className="font-mono">{escrow.tradeType}</span>
                            </p>
                        </div>

                        <div className="flex gap-2">
                            {escrow.state !== EscrowState.RELEASED && escrow.state !== EscrowState.CANCELLED && (
                                <>
                                    <ActionButton
                                        icon={<Edit className="w-4 h-4" />}
                                        label="Update Payment"
                                        onClick={() => router.push(`/admin/escrow/${id}/update-payment`)}
                                        variant="primary"
                                    />
                                    <ActionButton
                                        icon={<Ban className="w-4 h-4" />}
                                        label="Cancel"
                                        onClick={() => handleStateChange(EscrowState.CANCELLED)}
                                        variant="danger"
                                        disabled={isUpdating}
                                    />
                                </>
                            )}
                            {isFunded && (
                                <ActionButton
                                    icon={<Unlock className="w-4 h-4" />}
                                    label="Release Funds"
                                    onClick={() => handleStateChange(EscrowState.RELEASED)}
                                    variant="success"
                                    disabled={isUpdating}
                                />
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left Column: Parties & Overview */}
                    <div className="space-y-6">
                        {/* Parties Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <User className="w-4 h-4 text-gray-400" /> Parties Involved
                                </h3>
                            </div>
                            <div className="p-6 space-y-6">
                                <PartyRow
                                    role="Buyer"
                                    email={escrow.buyerEmail}
                                    id={escrow.buyerId}
                                    kycStatus={escrow.buyer?.kycStatus}
                                    isInitiator={escrow.isBuyerInitiated}
                                />
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                                    <div className="relative flex justify-center"><span className="bg-white px-2 text-xs text-gray-400 uppercase">vs</span></div>
                                </div>
                                <PartyRow
                                    role="Seller"
                                    email={escrow.sellerEmail}
                                    id={escrow.sellerId}
                                    kycStatus={escrow.seller?.kycStatus}
                                    isInitiator={!escrow.isBuyerInitiated}
                                />
                            </div>
                        </div>

                        {/* Agreement Details */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <ArrowRightLeft className="w-4 h-4 text-gray-400" /> Agreement
                                </h3>
                            </div>
                            <div className="p-6 space-y-4 text-sm">
                                <DetailRow label="Buyer Deposit Amount" value={`${Number(escrow.buyerDepositAmount)} ${escrow.buyCurrency}`} highlight />
                                <DetailRow label="Seller Deposit Amount" value={`${escrow.sellerDepositAmount} ${escrow.sellCurrency}`} highlight />
                                <DetailRow label="Fee Payer" value={escrow.feePayer} />
                                <DetailRow label="Confirmation Deadline" value={new Date(escrow.counterPartyConfirmationDeadline).toLocaleDateString()} />
                            </div>
                        </div>
                    </div>

                    {/* Middle Column: Financials (The "Fullest View" Part) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Held Funds */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <Banknote className="w-4 h-4 text-gray-400" /> Held Funds (Actual)
                                </h3>
                                <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2 py-1 rounded-full">
                                    Live Balances
                                </span>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">

                                {/* Bank Balances */}
                                {(escrow as any).bankBalance ? (
                                    <BalanceCard
                                        title="Fiat Bank Balance"
                                        amount={(escrow as any).bankBalance.amount}
                                        currency={(escrow as any).bankBalance.currency}
                                        confirmed={(escrow as any).bankBalance.confirmedByAdmin}
                                        type="BANK"
                                    />
                                ) : isCryptoToFiat ? (
                                    <EmptyBalanceCard title="Fiat Bank Balance" pending />
                                ) : null}

                                {/* Crypto Balances */}
                                {(escrow as any).cryptoBalances?.map((bal: any, i: number) => (
                                    <BalanceCard
                                        key={i}
                                        title={`${bal.role === 'BUYER' ? 'Buyer' : 'Seller'} Crypto Wallet`}
                                        amount={bal.balance}
                                        currency={bal.currency}
                                        confirmed={bal.confirmedByAdmin}
                                        type="CRYPTO"
                                        subtext={bal.walletAddress !== 'MANUAL_ADMIN_ENTRY' ? (bal.walletAddress.substring(0, 8) + '...') : 'Manual Entry'}
                                    />
                                ))}

                                {(!(escrow as any).cryptoBalances?.length && !isCryptoToFiat) && (
                                    <EmptyBalanceCard title="Crypto Wallet Balance" pending />
                                )}
                            </div>
                        </div>

                        {/* Action Logs / Flags */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-gray-400" /> Activity Flags
                                </h3>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <FlagBox label="Buyer Sent" value={escrow.buyerMarkedPaymentSent} />
                                    <FlagBox label="Seller Sent" value={escrow.sellerMarkedPaymentSent} />
                                    <FlagBox label="Buyer Confirmed" value={escrow.buyerConfirmedFunding} />
                                    <FlagBox label="Seller Confirmed" value={escrow.sellerConfirmedFunding} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Components

function ActionButton({ icon, label, onClick, variant = 'primary', disabled }: any) {
    const base = "px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed";
    const variants: any = {
        primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200",
        success: "bg-[#13ec5b] hover:bg-[#10c94d] text-[#0d1b12] shadow-green-200",
        danger: "bg-red-50 hover:bg-red-100 text-red-600 border border-red-100",
        secondary: "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200"
    };
    return (
        <button onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]}`}>
            {icon} {label}
        </button>
    );
}

function StatusBadge({ state }: { state: string }) {
    const styles: any = {
        [EscrowState.INITIALIZED]: 'bg-blue-100 text-blue-700',
        [EscrowState.ONE_PARTY_FUNDED]: 'bg-amber-100 text-amber-700',
        [EscrowState.COMPLETELY_FUNDED]: 'bg-purple-100 text-purple-700',
        [EscrowState.RELEASED]: 'bg-green-100 text-green-700',
        [EscrowState.CANCELLED]: 'bg-gray-100 text-gray-600',
        [EscrowState.DISPUTED]: 'bg-red-100 text-red-700',
    };
    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-transparent ${styles[state] || 'bg-gray-100 text-gray-600'}`}>
            {state.replace(/_/g, ' ')}
        </span>
    );
}

function PartyRow({ role, email, id, kycStatus, isInitiator }: any) {
    return (
        <div className="flex items-start justify-between group">
            <div className="flex gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${role === 'Buyer' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                    {email?.charAt(0).toUpperCase()}
                </div>
                <div>
                    <p className="font-bold text-gray-900 flex items-center gap-2">
                        {role}
                        {isInitiator && <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200">INITIATOR</span>}
                    </p>
                    <p className="text-sm text-gray-500 mb-1">{email}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${kycStatus === 'VERIFIED' || kycStatus === 'APPROVED' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-yellow-50 text-yellow-600 border-yellow-100'}`}>
                        {kycStatus === 'APPROVED' ? 'VERIFIED' : (kycStatus || 'UNVERIFIED')}
                    </span>
                </div>
            </div>
        </div>
    );
}

function DetailRow({ label, value, highlight }: any) {
    return (
        <div className="flex justify-between items-center">
            <span className="text-gray-500 text-xs uppercase tracking-wide font-bold">{label}</span>
            <span className={`font-medium ${highlight ? 'text-lg text-gray-900' : 'text-gray-700'}`}>{value}</span>
        </div>
    );
}

function BalanceCard({ title, amount, currency, confirmed, type, subtext }: any) {
    return (
        <div className="border border-gray-200 rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-gray-400 uppercase">{title}</span>
                    {type === 'BANK' ? <Banknote className="w-4 h-4 text-gray-300" /> : <Coins className="w-4 h-4 text-gray-300" />}
                </div>
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-gray-900">{amount}</span>
                    <span className="text-sm font-bold text-gray-500">{currency}</span>
                </div>
                {subtext && <p className="text-[10px] text-gray-400 mt-1 font-mono truncate">{subtext}</p>}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${confirmed ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                <span className={`text-xs font-bold ${confirmed ? 'text-green-600' : 'text-amber-600'}`}>
                    {confirmed ? 'Confirmed' : 'Pending Review'}
                </span>
            </div>
        </div>
    );
}

function EmptyBalanceCard({ title, pending }: any) {
    return (
        <div className="border border-gray-200 border-dashed rounded-xl p-4 flex flex-col justify-center items-center text-center h-full min-h-[140px] bg-gray-50/50">
            <span className="text-xs font-bold text-gray-400 uppercase mb-2">{title}</span>
            <p className="text-sm text-gray-400 font-medium">No verified balance yet</p>
        </div>
    );
}

function FlagBox({ label, value }: any) {
    return (
        <div className={`p-3 rounded-lg border text-center ${value ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
            <div className={`text-xs font-bold uppercase mb-1 ${value ? 'text-green-800' : 'text-gray-500'}`}>{label}</div>
            {value && <CheckCircle className="w-4 h-4 text-green-600 mx-auto" />}
        </div>
    );
}
