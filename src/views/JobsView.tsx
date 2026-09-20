import React, { useState, useEffect } from 'react';
import {
  Rocket,
  Search,
  Bookmark,
  ExternalLink,
  Clock,
  Sparkles,
  MapPin,
  Building,
  CheckCircle2,
  Plus,
  X,
  Briefcase,
} from 'lucide-react';
import { Job } from '../types';
import { MatchBreakdownModal } from '../components/MatchBreakdownModal';
import { useAuth } from '../context/AuthContext';

export const JobsView: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [workMode, setWorkMode] = useState('All');
  const [location, setLocation] = useState('All');

  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const [matchModalData, setMatchModalData] = useState<{
    isOpen: boolean;
    title: string;
    company: string;
    data: any;
  }>({
    isOpen: false,
    title: '',
    company: '',
    data: null,
  });

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
    fetchBookmarks();
  }, [workMode, location]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (workMode !== 'All') params.append('workMode', workMode);
      if (location !== 'All') params.append('location', location);

      const res = await fetch(`/api/jobs?${params.toString()}`);
      const data = await res.json();
      setJobs(data.items || []);
    } catch (err) {
      console.error('Fetch jobs error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookmarks = async () => {
    try {
      const res = await fetch('/api/bookmarks');
      const data = await res.json();
      const ids = new Set<string>((data.items || []).map((b: any) => b.resource_id));
      setBookmarkedIds(ids);
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
    }
  };

  const handleToggleBookmark = async (id: string) => {
    try {
      const res = await fetch('/api/bookmarks/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resourceId: id, resourceType: 'job' }),
      });
      const data = await res.json();
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        if (data.bookmarked) next.add(id);
        else next.delete(id);
        return next;
      });
    } catch (err) {
      console.error('Error toggling bookmark:', err);
    }
  };

  const handleInspectMatch = async (j: Job) => {
    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunitySkills: j.skills,
          opportunityLocation: j.location,
        }),
      });
      const data = await res.json();
      setMatchModalData({
        isOpen: true,
        title: j.role,
        company: j.company,
        data,
      });
    } catch (err) {
      console.error('Match inspect error:', err);
    }
  };

  const handleTrackInKanban = async (j: Job) => {
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunityId: j.id,
          opportunityType: 'job',
          title: j.role,
          companyOrProvider: j.company,
          status: 'Applied',
          deadline: j.deadline,
          notes: `Compensation: ${j.salary} • Experience: ${j.experience}`,
        }),
      });
      if (res.ok) {
        setToastMsg(`Added "${j.role} at ${j.company}" to Application Tracker!`);
        setTimeout(() => setToastMsg(null), 3500);
      }
    } catch (err) {
      console.error('Track error:', err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Rocket className="w-8 h-8 text-violet-600 dark:text-violet-400" />
            <span>Entry-Level &amp; Graduate Jobs</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Verified full-time openings designed specifically for college freshers and early graduates
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-violet-50 dark:bg-violet-950/60 border border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300">
          Campus &amp; Off-Campus Cohorts
        </span>
      </div>

      {toastMsg && (
        <div className="p-3.5 rounded-2xl bg-violet-100 dark:bg-violet-950 text-violet-800 dark:text-violet-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-violet-600" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Search & Filters */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by job title (e.g. SDE-1, Cloud Engineer), company, or skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchJobs()}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <button
            onClick={fetchJobs}
            className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs transition-colors shrink-0"
          >
            Search Jobs
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Work Mode:</span>
            <select
              value={workMode}
              onChange={(e) => setWorkMode(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium focus:outline-none"
            >
              <option value="All">All Modes</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Remote">Remote</option>
              <option value="On-site">On-site</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Location:</span>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium focus:outline-none"
            >
              <option value="All">All Locations</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Pune">Pune</option>
              <option value="Gurugram">Gurugram / NCR</option>
              <option value="All India">All India / Pan India</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 text-xs">Loading graduate job openings...</div>
      ) : jobs.length === 0 ? (
        <div className="py-16 text-center text-slate-500 space-y-2">
          <p className="font-bold text-sm text-slate-700 dark:text-slate-300">No jobs found matching criteria</p>
          <p className="text-xs">Try selecting 'All Locations' or broader search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobs.map((j) => {
            const isBookmarked = bookmarkedIds.has(j.id);
            return (
              <div
                key={j.id}
                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between hover:border-violet-400 dark:hover:border-violet-600 hover:shadow-lg hover:shadow-violet-500/5 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-violet-500" />
                      {j.company}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300">
                        {j.experience}
                      </span>
                      <button
                        onClick={() => handleToggleBookmark(j.id)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          isBookmarked
                            ? 'bg-amber-50 dark:bg-amber-950 text-amber-500 border-amber-200 dark:border-amber-800'
                            : 'text-slate-400 border-slate-200 dark:border-slate-700 hover:text-slate-600'
                        }`}
                        title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
                      >
                        <Bookmark className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>
                  </div>

                  <h3
                    onClick={() => setSelectedJob(j)}
                    className="font-bold text-sm text-slate-900 dark:text-white hover:text-violet-600 dark:hover:text-violet-400 cursor-pointer transition-colors line-clamp-1"
                  >
                    {j.role}
                  </h3>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Compensation</span>
                      <p className="font-extrabold text-violet-600 dark:text-violet-400">{j.salary}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Mode</span>
                      <p className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                        {j.work_mode}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" /> {j.location}
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-slate-400" /> Deadline: {j.deadline}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {j.skills.split(',').slice(0, 4).map((sk, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-400 font-mono"
                      >
                        {sk.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleInspectMatch(j)}
                    className="px-2.5 py-1.5 rounded-lg border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 font-bold text-[11px] hover:bg-violet-100 transition-colors flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>89% Match</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSelectedJob(j)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => handleTrackInKanban(j)}
                      className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1"
                    >
                      <span>Track</span>
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-violet-500" />
                  {selectedJob.company} • {selectedJob.location}
                </p>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {selectedJob.role}
                </h2>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700 dark:text-slate-300">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Compensation</span>
                  <p className="font-extrabold text-sm text-violet-600 dark:text-violet-400 mt-0.5">
                    {selectedJob.salary}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Experience</span>
                  <p className="font-bold text-xs text-slate-900 dark:text-white mt-0.5">
                    {selectedJob.experience}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Work Mode</span>
                  <p className="font-bold text-xs text-slate-900 dark:text-white mt-0.5">
                    {selectedJob.work_mode}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Deadline</span>
                  <p className="font-bold text-xs text-slate-900 dark:text-white font-mono mt-0.5">
                    {selectedJob.deadline}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-1.5">
                  About the Role &amp; Expectations
                </h4>
                <p className="leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-line">
                  {selectedJob.description}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-1.5">
                  Technical Stack
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedJob.skills.split(',').map((sk, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 font-mono text-xs font-semibold border border-violet-100 dark:border-violet-900"
                    >
                      {sk.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <button
                onClick={() => handleToggleBookmark(selectedJob.id)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 font-semibold text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{bookmarkedIds.has(selectedJob.id) ? 'Saved' : 'Save'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleTrackInKanban(selectedJob);
                    setSelectedJob(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300 font-semibold text-xs"
                >
                  Track in Kanban
                </button>
                <a
                  href={selectedJob.official_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <span>Apply on Company Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Match Breakdown Modal */}
      <MatchBreakdownModal
        isOpen={matchModalData.isOpen}
        onClose={() => setMatchModalData({ ...matchModalData, isOpen: false })}
        title={matchModalData.title}
        providerOrCompany={matchModalData.company}
        matchData={matchModalData.data}
      />
    </div>
  );
};
