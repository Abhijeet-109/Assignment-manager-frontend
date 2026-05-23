# Assignly — Frontend

> React.js + Tailwind CSS v4 frontend for the Assignly Assignment Management Platform.  
> Built as a full-stack MERN portfolio project following SDLC methodology.

**Live Demo:** [assignly-abhi.vercel.app](https://assignly-dev.vercel.app)  
**Backend Repo:** [github.com/Abhijeet-109/assignment-manager-backend](https://github.com/Abhijeet-109/assignment-manager-backend)

---

## Overview

Assignly is a role-based assignment management platform for academic environments. The frontend delivers three distinct dashboards — Admin, Teacher, and Student — each with tailored UI, real-time notifications, and full CRUD capabilities, all built in React with no UI library dependencies.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React.js 18 (Vite) |
| Styling | Tailwind CSS v4 (CSS-first `@theme`) |
| Routing | React Router DOM v6 |
| HTTP Client | Axios (interceptors + token injection) |
| State Management | React Context API |
| Build Tool | Vite |
| Deployment | Vercel |

---

## Features

### Role-Based Dashboards
- **Admin** — User management (CRUD), subject management, SuperAdmin controls (create admin accounts)
- **Teacher** — Create/edit/delete assignments, grade submissions, trigger rework, CSV export
- **Student** — View assigned work, submit files, track grades, resubmit on rework

### Key Capabilities
- **JWT Auth** — Login/Register with token stored in `localStorage`; token verified via `/auth/me` on app load
- **Real-Time Notifications** — 30-second polling via `usePolling` hook; unread badge on Navbar; "Clear read" action
- **Self-Upload Portal** — Students can privately track their own uploaded resources, independent of teacher assignments
- **CSV Export** — Teachers and Admins can export submission data as `.csv`
- **Dark / Light / System Theme** — ThemeContext persists preference to DB + localStorage fallback
- **Profile Management** — All roles can edit name, change password, upload avatar
- **Rework Flow** — Teacher grades as "needs rework" → student sees badge → resubmit enabled
- **Animated Landing Page** — Mouse-dodge orb physics, RAF scroll-reveal, transparent→solid navbar

---

## Project Structure

```
frontend/
├── public/
│   └── favicon.svg
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── assignment/     # AssignmentCard, AssignmentList, CreateAssignmentForm, SubmissionList
│   │   ├── auth/           # LoginForm, SignupForm, ProtectedRoute
│   │   ├── common/         # Navbar, Sidebar, Modal, Button, Card, Alert, Loading, UserAvatar
│   │   ├── student/        # GradeDisplay, StudentAssignmentList, SubmissionUpload
│   │   └── teacher/        # GradingPanel, ExportButton, AssignmentStatsCard, StudentSubmissionList
│   ├── context/
│   │   ├── AuthContext.jsx         # verifyToken, login, logout, user state
│   │   ├── NotificationContext.jsx # polling, unread count, clear read
│   │   ├── ThemeContext.jsx        # dark/light/system toggle
│   │   └── AppContext.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useApi.js
│   │   ├── useAssignments.js
│   │   ├── useFetch.js
│   │   ├── useNotification.js
│   │   └── usePolling.js           # 30s interval polling
│   ├── pages/
│   │   ├── LandingPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── ProfilePage.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── TeacherDashboard.jsx
│   │   ├── StudentDashboard.jsx
│   │   ├── admin/          # AdminHome, UserManagement, SubjectManagement
│   │   ├── teacher/        # TeacherHome, TeacherAssignments, TeacherSubmissions
│   │   └── student/        # StudentHome, StudentAssignments, StudentGrades, StudentSelfUploads
│   ├── services/
│   │   ├── api.js                  # Axios instance + request/response interceptors
│   │   ├── authService.js
│   │   ├── assignmentService.js
│   │   ├── submissionService.js
│   │   ├── notificationService.js
│   │   ├── selfUploadService.js
│   │   ├── exportService.js
│   │   └── userService.js
│   ├── utils/
│   │   ├── constants.js
│   │   ├── dateFormatter.js
│   │   ├── roleChecker.js
│   │   ├── compressImage.js
│   │   └── localStorage.js
│   ├── styles/
│   │   ├── globals.css             # Tailwind v4 @theme block (CSS vars, dark mode)
│   │   └── custom.css
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- Backend API running (see backend repo)

### Installation

```bash
git clone https://github.com/Abhijeet-109/assignly-frontend.git
cd assignly-frontend
npm install
```

### Environment Variables

Create a `.env` file in the root:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

For production, point to your Render backend URL.

### Run Dev Server

```bash
npm run dev
```

App runs at `http://localhost:5173`

---

## Design Decisions

| Decision | Reason |
|---|---|
| Tailwind CSS v4 with `@theme` | CSS-first token system; no `tailwind.config.js` for design tokens |
| Context API over Redux | Sufficient for 3-role app; avoids boilerplate overhead |
| Axios interceptors in `api.js` | Centralised token injection + 401 auto-logout |
| 30s polling over WebSockets | Simpler free-tier compatible notification delivery |
| Dark mode via CSS variables | All stat cards, filters, sidebars use `var(--color-*)` — no hardcoded Tailwind colors |
| Sub-router shell pattern | Each dashboard (Admin/Teacher/Student) has its own layout wrapper and nested routes |

---

## Deployment

Deployed on **Vercel** (free tier).

```bash
npm run build
# dist/ folder auto-deployed via Vercel GitHub integration
```

Set `VITE_API_BASE_URL` in Vercel's environment variable settings.

---

## Screenshots

> Landing Page · Admin Dashboard · Teacher Grading Panel · Student Assignment View

*(Add screenshots here)*

---

## Related

- **Backend:** [assignly-backend](https://github.com/Abhijeet-109/assignment-manager-backend)
- **Project Guide:** Built over 19 daily sprints following SDLC phases (Requirements → Design → Build → Test → Deploy)

---

## Author

**Abhijeet**  
MCA Student · Full Stack Developer  
[GitHub](https://github.com/Abhijeet-109)
