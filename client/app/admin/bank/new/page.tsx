'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import API_ROUTES from '@/constants/api-routes';
import { usePost } from '@/hooks/useApiQuery';
import { uploadFile } from '@/utils';
import { ArrowLeft, Upload, X } from 'lucide-react';
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
        onSuccess: () => {
            router.push('/admin/bank'); // Redirect to list
        },
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
            // Ideally show toast
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
        <div className="min-h-screen bg-[#f6f8f6] p-8 font-display text-[#0d1b12]">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-center gap-4">
                    <Link
                        href="/admin/bank"
                        className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-2xl font-bold">Add New Bank</h1>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Logo Upload */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700">Bank Logo</label>
                            <div className="flex items-center gap-6">
                                {logoPreview ? (
                                    <div className="relative w-24 h-24 rounded-xl border border-gray-100 overflow-hidden bg-gray-50 group">
                                        <img
                                            src={logoPreview}
                                            alt="Logo preview"
                                            className="w-full h-full object-contain p-2"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleRemoveLogo}
                                            className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-500"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="relative w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 hover:border-[#13ec5b] transition-colors bg-gray-50 flex flex-col items-center justify-center text-gray-400 group cursor-pointer">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoUpload}
                                            disabled={uploading}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                        />
                                        <Upload className="w-6 h-6 mb-1 group-hover:text-[#13ec5b] transition-colors" />
                                        <span className="text-[10px] uppercase font-semibold tracking-wider">
                                            {uploading ? '...' : 'Upload'}
                                        </span>
                                    </div>
                                )}
                                <div className="flex-1">
                                    <p className="text-sm text-gray-500">
                                        Upload a transparent PNG/SVG for best results. Max 2MB.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Bank Name */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium mb-1.5 text-gray-700">Bank Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#13ec5b] focus:ring-1 focus:ring-[#13ec5b] focus:bg-white transition-all outline-none"
                                    placeholder="e.g. Chase Bank"
                                />
                            </div>

                            {/* Account Number */}
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-gray-700">Account Number</label>
                                <input
                                    type="text"
                                    name="accountNumber"
                                    value={formData.accountNumber}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#13ec5b] focus:ring-1 focus:ring-[#13ec5b] focus:bg-white transition-all outline-none"
                                />
                            </div>

                            {/* Currency */}
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-gray-700">Currency</label>
                                <select
                                    name="currency"
                                    value={formData.currency}
                                    onChange={handleInputChange}
                                    className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#13ec5b] focus:ring-1 focus:ring-[#13ec5b] focus:bg-white transition-all outline-none appearance-none"
                                >
                                    <option value="USD">USD - United States Dollar</option>
                                    <option value="EUR">EUR - Euro</option>
                                    <option value="GBP">GBP - British Pound</option>
                                </select>
                            </div>

                            {/* Recipient Name */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium mb-1.5 text-gray-700">Recipient Name (Optional)</label>
                                <input
                                    type="text"
                                    name="recipientName"
                                    value={formData.recipientName}
                                    onChange={handleInputChange}
                                    className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#13ec5b] focus:ring-1 focus:ring-[#13ec5b] focus:bg-white transition-all outline-none"
                                    placeholder="Account Holder Name"
                                />
                            </div>

                            {/* Routing Number */}
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-gray-700">Routing Number (Optional)</label>
                                <input
                                    type="text"
                                    name="routingNumber"
                                    value={formData.routingNumber}
                                    onChange={handleInputChange}
                                    className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#13ec5b] focus:ring-1 focus:ring-[#13ec5b] focus:bg-white transition-all outline-none"
                                />
                            </div>

                            {/* SWIFT */}
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-gray-700">SWIFT / BIC (Optional)</label>
                                <input
                                    type="text"
                                    name="swift"
                                    value={formData.swift}
                                    onChange={handleInputChange}
                                    className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#13ec5b] focus:ring-1 focus:ring-[#13ec5b] focus:bg-white transition-all outline-none"
                                />
                            </div>

                            {/* IBAN */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium mb-1.5 text-gray-700">IBAN (Optional)</label>
                                <input
                                    type="text"
                                    name="iban"
                                    value={formData.iban}
                                    onChange={handleInputChange}
                                    className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#13ec5b] focus:ring-1 focus:ring-[#13ec5b] focus:bg-white transition-all outline-none"
                                />
                            </div>

                            {/* Bank Address */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium mb-1.5 text-gray-700">Bank Address (Optional)</label>
                                <input
                                    type="text"
                                    name="bankAddress"
                                    value={formData.bankAddress}
                                    onChange={handleInputChange}
                                    className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#13ec5b] focus:ring-1 focus:ring-[#13ec5b] focus:bg-white transition-all outline-none"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="pt-4 flex items-center justify-end gap-4">
                            <Link
                                href="/admin/bank"
                                className="px-6 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={isPending || uploading}
                                className="px-8 py-3 rounded-xl bg-[#13ec5b] text-[#0d1b12] text-sm font-bold shadow-[0_4px_14px_0_rgba(19,236,91,0.3)] hover:shadow-[0_6px_20px_rgba(19,236,91,0.23)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
