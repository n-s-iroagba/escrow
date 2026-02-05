'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePost } from '@/hooks/useApiQuery';
import API_ROUTES from '@/constants/api-routes';
import { ShieldCheck, Eye, EyeOff, Lock, AlertTriangle } from 'lucide-react';

export default function AdminSignUpPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'ADMIN' // Optional additional security field if backend required it
    });
    const [showPassword, setShowPassword] = useState(false);

    const { post: register, isPending, error, data } = usePost(API_ROUTES.AUTH.REGISTER, {
        onSuccess: (data: any) => {
            // Navigate to email verification page with token
            if (data?.verificationToken) {
                router.push(`/auth/verify-email/${data.verificationToken}?email=${encodeURIComponent(formData.email)}`);
            }
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        // Send role='ADMIN'
        await register({
            username: formData.username,
            email: formData.email,
            password: formData.password,
            role: formData.role
        });
    };

    return (
        <div className="min-h-screen flex bg-gray-50 font-display items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-xl max-w-md w-full overflow-hidden border border-gray-100">
                <div className="bg-[#0d1b12] p-8 text-center relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-[#13ec5b] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-900/50">
                            <ShieldCheck className="w-8 h-8 text-[#0d1b12]" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Admin Access</h1>
                        <p className="text-gray-400 text-sm">Create an administrative account for system management.</p>
                    </div>
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                </div>

                <div className="p-8">
                    {/* Warning Banner */}
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6 flex gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                        <p className="text-xs text-amber-800 leading-relaxed font-medium">
                            Authorized personnel only. All actions are logged and audited. Unauthorized access is prohibited.
                        </p>
                    </div>

                    {error && <div data-testid="error-message" className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm flex items-center gap-2 font-bold">{error}</div>}

                    <form data-testid="admin-signup-form" onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Work Email</label>
                            <input
                                data-testid="email-input"
                                type="email"
                                required
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                placeholder="admin@organization.com"
                                className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-[#13ec5b] focus:ring-4 focus:ring-green-500/10 outline-none transition-all font-medium"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Username</label>
                            <input
                                data-testid="username-input"
                                type="text"
                                required
                                value={formData.username}
                                onChange={e => setFormData({ ...formData, username: e.target.value })}
                                placeholder="admin_username"
                                minLength={3}
                                maxLength={30}
                                pattern="[a-zA-Z0-9_-]+"
                                title="Username must be 3-30 characters and contain only letters, numbers, underscores, or hyphens"
                                className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-[#13ec5b] focus:ring-4 focus:ring-green-500/10 outline-none transition-all font-medium"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Password</label>
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
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Confirm Password</label>
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

                        <button
                            data-testid="admin-signup-button"
                            type="submit"
                            disabled={isPending}
                            className="w-full py-4 bg-[#0d1b12] hover:bg-black text-white font-bold rounded-xl shadow-lg transition-all text-sm uppercase tracking-widest mt-4 flex items-center justify-center gap-2"
                        >
                            {isPending ? 'Provisioning...' : 'Create Admin Account'}
                        </button>
                    </form>

                    <p className="text-center mt-8 text-gray-500 text-xs">
                        <Link data-testid="login-link" href="/auth/login" className="text-gray-900 font-bold hover:underline">Return to Login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
