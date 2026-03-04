import { Users, Mail, Linkedin, ExternalLink, Search } from 'lucide-react';
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

export default function RecruiterList({ jobData = [] }) {
    const [searchTerm, setSearchTerm] = useState('');

    if (!jobData || jobData.length === 0) {
        return (
            <div className="panel p-6 text-center py-12">
                <p className="text-[var(--color-text-muted)] flex flex-col items-center justify-center gap-2 text-sm">
                    <Users className="w-8 h-8 text-[var(--color-text-muted)] mb-2" />
                    No recruiter data found...
                </p>
            </div>
        );
    }

    const activeJobs = jobData.filter(job => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        const searchable = [
            job.company_name, job.job_title,
            job.recruiter_name, job['Recruiter Name'],
            job.recruiter_email, job['Recruiter Email']
        ].map(val => (val || '').toString().toLowerCase());
        return searchable.some(s => s.includes(term));
    });

    return (
        <div className="panel overflow-hidden flex flex-col">
            {/* Header */}
            <div className="panel-header px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <h3 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-fuchsia-500/12 flex items-center justify-center">
                        <Users className="w-4 h-4 text-fuchsia-400" />
                    </div>
                    Recruiter Info & Job Details
                </h3>
                <div className="relative w-full sm:w-64">
                    <input
                        type="text"
                        placeholder="Search company, title, recruiter..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[var(--color-base)] border border-[var(--color-border)] rounded-xl py-2.5 pl-9 pr-4 text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-fuchsia-500/30 focus:ring-1 focus:ring-fuchsia-500/20 transition-colors"
                    />
                    <Search className="w-4 h-4 text-[var(--color-text-muted)] absolute left-3 top-2.5" />
                </div>
            </div>
            <div className="overflow-x-auto flex-1 h-[600px]">
                <table className="w-full text-left text-sm">
                    <thead className="bg-[var(--color-surface-elevated)] text-[11px] text-[var(--color-text-muted)] uppercase font-semibold tracking-wider sticky top-0 backdrop-blur-sm z-10 shadow-sm">
                        <tr>
                            <th className="px-6 py-3.5">Company & Title</th>
                            <th className="px-6 py-3.5">Recruiter Name</th>
                            <th className="px-6 py-3.5">Contact</th>
                            <th className="px-6 py-3.5">Status</th>
                            <th className="px-6 py-3.5">Network</th>
                            <th className="px-6 py-3.5">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border-subtle)]">
                        {activeJobs.map((job, idx) => {
                            const rName = job.recruiter_name || job['Recruiter Name'] || job.Recruiter || 'N/A';
                            const rEmail = job.recruiter_email || job['Recruiter Email'] || job.Email || '';
                            const rLinked = job.recruiter_linkedin || job['Recruiter LinkedIn'] || job.LinkedIn || '';

                            const source = (job._sourceTab || '').toUpperCase();
                            const catStyle = getCatColor(source);
                            const status = (job.Status || 'Unknown').trim();
                            const statusStyle = getStatusColor(status);

                            return (
                                <tr key={idx} className="hover:bg-[var(--color-surface-hover)]/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-start gap-2.5">
                                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 border rounded text-[10px] font-bold whitespace-nowrap mt-0.5 ${catStyle.badge}`}>
                                                <span className={`w-1 h-1 rounded-full ${catStyle.dot}`} />
                                                {source || '?'}
                                            </span>
                                            <div>
                                                <div className="font-semibold text-[var(--color-text-primary)]">{job.company_name || 'N/A'}</div>
                                                <div className="text-xs text-[var(--color-text-muted)] max-w-[200px] truncate" title={job.job_title}>{job.job_title || 'N/A'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-[var(--color-text-secondary)]">{rName}</td>
                                    <td className="px-6 py-4">
                                        {rEmail ? (
                                            <a href={`mailto:${rEmail}`} className="text-[var(--color-text-muted)] hover:text-indigo-400 transition-colors flex items-center gap-2 group/email" title={rEmail}>
                                                <Mail className="w-4 h-4 group-hover/email:scale-110 transition-transform" />
                                                <span className="truncate max-w-[150px] text-xs">{rEmail}</span>
                                            </a>
                                        ) : (
                                            <span className="text-[var(--color-text-muted)]">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border whitespace-nowrap ${statusStyle}`}>
                                            {status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {rLinked ? (
                                            <a href={rLinked} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1.5 group/link">
                                                <Linkedin className="w-4 h-4 group-hover/link:scale-110 transition-transform" />
                                                <span className="text-xs font-medium">Profile</span>
                                            </a>
                                        ) : (
                                            <span className="text-[var(--color-text-muted)]">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {job.apply_url && (
                                            <a href={job.apply_url} target="_blank" rel="noopener noreferrer"
                                                className="text-fuchsia-400 hover:text-fuchsia-300 inline-flex items-center gap-1.5 opacity-70 group-hover:opacity-100 transition-all whitespace-nowrap bg-fuchsia-500/10 px-3 py-1.5 rounded-lg border border-fuchsia-500/12 hover:border-fuchsia-500/25 text-xs font-semibold">
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
                                    No recruiter jobs found matching the search or categories.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
