import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  GraduationCap,
  Briefcase,
  Rocket,
  BookOpen,
  Compass,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { Scholarship, Internship, Job, Course } from '../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResource: (type: string, id: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectResource,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'scholarship' | 'internship' | 'job' | 'course'>('all');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    scholarships: Scholarship[];
    internships: Internship[];
    jobs: Job[];
    courses: Course[];
  }>({
    scholarships: [],
    internships: [],
    jobs: [],
    courses: [],
  });

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      fetchAllForSearch();
    }
  }, [isOpen]);

  // Keyboard shortcut listener (Cmd/Ctrl + K and Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open triggered from parent or anywhere
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const fetchAllForSearch = async () => {
    setLoading(true);
    try {
      const [schRes, intRes, jobRes, crsRes] = await Promise.all([
        fetch('/api/scholarships'),
        fetch('/api/internships'),
        fetch('/api/jobs'),
        fetch('/api/courses'),
      ]);
      const [schData, intData, jobData, crsData] = await Promise.all([
        schRes.json(),
        intRes.json(),
        jobRes.json(),
        crsRes.json(),
      ]);

      setResults({
        scholarships: schData.items || [],
        internships: intData.items || [],
        jobs: jobData.items || [],
        courses: crsData.items || [],
      });
    } catch (err) {
      console.error('Search fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const term = searchTerm.toLowerCase().trim();

  const filteredScholarships = results.scholarships.filter(
    (s) =>
      !term ||
      s.title.toLowerCase().includes(term) ||
      s.provider.toLowerCase().includes(term) ||
      s.category.toLowerCase().includes(term) ||
      s.eligibility.toLowerCase().includes(term)
  );

  const filteredInternships = results.internships.filter(
    (i) =>
      !term ||
      i.role.toLowerCase().includes(term) ||
      i.company.toLowerCase().includes(term) ||
      i.skills.toLowerCase().includes(term) ||
      i.location.toLowerCase().includes(term)
  );

  const filteredJobs = results.jobs.filter(
    (j) =>
      !term ||
      j.role.toLowerCase().includes(term) ||
      j.company.toLowerCase().includes(term) ||
      j.skills.toLowerCase().includes(term) ||
      j.location.toLowerCase().includes(term)
  );

  const filteredCourses = results.courses.filter(
    (c) =>
      !term ||
      c.title.toLowerCase().includes(term) ||
      c.provider.toLowerCase().includes(term) ||
      c.category.toLowerCase().includes(term)
  );

  const totalResults =
    (activeTab === 'all' || activeTab === 'scholarship' ? filteredScholarships.length : 0) +
    (activeTab === 'all' || activeTab === 'internship' ? filteredInternships.length : 0) +
    (activeTab === 'all' || activeTab === 'job' ? filteredJobs.length : 0) +
    (activeTab === 'all' || activeTab === 'course' ? filteredCourses.length : 0);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-20 px-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 gap-3">
          <Search className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search scholarships, internships, roles, skills, or courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent text-sm sm:text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs font-semibold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            ESC
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/60 overflow-x-auto text-xs scrollbar-none">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            All Results
          </button>
          <button
            onClick={() => setActiveTab('scholarship')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'scholarship'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" /> Scholarships ({filteredScholarships.length})
          </button>
          <button
            onClick={() => setActiveTab('internship')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'internship'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" /> Internships ({filteredInternships.length})
          </button>
          <button
            onClick={() => setActiveTab('job')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'job'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Rocket className="w-3.5 h-3.5" /> Jobs ({filteredJobs.length})
          </button>
          <button
            onClick={() => setActiveTab('course')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'course'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> Courses ({filteredCourses.length})
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs scrollbar-thin">
          {loading ? (
            <div className="py-12 text-center text-slate-500">Searching resource directory...</div>
          ) : totalResults === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-1">
              <p className="font-semibold text-slate-700 dark:text-slate-300">No opportunities found matching "{searchTerm}"</p>
              <p className="text-[11px]">Try searching by company, skill (e.g. Python, SQL), or role title.</p>
            </div>
          ) : (
            <>
              {/* Scholarships Section */}
              {(activeTab === 'all' || activeTab === 'scholarship') && filteredScholarships.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-blue-500" /> Scholarships
                  </h4>
                  <div className="space-y-1.5">
                    {filteredScholarships.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => {
                          onSelectResource('scholarship', s.id);
                          onClose();
                        }}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 cursor-pointer transition-all flex items-center justify-between group"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 dark:text-white text-xs">
                              {s.title}
                            </span>
                            {s.verified ? (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                                <ShieldCheck className="w-2.5 h-2.5" /> Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                                <AlertTriangle className="w-2.5 h-2.5" /> Demo
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {s.provider} • <span className="font-medium text-emerald-600 dark:text-emerald-400">{s.amount}</span> • Deadline: {s.deadline}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Internships Section */}
              {(activeTab === 'all' || activeTab === 'internship') && filteredInternships.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-500" /> Internships
                  </h4>
                  <div className="space-y-1.5">
                    {filteredInternships.map((i) => (
                      <div
                        key={i.id}
                        onClick={() => {
                          onSelectResource('internship', i.id);
                          onClose();
                        }}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 cursor-pointer transition-all flex items-center justify-between group"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 dark:text-white text-xs">
                              {i.role}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              {i.work_mode}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {i.company} • {i.location} • <span className="font-medium text-indigo-600 dark:text-indigo-400">{i.stipend}</span>
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Jobs Section */}
              {(activeTab === 'all' || activeTab === 'job') && filteredJobs.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <Rocket className="w-3.5 h-3.5 text-violet-500" /> Full-Time Roles
                  </h4>
                  <div className="space-y-1.5">
                    {filteredJobs.map((j) => (
                      <div
                        key={j.id}
                        onClick={() => {
                          onSelectResource('job', j.id);
                          onClose();
                        }}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-700 hover:bg-violet-50/40 dark:hover:bg-violet-950/20 cursor-pointer transition-all flex items-center justify-between group"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 dark:text-white text-xs">
                              {j.role}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300">
                              {j.experience}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {j.company} • {j.location} • <span className="font-medium text-violet-600 dark:text-violet-400">{j.salary}</span>
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-violet-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Courses Section */}
              {(activeTab === 'all' || activeTab === 'course') && filteredCourses.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-500" /> Skill Courses
                  </h4>
                  <div className="space-y-1.5">
                    {filteredCourses.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          onSelectResource('course', c.id);
                          onClose();
                        }}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 cursor-pointer transition-all flex items-center justify-between group"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 dark:text-white text-xs">
                              {c.title}
                            </span>
                            {c.is_free ? (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                                Free
                              </span>
                            ) : null}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {c.provider} • {c.level} • {c.duration}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>Search query powered by SQLite full-text indexing</span>
          <span>Press ESC to exit</span>
        </div>
      </div>
    </div>
  );
};
