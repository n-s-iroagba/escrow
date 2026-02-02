'use client';

import { useGet } from '@/hooks/useApiQuery';
import API_ROUTES from '@/constants/api-routes';
import Link from 'next/link';
import { Eye, Search, Filter } from 'lucide-react';
import { EscrowState } from '@/constants/enums';

export default function AdminEscrowListPage() {
    const { data: escrows, loading, error } = useGet(API_ROUTES.ESCROWS.GET_ADMIN_ALL);

    const getStatusStyle = (state: string) => {
        switch (state) {
            case EscrowState.INITIALIZED: return 'bg-blue-50 text-blue-600';
            case EscrowState.ONE_PARTY_FUNDED: return 'bg-yellow-50 text-yellow-600';
            case EscrowState.COMPLETELY_FUNDED: return 'bg-purple-50 text-purple-600';
            case EscrowState.RELEASED: return 'bg-green-50 text-green-600';
            case EscrowState.DISPUTED: return 'bg-red-50 text-red-600';
            case EscrowState.CANCELLED: return 'bg-gray-50 text-gray-500';
            default: return 'bg-gray-50 text-gray-500';
        }
    };

    return (
        <div className="min-h-screen bg-[#f6f8f6] p-8 font-display text-[#0d1b12]">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Escrow Management</h1>
                    {/* Placeholder for future admin creation functionality if needed */}
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Toolbar */}
                    <div className="p-4 border-b border-gray-100 flex gap-4">
                        <div className="relative flex-1">
                            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by ID, email, or amount..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:border-[#13ec5b]"
                            />
                        </div>
                        <button className="px-4 py-2 border border-gray-200 rounded-lg flex items-center gap-2 hover:bg-gray-50">
                            <Filter className="w-4 h-4 text-gray-500" />
                            <span>Filter</span>
                        </button>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Loading escrows...</div>
                    ) : error ? (
                        <div className="p-8 text-center text-red-500">Error loading data</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4">ID</th>
                                        <th className="px-6 py-4">Created</th>
                                        <th className="px-6 py-4">Initiator</th>
                                        <th className="px-6 py-4">Amount</th>
                                        <th className="px-6 py-4">Trade</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {escrows?.map((escrow: any) => (
                                        <tr key={escrow.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-mono text-xs text-gray-500">
                                                {escrow.id.substring(0, 8)}...
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {new Date(escrow.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium">
                                                {escrow.isBuyerInitiated ? escrow.buyerEmail : escrow.sellerEmail}
                                                <span className="text-xs text-gray-400 font-normal block">
                                                    {escrow.isBuyerInitiated ? '(Buyer)' : '(Seller)'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-bold">
                                                {escrow.amount} <span className="text-gray-400 font-normal text-sm">{escrow.buyCurrency}</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                {escrow.tradeType === 'CRYPTO_TO_CRYPTO' ? 'Crypto ↔ Crypto' : 'Crypto ↔ Fiat'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-md text-xs font-bold ${getStatusStyle(escrow.state)}`}>
                                                    {escrow.state.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Link
                                                    href={`/admin/escrow/${escrow.id}`}
                                                    className="p-2 text-gray-400 hover:text-[#13ec5b] hover:bg-green-50 rounded-lg inline-block transition-colors"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {escrows?.length === 0 && (
                                <div className="p-12 text-center text-gray-400">
                                    No transaction records found.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
