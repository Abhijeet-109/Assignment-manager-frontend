import AssignmentCard from './AssignmentCard';

const AssignmentList = ({ assignments, onEdit, onDelete, onView }) => {
    if (!assignments.length) {
        return (
            <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
                <p className="text-4xl mb-3">📋</p>
                <p className="font-medium">No assignments yet.</p>
                <p className="text-sm mt-1">Click "New Assignment" to create one.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {assignments.map(a => (
                <AssignmentCard
                    key={a._id}
                    assignment={a}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onView={onView}
                />
            ))}
        </div>
    );
};

export default AssignmentList;