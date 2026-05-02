import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import StudentHome from './student/StudentHome';
import StudentAssignments from './student/StudentAssignments';
import StudentGrades from './student/StudentGrades';

const StudentDashboard = () => {
    return (
        <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--bg-page)' }}>
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <Navbar />
                <main className="flex-1 p-6 overflow-y-auto">
                    <Routes>
                        <Route index element={<StudentHome />} />
                        <Route path="assignments" element={<StudentAssignments />} />
                        <Route path="grades" element={<StudentGrades />} />
                        <Route path="*" element={<Navigate to="/student" replace />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

export default StudentDashboard;