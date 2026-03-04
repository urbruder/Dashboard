import { ExternalLink, Filter } from 'lucide-react';
import { useState } from 'react';

const CAT_COLORS = {
    VM: { badge: 'bg-violet-500/12 text-violet-400 border-violet-500/20', dot: 'bg-violet-400' },
    SSO: { badge: 'bg-amber-500/12 text-amber-400 border-amber-500/20', dot: 'bg-amber-400' },
    RO: { badge: 'bg-rose-500/12 text-rose-400 border-rose-500/20', dot: 'bg-rose-400' },
    DEFAULT: { badge: 'bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] border-[var(--color-border)]', dot: 'bg-[var(--color-text-muted)]' },
};

const STATUS_COLORS = {
    success: 'bg-emerald-500/12 text-emerald-400 border-emerald-500/20',
    pending: 'bg-amber-500/12 text-amber-400 border-amber-500/20',
    default: 'bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] border-[var(--color-border)]',
};

function getCatColor(source) {
    if (source === 'VM') return CAT_COLORS.VM;
    if (source === 'SSO') return CAT_COLORS.SSO;
    if (source.startsWith('RO')) return CAT_COLORS.RO;
    return CAT_COLORS.DEFAULT;
}

function getStatusColor(status) {
    const lc = status.toLowerCase().trim();
    if (['complete', 'applied', 'submitted'].includes(lc)) return STATUS_COLORS.success;
    if (['pending', 'in progress'].includes(lc)) return STATUS_COLORS.pending;
    return STATUS_COLORS.default;
}

export default function JobTable({ jobData }) {
    const [activeTab, setActiveTab] = useState('High Match');

    if (!jobData || jobData.length === 0) {
        return (
            <div className="panel p-6 text-center py-12">
                <p className="text-[var(--color-text-muted)] text-sm font-medium">Loading jobs...</p>
            </div>
        );
    }

    const highMatchJobs = jobData.filter(job => {
        const matchStr = String(job['Job Match After %'] || '');
        const matchScore = parseFloat(matchStr.replace('%', ''));
        return !isNaN(matchScore) && matchScore > 85;
    }).slice(0, 50);

    const appliedJobs = jobData.filter(job =>
        job.Status && ['complete', 'applied', 'submitted'].includes(job.Status.toLowerCase().trim())
    ).slice(0, 50);

    const activeJobs = activeTab === 'High Match' ? highMatchJobs : appliedJobs;

    return (
        <div className="panel overflow-hidden">
            {/* Header */}
            <div className="panel-header px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <h3 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/12 flex items-center justify-center">
                        <Filter className="w-4 h-4 text-indigo-400" />
                    </div>
                    Job Feed
                </h3>
                <div className="flex bg-[var(--color-base)] p-1 rounded-xl border border-[var(--color-border)] shadow-inner">
                    <button
                        onClick={() => setActiveTab('High Match')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'High Match'
                            ? 'bg-indigo-500/12 text-indigo-400 shadow-sm border border-indigo-500/20'
                            : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] border border-transparent'
                            }`}
                    >
                        High Match (&gt; 85%)
                    </button>
                    <button
                        onClick={() => setActiveTab('Applied')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'Applied'
                            ? 'bg-emerald-500/12 text-emerald-400 shadow-sm border border-emerald-500/20'
                            : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] border border-transparent'
                            }`}
                    >
                        Applied ({appliedJobs.length})
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-[var(--color-surface-elevated)] text-[11px] text-[var(--color-text-muted)] uppercase font-semibold tracking-wider">
                        <tr>
                            <th className="px-6 py-3.5">Company</th>
                            <th className="px-6 py-3.5">Title</th>
                            <th className="px-6 py-3.5">Status</th>
                            <th className="px-6 py-3.5">Category</th>
                            <th className="px-6 py-3.5">Match %</th>
                            <th className="px-6 py-3.5">Link</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border-subtle)]">
                        {activeJobs.map((job, idx) => {
                            const source = (job._sourceTab || '').toUpperCase();
                            const catStyle = getCatColor(source);
                            const status = (job.Status || 'Unknown').trim();
                            const statusStyle = getStatusColor(status);

                            const matchStr = String(job['Job Match After %'] || '-');
                            const matchNum = parseFloat(matchStr.replace('%', ''));
                            const matchColor = !isNaN(matchNum)
                                ? matchNum >= 90 ? 'text-emerald-400 font-extrabold' : matchNum >= 80 ? 'text-indigo-400 font-bold' : 'text-[var(--color-text-secondary)] font-medium'
                                : 'text-[var(--color-text-muted)]';

                            return (
                                <tr key={idx} className="hover:bg-[var(--color-surface-hover)]/50 transition-colors group">
                                    <td className="px-6 py-4 font-semibold text-[var(--color-text-primary)]">{job.company_name || 'N/A'}</td>
                                    <td className="px-6 py-4 text-[var(--color-text-secondary)] max-w-xs truncate" title={job.job_title}>{job.job_title || 'N/A'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border whitespace-nowrap ${statusStyle}`}>
                                            {status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 border rounded-lg text-[11px] font-bold whitespace-nowrap ${catStyle.badge}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${catStyle.dot}`} />
                                            {source || 'UNKNOWN'}
                                        </span>
                                    </td>
                                    <td className={`px-6 py-4 ${matchColor}`}>
                                        {matchStr}
                                    </td>
                                    <td className="px-6 py-4">
                                        {job.apply_url && (
                                            <a href={job.apply_url} target="_blank" rel="noopener noreferrer"
                                                className="text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1.5 opacity-70 group-hover:opacity-100 transition-all whitespace-nowrap bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/12 hover:border-indigo-500/25 text-xs font-semibold"
                                            >
                                                Apply <ExternalLink className="w-3.5 h-3.5" />
                                            </a>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        {activeJobs.length === 0 && (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center text-[var(--color-text-muted)] text-sm">
                                    No jobs found for the selected filter.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
