import React from 'react';
import {
  GraduationCap,
  Briefcase,
  Rocket,
  BookOpen,
  Compass,
  Sparkles,
  FileText,
  Target,
  ShieldCheck,
  ArrowRight,
  Clock,
  Award,
  Users,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HomeViewProps {
  onNavigate: (view: string) => void;
  onOpenAuth: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onOpenAuth }) => {
  const { user, loginAsDemoStudent } = useAuth();

  const categories = [
    {
      id: 'scholarships',
      title: 'Verified Scholarships',
      desc: 'National & state merit-cum-means, girl-child STEM grants, and international fellowships.',
      icon: GraduationCap,
      color: 'from-blue-600 to-cyan-600',
      badge: '50+ Verified',
      action: () => onNavigate('scholarships'),
    },
    {
      id: 'internships',
      title: 'Summer & Winter Internships',
      desc: 'Remote, hybrid, and in-office research, engineering, and product cohorts with competitive stipends.',
      icon: Briefcase,
      color: 'from-indigo-600 to-blue-600',
      badge: 'High Stipend',
      action: () => onNavigate('internships'),
    },
    {
      id: 'jobs',
      title: 'Graduate Tech & Core Jobs',
      desc: 'Entry-level full-time software, cybersecurity, cloud, and consulting roles for final years and freshers.',
      icon: Rocket,
      color: 'from-violet-600 to-purple-600',
      badge: 'Freshers Friendly',
      action: () => onNavigate('jobs'),
    },
    {
      id: 'courses',
      title: 'Courses & Certifications',
      desc: 'Curated free technical courses, accredited industry certificates, and exam preparation roadmaps.',
      icon: BookOpen,
      color: 'from-emerald-600 to-teal-600',
      badge: 'Free & Certified',
      action: () => onNavigate('courses'),
    },
    {
      id: 'career-explorer',
      title: 'Career Explorer & Roadmaps',
      desc: 'Interactive step-by-step career path trees for 10 high-growth domains from novice to senior.',
      icon: Compass,
      color: 'from-amber-600 to-orange-600',
      badge: '10 Core Tracks',
      action: () => onNavigate('career-explorer'),
    },
    {
      id: 'resume-analyzer',
      title: 'AI Resume ATS Evaluator',
      desc: 'Instant Gemini-powered ATS scoring, keyword detection, missing skills audit, and formatting fixes.',
      icon: FileText,
      color: 'from-rose-600 to-pink-600',
      badge: 'Gemini 3.8',
      action: () => onNavigate('resume-analyzer'),
    },
    {
      id: 'skill-gap',
      title: 'Skill Gap & Roadmap Engine',
      desc: 'Compare your current coursework and projects against target job role expectations.',
      icon: Target,
      color: 'from-fuchsia-600 to-purple-600',
      badge: 'Actionable',
      action: () => onNavigate('skill-gap'),
    },
    {
      id: 'applications',
      title: 'Kanban Application Tracker',
      desc: 'Never lose track of your submitted applications with custom statuses and deadline reminders.',
      icon: Clock,
      color: 'from-sky-600 to-blue-600',
      badge: 'Due Date Alerts',
      action: () => onNavigate('applications'),
    },
  ];

  const stats = [
    { label: 'Verified Scholarships', value: '50+', icon: Award },
    { label: 'Active Internships & Jobs', value: '45+', icon: Briefcase },
    { label: 'Students Guided', value: '14,200+', icon: Users },
    { label: 'Financial Aid Tracked', value: '₹4.8 Cr', icon: ShieldCheck },
  ];

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-blue-50/80 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 border border-slate-200 dark:border-slate-800 p-8 sm:p-12 lg:p-16">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-400/10 dark:bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-indigo-400/10 dark:bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/80 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Digital Career &amp; Scholarship Resource Platform for Students</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Stop searching across 100 scattered tabs. Discover your next opportunity on{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
              CareerBridge
            </span>
            .
          </h1>

          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
            A single, student-friendly platform combining verified government scholarships, high-growth internships, entry-level jobs, interactive career path roadmaps, and Gemini AI career mentoring.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2 group"
            >
              <span>Explore Student Dashboard</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onNavigate('resume-analyzer')}
              className="px-5 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 font-semibold text-xs sm:text-sm transition-colors flex items-center gap-2"
            >
              <FileText className="w-4 h-4 text-rose-500" />
              <span>AI Resume Analyzer</span>
            </button>

            {!user && (
              <button
                onClick={loginAsDemoStudent}
                className="px-4 py-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-semibold text-xs sm:text-sm hover:bg-indigo-100 transition-colors"
              >
                1-Click Demo Login
              </button>
            )}
          </div>
        </div>

        {/* Live Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
          {stats.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100/70 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-extrabold text-slate-900 dark:text-white">
                    {s.value}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">{s.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Verification Safety Promise */}
      <section className="rounded-2xl p-5 sm:p-6 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-emerald-950 dark:text-emerald-200 flex items-center gap-2">
              Our Zero-Scam Verification Standard
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100">
                100% Student Safe
              </span>
            </h3>
            <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 mt-0.5 max-w-2xl">
              Every scholarship and internship listed with a <span className="font-semibold text-emerald-700 dark:text-emerald-300">Verified</span> badge is manually validated against official government portals (NSP, AICTE) or verified corporate career domains. No hidden registration fees, ever.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('scholarships')}
          className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shrink-0 shadow-xs transition-colors flex items-center gap-1.5"
        >
          <span>View Verified Grants</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </section>

      {/* 8 Feature Categories */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Explore Resource Categories
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Curated pathways for college students, diploma holders, and recent graduates
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.id}
                onClick={c.action}
                className="group relative p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-lg hover:shadow-blue-500/5 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${c.color} text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {c.badge}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {c.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {c.desc}
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                  <span>Explore Directory</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Fast Actions Banner */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1 */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white border border-indigo-800 relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-2 relative z-10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded-md border border-indigo-700">
              Interactive Guidance
            </span>
            <h3 className="text-xl font-bold">10 Detailed Tech &amp; Core Roadmaps</h3>
            <p className="text-xs text-indigo-200 leading-relaxed max-w-md">
              From Cybersecurity and Full Stack Web to Cloud Architecture and Data Science. View required beginner &amp; advanced skills, certifications, and career tree visualizers.
            </p>
          </div>
          <div className="pt-6 relative z-10">
            <button
              onClick={() => onNavigate('career-explorer')}
              className="px-4 py-2 rounded-xl bg-white text-indigo-950 font-semibold text-xs hover:bg-indigo-50 transition-colors flex items-center gap-1.5"
            >
              <span>Browse 10 Career Tracks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 2 */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-900 to-slate-900 text-white border border-purple-800 relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-2 relative z-10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded-md border border-purple-700">
              Multilingual AI Assistant
            </span>
            <h3 className="text-xl font-bold">Ask Sam &amp; Sarah in 6 Indian Languages</h3>
            <p className="text-xs text-purple-200 leading-relaxed max-w-md">
              Chat comfortably in English, Hindi, Marathi, Tamil, Malayalam, or Kannada. Get personalized interview tips, scholarship eligibility advice, and roadmap explanations.
            </p>
          </div>
          <div className="pt-6 relative z-10">
            <button
              onClick={() => {
                // Open chatbot floating trigger
                const btn = document.getElementById('ai-chatbot-floating-trigger-btn');
                if (btn) btn.click();
              }}
              className="px-4 py-2 rounded-xl bg-white text-purple-950 font-semibold text-xs hover:bg-purple-50 transition-colors flex items-center gap-1.5"
            >
              <span>Launch Multilingual Chat</span>
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
