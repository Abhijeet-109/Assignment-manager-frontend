import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Loading from '../../components/common/Loading';

const StatCard = ({ label, value, icon, color }) => (
    <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col items-center gap-2 border-t-4" style={{ borderColor: color }}>
        <span className="text-3xl">{icon}</span>
        <p className="text-3xl font-bold text-gray-800">{value ?? '—'}</p>
        <p className="text-sm text-gray-500 text-center">{label}</p>
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
                // Most recent 5 users
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
        ? Math.round((stats.submissions.graded / stats.submissions.total) * 100)
        : 0;
    const pendingPct = stats.submissions.total > 0
        ? Math.round((stats.submissions.pending / stats.submissions.total) * 100)
        : 0;

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
            <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-[#1E2A5E]">
                <h1 className="text-xl font-bold text-[#1E2A5E]">🛡️ Admin Dashboard</h1>
                <p className="text-sm text-gray-500 mt-1">System analysis and quick reviews.</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {statCards.map(c => <StatCard key={c.label} {...c} />)}
            </div>

            {/* Bottom section: Recent Users + Submission Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Recent Users */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between bg-[#1E2A5E] px-5 py-3">
                        <h2 className="text-white font-semibold text-sm">👥 Recent Users</h2>
                        <a href="/admin/users" className="text-blue-300 text-xs hover:underline">View All</a>
                    </div>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-500 border-b">
                                <th className="px-4 py-2">Name</th>
                                <th className="px-4 py-2">Role</th>
                                <th className="px-4 py-2">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentUsers.map(u => (
                                <tr key={u._id} className="border-b hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-gray-800">{u.firstName} {u.lastName}</p>
                                        <p className="text-xs text-gray-400">{u.email}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${roleBadgeColor[u.role] || 'bg-gray-100 text-gray-600'}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                            {u.isActive !== false ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Submission Progress */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-[#1E2A5E] px-5 py-3">
                        <h2 className="text-white font-semibold text-sm">📊 Submission Progress</h2>
                    </div>
                    <div className="p-5 space-y-5">
                        <div>
                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                                <span>Graded</span>
                                <span className="font-semibold">{stats.submissions.graded} / {stats.submissions.total}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-3">
                                <div
                                    className="bg-green-500 h-3 rounded-full transition-all duration-500"
                                    style={{ width: `${gradedPct}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">{gradedPct}% graded</p>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                                <span>Pending Review</span>
                                <span className="font-semibold">{stats.submissions.pending} / {stats.submissions.total}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-3">
                                <div
                                    className="bg-yellow-400 h-3 rounded-full transition-all duration-500"
                                    style={{ width: `${pendingPct}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">{pendingPct}% awaiting review</p>
                        </div>
                        <div className="pt-4 border-t grid grid-cols-3 text-center gap-2">
                            <div className="bg-blue-50 rounded-lg p-3">
                                <p className="text-xl font-bold text-blue-600">{stats.submissions.total}</p>
                                <p className="text-xs text-gray-500">Total</p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-3">
                                <p className="text-xl font-bold text-green-600">{stats.submissions.graded}</p>
                                <p className="text-xs text-gray-500">Graded</p>
                            </div>
                            <div className="bg-yellow-50 rounded-lg p-3">
                                <p className="text-xl font-bold text-yellow-600">{stats.submissions.pending}</p>
                                <p className="text-xs text-gray-500">Pending</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminHome;