'use client';

import { useGet } from '@/hooks/useApiQuery';
import API_ROUTES from '@/constants/api-routes';
import { useAuthContext } from '@/hooks/useAuthContext';
import { useRouter } from 'next/navigation';
import {
    ShieldAlert,
    Plus,
    ArrowRight,
    Wallet,
    Clock,
    CheckCircle2,
    ShieldCheck,
    Coins,
    Banknote
} from 'lucide-react';

export default function DashboardPage() {
    const { user } = useAuthContext();
    const router = useRouter();

    // 1. Fetch KYC Status
    const { data: kycData, loading: kycLoading } = useGet(
        API_ROUTES.KYC.STATUS(user?.id),
        { enabled: !!user?.id }
    );

    // 2. Fetch User Escrows
    const { data: escrows, loading: escrowsLoading } = useGet(
        API_ROUTES.ESCROWS.GET_MY
    );

    const myEscrows = Array.isArray(escrows) ? escrows : [];

    // Filter for "Action Required" (Funding needed) where I am a party
    const pendingFundingEscrows = myEscrows.filter((e: any) => {
        const isBuyer = e.buyerId === user?.id; // Or email match if ID not populated
        const isSeller = e.sellerId === user?.id;
        // Simple logic: If Initialized, both need to confirm/fund generally.
        // If One Party Funded, check if I am the one who hasn't funded? 
        // For simplicity: Show all active non-complete ones
        return (e.state === 'INITIALIZED' || e.state === 'ONE_PARTY_FUNDED') && (isBuyer || isSeller);
    });

    const loading = kycLoading || escrowsLoading;
    const kycStatus = kycData?.status || 'NOT_STARTED';
    const isVerified = kycStatus === 'APPROVED' || kycStatus === 'VERIFIED';

    if (loading) return <div className="min-h-screen bg-[#f6f8f6] p-8 flex items-center justify-center text-gray-500 font-display">Loading your dashboard...</div>;

    return (
        <div className="min-h-screen bg-[#f6f8f6] p-4 md:p-8 font-display pb-20">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Hello, <span className="text-gray-500">{user?.role === 'ADMIN' ? 'Admin' : 'Trader'}</span>
                        </h1>
                        <p className="text-gray-400 mt-1">Welcome back to your secure workspace.</p>
                    </div>
                    <button
                        onClick={() => router.push('/trader/escrow/initiate')}
                        disabled={!isVerified}
                        className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all ${!isVerified ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#13ec5b] hover:bg-[#10c94d] text-[#0d1b12] shadow-green-200'}`}
                    >
                        <Plus className="w-5 h-5" />
                        New Transaction
                    </button>
                </div>

                {/* KYC Alert */}
                {!isVerified && (
                    <div className="bg-white rounded-3xl p-6 md:p-8 border border-orange-100 shadow-xl shadow-orange-50 flex flex-col md:flex-row items-start md:items-center gap-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full blur-3xl -mr-10 -mt-10"></div>
                        <div className="bg-orange-100 p-4 rounded-2xl shrink-0 z-10">
                            <ShieldAlert className="w-8 h-8 text-orange-600" />
                        </div>
                        <div className="flex-1 z-10">
                            <h3 className="text-xl font-bold text-gray-900 mb-1">Identity Verification Required</h3>
                            <p className="text-gray-500 leading-relaxed">
                                To ensure the safety of all transactions, we require a one-time identity check. You must complete this before initiating or funding any escrows.
                            </p>
                        </div>
                        <button
                            onClick={() => router.push('/trader/kyc')}
                            className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-bold transition-all z-10"
                        >
                            Complete KYC
                        </button>
                    </div>
                )}

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Action Items */}
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-[#13ec5b]" />
                                Action Required
                            </h2>

                            {pendingFundingEscrows.length === 0 ? (
                                <div className="bg-white rounded-3xl p-8 text-center border border-gray-100 shadow-sm">
                                    <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                                    </div>
                                    <h3 className="font-bold text-gray-900">All Caught Up!</h3>
                                    <p className="text-gray-400 mt-2 text-sm">You have no pending actions. Start a new trade?</p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {pendingFundingEscrows.map((escrow: any) => (
                                        <div key={escrow.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-xl ${escrow.tradeType === 'CRYPTO_TO_CRYPTO' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                                        {escrow.tradeType === 'CRYPTO_TO_CRYPTO' ? <Coins className="w-5 h-5" /> : <Banknote className="w-5 h-5" />}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-900">
                                                            {escrow.amount} {escrow.buyCurrency}
                                                            <span className="text-gray-400 font-normal text-sm mx-1">for</span>
                                                            {escrow.sellCurrency}
                                                        </h3>
                                                        <p className="text-xs text-gray-400">ID: #{escrow.id.substring(0, 8)}</p>
                                                    </div>
                                                </div>
                                                <span className="px-3 py-1 bg-yellow-50 text-yellow-700 text-xs font-bold rounded-full border border-yellow-100 uppercase tracking-wide">
                                                    Funding Pending
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-50">
                                                <p className="text-sm text-gray-500">
                                                    Counterparty: <span className="font-medium text-gray-700">{escrow.counterPartyEmail || '...'}</span>
                                                </p>
                                                <button
                                                    onClick={() => router.push(`/trader/escrow/${escrow.id}/fund`)}
                                                    className="text-sm font-bold text-[#13ec5b] hover:text-[#0fb845] flex items-center gap-1 group-hover:gap-2 transition-all"
                                                >
                                                    Secure Fund Now
                                                    <ArrowRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Recent History (Simplified List of everything else) */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
                            <div className="bg-white rounded-3xl p-1 border border-gray-100 shadow-sm overflow-hidden">
                                {myEscrows.length === 0 ? (
                                    <div className="p-8 text-center text-gray-400 text-sm">No transaction history found.</div>
                                ) : (
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold">
                                            <tr>
                                                <th className="p-4 pl-6">Type</th>
                                                <th className="p-4">Amount</th>
                                                <th className="p-4">Status</th>
                                                <th className="p-4">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {myEscrows.slice(0, 5).map((e: any) => (
                                                <tr key={e.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => router.push(`/trader/escrow/${e.id}`)}>
                                                    <td className="p-4 pl-6 font-medium text-gray-900">{e.tradeType.replace(/_/g, ' ')}</td>
                                                    <td className="p-4">{e.amount} {e.buyCurrency}</td>
                                                    <td className="p-4">
                                                        <span className={`px-2 py-0.5 rounded text-xs font-bold 
                                                            ${e.state === 'COMPLETELY_FUNDED' ? 'bg-green-100 text-green-700' :
                                                                e.state === 'INITIALIZED' ? 'bg-yellow-50 text-yellow-700' : 'bg-gray-100 text-gray-500'}`
                                                        }>
                                                            {e.state}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-gray-400">{new Date(e.createdAt).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Stats/Info */}
                    <div className="space-y-6">
                        <div className="bg-gray-900 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-[#13ec5b] rounded-full blur-[80px] opacity-20 -mr-10 -mt-10"></div>
                            <h3 className="text-gray-400 text-sm uppercase font-bold tracking-wider mb-2">Total Volume</h3>
                            <p className="text-4xl font-bold mb-6 font-mono">$0.00</p>
                            {/* Placeholder for volume calc */}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                                    <p className="text-2xl font-bold">{myEscrows.filter((e: any) => e.state === 'COMPLETELY_FUNDED').length}</p>
                                    <p className="text-xs text-gray-400">Completed</p>
                                </div>
                                <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                                    <p className="text-2xl font-bold">{pendingFundingEscrows.length}</p>
                                    <p className="text-xs text-gray-400">Pending</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-gray-400" />
                                Trust Center
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${isVerified ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                                        <span className="text-sm font-medium text-gray-700">Identity Verification</span>
                                    </div>
                                    <span className={`text-xs font-bold ${isVerified ? 'text-green-600' : 'text-orange-500'}`}>
                                        {isVerified ? 'VERIFIED' : 'PENDING'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        <span className="text-sm font-medium text-gray-700">Email Verified</span>
                                    </div>
                                    <span className="text-xs font-bold text-green-600">YES</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
