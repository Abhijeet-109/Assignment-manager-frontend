import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // On app mount — rehydrate from localStorage
    // Login and register issues are solved 
    useEffect(() => {
        const verifyToken = async () => {
            try {
                const token = localStorage.getItem('token');
                const storedUser = localStorage.getItem('user');

                if (!token || !storedUser || storedUser === 'undefined') {
                    // Nothing in storage — definitely not logged in
                    setLoading(false);
                    return;
                }

                // Verify token is still valid on the server
                const { data } = await api.get('/auth/me');
                setUser(data.data.user);

            } catch {
                // Token expired or invalid — clear everything
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
        const { token, user } = data.data;          // ✅ correct: response.data.data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        return user;
    };

    const register = async (formData) => {
        const { data } = await api.post('/auth/signup', formData);
        const { token, user } = data.data;          // ✅ same pattern
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        return user;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook — clean import in any component
export const useAuth = () => useContext(AuthContext);