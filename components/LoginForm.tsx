// components/LoginForm.tsx
'use client';

import { useState } from 'react';
import VisibilityIcon from './VisibilityIcon';


export default function LoginForm() {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="w-full max-w-[440px] bg-white dark:bg-zinc-900 shadow-2xl shadow-emerald-900/5 rounded-xl border border-gray-100 dark:border-white/5 overflow-hidden">
            {/* Login Header */}
            <div className="pt-10 pb-6 px-8 text-center">
                <h1 className="text-3xl font-bold text-[#0d1b12] dark:text-white tracking-tight">
                    Welcome Back
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
                    Enter your details to manage your assets.
                </p>
            </div>

            {/* Login Form */}
            <form className="px-8 pb-8 space-y-5">
                {/* Email Field */}
                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-[#0d1b12] dark:text-gray-200 ml-1">
                        Email Address
                    </label>
                    <div className="relative group">
                        <input
                            className="w-full h-12 px-4 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-zinc-800/50 text-[#0d1b12] dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            placeholder="name@company.com"
                            type="email"
                        />
                    </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                    <div className="flex justify-between items-center px-1">
                        <label className="text-sm font-semibold text-[#0d1b12] dark:text-gray-200">
                            Password
                        </label>
                        <a
                            className="text-xs font-bold text-emerald-700 dark:text-primary hover:underline"
                            href="#"
                        >
                            Forgot Password?
                        </a>
                    </div>
                    <div className="relative group flex items-stretch">
                        <input
                            className="w-full h-12 px-4 rounded-lg rounded-r-none border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-zinc-800/50 text-[#0d1b12] dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all border-r-0"
                            placeholder="••••••••"
                            type={showPassword ? 'text' : 'password'}
                        />

                        <VisibilityIcon
                            showPassword={showPassword}
                            setShowPassword={setShowPassword}
                        />

                    </div>
                </div>

                {/* Submit Button */}
                <button
                    className="w-full h-12 bg-primary hover:bg-emerald-400 text-[#0d1b12] font-bold rounded-lg shadow-lg shadow-primary/20 transition-all transform active:scale-[0.98] mt-2"
                    type="submit"
                >
                    Log In
                </button>

                {/* Divider */}
                <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-100 dark:border-white/5"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white dark:bg-zinc-900 px-3 text-gray-400 font-medium tracking-wider">
                            Or continue with
                        </span>
                    </div>
                </div>

                {/* Social Logins */}
                <div className="grid grid-cols-2 gap-4">

                </div>
            </form>

            {/* Footer */}
            <div className="bg-gray-50/50 dark:bg-black/20 py-4 px-8 text-center border-t border-gray-100 dark:border-white/5">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Don&apos;t have an account?{' '}
                    <a className="font-bold text-emerald-700 dark:text-primary hover:underline" href="#">
                        Create one
                    </a>
                </p>
            </div>
        </div>
    );
}