'use client';

import { useGet } from '@/hooks/useApiQuery';
import API_ROUTES from '@/constants/api-routes';
import Link from 'next/link';
import { Plus, Eye, Edit2 } from 'lucide-react';

export default function BankListPage() {
    const { data: banks, loading, error } = useGet(API_ROUTES.BANKS.GET_ALL);

    if (loading) return <div className="p-8">Loading banks...</div>;
    if (error) return <div className="p-8 text-red-600">Error loading banks: {error}</div>;

    return (
        <div className="min-h-screen bg-[#f6f8f6] p-8 font-display text-[#0d1b12]">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Banks</h1>
                    <Link
                        href="/admin/bank/new"
                        className="flex items-center gap-2 px-4 py-2 bg-[#13ec5b] text-[#0d1b12] rounded-lg text-sm font-bold hover:bg-[#10d050] transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add New Bank
                    </Link>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Bank Name</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Account Number</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Currency</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {banks && banks.length > 0 ? (
                                banks.map((bank: any) => (
                                    <tr key={bank.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 flex items-center gap-3">
                                            {bank.logoUrl && (
                                                <img src={bank.logoUrl} alt={bank.name} className="w-8 h-8 object-contain rounded bg-white border border-gray-100 p-1" />
                                            )}
                                            <span className="font-medium">{bank.name}</span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 font-mono text-sm">{bank.accountNumber}</td>
                                        <td className="px-6 py-4 text-gray-600">{bank.currency}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/admin/bank/${bank.id}`}
                                                    className="p-2 text-gray-400 hover:text-[#13ec5b] hover:bg-green-50 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                <Link
                                                    href={`/admin/bank/${bank.id}/edit`}
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
                                        No banks found. Create one to get started.
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
