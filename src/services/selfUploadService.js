import api from './api';

// GET /self-uploads
export const getMySelfUploads = () => api.get('/self-uploads');

// POST /self-uploads (Drive link — JSON body)
export const createSelfUpload = (data) => api.post('/self-uploads', data);

// POST /self-uploads/file (Local file — multipart)
export const uploadLocalFile = (formData) =>
    api.post('/self-uploads/file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

// DELETE /self-uploads/:id
export const deleteSelfUpload = (id) => api.delete(`/self-uploads/${id}`);