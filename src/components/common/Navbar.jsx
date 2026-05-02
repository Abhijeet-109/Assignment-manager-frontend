import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
    const { user } = useAuth();

    return (
        <header
            className="h-20 flex items-center justify-between px-8 shadow-sm flex-shrink-0 border-b"
            style={{
                backgroundColor: 'var(--bg-navbar)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
            }}
        >
            <p className="font-medium text-lg" style={{ color: 'var(--text-primary)' }}>
                Welcome back, <span className="font-bold" style={{ color: 'var(--text-heading)' }}>{user?.firstName || user?.name}</span>! 👋
            </p>
            <span className="font-semibold capitalize bg-[#1E2A5E] text-white px-3 py-1 rounded-full text-sm tracking-wide">
                {user?.role}
            </span>
        </header>
    );
};

export default Navbar;