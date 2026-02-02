'use client';

import { useGet } from '@/hooks/useApiQuery';
import API_ROUTES from '@/constants/api-routes';
import Link from 'next/link';
import { Plus, Eye, Edit2, Wallet, Search, Copy, Check, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export default function CustodialWalletListPage() {
    const { data: wallets, loading, error } = useGet(API_ROUTES.WALLETS.GET_ALL);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const copyAddress = (id: string, address: string) => {
        navigator.clipboard.writeText(address);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6 lg:p-10">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Custodial Wallets</h1>
                        <p className="text-slate-500 mt-1">Manage platform custody wallets for crypto escrow.</p>
                    </div>
                    <Link
                        href="/admin/custodial-wallet/new"
                        className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/25 transition-all transform hover:scale-[1.02]"
                    >
                        <Plus className="w-4 h-4" />
                        Add Wallet
                    </Link>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by currency or address..."
                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm"
                        />
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="bg-white rounded-2xl border border-slate-200/60 p-12 text-center">
                        <div className="animate-pulse flex flex-col items-center">
                            <div className="w-12 h-12 bg-slate-100 rounded-full mb-4"></div>
                            <p className="text-slate-400">Loading wallets...</p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 rounded-2xl p-8 text-center text-red-600 border border-red-100">
                        Failed to load wallets. Please try again.
                    </div>
                ) : wallets && wallets.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {wallets.map((wallet: any) => (
                            <div
                                key={wallet.id}
                                className="bg-white rounded-2xl border border-slate-200/60 shadow-lg shadow-slate-200/30 hover:shadow-xl transition-all p-6 group"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-violet-200 flex items-center justify-center">
                                            <Wallet className="w-6 h-6 text-violet-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-lg font-mono">{wallet.currency}</h3>
                                            <p className="text-xs text-slate-400">{new Date(wallet.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-50 rounded-xl p-4 mb-4">
                                    <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-1">Address</p>
                                    <div className="flex items-center gap-2">
                                        <p className="font-mono text-sm text-slate-700 truncate flex-1" title={wallet.address}>
                                            {wallet.address}
                                        </p>
                                        <button
                                            onClick={() => copyAddress(wallet.id, wallet.address)}
                                            className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors"
                                        >
                                            {copiedId === wallet.id ? (
                                                <Check className="w-4 h-4 text-emerald-600" />
                                            ) : (
                                                <Copy className="w-4 h-4 text-slate-400" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pt-2">
                                    <Link
                                        href={`/admin/custodial-wallet/${wallet.id}`}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors"
                                    >
                                        <Eye className="w-4 h-4" />
                                        View
                                    </Link>
                                    <Link
                                        href={`/admin/custodial-wallet/${wallet.id}/edit`}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-50 hover:bg-violet-100 text-violet-700 rounded-xl text-sm font-semibold transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        Edit
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-lg p-12 text-center">
                        <div className="w-20 h-20 bg-violet-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Wallet className="w-10 h-10 text-violet-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No Wallets Configured</h3>
                        <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                            Add your first custodial wallet to enable crypto escrow.
                        </p>
                        <Link
                            href="/admin/custodial-wallet/new"
                            className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-700 font-bold"
                        >
                            Add Wallet <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
