'use client';

import { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="min-h-screen flex flex-col font-display bg-[#f6f8f6] text-[#0d1b12]">
            {/* Top Navigation Bar */}
            <header className="w-full px-6 lg:px-20 py-4 flex items-center justify-between border-b border-gray-200 bg-white/50 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 text-[#13ec5b]">
                        <svg
                            fill="currentColor"
                            viewBox="0 0 48 48"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z"></path>
                        </svg>
                    </div>
                    <span className="text-[#0d1b12] text-xl font-bold tracking-tight">
                        SpaceX Secure Escrow
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <button className="hidden sm:flex text-sm font-semibold text-gray-600 hover:text-[#13ec5b] transition-colors">
                        Support
                    </button>
                    <button className="bg-[#13ec5b] hover:bg-[#13ec5b]/90 text-[#0d1b12] px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-sm">
                        Sign Up
                    </button>
                </div>
            </header>

            <main className="flex-grow flex items-center justify-center p-6 gradient-bg">
                <div className="w-full max-w-[440px] bg-white shadow-2xl shadow-emerald-900/5 rounded-xl border border-gray-100 overflow-hidden">
                    {/* Login Header */}
                    <div className="pt-10 pb-6 px-8 text-center">
                        <h1 className="text-3xl font-bold text-[#0d1b12] tracking-tight">
                            Welcome Back
                        </h1>
                        <p className="text-gray-500 mt-2 text-sm">
                            Enter your details to manage your assets.
                        </p>
                    </div>

                    {/* Login Form */}
                    <form className="px-8 pb-8 space-y-5" onSubmit={(e) => e.preventDefault()}>
                        {/* Email Field */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-[#0d1b12] ml-1">
                                Email Address
                            </label>
                            <div className="relative group">
                                <input
                                    className="w-full h-12 px-4 rounded-lg border border-gray-200 bg-gray-50 text-[#0d1b12] placeholder:text-gray-400 focus:ring-2 focus:ring-[#13ec5b]/20 focus:border-[#13ec5b] outline-none transition-all"
                                    placeholder="name@company.com"
                                    type="email"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-sm font-semibold text-[#0d1b12]">
                                    Password
                                </label>
                                <a
                                    className="text-xs font-bold text-emerald-600 hover:underline"
                                    href="#"
                                >
                                    Forgot Password?
                                </a>
                            </div>
                            <div className="relative group flex items-stretch">
                                <input
                                    className="w-full h-12 px-4 rounded-lg rounded-r-none border border-gray-200 bg-gray-50 text-[#0d1b12] placeholder:text-gray-400 focus:ring-2 focus:ring-[#13ec5b]/20 focus:border-[#13ec5b] outline-none transition-all border-r-0"
                                    placeholder="••••••••"
                                    type={showPassword ? 'text' : 'password'}
                                />
                                <button
                                    className="flex items-center justify-center px-3 border border-gray-200 bg-gray-50 rounded-r-lg border-l-0 text-gray-400 hover:text-[#13ec5b] transition-colors cursor-pointer"
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            className="w-full h-12 bg-[#13ec5b] hover:bg-emerald-400 text-[#0d1b12] font-bold rounded-lg shadow-lg shadow-[#13ec5b]/20 transition-all transform active:scale-[0.98] mt-2 cursor-pointer"
                            type="submit"
                        >
                            Log In
                        </button>



                    </form>

                    {/* Footer */}
                    <div className="bg-gray-50/50 py-4 px-8 text-center border-t border-gray-100">
                        <p className="text-sm text-gray-500">
                            Don't have an account?{' '}
                            <a
                                className="font-bold text-emerald-600 hover:underline"
                                href="/auth/sign-up"
                            >
                                Create one
                            </a>
                        </p>
                    </div>
                </div>
            </main>

            {/* Page Footer */}
            <footer className="py-8 text-center">
                <div className="flex items-center justify-center gap-2 text-xs text-gray-400 uppercase tracking-widest font-semibold mb-2">
                    <Lock className="w-3.5 h-3.5 text-emerald-500" />
                    Secure 256-bit AES Encryption
                </div>
                <div className="flex justify-center gap-6 text-xs text-gray-400">
                    <a className="hover:text-primary" href="#">
                        Privacy Policy
                    </a>
                    <a className="hover:text-primary" href="#">
                        Terms of Service
                    </a>
                    <a className="hover:text-primary" href="#">
                        Help Center
                    </a>
                </div>
            </footer>
        </div>
    );
}
