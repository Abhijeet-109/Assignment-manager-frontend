// Path: frontend/src/pages/TeacherDashboard.jsx

import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import TeacherHome from './teacher/TeacherHome';
import TeacherAssignments from './teacher/TeacherAssignments';
import TeacherSubmissions from './teacher/TeacherSubmissions';
import ProfilePage from './ProfilePage';

const TeacherDashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--bg-page)' }}>
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="flex-1 flex flex-col min-w-0">
                <Navbar onMenuClick={() => setSidebarOpen(true)} />
                <main className="flex-1 p-4 md:p-6 overflow-y-auto">
                    <Routes>
                        <Route index element={<TeacherHome />} />
                        <Route path="assignments" element={<TeacherAssignments />} />
                        <Route path="submissions" element={<TeacherSubmissions />} />
                        <Route path="profile" element={<ProfilePage />} />
                        <Route path="*" element={<Navigate to="/teacher" replace />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

export default TeacherDashboard;
