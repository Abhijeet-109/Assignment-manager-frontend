import api from './api';

export const getSubmissionsByAssignment = async (assignmentId) => {
    const res = await api.get(`/submissions/assignment/${assignmentId}`);
    return res.data;
};

export const gradeSubmission = async (submissionId, data) => {
    // data = { obtainedMarks, feedback }
    const res = await api.post(`/submissions/grade/${submissionId}`, data);
    return res.data;
};

export const updateGrade = async (submissionId, data) => {
    const res = await api.put(`/submissions/update-grade/${submissionId}`, data);
    return res.data;
};