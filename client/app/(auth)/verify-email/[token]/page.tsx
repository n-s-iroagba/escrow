'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePost } from '@/hooks/useApiQuery';
import API_ROUTES from '@/constants/api-routes';
import { Mail, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function VerifyEmailPage() {
    const params = useParams();
    const router = useRouter();
    const paramToken = params.token as string;

    const initialCode = /^\d{6}$/.test(paramToken) ? paramToken : '';

    const [otp, setOtp] = useState<string[]>(initialCode ? initialCode.split('') : new Array(6).fill(''));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const { post: verify, isPending, error, isSuccess } = usePost(API_ROUTES.AUTH.VERIFY_EMAIL, {
        onSuccess: () => {
            setTimeout(() => {
                router.push('/auth/login');
            }, 2000);
        }
    });

    useEffect(() => {
        if (initialCode) {
            handleVerify(initialCode);
        }
    }, [initialCode]);

    const handleChange = (index: number, value: string) => {
        if (isNaN(Number(value))) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        if (newOtp.every(digit => digit !== '') && index === 5) {
            handleVerify(newOtp.join(''));
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const data = e.clipboardData.getData('text').slice(0, 6);
        if (!/^\d+$/.test(data)) return;

        const newOtp = data.split('').concat(new Array(6 - data.length).fill('')).slice(0, 6);
        setOtp(newOtp);

        if (data.length === 6) {
            handleVerify(data);
        }
        inputRefs.current[Math.min(data.length, 5)]?.focus();
    };

    const handleVerify = async (code: string) => {
        await verify({ token: code });
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-[#f8f9f8] flex items-center justify-center p-4 font-display">
                <div className="bg-white rounded-3xl shadow-xl p-12 max-w-[480px] w-full text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 animate-in zoom-in duration-300">
                        <CheckCircle className="w-10 h-10 text-[#13ec5b]" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Email Verified!</h1>
                    <p className="text-gray-500 mb-8 leading-relaxed">
                        Your account has been successfully verified. You will be redirected to the login page shortly.
                    </p>
                    <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#13ec5b] animate-[progress_2s_ease-in-out_forwards] w-full origin-left"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f9f8] flex flex-col font-display">
            <header className="px-8 py-6">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-black rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xs">GF</span>
                    </div>
                    <span className="font-bold text-lg text-gray-900">GreenFin</span>
                </div>
                <div className="absolute top-6 right-8">
                    <button className="bg-[#13ec5b] hover:bg-[#10c94d] text-white font-bold py-2 px-6 rounded-lg shadow-lg shadow-green-200 transition-all text-sm">
                        Help
                    </button>
                </div>
            </header>

            <main className="flex-1 flex items-center justify-center p-4">
                <div className="bg-white rounded-[2rem] shadow-xl p-12 max-w-[520px] w-full text-center border border-gray-100">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                        <div className="absolute inset-0 bg-green-100 rounded-full opacity-50 animate-pulse"></div>
                        <Mail className="w-10 h-10 text-[#13ec5b] relative z-10" />
                    </div>

                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Verify your email</h2>
                    <p className="text-gray-500 mb-10 leading-relaxed max-w-sm mx-auto">
                        We've sent a 6-digit verification code to your email address.
                        Please enter it below to confirm your account.
                    </p>

                    <div className="flex justify-center gap-3 mb-10">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={el => { inputRefs.current[index] = el; }}
                                type="text"
                                maxLength={1}
                                value={digit}
                                onChange={e => handleChange(index, e.target.value)}
                                onKeyDown={e => handleKeyDown(index, e)}
                                onPaste={handlePaste}
                                className={`w-12 h-14 border-2 rounded-xl text-center text-2xl font-bold outline-none transition-all
                                    ${digit ? 'border-[#13ec5b] bg-green-50 text-gray-900' : 'border-gray-200 text-gray-400 focus:border-[#13ec5b] focus:ring-4 focus:ring-green-100'}
                                `}
                            />
                        ))}
                    </div>

                    {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-8 text-sm font-medium">{error}</div>}

                    <button
                        onClick={() => handleVerify(otp.join(''))}
                        disabled={isPending || otp.some(d => !d)}
                        className="w-full py-4 bg-[#13ec5b] hover:bg-[#10c94d] disabled:bg-opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-green-200 transition-all text-lg mb-8"
                    >
                        {isPending ? 'Verifying...' : 'Verify'}
                    </button>

                    <p className="text-sm text-gray-500 font-medium">
                        Didn't receive the email? <button className="text-[#13ec5b] font-bold hover:underline">Resend code</button>
                    </p>

                    <Link href="/auth/login" className="mt-8 flex items-center justify-center gap-2 text-gray-500 font-bold hover:text-gray-900 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to login
                    </Link>
                </div>
            </main>

            <footer className="py-8 text-center text-xs text-gray-400 font-bold">
                © 2024 GreenFin. Secure Banking for the future.
            </footer>
        </div>
    );
}
