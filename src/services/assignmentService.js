import api from './api';

export const getMyAssignments = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.division) params.append('division', filters.division);
    if (filters.subject) params.append('subject', filters.subject);
    if (filters.status) params.append('status', filters.status);
    const res = await api.get(`/assignments/teacher?${params.toString()}`);
    return res.data;
};

export const getAssignmentById = async (id) => {
    const res = await api.get(`/assignments/${id}`);
    return res.data;
};
// ----------------Changes to handle real file upload from local system -----------------------
export const createAssignment = async (data, fileObj = null) => {
    if (fileObj) {
        // Send as multipart FormData when a file is attached
        const formData = new FormData();
        formData.append('file', fileObj);
        formData.append('title', data.title);
        formData.append('description', data.description);
        formData.append('subject', data.subject);
        formData.append('dueDate', data.dueDate);
        formData.append('maxMarks', data.maxMarks);
        formData.append('targetDivisions', JSON.stringify(data.targetDivisions));

        const res = await api.post('/assignments', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data;
    }

    // No file — send plain JSON as before
    const res = await api.post('/assignments', data);
    return res.data;
};
//--------------------------------------------Real file upload changes----------------------------------------------------
export const updateAssignment = async (id, data) => {
    const res = await api.put(`/assignments/${id}`, data);
    return res.data;
};

export const deleteAssignment = async (id) => {
    const res = await api.delete(`/assignments/${id}`);
    return res.data;
};

export const getSubjects = async () => {
    const res = await api.get('/subjects');
    return res.data;
};
