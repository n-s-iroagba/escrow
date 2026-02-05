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
    TrendingUp,
    Sparkles,
    Award,
    Activity,
    Menu,
    X
} from 'lucide-react';
import Link from 'next/link';
import { APP_NAME } from '@/constants/data';
import { useState } from 'react';

export default function DashboardPage() {
    const { user } = useAuthContext();
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const { data: kycData, loading: kycLoading } = useGet(
        API_ROUTES.KYC.STATUS(user?.id),
        { enabled: user?.role === 'CLIENT' }
    );

    const { data: escrows, loading: escrowsLoading } = useGet(API_ROUTES.ESCROWS.GET_MY);

    const myEscrows = Array.isArray(escrows) ? escrows : [];

    const pendingFundingEscrows = myEscrows.filter((e: any) => {
        const isBuyer = e.buyerId === user?.id;
        const isSeller = e.sellerId === user?.id;
        return (e.state === 'INITIALIZED' || e.state === 'ONE_PARTY_FUNDED') && (isBuyer || isSeller);
    });

    const loading = escrowsLoading || (user?.role === 'ADMIN' ? false : kycLoading);
    const kycStatus = kycData?.status || 'NOT_STARTED';
    const isVerified = kycStatus === 'APPROVED' || kycStatus === 'VERIFIED';

    const completedCount = myEscrows.filter((e: any) => e.state === 'COMPLETED' || e.state === 'COMPLETELY_FUNDED').length;
    const totalVolume = myEscrows.reduce((acc: number, curr: any) => acc + parseFloat(curr.amount || 0), 0);

    if (loading) {
        return (
            <div className="min-h-screen bg-background-light gradient-bg flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-16 h-16 rounded-xl bg-primary/20 mb-4 shadow-lg shadow-primary/20"></div>
                    <p className="text-primary font-semibold">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-light gradient-bg">
            {/* Decorative Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-primary/3 rounded-full blur-3xl"></div>
            </div>

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background-dark text-white shadow-2xl border-b border-primary/10">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 relative">
                            <ShieldCheck className="w-5 h-5 text-background-dark" />
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                        </div>
                        <div>
                            <span className="font-bold text-lg tracking-tight font-display">{APP_NAME}</span>
                            <span className="block text-[10px] text-primary uppercase tracking-widest font-semibold">Trader Platform</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-all"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <>
                    <div className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
                    <aside className="lg:hidden fixed left-0 top-[73px] bottom-0 w-72 bg-background-dark text-white p-6 z-50 shadow-2xl border-r border-primary/10 overflow-y-auto">
                        <nav className="space-y-2 mb-8">
                            <NavItem icon={<Home />} label="Dashboard" href="/trader/dashboard" active onClick={() => setMobileMenuOpen(false)} />
                            <NavItem icon={<FileText />} label="My Escrows" href="/trader/escrow" onClick={() => setMobileMenuOpen(false)} />
                            <NavItem icon={<Wallet />} label="KYC Verification" href="/trader/kyc" onClick={() => setMobileMenuOpen(false)} />
                        </nav>

                        <div className="border-t border-white/10 pt-6 space-y-4">
                            <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-sm font-bold text-background-dark shadow-lg font-display">
                                        {user?.email?.substring(0, 2).toUpperCase() || 'U'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold truncate">{user?.email || 'Trader'}</p>
                                        <p className="text-xs text-primary/70 capitalize">{user?.role?.toLowerCase()}</p>
                                    </div>
                                </div>
                            </div>
                            <button data-testid="logout-button" className="w-full flex items-center gap-2 p-3.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm font-medium group">
                                <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                                Sign out
                            </button>
                        </div>
                    </aside>
                </>
            )}

            {/* Desktop Sidebar */}
            <aside className="fixed left-0 top-0 h-full w-72 bg-background-dark text-white p-8 hidden lg:flex flex-col z-50 shadow-2xl border-r border-primary/10">
                <div className="flex items-center gap-3 mb-16">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 relative">
                        <ShieldCheck className="w-6 h-6 text-background-dark" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                    </div>
                    <div>
                        <span className="font-bold text-xl tracking-tight font-display">{APP_NAME}</span>
                        <span className="block text-[11px] text-primary uppercase tracking-widest font-semibold">Trader Platform</span>
                    </div>
                </div>

                <nav className="space-y-2 flex-1">
                    <NavItem icon={<Home />} label="Dashboard" href="/trader/dashboard" active />
                    <NavItem icon={<FileText />} label="My Escrows" href="/trader/escrow" />
                    <NavItem icon={<Wallet />} label="KYC Verification" href="/trader/kyc" />
                </nav>

                <div className="border-t border-white/10 pt-6 space-y-4">
                    <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-sm font-bold text-background-dark shadow-lg font-display">
                                {user?.email?.substring(0, 2).toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate">{user?.email || 'Trader'}</p>
                                <p className="text-xs text-primary/70 capitalize">{user?.role?.toLowerCase()}</p>
                            </div>
                        </div>
                    </div>
                    <button data-testid="logout-button" className="w-full flex items-center gap-2 p-3.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm font-medium group">
                        <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                        Sign out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="lg:ml-72 p-6 lg:p-12 pb-24 relative pt-20 lg:pt-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-5 h-5 text-primary" />
                            <p className="text-sm text-primary font-semibold">Welcome back,</p>
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-bold text-background-dark tracking-tight font-display">
                            {user?.email?.split('@')[0] || 'Trader'}
                        </h1>
                    </div>
                    <button
                        data-testid="new-transaction-button"
                        onClick={() => router.push('/trader/escrow/initiate')}
                        disabled={user?.role !== 'ADMIN' && !isVerified}
                        className={`px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] font-display w-full lg:w-auto ${!isVerified
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                            : 'bg-primary hover:bg-primary/90 text-background-dark shadow-primary/30'}`}
                    >
                        <Plus className="w-5 h-5" />
                        New Transaction
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>

                {/* KYC Alert */}
                {!isVerified && user?.role !== 'ADMIN' && (
                    <div className="bg-white rounded-xl p-8 lg:p-10 border-2 border-primary/20 shadow-xl shadow-primary/10 mb-12 relative overflow-hidden">
                        <div className="absolute right-0 top-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -mr-48 -mt-48"></div>
                        <div className="absolute left-0 bottom-0 w-80 h-80 bg-primary/3 rounded-full blur-3xl -ml-40 -mb-40"></div>
                        <div className="relative flex flex-col lg:flex-row items-start lg:items-center gap-6">
                            <div className="p-5 bg-primary/10 rounded-xl shadow-lg shrink-0">
                                <ShieldAlert className="w-10 h-10 text-primary" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-2xl font-bold text-background-dark mb-3 flex items-center gap-2 font-display">
                                    Complete Identity Verification
                                    <Sparkles className="w-5 h-5 text-primary" />
                                </h3>
                                <p className="text-gray-600 text-lg leading-relaxed">
                                    Verify your identity to unlock all trading features. This one-time check ensures the security of all platform transactions.
                                </p>
                            </div>
                            <button
                                data-testid="verify-kyc-button"
                                onClick={() => router.push('/trader/kyc')}
                                className="bg-background-dark hover:bg-background-dark/90 text-white px-8 py-4 rounded-xl font-bold transition-all flex items-center gap-2 shadow-xl font-display w-full lg:w-auto justify-center"
                            >
                                Verify Now <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 mb-12">
                    <StatCard
                        title="Pending"
                        value={pendingFundingEscrows.length}
                        icon={<Clock className="w-6 h-6" />}
                        color="amber"
                        trend="+2 this week"
                    />
                    <StatCard
                        title="Completed"
                        value={completedCount}
                        icon={<CheckCircle2 className="w-6 h-6" />}
                        color="green"
                        trend="All successful"
                    />
                    <StatCard
                        title="Total Trades"
                        value={myEscrows.length}
                        icon={<Activity className="w-6 h-6" />}
                        color="green"
                        trend="Since joining"
                    />
                    <StatCard
                        title="Volume"
                        value={`$${totalVolume.toLocaleString()}`}
                        icon={<TrendingUp className="w-6 h-6" />}
                        color="green"
                        trend="+12% growth"
                    />
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Action Required */}
                    <div className="xl:col-span-2 space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-background-dark flex items-center gap-3 font-display">
                                <div className="p-2 bg-amber-50 rounded-lg">
                                    <Clock className="w-6 h-6 text-amber-600" />
                                </div>
                                Action Required
                            </h2>
                            {pendingFundingEscrows.length > 0 && (
                                <span className="px-4 py-2 bg-amber-50 text-amber-700 text-sm font-bold rounded-lg border border-amber-200">
                                    {pendingFundingEscrows.length} item(s)
                                </span>
                            )}
                        </div>

                        {pendingFundingEscrows.length === 0 ? (
                            <div className="bg-white rounded-xl p-12 text-center border-2 border-primary/20 shadow-xl shadow-primary/10">
                                <div className="w-20 h-20 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                                    <CheckCircle2 className="w-10 h-10 text-primary" />
                                </div>
                                <h3 className="font-bold text-background-dark text-2xl mb-3 font-display">All Caught Up!</h3>
                                <p className="text-gray-600 text-lg">No pending actions. Ready to start a new trade?</p>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                {pendingFundingEscrows.map((escrow: any) => (
                                    <div key={escrow.id} className="bg-white p-7 rounded-xl border-2 border-gray-100 shadow-lg hover:shadow-xl hover:border-primary/30 transition-all group">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                                            <div className="flex items-center gap-5">
                                                <div className={`p-4 rounded-lg shadow-md ${escrow.tradeType === 'CRYPTO_TO_CRYPTO'
                                                    ? 'bg-purple-50 text-purple-600'
                                                    : 'bg-blue-50 text-blue-600'}`}>
                                                    {escrow.tradeType === 'CRYPTO_TO_CRYPTO' ? <Coins className="w-7 h-7" /> : <Banknote className="w-7 h-7" />}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-background-dark text-xl mb-1 font-display">
                                                        {escrow.amount} {escrow.buyCurrency}
                                                        <span className="text-primary font-normal text-lg mx-2">→</span>
                                                        {escrow.sellCurrency}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">
                                                        ID: <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">#{escrow.id.substring(0, 8)}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                                                <span className="px-4 py-2 bg-amber-50 text-amber-700 text-xs font-bold rounded-lg border-2 border-amber-200 shadow-sm text-center">
                                                    FUNDING PENDING
                                                </span>
                                                <button
                                                    data-testid="fund-now-button"
                                                    onClick={() => router.push(`/trader/escrow/${escrow.id}/fund`)}
                                                    className="bg-primary hover:bg-primary/90 text-background-dark px-6 py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/30 group-hover:shadow-xl font-display"
                                                >
                                                    Fund Now <ChevronRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Recent Activity */}
                        <div className="mt-12">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-background-dark flex items-center gap-3 font-display">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Activity className="w-6 h-6 text-primary" />
                                    </div>
                                    Recent Activity
                                </h2>
                                <Link data-testid="view-all-escrows-link" href="/trader/escrow" className="text-sm font-bold text-primary hover:text-primary/80 flex items-center gap-1 px-4 py-2 bg-primary/10 rounded-lg hover:bg-primary/20 transition-all font-display">
                                    View All <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>

                            <div className="bg-white rounded-xl border-2 border-gray-100 shadow-xl overflow-hidden">
                                {myEscrows.length === 0 ? (
                                    <div className="p-12 text-center text-gray-400">No transaction history yet.</div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table data-testid="recent-activity-table" className="w-full text-left">
                                            <thead className="bg-gray-50 text-xs text-gray-600 uppercase tracking-wider">
                                                <tr>
                                                    <th className="p-5 font-bold">Type</th>
                                                    <th className="p-5 font-bold">Amount</th>
                                                    <th className="p-5 font-bold">Status</th>
                                                    <th className="p-5 font-bold">Date</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {myEscrows.slice(0, 5).map((e: any, index: number) => (
                                                    <tr key={e.id} data-testid={`escrow-row-${index}`} className="hover:bg-primary/5 cursor-pointer transition-all" onClick={() => router.push(`/trader/escrow/${e.id}`)}>
                                                        <td className="p-5 font-semibold text-background-dark">{e.tradeType?.replace(/_/g, ' ')}</td>
                                                        <td className="p-5 font-medium text-background-dark">{e.amount} <span className="text-gray-400">{e.buyCurrency}</span></td>
                                                        <td className="p-5">
                                                            <StatusBadge status={e.state} />
                                                        </td>
                                                        <td className="p-5 text-gray-500 font-medium">{new Date(e.createdAt).toLocaleDateString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-6">
                        {/* Trust Score Card */}
                        <div className="bg-background-dark text-white rounded-xl p-8 shadow-2xl relative overflow-hidden">
                            <div className="absolute right-0 top-0 w-56 h-56 bg-primary rounded-full blur-[100px] opacity-20 -mr-28 -mt-28"></div>
                            <div className="absolute left-0 bottom-0 w-48 h-48 bg-primary rounded-full blur-[90px] opacity-10 -ml-24 -mb-24"></div>

                            <div className="relative">
                                <div className="flex items-center gap-2 mb-6">
                                    <Award className="w-5 h-5 text-primary" />
                                    <h3 className="text-primary text-xs uppercase tracking-widest font-bold">Trust Center</h3>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full shadow-lg ${isVerified ? 'bg-primary shadow-primary/50' : 'bg-amber-400 shadow-amber-400/50 animate-pulse'}`}></div>
                                            <span className="text-sm font-medium">Identity (KYC)</span>
                                        </div>
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${isVerified ? 'bg-primary/20 text-primary' : 'bg-amber-500/20 text-amber-300'}`}>
                                            {isVerified ? 'VERIFIED' : 'PENDING'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full bg-primary shadow-lg shadow-primary/50"></div>
                                            <span className="text-sm font-medium">Email</span>
                                        </div>
                                        <span className="text-xs font-bold bg-primary/20 text-primary px-3 py-1 rounded-full">VERIFIED</span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full bg-primary shadow-lg shadow-primary/50"></div>
                                            <span className="text-sm font-medium">Security</span>
                                        </div>
                                        <span className="text-xs font-bold bg-primary/20 text-primary px-3 py-1 rounded-full">ACTIVE</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-white rounded-xl p-8 border-2 border-gray-100 shadow-xl">
                            <h3 className="font-bold text-background-dark mb-6 flex items-center gap-2 text-lg font-display">
                                <TrendingUp className="w-5 h-5 text-primary" />
                                Quick Stats
                            </h3>
                            <div className="space-y-5">
                                <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
                                    <span className="text-gray-600 text-sm font-semibold">Total Trades</span>
                                    <span className="font-bold text-background-dark text-lg font-display">{myEscrows.length}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function NavItem({ icon, label, href, active, onClick }: { icon: React.ReactNode; label: string; href: string; active?: boolean; onClick?: () => void }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={`flex items-center gap-4 px-5 py-4 rounded-lg font-semibold transition-all font-display ${active
                ? 'bg-primary/20 text-primary shadow-lg shadow-primary/10 border-l-4 border-primary'
                : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
            <span className={active ? 'text-primary' : 'text-gray-500'}>{icon}</span>
            {label}
        </Link>
    );
}

function StatCard({ title, value, icon, color, trend }: { title: string; value: string | number; icon: React.ReactNode; color: string; trend?: string }) {
    const colorClasses: Record<string, { bg: string; icon: string; border: string }> = {
        amber: { bg: 'bg-amber-50', icon: 'text-amber-600', border: 'border-amber-100' },
        green: { bg: 'bg-primary/10', icon: 'text-primary', border: 'border-primary/20' },
    };
    const classes = colorClasses[color] || colorClasses.green;

    return (
        <div className={`bg-white p-6 rounded-xl border-2 ${classes.border} shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]`}>
            <div className={`inline-flex p-3.5 rounded-lg ${classes.bg} ${classes.icon} mb-4 shadow-sm`}>
                {icon}
            </div>
            <p className="text-3xl font-bold text-background-dark mb-1 font-display">{value}</p>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">{title}</p>
            {trend && <p className="text-xs text-primary font-medium">{trend}</p>}
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const statusClasses: Record<string, string> = {
        COMPLETED: 'bg-primary/10 text-primary border-primary/30',
        COMPLETELY_FUNDED: 'bg-primary/10 text-primary border-primary/30',
        INITIALIZED: 'bg-amber-50 text-amber-700 border-amber-200',
        ONE_PARTY_FUNDED: 'bg-blue-50 text-blue-700 border-blue-200',
        CANCELLED: 'bg-red-50 text-red-700 border-red-200',
    };
    return (
        <span className={`text-[11px] font-bold uppercase tracking-wide px-3 py-1.5 rounded-lg border-2 ${statusClasses[status] || 'bg-gray-50 text-gray-600 border-gray-200'} shadow-sm`}>
            {status?.replace(/_/g, ' ')}
        </span>
    );
}