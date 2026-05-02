// src/components/assignment/AssignmentCard.jsx
import Button from '../common/Button';
import { formatDate } from '../../utils/dateFormatter';

const AssignmentCard = ({ assignment, onEdit, onDelete, onView }) => {
    const { _id, title, subject, dueDate, submissions = {}, targetDivisions = ['All'], status } = assignment;
    const total = submissions.total || 0;

    const now = new Date();
    const isOverdue = new Date(dueDate) < now;
    const isClosed = status === 'closed';

    // Determine display status
    const statusLabel = isClosed ? 'Closed' : isOverdue ? 'Overdue' : 'Active';
    const statusStyle = isClosed
        ? 'bg-gray-100 text-gray-600'
        : isOverdue
            ? 'bg-red-100 text-red-700'
            : 'bg-green-100 text-green-700';

    // Left border color
    const borderColor = isClosed ? '#9CA3AF' : isOverdue ? '#EF4444' : '#3B82F6';

    return (
        <div
            className="rounded-xl p-5 shadow-sm border-l-4"
            style={{ backgroundColor: 'var(--bg-card)', borderLeftColor: borderColor }}
        >
            <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base truncate" style={{ color: 'var(--text-heading)' }}>
                        {title}
                    </h3>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {subject?.name || subject || 'No subject'}
                    </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${statusStyle}`}>
                    {statusLabel}
                </span>
            </div>

            <div className="mt-3 flex items-center gap-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                <span>📅 {formatDate(dueDate)}</span>
                <span>📄 {total} submissions</span>
            </div>

            <div className="mt-1 flex gap-1 flex-wrap">
                {targetDivisions.map(div => (
                    <span key={div} className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                        {div === 'All' ? '🌐 All' : `Div ${div}`}
                    </span>
                ))}
            </div>

            <div className="mt-4 flex gap-2">
                <button
                    onClick={() => onView(_id)}
                    className="px-3 py-1 text-xs rounded-lg border border-gray-400 text-gray-800 hover:bg-gray-100 transition-colors font-medium">
                    View
                </button>
                <button
                    onClick={() => onEdit(assignment)}
                    className="px-3 py-1 text-xs rounded-lg bg-[#1E2A5E] text-white hover:bg-blue-800 transition-colors font-medium">
                    Edit
                </button>
                <button
                    onClick={() => onDelete(_id)}
                    className="px-3 py-1 text-xs rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-medium">
                    Delete
                </button>
            </div>
        </div>
    );
};

export default AssignmentCard;
