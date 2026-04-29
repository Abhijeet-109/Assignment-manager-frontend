// src/pages/AdminDashboard.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import AdminHome from './admin/AdminHome';
import UserManagement from './admin/UserManagement';

const AdminDashboard = () => {
    return (
        <div className="flex min-h-screen bg-[#F3F4F6] dark:bg-[#0F172A]">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Navbar />
                <main className="flex-1 p-6 overflow-y-auto">
                    <Routes>
                        <Route index element={<AdminHome />} />
                        <Route path="users" element={<UserManagement />} />
                        <Route path="*" element={<Navigate to="/admin" replace />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;