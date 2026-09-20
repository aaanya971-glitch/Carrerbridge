import React, { useState, useEffect } from 'react';
import {
  Mail,
  X,
  RefreshCw,
  Send,
  Trash2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Code,
  Eye,
  Calendar,
  Sparkles,
  Inbox,
  ShieldCheck,
} from 'lucide-react';
import { SentEmailReminderLog, ReminderServiceStatus } from '../types';

interface EmailReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanCompleted?: () => void;
}

export const EmailReminderModal: React.FC<EmailReminderModalProps> = ({
  isOpen,
  onClose,
  onScanCompleted,
}) => {
  const [status, setStatus] = useState<ReminderServiceStatus | null>(null);
  const [logs, setLogs] = useState<SentEmailReminderLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<SentEmailReminderLog | null>(null);
  const [viewMode, setViewMode] = useState<'rendered' | 'raw' | 'text'>('rendered');
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statusRes, logsRes] = await Promise.all([
        fetch('/api/reminders/status'),
        fetch('/api/reminders/logs'),
      ]);
      const statusData = await statusRes.json();
      const logsData = await logsRes.json();

      setStatus(statusData);
      const emailLogs: SentEmailReminderLog[] = logsData.logs || [];
      setLogs(emailLogs);

      if (emailLogs.length > 0) {
        setSelectedLog((prev) => (prev ? emailLogs.find((l) => l.id === prev.id) || emailLogs[0] : emailLogs[0]));
      } else {
        setSelectedLog(null);
      }
    } catch (err) {
      console.error('Failed to load email reminder data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerScan = async (forceResend = false) => {
    setScanning(true);
    setNotificationMsg(null);
    try {
      const res = await fetch('/api/reminders/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forceResend }),
      });
      const data = await res.json();

      if (data.emailsDispatched && data.emailsDispatched.length > 0) {
        setNotificationMsg({
          type: 'success',
          text: `Scan complete: Dispatched ${data.emailsDispatched.length} simulated email reminder(s) for upcoming deadlines!`,
        });
      } else if (data.skippedAlreadyNotified > 0) {
        setNotificationMsg({
          type: 'info',
          text: `Scan complete: ${data.skippedAlreadyNotified} deadline reminder(s) were skipped because notifications were already sent within the last 20 hours (deduplication active).`,
        });
      } else if (data.opportunitiesWithin24h?.length === 0) {
        setNotificationMsg({
          type: 'info',
          text: 'No tracked opportunities are currently within the 24-hour cutoff window. Click "Simulate 24h Deadline" below to test!',
        });
      } else {
        setNotificationMsg({
          type: 'info',
          text: `Scan finished: Checked ${data.totalTrackedScanned} tracked opportunities.`,
        });
      }

      await fetchData();
      if (onScanCompleted) onScanCompleted();
    } catch (err) {
      setNotificationMsg({
        type: 'error',
        text: 'Error executing reminder scan.',
      });
    } finally {
      setScanning(false);
    }
  };

  const handleSimulate24hDeadline = async () => {
    setSimulating(true);
    setNotificationMsg(null);
    try {
      const hours = 18; // 18 hours from now - strictly within the 24h window
      const res = await fetch('/api/reminders/simulate-deadline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hoursFromNow: hours,
          title: 'Aditya Birla Capital Scholarship for STEM Undergrads',
          companyOrProvider: 'Aditya Birla Foundation',
          opportunityType: 'scholarship',
          autoScan: true,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setNotificationMsg({
          type: 'success',
          text: `Created tracked deadline due in ${hours} hours! The email reminder service detected it and simulated sending the 24h alert email.`,
        });
        await fetchData();
        if (onScanCompleted) onScanCompleted();
      }
    } catch (err) {
      setNotificationMsg({
        type: 'error',
        text: 'Failed to simulate test deadline.',
      });
    } finally {
      setSimulating(false);
    }
  };

  const handleClearLogs = async () => {
    if (!confirm('Are you sure you want to clear all simulated reminder emails?')) return;
    try {
      await fetch('/api/reminders/logs', { method: 'DELETE' });
      setLogs([]);
      setSelectedLog(null);
      setNotificationMsg({ type: 'info', text: 'Simulated email logs cleared.' });
      await fetchData();
    } catch (err) {
      console.error('Failed to clear logs:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl w-full max-w-5xl h-[90vh] max-h-[820px] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  24-Hour Deadline Email Reminder Service
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active (Simulated Transport)
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Service abstraction monitoring student applications &amp; sending automated alerts when deadlines approach within 24 hours.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls & Service Metrics */}
        <div className="px-5 py-3 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span className="font-semibold text-slate-900 dark:text-white">Recipient:</span>
              <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                {status?.recipientEmail || 'student@careerbridge.edu'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span className="font-semibold text-slate-900 dark:text-white">Tracked Deadlines:</span>
              <span className="font-mono bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded font-bold">
                {status?.stats.totalTrackedWithDeadlines ?? 0}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span className="font-semibold text-slate-900 dark:text-white">Due &le; 24 Hours:</span>
              <span className={`font-mono px-2 py-0.5 rounded font-bold ${
                (status?.stats.deadlinesWithin24hCount ?? 0) > 0
                  ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}>
                {status?.stats.deadlinesWithin24hCount ?? 0}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleTriggerScan(false)}
              disabled={scanning}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
              title="Run scanner to check tracked list and dispatch 24h deadline reminder emails"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
              <span>{scanning ? 'Scanning...' : 'Scan & Dispatch 24h Alerts'}</span>
            </button>

            <button
              onClick={handleSimulate24hDeadline}
              disabled={simulating}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
              title="Create a test application due in 18 hours to simulate the reminder immediately"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{simulating ? 'Generating...' : 'Simulate 24h Deadline (Test)'}</span>
            </button>

            {logs.length > 0 && (
              <button
                onClick={handleClearLogs}
                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                title="Clear simulated inbox logs"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Feedback Message Banner */}
        {notificationMsg && (
          <div
            className={`px-5 py-2.5 text-xs font-medium flex items-center justify-between shrink-0 ${
              notificationMsg.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 border-b border-emerald-100 dark:border-emerald-900'
                : notificationMsg.type === 'error'
                ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200 border-b border-rose-100 dark:border-rose-900'
                : 'bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-200 border-b border-blue-100 dark:border-blue-900'
            }`}
          >
            <div className="flex items-center gap-2">
              {notificationMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : notificationMsg.type === 'error' ? (
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              ) : (
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              )}
              <span>{notificationMsg.text}</span>
            </div>
            <button
              onClick={() => setNotificationMsg(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Main Content Split: Left Sidebar (Inbox Logs), Right Pane (Email Preview) */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          
          {/* Left: Simulated Inbox List */}
          <div className="w-full md:w-80 lg:w-96 border-r border-slate-100 dark:border-slate-800 flex flex-col bg-slate-50/40 dark:bg-slate-900/40 shrink-0">
            <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Inbox className="w-3.5 h-3.5 text-slate-400" />
                Simulated Mailbox ({logs.length})
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Newest first</span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {loading && logs.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">Loading inbox records...</div>
              ) : logs.length === 0 ? (
                <div className="p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    No simulated reminder emails yet.
                  </div>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                    When a deadline on your tracked list approaches within 24 hours, the service automatically triggers an email reminder.
                  </p>
                  <button
                    onClick={handleSimulate24hDeadline}
                    className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300 hover:bg-rose-100 transition-colors"
                  >
                    Simulate Sample Deadline Now
                  </button>
                </div>
              ) : (
                logs.map((log) => {
                  const isSelected = selectedLog?.id === log.id;
                  const timeFormatted = new Date(log.sentAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  const dateFormatted = new Date(log.sentAt).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <button
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className={`w-full text-left p-3.5 transition-colors flex flex-col gap-1.5 ${
                        isSelected
                          ? 'bg-white dark:bg-slate-800 border-l-4 border-l-rose-500 shadow-xs'
                          : 'hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 text-[11px]">
                        <span className="font-bold text-slate-900 dark:text-white truncate">
                          {log.companyOrProvider}
                        </span>
                        <span className="text-slate-400 text-[10px] shrink-0 font-mono">
                          {dateFormatted} {timeFormatted}
                        </span>
                      </div>

                      <div className="font-semibold text-xs text-rose-600 dark:text-rose-400 line-clamp-1">
                        {log.subject}
                      </div>

                      <div className="flex items-center justify-between gap-2 text-[10px] text-slate-500 mt-0.5">
                        <span className="truncate">{log.opportunityTitle}</span>
                        <span className="px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold shrink-0">
                          {log.hoursRemaining}h left
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Email Detail Viewer */}
          <div className="flex-1 flex flex-col bg-slate-100/40 dark:bg-slate-950/40 min-w-0 overflow-hidden">
            {selectedLog ? (
              <>
                {/* Email Meta Bar */}
                <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-col gap-3 shrink-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-1">
                      {selectedLog.subject}
                    </h3>

                    {/* View Switcher: Rendered HTML vs Plain Text vs Raw Headers */}
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs shrink-0 self-start sm:self-auto">
                      <button
                        onClick={() => setViewMode('rendered')}
                        className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 transition-colors ${
                          viewMode === 'rendered'
                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                        }`}
                      >
                        <Eye className="w-3 h-3" />
                        <span>HTML Preview</span>
                      </button>
                      <button
                        onClick={() => setViewMode('text')}
                        className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 transition-colors ${
                          viewMode === 'text'
                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                        }`}
                      >
                        <span>Plain Text</span>
                      </button>
                      <button
                        onClick={() => setViewMode('raw')}
                        className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 transition-colors ${
                          viewMode === 'raw'
                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                        }`}
                      >
                        <Code className="w-3 h-3" />
                        <span>SMTP / Meta</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">From:</span> CareerBridge Deadline Alerts &lt;alerts@careerbridge.edu&gt;
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">To:</span> {selectedLog.recipientName} &lt;{selectedLog.recipientEmail}&gt;
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Target Deadline:</span> {selectedLog.deadline}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Delivered via:</span> Virtual RFC-2822 SMTP Sandbox
                    </div>
                  </div>
                </div>

                {/* Email Body Container */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                  {viewMode === 'rendered' ? (
                    <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 overflow-hidden">
                      <div
                        dangerouslySetInnerHTML={{ __html: selectedLog.bodyHtml }}
                        className="email-rendered-container"
                      />
                    </div>
                  ) : viewMode === 'text' ? (
                    <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed shadow-xs">
                      {selectedLog.bodyText}
                    </div>
                  ) : (
                    <div className="max-w-2xl mx-auto bg-slate-900 text-slate-200 p-5 rounded-2xl font-mono text-xs overflow-x-auto space-y-2 shadow-xs">
                      <div className="text-rose-400 font-bold">// SIMULATED SMTP DISPATCH HEADERS</div>
                      <div>Message-ID: &lt;{selectedLog.id}.alert@careerbridge.edu&gt;</div>
                      <div>Date: {selectedLog.sentAt}</div>
                      <div>From: CareerBridge Deadline Service &lt;alerts@careerbridge.edu&gt;</div>
                      <div>To: {selectedLog.recipientEmail}</div>
                      <div>Subject: {selectedLog.subject}</div>
                      <div>X-Mailer: CareerBridge Deadline Reminder Service v1.0</div>
                      <div>X-Simulated-Delivery: 250 2.0.0 OK: message queued</div>
                      <div className="pt-2 text-slate-400">// METADATA RECORD</div>
                      <pre className="text-emerald-400">{JSON.stringify({
                        id: selectedLog.id,
                        opportunityId: selectedLog.opportunityId,
                        opportunityTitle: selectedLog.opportunityTitle,
                        companyOrProvider: selectedLog.companyOrProvider,
                        deadline: selectedLog.deadline,
                        hoursRemaining: selectedLog.hoursRemaining,
                        status: selectedLog.status,
                      }, null, 2)}</pre>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <Mail className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  Select an email to view preview
                </p>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  Or click "Simulate 24h Deadline (Test)" to generate an urgent deadline and trigger an automated simulated reminder.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Info */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>
              <strong>Deduplication Guard:</strong> Alerts are only dispatched once per 24-hour cycle per opportunity to prevent student spam.
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleTriggerScan(true)}
              className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 underline font-medium"
              title="Force re-send reminders ignoring deduplication"
            >
              Force Re-scan (Test)
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
