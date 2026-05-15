// Path: frontend/src/components/common/Navbar.jsx

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

const timeAgo = (dateStr) => {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
};

const typeIcon = (type) => {
    const icons = { assignment: '📝', grade: '🏆', submission: '📤', system: 'ℹ️' };
    return icons[type] || '🔔';
};

const Navbar = ({ onMenuClick }) => {
    const { user } = useAuth();
    const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, deleteAllRead } = useNotifications();
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleNotificationClick = (n) => {
        if (!n.isRead) markAsRead(n._id);
    };

    return (
        <header
            className="h-16 md:h-20 flex items-center justify-between px-4 md:px-8 shadow-sm flex-shrink-0 border-b"
            style={{
                backgroundColor: 'var(--bg-navbar)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
            }}
        >
            {/* Left side: hamburger (mobile) + welcome text */}
            <div className="flex items-center gap-3">
                {/* Hamburger — mobile only */}
                <button
                    onClick={onMenuClick}
                    className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
                    style={{ color: 'var(--text-primary)' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--hover-row)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    aria-label="Open menu"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                {/* Welcome text — truncated on mobile */}
                <p className="font-medium text-sm md:text-lg truncate max-w-[160px] md:max-w-none" style={{ color: 'var(--text-primary)' }}>
                    Welcome,{' '}
                    <span className="font-bold" style={{ color: 'var(--text-heading)' }}>
                        {user?.firstName || user?.name}
                    </span>! 👋
                </p>
            </div>

            {/* Right side: bell + role badge */}
            <div className="flex items-center gap-2 md:gap-3">

                {/* ── Notification Bell ── */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setOpen(prev => !prev)}
                        className="relative w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-colors"
                        style={{ color: 'var(--text-primary)' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--hover-row)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                        aria-label="Notifications"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        {unreadCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {/* ── Dropdown ── */}
                    {open && (
                        <div
                            className="absolute right-0 top-12 w-72 md:w-80 rounded-xl shadow-2xl border z-50 overflow-hidden"
                            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-4 py-3 bg-[#1E2A5E]">
                                <h3 className="text-white font-semibold text-sm">🔔 Notifications</h3>
                                <div className="flex items-center gap-3">
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={markAllAsRead}
                                            className="text-blue-300 text-xs hover:text-white transition-colors"
                                        >
                                            Mark all read
                                        </button>
                                    )}
                                    {notifications.some(n => n.isRead) && (
                                        <button
                                            onClick={deleteAllRead}
                                            className="text-red-300 text-xs hover:text-white transition-colors"
                                        >
                                            Clear read
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* List */}
                            <div className="max-h-80 overflow-y-auto divide-y" style={{ borderColor: 'var(--border)' }}>
                                {notifications.length === 0 ? (
                                    <div className="text-center py-10" style={{ color: 'var(--text-muted)' }}>
                                        <p className="text-2xl mb-1">🎉</p>
                                        <p className="text-sm">All caught up!</p>
                                    </div>
                                ) : (
                                    notifications.slice(0, 15).map(n => (
                                        <div
                                            key={n._id}
                                            onClick={() => handleNotificationClick(n)}
                                            className="flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors"
                                            style={!n.isRead ? { backgroundColor: 'rgba(59,130,246,0.07)' } : {}}
                                        >
                                            <span className="text-lg flex-shrink-0 mt-0.5">{typeIcon(n.type)}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm leading-snug" style={{ color: 'var(--text-primary)' }}>
                                                    {n.message}
                                                </p>
                                                <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                                    {timeAgo(n.createdAt)}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                {!n.isRead && (
                                                    <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                                                )}
                                                <button
                                                    onClick={e => { e.stopPropagation(); deleteNotification(n._id); }}
                                                    className="text-gray-300 hover:text-red-400 text-xs transition-colors ml-1"
                                                    title="Delete"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Role Badge ── */}
                <span className="hidden sm:inline font-semibold capitalize bg-[#1E2A5E] text-white px-3 py-1 rounded-full text-sm tracking-wide">
                    {user?.role}
                </span>
            </div>
        </header>
    );
};

export default Navbar;
