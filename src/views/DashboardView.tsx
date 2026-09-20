import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  GraduationCap,
  Briefcase,
  Rocket,
  Clock,
  Bookmark,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  FileText,
  Target,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Scholarship, Internship, Job, DeadlineItem, ApplicationItem } from '../types';
import { MatchBreakdownModal } from '../components/MatchBreakdownModal';

interface DashboardViewProps {
  onNavigate: (view: string) => void;
  onOpenMatchModal: (title: string, provider: string, skills: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenMatchModal,
}) => {
  const { user, profileCompletion, missingProfileFields } = useAuth();

  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [deadlines, setDeadlines] = useState<DeadlineItem[]>([]);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected item for Match Breakdown Modal
  const [selectedMatch, setSelectedMatch] = useState<{
    isOpen: boolean;
    title: string;
    provider: string;
    skills: string;
    data: any;
  }>({
    isOpen: false,
    title: '',
    provider: '',
    skills: '',
    data: null,
  });

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [schRes, intRes, jobRes, deadRes, appRes] = await Promise.all([
          fetch('/api/scholarships'),
          fetch('/api/internships'),
          fetch('/api/jobs'),
          fetch('/api/deadlines'),
          fetch('/api/applications'),
        ]);

        const [schData, intData, jobData, deadData, appData] = await Promise.all([
          schRes.json(),
          intRes.json(),
          jobRes.json(),
          deadRes.json(),
          appRes.json(),
        ]);

        setScholarships(schData.items?.slice(0, 3) || []);
        setInternships(intData.items?.slice(0, 3) || []);
        setJobs(jobData.items?.slice(0, 3) || []);
        setDeadlines(deadData.deadlines?.slice(0, 5) || []);
        setApplications(appData.items || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const handleInspectMatch = async (title: string, provider: string, skills: string) => {
    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunitySkills: skills }),
      });
      const data = await res.json();
      setSelectedMatch({
        isOpen: true,
        title,
        provider,
        skills,
        data,
      });
    } catch (err) {
      console.error('Failed to compute match:', err);
    }
  };

  const appliedCount = applications.filter((a) => a.status === 'Applied').length;
  const shortlistedCount = applications.filter((a) => a.status === 'Shortlisted' || a.status === 'Interview').length;
  const selectedCount = applications.filter((a) => a.status === 'Selected').length;

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white p-6 sm:p-8 shadow-xl shadow-blue-500/10">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-blue-200" />
            <span>Welcome back, {user?.name || 'Student'}!</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Ready to advance your career &amp; scholarship goals?
          </h1>

          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
            {user?.course || 'Undergraduate'} • {user?.college || 'College of Engineering & Technology'}
            {user?.skills ? ` • Skills: ${user.skills.split(',').slice(0, 3).join(', ')}` : ''}
          </p>

          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <button
              onClick={() => onNavigate('ai-recommendations')}
              className="px-4 py-2 rounded-xl bg-white text-blue-900 font-semibold text-xs hover:bg-blue-50 transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>AI Opportunity Matches</span>
            </button>
            <button
              onClick={() => onNavigate('resume-analyzer')}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs backdrop-blur-md transition-colors flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Analyze Resume</span>
            </button>
            <button
              onClick={() => onNavigate('career-roadmap')}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs backdrop-blur-md transition-colors flex items-center gap-1.5"
            >
              <Target className="w-3.5 h-3.5" />
              <span>My Career Roadmap</span>
            </button>
          </div>
        </div>
      </div>

      {/* Profile Completion Gauge Widget */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600" /> Profile Strength &amp; Readiness
            </span>
            <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">
              {profileCompletion}% Complete
            </span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                profileCompletion >= 80 ? 'bg-emerald-500' : profileCompletion >= 50 ? 'bg-blue-600' : 'bg-amber-500'
              }`}
              style={{ width: `${profileCompletion}%` }}
            />
          </div>

          {missingProfileFields.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Recommended to add:
              </span>
              {missingProfileFields.map((field, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                >
                  +{field}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              Excellent! Your student profile is 100% complete for optimal matching.
            </p>
          )}
        </div>

        <button
          onClick={() => onNavigate('profile')}
          className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors shrink-0 flex items-center gap-1.5"
        >
          <span>Update Profile</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Application Stage Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigate('applications')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-blue-300 transition-colors"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Total Applications
          </span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {applications.length}
          </p>
          <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
            View Kanban Board →
          </span>
        </div>

        <div
          onClick={() => onNavigate('applications')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-blue-300 transition-colors"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Applied / Submitted
          </span>
          <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
            {appliedCount}
          </p>
          <span className="text-[11px] text-slate-500">In review</span>
        </div>

        <div
          onClick={() => onNavigate('applications')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-amber-300 transition-colors"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Shortlisted / Interview
          </span>
          <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
            {shortlistedCount}
          </p>
          <span className="text-[11px] text-slate-500">Active rounds</span>
        </div>

        <div
          onClick={() => onNavigate('applications')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-emerald-300 transition-colors"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Offers Selected
          </span>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {selectedCount}
          </p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            Accepted &amp; Won
          </span>
        </div>
      </div>

      {/* Main Grid: Recommended Matches & Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Matched Opportunities for Student */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top Scholarships for User */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                <span>Recommended Scholarships</span>
              </h3>
              <button
                onClick={() => onNavigate('scholarships')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>View All ({scholarships.length}+)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {scholarships.map((s) => (
                <div
                  key={s.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {s.title}
                      </span>
                      {s.verified ? (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                          <ShieldCheck className="w-2.5 h-2.5" /> Verified
                        </span>
                      ) : null}
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {s.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {s.provider} • <span className="font-semibold text-emerald-600 dark:text-emerald-400">{s.amount}</span> • Deadline: {s.deadline}
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-1">
                      {s.eligibility}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleInspectMatch(s.title, s.provider, s.eligibility)}
                      className="px-2.5 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-bold text-xs hover:bg-blue-100 transition-colors flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>88% Match</span>
                    </button>
                    <button
                      onClick={() => onNavigate('scholarships')}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors"
                    >
                      Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Internships for User */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-600" />
                <span>Internships Aligned with Your Skills</span>
              </h3>
              <button
                onClick={() => onNavigate('internships')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {internships.map((i) => (
                <div
                  key={i.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {i.role}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                        {i.work_mode}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {i.company} • {i.location} • <span className="font-semibold text-indigo-600 dark:text-indigo-400">{i.stipend}</span>
                    </p>
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {i.skills.split(',').slice(0, 4).map((sk, idx) => (
                        <span
                          key={idx}
                          className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-400 font-mono"
                        >
                          {sk.trim()}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleInspectMatch(i.role, i.company, i.skills)}
                      className="px-2.5 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold text-xs hover:bg-indigo-100 transition-colors flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>92% Match</span>
                    </button>
                    <button
                      onClick={() => onNavigate('internships')}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Upcoming Deadlines & Fast Tools */}
        <div className="space-y-6">
          {/* Deadline Widget */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-rose-500" />
                <span>Upcoming Deadlines</span>
              </h4>
              <button
                onClick={() => onNavigate('deadlines')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Tracker →
              </button>
            </div>

            <div className="space-y-2.5">
              {deadlines.length > 0 ? (
                deadlines.map((d) => (
                  <div
                    key={d.id}
                    className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-slate-900 dark:text-white truncate max-w-[180px]">
                        {d.title}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          d.status === 'Due Today'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : d.status === 'Due Soon'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                        }`}
                      >
                        {d.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{d.organization}</span>
                      <span className="font-mono font-medium">{d.deadline}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 py-4 text-center">No active deadlines.</p>
              )}
            </div>
          </div>

          {/* AI Tools Quick Launcher */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-100 dark:border-indigo-900/50 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" /> AI Career Tools
            </h4>

            <div className="space-y-2">
              <button
                onClick={() => onNavigate('resume-analyzer')}
                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-left hover:border-indigo-400 transition-colors flex items-center justify-between group"
              >
                <div>
                  <p className="font-bold text-xs text-slate-900 dark:text-white">
                    ATS Resume Evaluator
                  </p>
                  <p className="text-[11px] text-slate-500">Audit score out of 100 with fixes</p>
                </div>
                <ArrowRight className="w-4 h-4 text-indigo-600 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => onNavigate('skill-gap')}
                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-left hover:border-indigo-400 transition-colors flex items-center justify-between group"
              >
                <div>
                  <p className="font-bold text-xs text-slate-900 dark:text-white">
                    Skill Gap Analyzer
                  </p>
                  <p className="text-[11px] text-slate-500">Find missing skills for target roles</p>
                </div>
                <ArrowRight className="w-4 h-4 text-indigo-600 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => onNavigate('career-roadmap')}
                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-left hover:border-indigo-400 transition-colors flex items-center justify-between group"
              >
                <div>
                  <p className="font-bold text-xs text-slate-900 dark:text-white">
                    7-Step Career Roadmap
                  </p>
                  <p className="text-[11px] text-slate-500">Check off learning milestones</p>
                </div>
                <ArrowRight className="w-4 h-4 text-indigo-600 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Match Breakdown Modal */}
      <MatchBreakdownModal
        isOpen={selectedMatch.isOpen}
        onClose={() => setSelectedMatch({ ...selectedMatch, isOpen: false })}
        title={selectedMatch.title}
        providerOrCompany={selectedMatch.provider}
        matchData={selectedMatch.data}
      />
    </div>
  );
};
