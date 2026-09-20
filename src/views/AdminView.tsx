import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Plus,
  Trash2,
  CheckCircle2,
  Database,
  BarChart2,
  GraduationCap,
  Briefcase,
  Rocket,
  BookOpen,
  Users,
  Search,
  ExternalLink,
} from 'lucide-react';
import { Scholarship, Internship, Job } from '../types';

interface AdminViewProps {
  onOpenSqlConsole: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ onOpenSqlConsole }) => {
  const [stats, setStats] = useState<{
    studentsCount: number;
    scholarshipsCount: number;
    internshipsCount: number;
    jobsCount: number;
    coursesCount: number;
    applicationsCount: number;
  }>({
    studentsCount: 0,
    scholarshipsCount: 0,
    internshipsCount: 0,
    jobsCount: 0,
    coursesCount: 0,
    applicationsCount: 0,
  });

  const [activeTab, setActiveTab] = useState<'scholarships' | 'internships' | 'jobs'>('scholarships');
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [schForm, setSchForm] = useState({
    title: '',
    provider: '',
    category: 'Merit-cum-Means',
    amount: '₹50,000 / year',
    educationLevel: 'Undergraduate',
    deadline: '2025-05-30',
    eligibility: '',
    officialUrl: 'https://scholarships.gov.in',
    description: '',
    verified: true,
  });

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
    loadDirectoryData();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch admin stats:', err);
    }
  };

  const loadDirectoryData = async () => {
    setLoading(true);
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
      console.error('Load admin directory error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateScholarship = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/scholarships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schForm),
      });
      if (res.ok) {
        setShowAddModal(false);
        setToastMsg(`Successfully published "${schForm.title}"!`);
        setTimeout(() => setToastMsg(null), 3500);
        loadDirectoryData();
        fetchStats();
      }
    } catch (err) {
      console.error('Create error:', err);
    }
  };

  const handleDeleteScholarship = async (id: string) => {
    if (!confirm('Are you sure you want to remove this opportunity?')) return;
    try {
      await fetch(`/api/admin/scholarships/${id}`, { method: 'DELETE' });
      setScholarships((prev) => prev.filter((s) => s.id !== id));
      fetchStats();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <ShieldCheck className="w-8 h-8 text-amber-500" />
            <span>CareerBridge Administrator Portal</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage verified opportunities, review student registration metrics, and audit relational database schemas
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenSqlConsole}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-800 dark:text-slate-200 font-semibold text-xs shadow-xs transition-colors flex items-center gap-2"
          >
            <Database className="w-4 h-4 text-blue-600" />
            <span>Open Live SQL Console</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Publish Opportunity</span>
          </button>
        </div>
      </div>

      {toastMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Students</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {stats.studentsCount}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Scholarships</span>
            <GraduationCap className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {stats.scholarshipsCount}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Internships</span>
            <Briefcase className="w-4 h-4 text-violet-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {stats.internshipsCount}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Graduate Jobs</span>
            <Rocket className="w-4 h-4 text-pink-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {stats.jobsCount}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Courses</span>
            <BookOpen className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {stats.coursesCount}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Tracked Apps</span>
            <BarChart2 className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {stats.applicationsCount}
          </p>
        </div>
      </div>

      {/* Directory Management Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Table Tabs */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('scholarships')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'scholarships'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Scholarships ({scholarships.length})
            </button>
            <button
              onClick={() => setActiveTab('internships')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'internships'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Internships ({internships.length})
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'jobs'
                  ? 'bg-violet-600 text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Graduate Jobs ({jobs.length})
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4">Title / Role</th>
                <th className="p-4">Provider / Company</th>
                <th className="p-4">Compensation / Award</th>
                <th className="p-4">Deadline</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {activeTab === 'scholarships' &&
                scholarships.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-4 font-bold text-slate-900 dark:text-white">{s.title}</td>
                    <td className="p-4">{s.provider}</td>
                    <td className="p-4 font-semibold text-emerald-600 dark:text-emerald-400">
                      {s.amount}
                    </td>
                    <td className="p-4 font-mono">{s.deadline}</td>
                    <td className="p-4">
                      {s.verified ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                          <ShieldCheck className="w-3 h-3" /> Verified
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Standard</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteScholarship(s.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                        title="Delete listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}

              {activeTab === 'internships' &&
                internships.map((i) => (
                  <tr key={i.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-4 font-bold text-slate-900 dark:text-white">{i.role}</td>
                    <td className="p-4">{i.company}</td>
                    <td className="p-4 font-semibold text-indigo-600 dark:text-indigo-400">
                      {i.stipend}
                    </td>
                    <td className="p-4 font-mono">{i.deadline}</td>
                    <td className="p-4">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
                        {i.work_mode}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-[11px] text-slate-400">Active</span>
                    </td>
                  </tr>
                ))}

              {activeTab === 'jobs' &&
                jobs.map((j) => (
                  <tr key={j.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-4 font-bold text-slate-900 dark:text-white">{j.role}</td>
                    <td className="p-4">{j.company}</td>
                    <td className="p-4 font-semibold text-violet-600 dark:text-violet-400">
                      {j.salary}
                    </td>
                    <td className="p-4 font-mono">{j.deadline}</td>
                    <td className="p-4">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-violet-50 dark:bg-violet-950 text-violet-600">
                        {j.experience}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-[11px] text-slate-400">Active</span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Scholarship Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Publish New Verified Scholarship
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateScholarship} className="p-5 overflow-y-auto space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1">Scholarship Title *</label>
                <input
                  type="text"
                  required
                  value={schForm.title}
                  onChange={(e) => setSchForm({ ...schForm, title: e.target.value })}
                  placeholder="e.g. AICTE Pragati Scholarship for Girls"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Grant Provider / Ministry *</label>
                  <input
                    type="text"
                    required
                    value={schForm.provider}
                    onChange={(e) => setSchForm({ ...schForm, provider: e.target.value })}
                    placeholder="e.g. AICTE / Ministry of Education"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Award Amount *</label>
                  <input
                    type="text"
                    required
                    value={schForm.amount}
                    onChange={(e) => setSchForm({ ...schForm, amount: e.target.value })}
                    placeholder="e.g. ₹50,000 / year"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Category</label>
                  <select
                    value={schForm.category}
                    onChange={(e) => setSchForm({ ...schForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Merit-cum-Means">Merit-cum-Means</option>
                    <option value="STEM">Women / STEM</option>
                    <option value="Minority">Minority</option>
                    <option value="Fellowship">Fellowship</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Education Level</label>
                  <select
                    value={schForm.educationLevel}
                    onChange={(e) => setSchForm({ ...schForm, educationLevel: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Undergraduate">Undergraduate</option>
                    <option value="Postgraduate">Postgraduate</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Higher Secondary">Higher Secondary</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Deadline Date</label>
                  <input
                    type="date"
                    value={schForm.deadline}
                    onChange={(e) => setSchForm({ ...schForm, deadline: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Eligibility Criteria</label>
                <textarea
                  rows={2}
                  value={schForm.eligibility}
                  onChange={(e) => setSchForm({ ...schForm, eligibility: e.target.value })}
                  placeholder="Female students admitted to 1st year degree program, family income < 8 LPA..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Official Portal Link</label>
                <input
                  type="url"
                  value={schForm.officialUrl}
                  onChange={(e) => setSchForm({ ...schForm, officialUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold"
                >
                  Publish Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
