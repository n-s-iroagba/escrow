'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePost } from '@/hooks/useApiQuery';
import API_ROUTES from '@/constants/api-routes';
import { CheckCircle, Eye, EyeOff, Lock } from 'lucide-react';
import { use } from 'react';
import { decode } from 'punycode';

export default function InviteSignUpPage({ params }: { params: Promise<{ email: string }> }) {
    const router = useRouter();
    // In Next 15, params is a Promise so we need to use `use`
    const resolvedParams = use(params);
    const decodedEmail = decodeURIComponent(resolvedParams.email);

    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    const { post: register, isPending, error, data } = usePost<{ username: string, email: string, password: string }, { data: { token: string, emailVerified?: boolean } }>(API_ROUTES.AUTH.REGISTER, {
        onSuccess: (data: any) => {
            if (data?.emailVerified) {
                // Invited user is auto-verified, go to dashboard
                router.push('/dashboard');
            } else if (data?.verificationToken) {
                // Standard user, go to verify email
                router.push(`/auth/verify-email/${data.verificationToken}?email=${encodeURIComponent(decodedEmail)}`);
            }
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password?.length < 8) return;
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match");
            return;
        }
        if (!acceptedTerms) {
            alert("Please accept the Terms of Service");
            return;
        }

        await register({
            username: formData.username,
            email: decodedEmail, // Use the pre-filled email
            password: formData.password
        });
    };

    const hasMinLength = (formData.password || '').length >= 8;
    const hasSymbolOrNumber = /[0-9!@#$%^&*]/.test(formData.password || '');

    return (
        <div className="min-h-screen flex bg-white font-display">
            {/* Left Side - Hero Content */}
            <div className="hidden lg:flex w-1/2 bg-[#f8fbfa] flex-col p-12 relative overflow-hidden justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-12">
                        <div className="w-8 h-8 bg-[#13ec5b] rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xs">GW</span>
                        </div>
                        <span className="font-bold text-xl text-gray-900">GreenWealth</span>
                    </div>
                </div>

                <div className="relative z-10">
                    <div className="bg-gradient-to-b from-green-800 to-green-900 rounded-3xl p-8 mb-12 shadow-2xl h-[400px] flex items-end relative overflow-hidden group">
                        <div className="absolute inset-0 bg-opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                        {/* Visualization - Stacking Coins Effect */}
                        <div className="flex items-end gap-3 w-full justify-center opacity-90">
                            <div className="w-10 h-16 bg-gradient-to-t from-yellow-600 to-yellow-400 rounded-lg shadow-lg border-t border-yellow-300"></div>
                            <div className="w-10 h-24 bg-gradient-to-t from-yellow-600 to-yellow-400 rounded-lg shadow-lg border-t border-yellow-300"></div>
                            <div className="w-10 h-32 bg-gradient-to-t from-yellow-600 to-yellow-400 rounded-lg shadow-lg border-t border-yellow-300"></div>
                            <div className="w-10 h-40 bg-gradient-to-t from-yellow-600 to-yellow-400 rounded-lg shadow-lg border-t border-yellow-300 relative group-hover:scale-105 transition-transform duration-500">
                                <div className="absolute -top-16 left-1/2 -translate-x-1/2">
                                    <div className="w-24 h-24 border-t-4 border-r-4 border-[#13ec5b] rounded-full rotate-45 transform"></div>
                                </div>
                            </div>
                            <div className="w-10 h-48 bg-gradient-to-t from-yellow-600 to-yellow-400 rounded-lg shadow-lg border-t border-yellow-300"></div>
                        </div>
                    </div>

                    <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                        You've been invited to <br /> GreenWealth
                    </h1>
                    <p className="text-gray-500 text-lg max-w-md">
                        Complete your registration to start managing your assets with 256-bit encryption and real-time insights.
                    </p>
                </div>

                <div className="mt-12 bg-white rounded-xl p-4 shadow-sm inline-flex items-center gap-4 self-start border border-gray-100">
                    <div className="flex -space-x-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-400 bg-cover bg-center`} style={{ backgroundImage: `url('https://i.pravatar.cc/150?img=${i + 10}')` }}></div>
                        ))}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-900">Trusted by <span className="text-[#13ec5b]">1M+</span> users worldwide</p>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 lg:p-24 overflow-y-auto">
                <div className="max-w-md w-full mx-auto">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Complete your account</h2>
                    <p className="text-gray-500 mb-8">Set up your password and username to get started.</p>

                    {error && <div data-testid="error-message" className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm flex items-center gap-2"><div className="w-2 h-2 bg-red-500 rounded-full"></div>{error}</div>}

                    <form data-testid="invite-signup-form" onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Email Address</label>
                            <input
                                data-testid="email-input"
                                type="email"
                                // Readonly and disabled style
                                readOnly
                                value={decodedEmail}
                                className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Username</label>
                            <input
                                data-testid="username-input"
                                type="text"
                                required
                                value={formData.username}
                                onChange={e => setFormData({ ...formData, username: e.target.value })}
                                placeholder="username"
                                minLength={3}
                                maxLength={30}
                                pattern="[a-zA-Z0-9_-]+"
                                title="Username must be 3-30 characters and contain only letters, numbers, underscores, or hyphens"
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
                                className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-[#13ec5b] focus:ring-4 focus:ring-green-500/10 outline-none transition-all text-lg tracking-widest"
                            />
                        </div>

                        <div className="space-y-3 pt-2">
                            <div className="flex items-center gap-2 text-sm transition-colors duration-300">
                                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${hasMinLength ? 'bg-[#13ec5b]' : 'bg-gray-200'}`}>
                                    <CheckCircle className={`w-3 h-3 ${hasMinLength ? 'text-white' : 'text-gray-400'}`} />
                                </div>
                                <span className={hasMinLength ? 'text-gray-900 font-medium' : 'text-gray-500'}>At least 8 characters</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm transition-colors duration-300">
                                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${hasSymbolOrNumber ? 'bg-[#13ec5b]' : 'bg-gray-200'}`}>
                                    <CheckCircle className={`w-3 h-3 ${hasSymbolOrNumber ? 'text-white' : 'text-gray-400'}`} />
                                </div>
                                <span className={hasSymbolOrNumber ? 'text-gray-900 font-medium' : 'text-gray-500'}>Contains a number or symbol</span>
                            </div>
                        </div>

                        <label className="flex items-start gap-3 cursor-pointer group pt-2">
                            <div className="relative flex items-center">
                                <input
                                    data-testid="terms-checkbox"
                                    type="checkbox"
                                    checked={acceptedTerms}
                                    onChange={e => setAcceptedTerms(e.target.checked)}
                                    className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-gray-300 transition-all checked:border-[#13ec5b] checked:bg-[#13ec5b]"
                                />
                                <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" stroke="currentColor" strokeWidth="1">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                                    </svg>
                                </div>
                            </div>
                            <span className="text-sm text-gray-500 leading-snug group-hover:text-gray-700 transition-colors">
                                I agree to the <Link href="#" className="text-[#13ec5b] font-bold hover:underline">Terms of Service</Link> and <Link href="#" className="text-[#13ec5b] font-bold hover:underline">Privacy Policy</Link>.
                            </span>
                        </label>

                        <button
                            data-testid="signup-button"
                            type="submit"
                            disabled={isPending || !hasMinLength || !hasSymbolOrNumber || !acceptedTerms}
                            className="w-full py-4 bg-[#13ec5b] hover:bg-[#10c94d] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-green-500/30 transition-all text-lg mb-4"
                        >
                            {isPending ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <p className="text-center mt-6 text-gray-500 text-sm font-medium">
                        Already have an account? <Link data-testid="login-link" href="/auth/login" className="text-[#13ec5b] font-bold hover:underline">Log in</Link>
                    </p>

                    <div className="mt-12 flex justify-center">
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-50 rounded-full text-green-700 text-[10px] font-bold uppercase tracking-widest border border-green-100">
                            <Lock className="w-3 h-3" />
                            End-to-End Encrypted
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
