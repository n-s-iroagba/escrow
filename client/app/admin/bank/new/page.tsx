'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import API_ROUTES from '@/constants/api-routes';
import { usePost } from '@/hooks/useApiQuery';
import { uploadFile } from '@/utils';
import { ArrowLeft, Upload, X, Landmark, Building2 } from 'lucide-react';
import Link from 'next/link';

export default function NewBankPage() {
    const router = useRouter();
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        accountNumber: '',
        currency: 'USD',
        recipientName: '',
        bankAddress: '',
        iban: '',
        swift: '',
        routingNumber: '',
        logoUrl: '',
    });

    const { post, isPending, error } = usePost(API_ROUTES.BANKS.CREATE, {
        onSuccess: () => router.push('/admin/bank'),
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        try {
            setUploading(true);
            const url = await uploadFile(file, 'image');
            setLogoPreview(url);
            setFormData((prev) => ({ ...prev, logoUrl: url }));
        } catch (err) {
            console.error('Upload failed', err);
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveLogo = () => {
        setLogoPreview(null);
        setFormData((prev) => ({ ...prev, logoUrl: '' }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await post(formData);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6 lg:p-10">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-center gap-4">
                    <Link
                        href="/admin/bank"
                        className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Add New Bank</h1>
                        <p className="text-slate-500 text-sm">Configure a new fiat bank account for escrow settlements.</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-200/60 overflow-hidden">
                    {/* Header Banner */}
                    <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-6 flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <Landmark className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h2 className="text-white font-bold text-lg">Bank Account Setup</h2>
                            <p className="text-white/80 text-sm">Enter the banking details below</p>
                        </div>
                    </div>

                    <form data-testid="new-bank-form" onSubmit={handleSubmit} className="p-8 space-y-8">
                        {/* Logo Upload */}
                        <div className="flex items-center gap-6">
                            {logoPreview ? (
                                <div className="relative w-20 h-20 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 group">
                                    <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-2" />
                                    <button
                                        type="button"
                                        onClick={handleRemoveLogo}
                                        className="absolute top-1 right-1 p-1 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                                    >
                                        <X className="w-4 h-4 text-red-500" />
                                    </button>
                                </div>
                            ) : (
                                <label data-testid="logo-upload-area" className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-200 hover:border-emerald-400 bg-slate-50 flex flex-col items-center justify-center cursor-pointer transition-colors">
                                    <input type="file" accept="image/*" onChange={handleLogoUpload} disabled={uploading} className="hidden" />
                                    <Upload className="w-5 h-5 text-slate-400 mb-1" />
                                    <span className="text-[10px] text-slate-400 font-semibold">{uploading ? '...' : 'Logo'}</span>
                                </label>
                            )}
                            <div>
                                <p className="font-medium text-slate-900 text-sm">Bank Logo</p>
                                <p className="text-xs text-slate-400">PNG or SVG, max 2MB</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Bank Name *</label>
                                <input
                                    data-testid="bank-name-input"
                                    type="text" name="name" value={formData.name} onChange={handleInputChange} required
                                    className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white transition-all outline-none"
                                    placeholder="e.g. Chase Bank"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Account Number *</label>
                                <input
                                    data-testid="account-number-input"
                                    type="text" name="accountNumber" value={formData.accountNumber} onChange={handleInputChange} required
                                    className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white transition-all outline-none font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Currency *</label>
                                <select
                                    data-testid="currency-select"
                                    name="currency" value={formData.currency} onChange={handleInputChange}
                                    className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white transition-all outline-none appearance-none"
                                >
                                    <option value="USD">USD - US Dollar</option>
                                    <option value="EUR">EUR - Euro</option>
                                    <option value="GBP">GBP - British Pound</option>
                                    <option value="NGN">NGN - Nigerian Naira</option>
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Recipient Name</label>
                                <input
                                    type="text" name="recipientName" value={formData.recipientName} onChange={handleInputChange}
                                    className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white transition-all outline-none"
                                    placeholder="Account Holder Name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Routing Number</label>
                                <input
                                    type="text" name="routingNumber" value={formData.routingNumber} onChange={handleInputChange}
                                    className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white transition-all outline-none font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">SWIFT / BIC</label>
                                <input
                                    type="text" name="swift" value={formData.swift} onChange={handleInputChange}
                                    className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white transition-all outline-none font-mono uppercase"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">IBAN</label>
                                <input
                                    type="text" name="iban" value={formData.iban} onChange={handleInputChange}
                                    className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white transition-all outline-none font-mono uppercase"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Bank Address</label>
                                <input
                                    type="text" name="bankAddress" value={formData.bankAddress} onChange={handleInputChange}
                                    className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white transition-all outline-none"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm border border-red-100">
                                {error}
                            </div>
                        )}

                        <div className="pt-4 flex items-center justify-end gap-4 border-t border-slate-100">
                            <Link href="/admin/bank" className="px-6 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
                                Cancel
                            </Link>
                            <button
                                data-testid="submit-bank-button"
                                type="submit"
                                disabled={isPending || uploading}
                                className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-sm font-bold shadow-lg shadow-emerald-500/25 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isPending ? 'Creating...' : 'Create Bank'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
