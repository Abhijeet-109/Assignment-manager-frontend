import { useState } from 'react';
import { exportAssignmentCSV } from '../../services/exportService';
import Button from '../common/Button';

const ExportButton = ({ assignmentId, assignmentTitle }) => {
    const [loading, setLoading] = useState(false);

    const handle = async () => {
        try {
            setLoading(true);
            const filename = `${assignmentTitle || 'submissions'}.csv`.replace(/\s+/g, '_');
            await exportAssignmentCSV(assignmentId, filename);
        } catch {
            alert('Export failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handle}
            loading={loading}
            className="px-4 py-2 border-2 font-medium rounded-lg transition-all"
            style={{
                borderColor: 'var(--export-btn-bg)',
                backgroundColor: 'var(--export-btn-bg)',
                color: 'var(--export-btn-text)',
            }}>
            ⬇ Export CSV
        </button>
    );
};

export default ExportButton;