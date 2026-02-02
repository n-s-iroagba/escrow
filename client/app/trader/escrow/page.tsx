'use client';

import { useState } from 'react';
import { useGet } from '@/hooks/useApiQuery';
import API_ROUTES from '@/constants/api-routes';
import Link from 'next/link';
import { Plus, ArrowRight, Filter, Wallet } from 'lucide-react';
import { EscrowState } from '@/constants/enums';

export default function EscrowListPage() {
    const [filter, setFilter] = useState<'all' | 'buyer' | 'seller'>('all');

    const { data: escrows, loading, error } = useGet(
        filter === 'all' ? API_ROUTES.ESCROWS.GET_ALL : `${API_ROUTES.ESCROWS.GET_ALL}?role=${filter}`
    );

    const getStatusBadge = (state: string) => {
        switch (state) {
            case EscrowState.INITIALIZED:
                return <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-bold border border-blue-100">Initialized</span>;
            case EscrowState.ONE_PARTY_FUNDED:
                return <span className="px-2 py-1 bg-yellow-50 text-yellow-600 rounded text-xs font-bold border border-yellow-100">Funding Pending</span>;
            case EscrowState.COMPLETELY_FUNDED:
                return <span className="px-2 py-1 bg-purple-50 text-purple-600 rounded text-xs font-bold border border-purple-100">Funded</span>;
            case EscrowState.RELEASED:
                return <span className="px-2 py-1 bg-green-50 text-green-600 rounded text-xs font-bold border border-green-100">Success</span>;
            case EscrowState.DISPUTED:
                return <span className="px-2 py-1 bg-red-50 text-red-600 rounded text-xs font-bold border border-red-100">Disputed</span>;
            default:
                return <span className="px-2 py-1 bg-gray-50 text-gray-500 rounded text-xs font-bold border border-gray-100">{state}</span>;
        }
    };

    return (
        <div className="min-h-screen bg-[#f6f8f6] p-8 font-display text-[#0d1b12]">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">My Transactions</h1>
                    <Link
                        href="/escrow/initiate"
                        className="bg-[#13ec5b] hover:bg-[#10c94d] text-[#0d1b12] px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-green-200 transition-all flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        New Transaction
                    </Link>
                </div>

                {/* Filters */}
                <div className="bg-white p-1 rounded-xl inline-flex mb-8 border border-gray-100 shadow-sm">
                    {(['all', 'buyer', 'seller'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${filter === f ? 'bg-[#0d1b12] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="text-center py-12">Loading transactions...</div>
                ) : error ? (
                    <div className="text-center py-12 text-red-500">Failed to load transactions</div>
                ) : escrows?.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Wallet className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Transactions Found</h3>
                        <p className="text-gray-500 mb-6">Start a new secure transaction today.</p>
                        <Link
                            href="/escrow/initiate"
                            className="text-[#13ec5b] font-bold hover:underline"
                        >
                            Create Escrow
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {escrows?.map((escrow: any) => {
                            // Use hardcoded check for user role for now until auth context is fully robust in frontend
                            // Assuming user is always viewing their own, we check if they are buyer or seller from the record
                            // But we don't have user id here easily without context.
                            // Logic: If I am Buyer and state is INITIALIZED -> Fund

                            // Simplification: Always show details, but add "Action Required" indicator if funding needed
                            const needsFunding = escrow.state === EscrowState.INITIALIZED;
                            // Ideally check if *I* am the one who needs to fund. 

                            return (
                                <div key={escrow.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between group">
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center font-bold text-gray-400">
                                            {escrow.buyCurrency.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="font-bold text-lg">
                                                    {escrow.amount} {escrow.buyCurrency}
                                                </h3>
                                                {getStatusBadge(escrow.state)}
                                            </div>
                                            <p className="text-sm text-gray-500 flex items-center gap-2">
                                                <span>{new Date(escrow.createdAt).toLocaleDateString()}</span>
                                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                <span className="font-mono text-xs">{escrow.id.substring(0, 8)}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {needsFunding && (
                                            <Link
                                                href={`/escrow/${escrow.id}/fund`}
                                                className="px-4 py-2 bg-yellow-50 text-yellow-700 text-sm font-bold rounded-lg border border-yellow-200 hover:bg-yellow-100 transition-colors"
                                            >
                                                Fund Now
                                            </Link>
                                        )}
                                        <Link
                                            href={`/escrow/${escrow.id}`}
                                            className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-[#13ec5b] group-hover:text-[#0d1b12] group-hover:border-[#13ec5b] transition-all"
                                        >
                                            <ArrowRight className="w-5 h-5" />
                                        </Link>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
