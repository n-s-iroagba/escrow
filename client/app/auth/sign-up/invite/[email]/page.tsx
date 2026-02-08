'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePost } from '@/hooks/useApiQuery';
import API_ROUTES from '@/constants/api-routes';
import { ShieldCheck, Eye, EyeOff, Mail, User, AlertCircle, ArrowRight, Lock } from 'lucide-react';
import { setAccessToken } from '@/lib/axios';
import { useAuthContext } from '@/hooks/useAuthContext';
import { APP_NAME } from '@/constants/data';

export default function InviteSignUpPage() {
    const params = useParams();
    const router = useRouter();
    const { setUser } = useAuthContext(false);

    // Safety check for params
    const emailParam = params?.email;
    const email = emailParam ? decodeURIComponent(Array.isArray(emailParam) ? emailParam[0] : emailParam) : '';

    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);

    const { post: register, isPending, error } = usePost(API_ROUTES.AUTH.REGISTER, {
        onSuccess: (data: any) => {
            // Check for accessToken to confirm successful auto-login for invited user
            if (data?.accessToken) {
                setAccessToken(data?.accessToken);
                setUser(data?.user);
                router.push('/trader/dashboard');
            } else {
                // Fallback (e.g. if logic changes and verification needed)
                router.push('/auth/login');
            }
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        await register({
            email,
            username: formData.username,
            password: formData.password,
            role: 'CLIENT'
        });
    };

    return (
        <>
            <div className="absolute top-0 w-full flex justify-center p-6 z-10">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-[#13ec5b] rounded text-xs flex items-center justify-center font-bold text-[#0d1b12]">X</div>
                    <span className="font-bold text-lg text-white tracking-tight">{APP_NAME}</span>
                </div>
            </div>
            <div className="min-h-screen flex bg-[#f6f8f6] font-display items-center justify-center p-4">

                <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100">
                    <div className="bg-[#0d1b12] p-8 text-center relative overflow-hidden">

                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-[#13ec5b] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-900/50">
                                <ShieldCheck className="w-8 h-8 text-[#0d1b12]" />
                            </div>
                            <h1 className="text-2xl font-bold text-white mb-2">Complete Your Account</h1>
                            <p className="text-gray-400 text-sm">
                                You&apos;ve been invited to specific transactions. Set up your credentials to access them securely.
                            </p>
                        </div>
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                    </div>


                    <div className="p-8">
                        {/* Email Display */}
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex gap-3 text-blue-900 items-start">
                            <Mail className="w-5 h-5 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-bold uppercase opacity-70 mb-1">Invited Email address</p>
                                <p className="font-medium break-all">{email}</p>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm flex items-center gap-2 font-bold">
                                <AlertCircle className="w-5 h-5" />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Choose Username</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        required
                                        value={formData.username}
                                        onChange={e => setFormData({ ...formData, username: e.target.value })}
                                        placeholder="johndoe123"
                                        minLength={3}
                                        className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-200 focus:border-[#13ec5b] focus:ring-4 focus:ring-green-500/10 outline-none transition-all font-medium"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-2">username must be at least 3 characters long and must not be an email.</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Create Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="••••••••"
                                        className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-[#13ec5b] focus:ring-4 focus:ring-green-500/10 outline-none transition-all pr-12 text-lg tracking-widest"
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Confirm Password</label>
                                <input
                                    type="password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    placeholder="••••••••"
                                    className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-[#13ec5b] focus:ring-4 focus:ring-green-500/10 outline-none transition-all text-lg tracking-widest"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full py-4 bg-[#0d1b12] hover:bg-black text-white font-bold rounded-xl shadow-lg transition-all text-sm uppercase tracking-widest mt-4 flex items-center justify-center gap-2"
                            >
                                {isPending ? 'Setting up...' : 'Complete Setup'}
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </form>

                        <div className="mt-8 flex justify-center">
                            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-50 rounded-full text-green-700 text-[10px] font-bold uppercase tracking-widest border border-green-100">
                                <Lock className="w-3 h-3" />
                                End-to-End Encrypted
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
