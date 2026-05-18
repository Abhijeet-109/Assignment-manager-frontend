// Path: frontend/src/pages/StudentDashboard.jsx

import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import StudentHome from './student/StudentHome';
import StudentAssignments from './student/StudentAssignments';
import StudentGrades from './student/StudentGrades';
import ProfilePage from './ProfilePage';
import StudentSelfUploads from './student/StudentSelfUploads';

const StudentDashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex flex-col md:flex-row h-screen overflow-hidden" style={{ backgroundColor: 'var(--bg-page)' }}>
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="flex-1 flex flex-col min-w-0">
                <Navbar onMenuClick={() => setSidebarOpen(true)} />
                <main className="flex-1 p-4 md:p-6 overflow-y-auto">
                    <Routes>
                        <Route index element={<StudentHome />} />
                        <Route path="assignments" element={<StudentAssignments />} />
                        <Route path="grades" element={<StudentGrades />} />
                        <Route path="self-uploads" element={<StudentSelfUploads />} />
                        <Route path="profile" element={<ProfilePage />} />
                        <Route path="*" element={<Navigate to="/student" replace />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

export default StudentDashboard;
