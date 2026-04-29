import { useEffect, useState } from 'react';
import api from '../../services/api';
import Loading from '../../components/common/Loading';

const ROLE_COLORS = {
    admin: 'bg-purple-100 text-purple-700',
    teacher: 'bg-blue-100 text-blue-700',
    student: 'bg-green-100 text-green-700',
};

const emptyForm = { firstName: '', lastName: '', email: '', password: '', role: 'student' };

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [msg, setMsg] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [creating, setCreating] = useState(false);

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/users');
            setUsers(data.data.users);
        } catch {
            setError('Failed to fetch users.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const flash = (text, isError = false) => {
        if (isError) setError(text); else setMsg(text);
        setTimeout(() => { setError(''); setMsg(''); }, 3000);
    };

    const handleToggle = async (userId) => {
        try {
            await api.patch(`/users/${userId}/toggle-status`);
            flash('Status updated.');
            fetchUsers();
        } catch { flash('Failed to update status.', true); }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Permanently delete this user?')) return;
        try {
            await api.delete(`/users/${userId}`);
            flash('User deleted.');
            fetchUsers();
        } catch { flash('Failed to delete user.', true); }
    };

    const handleCreate = async () => {
        if (!form.firstName || !form.lastName || !form.email || !form.password) {
            return flash('All fields are required.', true);
        }
        setCreating(true);
        try {
            await api.post('/auth/signup', form);
            flash('User created successfully.');
            setShowModal(false);
            setForm(emptyForm);
            fetchUsers();
        } catch (err) {
            flash(err.response?.data?.message || 'Failed to create user.', true);
        } finally {
            setCreating(false);
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>User Management</h1>
                <button
                    onClick={() => setShowModal(true)}
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
                        <tr
                            className="text-left border-b"
                            style={{ color: 'var(--text-muted)', borderColor: 'var(--border)', backgroundColor: 'var(--bg-page)' }}
                        >
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">Role</th>
                            <th className="px-4 py-3 text-center">Status</th>
                            <th className="px-4 py-3 text-center">Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr
                                key={u._id}
                                className="border-b transition-colors"
                                style={{ borderColor: 'var(--border)' }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--hover-row)'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                                    {u.firstName} {u.lastName}
                                </td>
                                <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                                <td className="px-4 py-3">
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${ROLE_COLORS[u.role] || 'bg-gray-100 text-gray-600'}`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    {u.isActive === false ? (
                                        <button onClick={() => handleToggle(u._id)} className="px-3 py-1 text-xs rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors">Activate</button>
                                    ) : (
                                        <button onClick={() => handleToggle(u._id)} className="px-3 py-1 text-xs rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition-colors">Deactivate</button>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <button onClick={() => handleDelete(u._id)} className="px-3 py-1 text-xs rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Create User Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="rounded-xl shadow-xl p-6 w-full max-w-md mx-4" style={{ backgroundColor: 'var(--bg-card)' }}>
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Create New User</h2>
                            <button onClick={() => { setShowModal(false); setForm(emptyForm); }} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
                        </div>
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>First Name</label>
                                    <input value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E2A5E]"
                                        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}
                                        placeholder="John" />
                                </div>
                                <div>
                                    <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Last Name</label>
                                    <input value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E2A5E]"
                                        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}
                                        placeholder="Doe" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Email</label>
                                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E2A5E]"
                                    style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}
                                    placeholder="john@school.com" />
                            </div>
                            <div>
                                <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Password</label>
                                <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E2A5E]"
                                    style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}
                                    placeholder="min 8 characters" />
                            </div>
                            <div>
                                <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Role</label>
                                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E2A5E]"
                                    style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}
                                >
                                    <option value="student">Student</option>
                                    <option value="teacher">Teacher</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => { setShowModal(false); setForm(emptyForm); }}
                                className="flex-1 border py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                                style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                                Cancel
                            </button>
                            <button onClick={handleCreate} disabled={creating}
                                className="flex-1 bg-[#1E2A5E] text-white py-2 rounded-lg text-sm hover:bg-blue-900 transition-colors disabled:opacity-50">
                                {creating ? 'Creating...' : 'Create User'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;