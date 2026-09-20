import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  Bookmark,
  ExternalLink,
  Award,
  Clock,
  Sparkles,
  CheckCircle2,
  Tag,
  Zap,
} from 'lucide-react';
import { Course } from '../types';

export const CoursesView: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [level, setLevel] = useState('All');
  const [isFree, setIsFree] = useState(false);

  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchCourses();
    fetchBookmarks();
  }, [category, level, isFree]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category !== 'All') params.append('category', category);
      if (level !== 'All') params.append('level', level);
      if (isFree) params.append('isFree', 'true');

      const res = await fetch(`/api/courses?${params.toString()}`);
      const data = await res.json();
      setCourses(data.items || []);
    } catch (err) {
      console.error('Fetch courses error:', err);
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
        body: JSON.stringify({ resourceId: id, resourceType: 'course' }),
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

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <BookOpen className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            <span>Courses &amp; Certifications</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Curated accredited technical certificates, free MOOCs, and competitive exam preparation
          </p>
        </div>

        <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">
          Govt NPTEL, SWAYAM &amp; Industry Top Platforms
        </span>
      </div>

      {/* Search & Filters */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by course topic (e.g. Python, Machine Learning, Cloud, GATE), or platform..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchCourses()}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            onClick={fetchCourses}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shrink-0"
          >
            Filter Courses
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Category:</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium focus:outline-none"
            >
              <option value="All">All Categories</option>
              <option value="Computer Science">Computer Science &amp; DSA</option>
              <option value="Data & AI">Data Science &amp; AI</option>
              <option value="Cloud & DevOps">Cloud &amp; DevOps</option>
              <option value="Cybersecurity">Cybersecurity</option>
              <option value="Full Stack">Web &amp; Full Stack</option>
              <option value="Competitive Exams">Competitive Exams (GATE/CAT)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Level:</span>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium focus:outline-none"
            >
              <option value="All">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer ml-auto font-medium text-emerald-700 dark:text-emerald-300 font-semibold">
            <input
              type="checkbox"
              checked={isFree}
              onChange={(e) => setIsFree(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-0"
            />
            <span>Free Courses Only</span>
          </label>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 text-xs">Loading course catalog...</div>
      ) : courses.length === 0 ? (
        <div className="py-16 text-center text-slate-500 space-y-2">
          <p className="font-bold text-sm text-slate-700 dark:text-slate-300">No courses found matching filter</p>
          <p className="text-xs">Try selecting 'All Categories' or clearing search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((c) => {
            const isBookmarked = bookmarkedIds.has(c.id);
            return (
              <div
                key={c.id}
                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-lg hover:shadow-emerald-500/5 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      {c.provider}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {c.is_free ? (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                          100% Free
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {c.price}
                        </span>
                      )}
                      <button
                        onClick={() => handleToggleBookmark(c.id)}
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

                  <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 leading-snug">
                    {c.title}
                  </h3>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Level</span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{c.level}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Duration</span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 font-mono text-[11px] flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" /> {c.duration}
                      </p>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>

                  {c.certificate_available ? (
                    <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                      <Award className="w-3 h-3" /> Certificate of Completion Included
                    </div>
                  ) : null}
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">{c.category}</span>
                  <a
                    href={c.official_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <span>Enroll on Platform</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
