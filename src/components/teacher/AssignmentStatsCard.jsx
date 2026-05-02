const stats = [
    { label: 'Total Assignments', key: 'total',    border: 'border-blue-500'   },
    { label: 'Total Submissions', key: 'submitted', border: 'border-green-500'  },
    { label: 'Pending Review',    key: 'pending',   border: 'border-yellow-500' },
    { label: 'Graded',            key: 'graded',    border: 'border-violet-500' },
];

const AssignmentStatsCard = ({ counts = {} }) => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(({ label, key, border }) => (
            <div
                key={key}
                className={`rounded-xl p-5 border-l-4 shadow-sm ${border}`}
                style={{ backgroundColor: 'var(--bg-card)' }}
            >
                <p className="text-2xl font-bold" style={{ color: 'var(--text-heading)' }}>
                    {counts[key] ?? 0}
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                    {label}
                </p>
            </div>
        ))}
    </div>
);

export default AssignmentStatsCard;