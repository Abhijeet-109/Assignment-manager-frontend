import { useNavigate } from 'react-router-dom'

const features = [
    { icon: '📋', title: 'Assignment Tracking', desc: 'Create, assign, and manage assignments across subjects with deadlines and status tracking.' },
    { icon: '📊', title: 'Grades & Reports', desc: 'Grade submissions, export CSV reports, and monitor student performance at a glance.' },
    { icon: '🔔', title: 'Real-Time Notifications', desc: 'Instant alerts keep students and teachers updated on assignments and grades.' },
    { icon: '👨‍🏫', title: 'Teacher Dashboard', desc: 'Manage subjects, review submissions, and grade students from one clean interface.' },
    { icon: '🎓', title: 'Student Portal', desc: 'View assignments, track deadlines, submit work, and monitor your own progress.' },
    { icon: '⚙️', title: 'Admin Control', desc: 'Full system control — manage users, roles, subjects and export data anytime.' },
]

const roles = [
    { role: 'Admin', color: 'border-purple-500', text: 'text-purple-600', desc: 'Manage users, subjects, and system-wide settings.' },
    { role: 'Teacher', color: 'border-blue-500', text: 'text-blue-600', desc: 'Create assignments, review submissions, grade students.' },
    { role: 'Student', color: 'border-green-500', text: 'text-green-600', desc: 'View tasks, submit work, track grades and progress.' },
]

const LandingPage = () => {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen flex flex-col font-sans">

            {/* NAVBAR */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0F172A]/90 backdrop-blur-sm text-white px-8 py-4 flex justify-between items-center border-b border-white/10">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">📋</span>
                    <span className="text-xl font-bold tracking-wide">Assignly</span>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/login')}
                        className="border border-white/30 text-white px-4 py-2 rounded-lg text-sm hover:bg-white/10 transition"
                    >
                        Log in
                    </button>
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                    >
                        Get Started →
                    </button>
                </div>
            </nav>

            {/* HERO */}
            <section className="bg-[#0F172A] text-white pt-36 pb-24 px-6 text-center relative overflow-hidden">
                {/* Glow blobs */}
                <div className="absolute top-10 left-1/4 w-96 h-96 bg-violet-700/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-700/20 rounded-full blur-3xl pointer-events-none" />

                <div className="relative max-w-3xl mx-auto">
                    <span className="inline-block bg-violet-600/20 text-violet-400 text-2x1 font-semibold px-3 py-1 rounded-full mb-6 border border-violet-500/30">
                        📚 Built for Academic Institutions
                    </span>
                    <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
                        The Smarter Way to<br />
                        <span className="text-violet-400">Manage Assignments</span>
                    </h1>
                    <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10">
                        A unified platform for admins, teachers, and students — manage assignments, grade submissions, and track progress all in one place.
                    </p>
                    <div className="flex justify-center gap-4 flex-wrap">
                        <button
                            onClick={() => navigate('/login')}
                            className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-7 py-3 rounded-lg transition text-sm"
                        >
                            Get Started Free →
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="border border-white/20 text-white px-7 py-3 rounded-lg hover:bg-white/10 transition text-sm"
                        >
                            Login to Dashboard
                        </button>
                    </div>
                </div>

                {/* Mock dashboard preview */}
                <div className="relative mt-16 max-w-4xl mx-auto rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                    <div className="bg-[#1E293B] px-4 py-2 flex gap-2 items-center border-b border-white/10">
                        <span className="w-3 h-3 rounded-full bg-red-400" />
                        <span className="w-3 h-3 rounded-full bg-yellow-400" />
                        <span className="w-3 h-3 rounded-full bg-green-400" />
                        <span className="ml-4 text-xs text-gray-400">assignly.app/dashboard</span>
                    </div>
                    <div className="bg-[#1E293B] p-6 grid grid-cols-3 gap-4">
                        {[
                            { label: 'Total Assignments', value: '24', color: 'border-violet-500' },
                            { label: 'Submissions Today', value: '8', color: 'border-blue-500' },
                            { label: 'Pending Reviews', value: '5', color: 'border-yellow-500' },
                        ].map(stat => (
                            <div key={stat.label} className={`bg-[#0F172A] rounded-lg p-4 border-l-4 ${stat.color}`}>
                                <div className="text-2xl font-bold text-white">{stat.value}</div>
                                <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
                            </div>
                        ))}
                        <div className="col-span-3 bg-[#0F172A] rounded-lg p-4">
                            <div className="text-xs text-gray-400 mb-3">Recent Assignments</div>
                            {['Data Structures – Due Tomorrow', 'Web Development – Due in 3 days', 'DBMS Lab Report – Submitted'].map((item, i) => (
                                <div key={i} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                                    <span className="text-sm text-gray-300">{item}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${i === 2 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                        {i === 2 ? 'Done' : 'Pending'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ROLES */}
            <section className="bg-[#F8FAFC] py-16 px-6">
                <h2 className="text-center text-3xl font-bold text-[#1E2A5E] mb-2">Built for Every Role</h2>
                <p className="text-center text-gray-500 mb-10 text-sm">One platform, three powerful experiences.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    {roles.map(r => (
                        <div key={r.role} className={`bg-white rounded-xl p-6 border-t-4 ${r.color} shadow-sm hover:shadow-md transition`}>
                            <h3 className={`text-lg font-bold mb-2 ${r.text}`}>{r.role}</h3>
                            <p className="text-gray-500 text-sm">{r.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* FEATURES */}
            <section className="bg-white py-16 px-6">
                <h2 className="text-center text-3xl font-bold text-[#1E2A5E] mb-2">Everything You Need</h2>
                <p className="text-center text-gray-500 mb-10 text-sm">All features included, no setup required.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {features.map(f => (
                        <div key={f.title} className="bg-[#F8FAFC] border border-gray-100 rounded-xl p-6 hover:shadow-md transition">
                            <div className="text-3xl mb-3">{f.icon}</div>
                            <h4 className="text-base font-semibold text-[#1E2A5E] mb-1">{f.title}</h4>
                            <p className="text-gray-500 text-sm">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA BANNER */}
            <section className="bg-gradient-to-r from-[#1E2A5E] to-[#6D28D9] py-16 px-6 text-white text-center">
                <h2 className="text-3xl font-bold mb-3">Ready to Get Started?</h2>
                <p className="text-gray-300 mb-8 text-sm">Join students and teachers already using Assignly.</p>
                <button
                    onClick={() => navigate('/login')}
                    className="bg-white text-[#1E2A5E] font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition"
                >
                    Start Now →
                </button>
            </section>

            {/* FOOTER */}
            <footer className="bg-[#0F172A] text-gray-500 text-center py-5 text-xs">
                © {new Date().getFullYear()} Assignly — Built by Abhijeet &nbsp;|&nbsp; MCA Sem II Project 
            </footer>

        </div>
    )
}

export default LandingPage