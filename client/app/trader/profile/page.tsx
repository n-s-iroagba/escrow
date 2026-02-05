'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useRequiredAuth } from '@/hooks/useAuthContext';
import { useGet, usePost } from '@/hooks/useApiQuery';
import API_ROUTES from '@/constants/api-routes';
import {
    User as UserIcon,
    CreditCard,
    Shield,
    Plus,
    Landmark,
    CheckCircle2,
    AlertCircle,

} from 'lucide-react';

export default function ProfilePage() {
    const { user } = useRequiredAuth();
    const searchParams = useSearchParams();
    const router = useRouter();

    // Tab State
    const [activeTab, setActiveTab] = useState('profile');
    const [showAddBank, setShowAddBank] = useState(false);

    // Form State
    const [bankForm, setBankForm] = useState({
        accountHolderName: '',
        accountNumber: '',
        bankName: '',
        routingNumber: '',
        swift: '',
        iban: ''
    });

    // Query Params Logic
    const action = searchParams.get('action');
    const redirectUrl = searchParams.get('redirect');

    useEffect(() => {
        if (action === 'add_bank') {
            setActiveTab('payment');
            setShowAddBank(true);
        }
    }, [action]);

    // Data Fetching
    const { data: banks, loading: loadingBanks } = useGet(
        API_ROUTES.SELLER_BANKS.GET_ALL,
        { enabled: activeTab === 'payment' }
    );

    const { post: addBank, isPending: addingBank, error: addBankError } = usePost(
        API_ROUTES.SELLER_BANKS.CREATE,
        {
            onSuccess: () => {
                setShowAddBank(false);
                setBankForm({
                    accountHolderName: '',
                    accountNumber: '',
                    bankName: '',
                    routingNumber: '',
                    swift: '',
                    iban: ''
                });
                // Refresh banks list if needed (react-query usually handles invalidation, here simple reload or relying on re-fetch)
                window.location.reload();

                if (redirectUrl) {
                    router.push(redirectUrl);
                }
            }
        }
    );

    const handleSubmitBank = async (e: React.FormEvent) => {
        e.preventDefault();
        await addBank(bankForm);
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#f6f8f6] p-8 font-display text-[#0d1b12]">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Settings</h1>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Sidebar Tabs */}
                    <div className="space-y-2">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'profile' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}
                        >
                            <UserIcon className="w-5 h-5" />
                            Profile
                        </button>
                        <button
                            onClick={() => setActiveTab('payment')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'payment' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}
                        >
                            <CreditCard className="w-5 h-5" />
                            Payment Methods
                        </button>
                        <button
                            onClick={() => setActiveTab('security')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'security' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}
                        >
                            <Shield className="w-5 h-5" />
                            Security
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="md:col-span-3">

                        {/* PROFILE TAB */}
                        {activeTab === 'profile' && (
                            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                                <h2 className="text-xl font-bold mb-6">Personal Information</h2>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Email Address</label>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{user.email}</span>
                                            {user.emailVerified && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Role</label>
                                        <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold">{user.role}</span>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">KYC Status</label>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.kycStatus === 'VERIFIED' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                                            {user.kycStatus || 'UNVERIFIED'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* PAYMENT METHODS TAB */}
                        {activeTab === 'payment' && (
                            <div className="space-y-6">
                                {/* Bank Accounts Section */}
                                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xl font-bold flex items-center gap-2">
                                            <Landmark className="w-5 h-5 text-gray-400" />
                                            Bank Accounts
                                        </h2>
                                        {!showAddBank && (
                                            <button
                                                onClick={() => setShowAddBank(true)}
                                                className="px-4 py-2 bg-gray-900 text-white rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-gray-800 transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                                Add Bank
                                            </button>
                                        )}
                                    </div>

                                    {/* Add Bank Form */}
                                    {showAddBank ? (
                                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 animate-in fade-in slide-in-from-top-4">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="font-bold text-gray-900">Add New Bank Account</h3>
                                                <button onClick={() => setShowAddBank(false)} className="text-gray-400 hover:text-gray-600 text-sm">Cancel</button>
                                            </div>

                                            <form onSubmit={handleSubmitBank} className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Account Holder Name</label>
                                                        <input
                                                            required
                                                            type="text"
                                                            className="w-full p-3 bg-white border border-gray-200 rounded-lg outline-none focus:border-green-500 transition-colors"
                                                            value={bankForm.accountHolderName}
                                                            onChange={e => setBankForm({ ...bankForm, accountHolderName: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Bank Name</label>
                                                        <input
                                                            type="text"
                                                            className="w-full p-3 bg-white border border-gray-200 rounded-lg outline-none focus:border-green-500 transition-colors"
                                                            value={bankForm.bankName}
                                                            onChange={e => setBankForm({ ...bankForm, bankName: e.target.value })}
                                                            placeholder="e.g. Chase, Wells Fargo"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Account Number (IBAN/Local)</label>
                                                    <input
                                                        required
                                                        type="text"
                                                        className="w-full p-3 bg-white border border-gray-200 rounded-lg outline-none focus:border-green-500 transition-colors font-mono"
                                                        value={bankForm.accountNumber}
                                                        onChange={e => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                                                    />
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Routing Number (Optional)</label>
                                                        <input
                                                            type="text"
                                                            className="w-full p-3 bg-white border border-gray-200 rounded-lg outline-none focus:border-green-500 transition-colors font-mono"
                                                            value={bankForm.routingNumber}
                                                            onChange={e => setBankForm({ ...bankForm, routingNumber: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">SWIFT / BIC (Optional)</label>
                                                        <input
                                                            type="text"
                                                            className="w-full p-3 bg-white border border-gray-200 rounded-lg outline-none focus:border-green-500 transition-colors font-mono"
                                                            value={bankForm.swift}
                                                            onChange={e => setBankForm({ ...bankForm, swift: e.target.value })}
                                                        />
                                                    </div>
                                                </div>

                                                {addBankError && (
                                                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                                                        <AlertCircle className="w-4 h-4" />
                                                        {addBankError}
                                                    </div>
                                                )}

                                                <div className="flex justify-end pt-4">
                                                    <button
                                                        type="submit"
                                                        disabled={addingBank}
                                                        className="px-6 py-2 bg-[#13ec5b] hover:bg-[#10c94d] text-[#0d1b12] font-bold rounded-xl transition-all shadow-lg shadow-green-200"
                                                    >
                                                        {addingBank ? 'Saving...' : 'Save Bank Account'}
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {loadingBanks ? (
                                                <p className="text-gray-500 text-center py-4">Loading accounts...</p>
                                            ) : banks && banks.length > 0 ? (
                                                banks.map((bank: any) => (
                                                    <div key={bank.id} className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 flex justify-between items-center group hover:bg-white hover:shadow-sm transition-all">
                                                        <div>
                                                            <p className="font-bold text-gray-900">{bank.accountHolderName}</p>
                                                            <p className="text-sm text-gray-500 font-mono">**** {bank.accountNumber.slice(-4)}</p>
                                                            <p className="text-xs text-gray-400 mt-1">{bank.bankName || 'Bank Account'}</p>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            {bank.isVerified ? (
                                                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">Verified</span>
                                                            ) : (
                                                                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded">Pending</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-8 text-gray-400 italic">
                                                    No bank accounts added yet.
                                                </div>
                                            )}
                                        </div>
                                    )}

                                </div>
                            </div>
                        )}

                        {/* SECURITY TAB (Placeholder) */}
                        {activeTab === 'security' && (
                            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                                <h2 className="text-xl font-bold mb-4">Security Settings</h2>
                                <p className="text-gray-500">Password change and 2FA settings coming soon.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
