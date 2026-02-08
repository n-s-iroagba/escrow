import { useState } from 'react';
import { usePost } from '@/hooks/useApiQuery';
import API_ROUTES from '@/constants/api-routes';
import { AlertCircle } from 'lucide-react';

export function AddSellerBankForm({ escrowId }: { escrowId: string }) {
    const { post, isPending } = usePost(API_ROUTES.SELLER_BANKS.CREATE, {
        onSuccess: () => window.location.reload()
    });

    const [formData, setFormData] = useState({
        accountHolderName: '',
        accountNumber: '',
        bankName: '',
        routingNumber: '',
        swift: '',
        iban: ''
    });

    const handleSubmit = async () => {
        if (!formData.accountNumber || !formData.accountHolderName) return;
        await post({
            escrowId,
            ...formData
        });
    };

    return (
        <div className="space-y-3 text-left">
            <div className="flex items-start gap-2 pt-2">
                <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-600 leading-snug">
                    This the bank account you intend to receive your funds in, once you confirm this transaction you can't edit this details.
                </p>
            </div>
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Account Holder</label>
                <input
                    type="text"
                    value={formData.accountHolderName}
                    onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl mt-1 text-sm outline-none focus:border-[#13ec5b]"
                />
            </div>
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Account Number</label>
                <input
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl mt-1 text-sm outline-none focus:border-[#13ec5b]"
                />
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Bank Name</label>
                    <input
                        type="text"
                        value={formData.bankName}
                        onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl mt-1 text-sm outline-none focus:border-[#13ec5b]"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Routing Number</label>
                    <input
                        type="text"
                        value={formData.routingNumber}
                        onChange={(e) => setFormData({ ...formData, routingNumber: e.target.value })}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl mt-1 text-sm outline-none focus:border-[#13ec5b]"
                        placeholder=""
                    />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">SWIFT Code</label>
                    <input
                        type="text"
                        value={formData.swift}
                        onChange={(e) => setFormData({ ...formData, swift: e.target.value })}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl mt-1 text-sm outline-none focus:border-[#13ec5b]"
                        placeholder=""
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">IBAN</label>
                    <input
                        type="text"
                        value={formData.iban}
                        onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl mt-1 text-sm outline-none focus:border-[#13ec5b]"
                        placeholder=""
                    />
                </div>
            </div>

            <button
                onClick={handleSubmit}
                disabled={isPending || !formData.accountNumber}
                className="w-full py-2.5 bg-[#13ec5b] hover:bg-[#10c94d] text-[#0d1b12] font-bold rounded-xl transition-all text-sm mt-2"
            >
                {isPending ? 'Saving...' : 'Save Bank Details'}
            </button>

        </div>
    );
}
