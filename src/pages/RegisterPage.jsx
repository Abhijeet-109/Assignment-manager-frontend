import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register({ ...form, role: 'student' });
            navigate('/student');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F3F4F6] dark:bg-[#0F172A] flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white dark:bg-[#1E293B] rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-violet-900/30">

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-[#1E2A5E] dark:text-white">
                        Assign<span className="text-violet-600">ly</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Create your student account</p>
                </div>

                {error && (
                    <div className="mb-4 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                            <input
                                type="text" name="firstName" value={form.firstName}
                                onChange={handleChange} required placeholder="John"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0F172A] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                            <input
                                type="text" name="lastName" value={form.lastName}
                                onChange={handleChange} required placeholder="Doe"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0F172A] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                        <input
                            type="email" name="email" value={form.email}
                            onChange={handleChange} required placeholder="you@example.com"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0F172A] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                        <input
                            type="password" name="password" value={form.password}
                            onChange={handleChange} required placeholder="Min 6 characters"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0F172A] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                        />
                    </div>

                    <button
                        type="submit" disabled={loading}
                        className="w-full py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-semibold rounded-lg transition duration-200"
                    >
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="text-violet-600 hover:underline font-medium">Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;