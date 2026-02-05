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
            <div className="min-h-screen flex bg-white font-display">
                {/* Left Side */}
                <div className="hidden lg:flex w-1/2 bg-[#0d1b12] flex-col p-12 relative overflow-hidden justify-between text-white">
                    <div>
                        <div className="flex items-center gap-3 mb-12">
                            <div className="w-8 h-8 bg-[#13ec5b] rounded-lg flex items-center justify-center">
                                <span className="text-[#0d1b12] font-bold text-xs">GW</span>
                            </div>
                            <span className="font-bold text-xl">GreenWealth</span>
                        </div>
                    </div>
                    <div className="relative z-10 max-w-lg">
                        <h1 className="text-5xl font-bold mb-6 leading-tight">Check your inbox</h1>
                        <p className="text-gray-400 text-lg mb-12">We've sent you instructions to reset your password.</p>
                    </div>
                    <div className="absolute right-0 bottom-0 w-[500px] h-[500px] bg-[#13ec5b] rounded-full blur-[120px] opacity-10 translate-x-1/2 translate-y-1/2"></div>
                </div>

                {/* Right Side */}
                <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 lg:p-24">
                    <div className="max-w-md w-full mx-auto text-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 animate-in zoom-in duration-300">
                            <Mail className="w-10 h-10 text-green-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Email Sent!</h2>
                        <p className="text-gray-500 mb-8 text-lg">We have sent a password reset link to <br /><span className="font-bold text-gray-900">{email}</span></p>

                        <div className="space-y-4">
                            <Link href="/auth/login" className="w-full py-4 bg-[#0d1b12] hover:bg-black text-white font-bold rounded-xl shadow-lg transition-all text-lg flex items-center justify-center gap-2">
                                Back to Login
                            </Link>
                            <button onClick={() => window.location.reload()} className="text-sm font-bold text-[#13ec5b] hover:underline">
                                Didn't receive the email? Click to resend
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex bg-white font-display">
            {/* Left Side */}
            <div className="hidden lg:flex w-1/2 bg-[#0d1b12] flex-col p-12 relative overflow-hidden justify-between text-white">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-[#13ec5b] rounded text-xs flex items-center justify-center font-bold text-[#0d1b12]">X</div>
                        <span className="font-bold text-lg tracking-tight">{APP_NAME}</span>
                    </div>
                </div>
                <div className="relative z-10 max-w-lg">
                    <h1 className="text-5xl font-bold mb-6 leading-tight">Forgot your password?</h1>
                    <p className="text-gray-400 text-lg mb-12">No worries, it happens to the best of us.</p>
                </div>
                <div className="absolute right-0 bottom-0 w-[500px] h-[500px] bg-[#13ec5b] rounded-full blur-[120px] opacity-10 translate-x-1/2 translate-y-1/2"></div>
            </div>

            {/* Right Side */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 lg:p-24">
                <div className="max-w-md w-full mx-auto">
                    <Link data-testid="back-to-login-link" href="/auth/login" className="inline-flex items-center gap-2 text-gray-400 font-bold hover:text-gray-900 mb-8 transition-colors text-sm">
                        <ArrowLeft className="w-4 h-4" /> Back to login
                    </Link>

                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h2>
                    <p className="text-gray-500 mb-8">Enter your email and we'll send you reset instructions.</p>

                    {error && <div data-testid="error-message" className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm flex items-center gap-2"><div className="w-2 h-2 bg-red-500 rounded-full"></div>{error}</div>}

                    <form data-testid="forgot-password-form" onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Email Address</label>
                            <input
                                data-testid="email-input"
                                type="email"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="name@company.com"
                                className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-[#13ec5b] focus:ring-4 focus:ring-green-500/10 outline-none transition-all"
                            />
                        </div>

                        <button
                            data-testid="reset-password-button"
                            type="submit"
                            disabled={isPending}
                            className="w-full py-4 bg-[#13ec5b] hover:bg-[#10c94d] text-white font-bold rounded-xl shadow-lg shadow-green-500/30 transition-all text-lg mb-4"
                        >
                            {isPending ? 'Sending Link...' : 'Send Reset Link'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
