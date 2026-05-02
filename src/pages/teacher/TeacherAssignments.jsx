// src/pages/teacher/TeacherAssignments.jsx
import { useState, useEffect, useCallback } from 'react';
import Modal from '../../components/common/Modal';
import AssignmentList from '../../components/assignment/AssignmentList';
import CreateAssignmentForm from '../../components/assignment/CreateAssignmentForm';
import { getMyAssignments, createAssignment, updateAssignment, deleteAssignment, getSubjects } from '../../services/assignmentService';
import { useNavigate } from 'react-router-dom';

/* ─── Toast ──────────────────────────────────────────────────────── */
const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const t = setTimeout(onClose, 3500);
        return () => clearTimeout(t);
    }, [onClose]);

    const colors = { success: 'bg-green-600', error: 'bg-red-600', info: 'bg-blue-600' };

    return (
        <div className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-white text-sm font-medium animate-slide-in ${colors[type] || colors.info}`}>
            <span>{message}</span>
            <button onClick={onClose}
                className="ml-2 px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-xs font-semibold transition-colors">
                OK
            </button>
        </div>
    );
};

/* ─── Delete Confirm ─────────────────────────────────────────────── */
const DeleteConfirm = ({ onConfirm, onCancel }) => (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50">
        <div className="rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 space-y-4"
            style={{ backgroundColor: 'var(--bg-card)' }}>
            <div className="text-center space-y-2">
                <div className="text-4xl">🗑️</div>
                <h3 className="text-lg font-bold" style={{ color: 'var(--text-heading)' }}>Delete Assignment?</h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    This action is <strong>permanent</strong> and cannot be undone.<br />
                    All related submissions will also be removed.
                </p>
            </div>
            <div className="flex gap-3 pt-2">
                <button onClick={onCancel}
                    className="flex-1 px-4 py-2 rounded-xl border text-sm font-medium transition-colors hover:bg-gray-100"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                    Cancel
                </button>
                <button onClick={onConfirm}
                    className="flex-1 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors">
                    Yes, Delete
                </button>
            </div>
        </div>
    </div>
);

/* ─── Status filter options
   NOTE: 'closed' removed — no UI to close assignments exists.
   'overdue' is computed client-side (dueDate < now), NOT sent to backend.
   Backend only knows 'active' | 'closed' as a schema status field.
   ----------------------------------------------------------------- */
const STATUS_FILTERS = [
    { val: '', label: 'All' },
    { val: 'active', label: 'Active' },
    { val: 'overdue', label: 'Overdue' },
];

const TeacherAssignments = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [divFilter, setDivFilter] = useState('');
    const [subjectFilter, setSubjectFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [toast, setToast] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    const navigate = useNavigate();

    const showToast = (message, type = 'success') => setToast({ message, type });

    const fetchAssignments = useCallback(async () => {
        try {
            setLoading(true);

            // For 'overdue': don't send status to backend — fetch all active, filter client-side
            // For 'active': send status=active BUT also filter out overdue ones client-side
            // Backend status field = 'active'|'closed' (schema-level, not date-based)
            const backendStatus = (statusFilter === 'overdue') ? '' : statusFilter;

            const data = await getMyAssignments({
                division: divFilter,
                subject: subjectFilter,
                status: backendStatus,
            });

            let list = data.data || [];
            const now = new Date();

            if (statusFilter === 'active') {
                // Truly active = not past due date
                list = list.filter(a => new Date(a.dueDate) >= now);
            } else if (statusFilter === 'overdue') {
                // Overdue = past due date (and not explicitly closed — still 'active' status in DB)
                list = list.filter(a => new Date(a.dueDate) < now);
            }

            setAssignments(list);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load');
        } finally {
            setLoading(false);
        }
    }, [divFilter, subjectFilter, statusFilter]);

    useEffect(() => { fetchAssignments(); }, [fetchAssignments]);
    useEffect(() => {
        getSubjects().then(d => setSubjects(d.data || d.subjects || [])).catch(() => { });
    }, []);

    const openCreate = () => { setEditTarget(null); setModalOpen(true); };
    const openEdit = (a) => { setEditTarget(a); setModalOpen(true); };
    const closeModal = () => { setModalOpen(false); setEditTarget(null); };

    const onFormSubmit = async (form) => {
        const isEdit = !!editTarget;
        if (isEdit) await updateAssignment(editTarget._id, form);
        else await createAssignment(form);
        closeModal();
        fetchAssignments();
        showToast(isEdit ? '✏️ Assignment updated successfully!' : '✅ Assignment created successfully!');
    };

    const handleDeleteClick = (id) => setDeleteId(id);

    const confirmDelete = async () => {
        try {
            await deleteAssignment(deleteId);
            setDeleteId(null);
            fetchAssignments();
            showToast('🗑️ Assignment deleted successfully!');
        } catch {
            setDeleteId(null);
            showToast('Failed to delete assignment.', 'error');
        }
    };

    const filterBtn = 'px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors';
    const activeStyle = 'bg-[#1E2A5E] text-white border-[#1E2A5E]';
    const overdueStyle = 'bg-red-600 text-white border-red-600';
    const inactiveStyle = 'border-gray-300 text-gray-600 hover:border-[#1E2A5E]';

    const getStatusStyle = (val) => {
        if (statusFilter !== val) return inactiveStyle;
        return val === 'overdue' ? overdueStyle : activeStyle;
    };

    return (
        <div className="space-y-4">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            {deleteId && <DeleteConfirm onConfirm={confirmDelete} onCancel={() => setDeleteId(null)} />}

            {/* Header */}
            <div className="rounded-xl shadow-sm p-5 border-l-4 border-[#1E2A5E]"
                style={{ backgroundColor: 'var(--bg-card)' }}>
                <h1 className="text-xl font-bold text-[#1E2A5E]">📋 My Assignments</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                    Create, edit and manage your assignments.
                </p>
            </div>

            {/* Filter Bar */}
            <div className="rounded-xl p-4 border space-y-3"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                <p className="text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>FILTERS</p>
                <div className="flex flex-wrap gap-4 items-center">

                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Division:</span>
                        {['', 'A', 'B', 'C'].map(d => (
                            <button key={d} onClick={() => setDivFilter(d)}
                                className={`${filterBtn} ${divFilter === d ? activeStyle : inactiveStyle}`}>
                                {d === '' ? 'All' : `Div ${d}`}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Status:</span>
                        {STATUS_FILTERS.map(({ val, label }) => (
                            <button key={val} onClick={() => setStatusFilter(val)}
                                className={`${filterBtn} ${getStatusStyle(val)}`}>
                                {label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Subject:</span>
                        <select value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)}
                            className="px-3 py-1.5 rounded-lg border text-sm outline-none font-medium"
                            style={{ backgroundColor: 'var(--bg-page)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                            <option value="">All Subjects</option>
                            {subjects.map(s => (
                                <option key={s._id} value={s._id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button onClick={openCreate}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#1E2A5E] hover:bg-blue-800 transition-colors">
                    + New Assignment
                </button>
            </div>

            {loading && <p style={{ color: 'var(--text-muted)' }}>Loading...</p>}
            {error && <p className="text-red-500 text-sm">{error}</p>}

            {!loading && (
                <AssignmentList
                    assignments={assignments}
                    onEdit={openEdit}
                    onDelete={handleDeleteClick}
                    onView={(id) => navigate(`/teacher/submissions?id=${id}`)}
                />
            )}

            <Modal isOpen={modalOpen} onClose={closeModal}
                title={editTarget ? 'Edit Assignment' : 'New Assignment'}>
                <CreateAssignmentForm initial={editTarget} onSubmit={onFormSubmit} onCancel={closeModal} />
            </Modal>
        </div>
    );
};

export default TeacherAssignments;
