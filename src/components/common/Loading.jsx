const Loading = ({ message = 'Loading...' }) => (
    <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E2A5E] dark:border-violet-500 mr-3" />
        <span className="text-gray-500 dark:text-gray-400">{message}</span>
    </div>
);

export default Loading;