import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Search,
  Filter,
  ShieldCheck,
  Bookmark,
  ExternalLink,
  Clock,
  Sparkles,
  MapPin,
  Building,
  CheckCircle2,
  Plus,
  X,
} from 'lucide-react';
import { Internship } from '../types';
import { MatchBreakdownModal } from '../components/MatchBreakdownModal';
import { useAuth } from '../context/AuthContext';

export const InternshipsView: React.FC = () => {
  const { user } = useAuth();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [workMode, setWorkMode] = useState('All');
  const [location, setLocation] = useState('All');

  // Bookmarks
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  // Modal Detail
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);

  // Match Modal
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
    fetchInternships();
    fetchBookmarks();
  }, [workMode, location]);

  const fetchInternships = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (workMode !== 'All') params.append('workMode', workMode);
      if (location !== 'All') params.append('location', location);

      const res = await fetch(`/api/internships?${params.toString()}`);
      const data = await res.json();
      setInternships(data.items || []);
    } catch (err) {
      console.error('Fetch internships error:', err);
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
        body: JSON.stringify({ resourceId: id, resourceType: 'internship' }),
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

  const handleInspectMatch = async (i: Internship) => {
    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunitySkills: i.skills,
          opportunityLocation: i.location,
        }),
      });
      const data = await res.json();
      setMatchModalData({
        isOpen: true,
        title: i.role,
        company: i.company,
        data,
      });
    } catch (err) {
      console.error('Match inspect error:', err);
    }
  };

  const handleTrackInKanban = async (i: Internship) => {
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunityId: i.id,
          opportunityType: 'internship',
          title: i.role,
          companyOrProvider: i.company,
          status: 'Applied',
          deadline: i.deadline,
          notes: `Stipend: ${i.stipend} • Duration: ${i.duration}. Work mode: ${i.work_mode}`,
        }),
      });
      if (res.ok) {
        setToastMsg(`Added "${i.role} at ${i.company}" to your Application Tracker!`);
        setTimeout(() => setToastMsg(null), 3500);
      }
    } catch (err) {
      console.error('Track application error:', err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Briefcase className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            <span>Internship Directory</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Curated student internships across engineering, data science, cybersecurity, and design
          </p>
        </div>

        <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300">
          Showing High-Learning Roles
        </span>
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div className="p-3.5 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-indigo-600" />
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
              placeholder="Search by role (e.g. Frontend, Machine Learning), company, or skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchInternships()}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={fetchInternships}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shrink-0"
          >
            Search Internships
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Work Mode:</span>
            <select
              value={workMode}
              onChange={(e) => setWorkMode(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium focus:outline-none"
            >
              <option value="All">All Modes</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
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
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi NCR">Delhi NCR</option>
              <option value="Remote">Remote / Work from Home</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 text-xs">Loading internships...</div>
      ) : internships.length === 0 ? (
        <div className="py-16 text-center text-slate-500 space-y-2">
          <p className="font-bold text-sm text-slate-700 dark:text-slate-300">No internships matched</p>
          <p className="text-xs">Try selecting 'All Locations' or broader search keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {internships.map((i) => {
            const isBookmarked = bookmarkedIds.has(i.id);
            return (
              <div
                key={i.id}
                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-lg hover:shadow-indigo-500/5 transition-all"
              >
                <div className="space-y-3">
                  {/* Top Bar */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-indigo-500" />
                      {i.company}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                        {i.work_mode}
                      </span>
                      <button
                        onClick={() => handleToggleBookmark(i.id)}
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

                  {/* Role Title */}
                  <h3
                    onClick={() => setSelectedInternship(i)}
                    className="font-bold text-sm text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors line-clamp-1"
                  >
                    {i.role}
                  </h3>

                  {/* Stipend & Duration */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Stipend</span>
                      <p className="font-extrabold text-indigo-600 dark:text-indigo-400">{i.stipend}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Duration</span>
                      <p className="font-semibold text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                        {i.duration}
                      </p>
                    </div>
                  </div>

                  {/* Location & Deadline */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" /> {i.location}
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-slate-400" /> Deadline: {i.deadline}
                    </span>
                  </div>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {i.skills.split(',').slice(0, 4).map((sk, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-400 font-mono"
                      >
                        {sk.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleInspectMatch(i)}
                    className="px-2.5 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold text-[11px] hover:bg-indigo-100 transition-colors flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>91% Match</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSelectedInternship(i)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => handleTrackInKanban(i)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1"
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

      {/* Detail Modal */}
      {selectedInternship && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-indigo-500" />
                  {selectedInternship.company} • {selectedInternship.location}
                </p>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {selectedInternship.role}
                </h2>
              </div>
              <button
                onClick={() => setSelectedInternship(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700 dark:text-slate-300">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Monthly Stipend</span>
                  <p className="font-extrabold text-sm text-indigo-600 dark:text-indigo-400 mt-0.5">
                    {selectedInternship.stipend}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Work Mode</span>
                  <p className="font-bold text-xs text-slate-900 dark:text-white mt-0.5">
                    {selectedInternship.work_mode}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Duration</span>
                  <p className="font-bold text-xs text-slate-900 dark:text-white mt-0.5">
                    {selectedInternship.duration}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Deadline</span>
                  <p className="font-bold text-xs text-slate-900 dark:text-white font-mono mt-0.5">
                    {selectedInternship.deadline}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-1.5">
                  Role Description &amp; Responsibilities
                </h4>
                <p className="leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-line">
                  {selectedInternship.description}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-1.5">
                  Required Technical Stack
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedInternship.skills.split(',').map((sk, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono text-xs font-semibold border border-indigo-100 dark:border-indigo-900"
                    >
                      {sk.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <button
                onClick={() => handleToggleBookmark(selectedInternship.id)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 font-semibold text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{bookmarkedIds.has(selectedInternship.id) ? 'Saved' : 'Save'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleTrackInKanban(selectedInternship);
                    setSelectedInternship(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold text-xs"
                >
                  Track in Kanban
                </button>
                <a
                  href={selectedInternship.official_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <span>Apply on Company Careers</span>
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
