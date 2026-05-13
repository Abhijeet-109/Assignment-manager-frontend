import { useState, useEffect } from 'react';
import api from '../../services/api';
import Loading from '../../components/common/Loading';
import { useTheme } from '../../context/ThemeContext';

/* ─────────────────────────────────────────────
   Dark Theme: Floating Purple / Pink Orbs
───────────────────────────────────────────── */
const DarkAuroraLayer = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-xl">
        {/* Large violet orb — top-left */}
        <div style={{
            position: 'absolute',
            width: 320, height: 320,
            borderRadius: '50%',
            top: '-80px', left: '-80px',
            background: 'radial-gradient(circle, rgba(139,92,246,0.55) 0%, transparent 70%)',
            animation: 'orb-float-1 4s ease-in-out infinite',
            filter: 'blur(45px)',
        }} />
        {/* Pink / fuchsia orb — top-right */}
        <div style={{
            position: 'absolute',
            width: 240, height: 240,
            borderRadius: '50%',
            top: '-20px', right: '120px',
            background: 'radial-gradient(circle, rgba(240,147,251,0.45) 0%, transparent 70%)',
            animation: 'orb-float-2 5s ease-in-out infinite',
            filter: 'blur(38px)',
        }} />
        {/* Indigo orb — bottom-centre */}
        <div style={{
            position: 'absolute',
            width: 200, height: 200,
            borderRadius: '50%',
            bottom: '-50px', left: '38%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.5) 0%, transparent 70%)',
            animation: 'orb-float-3 6s ease-in-out infinite',
            filter: 'blur(35px)',
        }} />
        {/* Small accent — bottom-right */}
        <div style={{
            position: 'absolute',
            width: 140, height: 140,
            borderRadius: '50%',
            bottom: '-20px', right: '30px',
            background: 'radial-gradient(circle, rgba(167,139,250,0.4) 0%, transparent 70%)',
            animation: 'orb-float-2 4s ease-in-out infinite reverse',
            filter: 'blur(28px)',
        }} />
    </div>
);

/* ─────────────────────────────────────────────
   Light Theme: Soft Sky-Blue / Cyan Blobs
───────────────────────────────────────────── */
const LightAuroraLayer = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-xl">
        {/* White shimmer — top-left */}
        <div style={{
            position: 'absolute',
            width: 280, height: 280,
            borderRadius: '50%',
            top: '-60px', left: '-60px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)',
            animation: 'blob-drift-1 4s ease-in-out infinite',
            filter: 'blur(32px)',
        }} />
        {/* Cyan blob — bottom-right */}
        <div style={{
            position: 'absolute',
            width: 220, height: 220,
            borderRadius: '50%',
            bottom: '-40px', right: '80px',
            background: 'radial-gradient(circle, rgba(186,230,253,0.55) 0%, transparent 70%)',
            animation: 'blob-drift-2 5s ease-in-out infinite',
            filter: 'blur(28px)',
        }} />
        {/* Teal accent — top-right */}
        <div style={{
            position: 'absolute',
            width: 160, height: 160,
            borderRadius: '50%',
            top: '-10px', right: '20px',
            background: 'radial-gradient(circle, rgba(103,232,249,0.35) 0%, transparent 70%)',
            animation: 'blob-drift-1 6s ease-in-out infinite reverse',
            filter: 'blur(22px)',
        }} />
    </div>
);

/* ─────────────────────────────────────────────
   Stat Card
───────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
const StudentHome = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const { theme } = useTheme();
    const isDark = theme === 'dark';

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
        { label: 'Subjects', value: stats?.totalSubjects, icon: '📘', color: '#3B82F6' },
        { label: 'Assignments', value: stats?.totalAssignments, icon: '📝', color: '#8B5CF6' },
        { label: 'Completed', value: stats?.completedAssignments, icon: '✅', color: '#10B981' },
        { label: 'Pending', value: stats?.pendingAssignments, icon: '⏳', color: '#F59E0B' },
    ];

    /* ── Banner background per theme ── */
    const bannerBg = isDark
        ? 'linear-gradient(135deg, #1a0533 0%, #2d0a6e 50%, #1a0533 100%)'
        : 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #0284c7 100%)';

    return (
        <div className="space-y-6">

            {/* ── Welcome Banner ── */}
            <div
                className="relative overflow-hidden rounded-xl p-7 flex items-center justify-between"
                style={{ background: bannerBg, minHeight: '140px' }}
            >
                {/* Animated background layer */}
                {isDark ? <DarkAuroraLayer /> : <LightAuroraLayer />}

                {/* Text — sits above the animation */}
                <div className="relative z-10">
                    <h1 className="text-white text-2xl font-bold mb-1">🎓 Student Dashboard</h1>
                    <p className="text-white/85 text-sm max-w-md leading-relaxed">
                        {stats?.pendingAssignments > 0
                            ? `You have ${stats.pendingAssignments} pending assignments. Keep going!`
                            : 'All caught up! Great work.'}
                    </p>
                </div>

                {/* Progress Ring — sits above the animation */}
                <div className="relative z-10 w-24 h-24 flex-shrink-0">
                    <svg width="96" height="96" viewBox="0 0 96 96" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="48" cy="48" r="38" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="7" />
                        <circle
                            cx="48" cy="48" r="38"
                            fill="none"
                            stroke="rgba(255,255,255,0.9)"
                            strokeWidth="7"
                            strokeLinecap="round"
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

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map(c => <StatCard key={c.label} {...c} />)}
            </div>

            {/* ── Two Column Section ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Upcoming Deadlines */}
                <div className="rounded-xl shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--bg-card)' }}>
                    <div className="flex items-center justify-between px-5 py-3"
                        style={{ backgroundColor: 'var(--bg-sidebar)' }}>                        <h2 className="text-white font-semibold text-sm">📅 Upcoming Deadlines</h2>
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
                    <div className="flex items-center justify-between px-5 py-3"
                        style={{ backgroundColor: 'var(--bg-sidebar)' }}>                        <h2 className="text-white font-semibold text-sm">🏆 Subject Progress</h2>
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
