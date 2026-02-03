'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePost } from '@/hooks/useApiQuery';
import API_ROUTES from '@/constants/api-routes';
import { Eye, EyeOff } from 'lucide-react';

export default function ResetPasswordPage() {
    const params = useParams();
    const router = useRouter();
    const token = params.token as string;

    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);

    const { post: reset, isPending, error } = usePost(API_ROUTES.AUTH.RESET_PASSWORD, {
        onSuccess: () => {
            alert("Password reset successfully!");
            router.push('/auth/login');
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
        <div className="min-h-screen flex items-center justify-center bg-[#f8fbfa] font-display p-4">
            <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Set new password</h1>
                    <p className="text-gray-500">Your new password must be different to previously used passwords.</p>
                </div>

                {error && <div data-testid="error-message" className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm">{error}</div>}

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
                                className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-[#13ec5b] outline-none transition-colors pr-12"
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">Confirm Password</label>
                        <input
                            data-testid="confirm-password-input"
                            type="password"
                            required
                            value={formData.confirmPassword}
                            onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                            placeholder="••••••••"
                            className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-[#13ec5b] outline-none transition-colors"
                        />
                    </div>

                    <button
                        data-testid="reset-password-button"
                        type="submit"
                        disabled={isPending}
                        className="w-full py-4 bg-[#13ec5b] hover:bg-[#10c94d] text-[#0d1b12] font-bold rounded-xl shadow-lg shadow-green-200 transition-all"
                    >
                        {isPending ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}
