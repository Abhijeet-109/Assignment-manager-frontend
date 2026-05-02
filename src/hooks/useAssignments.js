import { useState, useEffect, useCallback } from 'react';
import {
    getMyAssignments,
    createAssignment,
    updateAssignment,
    deleteAssignment
} from '../services/assignmentService';

const useAssignments = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAssignments = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getMyAssignments();
            setAssignments(data.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load assignments');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAssignments();
    }, [fetchAssignments]);

    const handleCreate = async (formData) => {
        await createAssignment(formData);
        await fetchAssignments(); // refresh list
    };

    const handleUpdate = async (id, formData) => {
        await updateAssignment(id, formData);
        await fetchAssignments();
    };

    const handleDelete = async (id) => {
        await deleteAssignment(id);
        await fetchAssignments();
    };

    return { assignments, loading, error, handleCreate, handleUpdate, handleDelete, refetch: fetchAssignments };
};

export default useAssignments;