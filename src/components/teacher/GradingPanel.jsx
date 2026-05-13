// src/components/teacher/GradingPanel.jsx
import { useState, useEffect } from 'react';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { gradeSubmission, updateGrade } from '../../services/submissionService';
import { formatDate } from '../../utils/dateFormatter';

const GradingPanel = ({ submission, onClose, onGraded }) => {
    const [marks, setMarks] = useState('');
    const [feedback, setFeedback] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (submission) {
            setMarks(submission.obtainedMarks ?? '');
            setFeedback(submission.feedback ?? '');
            setError('');
        }
    }, [submission]);

    const isAlreadyGraded = submission?.status === 'graded' || submission?.status === 'rework';
    const studentName = `${submission?.submittedBy?.firstName || ''} ${submission?.submittedBy?.lastName || ''}`.trim() || 'Student';
    const studentEmail = submission?.submittedBy?.email || '—';
    const maxMarks = submission?.assignmentId?.maxMarks ?? '—';
    const submittedDate = submission?.submittedAt ? formatDate(submission.submittedAt) : '—';
    const isLate = submission?.isLate;

    const fileUrl = submission?.file?.fileUrl
        ? submission.file.fileUrl.startsWith('/uploads/')
            ? `${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')}${submission.file.fileUrl}`
            : submission.file.fileUrl
        : null;

    const submit = async () => {
        if (marks === '' || Number(marks) < 0) {
            setError('Enter valid marks.');
            return;
        }
        try {
            setLoading(true);
            setError('');
            const payload = { obtainedMarks: Number(marks), feedback };
            if (isAlreadyGraded) {
                await updateGrade(submission._id, payload);
            } else {
                await gradeSubmission(submission._id, payload);
            }
            onGraded();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Grading failed.');
        } finally {
            setLoading(false);
        }
    };

    const inputCls = 'w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-violet-500';

    return (
        <Modal
            isOpen={!!submission}
            onClose={onClose}
            title={`${isAlreadyGraded ? 'Re-grade' : 'Grade'} Submission`}
        >
            {/* Student Info Row */}
            <div className="flex items-center gap-3 mb-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-page)' }}>
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-[#1E2A5E] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {studentName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{studentName}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{studentEmail}</p>
                </div>
                {/* Remark badge */}
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${isLate ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {isLate ? 'Late' : 'On Time'}
                </span>
            </div>

            {/* Submitted date + View File row */}
            <div className="flex items-center justify-between mb-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                <span>📅 Submitted: <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{submittedDate}</span></span>
                {fileUrl
                    ? <a href={fileUrl} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1 text-blue-500 hover:underline font-medium">
                        📄 View File
                    </a>
                    : <span>No file</span>
                }
            </div>

            <hr style={{ borderColor: 'var(--border)' }} className="mb-4" />

            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

            {/* Marks + Feedback */}
            <div className="space-y-3">
                <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                        Marks <span className="font-normal text-xs" style={{ color: 'var(--text-muted)' }}>(out of {maxMarks})</span>
                    </label>
                    <input
                        type="number"
                        value={marks}
                        onChange={e => setMarks(e.target.value)}
                        className={inputCls}
                        style={{ backgroundColor: 'var(--bg-page)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                        placeholder={`0 – ${maxMarks}`}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                        Feedback <span className="font-normal text-xs" style={{ color: 'var(--text-muted)' }}>(optional)</span>
                    </label>
                    <textarea
                        value={feedback}
                        onChange={e => setFeedback(e.target.value)}
                        rows={3}
                        className={inputCls}
                        style={{ backgroundColor: 'var(--bg-page)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                        placeholder="Well done! Consider improving..."
                    />
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button variant="ghost" onClick={onClose}>Cancel</Button>
                <Button variant="primary" onClick={submit} loading={loading}>
                    {isAlreadyGraded ? 'Update Grade' : 'Submit Grade'}
                </Button>
            </div>
        </Modal>
    );
};

export default GradingPanel;