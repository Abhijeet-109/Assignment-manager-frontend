// src/pages/TeacherDashboard.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Navbar  from '../components/common/Navbar';
import TeacherHome        from './teacher/TeacherHome';
import TeacherAssignments from './teacher/TeacherAssignments';
import TeacherSubmissions from './teacher/TeacherSubmissions';
import ProfilePage from './ProfilePage';


const TeacherDashboard = () => (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--bg-page)' }}>
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
            <Navbar />
            <main className="flex-1 p-6 overflow-y-auto">
                <Routes>
                    <Route index          element={<TeacherHome />} />
                    <Route path="assignments" element={<TeacherAssignments />} />
                    <Route path="submissions" element={<TeacherSubmissions />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="*"        element={<Navigate to="/teacher" replace />} />
                </Routes>
            </main>
        </div>
    </div>
);

export default TeacherDashboard;