// Path: Main/frontend/src/pages/ProfilePage.jsx

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme, THEMES } from '../context/ThemeContext';
import api from '../services/api';
import { updateAvatar, deleteAvatar } from '../services/userService';
import { compressImage } from '../utils/compressImage';


const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

/* ─────────────────────────────────────────────
   Photo Viewer Modal (fullscreen)
───────────────────────────────────────────── */
const PhotoViewer = ({ src, onClose }) => (
    <div
        className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center"
        onClick={onClose}
    >
        <div className="relative" onClick={e => e.stopPropagation()}>
            <img
                src={src}
                alt="Profile Photo"
                className="max-h-[85vh] max-w-[85vw] rounded-xl object-contain shadow-2xl"
            />
            <button
                onClick={onClose}
                className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full text-black text-xl flex items-center justify-center shadow-lg hover:bg-gray-200 transition-colors font-bold leading-none"
            >
                ×
            </button>
        </div>
    </div>
);

/* ─────────────────────────────────────────────
   WhatsApp-style Avatar Dropdown Menu
───────────────────────────────────────────── */
const AvatarMenu = ({ hasAvatar, onView, onUpload, onRemove, onClose }) => {
    const menuRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) onClose();
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [onClose]);

    return (
        <div
            ref={menuRef}
            className="absolute top-24 left-0 z-50 w-48 rounded-xl shadow-2xl overflow-hidden border"
            style={{ backgroundColor: '#1f2937', borderColor: '#374151' }}
        >
            {hasAvatar && (
                <button
                    onClick={onView}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-200 hover:bg-white/10 transition-colors text-left"
                >
                    <span className="text-base">👁</span> View photo
                </button>
            )}

            <button
                onClick={onUpload}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-200 hover:bg-white/10 transition-colors text-left"
            >
                <span className="text-base">📤</span> Upload photo
            </button>

            {hasAvatar && (
                <>
                    <div className="border-t mx-3" style={{ borderColor: '#374151' }} />
                    <button
                        onClick={onRemove}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-white/10 transition-colors text-left"
                    >
                        <span className="text-base">🗑</span> Remove photo
                    </button>
                </>
            )}
        </div>
    );
};

/* ─────────────────────────────────────────────
   Main Profile Page
───────────────────────────────────────────── */
const ProfilePage = () => {
    const { user, setUser } = useAuth();
    const { theme, setTheme } = useTheme();

    const [form, setForm] = useState({ firstName: '', lastName: '' });
    const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [msg, setMsg] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    // Avatar states
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarLoading, setAvatarLoading] = useState(false);
    const [showAvatarMenu, setShowAvatarMenu] = useState(false);
    const [showPhotoViewer, setShowPhotoViewer] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (user) {
            setForm({ firstName: user.firstName || '', lastName: user.lastName || '' });
        }
    }, [user]);

    const showMsg = (type, text) => {
        setMsg({ type, text });
        setTimeout(() => setMsg({ type: '', text: '' }), 3000);
    };

    // ── Avatar handlers ──────────────────────────────────────────────────
    const handleAvatarSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) return showMsg('error', 'Only JPG, PNG, or WEBP allowed');
        if (file.size > 2 * 1024 * 1024) return showMsg('error', 'Image must be under 2MB');

        const compressed = await compressImage(file);
        setAvatarFile(compressed);
        setAvatarPreview(URL.createObjectURL(compressed));
    };

    const handleAvatarSave = async () => {
        if (!avatarFile) return;
        setAvatarLoading(true);
        try {
            const result = await updateAvatar(avatarFile);
            const avatarUrl = result.data.avatarUrl;

            const updatedUser = { ...user, avatar: avatarUrl };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);

            setAvatarFile(null);
            setAvatarPreview(null);
            showMsg('success', 'Avatar updated successfully');
        } catch (err) {
            showMsg('error', err.response?.data?.message || 'Avatar upload failed');
        } finally {
            setAvatarLoading(false);
        }
    };

    const handleAvatarCancel = () => {
        setAvatarFile(null);
        setAvatarPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Called after user confirms in the modal
    const handleAvatarDelete = async () => {
        setShowDeleteConfirm(false);
        try {
            await deleteAvatar();
            const updatedUser = { ...user, avatar: null };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            showMsg('success', 'Avatar removed');
        } catch {
            showMsg('error', 'Failed to remove avatar');
        }
    };

    // ── Name update ───────────────────────────────────────────────────────
    const handleNameUpdate = async () => {
        if (!form.firstName.trim() || !form.lastName.trim()) return showMsg('error', 'Name fields cannot be empty');
        setLoading(true);
        try {
            const { data } = await api.put('/users/profile', { firstName: form.firstName, lastName: form.lastName });
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

    // ── Password update ───────────────────────────────────────────────────
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

    const displayAvatar = avatarPreview
        ? avatarPreview
        : user?.avatar
            ? user.avatar.startsWith('http') ? user.avatar : `${BACKEND_URL}/${user.avatar}`
            : null;

    return (
        <div className="p-4 sm:p-8 max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-heading)' }}>My Profile</h1>

            {/* Alert */}
            {msg.text && (
                <div className={`fixed bottom-6 right-6 z-[9999] px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all
        ${msg.type === 'success'
                        ? 'bg-green-600 text-white'
                        : 'bg-red-600 text-white'
                    }`}
                >
                    {msg.type === 'success' ? '✓ ' : '✕ '}{msg.text}
                </div>
            )}

            {/* Avatar + Info Card */}
            <div className="rounded-xl p-6 border flex flex-col sm:flex-row items-center sm:items-center gap-5 text-center sm:text-left"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>

                {/* Avatar with WhatsApp-style menu */}
                <div className="relative flex-shrink-0">

                    {/* Clickable avatar circle */}
                    <div
                        onClick={() => setShowAvatarMenu(prev => !prev)}
                        className="w-20 h-20 rounded-full overflow-hidden cursor-pointer relative"
                    >
                        {displayAvatar ? (
                            <img src={displayAvatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-violet-500 flex items-center justify-center text-2xl font-bold text-white">
                                {initial}
                            </div>
                        )}
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <span className="text-white text-xl">📷</span>
                            <span className="text-white text-[10px] mt-1 font-medium tracking-wide">CHANGE</span>
                        </div>
                    </div>

                    {/* Green Edit pill */}
                    <button
                        onClick={() => setShowAvatarMenu(prev => !prev)}
                        className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-0.5 bg-purple-600 text-white text-[11px] rounded-full font-medium shadow-md hover:bg-purple-500 transition-colors whitespace-nowrap"
                    >
                        📷 Edit
                    </button>

                    {/* Hidden file input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        className="hidden"
                        onChange={handleAvatarSelect}
                    />

                    {/* Dropdown menu */}
                    {showAvatarMenu && (
                        <AvatarMenu
                            hasAvatar={!!displayAvatar}
                            onView={() => { setShowPhotoViewer(true); setShowAvatarMenu(false); }}
                            onUpload={() => { fileInputRef.current?.click(); setShowAvatarMenu(false); }}
                            onRemove={() => { setShowDeleteConfirm(true); setShowAvatarMenu(false); }}
                            onClose={() => setShowAvatarMenu(false)}
                        />
                    )}
                </div>

                {/* User info */}
                <div className="flex-1">
                    <p className="text-lg font-semibold" style={{ color: 'var(--text-heading)' }}>{user?.name}</p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
                    <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-semibold bg-[#1E2A5E] text-white capitalize">
                        {user?.role}
                    </span>
                </div>
            </div>

            {/* Save / Cancel avatar buttons — only when new file selected */}
            {avatarFile && (
                <div className="flex gap-3">
                    <button
                        onClick={handleAvatarSave}
                        disabled={avatarLoading}
                        className="px-5 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors disabled:opacity-50"
                    >
                        {avatarLoading ? 'Uploading...' : 'Save Avatar'}
                    </button>
                    <button
                        onClick={handleAvatarCancel}
                        disabled={avatarLoading}
                        className="px-5 py-2 border rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                        style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                    >
                        Cancel
                    </button>
                </div>
            )}

            {/* Edit Name */}
            <div className="rounded-xl p-6 border space-y-4"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                <h2 className="font-semibold text-base" style={{ color: 'var(--text-heading)' }}>Edit Name</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
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

            {/* ── Delete Confirm Modal ── */}
            {showDeleteConfirm && (
                <div
                    className="fixed inset-0 flex items-center justify-center z-50"
                    style={{ backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0,0,0,0.25)' }}
                >
                    <div className="rounded-xl shadow-xl p-6 w-full max-w-sm mx-4"
                        style={{ backgroundColor: 'var(--bg-card)' }}>
                        <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                            Remove Profile Photo
                        </h2>
                        <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
                            Are you sure you want to remove your profile photo? This cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 border py-2 rounded-lg text-sm transition-colors"
                                style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAvatarDelete}
                                className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm hover:bg-red-700 transition-colors"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Fullscreen Photo Viewer ── */}
            {showPhotoViewer && displayAvatar && (
                <PhotoViewer
                    src={displayAvatar}
                    onClose={() => setShowPhotoViewer(false)}
                />
            )}
        </div>
    );
};

export default ProfilePage;
