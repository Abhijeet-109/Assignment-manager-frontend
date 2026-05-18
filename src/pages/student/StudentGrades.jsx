import { useState, useEffect } from 'react';
import api from '../../services/api';
import Loading from '../../components/common/Loading';

const gradeLabel = pct => {
    if (pct >= 90) return { label: 'A', textColor: '#10B981', bg: '#D1FAE5' };
    if (pct >= 75) return { label: 'B', textColor: '#3B82F6', bg: '#DBEAFE' };
    if (pct >= 60) return { label: 'C', textColor: '#F59E0B', bg: '#FEF3C7' };
    return { label: 'F', textColor: '#EF4444', bg: '#FEE2E2' };
};

const StudentGrades = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/submissions/my')
            .then(res => setSubmissions(res.data.data || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const graded = submissions.filter(s => s.status === 'graded' && s.obtainedMarks != null);
    const avg = graded.length
        ? Math.round(graded.reduce((acc, s) => {
            const max = s.assignmentId?.maxMarks;
            return acc + (max ? (s.obtainedMarks / max) * 100 : 0);
        }, 0) / graded.length)
        : 0;

    if (loading) return <Loading />;

    return (
        <div className="space-y-5">

            {/* Header */}
            <div className="rounded-xl shadow-sm p-5 border-l-4 border-[#1E2A5E]" style={{ backgroundColor: 'var(--bg-card)' }}>
                <h1 className="text-xl font-bold" style={{ color: 'var(--text-heading)' }}>📊 My Grades</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Your graded submission results</p>
            </div>

            {/* Average Banner */}
            <div className="rounded-xl shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--bg-card)' }}>
                <div className="bg-[#1E2A5E] px-5 py-3">
                    <h2 className="text-white font-semibold text-sm">📈 Overall Performance</h2>
                </div>
                <div className="p-5 flex flex-wrap items-center sm:items-start text-center sm:text-left gap-6">
                    <div className="text-5xl font-bold flex-shrink-0" style={{
                        background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        {avg}%
                    </div>
                    <div className="flex-1 w-full sm:w-auto">
                        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Average Score</p>
                        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            Across {graded.length} graded submission{graded.length !== 1 ? 's' : ''}
                        </p>
                        <div className="mt-2 h-2.5 rounded-full overflow-hidden max-w-xs mx-auto sm:mx-0" style={{ backgroundColor: 'var(--border)' }}>
                            <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${avg}%`, background: 'linear-gradient(90deg,#6366f1,#8b5cf6)' }}
                            />
                        </div>
                    </div>
                    {/* Mini stat boxes */}
                    <div className="grid grid-cols-2 gap-2 flex-shrink-0 w-full sm:w-auto">
                        <div className="rounded-lg p-3 text-center" style={{ backgroundColor: 'var(--stat-blue-bg)' }}>
                            <p className="text-xl font-bold" style={{ color: 'var(--stat-blue-text)' }}>{graded.length}</p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Graded</p>
                        </div>
                        <div className="rounded-lg p-3 text-center" style={{ backgroundColor: 'var(--stat-blue-bg)' }}>
                            <p className="text-xl font-bold" style={{ color: 'var(--stat-amber-text)' }}>{submissions.length - graded.length}</p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Pending</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grade List */}
            <div className="rounded-xl shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--bg-card)' }}>
                <div className="bg-[#1E2A5E] px-5 py-3">
                    <h2 className="text-white font-semibold text-sm">📝 Submission Results</h2>
                </div>
                {graded.length === 0 ? (
                    <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
                        <p className="font-medium">No graded submissions yet</p>
                        <p className="text-sm mt-1">Your teacher hasn't graded any submissions</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left border-b" style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>
                                    <th className="px-5 py-2">Grade</th>
                                    <th className="px-5 py-2 whitespace-nowrap">Assignment</th>
                                    <th className="px-5 py-2 whitespace-nowrap">Subject</th>
                                    <th className="px-5 py-2 text-right">Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {graded.map(s => {
                                    const max = s.assignmentId?.maxMarks;
                                    const pct = max ? Math.round((s.obtainedMarks / max) * 100) : 0;
                                    const { label, textColor, bg } = gradeLabel(pct);
                                    return (
                                        <tr
                                            key={s._id}
                                            className="border-b transition-colors"
                                            style={{ borderColor: 'var(--border)' }}
                                            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--hover-row)'}
                                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            <td className="px-5 py-3">
                                                <span
                                                    className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold"
                                                    style={{ backgroundColor: bg, color: textColor }}
                                                >
                                                    {label}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 whitespace-nowrap">
                                                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                                                    {s.assignmentId?.title || 'Assignment'}
                                                </p>
                                                {s.feedback && (
                                                    <p className="text-xs mt-0.5 italic" style={{ color: 'var(--text-muted)' }}>"{s.feedback}"</p>
                                                )}
                                            </td>
                                            <td className="px-5 py-3 whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                                                {s.assignmentId?.subject?.name || '—'}                                        </td>
                                            <td className="px-5 py-3 text-right whitespace-nowrap">
                                                <p className="font-bold" style={{ color: 'var(--text-primary)' }}>
                                                    {s.obtainedMarks}
                                                    <span className="font-normal text-xs ml-1" style={{ color: 'var(--text-muted)' }}>/ {s.assignmentId?.maxMarks ?? '—'}</span>                                            </p>
                                                <p className="text-xs font-semibold mt-0.5" style={{ color: textColor }}>{pct}%</p>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentGrades;