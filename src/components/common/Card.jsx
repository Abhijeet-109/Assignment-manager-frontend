const Card = ({ children, className = '' }) => (
    <div className={`bg-white dark:bg-[#1E293B] rounded-xl shadow-sm p-6 ${className}`}>
        {children}
    </div>
);

export default Card;