import React from 'react';
import {
  LayoutDashboard,
  Home,
  GraduationCap,
  Briefcase,
  Rocket,
  BookOpen,
  Compass,
  Sparkles,
  FileText,
  Target,
  Milestone,
  KanbanSquare,
  Clock,
  Bookmark,
  UserCheck,
  BarChart3,
  ShieldCheck,
  Database,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();

  const handleSelectView = (view: string) => {
    setActiveView(view);
    onClose();
  };

  const navItemClass = (view: string) => `
    w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left group
    ${
      activeView === view
        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 font-semibold'
        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
    }
  `;

  const iconClass = (view: string) => `
    w-4 h-4 shrink-0 transition-transform group-hover:scale-110
    ${activeView === view ? 'text-white' : 'text-slate-500 dark:text-slate-400'}
  `;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800
          flex flex-col transition-transform duration-200 ease-in-out lg:static lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              CB
            </div>
            <span className="font-bold text-slate-900 dark:text-white">CareerBridge</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
          {/* Main Group */}
          <div>
            <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Overview
            </p>
            <div className="space-y-1">
              <button
                id="nav-dashboard"
                onClick={() => handleSelectView('dashboard')}
                className={navItemClass('dashboard')}
              >
                <LayoutDashboard className={iconClass('dashboard')} />
                <span>Dashboard</span>
              </button>
              <button
                id="nav-home"
                onClick={() => handleSelectView('home')}
                className={navItemClass('home')}
              >
                <Home className={iconClass('home')} />
                <span>Home Landing</span>
              </button>
            </div>
          </div>

          {/* Discovery Group */}
          <div>
            <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Opportunities &amp; Courses
            </p>
            <div className="space-y-1">
              <button
                id="nav-scholarships"
                onClick={() => handleSelectView('scholarships')}
                className={navItemClass('scholarships')}
              >
                <GraduationCap className={iconClass('scholarships')} />
                <span>Scholarships</span>
              </button>
              <button
                id="nav-internships"
                onClick={() => handleSelectView('internships')}
                className={navItemClass('internships')}
              >
                <Briefcase className={iconClass('internships')} />
                <span>Internships</span>
              </button>
              <button
                id="nav-jobs"
                onClick={() => handleSelectView('jobs')}
                className={navItemClass('jobs')}
              >
                <Rocket className={iconClass('jobs')} />
                <span>Jobs</span>
              </button>
              <button
                id="nav-courses"
                onClick={() => handleSelectView('courses')}
                className={navItemClass('courses')}
              >
                <BookOpen className={iconClass('courses')} />
                <span>Courses &amp; Certs</span>
              </button>
              <button
                id="nav-career-explorer"
                onClick={() => handleSelectView('career-explorer')}
                className={navItemClass('career-explorer')}
              >
                <Compass className={iconClass('career-explorer')} />
                <span>Career Explorer</span>
              </button>
            </div>
          </div>

          {/* AI Career Suite Group */}
          <div>
            <div className="flex items-center justify-between px-3 mb-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> AI Career Suite
              </p>
              <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                Gemini
              </span>
            </div>
            <div className="space-y-1">
              <button
                id="nav-ai-recommendations"
                onClick={() => handleSelectView('ai-recommendations')}
                className={navItemClass('ai-recommendations')}
              >
                <Sparkles className={iconClass('ai-recommendations')} />
                <span>AI Recommendations</span>
              </button>
              <button
                id="nav-resume-analyzer"
                onClick={() => handleSelectView('resume-analyzer')}
                className={navItemClass('resume-analyzer')}
              >
                <FileText className={iconClass('resume-analyzer')} />
                <span>AI Resume Analyzer</span>
              </button>
              <button
                id="nav-skill-gap"
                onClick={() => handleSelectView('skill-gap')}
                className={navItemClass('skill-gap')}
              >
                <Target className={iconClass('skill-gap')} />
                <span>Skill Gap Analyzer</span>
              </button>
              <button
                id="nav-career-roadmap"
                onClick={() => handleSelectView('career-roadmap')}
                className={navItemClass('career-roadmap')}
              >
                <Milestone className={iconClass('career-roadmap')} />
                <span>My Career Roadmap</span>
              </button>
            </div>
          </div>

          {/* Student Productivity & Tracking */}
          <div>
            <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Application Management
            </p>
            <div className="space-y-1">
              <button
                id="nav-applications"
                onClick={() => handleSelectView('applications')}
                className={navItemClass('applications')}
              >
                <KanbanSquare className={iconClass('applications')} />
                <span>Application Tracker</span>
              </button>
              <button
                id="nav-deadlines"
                onClick={() => handleSelectView('deadlines')}
                className={navItemClass('deadlines')}
              >
                <Clock className={iconClass('deadlines')} />
                <span>Deadline Tracker</span>
              </button>
              <button
                id="nav-saved"
                onClick={() => handleSelectView('saved')}
                className={navItemClass('saved')}
              >
                <Bookmark className={iconClass('saved')} />
                <span>Saved Opportunities</span>
              </button>
              <button
                id="nav-profile"
                onClick={() => handleSelectView('profile')}
                className={navItemClass('profile')}
              >
                <UserCheck className={iconClass('profile')} />
                <span>Student Profile</span>
              </button>
              <button
                id="nav-analytics"
                onClick={() => handleSelectView('analytics')}
                className={navItemClass('analytics')}
              >
                <BarChart3 className={iconClass('analytics')} />
                <span>Student Analytics</span>
              </button>
            </div>
          </div>

          {/* Administration & Technical Architecture */}
          <div>
            <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Admin &amp; College Demo
            </p>
            <div className="space-y-1">
              <button
                id="nav-admin"
                onClick={() => handleSelectView('admin')}
                className={`
                  w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all text-left group
                  ${
                    activeView === 'admin'
                      ? 'bg-amber-600 text-white font-semibold shadow-md shadow-amber-500/25'
                      : 'text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Admin Dashboard</span>
                </div>
                {user?.role === 'admin' && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                    Live
                  </span>
                )}
              </button>
              <button
                id="nav-database"
                onClick={() => handleSelectView('database-guide')}
                className={navItemClass('database-guide')}
              >
                <Database className={iconClass('database-guide')} />
                <span>Database &amp; Schema</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <div className="rounded-xl p-2.5 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50">
            <p className="text-[11px] font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              SQLite Relational Engine
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              10 Tables • Gemini 3.8 Flash
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
