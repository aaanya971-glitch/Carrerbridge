import React from 'react';
import {
  GraduationCap,
  Search,
  Moon,
  Sun,
  User,
  ShieldCheck,
  Database,
  Sparkles,
  Menu,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  onOpenSearch: () => void;
  onOpenAuth: () => void;
  onOpenDbModal: () => void;
  onToggleSidebar: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSearch,
  onOpenAuth,
  onOpenDbModal,
  onToggleSidebar,
  activeView,
  setActiveView,
}) => {
  const { user, logout, loginAsDemoStudent, loginAsDemoAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [userDropdownOpen, setUserDropdownOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left: Mobile hamburger & Brand */}
        <div className="flex items-center gap-3">
          <button
            id="mobile-sidebar-toggle-btn"
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden focus:outline-none"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            onClick={() => setActiveView('home')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
                  Career<span className="text-blue-600 dark:text-blue-400">Bridge</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Student Platform
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block -mt-0.5">
                Careers • Scholarships • AI Guidance
              </p>
            </div>
          </button>
        </div>

        {/* Middle: Global Search Trigger */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <button
            id="global-search-trigger-btn"
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 shadow-xs transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              <span>Search scholarships, internships, jobs, courses...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono font-medium rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Mobile search icon button */}
          <button
            onClick={onOpenSearch}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Database Schema & Demo Guide Button */}
          <button
            id="db-schema-open-btn"
            onClick={onOpenDbModal}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="View Relational DB Schema & SQL Query Runner"
          >
            <Database className="w-3.5 h-3.5 text-indigo-500" />
            <span>DB &amp; Architecture</span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle Dark Mode"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600" />
            )}
          </button>

          {/* User Account / Role Switcher */}
          {user ? (
            <div className="relative">
              <button
                id="user-profile-menu-btn"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left text-xs leading-tight">
                  <p className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[110px]">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    {user.role === 'admin' ? (
                      <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-0.5">
                        <ShieldCheck className="w-2.5 h-2.5" /> Admin
                      </span>
                    ) : (
                      'Student'
                    )}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{user.name}</p>
                    <p className="text-slate-500 text-[11px] truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                      Role: {user.role === 'admin' ? 'Administrator' : 'Verified Student'}
                    </span>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => setActiveView('profile')}
                      className="w-full text-left px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                    >
                      <User className="w-3.5 h-3.5 text-slate-400" /> My Profile &amp; Resume
                    </button>
                    {user.role === 'admin' ? (
                      <button
                        onClick={() => setActiveView('admin')}
                        className="w-full text-left px-3 py-2 rounded-lg text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/50 flex items-center gap-2 font-medium"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" /> Admin Control Center
                      </button>
                    ) : (
                      <button
                        onClick={() => setActiveView('dashboard')}
                        className="w-full text-left px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-blue-500" /> Student Dashboard
                      </button>
                    )}
                  </div>

                  {/* Quick Evaluator Role Switcher */}
                  <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800">
                    <p className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Demo Quick Switch
                    </p>
                    <button
                      onClick={loginAsDemoStudent}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between"
                    >
                      <span>Switch to Student</span>
                      {user.role === 'student' && <span className="text-blue-500 font-bold">✓</span>}
                    </button>
                    <button
                      onClick={loginAsDemoAdmin}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between"
                    >
                      <span>Switch to Admin</span>
                      {user.role === 'admin' && <span className="text-amber-500 font-bold">✓</span>}
                    </button>
                  </div>

                  <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={logout}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                    >
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              id="login-register-open-btn"
              onClick={onOpenAuth}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/30 transition-colors"
            >
              Sign In / Register
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
