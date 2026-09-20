import React from 'react';
import { X, CheckCircle2, AlertCircle, Sparkles, Target, ArrowRight } from 'lucide-react';
import { MatchAnalysis } from '../types';

interface MatchBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  providerOrCompany: string;
  matchData: MatchAnalysis | null;
  onApplyOrSave?: () => void;
}

export const MatchBreakdownModal: React.FC<MatchBreakdownModalProps> = ({
  isOpen,
  onClose,
  title,
  providerOrCompany,
  matchData,
  onApplyOrSave,
}) => {
  if (!isOpen || !matchData) return null;

  const { matchPercentage, breakdown, missingSkills, matchedSkills, whyRecommended } = matchData;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800';
    if (score >= 60) return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800';
    return 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" /> AI Profile Match Engine
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* Opportunity Banner */}
          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">{title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{providerOrCompany}</p>
          </div>

          {/* Overall Match Metric */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${getScoreColor(matchPercentage)}`}>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider">Compatibility Score</span>
              <p className="text-3xl font-extrabold tracking-tight mt-0.5">{matchPercentage}% Match</p>
              <p className="text-[11px] mt-1 opacity-90">{whyRecommended}</p>
            </div>
            <div className="w-16 h-16 rounded-full border-4 border-current flex items-center justify-center font-bold text-lg shrink-0">
              {matchPercentage}%
            </div>
          </div>

          {/* Dimension Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Scoring Breakdown by Category
            </h4>

            {/* Skills */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-slate-700 dark:text-slate-300">Technical &amp; Required Skills (45% weight)</span>
                <span className="font-bold text-slate-900 dark:text-white">{breakdown.skillsMatch}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full ${getProgressColor(breakdown.skillsMatch)} transition-all duration-500`}
                  style={{ width: `${breakdown.skillsMatch}%` }}
                />
              </div>
            </div>

            {/* Education */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-slate-700 dark:text-slate-300">Education &amp; Degree Eligibility (20% weight)</span>
                <span className="font-bold text-slate-900 dark:text-white">{breakdown.educationMatch}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full ${getProgressColor(breakdown.educationMatch)} transition-all duration-500`}
                  style={{ width: `${breakdown.educationMatch}%` }}
                />
              </div>
            </div>

            {/* Interest */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-slate-700 dark:text-slate-300">Career Interest Alignment (20% weight)</span>
                <span className="font-bold text-slate-900 dark:text-white">{breakdown.interestMatch}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full ${getProgressColor(breakdown.interestMatch)} transition-all duration-500`}
                  style={{ width: `${breakdown.interestMatch}%` }}
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-slate-700 dark:text-slate-300">Location / Work Mode Feasibility (15% weight)</span>
                <span className="font-bold text-slate-900 dark:text-white">{breakdown.locationMatch}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full ${getProgressColor(breakdown.locationMatch)} transition-all duration-500`}
                  style={{ width: `${breakdown.locationMatch}%` }}
                />
              </div>
            </div>
          </div>

          {/* Matched & Missing Skills Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
              <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 mb-2">
                <CheckCircle2 className="w-3.5 h-3.5" /> Matched Skills ({matchedSkills.length})
              </p>
              {matchedSkills.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {matchedSkills.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-500">General eligibility alignment.</p>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40">
              <p className="text-xs font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5 mb-2">
                <AlertCircle className="w-3.5 h-3.5" /> Missing / Recommended ({missingSkills.length})
              </p>
              {missingSkills.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {missingSkills.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  Your profile meets all stated technical requirements!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">Based on your student profile</span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-opacity"
          >
            Close Breakdown
          </button>
        </div>
      </div>
    </div>
  );
};
