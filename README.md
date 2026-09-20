# CareerBridge 🎓
### Digital Career & Scholarship Resource Platform for Students

**CareerBridge** is a comprehensive, centralized digital platform designed to help students discover scholarships, internships, entry-level jobs, certifications, competitive exam roadmaps, and personalized AI-driven career guidance. By bringing fragmented educational and professional opportunities into a single intuitive interface, CareerBridge simplifies the student journey from college to career.

---

## 🌟 Key Highlights & Problem Solved

Students often face major challenges when preparing for their future:
- **Scattered Information**: Scholarships, internships, and job postings are dispersed across dozens of portals and government notice boards.
- **Unclear Eligibility & Missed Deadlines**: Students frequently miss critical scholarship cut-offs or apply to roles without meeting specific criteria.
- **Skill Gaps & Resume Blindspots**: Freshers struggle to understand what industry recruiters look for and how their current skills match up.
- **Lack of Structured Guidance**: Navigating career choices without personalized mentorship can be daunting.

**CareerBridge solves this with an end-to-end suite:**
1. Verified listings for scholarships, internships, and early-career jobs with instant eligibility checks.
2. An ATS Resume Analyzer that scores resumes against target job profiles and provides rewrite suggestions.
3. An AI Skill Gap Engine that charts custom learning paths with curated courses.
4. An integrated Kanban Application Tracker and Calendar Deadline Manager.
5. Multilingual AI Career Advisor ready to answer queries in English, Hindi, and regional languages.

---

## 🚀 Core Features

### 1. 🎓 Scholarship Discovery Engine
- **Granular Filters**: Search by degree level (High School, Undergraduate, Postgraduate, Ph.D.), funding type (Fully Funded, Partial, Tuition Waiver), provider (Government, Corporate, NGO, University), and income brackets.
- **Eligibility & Document Checklist**: Detailed requirements (minimum GPA, family income limits, necessary paperwork) clearly highlighted for each opportunity.
- **Official Direct Links**: Verified links to official application portals to prevent fraudulent listings.

### 2. 💼 Internships & Job Portal
- **Targeted for Students & Freshers**: Curated listings for summer internships, part-time opportunities, graduate trainee programs, and full-time junior positions.
- **Flexible Work Modes**: Filter by Remote, Hybrid, or On-site roles across various cities.
- **Stipend & Salary Transparency**: Clearly displayed stipend/compensation ranges and application deadlines.

### 3. 🤖 AI-Powered Career Suite (Google Gemini)
- **AI Recommendation Engine**: Calculates personalized match scores and detailed compatibility breakdowns based on the student's profile, skills, and interests.
- **ATS Resume Evaluator & Optimizer**: Analyzes pasted resume text against target roles, computing ATS compatibility scores, strengths, weaknesses, missing keywords, and recommended bullet point rewrites.
- **Skill Gap & Roadmap Analyzer**: Compares existing competencies with target job requirements, pinpointing exact skill deficits and prioritizing courses to bridge the gap.
- **Multilingual CareerBridge AI Advisor**: Context-aware interactive career counselor supporting career path explorations, interview preparation, and scholarship advice in multiple languages.

### 4. 📋 Application Kanban & Deadline Tracker
- **Drag-and-Drop Application Board**: Track progress across pipeline stages: *Wishlist*, *Applied*, *Interviewing*, *Offered*, and *Rejected*.
- **Deadline Countdown Alerts**: Visual countdowns with color-coded urgency indicators (e.g., closing in 3 days, 1 week, or next month) to ensure critical cut-offs are never missed.
- **Notes & Status History**: Attach interview dates, application portal login references, and personalized reminders to each submission.

### 5. 🗺️ Interactive Career Roadmaps & Course Catalog
- **Structured Career Paths**: In-depth step-by-step guides for Software Engineering, Data Science, Product Management, UI/UX Design, Cloud Architecture, Civil Services (UPSC), and more.
- **Interactive Checklists**: Save roadmap progress directly to your student dashboard.
- **Curated Course Library**: High-quality free and paid courses with direct links to platforms like NPTEL, Coursera, edX, freeCodeCamp, and YouTube.

### 6. 🔒 Profile Management & Role-Based Access
- **Comprehensive Student Profile**: Education history, GPA, college, graduation year, verified skills, project portfolio links, and stored resume content.
- **Admin Dashboard**: System metrics, resource management (create, update, and toggle verified status for opportunities), and full database schema inspection.

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 19, TypeScript | Modern, high-performance UI library |
| **Styling** | Tailwind CSS v4 | Utility-first responsive design and dark/light system |
| **Animations** | Motion (`motion/react`) | Fluid transitions, modal animations, and card reveals |
| **Icons** | Lucide React | Clean, modern visual iconography |
| **Effects** | Canvas Confetti | Celebration triggers on application milestones |
| **Backend** | Node.js, Express | RESTful API server handling business logic |
| **Database** | SQLite via `sql.js` (WebAssembly) | Portable, zero-config relational database with automatic persistence |
| **AI Integration** | `@google/genai` (Gemini API) | Server-side AI intelligence for resume scoring, recommendations, and chat |
| **Build Tools** | Vite & esbuild | Ultra-fast client and backend bundler |

---

## 📂 Project Architecture

```text
careerbridge/
├── server.ts                  # Express server entry point & Vite middleware
├── server/
│   ├── db.ts                  # SQLite Wasm database setup, schema & initial seed data
│   ├── gemini.ts              # Gemini API client with server-side AI handlers
│   └── routes.ts              # RESTful API endpoints (Auth, Resources, AI, Admin)
├── src/
│   ├── main.tsx               # Client entry point
│   ├── App.tsx                # Main view router & state management
│   ├── types.ts               # Shared TypeScript interfaces & types
│   ├── index.css              # Global styling & Tailwind CSS directives
│   ├── context/
│   │   ├── AuthContext.tsx    # User authentication & session state
│   │   └── ThemeContext.tsx   # Dark/light appearance switcher
│   ├── components/
│   │   ├── Navbar.tsx         # Global header with search, notifications, & auth
│   │   ├── Sidebar.tsx        # Collapsible primary navigation
│   │   ├── AiChatbot.tsx      # Floating interactive career assistant
│   │   ├── AuthModal.tsx      # Sign-in & registration dialog
│   │   ├── GlobalSearchModal.tsx # Unified Spotlight search across all resources
│   │   ├── MatchBreakdownModal.tsx # AI match score factor breakdown
│   │   └── DatabaseSchemaModal.tsx # Interactive database schema inspector
│   └── views/
│       ├── HomeView.tsx                   # Landing view with stats & featured items
│       ├── DashboardView.tsx              # Student summary overview
│       ├── ScholarshipsView.tsx           # Searchable scholarship directory
│       ├── InternshipsView.tsx            # Internship opportunities catalog
│       ├── JobsView.tsx                   # Entry-level job board
│       ├── CoursesView.tsx                # Course catalog & certification tracker
│       ├── CareerExplorerView.tsx         # Career path guide & salary insights
│       ├── CareerRoadmapChecklistView.tsx # Interactive milestone tracker
│       ├── AiRecommendationsView.tsx      # Smart recommendation feed
│       ├── ResumeAnalyzerView.tsx         # ATS score calculator & optimizer
│       ├── SkillGapView.tsx               # Target role gap evaluation
│       ├── ApplicationTrackerView.tsx     # Drag-and-drop Kanban board
│       ├── DeadlineTrackerView.tsx        # Timeline & urgent deadline alerts
│       ├── BookmarksView.tsx              # Saved opportunities
│       ├── ProfileView.tsx                # Student profile & resume details
│       └── AdminView.tsx                  # Administrative control & analytics
├── metadata.json              # Platform metadata and app specifications
├── package.json               # Dependencies and build scripts
└── .env.example               # Environment variable declarations
```

---

## 🚦 Getting Started

### Prerequisites
- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 9.0.0 or higher
- **Gemini API Key**: An API key from [Google AI Studio](https://aistudio.google.com/) for AI-powered features.

### Installation

1. **Clone or download the project files**:
   ```bash
   git clone <repository-url>
   cd careerbridge
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file in the root directory (refer to `.env.example`):
   ```env
   GEMINI_API_KEY="your-gemini-api-key-here"
   NODE_ENV="development"
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   The application will start on `http://localhost:3000`.

---

## 🔑 Demo Accounts

The application is pre-seeded with sample user accounts for quick testing:

| Role | Email | Password | Description |
| :--- | :--- | :--- | :--- |
| **Student** | `student@careerbridge.edu` | `student123` | Pre-populated with Computer Science degree, skills, saved bookmarks, and active applications |
| **Admin** | `admin@careerbridge.edu` | `admin123` | Full administrative access to add/edit listings and view analytics |

*Note: You can also register a brand-new student account using the "Sign Up" option in the top navigation.*

---

## 📡 Key API Endpoints

### Authentication & Profiles
- `POST /api/auth/register` — Register a new student account
- `POST /api/auth/login` — Sign in and receive an auth token
- `GET /api/auth/me` — Retrieve the current authenticated user profile
- `PUT /api/auth/profile` — Update student profile, skills, and resume text

### Resources & Opportunities
- `GET /api/scholarships` — Search and filter scholarships
- `POST /api/scholarships` — Create a new scholarship (Admin/Verified)
- `GET /api/internships` — List internship postings with location/stipend filters
- `GET /api/jobs` — Retrieve entry-level job opportunities
- `GET /api/courses` — Explore curated skill-building courses
- `GET /api/career-paths` — Retrieve career guides and salary benchmarks

### Student Tracker Tools
- `GET /api/bookmarks` — List bookmarked opportunities
- `POST /api/bookmarks` — Toggle a bookmark for any scholarship, job, or course
- `GET /api/applications` — Fetch Kanban applications with status tags
- `POST /api/applications` — Submit or update an application tracking card
- `GET /api/deadlines` — Retrieve upcoming deadlines sorted chronologically

### 24-Hour Deadline Email Reminder Service (Simulated Abstraction)
- `GET /api/reminders/status` — Inspect daemon status, tracked counts, and 24h urgent opportunities
- `POST /api/reminders/scan` — Trigger automated scanner over tracked items and dispatch simulated RFC-2822 emails
- `GET /api/reminders/logs` — Fetch sent email logs (mailbox simulation)
- `DELETE /api/reminders/logs` — Clear dispatched reminder audit logs
- `POST /api/reminders/simulate-deadline` — Helper to generate a sample deadline within 24h for end-to-end testing
- `POST /api/reminders/send-test` — Dispatch an immediate simulated reminder email for a specific opportunity

#### Service Abstraction Architecture:
- **Pluggable Transport (`IEmailTransport`)**: Decouples message composition from delivery mechanism. Includes `SimulatedEmailTransport` which logs to SQLite `email_reminders_log` table with HTML and plaintext bodies, and can seamlessly swap with Nodemailer/SendGrid/SES in production.
- **Deduplication Engine**: Records send history to ensure students are not spammed with duplicate reminder emails within the same 20-hour window.
- **Background Daemon**: Auto-triggers on server boot and runs periodically every 15 minutes to alert students on deadlines due within 24 hours.

### AI Features (Powered by Gemini)
- `POST /api/ai/recommendations` — Compute personalized match scores for the user's profile
- `POST /api/ai/resume-analyzer` — Perform an ATS audit on pasted resume text against a target position
- `POST /api/ai/skill-gap` — Identify missing competencies and generate a tailored roadmap
- `POST /api/ai/chat` — Send queries to the multilingual CareerBridge AI Counselor

### Admin & Schema
- `GET /api/admin/analytics` — Fetch aggregated platform metrics and opportunity counts
- `GET /api/database/schema` — Inspect SQLite table definitions and active row counts

---

## 📜 Build & Production Deployment

To generate an optimized production bundle:

```bash
# 1. Build Vite frontend and bundle backend server
npm run build

# 2. Run the production server
npm start
```

The compiled assets will be placed in `/dist`, and the self-contained backend server bundle will be generated at `dist/server.cjs`.

---

## 📄 License & Credits

Built as a digital career and scholarship enablement platform for students worldwide. Powered by React, Tailwind CSS, SQLite, and Google Gemini AI.
