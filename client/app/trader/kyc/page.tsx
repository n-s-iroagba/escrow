'use client';

import { useState, useRef } from 'react';
import { useGet, usePost } from '@/hooks/useApiQuery';
import API_ROUTES from '@/constants/api-routes';
import { useAuthContext } from '@/hooks/useAuthContext';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Upload, FileText, CheckCircle, Clock, XCircle, AlertTriangle, Loader2, Image as ImageIcon } from 'lucide-react';
import { uploadFile } from '@/utils';

export default function KYCPage() {
    const { user } = useAuthContext();
    const router = useRouter();
    const [formData, setFormData] = useState({
        fullName: '',
        documentNumber: '',
        documentType: 'PASSPORT',
        documentFrontUrl: '',
        documentBackUrl: '',
        selfieUrl: '' // Potentially unused in UI but good to have in state
    });

    const [uploading, setUploading] = useState({
        front: false,
        back: false
    });

    // Refs for hidden file inputs
    const frontInputRef = useRef<HTMLInputElement>(null);
    const backInputRef = useRef<HTMLInputElement>(null);

    // Status Fetch
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

    if (loading) return <div className="p-12 text-center text-gray-500">Loading verification status...</div>;

    const status = kycData?.status || 'NOT_STARTED';

    // Renders based on state

    if (status === 'APPROVED' || status === 'VERIFIED') { // Check constant match
        return (
            <div className="min-h-screen bg-[#f6f8f6] p-8 flex items-center justify-center font-display">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-100 text-center">
                    <div className="flex justify-center mb-6">
                        <div className="bg-green-100 p-4 rounded-full">
                            <CheckCircle className="w-12 h-12 text-green-600" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Identity Verified</h1>
                    <p className="text-gray-500 mb-8">Your account is fully verified. You can now engage in escrow transactions.</p>

                    <button
                        onClick={() => router.push('/trader/escrow/initiate')}
                        className="w-full py-4 bg-[#13ec5b] hover:bg-[#10c94d] text-[#0d1b12] font-bold rounded-xl shadow-lg shadow-green-200 transition-all"
                    >
                        Initiate Escrow
                    </button>
                </div>
            </div>
        );
    }

    if (status === 'PENDING' || status === 'SUBMITTED') {
        return (
            <div className="min-h-screen bg-[#f6f8f6] p-8 flex items-center justify-center font-display">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-100 text-center">
                    <div className="flex justify-center mb-6">
                        <div className="bg-blue-100 p-4 rounded-full">
                            <Clock className="w-12 h-12 text-blue-600" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Pending</h1>
                    <p className="text-gray-500 mb-8">We are reviewing your documents. This usually takes 24 hours.</p>

                    <div className="bg-gray-50 p-4 rounded-xl text-left mb-6">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Submitted Document</p>
                        <p className="font-medium text-gray-900">{kycData?.documentType} - {kycData?.documentNumber}</p>
                    </div>

                    <button
                        onClick={() => router.push('/trader/dashboard')}
                        className="w-full py-4 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // Default: Not Started or Rejected (Form)
    return (
        <div className="min-h-screen bg-[#f6f8f6] p-8 font-display flex items-center justify-center">
            <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold mb-2">Identity Verification</h1>
                    <p className="text-gray-500">Please provide your details to unlock all features.</p>
                </div>

                {status === 'REJECTED' && (
                    <div className="mb-6 p-4 bg-red-50 rounded-xl flex items-center gap-3 text-red-700">
                        <XCircle className="w-5 h-5" />
                        <p>Your previous submission was rejected. Please try again.</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                            <input
                                type="text"
                                required
                                value={formData.fullName}
                                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#13ec5b]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Document Type</label>
                            <select
                                value={formData.documentType}
                                onChange={e => setFormData({ ...formData, documentType: e.target.value })}
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#13ec5b]"
                            >
                                <option value="PASSPORT">Passport</option>
                                <option value="DRIVERS_LICENSE">Driver's License</option>
                                <option value="NATIONAL_ID">National ID</option>
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Document Number</label>
                            <input
                                type="text"
                                required
                                value={formData.documentNumber}
                                onChange={e => setFormData({ ...formData, documentNumber: e.target.value })}
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#13ec5b]"
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Upload className="w-5 h-5 text-gray-400" />
                            Upload Documents
                        </h3>

                        {/* Hidden Inputs */}
                        <input
                            type="file"
                            ref={frontInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, 'front')}
                        />
                        <input
                            type="file"
                            ref={backInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, 'back')}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Front Side */}
                            <div
                                onClick={() => frontInputRef.current?.click()}
                                className={`bg-gray-50 border-2 border-dashed ${formData.documentFrontUrl ? 'border-[#13ec5b] bg-green-50' : 'border-gray-200'} rounded-xl p-8 text-center hover:bg-gray-100 transition-colors cursor-pointer relative overflow-hidden`}
                            >
                                {uploading.front ? (
                                    <div className="flex flex-col items-center justify-center">
                                        <Loader2 className="w-8 h-8 text-[#13ec5b] animate-spin mb-2" />
                                        <span className="text-xs text-gray-400">Uploading...</span>
                                    </div>
                                ) : formData.documentFrontUrl ? (
                                    <div className="flex flex-col items-center justify-center">
                                        <ImageIcon className="w-8 h-8 text-[#13ec5b] mb-2" />
                                        <span className="text-sm font-bold text-green-700 block">Uploaded</span>
                                        <span className="text-xs text-green-600">(Click to change)</span>
                                    </div>
                                ) : (
                                    <>
                                        <FileText className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                                        <span className="text-sm font-bold text-gray-600 block">Front Side</span>
                                        <span className="text-xs text-gray-400">(Click to upload)</span>
                                    </>
                                )}
                            </div>

                            {/* Back Side */}
                            <div
                                onClick={() => backInputRef.current?.click()}
                                className={`bg-gray-50 border-2 border-dashed ${formData.documentBackUrl ? 'border-[#13ec5b] bg-green-50' : 'border-gray-200'} rounded-xl p-8 text-center hover:bg-gray-100 transition-colors cursor-pointer relative overflow-hidden`}
                            >
                                {uploading.back ? (
                                    <div className="flex flex-col items-center justify-center">
                                        <Loader2 className="w-8 h-8 text-[#13ec5b] animate-spin mb-2" />
                                        <span className="text-xs text-gray-400">Uploading...</span>
                                    </div>
                                ) : formData.documentBackUrl ? (
                                    <div className="flex flex-col items-center justify-center">
                                        <ImageIcon className="w-8 h-8 text-[#13ec5b] mb-2" />
                                        <span className="text-sm font-bold text-green-700 block">Uploaded</span>
                                        <span className="text-xs text-green-600">(Click to change)</span>
                                    </div>
                                ) : (
                                    <>
                                        <FileText className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                                        <span className="text-sm font-bold text-gray-600 block">Back Side</span>
                                        <span className="text-xs text-gray-400">(Click to upload)</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || uploading.front || uploading.back}
                        className={`w-full py-4 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 
                             ${(isSubmitting || uploading.front || uploading.back)
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-[#13ec5b] hover:bg-[#10c94d] text-[#0d1b12] shadow-green-200'}`}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Verification'}
                        <ShieldCheck className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
}
