'use client';

import { useState, useEffect } from 'react';
import { useGet, usePut } from '@/hooks/useApiQuery';
import API_ROUTES from '@/constants/api-routes';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, AlertTriangle } from 'lucide-react';

export default function AdminUpdatePaymentPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const { data: escrow, loading } = useGet(API_ROUTES.ESCROWS.GET_ONE(id));

    // Form State
    const [amount, setAmount] = useState('');
    const [flags, setFlags] = useState({
        buyerMarkedPaymentSent: false,
        sellerMarkedPaymentSent: false,
        buyerConfirmedFunding: false,
        sellerConfirmedFunding: false
    });

    useEffect(() => {
        if (escrow) {
            setAmount(escrow.amount);
            setFlags({
                buyerMarkedPaymentSent: !!escrow.buyerMarkedPaymentSent,
                sellerMarkedPaymentSent: !!escrow.sellerMarkedPaymentSent,
                buyerConfirmedFunding: !!escrow.buyerConfirmedFunding, // Note: Model usually uses 'buyerConfirmedFunding', verify field name
                sellerConfirmedFunding: !!escrow.sellerConfirmedFunding
            });
        }
    }, [escrow]);

    const { put: updateEscrow, isPending } = usePut(API_ROUTES.ESCROWS.ADMIN_UPDATE(id), {
        onSuccess: () => {
            router.push(`/admin/escrow/${id}`);
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateEscrow({
            amount: parseFloat(amount),
            ...flags
        });
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-display">
            <div className="max-w-2xl mx-auto">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 font-bold"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Details
                </button>

                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">Update Payment Details</h1>

                    <div className="bg-yellow-50 p-4 rounded-xl flex gap-3 text-yellow-800 text-sm mb-8">
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        <p>Warning: Updating the amount here will force-update the associated Bank or Wallet Balance records. Use with caution.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Transaction Amount ({escrow?.buyCurrency})</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 font-mono font-bold text-xl text-gray-900"
                            />
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2">Status Flags</h3>

                            <Toggle
                                label="Buyer Marked Payment Sent"
                                checked={flags.buyerMarkedPaymentSent}
                                onChange={v => setFlags(f => ({ ...f, buyerMarkedPaymentSent: v }))}
                            />
                            <Toggle
                                label="Seller Marked Payment Sent"
                                checked={flags.sellerMarkedPaymentSent}
                                onChange={v => setFlags(f => ({ ...f, sellerMarkedPaymentSent: v }))}
                            />
                            {/* Note: Logic might typically hide Seller Sent if Buyer initiated, but Admin power allows all overrides */}
                            <Toggle
                                label="Buyer Confirmed Funding"
                                checked={flags.buyerConfirmedFunding}
                                onChange={v => setFlags(f => ({ ...f, buyerConfirmedFunding: v }))}
                            />
                            <Toggle
                                label="Seller Confirmed Funding"
                                checked={flags.sellerConfirmedFunding}
                                onChange={v => setFlags(f => ({ ...f, sellerConfirmedFunding: v }))}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all flex items-center justify-center gap-2"
                        >
                            {isPending ? 'Saving...' : 'Save Changes'}
                            <Save className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

function Toggle({ label, checked, onChange }: { label: string, checked: boolean, onChange: (v: boolean) => void }) {
    return (
        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
            <span className="font-medium text-gray-700">{label}</span>
            <input
                type="checkbox"
                checked={checked}
                onChange={e => onChange(e.target.checked)}
                className="w-5 h-5 accent-blue-600 rounded"
            />
        </label>
    );
}
