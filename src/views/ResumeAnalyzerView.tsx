import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Upload,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  TrendingUp,
  FileCheck,
  RefreshCw,
  Lightbulb,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ResumeAnalyzerView: React.FC = () => {
  const { user } = useAuth();

  const [resumeText, setResumeText] = useState('');
  const [targetRole, setTargetRole] = useState('Full Stack Software Engineer');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sampleStudentResume = `Aditya Sharma
Email: aditya.sharma@example.edu | Phone: +91 98765 43210 | Bangalore, India
LinkedIn: linkedin.com/in/aditya-sample | GitHub: github.com/aditya-sample

EDUCATION
National Institute of Technology Karnataka (NITK)
B.Tech in Computer Science and Engineering | CGPA: 8.75 / 10 | 2022 - 2026 (3rd Year)

TECHNICAL SKILLS
Languages: Python, JavaScript, TypeScript, C++, SQL, HTML/CSS
Frameworks & Libraries: React, Node.js, Express, Tailwind CSS, Pandas, NumPy
Tools & Platforms: Git, GitHub, Docker, Postman, Linux, VS Code, Supabase

PROJECTS
1. CareerBridge - Digital Career & Scholarship Resource Platform
- Architected responsive full-stack platform using React, TypeScript, Tailwind, and Express.
- Integrated Gemini AI REST API to generate ATS score breakdowns and career roadmaps with 95% latency under 800ms.
- Built relational SQLite schemas for user applications and verified scholarship trackers.

2. Campus Event Scheduler & Ticketing System
- Developed web app using Python Flask and PostgreSQL with QR code pass verification.
- Handled 1,200+ concurrent student registrations during annual college tech fest.

INTERNSHIP EXPERIENCE
Web Development Intern | TechCorp Innovations (June 2024 - August 2024)
- Built 4 responsive client dashboard modules with React and Redux, reducing page load time by 28%.
- Wrote unit tests using Jest, achieving 82% test coverage on authentication flows.
- Collaborated in daily agile standups with senior engineers and UI designers.

CERTIFICATIONS & HONORS
- HackerRank Certified Problem Solving (5-Star Python)
- Winner, Smart India Hackathon (College Level Internal Round, 2024)`;

  const handleLoadSample = () => {
    setResumeText(sampleStudentResume);
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      setError('Please paste your resume text or click "Load Sample Student Resume".');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/resume-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText,
          targetRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze resume');
      }
      setResult(data);
    } catch (err: any) {
      console.error('Resume analyze error:', err);
      setError(err.message || 'Error communicating with AI evaluator.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
          <FileText className="w-8 h-8 text-rose-500" />
          <span>AI ATS Resume Evaluator</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Powered by Gemini 3.8: Benchmark your resume against modern recruiter ATS scanners, extract missing keywords, and get bullet point improvements
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Input Pane (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Target Role
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Software Engineer, Data Scientist, Product Analyst"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Resume Content (Text / Plain Paste)
              </label>
              <button
                type="button"
                onClick={handleLoadSample}
                className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Load Sample Student Resume</span>
              </button>
            </div>

            <textarea
              rows={16}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste the full text of your resume here (Education, Skills, Experience, Projects, Certifications)..."
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-mono placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none leading-relaxed"
            />

            {error && (
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{error}</p>
            )}

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-rose-500/20 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Evaluating with Gemini AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run ATS Score &amp; Keyword Audit</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Output Analysis (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {!result && !loading && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3 bg-white/40 dark:bg-slate-900/40">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-500 flex items-center justify-center">
                <FileCheck className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">
                Ready for AI ATS Evaluation
              </h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Paste your resume text or click "Load Sample Student Resume", then hit Run Audit to receive your score, keyword analysis, and actionable bullet rewrites.
              </p>
            </div>
          )}

          {loading && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-rose-500 animate-spin" />
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                Evaluating against ATS Recruiter Benchmarks...
              </h4>
              <p className="text-xs text-slate-500">
                Checking readability, keyword density for {targetRole}, impact action verbs, and STAR formula metrics.
              </p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Score Card Banner */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                    ATS Readiness Assessment
                  </span>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    Overall Resume Score for {targetRole}
                  </h3>
                  <p className="text-xs text-slate-500">{result.summary}</p>
                </div>

                <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 shrink-0 min-w-[120px]">
                  <span className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">
                    {result.atsScore || 78}/100
                  </span>
                  <span className="text-[10px] font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider mt-0.5">
                    {result.atsScore >= 80 ? 'ATS Competitive' : 'Needs Optimization'}
                  </span>
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Strengths */}
                <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Detected Strengths
                  </h4>
                  <ul className="space-y-1.5">
                    {(result.strengths || []).map((s: string, idx: number) => (
                      <li key={idx} className="text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-1.5">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div className="p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" /> Areas to Fix
                  </h4>
                  <ul className="space-y-1.5">
                    {(result.weaknesses || []).map((w: string, idx: number) => (
                      <li key={idx} className="text-xs text-amber-800 dark:text-amber-300 flex items-start gap-1.5">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Missing Keywords Box */}
              {result.missingKeywords && result.missingKeywords.length > 0 && (
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-rose-500" /> Missing High-Impact ATS Keywords for {targetRole}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Recruiter screening bots specifically look for these exact terms. Weave them into your project descriptions:
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {result.missingKeywords.map((kw: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-mono text-xs font-semibold border border-rose-100 dark:border-rose-900"
                      >
                        + {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actionable Rewrites */}
              {result.bulletRewrites && result.bulletRewrites.length > 0 && (
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-500" /> Recommended Bullet Point Rewrites (XYZ Formula)
                  </h4>

                  <div className="space-y-3">
                    {result.bulletRewrites.map((b: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2"
                      >
                        <div className="text-xs text-slate-500">
                          <strong className="text-rose-600 dark:text-rose-400">Original:</strong> {b.original}
                        </div>
                        <div className="text-xs text-slate-900 dark:text-white font-medium bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-900/50">
                          <strong className="text-emerald-700 dark:text-emerald-300">Stronger Rewrite:</strong> {b.improved}
                        </div>
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
