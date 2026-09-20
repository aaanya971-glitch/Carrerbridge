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
  Mail,
  RefreshCw,
  Sparkles,
  Inbox,
  Send,
} from 'lucide-react';
import { DeadlineItem, ReminderServiceStatus } from '../types';
import { EmailReminderModal } from '../components/EmailReminderModal';

export const DeadlineTrackerView: React.FC = () => {
  const [deadlines, setDeadlines] = useState<DeadlineItem[]>([]);
  const [filterType, setFilterType] = useState('All');
  const [loading, setLoading] = useState(true);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [reminderStatus, setReminderStatus] = useState<ReminderServiceStatus | null>(null);
  const [scanning, setScanning] = useState(false);
  const [bannerAlert, setBannerAlert] = useState<string | null>(null);

  useEffect(() => {
    fetchDeadlines();
    fetchReminderStatus();
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

  const fetchReminderStatus = async () => {
    try {
      const res = await fetch('/api/reminders/status');
      if (res.ok) {
        const data = await res.json();
        setReminderStatus(data);
      }
    } catch (err) {
      console.error('Fetch reminder status error:', err);
    }
  };

  const handleQuickScan = async () => {
    setScanning(true);
    try {
      const res = await fetch('/api/reminders/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forceResend: false }),
      });
      const data = await res.json();
      if (data.emailsDispatched && data.emailsDispatched.length > 0) {
        setBannerAlert(`Dispatched ${data.emailsDispatched.length} simulated email reminder(s) for upcoming deadlines!`);
      } else if (data.skippedAlreadyNotified > 0) {
        setBannerAlert(`Scan complete: ${data.skippedAlreadyNotified} deadline reminder(s) already notified (anti-spam deduplication).`);
      } else {
        setBannerAlert('Scan complete: No tracked deadlines are currently within the 24-hour cutoff.');
      }
      await fetchReminderStatus();
      await fetchDeadlines();
    } catch (err) {
      console.error('Scan error:', err);
    } finally {
      setScanning(false);
    }
  };

  const handleSimulateQuickTest = async () => {
    try {
      const res = await fetch('/api/reminders/simulate-deadline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hoursFromNow: 18,
          title: 'Aditya Birla STEM Fellowship (Simulated 18h Cutoff)',
          companyOrProvider: 'Aditya Birla Foundation',
          opportunityType: 'scholarship',
          autoScan: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBannerAlert('Generated tracked application due in 18 hours and sent simulated 24h reminder email!');
        await fetchReminderStatus();
        await fetchDeadlines();
        setIsEmailModalOpen(true);
      }
    } catch (err) {
      console.error('Simulate error:', err);
    }
  };

  const handleSendSingleItemAlert = async (item: DeadlineItem) => {
    try {
      const res = await fetch('/api/reminders/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunityTitle: item.title,
          companyOrProvider: item.organization,
          opportunityType: item.type,
          deadline: item.deadline,
          hoursRemaining: item.diffDays === 0 ? 8 : 20,
        }),
      });
      if (res.ok) {
        setBannerAlert(`Simulated 24-hour reminder email dispatched for "${item.title}".`);
        await fetchReminderStatus();
        setIsEmailModalOpen(true);
      }
    } catch (err) {
      console.error('Send test error:', err);
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
            Never miss financial aid cycles or internship submission cutoffs. Export reminders to your personal calendar or receive 24h automated email alerts.
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

      {/* 24-Hour Email Reminder Service Banner Card */}
      <div className="bg-gradient-to-br from-rose-500/10 via-amber-500/5 to-blue-500/10 dark:from-rose-950/40 dark:via-slate-900/40 dark:to-blue-950/30 border border-rose-200 dark:border-rose-900/50 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-600 text-white flex items-center gap-1.5 shadow-xs">
                <Mail className="w-3.5 h-3.5" />
                <span>24-Hour Email Reminder Service</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Active (Simulated Transport)
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Recipient: <strong className="text-slate-700 dark:text-slate-200">{reminderStatus?.recipientEmail || 'student@careerbridge.edu'}</strong>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
              The service abstraction automatically monitors student applications and bookmarked opportunities, simulating RFC-2822 email alerts whenever a deadline is within 24 hours.
            </p>
          </div>

          {/* Quick Actions & Stats */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap shrink-0">
            <button
              onClick={handleQuickScan}
              disabled={scanning}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              title="Scan tracked deadlines and trigger 24h alerts"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${scanning ? 'animate-spin' : ''}`} />
              <span>{scanning ? 'Scanning...' : 'Check 24h Alerts'}</span>
            </button>

            <button
              onClick={handleSimulateQuickTest}
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              title="Add a sample tracked opportunity due in 18h to test email simulation"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simulate 24h Test</span>
            </button>

            <button
              onClick={() => setIsEmailModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
              title="Open simulated email inbox and preview messages"
            >
              <Inbox className="w-4 h-4 text-rose-400 dark:text-rose-600" />
              <span>Simulated Mailbox</span>
              {(reminderStatus?.stats.totalRemindersDispatched ?? 0) > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                  {reminderStatus?.stats.totalRemindersDispatched}
                </span>
              )}
            </button>
          </div>
        </div>

        {bannerAlert && (
          <div className="mt-3 px-3 py-2 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              {bannerAlert}
            </span>
            <button
              onClick={() => setBannerAlert(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
            >
              Dismiss
            </button>
          </div>
        )}
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
              const isDueWithin24h = item.diffDays <= 1 && item.diffDays >= 0;

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

                      {isDueWithin24h && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          <span>24h Email Alert Active</span>
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {item.title}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Organization: <span className="font-semibold text-slate-700 dark:text-slate-300">{item.organization}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center flex-wrap sm:flex-nowrap">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Cutoff Date</span>
                      <p className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                        {item.deadline}
                      </p>
                    </div>

                    <button
                      onClick={() => handleSendSingleItemAlert(item)}
                      className="px-2.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-medium transition-colors flex items-center gap-1.5"
                      title="Send simulated 24h reminder email for this specific opportunity"
                    >
                      <Send className="w-3 h-3" />
                      <span className="hidden sm:inline">Simulate Alert</span>
                    </button>

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

      {/* Email Reminder Modal */}
      <EmailReminderModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        onScanCompleted={() => {
          fetchReminderStatus();
          fetchDeadlines();
        }}
      />
    </div>
  );
};

