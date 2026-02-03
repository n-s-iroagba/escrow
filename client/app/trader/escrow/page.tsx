'use client';

import { useState } from 'react';
import { useGet } from '@/hooks/useApiQuery';
import API_ROUTES from '@/constants/api-routes';
import Link from 'next/link';
import { Plus, ArrowRight, Wallet, Coins, Banknote, ChevronRight } from 'lucide-react';
import { EscrowState } from '@/constants/enums';

export default function EscrowListPage() {
    const [filter, setFilter] = useState<'all' | 'buyer' | 'seller'>('all');

    const { data: escrows, loading, error } = useGet(
        filter === 'all' ? API_ROUTES.ESCROWS.GET_ALL : `${API_ROUTES.ESCROWS.GET_ALL}?role=${filter}`
    );

    const getStatusBadge = (state: string) => {
        const styles: Record<string, string> = {
            [EscrowState.INITIALIZED]: 'bg-blue-100 text-blue-700',
            [EscrowState.ONE_PARTY_FUNDED]: 'bg-amber-100 text-amber-700',
            [EscrowState.COMPLETELY_FUNDED]: 'bg-violet-100 text-violet-700',
            [EscrowState.RELEASED]: 'bg-emerald-100 text-emerald-700',
            [EscrowState.DISPUTED]: 'bg-red-100 text-red-700',
        };
        return (
            <span className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${styles[state] || 'bg-slate-100 text-slate-600'}`}>
                {state?.replace(/_/g, ' ')}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6 lg:p-10">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Transactions</h1>
                        <p className="text-slate-500 mt-1">View and manage your escrow transactions.</p>
                    </div>
                    <Link
                        data-testid="new-transaction-link"
                        href="/trader/escrow/initiate"
                        className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/25 transition-all transform hover:scale-[1.02]"
                    >
                        <Plus className="w-4 h-4" />
                        New Transaction
                    </Link>
                </div>

                {/* Filter Tabs */}
                <div className="bg-white p-1.5 rounded-xl inline-flex mb-8 border border-slate-200 shadow-sm">
                    {(['all', 'buyer', 'seller'] as const).map((f) => (
                        <button
                            key={f}
                            data-testid={`filter-${f}-button`}
                            onClick={() => setFilter(f)}
                            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${filter === f
                                ? 'bg-slate-900 text-white shadow-md'
                                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {loading ? (
                    <div className="bg-white rounded-2xl border border-slate-200/60 p-12 text-center">
                        <div className="animate-pulse flex flex-col items-center">
                            <div className="w-12 h-12 bg-slate-100 rounded-full mb-4"></div>
                            <p className="text-slate-400">Loading transactions...</p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 rounded-2xl p-8 text-center text-red-600 border border-red-100">
                        Failed to load transactions. Please try again.
                    </div>
                ) : escrows?.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-xl p-16 text-center">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Wallet className="w-10 h-10 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No Transactions Found</h3>
                        <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                            Start a new secure escrow transaction today.
                        </p>
                        <Link
                            href="/trader/escrow/initiate"
                            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-bold"
                        >
                            Create Escrow <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {escrows?.map((escrow: any) => {
                            const needsFunding = escrow.state === EscrowState.INITIALIZED || escrow.state === EscrowState.ONE_PARTY_FUNDED;
                            const isCrypto = escrow.tradeType === 'CRYPTO_TO_CRYPTO';

                            return (
                                <div
                                    key={escrow.id}
                                    data-testid="escrow-card"
                                    className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-lg shadow-slate-200/30 hover:shadow-xl transition-all group"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isCrypto ? 'bg-violet-100 text-violet-600' : 'bg-blue-100 text-blue-600'}`}>
                                                {isCrypto ? <Coins className="w-6 h-6" /> : <Banknote className="w-6 h-6" />}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900 text-lg">
                                                    {escrow.amount} <span className="text-slate-400 text-base">{escrow.buyCurrency}</span>
                                                    <span className="text-slate-300 mx-2">→</span>
                                                    <span className="text-slate-400 text-base">{escrow.sellCurrency}</span>
                                                </h3>
                                                <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                                                    <span>{new Date(escrow.createdAt).toLocaleDateString()}</span>
                                                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                    <span className="font-mono text-xs">#{escrow.id.substring(0, 8)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {getStatusBadge(escrow.state)}
                                            {needsFunding && (
                                                <Link
                                                    data-testid="fund-escrow-button"
                                                    href={`/trader/escrow/${escrow.id}/fund`}
                                                    className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 text-sm font-bold rounded-xl border border-amber-200 transition-colors"
                                                >
                                                    Fund Now
                                                </Link>
                                            )}
                                            <Link
                                                data-testid="view-escrow-button"
                                                href={`/trader/escrow/${escrow.id}`}
                                                className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500 transition-all"
                                            >
                                                <ArrowRight className="w-5 h-5" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
