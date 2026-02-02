'use client';

import { useGet } from '@/hooks/useApiQuery';
import API_ROUTES from '@/constants/api-routes';
import Link from 'next/link';
import { Plus, Eye, Edit2 } from 'lucide-react';


export default function CustodialWalletListPage() {
    const { data: wallets, loading, error } = useGet(API_ROUTES.WALLETS.GET_ALL);

    if (loading) return <div className="p-8">Loading wallets...</div>;
    if (error) return <div className="p-8 text-red-600">Error loading wallets: {error}</div>;

    return (
        <div className="min-h-screen bg-[#f6f8f6] p-8 font-display text-[#0d1b12]">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Custodial Wallets</h1>
                    <Link
                        href="/admin/custodial-wallet/new"
                        className="flex items-center gap-2 px-4 py-2 bg-[#13ec5b] text-[#0d1b12] rounded-lg text-sm font-bold hover:bg-[#10d050] transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add New Wallet
                    </Link>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Currency</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Address</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Created At</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {wallets && wallets.length > 0 ? (
                                wallets.map((wallet: any) => (
                                    <tr key={wallet.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-mono font-bold">{wallet.currency}</span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 font-mono text-sm truncate max-w-xs" title={wallet.address}>
                                            {wallet.address}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 text-sm">
                                            {new Date(wallet.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/admin/custodial-wallet/${wallet.id}`}
                                                    className="p-2 text-gray-400 hover:text-[#13ec5b] hover:bg-green-50 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                <Link
                                                    href={`/admin/custodial-wallet/${wallet.id}/edit`}
                                                    className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                                        No custodial wallets found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
