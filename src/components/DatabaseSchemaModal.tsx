import React, { useState } from 'react';
import {
  X,
  Database,
  Table,
  Terminal,
  Play,
  CheckCircle,
  FileCode,
  Layers,
  Key,
} from 'lucide-react';

interface DatabaseSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseSchemaModal: React.FC<DatabaseSchemaModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'schema' | 'console' | 'architecture'>('schema');
  const [sqlQuery, setSqlQuery] = useState<string>(
    'SELECT title, amount, deadline, verified FROM scholarships ORDER BY amount DESC LIMIT 5;'
  );
  const [queryResult, setQueryResult] = useState<any>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  if (!isOpen) return null;

  const tables = [
    {
      name: 'users',
      purpose: 'Stores registered students and administrators with profiles and skills',
      columns: [
        { name: 'id', type: 'TEXT PRIMARY KEY', pk: true },
        { name: 'name', type: 'TEXT NOT NULL' },
        { name: 'email', type: 'TEXT UNIQUE' },
        { name: 'password_hash', type: 'TEXT NOT NULL' },
        { name: 'role', type: 'TEXT CHECK(student, admin)' },
        { name: 'education', type: 'TEXT' },
        { name: 'college', type: 'TEXT' },
        { name: 'course', type: 'TEXT' },
        { name: 'year_of_study', type: 'TEXT' },
        { name: 'skills', type: 'TEXT' },
        { name: 'interests', type: 'TEXT' },
        { name: 'location', type: 'TEXT' },
        { name: 'bio', type: 'TEXT' },
        { name: 'resume_text', type: 'TEXT' },
      ],
    },
    {
      name: 'scholarships',
      purpose: 'Verified and aggregated national and international scholarship opportunities',
      columns: [
        { name: 'id', type: 'TEXT PRIMARY KEY', pk: true },
        { name: 'title', type: 'TEXT NOT NULL' },
        { name: 'provider', type: 'TEXT NOT NULL' },
        { name: 'amount', type: 'TEXT NOT NULL' },
        { name: 'deadline', type: 'TEXT NOT NULL' },
        { name: 'category', type: 'TEXT' },
        { name: 'education_level', type: 'TEXT' },
        { name: 'eligibility', type: 'TEXT' },
        { name: 'verified', type: 'INTEGER (0 or 1)' },
        { name: 'official_url', type: 'TEXT' },
      ],
    },
    {
      name: 'internships',
      purpose: 'Curated technical, research, and corporate internships with stipends',
      columns: [
        { name: 'id', type: 'TEXT PRIMARY KEY', pk: true },
        { name: 'company', type: 'TEXT NOT NULL' },
        { name: 'role', type: 'TEXT NOT NULL' },
        { name: 'skills', type: 'TEXT' },
        { name: 'stipend', type: 'TEXT' },
        { name: 'work_mode', type: 'TEXT' },
        { name: 'duration', type: 'TEXT' },
        { name: 'deadline', type: 'TEXT' },
        { name: 'verified', type: 'INTEGER (0 or 1)' },
      ],
    },
    {
      name: 'jobs',
      purpose: 'Entry-level and graduate employment positions for students',
      columns: [
        { name: 'id', type: 'TEXT PRIMARY KEY', pk: true },
        { name: 'company', type: 'TEXT NOT NULL' },
        { name: 'role', type: 'TEXT NOT NULL' },
        { name: 'skills', type: 'TEXT' },
        { name: 'salary', type: 'TEXT' },
        { name: 'experience', type: 'TEXT' },
        { name: 'location', type: 'TEXT' },
        { name: 'deadline', type: 'TEXT' },
        { name: 'verified', type: 'INTEGER' },
      ],
    },
    {
      name: 'courses',
      purpose: 'Curated free and certified courses for skill development',
      columns: [
        { name: 'id', type: 'TEXT PRIMARY KEY', pk: true },
        { name: 'title', type: 'TEXT NOT NULL' },
        { name: 'provider', type: 'TEXT' },
        { name: 'category', type: 'TEXT' },
        { name: 'duration', type: 'TEXT' },
        { name: 'level', type: 'TEXT' },
        { name: 'is_free', type: 'INTEGER' },
        { name: 'certificate_available', type: 'INTEGER' },
      ],
    },
    {
      name: 'applications',
      purpose: 'Student Application Tracker storing stages (Kanban)',
      columns: [
        { name: 'id', type: 'TEXT PRIMARY KEY', pk: true },
        { name: 'user_id', type: 'TEXT REFERENCES users(id)', fk: true },
        { name: 'opportunity_id', type: 'TEXT' },
        { name: 'title', type: 'TEXT' },
        { name: 'company_or_provider', type: 'TEXT' },
        { name: 'status', type: 'TEXT (Interested, Applied, etc.)' },
        { name: 'applied_date', type: 'TEXT' },
        { name: 'deadline', type: 'TEXT' },
      ],
    },
    {
      name: 'bookmarks',
      purpose: 'Saved opportunities for student quick access',
      columns: [
        { name: 'id', type: 'TEXT PRIMARY KEY', pk: true },
        { name: 'user_id', type: 'TEXT REFERENCES users(id)', fk: true },
        { name: 'resource_id', type: 'TEXT' },
        { name: 'resource_type', type: 'TEXT' },
        { name: 'created_at', type: 'TEXT' },
      ],
    },
    {
      name: 'roadmaps',
      purpose: '7-step dynamic roadmap progress persistence',
      columns: [
        { name: 'id', type: 'TEXT PRIMARY KEY', pk: true },
        { name: 'user_id', type: 'TEXT REFERENCES users(id)', fk: true },
        { name: 'career_goal', type: 'TEXT' },
        { name: 'steps_json', type: 'TEXT (JSON)' },
        { name: 'updated_at', type: 'TEXT' },
      ],
    },
  ];

  const presetQueries = [
    {
      label: 'Top Scholarships by Amount',
      sql: 'SELECT title, provider, amount, deadline, verified FROM scholarships ORDER BY verified DESC LIMIT 5;',
    },
    {
      label: 'High-Stipend Tech Internships',
      sql: 'SELECT role, company, stipend, work_mode, deadline FROM internships WHERE work_mode = "Remote" LIMIT 5;',
    },
    {
      label: 'Registered Students Summary',
      sql: 'SELECT name, education, course, college, skills FROM users WHERE role = "student";',
    },
    {
      label: 'All Active Applications by Stage',
      sql: 'SELECT status, count(*) as count FROM applications GROUP BY status;',
    },
  ];

  const executeQuery = async () => {
    setRunning(true);
    setQueryError(null);
    setQueryResult(null);
    try {
      const res = await fetch('/api/admin/sql-console', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: sqlQuery }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setQueryResult(data);
      } else {
        setQueryError(data.error || 'Failed to execute SQL query');
      }
    } catch (err: any) {
      setQueryError(err.message || 'Execution error');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                Relational Database &amp; System Architecture
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  SQLite / sql.js Wasm
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Normalized Schema, Foreign Keys &amp; Interactive SQL Query Runner
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 px-6 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs">
          <button
            onClick={() => setActiveTab('schema')}
            className={`px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === 'schema'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Table className="w-3.5 h-3.5" /> Database Tables ({tables.length})
          </button>
          <button
            onClick={() => setActiveTab('console')}
            className={`px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === 'console'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" /> Interactive SQL Console
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === 'architecture'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Architecture &amp; ER Flow
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {/* TAB 1: SCHEMA TABLES */}
          {activeTab === 'schema' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 text-xs text-blue-900 dark:text-blue-200">
                <p className="font-bold flex items-center gap-1.5 mb-1">
                  <CheckCircle className="w-4 h-4 text-blue-600" /> Relational Database Specification
                </p>
                <p>
                  CareerBridge employs a fully relational SQLite schema compiled to WebAssembly (sql.js) for instantaneous in-memory execution and zero-latency querying. It adheres to 3NF database normalization standards with foreign key constraints, indexing, and cascade rules.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tables.map((tbl) => (
                  <div
                    key={tbl.name}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                      <div className="flex items-center gap-2">
                        <Table className="w-4 h-4 text-indigo-500" />
                        <span className="font-bold text-sm text-slate-900 dark:text-white font-mono">
                          {tbl.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {tbl.columns.length} columns
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                      {tbl.purpose}
                    </p>

                    <div className="space-y-1 font-mono text-[11px]">
                      {tbl.columns.map((col, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between py-0.5 px-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-800/60"
                        >
                          <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                            {col.pk ? (
                              <Key className="w-3 h-3 text-amber-500" />
                            ) : col.fk ? (
                              <span className="text-[9px] text-blue-500 font-bold">FK</span>
                            ) : (
                              <span className="w-3 text-center text-slate-300">•</span>
                            )}
                            <span className="font-semibold">{col.name}</span>
                          </div>
                          <span className="text-slate-400 dark:text-slate-500 text-[10px]">
                            {col.type}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: INTERACTIVE SQL CONSOLE */}
          {activeTab === 'console' && (
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">
                  Select a demo preset or write custom SQL statements against the live database:
                </p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {presetQueries.map((pq, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSqlQuery(pq.sql)}
                      className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-indigo-400 text-slate-700 dark:text-slate-200 transition-colors"
                    >
                      {pq.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Editor Box */}
              <div className="rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-950 text-slate-100 overflow-hidden font-mono text-xs">
                <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" /> SQLite Query Console
                  </span>
                  <span>Read-Only &amp; Mutate Supported</span>
                </div>
                <div className="p-3">
                  <textarea
                    rows={4}
                    value={sqlQuery}
                    onChange={(e) => setSqlQuery(e.target.value)}
                    className="w-full bg-transparent text-emerald-400 font-mono text-xs focus:outline-none resize-none leading-relaxed"
                    placeholder="Enter SQL: SELECT * FROM scholarships..."
                  />
                </div>
                <div className="px-3 py-2 bg-slate-900/80 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={executeQuery}
                    disabled={running || !sqlQuery.trim()}
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-sans font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{running ? 'Executing...' : 'Run Query'}</span>
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {queryError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-mono">
                  {queryError}
                </div>
              )}

              {/* Results Table */}
              {queryResult && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>
                      Returned {queryResult.count} row(s) in {queryResult.type} operation
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      Status: 200 OK
                    </span>
                  </div>

                  {queryResult.rows && queryResult.rows.length > 0 ? (
                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {queryResult.columns.map((col: string, idx: number) => (
                              <th
                                key={idx}
                                className="px-3 py-2 font-mono font-bold text-[11px] border-b border-slate-200 dark:border-slate-700"
                              >
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {queryResult.rows.map((row: any, rIdx: number) => (
                            <tr
                              key={rIdx}
                              className="hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-800 dark:text-slate-200"
                            >
                              {queryResult.columns.map((col: string, cIdx: number) => (
                                <td
                                  key={cIdx}
                                  className="px-3 py-2 text-[11px] font-mono whitespace-nowrap"
                                >
                                  {String(row[col] ?? 'NULL')}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-slate-500 border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
                      {queryResult.message || 'No rows returned.'}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ARCHITECTURE & ER FLOW */}
          {activeTab === 'architecture' && (
            <div className="space-y-6 text-xs text-slate-700 dark:text-slate-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                    1. Presentation Layer
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                    React 18 + TypeScript + Tailwind CSS
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-[11px]">
                    <li>Student &amp; Admin modular dashboards</li>
                    <li>Kanban drag-and-drop state</li>
                    <li>Live search &amp; filter engines</li>
                    <li>Dark/Light mode context</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                    2. Server &amp; AI Layer
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                    Node.js + Express + Gemini 3.8 Flash
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-[11px]">
                    <li>RESTful `/api/*` endpoints</li>
                    <li>ATS Resume Scoring &amp; parsing</li>
                    <li>Multilingual AI Chatbot (6 languages)</li>
                    <li>Role-based skill gap analyzer</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                    3. Data Persistence Layer
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                    SQLite Relational Engine
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-[11px]">
                    <li>Indexed tables for rapid matching</li>
                    <li>Foreign keys on users &amp; applications</li>
                    <li>JSON document storage for roadmaps</li>
                    <li>File-backed persistence (careerbridge.sqlite)</li>
                  </ul>
                </div>
              </div>

              {/* College Presentation Summary Points */}
              <div className="p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/20">
                <h4 className="font-bold text-indigo-900 dark:text-indigo-200 mb-2">
                  Academic Viva &amp; Demo Highlights
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <strong>• Real-World Problem:</strong> Eliminates fragmented scholarship portals, hidden deadlines, and predatory hiring scams through verification badges.
                  </div>
                  <div>
                    <strong>• Gemini Intelligence:</strong> Context-aware recommendation engine and multilingual conversational advisor in Indian regional languages.
                  </div>
                  <div>
                    <strong>• Full CRUD Implementation:</strong> Complete Administrative management interface for scholarships, internships, jobs, and courses.
                  </div>
                  <div>
                    <strong>• Zero External Server Dependency:</strong> Entire relational database is self-hosted inside SQLite Wasm, resilient to connection dropouts.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">CareerBridge Academic Project Architecture</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
