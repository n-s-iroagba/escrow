'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePost } from '@/hooks/useApiQuery';
import API_ROUTES from '@/constants/api-routes';
import { useAuthContext } from '@/hooks/useAuthContext';
import { Eye, EyeOff, Lock, ArrowRight } from 'lucide-react';
import { setAccessToken } from '@/lib/axios';
import { APP_NAME } from '@/constants/data';

export default function LoginPage() {
    const router = useRouter();
    const { setUser } = useAuthContext(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);

    const { post: login, isPending, error } = usePost(API_ROUTES.AUTH.LOGIN, {
        onSuccess: (data) => {
            // 1. Set Token
            setAccessToken(data.accessToken);
            // 2. Set Context
            setUser(data.user);
            // 3. Redirect based on role
            if (data.user.role === 'ADMIN') {
                router.push('/admin/dashboard');
            } else {
                router.push('/trader/dashboard');
            }
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await login(formData);
    };

    return (
        <div className="min-h-screen flex bg-white font-display">
            {/* Left Side (Hidden on mobile) */}
            <div className="hidden lg:flex w-1/2 bg-[#0d1b12] flex-col p-12 relative overflow-hidden justify-between text-white">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-[#13ec5b] rounded text-xs flex items-center justify-center font-bold text-[#0d1b12]">X</div>
                        <span className="font-bold text-lg tracking-tight">{APP_NAME}</span>
                    </div>
                </div>

                <div className="relative z-10 max-w-lg">
                    <h1 className="text-5xl font-bold mb-6 leading-tight">
                        Welcome back to secure trading
                    </h1>
                    <p className="text-gray-400 text-lg mb-12">
                        Your gateway to safe, efficient, and transparent escrow services.
                    </p>
                </div>
                {/* Abstract graphic */}
                <div className="absolute right-0 bottom-0 w-[500px] h-[500px] bg-[#13ec5b] rounded-full blur-[120px] opacity-10 translate-x-1/2 translate-y-1/2"></div>
            </div>

            {/* Right Side */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 lg:p-24">
                <div className="max-w-md w-full mx-auto">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Log in to your account</h2>
                    <p className="text-gray-500 mb-8">Welcome back! Please enter your details.</p>

                    {error && <div data-testid="error-message" className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm">{error}</div>}

                    <form data-testid="login-form" onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Email Address</label>
                            <input
                                data-testid="email-input"
                                type="email"
                                required
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                placeholder="name@company.com"
                                className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-[#13ec5b] focus:ring-4 focus:ring-green-500/10 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Password</label>
                            <div className="relative">
                                <input
                                    data-testid="password-input"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="••••••••"
                                    className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-[#13ec5b] focus:ring-4 focus:ring-green-500/10 outline-none transition-all pr-12 text-lg tracking-widest"
                                />
                                <button data-testid="toggle-password-button" type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Link data-testid="forgot-password-link" href="/auth/forgot-password" className="text-sm font-bold text-[#13ec5b] hover:text-[#10c94d] hover:underline">Forgot Password?</Link>
                        </div>

                        <button
                            data-testid="login-button"
                            type="submit"
                            disabled={isPending}
                            className="w-full py-4 bg-[#0d1b12] hover:bg-black text-white font-bold rounded-xl shadow-lg transition-all text-lg flex items-center justify-center gap-2"
                        >
                            {isPending ? 'Logging in...' : 'Log In'}
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </form>

                    <p className="text-center mt-8 text-gray-500">
                        Don't have an account? <Link data-testid="signup-link" href="/auth/sign-up" className="text-[#13ec5b] font-bold hover:underline">Sign up</Link>
                    </p>

                    <div className="mt-8 flex justify-center">
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-50 rounded-full text-gray-600 text-[10px] font-bold uppercase tracking-widest border border-gray-100">
                            <Lock className="w-3 h-3" />
                            Secure Session
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
