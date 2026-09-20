import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Clock,
  Building,
  CheckCircle2,
  Trash2,
  Edit3,
  Calendar,
  Sparkles,
  ChevronRight,
  X,
  FileText,
} from 'lucide-react';
import { ApplicationItem } from '../types';

export const ApplicationTrackerView: React.FC = () => {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // New Application Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newApp, setNewApp] = useState({
    title: '',
    companyOrProvider: '',
    opportunityType: 'internship' as 'scholarship' | 'internship' | 'job',
    status: 'Interested' as 'Interested' | 'Applied' | 'Shortlisted' | 'Selected' | 'Rejected',
    deadline: '',
    notes: '',
  });

  const columns = [
    { id: 'Interested', title: 'Saved / Interested', color: 'border-slate-300 dark:border-slate-700 bg-slate-50/50' },
    { id: 'Applied', title: 'Applied / In Review', color: 'border-blue-300 dark:border-blue-800 bg-blue-50/20' },
    { id: 'Shortlisted', title: 'Shortlisted / Interview', color: 'border-amber-300 dark:border-amber-800 bg-amber-50/20' },
    { id: 'Selected', title: 'Selected / Accepted', color: 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/20' },
  ];

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/applications');
      const data = await res.json();
      setApplications(data.items || []);
    } catch (err) {
      console.error('Fetch applications error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newApp),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setNewApp({
          title: '',
          companyOrProvider: '',
          opportunityType: 'internship',
          status: 'Interested',
          deadline: '',
          notes: '',
        });
        fetchApplications();
      }
    } catch (err) {
      console.error('Create application error:', err);
    }
  };

  const handleUpdateStatus = async (
    id: string,
    newStatus: 'Interested' | 'Applied' | 'Shortlisted' | 'Selected' | 'Rejected'
  ) => {
    try {
      await fetch(`/api/applications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
      );
    } catch (err) {
      console.error('Update status error:', err);
    }
  };

  const handleDeleteApplication = async (id: string) => {
    try {
      await fetch(`/api/applications/${id}`, {
        method: 'DELETE',
      });
      setApplications((prev) => prev.filter((app) => app.id !== id));
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Layers className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <span>Kanban Application Tracker</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track submitted internships, job rounds, and scholarship portal dossiers in one place
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Application</span>
        </button>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
        {columns.map((col) => {
          const colApps = applications.filter((a) => a.status === col.id);

          return (
            <div
              key={col.id}
              className={`p-4 rounded-2xl border ${col.color} bg-white dark:bg-slate-900 shadow-xs flex flex-col min-h-[500px]`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">
                    {col.title}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {colApps.length}
                  </span>
                </div>
              </div>

              {/* Cards Container */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[700px] pr-1">
                {colApps.length === 0 ? (
                  <div className="h-32 flex items-center justify-center text-center text-[11px] text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    No applications here yet
                  </div>
                ) : (
                  colApps.map((app) => (
                    <div
                      key={app.id}
                      className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs hover:border-blue-400 dark:hover:border-blue-600 transition-all space-y-2.5"
                    >
                      {/* Type Pill & Delete */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            app.opportunity_type === 'scholarship'
                              ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                              : app.opportunity_type === 'internship'
                              ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                              : 'bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300'
                          }`}
                        >
                          {app.opportunity_type}
                        </span>

                        <button
                          onClick={() => handleDeleteApplication(app.id)}
                          className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                          title="Delete from board"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Title & Company */}
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-snug">
                          {app.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Building className="w-3 h-3" />
                          {app.company_or_provider}
                        </p>
                      </div>

                      {/* Deadline */}
                      {app.deadline && (
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>Deadline: {app.deadline}</span>
                        </div>
                      )}

                      {/* Notes snippet */}
                      {app.notes && (
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800 line-clamp-2">
                          {app.notes}
                        </p>
                      )}

                      {/* Move to Next Column Dropdown */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Move status:</span>
                        <select
                          value={app.status}
                          onChange={(e) =>
                            handleUpdateStatus(
                              app.id,
                              e.target.value as any
                            )
                          }
                          className="px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-medium focus:outline-none"
                        >
                          <option value="Interested">Interested</option>
                          <option value="Applied">Applied</option>
                          <option value="Shortlisted">Shortlisted</option>
                          <option value="Selected">Selected</option>
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Application Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Track New Application
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateApplication} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Opportunity Title *
                </label>
                <input
                  type="text"
                  required
                  value={newApp.title}
                  onChange={(e) => setNewApp({ ...newApp, title: e.target.value })}
                  placeholder="e.g. SDE Intern, Central Sector Scholarship"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Company / Organization *
                </label>
                <input
                  type="text"
                  required
                  value={newApp.companyOrProvider}
                  onChange={(e) =>
                    setNewApp({ ...newApp, companyOrProvider: e.target.value })
                  }
                  placeholder="e.g. Microsoft, AICTE, National Portal"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Type
                  </label>
                  <select
                    value={newApp.opportunityType}
                    onChange={(e) =>
                      setNewApp({
                        ...newApp,
                        opportunityType: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="internship">Internship</option>
                    <option value="scholarship">Scholarship</option>
                    <option value="job">Full-Time Job</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Current Stage
                  </label>
                  <select
                    value={newApp.status}
                    onChange={(e) =>
                      setNewApp({
                        ...newApp,
                        status: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Interested">Interested</option>
                    <option value="Applied">Applied</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Selected">Selected</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Submission Deadline
                </label>
                <input
                  type="date"
                  value={newApp.deadline}
                  onChange={(e) => setNewApp({ ...newApp, deadline: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Application Notes / Credentials
                </label>
                <textarea
                  rows={3}
                  value={newApp.notes}
                  onChange={(e) => setNewApp({ ...newApp, notes: e.target.value })}
                  placeholder="Application ID: NSP-2024-912, round 1 technical interview scheduled on Monday..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  Save to Kanban
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
