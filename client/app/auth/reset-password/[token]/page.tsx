'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePost } from '@/hooks/useApiQuery';
import API_ROUTES from '@/constants/api-routes';
import { useAuthContext } from '@/hooks/useAuthContext';
import { setAccessToken } from '@/lib/axios';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';
import { APP_NAME } from '@/constants/data';

export default function ResetPasswordPage() {
    const params = useParams();
    const router = useRouter();
    const { setUser } = useAuthContext();
    // Safely handle params.token - useParams() returns string | string[]
    const token = Array.isArray(params?.token) ? params.token[0] : params?.token as string;

    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showToast, setShowToast] = useState(false);

    const { post: reset, isPending, error } = usePost(API_ROUTES.AUTH.RESET_PASSWORD, {
        onSuccess: (data: any) => {
            // Show toast
            setShowToast(true);

            // Auto-login logic
            if (data?.accessToken && data?.user) {
                setAccessToken(data.accessToken);
                setUser(data.user);

                // Delay redirect to let user see the toast
                setTimeout(() => {
                    if (data.user.role === 'ADMIN') {
                        router.push('/admin/dashboard');
                    } else {
                        router.push('/trader/dashboard');
                    }
                }, 2000);
            } else {
                // Fallback if no token returned (legacy behavior handling)
                setTimeout(() => {
                    router.push('/auth/login');
                }, 2000);
            }
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            alert("Passwords do not match");
            return;
        }
        await reset({ token, newPassword: formData.newPassword });
    };

    return (
        <div className="min-h-screen flex bg-white font-display relative">
            {/* Toast Notification */}
            {showToast && (
                <div className="fixed top-8 left-1/2 transform -translate-x-1/2 bg-[#0d1b12] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="w-6 h-6 bg-[#13ec5b] rounded-full flex items-center justify-center text-[#0d1b12]">
                        <CheckCircle className="w-4 h-4" />
                    </div>
                    <span className="font-bold">Password reset successful!</span>
                </div>
            )}

            {/* Left Side */}
            <div className="hidden lg:flex w-1/2 bg-[#0d1b12] flex-col p-12 relative overflow-hidden justify-between text-white">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-[#13ec5b] rounded text-xs flex items-center justify-center font-bold text-[#0d1b12]">X</div>
                        <span className="font-bold text-lg tracking-tight">{APP_NAME}</span>
                    </div>
                </div>
                <div className="relative z-10 max-w-lg">
                    <h1 className="text-5xl font-bold mb-6 leading-tight">Secure your account</h1>
                    <p className="text-gray-400 text-lg mb-12">Create a strong password to protect your assets and data.</p>
                </div>
                <div className="absolute right-0 bottom-0 w-[500px] h-[500px] bg-[#13ec5b] rounded-full blur-[120px] opacity-10 translate-x-1/2 translate-y-1/2"></div>
            </div>

            {/* Right Side */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 lg:p-24">
                <div className="max-w-md w-full mx-auto">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Set new password</h2>
                    <p className="text-gray-500 mb-8">Your new password must be different to previously used passwords.</p>

                    {error && <div data-testid="error-message" className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm flex items-center gap-2"><div className="w-2 h-2 bg-red-500 rounded-full"></div>{error}</div>}

                    <form data-testid="reset-password-form" onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">New Password</label>
                            <div className="relative">
                                <input
                                    data-testid="new-password-input"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={formData.newPassword}
                                    onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
                                    placeholder="••••••••"
                                    className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-[#13ec5b] focus:ring-4 focus:ring-green-500/10 outline-none transition-all pr-12 text-lg tracking-widest"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Confirm Password</label>
                            <div className="relative">
                                <input
                                    data-testid="confirm-password-input"
                                    type="password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    placeholder="••••••••"
                                    className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-[#13ec5b] focus:ring-4 focus:ring-green-500/10 outline-none transition-all text-lg tracking-widest"
                                />
                            </div>
                        </div>

                        <button
                            data-testid="reset-password-button"
                            type="submit"
                            disabled={isPending}
                            className="w-full py-4 bg-[#13ec5b] hover:bg-[#10c94d] text-white font-bold rounded-xl shadow-lg shadow-green-500/30 transition-all text-lg mb-4"
                        >
                            {isPending ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
