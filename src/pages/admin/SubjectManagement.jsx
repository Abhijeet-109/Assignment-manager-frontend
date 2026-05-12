import { useEffect, useState } from 'react';
import api from '../../services/api';
import Loading from '../../components/common/Loading';

const emptyForm = { name: '', code: '', description: '' };

const Field = ({ label, value, onChange, placeholder, required = false, textarea = false }) => (
    <div>
        <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {textarea ? (
            <textarea
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                rows={3}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E2A5E] resize-none"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}
            />
        ) : (
            <input
                type="text"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E2A5E]"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}
            />
        )}
    </div>
);

const SubjectManagement = () => {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [msg, setMsg] = useState('');

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editTarget, setEditTarget] = useState(null); // null = create mode
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    // Delete confirm state
    const [deleteTarget, setDeleteTarget] = useState(null); // { id, name }

    const fetchSubjects = async () => {
        try {
            const { data } = await api.get('/subjects');
            setSubjects(data.data);
        } catch {
            setError('Failed to fetch subjects.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchSubjects(); }, []);

    const flash = (text, isError = false) => {
        if (isError) setError(text); else setMsg(text);
        setTimeout(() => { setError(''); setMsg(''); }, 3000);
    };

    const openCreate = () => {
        setEditTarget(null);
        setForm(emptyForm);
        setShowModal(true);
    };

    const openEdit = (subject) => {
        setEditTarget(subject);
        setForm({ name: subject.name, code: subject.code, description: subject.description || '' });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditTarget(null);
        setForm(emptyForm);
    };

    const handleSubmit = async () => {
        if (!form.name.trim() || !form.code.trim()) {
            return flash('Subject name and code are required.', true);
        }

        setSaving(true);
        try {
            const payload = { ...form, code: form.code.toUpperCase().trim() };

            if (editTarget) {
                await api.put(`/subjects/update/${editTarget._id}`, payload);
                flash('Subject updated successfully.');
            } else {
                await api.post('/subjects', payload);
                flash('Subject created successfully.');
            }

            closeModal();
            fetchSubjects();
        } catch (err) {
            flash(err.response?.data?.message || 'Failed to save subject.', true);
        } finally {
            setSaving(false);
        }
    };

    const confirmDelete = async () => {
        try {
            await api.delete(`/subjects/${deleteTarget.id}`);
            flash('Subject deleted.');
            fetchSubjects();
        } catch (err) {
            flash(err.response?.data?.message || 'Failed to delete subject.', true);
        } finally {
            setDeleteTarget(null);
        }
    };

    const f = (key) => ({
        value: form[key],
        onChange: (e) => setForm(p => ({ ...p, [key]: e.target.value }))
    });

    if (loading) return <Loading />;

    return (
        <div className="space-y-4">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Subjects</h1>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {subjects.length} subject{subjects.length !== 1 ? 's' : ''} registered
                    </p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 bg-[#1E2A5E] text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-900 transition-colors"
                >
                    + Add Subject
                </button>
            </div>

            {/* Flash messages */}
            {error && <div className="bg-red-50 text-red-700 border border-red-200 px-4 py-2 rounded-lg text-sm">{error}</div>}
            {msg && <div className="bg-green-50 text-green-700 border border-green-200 px-4 py-2 rounded-lg text-sm">{msg}</div>}

            {/* Table */}
            {subjects.length === 0 ? (
                <div className="text-center py-16 rounded-xl" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)' }}>
                    <div className="text-4xl mb-3">📚</div>
                    <p className="font-medium">No subjects yet</p>
                    <p className="text-sm mt-1">Click "Add Subject" to create the first one.</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl shadow-sm">
                    <table className="w-full text-sm" style={{ backgroundColor: 'var(--bg-card)' }}>
                        <thead>
                            <tr className="text-left border-b"
                                style={{ color: 'var(--text-muted)', borderColor: 'var(--border)', backgroundColor: 'var(--bg-page)' }}>
                                <th className="px-4 py-3">#</th>
                                <th className="px-4 py-3">Subject Name</th>
                                <th className="px-4 py-3">Code</th>
                                <th className="px-4 py-3">Description</th>
                                <th className="px-4 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subjects.map((s, i) => (
                                <tr key={s._id}
                                    className="border-b transition-colors"
                                    style={{ borderColor: 'var(--border)' }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--hover-row)'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                    <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{s.name}</td>
                                    <td className="px-4 py-3">
                                        <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                                            {s.code}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 max-w-xs truncate" style={{ color: 'var(--text-muted)' }}>
                                        {s.description || <span className="italic text-xs">—</span>}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => openEdit(s)}
                                                className="px-3 py-1 text-xs rounded-lg bg-[#1E2A5E] text-white hover:bg-blue-900 transition-colors">
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => setDeleteTarget({ id: s._id, name: s.name })}
                                                className="px-3 py-1 text-xs rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors">
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create / Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50"
                    style={{ backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0,0,0,0.25)' }}>
                    <div className="rounded-xl shadow-xl p-6 w-full max-w-md mx-4"
                        style={{ backgroundColor: 'var(--bg-card)' }}>
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                                {editTarget ? 'Edit Subject' : 'Add Subject'}
                            </h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
                        </div>

                        <div className="space-y-3">
                            <Field label="Subject Name" required placeholder="e.g. Data Structures" {...f('name')} />
                            <Field label="Subject Code" required placeholder="e.g. CS301" {...f('code')} />
                            <Field label="Description" placeholder="Optional description" textarea {...f('description')} />
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button onClick={closeModal}
                                className="flex-1 border py-2 rounded-lg text-sm transition-colors"
                                style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                                Cancel
                            </button>
                            <button onClick={handleSubmit} disabled={saving}
                                className="flex-1 bg-[#1E2A5E] text-white py-2 rounded-lg text-sm hover:bg-blue-900 transition-colors disabled:opacity-50">
                                {saving ? 'Saving...' : editTarget ? 'Update Subject' : 'Create Subject'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirm Modal */}
            {deleteTarget && (
                <div className="fixed inset-0 flex items-center justify-center z-50"
                    style={{ backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0,0,0,0.25)' }}>
                    <div className="rounded-xl shadow-xl p-6 w-full max-w-sm mx-4"
                        style={{ backgroundColor: 'var(--bg-card)' }}>
                        <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Delete Subject</h2>
                        <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
                            Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteTarget(null)}
                                className="flex-1 border py-2 rounded-lg text-sm"
                                style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                                Cancel
                            </button>
                            <button onClick={confirmDelete}
                                className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm hover:bg-red-700 transition-colors">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubjectManagement;