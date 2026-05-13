// src/pages/teacher/TeacherSubmissions.jsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import useAssignments from '../../hooks/useAssignments';
import StudentSubmissionList from '../../components/teacher/StudentSubmissionList';
import GradingPanel from '../../components/teacher/GradingPanel';
import ExportButton from '../../components/teacher/ExportButton';
import { getSubmissionsByAssignment } from '../../services/submissionService';

const DivisionGroupedSubmissions = ({ submissions, onGrade }) => {
    const grouped = submissions.reduce((acc, s) => {
        const div = s.submittedBy?.division || 'Unknown';
        if (!acc[div]) acc[div] = [];
        acc[div].push(s);
        return acc;
    }, {});

    const divs = Object.keys(grouped).sort();

    if (!submissions.length) return (
        <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
            <p className="text-3xl mb-2">📭</p>
            <p>No submissions yet for this assignment.</p>
        </div>
    );

    return (
        <div className="space-y-4">
            {divs.map(div => (
                <div key={div} className="rounded-xl border overflow-hidden"
                    style={{ borderColor: 'var(--border)' }}>
                    <div className="px-4 py-2 flex items-center gap-2"
                        style={{ backgroundColor: 'var(--bg-page)' }}>
                        <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--division-label)' }}>
                            Division {div}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                            {grouped[div].length} submission{grouped[div].length > 1 ? 's' : ''}
                        </span>
                    </div>
                    <StudentSubmissionList submissions={grouped[div]} onGrade={onGrade} />
                </div>
            ))}
        </div>
    );
};

const TeacherSubmissions = () => {
    const { assignments } = useAssignments();
    const [selectedId, setSelectedId] = useState('');
    const [submissions, setSubmissions] = useState([]);
    const [subLoading, setSubLoading] = useState(false);
    const [gradingSubmission, setGradingSubmission] = useState(null);
    const [searchParams] = useSearchParams();

    const loadSubmissions = async (id) => {
        if (!id) return;
        try {
            setSubLoading(true);
            const data = await getSubmissionsByAssignment(id);
            setSubmissions(data.data || []);
        } catch { setSubmissions([]); }
        finally { setSubLoading(false); }
    };

    const onSelect = (e) => {
        setSelectedId(e.target.value);
        setGradingSubmission(null);
        loadSubmissions(e.target.value);
    };

    useEffect(() => {
        const id = searchParams.get('id');
        if (id) {
            setSelectedId(id);
            loadSubmissions(id);
        }
    }, []);

    const selectedA = assignments.find(a => a._id === selectedId);

    return (
        <div className="space-y-4">
            <div className="rounded-xl shadow-sm p-5 border-l-4 border-[#1E2A5E]"
                style={{ backgroundColor: 'var(--bg-card)' }}>
                <h1 className="text-xl font-bold" style={{ color: 'var(--text-heading)' }}>📬 Submissions & Grading</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                    Select an assignment to view and grade student submissions.
                </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
                <select value={selectedId} onChange={onSelect}
                    className="px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-violet-500"
                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                    <option value="">— Select Assignment —</option>
                    {assignments.map(a => (
                        <option key={a._id} value={a._id}>{a.title}</option>
                    ))}
                </select>

                {selectedId && (
                    <ExportButton assignmentId={selectedId} assignmentTitle={selectedA?.title} />
                )}
            </div>

            {!selectedId && (
                <p className="text-sm mt-8 text-center" style={{ color: 'var(--text-muted)' }}>
                    Select an assignment above to view submissions.
                </p>
            )}

            {selectedId && (
                <>
                    {subLoading
                        ? <p style={{ color: 'var(--text-muted)' }}>Loading submissions...</p>
                        : <DivisionGroupedSubmissions
                            submissions={submissions}
                            onGrade={setGradingSubmission}
                        />
                    }
                    <div className="mt-4">
                        <GradingPanel
                            submission={gradingSubmission}
                            onClose={() => setGradingSubmission(null)}
                            onGraded={() => loadSubmissions(selectedId)}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default TeacherSubmissions;