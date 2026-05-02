import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DIVISIONS   = ['A', 'B', 'C'];
const DEPARTMENTS = ['MCA', 'MBA'];
const SEMESTERS   = [1, 2, 3, 4];

const inp = "w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0F172A] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition text-sm";
const lbl = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

const RegisterPage = () => {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        firstName: '', lastName: '', email: '', password: '',
        enrollmentNumber: '', department: '', semester: '', division: '',
    });
    const [error, setError]     = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.division) return setError('Please select a division.');
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
        <div className="min-h-screen bg-[#F3F4F6] dark:bg-[#0F172A] flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-lg bg-white dark:bg-[#1E293B] rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-violet-900/30">

                {/* Header */}
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-[#1E2A5E] dark:text-white">
                        Assign<span className="text-violet-600">ly</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Create your student account</p>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-4 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* First + Last Name */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={lbl}>First Name</label>
                            <input type="text" name="firstName" value={form.firstName}
                                onChange={handleChange} required placeholder="John" className={inp} />
                        </div>
                        <div>
                            <label className={lbl}>Last Name</label>
                            <input type="text" name="lastName" value={form.lastName}
                                onChange={handleChange} required placeholder="Doe" className={inp} />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className={lbl}>Email</label>
                        <input type="email" name="email" value={form.email}
                            onChange={handleChange} required placeholder="you@college.edu" className={inp} />
                    </div>

                    {/* Password */}
                    <div>
                        <label className={lbl}>Password</label>
                        <input type="password" name="password" value={form.password}
                            onChange={handleChange} required placeholder="Min 8 characters" className={inp} />
                    </div>

                    {/* Enrollment Number */}
                    <div>
                        <label className={lbl}>Enrollment Number</label>
                        <input type="text" name="enrollmentNumber" value={form.enrollmentNumber}
                            onChange={handleChange} required placeholder="e.g. MCA2024001" className={inp} />
                    </div>

                    {/* Department + Semester */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={lbl}>Department</label>
                            <select name="department" value={form.department}
                                onChange={handleChange} required className={inp}>
                                <option value="">Select</option>
                                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={lbl}>Semester</label>
                            <select name="semester" value={form.semester}
                                onChange={handleChange} required className={inp}>
                                <option value="">Select</option>
                                {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Division Toggle */}
                    <div>
                        <label className={lbl}>Division</label>
                        <div className="flex gap-3">
                            {DIVISIONS.map(d => (
                                <button type="button" key={d}
                                    onClick={() => setForm({ ...form, division: d })}
                                    className={`flex-1 py-2.5 rounded-lg border text-sm font-semibold transition
                                        ${form.division === d
                                            ? 'bg-violet-600 text-white border-violet-600'
                                            : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-violet-400'
                                        }`}>
                                    Div {d}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Submit */}
                    <button type="submit" disabled={loading}
                        className="w-full py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-semibold rounded-lg transition duration-200 mt-2">
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