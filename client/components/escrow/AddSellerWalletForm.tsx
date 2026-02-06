import { useState } from 'react';
import { usePost } from '@/hooks/useApiQuery';
import API_ROUTES from '@/constants/api-routes';

export function AddSellerWalletForm({ escrowId, currency }: { escrowId: string, currency: string }) {
    const { post, isPending } = usePost(API_ROUTES.SELLER_WALLETS.CREATE, {
        onSuccess: () => window.location.reload()
    });

    const [address, setAddress] = useState('');
    const [network, setNetwork] = useState('Mainnet');

    const handleSubmit = async () => {
        if (!address) return;
        await post({
            escrowId,
            currency,
            walletAddress: address,
            network
        });
    };

    return (
        <div className="space-y-3">
            <div className="text-left">
                <label className="text-xs font-bold text-gray-500 uppercase">Wallet Address ({currency})</label>
                <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={`Enter ${currency} Address`}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl mt-1 text-sm outline-none focus:border-[#13ec5b]"
                />
            </div>
            <button
                onClick={handleSubmit}
                disabled={isPending || !address}
                className="w-full py-2.5 bg-[#13ec5b] hover:bg-[#10c94d] text-[#0d1b12] font-bold rounded-xl transition-all text-sm"
            >
                {isPending ? 'Saving...' : 'Save Wallet'}
            </button>
        </div>
    );
}
