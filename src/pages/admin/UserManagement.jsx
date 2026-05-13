import { useEffect, useState } from 'react';
import api from '../../services/api';
import Loading from '../../components/common/Loading';
import { useAuth } from '../../context/AuthContext';

const ROLE_COLORS = {
    admin: 'bg-purple-100 text-purple-700',
    teacher: 'bg-blue-100 text-blue-700',
    student: 'bg-green-100 text-green-700',
};

const emptyTeacher = { firstName: '', lastName: '', email: '', password: '', employeeId: '', department: '', designation: '' };
const emptyAdmin = { firstName: '', lastName: '', email: '', password: '' };
const emptyStudent = { firstName: '', lastName: '', email: '', password: '', enrollmentNumber: '', division: '', semester: '', department: '' };

// ── Reusable field component ──────────────────────────────────────────────────
const Field = ({ label, value, onChange, placeholder, type = 'text', required = false }) => (
    <div>
        <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E2A5E]"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}
        />
    </div>
);

const UserManagement = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [msg, setMsg] = useState('');
    const [showSelector, setShowSelector] = useState(false);
    const [modalType, setModalType] = useState(null); // 'admin' | 'teacher' | 'student'
    const [form, setForm] = useState({});
    const [creating, setCreating] = useState(false);

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/users');
            setUsers(data.data.users);
        } catch { setError('Failed to fetch users.'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchUsers(); }, []);

    const flash = (text, isError = false) => {
        if (isError) setError(text); else setMsg(text);
        setTimeout(() => { setError(''); setMsg(''); }, 3000);
    };

    const closeModal = () => { setModalType(null); setForm({}); };

    const openModal = (type) => {
        setShowSelector(false);
        if (type === 'teacher') setForm(emptyTeacher);
        else if (type === 'admin') setForm(emptyAdmin);
        else setForm(emptyStudent);
        setModalType(type);
    };

    const handleToggle = async (userId) => {
        try {
            await api.patch(`/users/${userId}/toggle-status`);
            flash('Status updated.');
            fetchUsers();
        } catch { flash('Failed to update status.', true); }
    };

    // ── Delete with confirm modal (not window.confirm) ────────────────────────
    const [deleteTarget, setDeleteTarget] = useState(null); // { id, name }

    const confirmDelete = async () => {
        try {
            await api.delete(`/users/${deleteTarget.id}`);
            flash('User deleted.');
            fetchUsers();
        } catch (err) {
            flash(err.response?.data?.message || 'Failed to delete user.', true);
        } finally { setDeleteTarget(null); }
    };

    // ── Create handler ────────────────────────────────────────────────────────
    const handleCreate = async () => {
        let endpoint = '';
        let required = [];

        if (modalType === 'teacher') {
            endpoint = '/users/create-teacher';
            required = ['firstName', 'lastName', 'email', 'password', 'employeeId', 'department'];
        } else if (modalType === 'admin') {
            endpoint = '/users/create-admin';
            required = ['firstName', 'lastName', 'email', 'password'];
        } else {
            endpoint = '/users/create-student';
            required = ['firstName', 'lastName', 'email', 'password', 'enrollmentNumber', 'division', 'semester', 'department'];
        }

        if (required.some(k => !form[k])) return flash('All required fields must be filled.', true);

        setCreating(true);
        try {
            await api.post(endpoint, form);
            flash(`${modalType.charAt(0).toUpperCase() + modalType.slice(1)} account created successfully.`);
            closeModal();
            fetchUsers();
        } catch (err) {
            flash(err.response?.data?.message || 'Failed to create account.', true);
        } finally { setCreating(false); }
    };

    const f = (key) => ({ value: form[key] || '', onChange: e => setForm(p => ({ ...p, [key]: e.target.value })) });

    if (loading) return <Loading />;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>User Management</h1>
                <button
                    onClick={() => setShowSelector(true)}
                    className="flex items-center gap-2 bg-[#1E2A5E] text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-900 transition-colors"
                >
                    + Create User
                </button>
            </div>

            {error && <div className="bg-red-50 text-red-700 border border-red-200 px-4 py-2 rounded-lg text-sm">{error}</div>}
            {msg && <div className="bg-green-50 text-green-700 border border-green-200 px-4 py-2 rounded-lg text-sm">{msg}</div>}

            {/* Table */}
            <div className="overflow-x-auto rounded-xl shadow-sm">
                <table className="w-full text-sm" style={{ backgroundColor: 'var(--bg-card)' }}>
                    <thead>
                        <tr className="text-left border-b"
                            style={{ color: 'var(--text-muted)', borderColor: 'var(--border)', backgroundColor: 'var(--bg-page)' }}>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">Role</th>
                            <th className="px-4 py-3 text-center">Status</th>
                            <th className="px-4 py-3 text-center">Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u._id} className="border-b transition-colors"
                                style={{ borderColor: 'var(--border)' }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--hover-row)'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                                    {u.firstName} {u.lastName}
                                    {u._id === currentUser?._id && (
                                        <span className="ml-2 text-xs text-purple-500">(you)</span>
                                    )}
                                </td>
                                <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                                <td className="px-4 py-3">
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${ROLE_COLORS[u.role] || 'bg-gray-100 text-gray-600'}`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    {u.isActive == false ? (
                                        <button onClick={() => handleToggle(u._id)} className="px-3 py-1 text-xs rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition-colors">Deactivated</button>
                                    ) : (
                                        <button onClick={() => handleToggle(u._id)} className="px-3 py-1 text-xs rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors">Active</button>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    {u._id === currentUser?._id || u.isSuperAdmin ? (
                                        <span className="text-xs text-gray-400 italic">—</span>
                                    ) : (
                                        <button
                                            onClick={() => setDeleteTarget({ id: u._id, name: `${u.firstName} ${u.lastName}` })}
                                            className="px-3 py-1 text-xs rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors">
                                            Delete
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ── Type Selector ─────────────────────────────────────────── */}
            {showSelector && (
                <div className="fixed inset-0 flex items-center justify-center z-50"
                    style={{ backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0,0,0,0.25)' }}>
                    <div className="rounded-xl shadow-xl p-6 w-full max-w-sm mx-4" style={{ backgroundColor: 'var(--bg-card)' }}>
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Create Account</h2>
                            <button onClick={() => setShowSelector(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
                        </div>
                        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Select the type of account to create:</p>
                        <div className="flex flex-col gap-3">
                            {currentUser?.isSuperAdmin && (
                                <button onClick={() => openModal('admin')}
                                    className="flex items-center gap-3 border rounded-lg px-4 py-3 text-left transition-colors"
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--hover-row)'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'} style={{ borderColor: 'var(--border)' }}>
                                    <span className="text-2xl">🛡️</span>
                                    <div>
                                        <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Admin Account</div>
                                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Full system access</div>
                                    </div>
                                </button>
                            )}
                            <button onClick={() => openModal('teacher')}
                                className="flex items-center gap-3 border rounded-lg px-4 py-3 text-left transition-colors"
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--hover-row)'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'} style={{ borderColor: 'var(--border)' }}>
                                <span className="text-2xl">👨‍🏫</span>
                                <div>
                                    <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Teacher Account</div>
                                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Assignment & grading access</div>
                                </div>
                            </button>
                            <button onClick={() => openModal('student')}
                                className="flex items-center gap-3 border rounded-lg px-4 py-3 text-left transition-colors"
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--hover-row)'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'} style={{ borderColor: 'var(--border)' }}>
                                <span className="text-2xl">🎓</span>
                                <div>
                                    <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Student Account</div>
                                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Emergency creation only</div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Delete Confirm Modal ───────────────────────────────────── */}
            {deleteTarget && (
                <div className="fixed inset-0 flex items-center justify-center z-50"
                    style={{ backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0,0,0,0.25)' }}>
                    <div className="rounded-xl shadow-xl p-6 w-full max-w-sm mx-4" style={{ backgroundColor: 'var(--bg-card)' }}>
                        <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Confirm Deletion</h2>
                        <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
                            Are you sure you want to permanently delete <strong>{deleteTarget.name}</strong>? This cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteTarget(null)}
                                className="flex-1 border py-2 rounded-lg text-sm transition-colors"
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

            {/* ── Create Form Modal ──────────────────────────────────────── */}
            {modalType && (
                <div className="fixed inset-0 flex items-center justify-center z-50"
                    style={{ backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0,0,0,0.25)' }}>
                    <div className="rounded-xl shadow-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto" style={{ backgroundColor: 'var(--bg-card)' }}>
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                                Create {modalType.charAt(0).toUpperCase() + modalType.slice(1)} Account
                            </h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
                        </div>

                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <Field label="First Name" required {...f('firstName')} placeholder="First" />
                                <Field label="Last Name" required {...f('lastName')} placeholder="Last" />
                            </div>
                            <Field label="Email" required type="email"    {...f('email')} placeholder="email@school.com" />
                            <Field label="Password" required type="password" {...f('password')} placeholder="Min 8 characters" />

                            {/* Teacher-only fields */}
                            {modalType === 'teacher' && <>
                                <Field label="Employee ID" required {...f('employeeId')} placeholder="EMP001" />
                                <Field label="Department" required {...f('department')} placeholder="Computer Science" />
                                <Field label="Designation"           {...f('designation')} placeholder="Asst. Professor (optional)" />
                            </>}

                            {/* Student-only fields */}
                            {modalType === 'student' && <>
                                <Field label="Enrollment Number" required {...f('enrollmentNumber')} placeholder="EN2024001" />
                                <Field label="Department" required {...f('department')} placeholder="MCA" />
                                <div className="grid grid-cols-2 gap-3">
                                    <Field label="Division" required {...f('division')} placeholder="A" />
                                    <Field label="Semester" required type="number" {...f('semester')} placeholder="1" />
                                </div>
                            </>}
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button onClick={closeModal}
                                className="flex-1 border py-2 rounded-lg text-sm transition-colors"
                                style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                                Cancel
                            </button>
                            <button onClick={handleCreate} disabled={creating}
                                className="flex-1 bg-[#1E2A5E] text-white py-2 rounded-lg text-sm hover:bg-blue-900 transition-colors disabled:opacity-50">
                                {creating ? 'Creating...' : `Create ${modalType.charAt(0).toUpperCase() + modalType.slice(1)}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;