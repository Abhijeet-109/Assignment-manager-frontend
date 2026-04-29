import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
    const { user } = useAuth();

    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
            {/* Left — Welcome message */}
            <p className="text-gray-700 font-medium text-base">
                Welcome back, <span className="font-bold text-[#1E2A5E]">{user?.firstName || user?.name}</span>! 👋
            </p>

            {/* Right — Role badge (15% bigger than before) */}
            <span className="font-semibold capitalize bg-[#1E2A5E] text-white px-3 py-1 rounded-full text-sm tracking-wide">
                {user?.role}
            </span>
        </header>
    );
};

export default Navbar;