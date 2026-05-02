import { formatDate } from '../../utils/dateFormatter';

const badge = (status) => {
    const map = {
        graded: 'bg-green-100 text-green-700',
        pending: 'bg-yellow-100 text-yellow-700',
    };
    return map[status] || 'bg-gray-100 text-gray-600';
};

const StudentSubmissionList = ({ submissions, onGrade }) => {
    if (!submissions.length) {
        return (
            <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
                <p className="text-3xl mb-2">📭</p>
                <p>No submissions yet for this assignment.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-xl">
            <table className="w-full text-sm">
                <thead>
                    <tr style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-muted)' }}>
                        <th className="text-left px-4 py-3 font-medium">Student</th>
                        <th className="text-left px-4 py-3 font-medium">Email</th>
                        <th className="text-left px-4 py-3 font-medium">Submitted</th>
                        <th className="text-left px-4 py-3 font-medium">File</th>
                        <th className="text-left px-4 py-3 font-medium">Status</th>
                        <th className="text-left px-4 py-3 font-medium">Marks</th>
                        <th className="text-left px-4 py-3 font-medium">Action</th>
                        <th className="text-left px-4 py-3 font-medium">Remark</th>
                    </tr>
                </thead>
                <tbody>
                    {submissions.map((s) => (
                        <tr key={s._id} className="border-t" style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                            <td className="px-4 py-3 font-medium">
                                {s.submittedBy?.firstName || '—'} {s.submittedBy?.lastName}
                            </td>
                            <td className="px-1 py-3 font-medium">
                                {s.submittedBy?.email || '—'}
                            </td>
                            <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>
                                {formatDate(s.submittedAt)}
                            </td>
                            <td className="px-4 py-3">
                                {s.fileUrl
                                    ? <a href={s.fileUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">View File</a>
                                    : <span style={{ color: 'var(--text-muted)' }}>No file</span>
                                }
                            </td>
                            <td className="px-4 py-3">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${badge(s.status)}`}>
                                    {s.status || 'pending'}
                                </span>
                            </td>
                            <td className="px-4 py-3">
                                {s.obtainedMarks != null ? s.obtainedMarks : '—'}
                            </td>
                            <td className="px-4 py-3">
                                <button
                                    onClick={() => onGrade(s)}
                                    className="text-violet-600 hover:underline text-xs font-medium"
                                >
                                    {s.status === 'graded' ? 'Re-grade' : 'Grade'}
                                </button>
                            </td>
                            <td className="px-4 py-3 font-medium">
                                {s.isLate
                                    ? <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-semibold">Late</span>
                                    : <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold">On Time</span>
                                }
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default StudentSubmissionList;