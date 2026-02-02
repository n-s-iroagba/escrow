'use client';

import { useGet } from '@/hooks/useApiQuery';
import API_ROUTES from '@/constants/api-routes';
import Link from 'next/link';
import { ArrowLeft, Edit2, Copy } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function CustodialWalletDetailsPage() {
    const { id } = useParams();
    const { data: wallet, loading, error } = useGet(API_ROUTES.WALLETS.GET_ONE(id as string), {
        enabled: !!id
    });

    if (loading) return <div className="p-8">Loading wallet details...</div>;
    if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
    if (!wallet) return <div className="p-8">Wallet not found</div>;

    return (
        <div className="min-h-screen bg-[#f6f8f6] p-8 font-display text-[#0d1b12]">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin/custodial-wallet"
                            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-2xl font-bold">Wallet Details</h1>
                    </div>
                    <Link
                        href={`/admin/custodial-wallet/${id}/edit`}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
                    >
                        <Edit2 className="w-4 h-4" />
                        Edit Wallet
                    </Link>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-8 border-b border-gray-100 flex items-center gap-6">
                        <div className="w-16 h-16 rounded-full bg-[#13ec5b]/10 flex items-center justify-center text-[#13ec5b] font-bold text-2xl">
                            {wallet.currency}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold mb-1">{wallet.currency} Wallet</h2>
                            <p className="text-gray-500 text-sm font-mono">{wallet.id}</p>
                        </div>
                    </div>

                    <div className="p-8 space-y-6">
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Wallet Address</label>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <code className="text-sm font-mono break-all">{wallet.address}</code>
                                <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-500">
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Public Key</label>
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <code className="text-sm font-mono break-all text-gray-600">{wallet.publicKey}</code>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Private Key</label>
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                {/* We might obscure this or show it if authorized. Assuming obscured for view */}
                                <code className="text-sm font-mono break-all text-gray-600">
                                    {wallet.privateKey ? '••••••••••••••••••••••••••••••••' : 'No Private Key Set'}
                                </code>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
