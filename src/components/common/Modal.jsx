const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
            />
            {/* Panel */}
            <div
                className="relative z-10 w-full max-w-lg mx-4 rounded-xl shadow-xl p-6"
                style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold" style={{ color: 'var(--text-heading)' }}>
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl font-bold"
                    >
                        ✕
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};

export default Modal;