'use client';

import { useGet } from '@/hooks/useApiQuery';
import API_ROUTES from '@/constants/api-routes';
import Link from 'next/link';
import { ArrowLeft, Edit2 } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function BankDetailsPage() {
    const { id } = useParams();
    const { data: bank, loading, error } = useGet(API_ROUTES.BANKS.GET_ONE(id as string), {
        enabled: !!id
    });

    if (loading) return <div className="p-8">Loading bank details...</div>;
    if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
    if (!bank) return <div className="p-8">Bank not found</div>;

    return (
        <div className="min-h-screen bg-[#f6f8f6] p-8 font-display text-[#0d1b12]">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin/bank"
                            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-2xl font-bold">Bank Details</h1>
                    </div>
                    <Link
                        data-testid="edit-bank-link"
                        href={`/admin/bank/${id}/edit`}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
                    >
                        <Edit2 className="w-4 h-4" />
                        Edit Bank
                    </Link>
                </div>

                <div data-testid="bank-details-container" className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-8 border-b border-gray-100 flex items-center gap-6">
                        {bank.logoUrl ? (
                            <div className="w-24 h-24 rounded-xl border border-gray-100 p-4 flex items-center justify-center bg-gray-50">
                                <img src={bank.logoUrl} alt={bank.name} className="max-w-full max-h-full object-contain" />
                            </div>
                        ) : (
                            <div className="w-24 h-24 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-xl">
                                {bank.name.charAt(0)}
                            </div>
                        )}
                        <div>
                            <h2 className="text-2xl font-bold mb-1">{bank.name}</h2>
                            <span className="inline-block px-3 py-1 bg-green-50 text-[#13ec5b] text-xs font-bold rounded-full border border-[#13ec5b]/20">
                                ACTIVE
                            </span>
                        </div>
                    </div>

                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Account Number</label>
                            <p className="text-lg font-mono font-medium">{bank.accountNumber}</p>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Currency</label>
                            <p className="text-lg font-medium">{bank.currency}</p>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Recipient Name</label>
                            <p className="text-lg font-medium text-gray-700">{bank.recipientName || '-'}</p>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Routing Number</label>
                            <p className="text-lg font-mono font-medium text-gray-700">{bank.routingNumber || '-'}</p>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">SWIFT / BIC</label>
                            <p className="text-lg font-mono font-medium text-gray-700">{bank.swift || '-'}</p>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">IBAN</label>
                            <p className="text-lg font-mono font-medium text-gray-700">{bank.iban || '-'}</p>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Bank Address</label>
                            <p className="text-lg font-medium text-gray-700">{bank.bankAddress || '-'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
