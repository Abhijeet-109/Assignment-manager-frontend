import { useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'

const useScrollReveal = () => {
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.classList.add('reveal-visible')
                    observer.unobserve(e.target)
                }
            }),
            { threshold: 0.15 }
        )
        document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
        return () => observer.disconnect()
    }, [])
}

const features = [
    { icon: '📋', title: 'Assignment Tracking', desc: 'Create, assign, and manage assignments across subjects with deadlines and status tracking.' },
    { icon: '📊', title: 'Grades & Reports', desc: 'Grade submissions, export CSV reports, and monitor student performance at a glance.' },
    { icon: '🔔', title: 'Real-Time Notifications', desc: 'Instant alerts keep students and teachers updated on assignments and grades.' },
    { icon: '👨‍🏫', title: 'Teacher Dashboard', desc: 'Manage subjects, review submissions, and grade students from one clean interface.' },
    { icon: '🎓', title: 'Student Portal', desc: 'View assignments, track deadlines, submit work, and monitor your own progress.' },
    { icon: '⚙️', title: 'Admin Control', desc: 'Full system control — manage users, roles, subjects and export data anytime.' },
]

const roles = [
    { role: 'Admin', color: 'border-purple-500', text: 'text-purple-600', bg: 'hover:bg-purple-50', desc: 'Manage users, subjects, and system-wide settings.' },
    { role: 'Teacher', color: 'border-blue-500', text: 'text-blue-600', bg: 'hover:bg-blue-50', desc: 'Create assignments, review submissions, grade students.' },
    { role: 'Student', color: 'border-green-500', text: 'text-green-600', bg: 'hover:bg-green-50', desc: 'View tasks, submit work, track grades and progress.' },
]

const LandingPage = () => {
    const navigate = useNavigate()
    const [scrolled, setScrolled] = useState(false)
    const orbSectionRef = useRef(null)
    useScrollReveal()

    // Navbar scroll
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10)
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    // JS Orbs — mouse dodging
    useEffect(() => {
        const section = orbSectionRef.current
        if (!section) return

        const orbs = [
            { x: 0.25, y: 0.25, vx: 0.00036, vy: 0.00024, size: 420, r: '139', g: '92', b: '246', op: 0.45 },
            { x: 0.72, y: 0.60, vx: -0.00024, vy: 0.00036, size: 360, r: '99', g: '102', b: '241', op: 0.38 },
            { x: 0.50, y: 0.82, vx: 0.00048, vy: -0.00024, size: 300, r: '168', g: '85', b: '247', op: 0.32 },
        ]

        let mouse = { x: -999, y: -999 }
        let W = section.offsetWidth
        let H = section.offsetHeight
        let animId

        const onMouse = (e) => { const r = section.getBoundingClientRect(); mouse.x = (e.clientX - r.left) / W; mouse.y = (e.clientY - r.top) / H }
        const onLeave = () => { mouse.x = -999; mouse.y = -999 }
        const onResize = () => { W = section.offsetWidth; H = section.offsetHeight }

        section.addEventListener('mousemove', onMouse)
        section.addEventListener('mouseleave', onLeave)
        window.addEventListener('resize', onResize)

        const els = orbs.map(o => {
            const el = document.createElement('div')
            el.style.cssText = `position:absolute;border-radius:50%;pointer-events:none;filter:blur(80px);will-change:left,top;`
            el.style.width = o.size + 'px'
            el.style.height = o.size + 'px'
            el.style.background = `rgba(${o.r},${o.g},${o.b},${o.op})`
            section.appendChild(el)
            return el
        })

        const tick = () => {
            orbs.forEach((o, i) => {
                const dx = o.x - mouse.x
                const dy = o.y - mouse.y
                const dist = Math.sqrt(dx * dx + dy * dy)
                if (dist < 0.28 && dist > 0) {
                    o.vx += (dx / dist) * 0.001
                    o.vy += (dy / dist) * 0.001
                }
                const speed = Math.sqrt(o.vx * o.vx + o.vy * o.vy)
                if (speed > 0.00144) { o.vx *= 0.00144 / speed; o.vy *= 0.00144 / speed }
                o.x += o.vx
                o.y += o.vy
                const hw = o.size / 2 / W
                const hh = o.size / 2 / H
                if (o.x < hw) { o.x = hw; o.vx = Math.abs(o.vx) }
                if (o.x > 1 - hw) { o.x = 1 - hw; o.vx = -Math.abs(o.vx) }
                if (o.y < hh) { o.y = hh; o.vy = Math.abs(o.vy) }
                if (o.y > 1 - hh) { o.y = 1 - hh; o.vy = -Math.abs(o.vy) }
                els[i].style.left = (o.x * W - o.size / 2) + 'px'
                els[i].style.top = (o.y * H - o.size / 2) + 'px'
            })
            animId = requestAnimationFrame(tick)
        }
        tick()

        return () => {
            cancelAnimationFrame(animId)
            section.removeEventListener('mousemove', onMouse)
            section.removeEventListener('mouseleave', onLeave)
            window.removeEventListener('resize', onResize)
            els.forEach(el => el.remove())
        }
    }, [])

    return (
        <>
            <style>{`
                .reveal { opacity: 0; transform: translateY(32px); transition: opacity 0.6s ease, transform 0.6s ease; }
                .reveal-visible { opacity: 1; transform: translateY(0); }
                .reveal-stagger > *:nth-child(1) { transition-delay: 0s; }
                .reveal-stagger > *:nth-child(2) { transition-delay: 0.12s; }
                .reveal-stagger > *:nth-child(3) { transition-delay: 0.14s; }
                .reveal-stagger > *:nth-child(4) { transition-delay: 0.16s; }
                .reveal-stagger > *:nth-child(5) { transition-delay: 0.18s; }
                .reveal-stagger > *:nth-child(6) { transition-delay: 0.16s; }
                .card-hover { transition: transform 0.25s ease, box-shadow 0.25s ease; }
                .card-hover:hover { transform: translateY(-6px) scale(1.02); box-shadow: 0 16px 40px rgba(0,0,0,0.12); }
                .navbar-solid { background: rgba(15,23,42,0.95); backdrop-filter: blur(12px); box-shadow: 0 1px 0 rgba(255,255,255,0.06); }
                .navbar-clear { background: transparent; backdrop-filter: none; }
            `}</style>

            <div className="min-h-screen flex flex-col font-sans">

                {/* NAVBAR */}
                <nav className={`fixed top-0 left-0 right-0 z-[999] text-white px-4 md:px-8 py-4 flex justify-between items-center transition-all duration-300 ${scrolled ? 'navbar-solid' : 'navbar-clear'}`}>
                    <div className="flex items-center gap-1 sm:gap-2">
                        <span className="text-xl sm:text-2xl flex-shrink-0">📋</span>
                        <span className="text-lg sm:text-xl font-bold tracking-wide">Assignly</span>
                    </div>
                    <div className="flex gap-1 sm:gap-3 items-center">
                        <button onClick={() => navigate('/login')} className="text-white/80 hover:text-white px-2 sm:px-4 py-2 text-sm transition whitespace-nowrap">
                            Log in
                        </button>
                        <button onClick={() => navigate('/login')} className="bg-violet-600 hover:bg-violet-700 text-white px-3 sm:px-5 py-2 rounded-lg text-sm font-semibold transition whitespace-nowrap">
                            Get Started →
                        </button>
                    </div>
                </nav>

                {/* HERO */}
                <section ref={orbSectionRef} className="bg-[#0F172A] text-white pt-40 pb-28 px-6 text-center relative">

                    <div className="relative z-10 max-w-3xl mx-auto">
                        <span className="inline-block bg-violet-600/20 text-violet-400 text-sm font-semibold px-4 py-1.5 rounded-full mb-6 border border-violet-500/30">
                            📚 Built for Academic Institutions
                        </span>
                        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 tracking-tight">
                            The Smarter Way to<br />
                            <span className="text-violet-400">Manage Assignments</span>
                        </h1>
                        <p className="text-gray-400 text-lg md:text-xl max-w-xl mx-auto mb-10">
                            A unified platform for admins, teachers, and students — manage assignments, grade submissions, and track progress all in one place.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4 flex-wrap">
                            <button onClick={() => navigate('/login')} className="w-full sm:w-auto bg-violet-600 hover:bg-violet-700 text-white font-semibold px-8 py-3.5 rounded-lg transition text-base">
                                Get Started Free →
                            </button>
                            <button onClick={() => navigate('/login')} className="w-full sm:w-auto border border-white/20 text-white px-8 py-3.5 rounded-lg hover:bg-white/10 transition text-base">
                                Login to Dashboard
                            </button>
                        </div>
                    </div>

                    {/* Dashboard mockup */}
                    <div className="reveal relative z-10 mt-20 max-w-5xl mx-auto rounded-2xl overflow-hidden border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.5)] hidden sm:block">
                        <div className="bg-[#1E293B] px-5 py-3 flex gap-2 items-center border-b border-white/10">
                            <span className="w-3.5 h-3.5 rounded-full bg-red-400" />
                            <span className="w-3.5 h-3.5 rounded-full bg-yellow-400" />
                            <span className="w-3.5 h-3.5 rounded-full bg-green-400" />
                            <span className="ml-4 text-sm text-gray-400">assignly.app/dashboard</span>
                        </div>
                        <div className="bg-[#1E293B] p-8 grid grid-cols-1 md:grid-cols-3 gap-5">
                            {[
                                { label: 'Total Assignments', value: '24', color: 'border-violet-500' },
                                { label: 'Submissions Today', value: '8', color: 'border-blue-500' },
                                { label: 'Pending Reviews', value: '5', color: 'border-yellow-500' },
                            ].map(stat => (
                                <div key={stat.label} className={`bg-[#0F172A] rounded-xl p-6 border-l-4 ${stat.color}`}>
                                    <div className="text-4xl font-bold text-white">{stat.value}</div>
                                    <div className="text-sm text-gray-400 mt-2">{stat.label}</div>
                                </div>
                            ))}
                            <div className="col-span-1 md:col-span-3 bg-[#0F172A] rounded-xl p-6">
                                <div className="text-sm text-gray-400 mb-4 font-medium">Recent Assignments</div>
                                {['Data Structures – Due Tomorrow', 'Web Development – Due in 3 days', 'DBMS Lab Report – Submitted'].map((item, i) => (
                                    <div key={i} className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
                                        <span className="text-base text-gray-300">{item}</span>
                                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${i === 2 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                            {i === 2 ? 'Done' : 'Pending'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ROLES */}
                <section className="bg-[#F8FAFC] py-20 px-6">
                    <div className="reveal">
                        <h2 className="text-center text-4xl font-bold text-[#1E2A5E] mb-2">Built for Every Role</h2>
                        <p className="text-center text-gray-500 mb-12 text-base">One platform, three powerful experiences.</p>
                    </div>
                    <div className="reveal reveal-stagger grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        {roles.map(r => (
                            <div key={r.role} className={`card-hover bg-white rounded-xl p-8 border-t-4 ${r.color} ${r.bg} shadow-sm cursor-pointer`}>
                                <h3 className={`text-xl font-bold mb-3 ${r.text}`}>{r.role}</h3>
                                <p className="text-gray-500 text-base">{r.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* FEATURES */}
                <section className="bg-white py-20 px-6">
                    <div className="reveal">
                        <h2 className="text-center text-4xl font-bold text-[#1E2A5E] mb-2">Everything You Need</h2>
                        <p className="text-center text-gray-500 mb-12 text-base">All features included, no setup required.</p>
                    </div>
                    <div className="reveal reveal-stagger grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {features.map(f => (
                            <div key={f.title} className="card-hover bg-[#F8FAFC] border border-gray-100 rounded-xl p-7 cursor-pointer">
                                <div className="text-4xl mb-4">{f.icon}</div>
                                <h4 className="text-lg font-semibold text-[#1E2A5E] mb-2">{f.title}</h4>
                                <p className="text-gray-500 text-base">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <section className="reveal bg-gradient-to-r from-[#1E2A5E] to-[#6D28D9] py-20 px-6 text-white text-center">
                    <h2 className="text-4xl font-bold mb-3">Ready to Get Started?</h2>
                    <p className="text-gray-300 mb-8 text-base">Join students and teachers already using Assignly.</p>
                    <button onClick={() => navigate('/login')} className="bg-white text-[#1E2A5E] font-semibold px-10 py-3.5 rounded-lg hover:bg-gray-100 transition text-base">
                        Start Now →
                    </button>
                </section>

                {/* FOOTER */}
                <footer className="bg-[#0F172A] text-gray-500 text-center py-5 text-sm">
                    © {new Date().getFullYear()} Assignly — Built by Abhijeet &nbsp;|&nbsp; MCA Sem II Project 
                </footer>

            </div>
        </>
    )
}

export default LandingPage