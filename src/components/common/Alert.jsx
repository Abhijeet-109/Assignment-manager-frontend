const Alert = ({ type = 'info', message }) => {
    if (!message) return null;
    const styles = {
        success: 'bg-green-50 text-green-800 border-green-200',
        error:   'bg-red-50 text-red-800 border-red-200',
        info:    'bg-blue-50 text-blue-800 border-blue-200',
    };
    return (
        <div className={`border rounded-lg px-4 py-3 text-sm ${styles[type]}`}>
            {message}
        </div>
    );
};

export default Alert;