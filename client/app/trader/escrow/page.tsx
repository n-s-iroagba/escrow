'use client';

import { useState } from 'react';
import { useGet } from '@/hooks/useApiQuery';
import API_ROUTES from '@/constants/api-routes';
import Link from 'next/link';
import { Plus, ArrowRight, Wallet, Coins, Banknote, ChevronRight, Search, Filter } from 'lucide-react';
import { EscrowState } from '@/constants/enums';

export default function EscrowListPage() {
    const [filter, setFilter] = useState<'all' | 'buyer' | 'seller'>('all');

    const { data: escrows, loading, error } = useGet(
        filter === 'all' ? API_ROUTES.ESCROWS.GET_ALL : `${API_ROUTES.ESCROWS.GET_ALL}?role=${filter}`
    );

    const getStatusBadge = (state: string) => {
        const styles: Record<string, string> = {
            [EscrowState.INITIALIZED]: 'bg-blue-50 text-blue-600 border-blue-200',
            [EscrowState.ONE_PARTY_FUNDED]: 'bg-yellow-50 text-yellow-600 border-yellow-200',
            [EscrowState.COMPLETELY_FUNDED]: 'bg-purple-50 text-purple-600 border-purple-200',
            [EscrowState.RELEASED]: 'bg-green-50 text-green-600 border-green-200',
            [EscrowState.DISPUTED]: 'bg-red-50 text-red-600 border-red-200',
            [EscrowState.CANCELLED]: 'bg-gray-50 text-gray-500 border-gray-200',
        };
        return (
            <span className={`text-[10px] font-bold uppercase tracking-wide px-3 py-1 rounded-full border ${styles[state] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                {state?.replace(/_/g, ' ')}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-[#f6f8f6] p-4 lg:p-8 font-display text-[#0d1b12]">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">My Transactions</h1>
                        <p className="text-gray-500 mt-2">Manage your secure escrow trades.</p>
                    </div>
                    <Link
                        data-testid="new-transaction-link"
                        href="/trader/escrow/initiate"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#13ec5b] hover:bg-[#10c94d] text-[#0d1b12] rounded-xl text-sm font-bold shadow-lg shadow-green-200 transition-all hover:-translate-y-0.5"
                    >
                        <Plus className="w-5 h-5" />
                        New Transaction
                    </Link>
                </div>

                {/* Filter and Content */}
                <div className="space-y-6">
                    {/* Filters */}
                    <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm w-fit">
                        {(['all', 'buyer', 'seller'] as const).map((f) => (
                            <button
                                key={f}
                                data-testid={`filter-${f}-button`}
                                onClick={() => setFilter(f)}
                                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${filter === f
                                    ? 'bg-[#0d1b12] text-white shadow-md'
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-pulse">
                                    <div className="h-16 bg-gray-100 rounded-xl"></div>
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 p-8 rounded-2xl border border-red-100 text-center">
                            <p className="text-red-600 font-bold mb-2">Unable to load transactions</p>
                            <button onClick={() => window.location.reload()} className="text-sm underline text-red-500">Try Again</button>
                        </div>
                    ) : escrows?.length === 0 ? (
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-16 text-center">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Wallet className="w-10 h-10 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">No Transactions Yet</h3>
                            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                                Start your first secure transaction to see it listed here.
                            </p>
                            <Link
                                href="/trader/escrow/initiate"
                                className="inline-flex items-center gap-2 text-[#0d1b12] hover:text-green-600 font-bold transition-colors"
                            >
                                Create Escrow <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {escrows?.map((escrow: any) => {
                                const needsFunding = escrow.state === EscrowState.INITIALIZED || escrow.state === EscrowState.ONE_PARTY_FUNDED;
                                const isCrypto = escrow.tradeType === 'CRYPTO_TO_CRYPTO';

                                return (
                                    <Link
                                        key={escrow.id}
                                        href={`/trader/escrow/${escrow.id}`}
                                        className="group block"
                                    >
                                        <div
                                            data-testid="escrow-card"
                                            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-green-200 transition-all cursor-pointer relative overflow-hidden"
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                                <div className="flex items-center gap-5">
                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${isCrypto ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                                                        {isCrypto ? <Coins className="w-7 h-7" /> : <Banknote className="w-7 h-7" />}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-xl flex items-center gap-2">
                                                            {escrow.amount} <span className="text-gray-400 text-base">{escrow.buyCurrency}</span>
                                                            <span className="text-gray-300">→</span>
                                                            <span className="text-gray-400 text-base">{escrow.sellCurrency}</span>
                                                        </h3>
                                                        <div className="flex items-center gap-3 text-sm text-gray-400 mt-1.5 font-medium">
                                                            <span>#{escrow.id.substring(0, 8)}</span>
                                                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                            <span>{new Date(escrow.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 self-start sm:self-center">
                                                    {getStatusBadge(escrow.state)}

                                                    {needsFunding && (
                                                        <span className="px-3 py-1 bg-[#13ec5b] text-[#0d1b12] text-xs font-bold rounded-full animate-pulse shadow-sm shadow-green-200">
                                                            Action Required
                                                        </span>
                                                    )}

                                                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#13ec5b] group-hover:text-[#0d1b12] transition-colors ml-2">
                                                        <ArrowRight className="w-5 h-5" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
