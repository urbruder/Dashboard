import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Activity, FilterX, LayoutDashboard, Users, Shield, Zap } from 'lucide-react';
import Analytics from './components/Analytics';
import JobTable from './components/JobTable';
import StatCards from './components/StatCards';
import TopCompanies from './components/TopCompanies';
import RecruiterList from './components/RecruiterList';
import Timeline from './components/Timeline';
import CategoryBreakdown from './components/CategoryBreakdown';

const SOCKET_SERVER_URL = 'http://localhost:5000';

function App() {
  const [data, setData] = useState({
    workflowTracker: [],
    jobData: [],
    errors: [],
    lastUpdated: null
  });

  const [status, setStatus] = useState('connecting');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const socket = io(SOCKET_SERVER_URL);

    socket.on('connect', () => {
      console.log('Connected to backend WebSocket');
    });

    socket.on('sync-status', (payload) => {
      setStatus(payload.status);
      if (payload.status === 'error') {
        setErrorMessage(payload.message || 'Unknown error occurred');
      }
    });

    socket.on('dashboard-data', (payload) => {
      console.log('Received data:', payload);
      setData(payload);
      setStatus('live');
    });

    socket.on('disconnect', () => {
      setStatus('error');
      setErrorMessage('Disconnected from server');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const totalJobs = Array.isArray(data.workflowTracker) ? data.workflowTracker.reduce((sum, row) => sum + (parseInt(row.Total_Jobs) || 0), 0) : 0;

  const filteredJobData = selectedCategory && Array.isArray(data.jobData)
    ? data.jobData.filter(job => {
      if (selectedCategory === 'VM') return job._sourceTab === 'VM';
      if (selectedCategory === 'SSO') return job._sourceTab === 'SSO';
      if (selectedCategory === 'RO') return job._sourceTab && job._sourceTab.startsWith('RO');
      return true;
    })
    : (data.jobData || []);

  const totalErrors = Array.isArray(data.errors) ? data.errors.length : 0;

  const statusConfig = {
    live: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', text: 'text-emerald-400', dot: 'bg-emerald-400', glow: true },
    syncing: { bg: 'bg-amber-500/10', border: 'border-amber-500/25', text: 'text-amber-400', dot: 'bg-amber-400', glow: false },
    error: { bg: 'bg-red-500/10', border: 'border-red-500/25', text: 'text-red-400', dot: 'bg-red-400', glow: false },
    connecting: { bg: 'bg-[var(--color-surface-elevated)]', border: 'border-[var(--color-border)]', text: 'text-[var(--color-text-muted)]', dot: 'bg-[var(--color-text-muted)]', glow: false },
  };

  const currentStatus = statusConfig[status] || statusConfig.connecting;

  return (
    <div className="min-h-screen bg-[var(--color-base)] text-[var(--color-text-primary)] font-[Inter,system-ui,sans-serif]">
      {/* Top accent line */}
      <div className="h-0.5 w-full bg-gradient-to-r from-indigo-600 via-violet-500 to-fuchsia-500" />

      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ──── Header ──── */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/15 shrink-0">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white">
                US Jobs Dashboard
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <Zap className="w-3 h-3 text-indigo-400" />
                <p className="text-[var(--color-text-muted)] text-xs font-medium tracking-wide uppercase">
                  Live Sync via Webhooks
                </p>
                {data.lastUpdated && (
                  <>
                    <span className="text-[var(--color-border)] text-xs">|</span>
                    <p className="text-[var(--color-text-secondary)] text-xs">
                      Last Pull: {new Date(data.lastUpdated).toLocaleTimeString()}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className={`flex items-center gap-2.5 px-4 py-2 rounded-full border ${currentStatus.bg} ${currentStatus.border} ${currentStatus.text} shadow-sm`}>
            <div className="relative flex h-2.5 w-2.5">
              {status === 'syncing' && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
              )}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${currentStatus.dot} ${currentStatus.glow ? 'animate-glow' : ''}`} />
            </div>
            <span className="font-semibold capitalize text-xs tracking-wider">{status}</span>
          </div>
        </header>

        {/* ──── Main Content ──── */}
        <main className="space-y-6">
          {/* Error Banner */}
          {status === 'error' && (
            <div className="bg-red-950/30 border border-red-500/15 text-red-200 px-5 py-3.5 rounded-xl flex items-center gap-3 shadow-lg shadow-red-950/15">
              <div className="bg-red-500/12 p-2 rounded-lg hidden sm:block">
                <Activity className="w-5 h-5 text-red-400" />
              </div>
              <p className="text-sm">
                <span className="font-semibold text-red-300">Connection Error:</span>{' '}
                <span className="text-red-200/80">{errorMessage}</span>
              </p>
            </div>
          )}

          {/* Stat Cards */}
          <StatCards
            jobData={data.jobData}
            workflowTracker={data.workflowTracker}
            errors={data.errors}
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
          />

          {/* Navigation Tabs */}
          <div className="flex bg-[var(--color-surface)] backdrop-blur-sm p-1 rounded-xl border border-[var(--color-border)] shadow-inner w-full md:w-fit">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'dashboard'
                ? 'bg-indigo-500/12 text-indigo-400 shadow-sm border border-indigo-500/20'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] border border-transparent'
                }`}
            >
              <LayoutDashboard className="w-4 h-4" /> Overview
            </button>
            <button
              onClick={() => setActiveTab('recruiters')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'recruiters'
                ? 'bg-fuchsia-500/12 text-fuchsia-400 shadow-sm border border-fuchsia-500/20'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] border border-transparent'
                }`}
            >
              <Users className="w-4 h-4" /> Recruiter Info
            </button>
          </div>

          {/* Active Filter Banner */}
          {selectedCategory && (
            <div className="bg-indigo-500/6 border border-indigo-500/12 text-indigo-300 px-4 py-2.5 rounded-xl flex items-center justify-between shadow-sm">
              <span className="text-sm font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_6px_rgba(99,102,241,0.5)]" />
                Filtering by: <span className="font-bold text-indigo-200">{selectedCategory} Jobs</span>
              </span>
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-indigo-400 hover:text-indigo-200 bg-indigo-500/12 hover:bg-indigo-500/20 px-3 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
              >
                <FilterX className="w-3 h-3" /> Clear
              </button>
            </div>
          )}

          {/* Dashboard Views */}
          {activeTab === 'dashboard' ? (
            <div className="space-y-6">
              {/* Chart + Timeline row — aligned heights */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                <div className="lg:col-span-2">
                  <Analytics jobData={filteredJobData} />
                </div>
                <div className="lg:col-span-1 max-h-[440px]">
                  <Timeline jobData={filteredJobData} errors={data.errors} />
                </div>
              </div>

              {/* Category Breakdown bar chart */}
              <CategoryBreakdown jobData={filteredJobData} />

              {/* Top Companies — full width, side-by-side */}
              <TopCompanies jobData={filteredJobData} />

              {/* Recent Errors */}
              <div className="panel overflow-hidden">
                <div className="panel-header px-6 py-4">
                  <h3 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]" />
                    Recent Errors
                  </h3>
                </div>
                <div className="p-4 overflow-y-auto max-h-[300px]">
                  {data.errors && data.errors.length > 0 ? (
                    <ul className="space-y-2">
                      {data.errors.slice().reverse().slice(0, 8).map((err, i) => (
                        <li key={i} className="bg-[var(--color-surface-elevated)] rounded-xl p-3.5 border border-[var(--color-border)] hover:border-red-500/15 transition-colors">
                          <div className="flex justify-between items-start mb-1.5">
                            <span className="text-[10px] font-bold text-red-400 px-2 py-0.5 bg-red-500/10 rounded-md border border-red-500/12 uppercase tracking-wider">
                              {err.Workflow || 'System'}
                            </span>
                            <span className="text-[10px] text-[var(--color-text-muted)] font-medium">
                              {err.Timestamp ? new Date(err.Timestamp).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                          <p className="text-xs text-[var(--color-text-secondary)] mt-1.5 leading-relaxed">{err['Error Message'] || JSON.stringify(err)}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="flex items-center justify-center text-[var(--color-text-muted)] text-sm py-6">
                      ✓ System healthy — no errors recorded.
                    </div>
                  )}
                </div>
              </div>

              {/* Job Table */}
              <JobTable jobData={filteredJobData} />
            </div>
          ) : (
            <RecruiterList jobData={filteredJobData} />
          )}

        </main>

        {/* Footer */}
        <footer className="text-center py-4 border-t border-[var(--color-border-subtle)]">
          <p className="text-[11px] text-[var(--color-text-muted)] tracking-wide">US Jobs Dashboard • Powered by Live Google Sheets Sync</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
