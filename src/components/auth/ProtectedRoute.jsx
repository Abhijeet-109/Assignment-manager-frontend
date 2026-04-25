import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
            <div className="text-gray-400 text-sm">Loading...</div>
        </div>
    );

    // Not logged in → home page
    if (!user) return <Navigate to="/" replace />;

    // Logged in but wrong role → their own dashboard
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        const dashMap = { admin: '/admin', teacher: '/teacher', student: '/student' };
        return <Navigate to={dashMap[user.role] || '/'} replace />;
    }

    return children;
};

export default ProtectedRoute;