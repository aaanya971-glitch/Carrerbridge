import React, { useState, useEffect } from 'react';
import {
  Bookmark,
  Trash2,
  ExternalLink,
  GraduationCap,
  Briefcase,
  Rocket,
  BookOpen,
  Plus,
} from 'lucide-react';
import { BookmarkItem } from '../types';

interface BookmarksViewProps {
  onNavigate: (view: string) => void;
}

export const BookmarksView: React.FC<BookmarksViewProps> = ({ onNavigate }) => {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('All');

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      const res = await fetch('/api/bookmarks');
      const data = await res.json();
      setBookmarks(data.items || []);
    } catch (err) {
      console.error('Fetch bookmarks error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (resourceId: string, resourceType: string) => {
    try {
      await fetch('/api/bookmarks/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resourceId, resourceType }),
      });
      setBookmarks((prev) => prev.filter((b) => b.resource_id !== resourceId));
    } catch (err) {
      console.error('Error removing bookmark:', err);
    }
  };

  const filtered =
    filterType === 'All'
      ? bookmarks
      : bookmarks.filter((b) => b.resource_type.toLowerCase() === filterType.toLowerCase());

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Bookmark className="w-8 h-8 text-amber-500 fill-amber-500" />
            <span>Saved Opportunities &amp; Resources</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Quickly revisit your shortlisted scholarships, internships, job postings, and learning courses
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs">
          {['All', 'scholarship', 'internship', 'job', 'course'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-colors ${
                filterType === t
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t === 'All' ? 'All Saved' : `${t}s`}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-500">Loading saved bookmarks...</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center space-y-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
          <Bookmark className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
            No saved opportunities in this category
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click the bookmark icon on any scholarship, internship, or course card to pin it here.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onNavigate('scholarships')}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors"
            >
              Browse Scholarships
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((b) => (
            <div
              key={b.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-amber-400 dark:hover:border-amber-600 transition-all space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      b.resource_type === 'scholarship'
                        ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                        : b.resource_type === 'internship'
                        ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                        : b.resource_type === 'job'
                        ? 'bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300'
                        : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    }`}
                  >
                    {b.resource_type}
                  </span>

                  <button
                    onClick={() => handleRemoveBookmark(b.resource_id, b.resource_type)}
                    className="p-1 rounded text-slate-400 hover:text-rose-500 transition-colors"
                    title="Remove from saved"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                  {b.title}
                </h4>
                <p className="text-xs text-slate-500">{b.provider_or_company}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">
                  Saved: {new Date(b.created_at).toLocaleDateString()}
                </span>
                <button
                  onClick={() => {
                    if (b.resource_type === 'scholarship') onNavigate('scholarships');
                    else if (b.resource_type === 'internship') onNavigate('internships');
                    else if (b.resource_type === 'job') onNavigate('jobs');
                    else onNavigate('courses');
                  }}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <span>Open Directory</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
