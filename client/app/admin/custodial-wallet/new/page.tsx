'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import API_ROUTES from '@/constants/api-routes';
import { usePost } from '@/hooks/useApiQuery';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewCustodialWalletPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        currency: 'BTC',
        address: '',
        privateKey: '',
        publicKey: '',
    });

    const { post, isPending, error } = usePost(API_ROUTES.WALLETS.CREATE, {
        onSuccess: () => {
            router.push('/admin/custodial-wallet');
        },
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await post(formData);
    };

    return (
        <div className="min-h-screen bg-[#f6f8f6] p-8 font-display text-[#0d1b12]">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8 flex items-center gap-4">
                    <Link
                        href="/admin/custodial-wallet"
                        className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-2xl font-bold">Add Custodial Wallet</h1>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-gray-700">Currency</label>
                            <select
                                name="currency"
                                value={formData.currency}
                                onChange={handleInputChange}
                                className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#13ec5b] focus:ring-1 focus:ring-[#13ec5b] focus:bg-white transition-all outline-none appearance-none"
                            >
                                <option value="BTC">Bitcoin (BTC)</option>
                                <option value="ETH">Ethereum (ETH)</option>
                                <option value="USDT">Tether (USDT)</option>
                                <option value="USDC">USD Coin (USDC)</option>
                                <option value="LTC">Litecoin (LTC)</option>
                                <option value="XRP">Ripple (XRP)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-gray-700">Wallet Address</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                required
                                className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#13ec5b] focus:ring-1 focus:ring-[#13ec5b] focus:bg-white transition-all outline-none font-mono"
                                placeholder="0x..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-gray-700">Public Key</label>
                            <input
                                type="text"
                                name="publicKey"
                                value={formData.publicKey}
                                onChange={handleInputChange}
                                required
                                className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#13ec5b] focus:ring-1 focus:ring-[#13ec5b] focus:bg-white transition-all outline-none font-mono"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-gray-700">Private Key</label>
                            <textarea
                                name="privateKey"
                                value={formData.privateKey}
                                onChange={handleInputChange}
                                required
                                rows={4}
                                className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#13ec5b] focus:ring-1 focus:ring-[#13ec5b] focus:bg-white transition-all outline-none font-mono text-sm"
                                placeholder="Enter private key (will be encrypted on server)"
                            />
                            <p className="mt-1 text-xs text-red-500">
                                Warning: Handle private keys with extreme care. Ensure this connection is secure.
                            </p>
                        </div>

                        {error && (
                            <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="pt-4 flex items-center justify-end gap-4">
                            <Link
                                href="/admin/custodial-wallet"
                                className="px-6 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={isPending}
                                className="px-8 py-3 rounded-xl bg-[#13ec5b] text-[#0d1b12] text-sm font-bold shadow-[0_4px_14px_0_rgba(19,236,91,0.3)] hover:shadow-[0_6px_20px_rgba(19,236,91,0.23)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isPending ? 'Creating...' : 'Create Wallet'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
