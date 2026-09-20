import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  CalendarPlus,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import { DeadlineItem } from '../types';

export const DeadlineTrackerView: React.FC = () => {
  const [deadlines, setDeadlines] = useState<DeadlineItem[]>([]);
  const [filterType, setFilterType] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeadlines();
  }, [filterType]);

  const fetchDeadlines = async () => {
    setLoading(true);
    try {
      const url = filterType === 'All' ? '/api/deadlines' : `/api/deadlines?type=${filterType}`;
      const res = await fetch(url);
      const data = await res.json();
      setDeadlines(data.deadlines || []);
    } catch (err) {
      console.error('Fetch deadlines error:', err);
    } finally {
      setLoading(false);
    }
  };

  const createGoogleCalendarUrl = (item: DeadlineItem) => {
    // Generate Google Calendar Web Intent URL
    const cleanDate = item.deadline.replace(/-/g, '');
    const startTime = `${cleanDate}T090000Z`;
    const endTime = `${cleanDate}T180000Z`;
    const details = encodeURIComponent(
      `Deadline reminder for ${item.title} offered by ${item.organization}. Apply before end of day!`
    );
    const text = encodeURIComponent(`[DEADLINE] ${item.title} - ${item.organization}`);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${startTime}/${endTime}&details=${details}`;
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Clock className="w-8 h-8 text-rose-500" />
            <span>Scholarship &amp; Opportunity Deadline Tracker</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Never miss financial aid cycles or internship submission cutoffs. Export reminders to your personal calendar.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs">
          {['All', 'scholarship', 'internship', 'job'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-colors ${
                filterType === t
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t === 'All' ? 'All Deadlines' : `${t}s`}
            </button>
          ))}
        </div>
      </div>

      {/* Deadlines Table / List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-500">
            Checking upcoming application cutoffs...
          </div>
        ) : deadlines.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">
            No upcoming deadlines found for this filter.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {deadlines.map((item) => {
              const isUrgent = item.status === 'Due Today' || item.status === 'Due Soon';

              return (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          item.type === 'scholarship'
                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                            : item.type === 'internship'
                            ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                            : 'bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300'
                        }`}
                      >
                        {item.type}
                      </span>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.status === 'Due Today'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 animate-pulse'
                            : item.status === 'Due Soon'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                        }`}
                      >
                        {item.status} ({item.diffDays} {item.diffDays === 1 ? 'day' : 'days'} left)
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {item.title}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Organization: <span className="font-semibold text-slate-700 dark:text-slate-300">{item.organization}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Cutoff Date</span>
                      <p className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                        {item.deadline}
                      </p>
                    </div>

                    <a
                      href={createGoogleCalendarUrl(item)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors flex items-center gap-1.5"
                      title="Add deadline event to Google Calendar"
                    >
                      <CalendarPlus className="w-3.5 h-3.5 text-blue-600" />
                      <span className="hidden sm:inline">Add to Calendar</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
