import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Search,
  Filter,
  ShieldCheck,
  Bookmark,
  ExternalLink,
  Clock,
  Sparkles,
  FileCheck,
  CheckCircle2,
  Calendar,
  IndianRupee,
  Layers,
  X,
  Plus,
} from 'lucide-react';
import { Scholarship } from '../types';
import { MatchBreakdownModal } from '../components/MatchBreakdownModal';
import { useAuth } from '../context/AuthContext';

export const ScholarshipsView: React.FC = () => {
  const { user } = useAuth();
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [educationLevel, setEducationLevel] = useState('All');
  const [category, setCategory] = useState('All');
  const [isGovernment, setIsGovernment] = useState(false);
  const [isFullyFunded, setIsFullyFunded] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // Bookmarked IDs
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  // Modal Detail
  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null);

  // Match Modal
  const [matchModalData, setMatchModalData] = useState<{
    isOpen: boolean;
    title: string;
    provider: string;
    data: any;
  }>({
    isOpen: false,
    title: '',
    provider: '',
    data: null,
  });

  const [applySuccessMsg, setApplySuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchScholarships();
    fetchBookmarks();
  }, [educationLevel, category, isGovernment, isFullyFunded, verifiedOnly]);

  const fetchScholarships = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (educationLevel !== 'All') params.append('educationLevel', educationLevel);
      if (category !== 'All') params.append('category', category);
      if (isGovernment) params.append('isGovernment', 'true');
      if (isFullyFunded) params.append('isFullyFunded', 'true');
      if (verifiedOnly) params.append('verifiedOnly', 'true');

      const res = await fetch(`/api/scholarships?${params.toString()}`);
      const data = await res.json();
      setScholarships(data.items || []);
    } catch (err) {
      console.error('Fetch scholarships error:', err);
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
      console.error('Failed to fetch bookmarks:', err);
    }
  };

  const handleToggleBookmark = async (id: string) => {
    try {
      const res = await fetch('/api/bookmarks/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resourceId: id, resourceType: 'scholarship' }),
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

  const handleInspectMatch = async (s: Scholarship) => {
    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunitySkills: s.eligibility,
          opportunityEducation: s.education_level,
          opportunityCategory: s.category,
        }),
      });
      const data = await res.json();
      setMatchModalData({
        isOpen: true,
        title: s.title,
        provider: s.provider,
        data,
      });
    } catch (err) {
      console.error('Match inspect error:', err);
    }
  };

  const handleTrackInKanban = async (s: Scholarship) => {
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunityId: s.id,
          opportunityType: 'scholarship',
          title: s.title,
          companyOrProvider: s.provider,
          status: 'Applied',
          deadline: s.deadline,
          notes: `Applied for ${s.amount} grant. Requires: ${s.required_documents || 'Marksheet & income certificate'}`,
        }),
      });
      if (res.ok) {
        setApplySuccessMsg(`Added "${s.title}" to your Application Tracker!`);
        setTimeout(() => setApplySuccessMsg(null), 3500);
      }
    } catch (err) {
      console.error('Track application error:', err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <GraduationCap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <span>Scholarship Finder</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Discover verified government schemes, private trust endowments, and research fellowships
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Anti-Scam Verified Listings</span>
          </span>
        </div>
      </div>

      {/* Success Alert */}
      {applySuccessMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{applySuccessMsg}</span>
        </div>
      )}

      {/* Search & Multi-Filters Toolbar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by scholarship title, provider (e.g. NSP, Tata, Reliance), or eligibility criteria..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchScholarships()}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={fetchScholarships}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shrink-0"
          >
            Filter Results
          </button>
        </div>

        {/* Dropdowns and Checkbox Filters */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Education Level */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Education:</span>
            <select
              value={educationLevel}
              onChange={(e) => setEducationLevel(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium focus:outline-none"
            >
              <option value="All">All Levels</option>
              <option value="Undergraduate">Undergraduate</option>
              <option value="Postgraduate">Postgraduate</option>
              <option value="Diploma">Diploma</option>
              <option value="Higher Secondary">Higher Secondary (12th)</option>
            </select>
          </div>

          {/* Category */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Category:</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium focus:outline-none"
            >
              <option value="All">All Categories</option>
              <option value="Merit-cum-Means">Merit-cum-Means</option>
              <option value="STEM">Women / STEM</option>
              <option value="Minority">Minority Students</option>
              <option value="Fellowship">International Fellowship</option>
            </select>
          </div>

          {/* Checkboxes */}
          <label className="flex items-center gap-1.5 cursor-pointer ml-auto font-medium text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={isGovernment}
              onChange={(e) => setIsGovernment(e.target.checked)}
              className="rounded text-blue-600 focus:ring-0"
            />
            <span>Govt Schemes Only</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={isFullyFunded}
              onChange={(e) => setIsFullyFunded(e.target.checked)}
              className="rounded text-blue-600 focus:ring-0"
            />
            <span>Fully Funded</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer font-medium text-emerald-600 dark:text-emerald-400 font-semibold">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-0"
            />
            <span>Verified Badge Only</span>
          </label>
        </div>
      </div>

      {/* Scholarships Card Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 text-xs">
          Loading vetted scholarships...
        </div>
      ) : scholarships.length === 0 ? (
        <div className="py-16 text-center text-slate-500 space-y-2">
          <p className="font-bold text-sm text-slate-700 dark:text-slate-300">No scholarships found</p>
          <p className="text-xs">Try loosening your search terms or unchecking some filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {scholarships.map((s) => {
            const isBookmarked = bookmarkedIds.has(s.id);
            return (
              <div
                key={s.id}
                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-lg hover:shadow-blue-500/5 transition-all"
              >
                <div className="space-y-3">
                  {/* Top line: Provider & Verified badge & Bookmark */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                      {s.provider}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {s.verified ? (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                          <ShieldCheck className="w-2.5 h-2.5" /> Verified
                        </span>
                      ) : null}
                      <button
                        onClick={() => handleToggleBookmark(s.id)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          isBookmarked
                            ? 'bg-amber-50 dark:bg-amber-950 text-amber-500 border-amber-200 dark:border-amber-800'
                            : 'text-slate-400 border-slate-200 dark:border-slate-700 hover:text-slate-600'
                        }`}
                        title={isBookmarked ? 'Remove bookmark' : 'Save opportunity'}
                      >
                        <Bookmark className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h3
                    onClick={() => setSelectedScholarship(s)}
                    className="font-bold text-sm text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors line-clamp-2 leading-snug"
                  >
                    {s.title}
                  </h3>

                  {/* Amount & Deadline */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Award</span>
                      <p className="font-extrabold text-emerald-600 dark:text-emerald-400">
                        {s.amount}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Deadline</span>
                      <p className="font-semibold text-slate-700 dark:text-slate-300 font-mono text-[11px] flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" /> {s.deadline}
                      </p>
                    </div>
                  </div>

                  {/* Eligibility snippet */}
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    <strong>Eligibility:</strong> {s.eligibility}
                  </p>
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleInspectMatch(s)}
                    className="px-2.5 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold text-[11px] hover:bg-blue-100 transition-colors flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>88% Match</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSelectedScholarship(s)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => handleTrackInKanban(s)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1"
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

      {/* Scholarship Detailed View Modal */}
      {selectedScholarship && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-slate-500">
                    {selectedScholarship.provider}
                  </span>
                  {selectedScholarship.verified ? (
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      <ShieldCheck className="w-2.5 h-2.5" /> Verified Official Scheme
                    </span>
                  ) : null}
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {selectedScholarship.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedScholarship(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700 dark:text-slate-300">
              {/* Highlight Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Scholarship Amount</span>
                  <p className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {selectedScholarship.amount}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Application Deadline</span>
                  <p className="font-bold text-xs text-slate-900 dark:text-white font-mono mt-0.5">
                    {selectedScholarship.deadline}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Education Level</span>
                  <p className="font-bold text-xs text-slate-900 dark:text-white mt-0.5">
                    {selectedScholarship.education_level}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Category</span>
                  <p className="font-bold text-xs text-slate-900 dark:text-white mt-0.5">
                    {selectedScholarship.category}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-1.5">
                  About this Scholarship
                </h4>
                <p className="leading-relaxed text-slate-600 dark:text-slate-300">
                  {selectedScholarship.description}
                </p>
              </div>

              {/* Eligibility */}
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-1.5">
                  Eligibility Criteria
                </h4>
                <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-blue-900 dark:text-blue-200 leading-relaxed">
                  {selectedScholarship.eligibility}
                </div>
              </div>

              {/* Required Documents Checklist */}
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-emerald-500" /> Required Documents for Application
                </h4>
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                  <p className="text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                    {selectedScholarship.required_documents || '1. Current Semester Mark Sheet, 2. Income Certificate, 3. College ID Card, 4. Bank Passbook copy, 5. Aadhaar Card.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <button
                onClick={() => handleToggleBookmark(selectedScholarship.id)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{bookmarkedIds.has(selectedScholarship.id) ? 'Saved' : 'Save'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleTrackInKanban(selectedScholarship);
                    setSelectedScholarship(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold text-xs"
                >
                  Track in Kanban
                </button>
                <a
                  href={selectedScholarship.official_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <span>Apply on Official Portal</span>
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
        providerOrCompany={matchModalData.provider}
        matchData={matchModalData.data}
      />
    </div>
  );
};
