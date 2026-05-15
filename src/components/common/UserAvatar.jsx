const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
};

const UserIcon = ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
    </svg>
);

const UserAvatar = ({ user, size = 'md', className = '' }) => {
    const sizeClass = sizes[size] || sizes.md;
    const avatarUrl = user?.avatar
        ? `${BACKEND_URL}/${user.avatar}?t=${user.updatedAt || '1'}`  // cache bust
        : null;

    if (avatarUrl) {
        return (
            <img
                src={avatarUrl}
                alt="avatar"
                className={`${sizeClass} rounded-full object-cover flex-shrink-0 ${className}`}
            />
        );
    }

    return (
        <div className={`${sizeClass} rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 text-slate-500 ${className}`}>
            <UserIcon className={size === 'lg' ? 'w-8 h-8' : size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} />
        </div>
    );
};

export default UserAvatar;