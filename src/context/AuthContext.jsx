import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

// ── Helper: always attach .name so all components can use user.name ──
const normalize = (u) => ({
    ...u,
    name: `${u.firstName || ''} ${u.lastName || ''}`.trim()
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyToken = async () => {
            try {
                const token = localStorage.getItem('token');
                const storedUser = localStorage.getItem('user');
                if (!token || !storedUser || storedUser === 'undefined') {
                    setLoading(false);
                    return;
                }
                const { data } = await api.get('/auth/me');
                setUser(normalize(data.data.user));
            } catch {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        verifyToken();
    }, []);

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        const { token, user } = data.data;
        const normalizedUser = normalize(user);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(normalizedUser));
        setUser(normalizedUser);
        return normalizedUser;
    };

    const register = async (formData) => {
        const { data } = await api.post('/auth/signup', formData);
        const { token, user } = data.data;
        const normalizedUser = normalize(user);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(normalizedUser));
        setUser(normalizedUser);
        return normalizedUser;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
<AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);