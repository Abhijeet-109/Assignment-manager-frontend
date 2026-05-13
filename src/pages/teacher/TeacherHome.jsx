// src/pages/teacher/TeacherHome.jsx
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Loading from '../../components/common/Loading';
import { formatDate } from '../../utils/dateFormatter';

const StatCard = ({ label, value, icon, color }) => (
    <div className="rounded-xl shadow-sm p-5 flex flex-col items-center gap-2 border-t-4"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: color }}>
        <span className="text-3xl">{icon}</span>
        <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{value ?? 0}</p>
        <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>{label}</p>
    </div>
);

const DIVISIONS = [
    { value: '', label: 'All' },
    { value: 'A', label: 'Div A' },
    { value: 'B', label: 'Div B' },
    { value: 'C', label: 'Div C' },
];

const TeacherHome = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [divFilter, setDivFilter] = useState(''); // '' = All

    const fetchDashboard = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const params = divFilter ? `?division=${divFilter}` : '';
            const r = await api.get(`/dashboard/teacher${params}`);
            setStats(r.data.data);
        } catch {
            setError('Failed to load dashboard.');
        } finally {
            setLoading(false);
        }
    }, [divFilter]);

    useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

    const filterBtn = 'px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors';
    const activeBtn = 'bg-[#1E2A5E] text-white border-[#1E2A5E]';
    const inactiveBtn = 'border-[var(--filter-btn-border)] text-[var(--filter-btn-color)] hover:border-[#1E2A5E]';

    const divisionLabel = divFilter ? `Div ${divFilter}` : 'All Divisions';

    return (
        <div className="space-y-6">
            {/* Title */}
            <div className="rounded-xl shadow-sm p-5 border-l-4 border-[#1E2A5E]"
                style={{ backgroundColor: 'var(--bg-card)' }}>
                <h1 className="text-xl font-bold" style={{ color: 'var(--text-heading)' }}>👨‍🏫 Teacher Dashboard</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                    Here's a summary of your assignments and student progress.
                </p>
            </div>

            {/* Division Filter */}
            <div className="rounded-xl p-4 border flex items-center gap-4"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                <span className="text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                    Division:
                </span>
                {DIVISIONS.map(d => (
                    <button key={d.value} onClick={() => setDivFilter(d.value)}
                        className={`${filterBtn} ${divFilter === d.value ? activeBtn : inactiveBtn}`}>
                        {d.label}
                    </button>

                ))}
                {divFilter && (
                    <span className="ml-auto text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                        Showing: {divisionLabel}
                    </span>
                )}
            </div>

            {loading && <Loading />}
            {error && <div className="text-red-500 p-4">{error}</div>}

            {!loading && stats && (() => {
                const { totalAssignments, assignments = [], submissions } = stats;
                const total = submissions.total || 0;
                const graded = submissions.graded || 0;
                const pending = submissions.pending || 0;
                const gradedPct = total > 0 ? Math.round((graded / total) * 100) : 0;
                const pendingPct = total > 0 ? Math.round((pending / total) * 100) : 0;

                const statCards = [
                    { label: `My Assignments${divFilter ? ` (Div ${divFilter})` : ''}`, value: totalAssignments, icon: '📋', color: '#3B82F6' },
                    { label: 'Total Submissions', value: total, icon: '📤', color: '#10B981' },
                    { label: 'Pending Review', value: pending, icon: '⏳', color: '#F59E0B' },
                    { label: 'Graded', value: graded, icon: '✅', color: '#8B5CF6' },
                ];

                return (
                    <>
                        {/* Stat Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {statCards.map(c => <StatCard key={c.label} {...c} />)}
                        </div>

                        {/* Bottom Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                            {/* Recent Assignments */}
                            <div className="rounded-xl shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--bg-card)' }}>
                                <div className="flex items-center justify-between bg-[#1E2A5E] px-5 py-3">
                                    <h2 className="text-white font-semibold text-sm">
                                        📋 Recent Assignments {divFilter ? `— Div ${divFilter}` : ''}
                                    </h2>
                                    <a href="/teacher/assignments" className="text-blue-300 text-xs hover:underline">View All</a>
                                </div>
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left border-b" style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>
                                            <th className="px-4 py-2">Title</th>
                                            <th className="px-4 py-2">Due</th>
                                            <th className="px-4 py-2">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {assignments.slice(0, 5).map(a => {
                                            const overdue = new Date(a.dueDate) < new Date();
                                            return (
                                                <tr key={a._id} className="border-b"
                                                    style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--hover-row)'}
                                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                                    <td className="px-4 py-3 font-medium">{a.title}</td>
                                                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                                                        {formatDate(a.dueDate)}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${overdue ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                            {overdue ? 'Overdue' : 'Active'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {!assignments.length && (
                                            <tr>
                                                <td colSpan={3} className="px-4 py-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                                                    No assignments {divFilter ? `for Div ${divFilter}` : 'yet'}.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Submission Progress */}
                            <div className="rounded-xl shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--bg-card)' }}>
                                <div className="bg-[#1E2A5E] px-5 py-3">
                                    <h2 className="text-white font-semibold text-sm">
                                        📊 Submission Progress {divFilter ? `— Div ${divFilter}` : ''}
                                    </h2>
                                </div>
                                <div className="p-5 space-y-5">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
                                            <span>Graded</span>
                                            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{graded} / {total}</span>
                                        </div>
                                        <div className="w-full rounded-full h-3" style={{ backgroundColor: 'var(--border)' }}>
                                            <div className="bg-green-500 h-3 rounded-full transition-all duration-500"
                                                style={{ width: `${gradedPct}%` }} />
                                        </div>
                                        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{gradedPct}% graded</p>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
                                            <span>Pending Review</span>
                                            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{pending} / {total}</span>
                                        </div>
                                        <div className="w-full rounded-full h-3" style={{ backgroundColor: 'var(--border)' }}>
                                            <div className="bg-yellow-400 h-3 rounded-full transition-all duration-500"
                                                style={{ width: `${pendingPct}%` }} />
                                        </div>
                                        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{pendingPct}% awaiting review</p>
                                    </div>
                                    <div className="pt-4 border-t grid grid-cols-3 text-center gap-2" style={{ borderColor: 'var(--border)' }}>
                                        <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--stat-blue-bg)' }}>
                                            <p className="text-xl font-bold" style={{ color: 'var(--stat-blue-text)' }}>{total}</p>
                                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total</p>
                                        </div>
                                        <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--stat-blue-bg)' }}>
                                            <p className="text-xl font-bold" style={{ color: 'var(--stat-green-text)' }}>{graded}</p>
                                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Graded</p>
                                        </div>
                                        <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--stat-blue-bg)' }}>
                                            <p className="text-xl font-bold" style={{ color: 'var(--stat-amber-text)' }}>{pending}</p>
                                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Pending</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                );
            })()}
        </div>
    );
};

export default TeacherHome;
