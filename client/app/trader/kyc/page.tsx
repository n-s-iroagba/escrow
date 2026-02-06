'use client';

import { useState, useRef } from 'react';
import { useGet, usePost } from '@/hooks/useApiQuery';
import API_ROUTES from '@/constants/api-routes';
import { useRequiredAuth } from '@/hooks/useAuthContext';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Upload, FileText, CheckCircle, Clock, XCircle, AlertTriangle, Loader2, Image as ImageIcon, User, CreditCard } from 'lucide-react';
import { uploadFile } from '@/utils';

export default function KYCPage() {
    const { user } = useRequiredAuth(true);
    const router = useRouter();
    const [formData, setFormData] = useState({
        fullName: '',
        documentNumber: '',
        documentType: 'PASSPORT',
        documentFrontUrl: '',
        documentBackUrl: '',
        selfieUrl: ''
    });

    const [uploading, setUploading] = useState({
        front: false,
        back: false
    });

    const frontInputRef = useRef<HTMLInputElement>(null);
    const backInputRef = useRef<HTMLInputElement>(null);

    const { data: kycData, loading, refetch } = useGet(
        API_ROUTES.KYC.STATUS(user?.id),
        { enabled: !!user?.id }
    );

    const { post: submitKYC, isPending: isSubmitting } = usePost(
        API_ROUTES.KYC.SUBMIT,
        {
            onSuccess: () => {
                refetch();
            }
        }
    );

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'front' | 'back') => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(prev => ({ ...prev, [type]: true }));
            const url = await uploadFile(file, 'image');

            if (type === 'front') {
                setFormData(prev => ({ ...prev, documentFrontUrl: url }));
            } else {
                setFormData(prev => ({ ...prev, documentBackUrl: url }));
            }
        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to upload image. Please try again.");
        } finally {
            setUploading(prev => ({ ...prev, [type]: false }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.documentFrontUrl || !formData.documentBackUrl) {
            alert("Please upload both document images.");
            return;
        }

        await submitKYC({
            userId: user?.id,
            ...formData
        });
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#f6f8f6]">
            <div className="animate-pulse flex flex-col items-center gap-3">
                <ShieldCheck className="w-10 h-10 text-gray-300" />
                <p className="text-gray-400 font-medium">Checking verification status...</p>
            </div>
        </div>
    );

    const status = kycData?.status || 'NOT_STARTED';

    // === APPROVED STATE ===
    if (status === 'APPROVED' || status === 'VERIFIED') {
        return (
            <div className="min-h-screen bg-[#f6f8f6] p-8 flex items-center justify-center font-display text-[#0d1b12]">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow p-8 border border-gray-100 text-center">
                    <div className="flex justify-center mb-6">
                        <div className="bg-green-100 p-4 rounded-full shadow-inner">
                            <CheckCircle className="w-12 h-12 text-green-600" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Identity Verified</h1>
                    <p className="text-gray-500 mb-8 leading-relaxed">
                        Excellent! Your account is fully verified. You now have access to all secure escrow features.
                    </p>

                    <button
                        data-testid="initiate-escrow-button"
                        onClick={() => router.push('/trader/escrow/initiate')}
                        className="w-full py-4 bg-[#13ec5b] hover:bg-[#10c94d] text-[#0d1b12] font-bold rounded-xl shadow-lg shadow-green-200 transition-all hover:scale-[1.02]"
                    >
                        Start Trading
                    </button>
                    <button
                        onClick={() => router.push('/trader/dashboard')}
                        className="mt-4 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // === PENDING STATE ===
    if (status === 'PENDING' || status === 'SUBMITTED') {
        return (
            <div className="min-h-screen bg-[#f6f8f6] p-8 flex items-center justify-center font-display text-[#0d1b12]">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-sm p-8 border border-gray-100 text-center">
                    <div className="flex justify-center mb-6">
                        <div className="bg-blue-100 p-4 rounded-full animate-pulse">
                            <Clock className="w-12 h-12 text-blue-600" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Verification Pending</h1>
                    <div className="w-16 h-1 bg-gray-100 mx-auto rounded-full mb-4"></div>
                    <p className="text-gray-500 mb-8 leading-relaxed">
                        We are currently reviewing your documents. This process usually takes less than 24 hours.
                    </p>

                    <div className="bg-gray-50 p-5 rounded-2xl text-left mb-8 border border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-2">Submitted Document</p>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg border border-gray-200 text-gray-400">
                                <FileText className="w-5 h-5" />
                            </div>
                            <p className="font-bold text-gray-900">{kycData?.documentType?.replace(/_/g, ' ')}</p>
                            <span className="ml-auto text-xs font-mono bg-white px-2 py-1 rounded border border-gray-200 text-gray-500">
                                ...{kycData?.documentNumber?.slice(-4)}
                            </span>
                        </div>
                    </div>

                    <button
                        data-testid="dashboard-button"
                        onClick={() => router.push('/trader/dashboard')}
                        className="w-full py-4 border-2 border-gray-100 hover:border-gray-200 hover:bg-gray-50 text-gray-600 font-bold rounded-xl transition-all"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // === FORM STATE (NOT_STARTED / REJECTED) ===
    return (
        <div className="min-h-screen bg-[#f6f8f6] p-4 lg:p-8 font-display flex items-center justify-center text-[#0d1b12]">
            <div className="max-w-2xl w-full">

                {/* Header Section */}
                <div className="text-center mb-8 space-y-2">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white shadow-sm border border-gray-100 mb-4 text-[#13ec5b]">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Identity Verification</h1>
                    <p className="text-gray-500 max-w-sm mx-auto">To ensure the safety of all traders, we require a valid government-issued ID.</p>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                    {status === 'REJECTED' && (
                        <div className="mb-8 p-4 bg-red-50 rounded-xl flex items-start gap-4 text-red-700 border border-red-100">
                            <XCircle className="w-6 h-6 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-sm">Verification Failed</h4>
                                <p className="text-sm mt-1 opacity-90">Your previous submission was rejected. Please ensure your documents are clear and legible.</p>
                            </div>
                        </div>
                    )}

                    <form data-testid="kyc-form" onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 pl-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        data-testid="full-name-input"
                                        type="text"
                                        required
                                        placeholder="Enter your legal name"
                                        value={formData.fullName}
                                        onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-200 rounded-xl outline-none focus:border-[#13ec5b] focus:bg-white focus:shadow-sm transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 pl-1">Document Type</label>
                                    <div className="relative">
                                        <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <select
                                            data-testid="document-type-select"
                                            value={formData.documentType}
                                            onChange={e => setFormData({ ...formData, documentType: e.target.value })}
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-200 rounded-xl outline-none focus:border-[#13ec5b] focus:bg-white focus:shadow-sm transition-all appearance-none font-medium text-gray-700"
                                        >
                                            <option value="PASSPORT">Passport</option>
                                            <option value="DRIVERS_LICENSE">Driver's License</option>
                                            <option value="NATIONAL_ID">National ID</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 pl-1">Document Number</label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            data-testid="document-number-input"
                                            type="text"
                                            required
                                            placeholder="ID Number"
                                            value={formData.documentNumber}
                                            onChange={e => setFormData({ ...formData, documentNumber: e.target.value })}
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-200 rounded-xl outline-none focus:border-[#13ec5b] focus:bg-white focus:shadow-sm transition-all font-medium"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-gray-100">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <Upload className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Upload Documents</h3>
                                    <p className="text-xs text-gray-400">Supported formats: JPG, PNG, PDF</p>
                                </div>
                            </div>

                            <input type="file" ref={frontInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'front')} />
                            <input type="file" ref={backInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'back')} />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Front Side */}
                                <div
                                    data-testid="document-front-upload"
                                    onClick={() => frontInputRef.current?.click()}
                                    className={`group relative h-48 bg-gray-50 border-2 border-dashed ${formData.documentFrontUrl ? 'border-[#13ec5b] bg-green-50/30' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-100'} rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all`}
                                >
                                    {uploading.front ? (
                                        <div className="flex flex-col items-center">
                                            <Loader2 className="w-8 h-8 text-[#13ec5b] animate-spin mb-3" />
                                            <span className="text-xs font-bold text-gray-400">Uploading...</span>
                                        </div>
                                    ) : formData.documentFrontUrl ? (
                                        <div className="flex flex-col items-center">
                                            <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 text-[#13ec5b]">
                                                <CheckCircle className="w-6 h-6" />
                                            </div>
                                            <span className="text-sm font-bold text-gray-900">Front Uploaded</span>
                                            <span className="text-xs text-gray-400 mt-1 group-hover:text-[#13ec5b]">Click to replace</span>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 text-gray-400 group-hover:scale-110 transition-transform">
                                                <FileText className="w-6 h-6" />
                                            </div>
                                            <span className="text-sm font-bold text-gray-700">Front Side</span>
                                            <span className="text-xs text-gray-400 mt-1">Tap to upload</span>
                                        </>
                                    )}
                                </div>

                                {/* Back Side */}
                                <div
                                    data-testid="document-back-upload"
                                    onClick={() => backInputRef.current?.click()}
                                    className={`group relative h-48 bg-gray-50 border-2 border-dashed ${formData.documentBackUrl ? 'border-[#13ec5b] bg-green-50/30' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-100'} rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all`}
                                >
                                    {uploading.back ? (
                                        <div className="flex flex-col items-center">
                                            <Loader2 className="w-8 h-8 text-[#13ec5b] animate-spin mb-3" />
                                            <span className="text-xs font-bold text-gray-400">Uploading...</span>
                                        </div>
                                    ) : formData.documentBackUrl ? (
                                        <div className="flex flex-col items-center">
                                            <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 text-[#13ec5b]">
                                                <CheckCircle className="w-6 h-6" />
                                            </div>
                                            <span className="text-sm font-bold text-gray-900">Back Uploaded</span>
                                            <span className="text-xs text-gray-400 mt-1 group-hover:text-[#13ec5b]">Click to replace</span>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 text-gray-400 group-hover:scale-110 transition-transform">
                                                <FileText className="w-6 h-6" />
                                            </div>
                                            <span className="text-sm font-bold text-gray-700">Back Side</span>
                                            <span className="text-xs text-gray-400 mt-1">Tap to upload</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button
                            data-testid="submit-kyc-button"
                            type="submit"
                            disabled={isSubmitting || uploading.front || uploading.back}
                            className={`w-full py-4 text-lg font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5
                                 ${(isSubmitting || uploading.front || uploading.back)
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none transform-none'
                                    : 'bg-[#13ec5b] hover:bg-[#10c94d] text-[#0d1b12] shadow-green-200'}`}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Verification'}
                            {!isSubmitting && <ShieldCheck className="w-5 h-5" />}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
