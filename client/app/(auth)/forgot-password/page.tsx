'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePost } from '@/hooks/useApiQuery';
import API_ROUTES from '@/constants/api-routes';
import { ArrowLeft, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const { post: sendReset, isPending, isSuccess, error } = usePost(API_ROUTES.AUTH.FORGOT_PASSWORD);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await sendReset({ email });
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-[#f6f8f6] flex items-center justify-center p-4 font-display">
                <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Mail className="w-8 h-8 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your inbox</h1>
                    <p className="text-gray-500 mb-8">We have sent a password reset link to <strong>{email}</strong>.</p>
                    <Link href="/auth/login" className="w-full py-3 bg-gray-100 text-gray-900 font-bold rounded-xl block hover:bg-gray-200">
                        Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fbfa] font-display p-4">
            <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot password?</h1>
                    <p className="text-gray-500">No worries, we'll send you reset instructions.</p>
                </div>

                {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-[#13ec5b] outline-none transition-colors"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full py-4 bg-[#13ec5b] hover:bg-[#10c94d] text-[#0d1b12] font-bold rounded-xl shadow-lg shadow-green-500/20 transition-all text-lg"
                    >
                        {isPending ? 'Sending Link...' : 'Reset Password'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <Link href="/auth/login" className="inline-flex items-center gap-2 text-gray-500 font-bold hover:text-gray-900">
                        <ArrowLeft className="w-4 h-4" /> Back to login
                    </Link>
                </div>
            </div>
        </div>
    );
}
