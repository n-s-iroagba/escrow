'use client';

import { useGet } from '@/hooks/useApiQuery';
import API_ROUTES from '@/constants/api-routes';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, ShieldCheck, Banknote, Coins } from 'lucide-react';

export default function AdminEscrowDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const { data: escrow, loading } = useGet(API_ROUTES.ESCROWS.GET_ONE(id));

    if (loading) return <div className="p-12 text-center text-gray-500">Loading escrow details...</div>;
    if (!escrow) return <div className="p-12 text-center text-red-500">Escrow not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-display">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 font-bold"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back
                </button>

                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Escrow Details</h1>
                        <p className="text-gray-500 font-mono text-sm">ID: {escrow.id}</p>
                    </div>
                    <button
                        onClick={() => router.push(`/admin/escrow/${id}/update-payment`)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 flex items-center gap-2"
                    >
                        <Edit className="w-4 h-4" />
                        Update Payment
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* General Info */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-gray-400" />
                            General Information
                        </h3>
                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">State</span>
                                <span className="font-bold bg-gray-100 px-2 py-1 rounded text-gray-700">{escrow.state}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Amount</span>
                                <span className="font-bold text-lg">{escrow.amount} {escrow.buyCurrency}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Trade Type</span>
                                <span className="font-medium">{escrow.tradeType}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Created At</span>
                                <span className="font-medium">{new Date(escrow.createdAt).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Parties */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Coins className="w-5 h-5 text-gray-400" />
                            Parties Involved
                        </h3>
                        <div className="space-y-4 text-sm">
                            <div className="p-3 bg-gray-50 rounded-xl">
                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Buyer</p>
                                <p className="font-medium text-gray-900">{escrow.buyerEmail}</p>
                                <p className="text-xs text-green-600 mt-1">{escrow.buyer?.kycStatus || 'Unknown KYC'}</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl">
                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Seller</p>
                                <p className="font-medium text-gray-900">{escrow.sellerEmail}</p>
                                <p className="text-xs text-green-600 mt-1">{escrow.seller?.kycStatus || 'Unknown KYC'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Payment Flags */}
                    <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Banknote className="w-5 h-5 text-gray-400" />
                            Payment Status Flags
                        </h3>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <FlagBox label="Buyer Sent" value={escrow.buyerMarkedPaymentSent} />
                            <FlagBox label="Seller Sent" value={escrow.sellerMarkedPaymentSent} />
                            <FlagBox label="Buyer Confirmed Funding" value={escrow.buyerConfirmedFunding} />
                            <FlagBox label="Seller Confirmed Funding" value={escrow.sellerConfirmedFunding} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function FlagBox({ label, value }: { label: string, value: boolean }) {
    return (
        <div className={`p-4 rounded-xl border-2 ${value ? 'border-green-100 bg-green-50' : 'border-gray-100 bg-gray-50'} text-center`}>
            <p className="text-xs text-gray-500 font-bold uppercase mb-2">{label}</p>
            <div className={`inline-flex items-center gap-1 font-bold ${value ? 'text-green-600' : 'text-gray-400'}`}>
                {value ? 'YES' : 'NO'}
            </div>
        </div>
    );
}
