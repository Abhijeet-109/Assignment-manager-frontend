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

export const createAssignment = async (data) => {
    const res = await api.post('/assignments', data);
    return res.data;
};

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
