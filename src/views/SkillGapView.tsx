import React, { useState } from 'react';
import {
  Target,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Calendar,
  Layers,
  Code2,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SkillGapView: React.FC = () => {
  const { user } = useAuth();

  const [targetRole, setTargetRole] = useState('Full Stack Developer');
  const [currentSkills, setCurrentSkills] = useState(
    user?.skills || 'Python, React, SQL, Git'
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const roles = [
    'Full Stack Developer',
    'Data Scientist & ML Engineer',
    'Cybersecurity Analyst',
    'Cloud & DevOps Engineer',
    'AI & Generative AI Engineer',
    'Mobile App Developer (Flutter/Android)',
    'Associate Product Manager',
  ];

  const handleAnalyze = async () => {
    if (!currentSkills.trim()) {
      setError('Please provide at least one current skill.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/skill-gap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRole,
          currentSkills: currentSkills.split(',').map((s) => s.trim()),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze skill gap');
      }
      setResult(data);
    } catch (err: any) {
      console.error('Skill gap error:', err);
      setError(err.message || 'Error generating roadmap');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
          <Target className="w-8 h-8 text-fuchsia-600 dark:text-fuchsia-400" />
          <span>Skill Gap &amp; Bridging Roadmap Engine</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Compare your current technical competencies against corporate hiring requirements, spot missing skills, and generate a 4-week bridging strategy
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Target Role
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500 font-medium"
              >
                {roles.map((r, idx) => (
                  <option key={idx} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Your Current Skills (Comma-separated)
                </label>
                {user?.skills && (
                  <button
                    type="button"
                    onClick={() => setCurrentSkills(user.skills || '')}
                    className="text-[11px] text-fuchsia-600 dark:text-fuchsia-400 hover:underline font-semibold"
                  >
                    Sync from Profile
                  </button>
                )}
              </div>
              <textarea
                rows={4}
                value={currentSkills}
                onChange={(e) => setCurrentSkills(e.target.value)}
                placeholder="e.g. Python, SQL, React, Git, Linux, Docker"
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 resize-none font-mono"
              />
            </div>

            {error && (
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{error}</p>
            )}

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-fuchsia-500/20 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Computing Skill Gap...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Gap &amp; Generate Roadmap</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Output (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {!result && !loading && (
            <div className="h-full min-h-[350px] flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3 bg-white/40 dark:bg-slate-900/40">
              <div className="w-14 h-14 rounded-2xl bg-fuchsia-50 dark:bg-fuchsia-950 text-fuchsia-600 flex items-center justify-center">
                <Target className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">
                Discover Your Missing Competencies
              </h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Select your target career aspiration, confirm your current skill inventory, and hit Analyze to build an actionable bridge roadmap.
              </p>
            </div>
          )}

          {loading && (
            <div className="h-full min-h-[350px] flex flex-col items-center justify-center p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-fuchsia-600 animate-spin" />
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                Benchmarking against {targetRole} Industry Requirements...
              </h4>
              <p className="text-xs text-slate-500">
                Synthesizing essential competencies, gap categorization, and a 4-week structured sprint plan.
              </p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Summary Banner */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-fuchsia-600 dark:text-fuchsia-400">
                    Skill Gap Analysis
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-fuchsia-50 dark:bg-fuchsia-950 text-fuchsia-700 dark:text-fuchsia-300">
                    Target: {targetRole}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {result.summary}
                </p>
              </div>

              {/* Matched vs Missing Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Matched */}
                <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Current Strengths
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(result.matchedSkills || []).map((sk: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-[11px] font-mono font-medium"
                      >
                        ✓ {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing */}
                <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" /> Missing High-Priority Skills
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(result.missingSkills || []).map((sk: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 text-[11px] font-mono font-medium"
                      >
                        + {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4-Week Action Plan */}
              {result.weeklyPlan && (
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-fuchsia-600" /> 4-Week Step-by-Step Learning Plan
                  </h4>

                  <div className="space-y-2.5">
                    {result.weeklyPlan.map((w: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1"
                      >
                        <span className="text-[10px] font-bold uppercase tracking-wider text-fuchsia-600 dark:text-fuchsia-400">
                          {w.week || `Week ${idx + 1}`}: {w.focus}
                        </span>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                          {w.action}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Project Ideas */}
              {result.projectIdeas && (
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Code2 className="w-4 h-4 text-indigo-600" /> Portfolio Proof Projects
                  </h4>

                  <div className="space-y-2">
                    {result.projectIdeas.map((p: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1"
                      >
                        <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                          {p.title}
                        </h5>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300">
                          {p.description}
                        </p>
                        <span className="text-[10px] font-mono text-fuchsia-600 dark:text-fuchsia-400 font-semibold">
                          Tech: {p.techStack}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
