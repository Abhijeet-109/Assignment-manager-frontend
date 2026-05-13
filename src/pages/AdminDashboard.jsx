import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import AdminHome from './admin/AdminHome';
import UserManagement from './admin/UserManagement';
import SubjectManagement from './admin/SubjectManagement';
import ProfilePage from './ProfilePage';

const AdminDashboard = () => {
    return (
        <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--bg-page)' }}>
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <Navbar />
                <main className="flex-1 p-6 overflow-y-auto">
                    <Routes>
                        <Route index element={<AdminHome />} />
                        <Route path="users" element={<UserManagement />} />
                        <Route path="subjects" element={<SubjectManagement />} />
                        <Route path="profile" element={<ProfilePage />} />
                        <Route path="*" element={<Navigate to="/admin" replace />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;