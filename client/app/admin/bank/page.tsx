'use client';

import { useGet } from '@/hooks/useApiQuery';
import API_ROUTES from '@/constants/api-routes';
import Link from 'next/link';
import { Plus, Eye, Edit2, Landmark, Search, Building2, ChevronRight } from 'lucide-react';

export default function BankListPage() {
    const { data: banks, loading, error } = useGet(API_ROUTES.BANKS.GET_ALL);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6 lg:p-10">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Bank Accounts</h1>
                        <p className="text-slate-500 mt-1">Manage custodial fiat bank accounts for escrow settlements.</p>
                    </div>
                    <Link
                        href="/admin/bank/new"
                        className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/25 transition-all transform hover:scale-[1.02]"
                    >
                        <Plus className="w-4 h-4" />
                        Add Bank
                    </Link>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search banks..."
                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm"
                        />
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="bg-white rounded-2xl border border-slate-200/60 p-12 text-center">
                        <div className="animate-pulse flex flex-col items-center">
                            <div className="w-12 h-12 bg-slate-100 rounded-full mb-4"></div>
                            <p className="text-slate-400">Loading banks...</p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 rounded-2xl p-8 text-center text-red-600 border border-red-100">
                        Failed to load bank accounts. Please try again.
                    </div>
                ) : banks && banks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {banks.map((bank: any) => (
                            <div
                                key={bank.id}
                                className="bg-white rounded-2xl border border-slate-200/60 shadow-lg shadow-slate-200/30 hover:shadow-xl transition-all p-6 group"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        {bank.logoUrl ? (
                                            <img src={bank.logoUrl} alt={bank.name} className="w-12 h-12 object-contain rounded-xl bg-slate-50 border border-slate-100 p-2" />
                                        ) : (
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                                                <Building2 className="w-6 h-6 text-slate-400" />
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-lg">{bank.name}</h3>
                                            <p className="text-sm text-slate-500">{bank.currency}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-50 rounded-xl p-4 mb-4">
                                    <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-1">Account Number</p>
                                    <p className="font-mono text-slate-700 text-lg">{bank.accountNumber}</p>
                                </div>

                                <div className="flex items-center gap-2 pt-2">
                                    <Link
                                        href={`/admin/bank/${bank.id}`}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors"
                                    >
                                        <Eye className="w-4 h-4" />
                                        View
                                    </Link>
                                    <Link
                                        href={`/admin/bank/${bank.id}/edit`}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-sm font-semibold transition-colors"
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
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Landmark className="w-10 h-10 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No Banks Configured</h3>
                        <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                            Add your first bank account to enable fiat escrow settlements.
                        </p>
                        <Link
                            href="/admin/bank/new"
                            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-bold"
                        >
                            Add Bank <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
