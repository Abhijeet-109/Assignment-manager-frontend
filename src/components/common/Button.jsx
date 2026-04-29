const Button = ({ children, onClick, variant = 'primary', loading = false, disabled = false, className = '' }) => {
    const base = 'px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-[#1E2A5E] text-white hover:bg-blue-800',
        danger: 'bg-red-600 text-white hover:bg-red-700',
        ghost: 'border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700',
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            className={`${base} ${variants[variant]} ${className}`}
        >
            {loading ? 'Loading...' : children}
        </button>
    );
};

export default Button;