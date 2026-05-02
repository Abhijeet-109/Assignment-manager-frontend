// src/components/teacher/GradingPanel.jsx
import { useState, useEffect } from 'react';
import Button from '../common/Button';
import { gradeSubmission, updateGrade } from '../../services/submissionService';

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

    if (!submission) return null;

    const isAlreadyGraded = submission.status === 'graded' || submission.status === 'rework';
    const studentName = submission.submittedBy?.name || submission.submittedBy?.email || 'Student';
    const maxMarks = submission.assignmentId?.maxMarks ?? '—';

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
        <div className="rounded-xl p-5 shadow-sm border-l-4 border-violet-500 space-y-4"
            style={{ backgroundColor: 'var(--bg-card)' }}>
            <div className="flex justify-between items-center">
                <h3 className="font-semibold" style={{ color: 'var(--text-heading)' }}>
                    {isAlreadyGraded ? 'Re-grade' : 'Grade'} — {studentName}
                </h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                    Marks (out of {maxMarks})
                </label>
                <input type="number" value={marks} onChange={e => setMarks(e.target.value)}
                    className={inputCls}
                    style={{ backgroundColor: 'var(--bg-page)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                    placeholder="e.g. 85" />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                    Feedback (optional)
                </label>
                <textarea value={feedback} onChange={e => setFeedback(e.target.value)} rows={3}
                    className={inputCls}
                    style={{ backgroundColor: 'var(--bg-page)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                    placeholder="Well done! Consider improving..." />
            </div>

            <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={onClose}>Cancel</Button>
                <Button variant="primary" onClick={submit} loading={loading}>
                    {isAlreadyGraded ? 'Update Grade' : 'Submit Grade'}
                </Button>
            </div>
        </div>
    );
};

export default GradingPanel;