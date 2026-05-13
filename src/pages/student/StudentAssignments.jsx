import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import Loading from '../../components/common/Loading';

// ─── Helpers ────────────────────────────────────────────────────────────────
const getDueBadge = (dueDate, subStatus) => {
    if (subStatus === 'graded') return { label: 'Graded', cls: 'bg-purple-100 text-purple-700', border: '#8B5CF6' };
    if (subStatus === 'rework') return { label: 'Rework ', cls: 'bg-orange-100 text-orange-700', border: '#F97316' };
    if (subStatus === 'submitted') return { label: 'Submitted', cls: 'bg-green-100 text-green-700', border: '#10B981' };
    const diff = Math.ceil((new Date(dueDate) - new Date()) / 86400000);
    if (diff < 0) return { label: 'Overdue', cls: 'bg-red-100 text-red-700', border: '#EF4444' };
    if (diff <= 2) return { label: 'Due Soon', cls: 'bg-amber-100 text-amber-700', border: '#F59E0B' };
    if (diff <= 7) return { label: 'This Week', cls: 'bg-blue-100 text-blue-700', border: '#3B82F6' };
    return { label: 'Upcoming', cls: 'bg-gray-100 text-gray-600', border: '#6366F1' };
};

// ─── PDF/File Viewer Modal ───────────────────────────────────────────────────
const ViewerModal = ({ assignment, onClose }) => {
    const fileUrl = assignment.assignmentId?.fileUrl;
    const isLocal = fileUrl && fileUrl.startsWith('/uploads/');
    const SERVER_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
    const fullUrl = isLocal ? `${SERVER_BASE}${fileUrl}` : fileUrl;
    const isPdf = fullUrl?.toLowerCase().endsWith('.pdf') || fullUrl?.includes('pdf');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                style={{ backgroundColor: 'var(--bg-card)' }}>
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 bg-[#1E2A5E] flex-shrink-0">
                    <div>
                        <h2 className="text-white font-bold text-sm">
                            📄 {assignment.assignmentId?.title}
                        </h2>
                        <p className="text-blue-300 text-xs mt-0.5">
                            Max: {assignment.assignmentId?.maxMarks} marks &nbsp;|&nbsp;
                            Due: {assignment.assignmentId?.dueDate
                                ? new Date(assignment.assignmentId.dueDate).toLocaleDateString()
                                : 'N/A'}
                        </p>
                    </div>
                    <button onClick={onClose}
                        className="text-white/70 hover:text-white text-2xl leading-none transition-colors">×</button>
                </div>

                {/* Description */}
                {assignment.assignmentId?.description && (
                    <div className="px-5 py-3 border-b flex-shrink-0"
                        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-page)' }}>
                        <p className="text-xs font-semibold uppercase tracking-wider mb-1"
                            style={{ color: 'var(--text-muted)' }}>Description</p>
                        <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                            {assignment.assignmentId.description}
                        </p>
                    </div>
                )}

                {/* File viewer */}
                <div className="flex-1 overflow-hidden">
                    {!fullUrl ? (
                        <div className="h-full flex flex-col items-center justify-center"
                            style={{ color: 'var(--text-muted)' }}>
                            <p className="text-4xl mb-3">📭</p>
                            <p className="font-medium">No file attached to this assignment</p>
                            <p className="text-sm mt-1">Teacher has not uploaded a document</p>
                        </div>
                    ) : isPdf ? (
                        <iframe
                            src={fullUrl}
                            className="w-full h-full border-0"
                            title="Assignment PDF"
                        />
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center gap-4"
                            style={{ color: 'var(--text-muted)' }}>
                            <p className="text-4xl">📎</p>
                            <p className="text-sm">File cannot be previewed in browser</p>
                            <a href={fullUrl} target="_blank" rel="noopener noreferrer"
                                className="bg-[#1E2A5E] hover:bg-[#2D3A7C] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all">
                                ⬇ Download File
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ─── Submit Modal ────────────────────────────────────────────────────────────
const SubmitModal = ({ assignment, onClose, onSuccess }) => {
    const [file, setFile] = useState(null);
    const [fileUrl, setFileUrl] = useState('');
    const [useUrl, setUseUrl] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const fileRef = useRef(null);

    const handleSubmit = async () => {
        setError('');

        if (!useUrl && !file) { setError('Please attach a file'); return; }
        if (useUrl && !fileUrl.trim()) { setError('Please enter a valid URL'); return; }

        setSubmitting(true);
        try {
            const assignmentId = assignment.assignmentId?._id || assignment.assignmentId;

            if (useUrl) {
                // URL submission as JSON
                await api.post('/submissions', {
                    assignmentId,
                    fileUrl: fileUrl.trim(),
                    fileName: 'link-submission',
                    fileType: 'link',
                });
            } else {
                // File upload as multipart
                const formData = new FormData();
                formData.append('assignmentId', assignmentId);
                formData.append('file', file);
                await api.post('/submissions', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Submission failed');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4"
                style={{ backgroundColor: 'var(--bg-card)' }}>
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-[#1E2A5E]">📤 Submit Assignment</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
                </div>

                {/* Assignment Info */}
                <div className="rounded-lg p-3 border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-page)' }}>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {assignment.assignmentId?.title}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        📅 Due: {assignment.assignmentId?.dueDate
                            ? new Date(assignment.assignmentId.dueDate).toLocaleDateString()
                            : 'N/A'}
                        &nbsp;|&nbsp;Max: {assignment.assignmentId?.maxMarks} marks
                    </p>
                </div>

                {/* Toggle */}
                <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
                    <button
                        onClick={() => setUseUrl(false)}
                        className={`flex-1 py-2 text-xs font-semibold transition-colors ${!useUrl ? 'bg-[#1E2A5E] text-white' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        📎 Upload File
                    </button>
                    <button
                        onClick={() => setUseUrl(true)}
                        className={`flex-1 py-2 text-xs font-semibold transition-colors ${useUrl ? 'bg-[#1E2A5E] text-white' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        🔗 Submit URL
                    </button>
                </div>

                {/* File upload */}
                {!useUrl ? (
                    <div>
                        <input
                            ref={fileRef}
                            type="file"
                            className="hidden"
                            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip,.txt"
                            onChange={e => setFile(e.target.files[0])}
                        />
                        <div
                            onClick={() => fileRef.current.click()}
                            className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors hover:border-indigo-400"
                            style={{ borderColor: file ? '#10B981' : 'var(--border)' }}
                        >
                            {file ? (
                                <div>
                                    <p className="text-2xl mb-1">✅</p>
                                    <p className="text-sm font-semibold text-emerald-600">{file.name}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {(file.size / 1024).toFixed(1)} KB — click to change
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-3xl mb-2">📎</p>
                                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                        Click to attach file
                                    </p>
                                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                                        PDF, DOC, DOCX, PNG, JPG, ZIP — max 10MB
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                            Submission URL (Google Drive, GitHub, etc.)
                        </label>
                        <input
                            type="text"
                            value={fileUrl}
                            onChange={e => setFileUrl(e.target.value)}
                            placeholder="https://drive.google.com/..."
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            style={{ backgroundColor: 'var(--bg-page)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                        />
                    </div>
                )}

                {error && <p className="text-red-500 text-xs">{error}</p>}

                <div className="flex gap-3 pt-1">
                    <button onClick={onClose}
                        className="flex-1 px-4 py-2 rounded-lg border text-sm font-medium"
                        style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                        Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={submitting}
                        className="flex-1 bg-[#1E2A5E] hover:bg-[#2D3A7C] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all disabled:opacity-60">
                        {submitting ? 'Submitting…' : 'Submit'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Assignment Card ─────────────────────────────────────────────────────────
const AssignmentCard = ({ record, onSubmitClick, onViewClick }) => {
    const badge = getDueBadge(record.assignmentId?.dueDate, record.submissionId?.status);
    const isDone = record.submissionId?.status === 'submitted' || record.submissionId?.status === 'graded';
    const isRework = record.submissionId?.status === 'rework'; const score = record.submissionId?.obtainedMarks;
    const max = record.assignmentId?.maxMarks;

    return (
        <div
            className="rounded-xl shadow-sm overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            style={{ backgroundColor: 'var(--bg-card)', borderLeft: `4px solid ${badge.border}` }}
        >
            <div className="p-5">
                {/* Top row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
                            {record.assignmentId?.subject?.name || '—'}
                        </p>
                        <h3 className="text-base font-bold leading-snug" style={{ color: 'var(--text-primary)' }}>
                            {record.assignmentId?.title || 'Untitled'}
                        </h3>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide flex-shrink-0 ${badge.cls}`}>
                        {badge.label}
                    </span>
                </div>

                {/* Description preview */}
                {record.assignmentId?.description && (
                    <p className="text-xs mb-3 line-clamp-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                        {record.assignmentId.description}
                    </p>
                )}

                {/* Meta row */}
                <div className="flex items-center gap-4 text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
                    <span>📅 {record.assignmentId?.dueDate
                        ? new Date(record.assignmentId.dueDate).toLocaleDateString()
                        : 'N/A'}
                    </span>
                    <span>🏅 Max: {max}</span>
                    {record.submissionId?.isLate && (
                        <span className="text-red-500 font-semibold">⚠ Late</span>
                    )}
                    {badge.label === 'Graded' && score != null && (
                        <span className="font-bold text-purple-600">🏆 {score}/{max}</span>
                    )}
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onViewClick(record)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg border text-xs font-semibold transition-all hover:border-[#1E2A5E] hover:text-[#1E2A5E]"
                        style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Details
                    </button>
                    {!isDone ? (
                        <button
                            onClick={() => onSubmitClick(record)}
                            className={`flex items-center gap-1.5 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all hover:-translate-y-0.5 ${isRework ? 'bg-orange-500 hover:bg-orange-600' : 'bg-[#1E2A5E] hover:bg-[#2D3A7C]'
                                }`}
                        >
                            {isRework ? '🔄 Resubmit' : '📤 Submit'}
                        </button>
                    ) : (
                        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 px-3 py-2 bg-emerald-50 rounded-lg">
                            ✓ {badge.label}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

// ─── Main Page ───────────────────────────────────────────────────────────────
const StudentAssignments = () => {
    const [assignments, setAssignments] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [submitTarget, setSubmitTarget] = useState(null);
    const [viewTarget, setViewTarget] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');

    const fetchAssignments = () => {
        setLoading(true);
        api.get('/student-assignments/my')
            .then(res => setAssignments((res.data.data || []).filter(a => a.assignmentId !== null)))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchAssignments(); }, []);

    const handleSubmitSuccess = () => {
        setSubmitTarget(null);
        setSuccessMsg('✅ Assignment submitted successfully!');
        setTimeout(() => setSuccessMsg(''), 3500);
        fetchAssignments();
    };

    // Compute status for each record
    const enriched = assignments.map(a => ({
        ...a,
        _badge: getDueBadge(a.assignmentId?.dueDate, a.submissionId?.status),
    }));

    const filtered = enriched.filter(a => {
        const s = a.submissionId?.status;
        if (filter === 'pending') return s !== 'submitted' && s !== 'graded';
        if (filter === 'completed') return s === 'submitted' || s === 'graded';
        if (filter === 'overdue') return a._badge.label === 'Overdue';
        return true;
    });

    const counts = {
        total: enriched.length,
        pending: enriched.filter(a => { const s = a.submissionId?.status; return s !== 'submitted' && s !== 'graded'; }).length,
        completed: enriched.filter(a => { const s = a.submissionId?.status; return s === 'submitted' || s === 'graded'; }).length,
        overdue: enriched.filter(a => a._badge.label === 'Overdue').length,
    };

    if (loading) return <Loading />;

    return (
        <div className="space-y-5">
            {submitTarget && (
                <SubmitModal
                    assignment={submitTarget}
                    onClose={() => setSubmitTarget(null)}
                    onSuccess={handleSubmitSuccess}
                />
            )}
            {viewTarget && (
                <ViewerModal
                    assignment={viewTarget}
                    onClose={() => setViewTarget(null)}
                />
            )}

            {successMsg && (
                <div className="rounded-lg px-4 py-3 bg-green-50 border border-green-200 text-green-700 text-sm font-medium">
                    {successMsg}
                </div>
            )}

            {/* Header */}
            <div className="rounded-xl shadow-sm p-5 border-l-4 border-[#1E2A5E]"
                style={{ backgroundColor: 'var(--bg-card)' }}>
                <h1 className="text-xl font-bold" style={{ color: 'var(--text-heading)' }}>📋 All Assignments</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                    View assignment details and submit your work
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Total', val: counts.total, color: '#6366F1' },
                    { label: 'Pending', val: counts.pending, color: '#F59E0B' },
                    { label: 'Submitted', val: counts.completed, color: '#10B981' },
                    { label: 'Overdue', val: counts.overdue, color: '#EF4444' },
                ].map(({ label, val, color }) => (
                    <div key={label} className="rounded-xl shadow-sm p-4 text-center border-t-4"
                        style={{ backgroundColor: 'var(--bg-card)', borderColor: color }}>
                        <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{val}</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex gap-2">
                {['all', 'pending', 'completed', 'overdue'].map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all capitalize
                            ${filter === f
                                ? 'bg-[#1E2A5E] text-white border-transparent'
                                : 'hover:border-[#858ca8] hover:text-[#b7b8bf]'

                            }`}>
                        {f}
                    </button>
                ))}
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filtered.length === 0 && (
                    <div className="col-span-2 text-center py-16 rounded-xl border-2 border-dashed"
                        style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                        <p className="font-medium">No assignments found</p>
                        <p className="text-sm mt-1">Try a different filter</p>
                    </div>
                )}
                {filtered.map(a => (
                    <AssignmentCard
                        key={a._id}
                        record={a}
                        onSubmitClick={setSubmitTarget}
                        onViewClick={setViewTarget}
                    />
                ))}
            </div>
        </div>
    );
};

export default StudentAssignments;  