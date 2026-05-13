import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme, THEMES } from '../context/ThemeContext';
import api from '../services/api';

const ProfilePage = () => {
    const { user, setUser } = useAuth();
    const { theme, setTheme } = useTheme();

    const [form, setForm] = useState({ firstName: '', lastName: '' });
    const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [msg, setMsg] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setForm({ firstName: user.firstName || '', lastName: user.lastName || '' });
        }
    }, [user]);

    const showMsg = (type, text) => {
        setMsg({ type, text });
        setTimeout(() => setMsg({ type: '', text: '' }), 3000);
    };

    const handleNameUpdate = async () => {
        if (!form.firstName.trim() || !form.lastName.trim()) return showMsg('error', 'Name fields cannot be empty');
        setLoading(true);
        try {
            const { data } = await api.put('/users/profile', { firstName: form.firstName, lastName: form.lastName });
            // Update AuthContext user state
            const updated = data.data.user;
            const normalized = { ...updated, name: `${updated.firstName} ${updated.lastName}`.trim() };
            localStorage.setItem('user', JSON.stringify(normalized));
            setUser(normalized);
            showMsg('success', 'Name updated successfully');
        } catch (err) {
            showMsg('error', err.response?.data?.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdate = async () => {
        if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword)
            return showMsg('error', 'All password fields are required');
        if (passwords.newPassword !== passwords.confirmPassword)
            return showMsg('error', 'New passwords do not match');
        if (passwords.newPassword.length < 8)
            return showMsg('error', 'Password must be at least 8 characters');
        setLoading(true);
        try {
            await api.put('/users/profile', {
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword,
            });
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
            showMsg('success', 'Password changed successfully');
        } catch (err) {
            showMsg('error', err.response?.data?.message || 'Password update failed');
        } finally {
            setLoading(false);
        }
    };

    const initial = user?.firstName?.[0]?.toUpperCase() || '?';

    return (
        <div className="p-8 max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-heading)' }}>My Profile</h1>

            {/* Alert */}
            {msg.text && (
                <div className={`px-4 py-3 rounded-lg text-sm font-medium ${msg.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {msg.text}
                </div>
            )}

            {/* Avatar + Role Card */}
            <div className="rounded-xl p-6 border flex items-center gap-5"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                <div className="w-16 h-16 rounded-full bg-violet-500 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
                    {initial}
                </div>
                <div>
                    <p className="text-lg font-semibold" style={{ color: 'var(--text-heading)' }}>{user?.name}</p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
                    <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-semibold bg-[#1E2A5E] text-white capitalize">
                        {user?.role}
                    </span>
                </div>
            </div>

            {/* Edit Name */}
            <div className="rounded-xl p-6 border space-y-4"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                <h2 className="font-semibold text-base" style={{ color: 'var(--text-heading)' }}>Edit Name</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm mb-1 block" style={{ color: 'var(--text-muted)' }}>First Name</label>
                        <input
                            value={form.firstName}
                            onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))}
                            className="w-full px-3 py-2 rounded-lg border text-sm"
                            style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                        />
                    </div>
                    <div>
                        <label className="text-sm mb-1 block" style={{ color: 'var(--text-muted)' }}>Last Name</label>
                        <input
                            value={form.lastName}
                            onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))}
                            className="w-full px-3 py-2 rounded-lg border text-sm"
                            style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                        />
                    </div>
                </div>
                <button
                    onClick={handleNameUpdate}
                    disabled={loading}
                    className="px-5 py-2 bg-[#1E2A5E] text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors disabled:opacity-50"
                >
                    {loading ? 'Saving...' : 'Save Name'}
                </button>
            </div>

            {/* Change Password */}
            <div className="rounded-xl p-6 border space-y-4"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                <h2 className="font-semibold text-base" style={{ color: 'var(--text-heading)' }}>Change Password</h2>
                {['currentPassword', 'newPassword', 'confirmPassword'].map((field) => (
                    <div key={field}>
                        <label className="text-sm mb-1 block capitalize" style={{ color: 'var(--text-muted)' }}>
                            {field === 'currentPassword' ? 'Current Password' : field === 'newPassword' ? 'New Password' : 'Confirm New Password'}
                        </label>
                        <input
                            type="password"
                            value={passwords[field]}
                            onChange={e => setPasswords(p => ({ ...p, [field]: e.target.value }))}
                            className="w-full px-3 py-2 rounded-lg border text-sm"
                            style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                        />
                    </div>
                ))}
                <button
                    onClick={handlePasswordUpdate}
                    disabled={loading}
                    className="px-5 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors disabled:opacity-50"
                >
                    {loading ? 'Updating...' : 'Update Password'}
                </button>
            </div>

            {/* Theme Toggle */}
            <div className="rounded-xl p-6 border space-y-3"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                <h2 className="font-semibold text-base" style={{ color: 'var(--text-heading)' }}>Appearance</h2>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Choose your preferred theme</p>
                <div className="flex gap-3">
                    {[
                        { value: THEMES.LIGHT, label: '☀️ Light' },
                        { value: THEMES.DARK, label: '🌙 Dark' },
                        { value: THEMES.SYSTEM, label: '💻 System' },
                    ].map(({ value, label }) => (
                        <button
                            key={value}
                            onClick={() => setTheme(value)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${theme === value
                                    ? 'bg-[#1E2A5E] text-white border-[#1E2A5E]'
                                    : 'border-gray-300 hover:border-[#1E2A5E]'
                                }`}
                            style={theme !== value ? { color: 'var(--text-primary)' } : {}}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;