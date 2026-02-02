'use client';

import { useGet } from '@/hooks/useApiQuery';
import API_ROUTES from '@/constants/api-routes';
import { useAuthContext } from '@/hooks/useAuthContext';
import { useRouter } from 'next/navigation';
import {
    ShieldAlert,
    Plus,
    ArrowRight,
    Clock,
    CheckCircle2,
    ShieldCheck,
    Coins,
    Banknote,
    Wallet,
    FileText,
    Home,
    LogOut,
    ChevronRight,
    TrendingUp
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
    const { user } = useAuthContext();
    const router = useRouter();

    const { data: kycData, loading: kycLoading } = useGet(
        API_ROUTES.KYC.STATUS(user?.id),
        { enabled: !!user?.id }
    );

    const { data: escrows, loading: escrowsLoading } = useGet(API_ROUTES.ESCROWS.GET_MY);

    const myEscrows = Array.isArray(escrows) ? escrows : [];

    const pendingFundingEscrows = myEscrows.filter((e: any) => {
        const isBuyer = e.buyerId === user?.id;
        const isSeller = e.sellerId === user?.id;
        return (e.state === 'INITIALIZED' || e.state === 'ONE_PARTY_FUNDED') && (isBuyer || isSeller);
    });

    const loading = kycLoading || escrowsLoading;
    const kycStatus = kycData?.status || 'NOT_STARTED';
    const isVerified = kycStatus === 'APPROVED' || kycStatus === 'VERIFIED';

    const completedCount = myEscrows.filter((e: any) => e.state === 'COMPLETED' || e.state === 'COMPLETELY_FUNDED').length;
    const totalVolume = myEscrows.reduce((acc: number, curr: any) => acc + parseFloat(curr.amount || 0), 0);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-200 mb-4"></div>
                    <p className="text-slate-400">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 text-white p-6 hidden lg:flex flex-col z-50">
                <div className="flex items-center gap-3 mb-12">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                        <ShieldCheck className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <span className="font-bold text-lg tracking-tight">X-Escrow</span>
                        <span className="block text-[10px] text-slate-400 uppercase tracking-widest">Trader</span>
                    </div>
                </div>

                <nav className="space-y-2 flex-1">
                    <NavItem icon={<Home />} label="Dashboard" href="/trader/dashboard" active />
                    <NavItem icon={<FileText />} label="My Escrows" href="/trader/escrow" />
                    <NavItem icon={<Wallet />} label="KYC Verification" href="/trader/kyc" />
                </nav>

                <div className="border-t border-slate-700 pt-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-sm font-bold">
                            {user?.email?.substring(0, 2).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user?.email || 'Trader'}</p>
                            <p className="text-xs text-slate-500 capitalize">{user?.role?.toLowerCase()}</p>
                        </div>
                    </div>
                    <button className="w-full flex items-center gap-2 p-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-sm">
                        <LogOut className="w-4 h-4" />
                        Sign out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="lg:ml-64 p-6 lg:p-10 pb-24">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
                    <div>
                        <p className="text-sm text-slate-500 font-medium mb-1">Welcome back,</p>
                        <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
                            {user?.email?.split('@')[0] || 'Trader'}
                        </h1>
                    </div>
                    <button
                        onClick={() => router.push('/trader/escrow/initiate')}
                        disabled={!isVerified}
                        className={`px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all transform hover:scale-[1.02] ${!isVerified
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                            : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-emerald-500/25'}`}
                    >
                        <Plus className="w-5 h-5" />
                        New Transaction
                    </button>
                </div>

                {/* KYC Alert */}
                {!isVerified && (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 lg:p-8 border border-amber-200/50 shadow-lg shadow-amber-100/50 mb-10 relative overflow-hidden">
                        <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-br from-amber-200/30 to-orange-200/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
                        <div className="relative flex flex-col lg:flex-row items-start lg:items-center gap-6">
                            <div className="p-4 bg-amber-100 rounded-2xl shrink-0">
                                <ShieldAlert className="w-8 h-8 text-amber-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Complete Identity Verification</h3>
                                <p className="text-slate-600">
                                    Verify your identity to unlock all trading features. This one-time check ensures the security of all platform transactions.
                                </p>
                            </div>
                            <button
                                onClick={() => router.push('/trader/kyc')}
                                className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2"
                            >
                                Verify Now <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-10">
                    <StatCard title="Pending" value={pendingFundingEscrows.length} icon={<Clock className="w-5 h-5" />} color="amber" />
                    <StatCard title="Completed" value={completedCount} icon={<CheckCircle2 className="w-5 h-5" />} color="emerald" />
                    <StatCard title="Total Trades" value={myEscrows.length} icon={<FileText className="w-5 h-5" />} color="blue" />
                    <StatCard title="Volume" value={`$${totalVolume.toLocaleString()}`} icon={<TrendingUp className="w-5 h-5" />} color="violet" />
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Action Required */}
                    <div className="xl:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-amber-500" />
                                Action Required
                            </h2>
                            {pendingFundingEscrows.length > 0 && (
                                <span className="text-sm text-slate-500">{pendingFundingEscrows.length} item(s)</span>
                            )}
                        </div>

                        {pendingFundingEscrows.length === 0 ? (
                            <div className="bg-white rounded-2xl p-10 text-center border border-slate-200/60 shadow-lg shadow-slate-200/30">
                                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                                </div>
                                <h3 className="font-bold text-slate-900 text-lg mb-2">All Caught Up!</h3>
                                <p className="text-slate-500">No pending actions. Ready to start a new trade?</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {pendingFundingEscrows.map((escrow: any) => (
                                    <div key={escrow.id} className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-lg shadow-slate-200/30 hover:shadow-xl transition-all group">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-3 rounded-xl ${escrow.tradeType === 'CRYPTO_TO_CRYPTO' ? 'bg-violet-100 text-violet-600' : 'bg-blue-100 text-blue-600'}`}>
                                                    {escrow.tradeType === 'CRYPTO_TO_CRYPTO' ? <Coins className="w-6 h-6" /> : <Banknote className="w-6 h-6" />}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900 text-lg">
                                                        {escrow.amount} {escrow.buyCurrency}
                                                        <span className="text-slate-400 font-normal text-sm mx-2">→</span>
                                                        {escrow.sellCurrency}
                                                    </h3>
                                                    <p className="text-sm text-slate-500">ID: <span className="font-mono">#{escrow.id.substring(0, 8)}</span></p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="px-3 py-1.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full border border-amber-200">
                                                    FUNDING PENDING
                                                </span>
                                                <button
                                                    onClick={() => router.push(`/trader/escrow/${escrow.id}/fund`)}
                                                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-1 transition-all"
                                                >
                                                    Fund <ChevronRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Recent Activity */}
                        <div className="mt-10">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-slate-900">Recent Activity</h2>
                                <Link href="/trader/escrow" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                                    View All <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>

                            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-lg shadow-slate-200/30 overflow-hidden">
                                {myEscrows.length === 0 ? (
                                    <div className="p-10 text-center text-slate-400">No transaction history yet.</div>
                                ) : (
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
                                            <tr>
                                                <th className="p-4 font-semibold">Type</th>
                                                <th className="p-4 font-semibold">Amount</th>
                                                <th className="p-4 font-semibold">Status</th>
                                                <th className="p-4 font-semibold">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {myEscrows.slice(0, 5).map((e: any) => (
                                                <tr key={e.id} className="hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => router.push(`/trader/escrow/${e.id}`)}>
                                                    <td className="p-4 font-medium text-slate-900">{e.tradeType?.replace(/_/g, ' ')}</td>
                                                    <td className="p-4">{e.amount} <span className="text-slate-400">{e.buyCurrency}</span></td>
                                                    <td className="p-4">
                                                        <StatusBadge status={e.state} />
                                                    </td>
                                                    <td className="p-4 text-slate-400">{new Date(e.createdAt).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-6">
                        {/* Trust Score Card */}
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
                            <div className="absolute right-0 top-0 w-48 h-48 bg-emerald-500 rounded-full blur-[80px] opacity-20 -mr-20 -mt-20"></div>
                            <h3 className="text-slate-400 text-xs uppercase tracking-widest font-bold mb-4">Trust Center</h3>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2.5 h-2.5 rounded-full ${isVerified ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`}></div>
                                        <span className="text-sm">Identity (KYC)</span>
                                    </div>
                                    <span className={`text-xs font-bold ${isVerified ? 'text-emerald-400' : 'text-amber-400'}`}>
                                        {isVerified ? 'VERIFIED' : 'PENDING'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                                        <span className="text-sm">Email</span>
                                    </div>
                                    <span className="text-xs font-bold text-emerald-400">VERIFIED</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-lg shadow-slate-200/30">
                            <h3 className="font-bold text-slate-900 mb-4">Quick Stats</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500 text-sm">Total Trades</span>
                                    <span className="font-bold text-slate-900">{myEscrows.length}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500 text-sm">Success Rate</span>
                                    <span className="font-bold text-emerald-600">100%</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500 text-sm">Member Since</span>
                                    <span className="font-bold text-slate-900">Jan 2024</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function NavItem({ icon, label, href, active }: { icon: React.ReactNode; label: string; href: string; active?: boolean }) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${active
                ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-l-2 border-emerald-400'
                : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
        >
            <span className={active ? 'text-emerald-400' : 'text-slate-500'}>{icon}</span>
            {label}
        </Link>
    );
}

function StatCard({ title, value, icon, color }: { title: string; value: string | number; icon: React.ReactNode; color: string }) {
    const colorClasses: Record<string, { bg: string; icon: string }> = {
        amber: { bg: 'bg-amber-50', icon: 'text-amber-600' },
        emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600' },
        blue: { bg: 'bg-blue-50', icon: 'text-blue-600' },
        violet: { bg: 'bg-violet-50', icon: 'text-violet-600' },
    };
    const classes = colorClasses[color] || colorClasses.blue;

    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-md shadow-slate-200/30">
            <div className={`inline-flex p-2.5 rounded-xl ${classes.bg} ${classes.icon} mb-3`}>
                {icon}
            </div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{title}</p>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const statusClasses: Record<string, string> = {
        COMPLETED: 'bg-emerald-100 text-emerald-700',
        COMPLETELY_FUNDED: 'bg-emerald-100 text-emerald-700',
        INITIALIZED: 'bg-amber-100 text-amber-700',
        ONE_PARTY_FUNDED: 'bg-blue-100 text-blue-700',
        CANCELLED: 'bg-red-100 text-red-700',
    };
    return (
        <span className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${statusClasses[status] || 'bg-slate-100 text-slate-600'}`}>
            {status?.replace(/_/g, ' ')}
        </span>
    );
}
