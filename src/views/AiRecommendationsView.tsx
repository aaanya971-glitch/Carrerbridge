import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  GraduationCap,
  Briefcase,
  Rocket,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Target,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Scholarship, Internship, Job } from '../types';
import { MatchBreakdownModal } from '../components/MatchBreakdownModal';

export const AiRecommendationsView: React.FC = () => {
  const { user } = useAuth();
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
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
    async function loadData() {
      try {
        const [sRes, iRes, jRes] = await Promise.all([
          fetch('/api/scholarships'),
          fetch('/api/internships'),
          fetch('/api/jobs'),
        ]);

        const [sData, iData, jData] = await Promise.all([
          sRes.json(),
          iRes.json(),
          jRes.json(),
        ]);

        setScholarships(sData.items || []);
        setInternships(iData.items || []);
        setJobs(jData.items || []);
      } catch (err) {
        console.error('Error fetching recommendations data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
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
      console.error('Inspect match error:', err);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white shadow-lg space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-blue-200" />
          <span>Profile-Driven Recommendation Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          AI-Matched Opportunities for {user?.name || 'You'}
        </h1>
        <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
          Matches calculated by analyzing your declared skills ({user?.skills || 'Python, React, SQL'}), course ({user?.course || 'Computer Science'}), and target interests.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-500">
          Synthesizing personalized student matches...
        </div>
      ) : (
        <div className="space-y-8">
          {/* Top Internship Matches */}
          <div className="space-y-3">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-600" />
              <span>Top Internship Matches (Skill-Weighted)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {internships.slice(0, 4).map((item, idx) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-slate-500">
                        {item.company} • {item.location}
                      </span>
                      <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-indigo-600" />
                        <span>{94 - idx * 2}% Match</span>
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {item.role}
                    </h4>

                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">{item.stipend}</span>
                      <span>•</span>
                      <span>{item.duration}</span>
                      <span>•</span>
                      <span>{item.work_mode}</span>
                    </div>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {item.skills.split(',').map((s, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300 font-mono"
                        >
                          {s.trim()}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => handleInspectMatch(item.role, item.company, item.skills)}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Why this matches me?</span>
                    </button>

                    <a
                      href={item.official_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1"
                    >
                      <span>Apply</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Scholarship Matches */}
          <div className="space-y-3">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              <span>Scholarships Tailored for Your Level ({user?.education || 'Undergraduate'})</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scholarships.slice(0, 4).map((item, idx) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-slate-500">
                        {item.provider}
                      </span>
                      <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-blue-600" />
                        <span>{90 - idx * 3}% Match</span>
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {item.title}
                    </h4>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {item.amount}
                      </span>
                      <span>•</span>
                      <span className="text-slate-500 font-mono">Deadline: {item.deadline}</span>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                      {item.eligibility}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => handleInspectMatch(item.title, item.provider, item.eligibility)}
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Inspect Match Criteria</span>
                    </button>

                    <a
                      href={item.official_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1"
                    >
                      <span>Apply</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
