import { useState, useEffect } from 'react';
import api from '../../services/api';
import Loading from '../../components/common/Loading';

const STATUS = {
    overdue: { label: 'Overdue', pill: 'bg-red-100 text-red-700', border: 'border-l-4 border-red-500' },
    urgent: { label: 'Due Soon', pill: 'bg-amber-100 text-amber-700', border: 'border-l-4 border-amber-400' },
    soon: { label: 'This Week', pill: 'bg-blue-100 text-blue-700', border: 'border-l-4 border-blue-500' },
    normal: { label: 'Upcoming', pill: 'bg-gray-100 text-gray-600', border: '' },
    submitted: { label: 'Submitted', pill: 'bg-green-100 text-green-700', border: 'border-l-4 border-emerald-500' },
};

const getStatus = (dueDate, submissionStatus) => {
    if (submissionStatus === 'submitted' || submissionStatus === 'graded') return 'submitted';
    const diff = Math.ceil((new Date(dueDate) - new Date()) / 86400000);
    if (diff < 0) return 'overdue';
    if (diff <= 2) return 'urgent';
    if (diff <= 7) return 'soon';
    return 'normal';
};

const StudentAssignments = () => {
    const [assignments, setAssignments] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/student-assignments/my')
            .then(res => setAssignments(res.data.data || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const enriched = assignments.map(a => ({
        ...a,
        _status: getStatus(a.dueDate, a.submissionStatus),
    }));

    const filtered = enriched.filter(a => {
        if (filter === 'pending') return a._status !== 'submitted' && a._status !== 'overdue';
        if (filter === 'completed') return a._status === 'submitted';
        if (filter === 'overdue') return a._status === 'overdue';
        return true;
    });

    const counts = {
        total: enriched.length,
        pending: enriched.filter(a => a._status !== 'submitted').length,
        completed: enriched.filter(a => a._status === 'submitted').length,
        overdue: enriched.filter(a => a._status === 'overdue').length,
    };

    if (loading) return <Loading />;

    return (
        <div className="space-y-5">

            {/* Header */}
            <div className="rounded-xl shadow-sm p-5 border-l-4 border-[#1E2A5E]" style={{ backgroundColor: 'var(--bg-card)' }}>
                <h1 className="text-xl font-bold text-[#1E2A5E]">📋 All Assignments</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Track and submit your assignments</p>
            </div>

            {/* Stat Strip — border-t-4 pattern same as AdminHome StatCard */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Total', val: counts.total, color: '#6366F1' },
                    { label: 'Pending', val: counts.pending, color: '#F59E0B' },
                    { label: 'Submitted', val: counts.completed, color: '#10B981' },
                    { label: 'Overdue', val: counts.overdue, color: '#EF4444' },
                ].map(({ label, val, color }) => (
                    <div
                        key={label}
                        className="rounded-xl shadow-sm p-4 text-center border-t-4"
                        style={{ backgroundColor: 'var(--bg-card)', borderColor: color }}
                    >
                        <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{val}</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
                    </div>
                ))}
            </div>

            {/* Filter Controls */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex gap-2">
                    {['all', 'pending', 'completed', 'overdue'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all duration-150 capitalize
                                ${filter === f
                                    ? 'bg-[#1E2A5E] text-white border-transparent'
                                    : 'border-gray-300 text-gray-600 hover:border-[#1E2A5E] hover:text-[#1E2A5E]'
                                }`}
                            style={filter !== f ? { borderColor: 'var(--border)', color: 'var(--text-muted)' } : {}}
                        >
                            {f}
                        </button>
                    ))}
                </div>
                <select
                    className="text-xs rounded-lg px-3 py-2 border focus:outline-none"
                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                >
                    <option>Sort: Due Date</option>
                    <option>Sort: Subject</option>
                    <option>Sort: Title</option>
                </select>
            </div>

            {/* Assignment List */}
            <div className="space-y-3">
                {filtered.length === 0 && (
                    <div
                        className="text-center py-16 rounded-xl border-2 border-dashed"
                        style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                    >
                        <p className="font-medium">No assignments found</p>
                        <p className="text-sm mt-1">Try a different filter</p>
                    </div>
                )}
                {filtered.map(a => {
                    const s = STATUS[a._status];
                    const isDone = a._status === 'submitted';
                    return (
                        <div
                            key={a._id}
                            className={`${s.border} rounded-xl p-4 flex items-center gap-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md`}
                            style={{ backgroundColor: 'var(--bg-card)' }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--hover-row)'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--bg-card)'}
                        >
                            {/* Checkbox */}
                            <div className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center text-xs font-bold
                                ${isDone ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-400'}`}>
                                {isDone && '✓'}
                            </div>
                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                                    <span
                                        className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
                                        style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-muted)' }}
                                    >
                                        {a.subjectName || a.subject?.name || 'Subject'}
                                    </span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide ${s.pill}`}>
                                        {s.label}
                                    </span>
                                </div>
                                <p
                                    className={`text-sm font-semibold ${isDone ? 'line-through' : ''}`}
                                    style={{ color: isDone ? 'var(--text-muted)' : 'var(--text-primary)' }}
                                >
                                    {a.title}
                                </p>
                                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                    📅 Due: {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                            {!isDone && (
                                <button className="bg-[#1E2A5E] hover:bg-[#2D3A7C] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all duration-200 flex-shrink-0 hover:-translate-y-0.5">
                                    Submit
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StudentAssignments;