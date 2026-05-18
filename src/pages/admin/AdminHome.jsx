import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Loading from '../../components/common/Loading';

const StatCard = ({ label, value, icon, color }) => (
    <div
        className="rounded-xl shadow-sm p-5 flex flex-col items-center gap-2 border-t-4"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: color }}
    >
        <span className="text-3xl">{icon}</span>
        <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{value ?? '—'}</p>
        <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>{label}</p>
    </div>
);

const AdminHome = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [recentUsers, setRecentUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [dashRes, usersRes] = await Promise.all([
                    api.get('/dashboard/admin'),
                    api.get('/users'),
                ]);
                setStats(dashRes.data.data);
                setRecentUsers((usersRes.data.data.users || []).slice(0, 5));
            } catch {
                setError('Failed to load dashboard.');
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    if (loading) return <Loading />;
    if (error) return <div className="text-red-500 p-4">{error}</div>;

    const gradedPct = stats.submissions.total > 0
        ? Math.round((stats.submissions.graded / stats.submissions.total) * 100) : 0;
    const pendingPct = stats.submissions.total > 0
        ? Math.round((stats.submissions.pending / stats.submissions.total) * 100) : 0;

    const statCards = [
        { label: 'Total Users', value: stats.users.total, icon: '👥', color: '#3B82F6' },
        { label: 'Students', value: stats.users.students, icon: '🎓', color: '#10B981' },
        { label: 'Teachers', value: stats.users.teachers, icon: '👨‍🏫', color: '#F59E0B' },
        { label: 'Total Assignments', value: stats.assignments.total, icon: '📋', color: '#8B5CF6' },
        { label: 'Active Assignments', value: stats.assignments.active, icon: '✅', color: '#06B6D4' },
        { label: 'Total Submissions', value: stats.submissions.total, icon: '📤', color: '#EC4899' },
    ];

    const roleBadgeColor = {
        admin: 'bg-purple-100 text-purple-700',
        teacher: 'bg-blue-100 text-blue-700',
        student: 'bg-green-100 text-green-700',
    };

    return (
        <div className="space-y-6">
            {/* Page title */}
            <div
                className="rounded-xl shadow-sm p-5 border-l-4 border-[#1E2A5E]"
                style={{ backgroundColor: 'var(--bg-card)' }}
            >
                <h1 className="text-xl font-bold" style={{ color: 'var(--text-heading)' }}>🛡️ Admin Dashboard</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>System analysis and quick reviews.</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {statCards.map(c => <StatCard key={c.label} {...c} />)}
            </div>

            {/* Bottom section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Recent Users */}
                <div className="rounded-xl shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--bg-card)' }}>
                    <div className="flex items-center justify-between bg-[#1E2A5E] px-5 py-3">
                        <h2 className="text-white font-semibold text-sm">👥 Recent Users</h2>
                        <a href="/admin/users" className="text-blue-300 text-xs hover:underline">View All</a>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left border-b" style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>
                                    <th className="px-4 py-2 whitespace-nowrap">Name</th>
                                    <th className="px-4 py-2 whitespace-nowrap">Role</th>
                                    <th className="px-4 py-2 whitespace-nowrap">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentUsers.map(u => (
                                    <tr
                                        key={u._id}
                                        className="border-b transition-colors"
                                        style={{ borderColor: 'var(--border)' }}
                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--hover-row)'}
                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{u.firstName} {u.lastName}</p>
                                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{u.email}</p>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${roleBadgeColor[u.role] || 'bg-gray-100 text-gray-600'}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                                {u.isActive !== false ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Submission Progress */}
                <div className="rounded-xl shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--bg-card)' }}>
                    <div className="bg-[#1E2A5E] px-5 py-3">
                        <h2 className="text-white font-semibold text-sm">📊 Submission Progress</h2>
                    </div>
                    <div className="p-5 space-y-5">
                        <div>
                            <div className="flex justify-between text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
                                <span>Graded</span>
                                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{stats.submissions.graded} / {stats.submissions.total}</span>
                            </div>
                            <div className="w-full rounded-full h-3" style={{ backgroundColor: 'var(--border)' }}>
                                <div className="bg-green-500 h-3 rounded-full transition-all duration-500" style={{ width: `${gradedPct}%` }} />
                            </div>
                            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{gradedPct}% graded</p>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
                                <span>Pending Review</span>
                                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{stats.submissions.pending} / {stats.submissions.total}</span>
                            </div>
                            <div className="w-full rounded-full h-3" style={{ backgroundColor: 'var(--border)' }}>
                                <div className="bg-yellow-400 h-3 rounded-full transition-all duration-500" style={{ width: `${pendingPct}%` }} />
                            </div>
                            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{pendingPct}% awaiting review</p>
                        </div>
                        <div className="pt-4 border-t grid grid-cols-3 text-center gap-2" style={{ borderColor: 'var(--border)' }}>
                            <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--stat-blue-bg)' }}>
                                <p className="text-xl font-bold" style={{ color: 'var(--stat-blue-text)' }}>{stats.submissions.total}</p>
                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total</p>
                            </div>
                            <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--stat-blue-bg)' }}>
                                <p className="text-xl font-bold" style={{ color: 'var(--stat-green-text)' }}>{stats.submissions.graded}</p>
                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Graded</p>
                            </div>
                            <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--stat-blue-bg)' }}>
                                <p className="text-xl font-bold" style={{ color: 'var(--stat-amber-text)' }}>{stats.submissions.pending}</p>
                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Pending</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminHome;