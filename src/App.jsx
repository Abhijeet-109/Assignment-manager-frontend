import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import { NotificationProvider } from './context/NotificationContext';

// Prevents logged-in users from accessing /login or /register
const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return null;
    if (user) {
        const dashMap = { admin: '/admin', teacher: '/teacher', student: '/student' };
        return <Navigate to={dashMap[user.role] || '/'} replace />;
    }
    return children;
};

function App() {
    return (
        <AuthProvider>
            <NotificationProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<LandingPage />} />

                        <Route path="/login" element={
                            <PublicRoute><LoginPage /></PublicRoute>
                        } />
                        <Route path="/register" element={
                            <PublicRoute><RegisterPage /></PublicRoute>
                        } />

                        <Route path="/admin/*" element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <AdminDashboard />
                            </ProtectedRoute>
                        } />
                        <Route path="/teacher/*" element={
                            <ProtectedRoute allowedRoles={['teacher']}>
                                <TeacherDashboard />
                            </ProtectedRoute>
                        } />
                        <Route path="/student/*" element={
                            <ProtectedRoute allowedRoles={['student']}>
                                <StudentDashboard />
                            </ProtectedRoute>
                        } />

                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </BrowserRouter>
            </NotificationProvider>
        </AuthProvider>
    );
}

export default App;