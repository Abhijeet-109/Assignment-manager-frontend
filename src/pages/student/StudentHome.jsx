import { useState, useEffect } from 'react';
import api from '../../services/api';
import Loading from '../../components/common/Loading';

const StatCard = ({ label, value, icon, color }) => (
    <div
        className="rounded-xl shadow-sm p-5 flex flex-col items-center gap-2 border-t-4"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: color }}
    >
        <span className="text-3xl">{icon}</span>
        <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{value ?? 0}</p>
        <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>{label}</p>
    </div>
);

const StudentHome = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('/dashboard/student')
            .then(res => setStats(res.data.data))
            .catch(() => setError('Failed to load dashboard.'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <Loading />;
    if (error) return <div className="text-red-500 p-4">{error}</div>;

    const progressPct = stats?.completionRate ?? 0;
    const circumference = 2 * Math.PI * 38;
    const offset = circumference * (1 - progressPct / 100);

    const statCards = [
        { label: 'Subjects', value: stats?.totalSubjects ?? 0, icon: '📘', color: '#3B82F6' },
        { label: 'Assignments', value: stats?.totalAssignments ?? 0, icon: '📝', color: '#8B5CF6' },
        { label: 'Completed', value: stats?.completedAssignments ?? 0, icon: '✅', color: '#10B981' },
        { label: 'Pending', value: stats?.pendingAssignments ?? 0, icon: '⏳', color: '#F59E0B' },
    ];

    return (
        <div className="space-y-6">

            {/* Welcome Banner — brand gradient, always stays */}
            <div
                className="relative overflow-hidden rounded-xl p-7 flex items-center justify-between"
                style={{ background: 'linear-gradient(135deg,#667eea 0%,#764ba2 50%,#f093fb 100%)' }}
            >
                <div>
                    <h1 className="text-white text-2xl font-bold mb-1">🎓 Student Dashboard</h1>
                    <p className="text-white/85 text-sm max-w-md leading-relaxed">
                        {stats?.pendingAssignments > 0
                            ? `You have ${stats.pendingAssignments} pending assignments. Keep going!`
                            : 'All caught up! Great work.'}
                    </p>
                </div>
                <div className="relative w-24 h-24 flex-shrink-0">
                    <svg width="96" height="96" viewBox="0 0 96 96" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="48" cy="48" r="38" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="7" />
                        <circle cx="48" cy="48" r="38" fill="none" stroke="rgba(255,255,255,0.9)"
                            strokeWidth="7" strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-white text-xl font-bold leading-none">{progressPct}%</span>
                        <span className="text-white/80 text-[9px] uppercase tracking-widest mt-1">Progress</span>
                    </div>
                </div>
            </div>

            {/* Stat Cards — same pattern as AdminHome */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map(c => <StatCard key={c.label} {...c} />)}
            </div>

            {/* Two Column Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Upcoming Deadlines */}
                <div className="rounded-xl shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--bg-card)' }}>
                    <div className="flex items-center justify-between bg-[#1E2A5E] px-5 py-3">
                        <h2 className="text-white font-semibold text-sm">📅 Upcoming Deadlines</h2>
                        <span className="text-blue-300 text-xs">
                            {stats?.upcomingDeadlines?.length ?? 0} due
                        </span>
                    </div>
                    <div className="p-4 space-y-2">
                        {!stats?.upcomingDeadlines?.length && (
                            <p className="text-center py-6 text-sm" style={{ color: 'var(--text-muted)' }}>
                                🎉 No upcoming deadlines!
                            </p>
                        )}
                        {stats?.upcomingDeadlines?.slice(0, 4).map((item, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-3 p-3 rounded-lg border transition-colors"
                                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-page)' }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--hover-row)'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--bg-page)'}
                            >
                                <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center text-base flex-shrink-0">📄</div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{item.title}</p>
                                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{item.subjectName}</p>
                                </div>
                                <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-amber-500 text-white whitespace-nowrap">
                                    {item.daysLeft === 0 ? 'Today' : item.daysLeft === 1 ? 'Tomorrow' : `in ${item.daysLeft}d`}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Subject Progress */}
                <div className="rounded-xl shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--bg-card)' }}>
                    <div className="bg-[#1E2A5E] px-5 py-3 flex items-center justify-between">
                        <h2 className="text-white font-semibold text-sm">🏆 Subject Progress</h2>
                        <span className="text-blue-300 text-xs">Top 5</span>
                    </div>
                    <div className="p-4 space-y-4">
                        {!stats?.subjectProgress?.length && (
                            <p className="text-center py-6 text-sm" style={{ color: 'var(--text-muted)' }}>
                                No subjects enrolled yet.
                            </p>
                        )}
                        {stats?.subjectProgress?.slice(0, 5).map((s, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span style={{ color: 'var(--text-primary)' }}>{s.subjectName}</span>
                                    <span style={{ color: 'var(--text-muted)' }}>{s.completed}/{s.total}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                        className="h-2.5 rounded-full transition-all duration-500"
                                        style={{
                                            width: `${s.percentage}%`,
                                            background: 'linear-gradient(90deg,#6366f1,#8b5cf6)'
                                        }}
                                    />
                                </div>
                                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.percentage}% complete</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentHome;