'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { usePost } from '@/hooks/useApiQuery';
import API_ROUTES from '@/constants/api-routes';
import { Mail, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { setAccessToken } from '@/lib/axios';

export default function VerifyEmailPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const paramToken = params.token as string;
    const email = searchParams.get('email');

    const initialCode = /^\d{6}$/.test(paramToken) ? paramToken : '';

    const [otp, setOtp] = useState<string[]>(initialCode ? initialCode.split('') : new Array(6).fill(''));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
    const [canResend, setCanResend] = useState(false);
    const [user, setUser] = useState(null);


    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [timeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const { post: verify, isPending, error, isSuccess } = usePost(API_ROUTES.AUTH.VERIFY_EMAIL, {
        onSuccess: (responseData: any) => {
            setTimeout(() => {
                console.log(responseData);
                setAccessToken(responseData?.accessToken);
                setUser(responseData?.user);
                router.push(`/${responseData?.user?.role === 'ADMIN' ? 'admin' : 'trader'}/dashboard`);
            }, 2000);
        }
    });


    const { post: resend, isPending: isResending } = usePost(API_ROUTES.AUTH.RESEND_VERIFICATION, {
        onSuccess: () => {
            setTimeLeft(300);
            setCanResend(false);
            alert("Verification code sent!");
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
        if (e.key === 'Backspace') {
            e.preventDefault();
            const newOtp = [...otp];
            if (otp[index]) {
                // If current input has value, clear it AND move to previous
                newOtp[index] = '';
                setOtp(newOtp);
                if (index > 0) {
                    inputRefs.current[index - 1]?.focus();
                }
            } else if (index > 0) {
                // If current input is empty and not first, move to previous and clear it
                newOtp[index - 1] = '';
                setOtp(newOtp);
                inputRefs.current[index - 1]?.focus();
            }
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

    const handleResend = async () => {
        if (!email) {
            alert("Email not found. Please sign up again.");
            return;
        }
        await resend({ email });
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
                        Your account has been successfully verified. You will be redirected to the dashboard shortly.
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
                                data-testid={`otp-input-${index}`}
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

                    {error && <div data-testid="error-message" className="bg-red-50 text-red-600 p-4 rounded-xl mb-8 text-sm font-medium">{error}</div>}

                    <button
                        data-testid="verify-button"
                        onClick={() => handleVerify(otp.join(''))}
                        disabled={isPending || otp.some(d => !d)}
                        className="w-full py-4 bg-[#13ec5b] hover:bg-[#10c94d] disabled:bg-opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-green-200 transition-all text-lg mb-8"
                    >
                        {isPending ? 'Verifying...' : 'Verify'}
                    </button>

                    <p className="text-sm text-gray-500 font-medium">
                        Didn't receive the email?{" "}
                        <button
                            data-testid="resend-button"
                            onClick={handleResend}
                            disabled={!canResend || isResending}
                            className={`font-bold hover:underline ${canResend ? 'text-[#13ec5b]' : 'text-gray-400 cursor-not-allowed'}`}
                        >
                            {isResending ? 'Sending...' : canResend ? 'Resend code' : `Resend code in ${formatTime(timeLeft)}`}
                        </button>
                    </p>

                    <Link data-testid="back-to-login-link" href="/auth/login" className="mt-8 flex items-center justify-center gap-2 text-gray-500 font-bold hover:text-gray-900 transition-colors">
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
