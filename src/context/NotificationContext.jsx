import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const intervalRef = useRef(null);

    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        try {
            const res = await api.get('/notifications');
            const list = res.data.notifications || [];
            setNotifications(list);
            setUnreadCount(list.filter(n => !n.isRead).length);
        } catch { /* silent fail */ }
    }, [user]);

    // Poll every 30 seconds
    useEffect(() => {
        if (!user) return;

        // Small delay ensures token is stored before first fetch fires
        const initialTimer = setTimeout(() => {
            fetchNotifications();
        }, 500);

        intervalRef.current = setInterval(fetchNotifications, 30000);

        return () => {
            clearTimeout(initialTimer);
            clearInterval(intervalRef.current);
        };
    }, [user, fetchNotifications]);

    const markAsRead = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(prev =>
                prev.map(n => n._id === id ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch { /* ignore */ }
    };

    const markAllAsRead = async () => {
        try {
            await api.patch('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch { /* ignore */ }
    };

    const deleteAllRead = async () => {
        try {
            await api.delete('/notifications/read-all');
            setNotifications(prev => prev.filter(n => !n.isRead));
        } catch { /* ignore */ }
    };

    const deleteNotification = async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n._id !== id));
            setUnreadCount(prev => {
                const wasUnread = notifications.find(n => n._id === id && !n.isRead);
                return wasUnread ? Math.max(0, prev - 1) : prev;
            });
        } catch { /* ignore */ }
    };

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            fetchNotifications,
            markAsRead,
            markAllAsRead,
            deleteNotification,
            deleteAllRead,
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);