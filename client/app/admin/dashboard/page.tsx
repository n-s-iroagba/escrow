'use client';

import { useGet } from '@/hooks/useApiQuery';
import API_ROUTES from '@/constants/api-routes';
import { useRouter } from 'next/navigation';
import {
    Users,
    ShieldCheck,
    TrendingUp,
    Plus,
    ArrowRight,
    MoreHorizontal,
    FileText,
    Landmark,
    Wallet,
    Activity,
    ChevronRight
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
    const router = useRouter();

    const { data: users, loading: usersLoading } = useGet(API_ROUTES.USERS.GET_ALL);
    const { data: escrows, loading: escrowsLoading } = useGet(API_ROUTES.ESCROWS.GET_ADMIN_ALL);

    const isLoading = usersLoading || escrowsLoading;
    const allUsers = Array.isArray(users) ? users : [];
    const allEscrows = Array.isArray(escrows) ? escrows : [];

    const totalVolume = allEscrows.reduce((acc: number, curr: any) => acc + parseFloat(curr.amount || 0), 0);
    const pendingEscrows = allEscrows.filter((e: any) => e.state !== 'COMPLETED' && e.state !== 'CANCELLED');

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
            {/* Sidebar */}

            <div className="flex items-center gap-3 mb-12">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                    <span className="font-bold text-lg tracking-tight">X-Escrow</span>
                    <span className="block text-[10px] text-slate-400 uppercase tracking-widest">Admin Portal</span>
                </div>
            </div>

            <nav className="space-y-2 flex-1">
                <NavItem icon={<Activity />} label="Overview" href="/admin/dashboard" active />
                <NavItem icon={<FileText />} label="Escrows" href="/admin/escrow" />
                <NavItem icon={<Landmark />} label="Banks" href="/admin/bank" />
                <NavItem icon={<Wallet />} label="Wallets" href="/admin/custodial-wallet" />
                <NavItem icon={<Users />} label="Users" href="/admin/users" />
            </nav>




            {/* Main Content */}
            <main className="lg:ml-64 p-6 lg:p-10">
                {/* Top Bar */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
                            Dashboard
                        </h1>
                        <p className="text-slate-500 mt-1">Monitor system activity and manage platform operations.</p>
                    </div>
                    <button
                        data-testid="new-escrow-button"
                        onClick={() => router.push('/trader/escrow/initiate')}
                        className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-3.5 rounded-xl font-bold shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all transform hover:scale-[1.02]"
                    >
                        <Plus className="w-5 h-5" />
                        New Escrow
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <StatCard
                        title="Total Users"
                        value={isLoading ? '—' : allUsers.length.toLocaleString()}
                        icon={<Users className="w-5 h-5" />}

                        trendUp
                        color="blue"
                    />
                    <StatCard
                        title="Active Escrows"
                        value={isLoading ? '—' : pendingEscrows.length.toLocaleString()}
                        icon={<ShieldCheck className="w-5 h-5" />}

                        trendUp
                        color="emerald"
                    />
                    <StatCard
                        title="Total Volume"
                        value={isLoading ? '—' : `$${(totalVolume / 1000).toFixed(1)}K`}
                        icon={<TrendingUp className="w-5 h-5" />}

                        trendUp
                        color="violet"
                    />
                    <StatCard
                        title="Completed"
                        value={isLoading ? '—' : allEscrows.filter((e: any) => e.state === 'COMPLETED').length.toLocaleString()}
                        icon={<FileText className="w-5 h-5" />}

                        trendUp
                        color="amber"
                    />
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Recent Escrows Table */}
                    <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200/60 shadow-xl shadow-slate-200/40 overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <h2 className="font-bold text-lg text-slate-900">Recent Escrows</h2>
                            <Link data-testid="view-all-escrows-link" href="/admin/escrow" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                                View All <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="overflow-x-auto">
                            <table data-testid="recent-escrows-table" className="w-full">
                                <thead className="bg-slate-50/80 text-xs text-slate-500 uppercase tracking-wider">
                                    <tr>
                                        <th className="text-left p-4 font-semibold">ID</th>
                                        <th className="text-left p-4 font-semibold">Amount</th>
                                        <th className="text-left p-4 font-semibold">Type</th>
                                        <th className="text-left p-4 font-semibold">Status</th>
                                        <th className="text-left p-4 font-semibold">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {isLoading ? (
                                        <tr><td colSpan={5} className="p-8 text-center text-slate-400">Loading...</td></tr>
                                    ) : allEscrows.slice(0, 6).map((escrow: any) => (
                                        <tr
                                            key={escrow.id}
                                            onClick={() => router.push(`/admin/escrow/${escrow.id}`)}
                                            className="hover:bg-slate-50/50 cursor-pointer transition-colors"
                                        >
                                            <td className="p-4">
                                                <span className="font-mono text-sm text-slate-600">#{escrow.id.substring(0, 8)}</span>
                                            </td>
                                            <td className="p-4">
                                                <span className="font-bold text-slate-900">{escrow.amount}</span>
                                                <span className="text-slate-400 ml-1">{escrow.buyCurrency}</span>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-sm text-slate-600">{escrow.tradeType?.replace(/_/g, ' ')}</span>
                                            </td>
                                            <td className="p-4">
                                                <StatusBadge status={escrow.state} />
                                            </td>
                                            <td className="p-4 text-sm text-slate-400">
                                                {new Date(escrow.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                    {allEscrows.length === 0 && !isLoading && (
                                        <tr><td colSpan={5} className="p-8 text-center text-slate-400">No escrows found</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Recent Users */}
                    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-xl shadow-slate-200/40 overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <h2 className="font-bold text-lg text-slate-900">New Users</h2>
                            <button className="text-slate-400 hover:text-slate-600">
                                <MoreHorizontal className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 space-y-3">
                            {isLoading ? (
                                <div className="p-8 text-center text-slate-400">Loading...</div>
                            ) : allUsers.slice(0, 6).map((user: any) => (
                                <div key={user.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center font-bold text-slate-600 text-sm shrink-0">
                                        {user.email?.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-slate-900 text-sm truncate">{user.email}</p>
                                        <p className="text-xs text-slate-400 capitalize">{user.role?.toLowerCase()}</p>
                                    </div>
                                    {user.kycStatus === 'VERIFIED' && (
                                        <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-bold">KYC</span>
                                    )}
                                </div>
                            ))}
                            {allUsers.length === 0 && !isLoading && (
                                <div className="p-8 text-center text-slate-400 text-sm">No users found</div>
                            )}
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

function StatCard({ title, value, icon, trendUp, color }: {
    title: string; value: string | number; icon: React.ReactNode; trendUp: boolean; color: string;
}) {
    const colorClasses: Record<string, { bg: string; icon: string; trend: string }> = {
        blue: { bg: 'bg-blue-50', icon: 'text-blue-600', trend: 'text-blue-600 bg-blue-100' },
        emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', trend: 'text-emerald-600 bg-emerald-100' },
        violet: { bg: 'bg-violet-50', icon: 'text-violet-600', trend: 'text-violet-600 bg-violet-100' },
        amber: { bg: 'bg-amber-50', icon: 'text-amber-600', trend: 'text-amber-600 bg-amber-100' },
    };
    const classes = colorClasses[color] || colorClasses.blue;

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-lg shadow-slate-200/30 hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${classes.bg}`}>
                    <span className={classes.icon}>{icon}</span>
                </div>

            </div>
            <p className="text-sm text-slate-500 font-medium mb-1">{title}</p>
            <p className="text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const statusClasses: Record<string, string> = {
        COMPLETED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        INITIALIZED: 'bg-amber-100 text-amber-700 border-amber-200',
        ONE_PARTY_FUNDED: 'bg-blue-100 text-blue-700 border-blue-200',
        COMPLETELY_FUNDED: 'bg-violet-100 text-violet-700 border-violet-200',
        CANCELLED: 'bg-red-100 text-red-700 border-red-200',
    };
    return (
        <span className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border ${statusClasses[status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
            {status?.replace(/_/g, ' ')}
        </span>
    );
}
