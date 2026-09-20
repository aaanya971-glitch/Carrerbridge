import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  Target,
  ArrowRight,
  TrendingUp,
  Save,
  Check,
} from 'lucide-react';
import { RoadmapStep } from '../types';

export const CareerRoadmapChecklistView: React.FC = () => {
  const [steps, setSteps] = useState<RoadmapStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const fetchRoadmap = async () => {
    try {
      const res = await fetch('/api/roadmap');
      const data = await res.json();
      setSteps(data.steps || []);
    } catch (err) {
      console.error('Fetch roadmap error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStep = (index: number) => {
    setSteps((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        completed: !next[index].completed,
      };
      return next;
    });
  };

  const handleSaveRoadmap = async () => {
    try {
      const res = await fetch('/api/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ steps }),
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      }
    } catch (err) {
      console.error('Save roadmap error:', err);
    }
  };

  const completedCount = steps.filter((s) => s.completed).length;
  const progressPercent = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Target className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <span>Interactive 7-Stage Career Milestone Checklist</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Check off your college career milestones from profile setup through campus placement offers
          </p>
        </div>

        <button
          onClick={handleSaveRoadmap}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
        >
          {saveSuccess ? (
            <>
              <Check className="w-4 h-4" />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Progress</span>
            </>
          )}
        </button>
      </div>

      {/* Progress Gauge Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Roadmap Completion Gauge
          </span>
          <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">
            {completedCount} of {steps.length} Milestones ({progressPercent}%)
          </span>
        </div>

        <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Checklist items */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-500">Loading your milestones...</div>
        ) : (
          steps.map((step, idx) => (
            <div
              key={idx}
              onClick={() => handleToggleStep(idx)}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                step.completed
                  ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/80 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="pt-0.5 shrink-0">
                {step.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                )}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      step.completed
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Stage {idx + 1}
                  </span>
                  <h3
                    className={`font-bold text-sm ${
                      step.completed
                        ? 'text-emerald-950 dark:text-emerald-200 line-through opacity-80'
                        : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {step.title}
                  </h3>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
