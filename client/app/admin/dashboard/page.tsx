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
    MoreHorizontal
} from 'lucide-react';

export default function AdminDashboardPage() {
    const router = useRouter();

    // Fetch Data
    const { data: users, loading: usersLoading } = useGet(API_ROUTES.USERS.GET_ALL);
    const { data: escrows, loading: escrowsLoading } = useGet(API_ROUTES.ESCROWS.GET_ADMIN_ALL);

    const isLoading = usersLoading || escrowsLoading;
    const allUsers = Array.isArray(users) ? users : [];
    const allEscrows = Array.isArray(escrows) ? escrows : [];

    // Stats Calculation
    const totalVolume = allEscrows.reduce((acc: number, curr: any) => {
        // Simple distinct currency sum isn't possible here without conversion
        // Just summing raw numbers for demo if currency assumes USD mostly or just showing raw count of volume
        // Ideally we map by currency. For now, let's just count total escrows volume as a raw number for simplicity 
        // or just show count stats.
        return acc + parseFloat(curr.amount || 0);
    }, 0);

    return (
        <div className="min-h-screen bg-[#f6f8f6] p-8 font-display text-[#0d1b12]">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Admin Overview</h1>
                        <p className="text-gray-500 mt-1">Monitor system activity and manage transactions.</p>
                    </div>
                    <button
                        onClick={() => router.push('/trader/escrow/initiate')}
                        className="bg-[#13ec5b] hover:bg-[#10c94d] text-[#0d1b12] px-6 py-3 rounded-xl font-bold shadow-lg shadow-green-200 flex items-center gap-2 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Initiate Escrow
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <StatCard
                        title="Total Users"
                        value={isLoading ? '...' : allUsers.length}
                        icon={<Users className="w-6 h-6 text-blue-600" />}
                        color="bg-blue-50"
                    />
                    <StatCard
                        title="Active Escrows"
                        value={isLoading ? '...' : allEscrows.length}
                        icon={<ShieldCheck className="w-6 h-6 text-[#13ec5b]" />} // Green
                        color="bg-green-50"
                    />
                    <StatCard
                        title="Volume (Raw)"
                        value={isLoading ? '...' : totalVolume.toLocaleString()}
                        icon={<TrendingUp className="w-6 h-6 text-purple-600" />}
                        color="bg-purple-50"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Escrows */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-bold text-lg text-gray-900">Recent Escrows</h2>
                            <button onClick={() => router.push('/admin/escrow')} className="text-sm font-bold text-gray-400 hover:text-gray-900 flex items-center gap-1">
                                View All <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {isLoading ? (
                                <div className="text-center py-8 text-gray-400">Loading...</div>
                            ) : allEscrows.slice(0, 5).map((escrow: any) => (
                                <div
                                    key={escrow.id}
                                    onClick={() => router.push(`/admin/escrow/${escrow.id}`)}
                                    className="p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer flex justify-between items-center group"
                                >
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-gray-900">{escrow.amount} {escrow.buyCurrency}</span>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${escrow.state === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {escrow.state}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 truncate w-48">{escrow.id}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-gray-400 uppercase">{escrow.tradeType.replace(/_/g, ' ')}</p>
                                        <p className="text-xs text-gray-400">{new Date(escrow.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))}
                            {allEscrows.length === 0 && !isLoading && (
                                <div className="text-center py-8 text-gray-400 text-sm">No escrows found.</div>
                            )}
                        </div>
                    </div>

                    {/* Recent Users */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-bold text-lg text-gray-900">New Users</h2>
                            <button onClick={() => { }} className="text-sm font-bold text-gray-400 hover:text-gray-900 flex items-center gap-1">
                                View All <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {isLoading ? (
                                <div className="text-center py-8 text-gray-400">Loading...</div>
                            ) : allUsers.slice(0, 5).map((user: any) => (
                                <div key={user.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center font-bold text-gray-600">
                                            {user.email.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">{user.email}</p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-500 capitalize">{user.role}</span>
                                                {user.kycStatus === 'VERIFIED' && (
                                                    <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">KYC</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <button className="text-gray-300 hover:text-gray-600">
                                        <MoreHorizontal className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                            {allUsers.length === 0 && !isLoading && (
                                <div className="text-center py-8 text-gray-400 text-sm">No users found.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, color }: { title: string, value: string | number, icon: React.ReactNode, color: string }) {
    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center shrink-0`}>
                {icon}
            </div>
            <div>
                <p className="text-gray-500 text-sm font-bold uppercase mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            </div>
        </div>
    );
}
