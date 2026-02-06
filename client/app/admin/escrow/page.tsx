'use client';

import { useState } from 'react';
import { useGet } from '@/hooks/useApiQuery';
import API_ROUTES from '@/constants/api-routes';
import Link from 'next/link';
import { Eye, Search, Filter, FileText, ChevronRight, X } from 'lucide-react';
import { EscrowState } from '@/constants/enums';

export default function AdminEscrowListPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | null>(null);

    const { data: escrows, loading, error } = useGet(API_ROUTES.ESCROWS.GET_ADMIN_ALL);

    const filteredEscrows = (escrows || []).filter((e: any) => {
        const matchesSearch = !searchTerm ||
            e.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.buyerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.sellerEmail?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = !statusFilter || e.state === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const statusOptions = [
        { value: EscrowState.INITIALIZED, label: 'Initialized', color: 'bg-blue-100 text-blue-700' },
        { value: EscrowState.ONE_PARTY_FUNDED, label: 'Partial', color: 'bg-amber-100 text-amber-700' },
        { value: EscrowState.COMPLETELY_FUNDED, label: 'Funded', color: 'bg-violet-100 text-violet-700' },
        { value: EscrowState.RELEASED, label: 'Released', color: 'bg-emerald-100 text-emerald-700' },
        { value: EscrowState.DISPUTED, label: 'Disputed', color: 'bg-red-100 text-red-700' },
    ];

    const getStatusBadge = (state: string) => {
        const option = statusOptions.find(o => o.value === state);
        return (
            <span className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${option?.color || 'bg-slate-100 text-slate-600'}`}>
                {state?.replace(/_/g, ' ')}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6 lg:p-10">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Escrow Management</h1>
                    <p className="text-slate-500 mt-1">Monitor and manage all platform escrow transactions.</p>
                </div>

                {/* Toolbar */}
                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-lg shadow-slate-200/30 p-4 mb-6 flex flex-col lg:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            data-testid="search-escrows-input"
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by ID, email..."
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {statusOptions.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => setStatusFilter(statusFilter === opt.value ? null : opt.value)}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${statusFilter === opt.value ? opt.color + ' border-current' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                            >
                                {opt.label}
                            </button>
                        ))}
                        {statusFilter && (
                            <button onClick={() => setStatusFilter(null)} className="p-2 text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-xl shadow-slate-200/40 overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-slate-400">Loading escrows...</div>
                    ) : error ? (
                        <div className="p-12 text-center text-red-500">Failed to load data</div>
                    ) : filteredEscrows.length === 0 ? (
                        <div className="p-16 text-center">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FileText className="w-10 h-10 text-slate-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">No Escrows Found</h3>
                            <p className="text-slate-500">No transactions match your current filters.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table data-testid="escrows-table" className="w-full">
                                <thead className="bg-slate-50/80 text-xs text-slate-500 uppercase tracking-wider">
                                    <tr>
                                        <th className="text-left p-4 font-semibold">ID</th>
                                        <th className="text-left p-4 font-semibold">Created</th>
                                        <th className="text-left p-4 font-semibold">Initiator</th>
                                        <th className="text-left p-4 font-semibold">Amount</th>
                                        <th className="text-left p-4 font-semibold">Trade</th>
                                        <th className="text-left p-4 font-semibold">Buyer Funding Status</th>
                                        <th className="text-left p-4 font-semibold">Seller Funding Status</th>
                                        <th className="text-left p-4 font-semibold">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredEscrows.map((escrow: any) => (
                                        <tr key={escrow.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="p-4">
                                                <span className="font-mono text-sm text-slate-600">#{escrow.id.substring(0, 8)}</span>
                                            </td>
                                            <td className="p-4 text-sm text-slate-500">
                                                {new Date(escrow.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="p-4">
                                                <p className="font-medium text-slate-900 text-sm">{escrow.isBuyerInitiated ? escrow.buyerEmail : escrow.sellerEmail}</p>
                                                <p className="text-xs text-slate-400">{escrow.isBuyerInitiated ? 'Buyer' : 'Seller'}</p>
                                            </td>
                                            <td className="p-4">
                                                <span className="font-bold text-slate-900">{escrow.amount}</span>
                                                <span className="text-slate-400 ml-1 text-sm">{escrow.buyCurrency}</span>
                                            </td>
                                            <td className="p-4 text-sm text-slate-600">
                                                {escrow.tradeType === 'CRYPTO_TO_CRYPTO' ? 'C2C' : 'C2F'}
                                            </td>
                                            <td className="p-4">{getStatusBadge(escrow.buyerFundingStatus)}</td>
                                            <td className="p-4">{getStatusBadge(escrow.sellerFundingStatus)}</td>
                                            <td className="p-4">
                                                <Link
                                                    data-testid="view-escrow-button"
                                                    href={`/admin/escrow/${escrow.id}`}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-700 rounded-lg text-sm font-semibold transition-colors"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
