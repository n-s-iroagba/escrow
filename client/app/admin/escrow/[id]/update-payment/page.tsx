'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGet, usePost } from '@/hooks/useApiQuery';
import API_ROUTES from '@/constants/api-routes';
import { EscrowState, TradeType } from '@/constants/enums';
import {
    ArrowLeft,
    Save,
    ShieldCheck,
    AlertCircle,
    Banknote,
    Coins,
    CheckCircle2
} from 'lucide-react';

export default function AdminUpdatePaymentPage() {
    const { id } = useParams();
    const router = useRouter();

    const { data: escrow, loading, error, refetch } = useGet(
        API_ROUTES.ESCROWS.GET_ONE(id as string),
        { enabled: !!id }
    );

    const { data: fundingDetails } = useGet(
        API_ROUTES.ESCROWS.GET_FUNDING_DETAILS(id as string),
        { enabled: !!id }
    );

    const { post: fundEscrow, isPending: isSaving } = usePost(
        API_ROUTES.ESCROWS.FUND(id as string),
        {
            onSuccess: () => {
                alert('Payment details updated successfully');
                refetch();
            }
        }
    );

    // State for form inputs
    const [buyerAmount, setBuyerAmount] = useState<string>('');
    const [buyerConfirmed, setBuyerConfirmed] = useState<boolean>(false);

    const [sellerAmount, setSellerAmount] = useState<string>('');
    const [sellerConfirmed, setSellerConfirmed] = useState<boolean>(false);

    // Populate state from escrow data when loaded
    useEffect(() => {
        if (escrow) {
            // Buyer Side Logic
            if (escrow.tradeType === TradeType.CRYPTO_TO_FIAT) {
                // Buyer pays Fiat -> Check bankBalance
                if (escrow.bankBalance) {
                    setBuyerAmount(escrow.bankBalance.amount);
                    setBuyerConfirmed(escrow.bankBalance.confirmedByAdmin);
                } else {
                    setBuyerAmount(escrow.amount); // Default to expected amount
                }
            } else {
                // Buyer pays Crypto -> Check cryptoBalances with role BUYER
                const balance = escrow.cryptoBalances?.find((b: any) => b.role === 'BUYER');
                if (balance) {
                    setBuyerAmount(balance.balance);
                    setBuyerConfirmed(balance.confirmedByAdmin);
                } else {
                    setBuyerAmount(escrow.amount);
                }
            }

            // Seller Side Logic (Always Crypto)
            // Check cryptoBalances with role SELLER
            const balance = escrow.cryptoBalances?.find((b: any) => b.role === 'SELLER');
            if (balance) {
                setSellerAmount(balance.balance);
                setSellerConfirmed(balance.confirmedByAdmin);
            } else {
                setSellerAmount(escrow.amount); // Default 
            }
        }
    }, [escrow]);

    const handleSaveBuyer = () => {
        fundEscrow({
            role: 'BUYER',
            amount: parseFloat(buyerAmount),
            confirmed: buyerConfirmed,
            bankId: fundingDetails?.adminBank?.id
        });
    };

    const handleSaveSeller = () => {
        fundEscrow({
            role: 'SELLER',
            amount: parseFloat(sellerAmount),
            confirmed: sellerConfirmed
        });
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
    if (!escrow) return null;

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-display">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 font-bold"
                >
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>

                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Update Payment Details</h1>
                        <p className="text-gray-500">Manage received funds for Escrow #{id?.toString().substring(0, 8)}</p>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                        <span className="text-xs font-bold text-gray-400 uppercase block">Trade Type</span>
                        <span className="font-bold text-gray-900">{escrow.tradeType}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Buyer Side Panel */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                {escrow.tradeType === TradeType.CRYPTO_TO_FIAT ? <Banknote className="w-5 h-5" /> : <Coins className="w-5 h-5" />}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">Buyer Payment</h3>
                                <p className="text-xs text-gray-500 font-medium">
                                    Expected: {escrow.amount} {escrow.buyCurrency}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Amount Received</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={buyerAmount}
                                        onChange={e => setBuyerAmount(e.target.value)}
                                        className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none font-mono font-medium"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
                                        {escrow.buyCurrency}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="text-sm font-bold text-gray-700">Mark as Confirmed</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={buyerConfirmed}
                                        onChange={e => setBuyerConfirmed(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            <button
                                onClick={handleSaveBuyer}
                                disabled={isSaving}
                                className="w-full py-4 bg-[#13ec5b] hover:bg-[#10c94d] text-[#0d1b12] font-bold rounded-xl shadow-lg shadow-green-200 transition-all hover:scale-[1.02] mt-2 flex items-center justify-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                Save Buyer Payment
                            </button>
                        </div>
                    </div>

                    {/* Seller Side Panel */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                                <Coins className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">Seller Payment</h3>
                                <p className="text-xs text-gray-500 font-medium">
                                    Expected: {escrow.amount} {escrow.sellCurrency}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Amount Received</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={sellerAmount}
                                        onChange={e => setSellerAmount(e.target.value)}
                                        className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none font-mono font-medium"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
                                        {escrow.sellCurrency}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="text-sm font-bold text-gray-700">Mark as Confirmed</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={sellerConfirmed}
                                        onChange={e => setSellerConfirmed(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                </label>
                            </div>

                            <button
                                onClick={handleSaveSeller}
                                disabled={isSaving}
                                className="w-full py-4 bg-[#13ec5b] hover:bg-[#10c94d] text-[#0d1b12] font-bold rounded-xl shadow-lg shadow-green-200 transition-all hover:scale-[1.02] mt-2 flex items-center justify-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                Save Seller Payment
                            </button>
                        </div>
                    </div>

                </div>

                {/* Status Indicator */}
                <div className="mt-8 bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3 text-amber-900 text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <div>
                        <p className="font-bold mb-1">Important Note</p>
                        <p>Updating these balances will be immediately reflected on the user's escrow details page. Please verify the actual receipt of funds before confirming.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
