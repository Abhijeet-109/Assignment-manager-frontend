import api from './api';

export const exportAssignmentCSV = async (assignmentId, filename = 'submissions.csv') => {
    const res = await api.get(`/export/assignment/${assignmentId}`, {
        responseType: 'blob',
    });

    // Create a temporary download link and click it
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};