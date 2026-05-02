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
            className="px-4 py-2 border-2 border-black text-black font-medium rounded-lg hover:bg-black hover:text-white transition-all">
            ⬇ Export CSV
        </button>
    );
};

export default ExportButton;