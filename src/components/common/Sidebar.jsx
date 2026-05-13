import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const navItems = {
    admin: [
        { label: 'Dashboard', to: '/admin', d: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { label: 'Users', to: '/admin/users', d: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
        { label: 'Subjects', to: '/admin/subjects', d: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },

    ],
    teacher: [
        { label: 'Dashboard', to: '/teacher', d: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { label: 'Assignments', to: '/teacher/assignments', d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
        { label: 'Submissions', to: '/teacher/submissions', d: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    ],
    student: [
        { label: 'Dashboard', to: '/student', d: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { label: 'Assignments', to: '/student/assignments', d: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
        { label: 'My Uploads', to: '/student/self-uploads', d: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' },
        { label: 'Grades', to: '/student/grades', d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },

    ],
};

const NavIcon = ({ d }) => (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
    </svg>
);

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const links = navItems[user?.role] || [];
    const initial = user?.firstName?.[0]?.toUpperCase() || '?';
    const fullName = user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim();

    const handleLogout = async () => {
        try { await api.post('/auth/logout'); } catch { /* ignore */ }
        logout();
        navigate('/login');
    };

    return (
        <aside className="w-64 h-screen sticky top-0 bg-[#1E2A5E] text-white flex flex-col overflow-hidden flex-shrink-0">

            {/* ── Profile Block ── */}
            <div className="p-5 border-b border-blue-800 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-violet-500 flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {initial}
                    </div>
                    <div className="overflow-hidden">
                        <p className="font-semibold text-sm truncate">{fullName}</p>
                        <p className="text-xs text-blue-300 truncate">{user?.email}</p>
                    </div>
                </div>
            </div>

            {/* ── Nav Links ── (no overflow-y, all links always visible) */}
            <nav className="flex-1 p-3 space-y-1">
                {links.map(({ label, to, d }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to.split('/').length === 2}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${isActive
                                ? 'bg-violet-600 text-white font-semibold'
                                : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                            }`
                        }
                    >
                        <NavIcon d={d} />
                        {label}
                    </NavLink>
                ))}

                <div className="pt-3 mt-2 border-t border-blue-800">
                    <NavLink
                        to={`/${user?.role}/profile`}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${isActive
                                ? 'bg-violet-600 text-white font-semibold'
                                : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                            }`
                        }
                    >
                        <NavIcon d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        Profile
                    </NavLink>
                </div>
            </nav>

            {/* ── Logout at Bottom ── */}
            <div className="p-3 border-t border-blue-800 flex-shrink-0">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-blue-200 hover:bg-red-600 hover:text-white transition-colors"
                >
                    <NavIcon d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;