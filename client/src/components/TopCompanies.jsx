import { TrendingUp, Award, Building2 } from 'lucide-react';

export default function TopCompanies({ jobData = [] }) {
    if (!jobData || jobData.length === 0) {
        return null;
    }

    const scrapedCounts = {};
    const appliedCounts = {};

    jobData.forEach(job => {
        const company = job.company_name;
        if (!company) return;

        scrapedCounts[company] = (scrapedCounts[company] || 0) + 1;

        const status = (job.Status || '').toLowerCase().trim();
        if (['complete', 'applied', 'submitted'].includes(status)) {
            appliedCounts[company] = (appliedCounts[company] || 0) + 1;
        }
    });

    const topScraped = Object.entries(scrapedCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const topApplied = Object.entries(appliedCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const maxScraped = topScraped.length > 0 ? topScraped[0][1] : 1;
    const maxApplied = topApplied.length > 0 ? topApplied[0][1] : 1;

    const rankBadgeColors = [
        'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
        'bg-slate-400/12 text-slate-300 border-slate-400/20',
        'bg-amber-600/12 text-amber-500 border-amber-600/20',
        'bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] border-[var(--color-border)]',
        'bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] border-[var(--color-border)]',
    ];

    const CompanyList = ({ items, maxCount, accentColor, barGradient, emptyText }) => (
        <div className="space-y-2.5">
            {items.length > 0 ? items.map(([company, count], idx) => (
                <div key={idx} className="group">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                            <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold border shrink-0 ${rankBadgeColors[idx]}`}>
                                {idx + 1}
                            </span>
                            <span className={`text-[var(--color-text-primary)] font-medium text-sm truncate group-hover:${accentColor} transition-colors cursor-default`} title={company}>
                                {company}
                            </span>
                        </div>
                        <span className="text-xs font-bold text-[var(--color-text-primary)] bg-[var(--color-surface-elevated)] px-2 py-0.5 rounded-md border border-[var(--color-border)] shrink-0 ml-2">
                            {count}
                        </span>
                    </div>
                    <div className="h-1.5 bg-[var(--color-base)] rounded-full overflow-hidden ml-7">
                        <div
                            className={`h-full rounded-full bg-gradient-to-r ${barGradient} transition-all duration-500`}
                            style={{ width: `${(count / maxCount) * 100}%` }}
                        />
                    </div>
                </div>
            )) : (
                <p className="text-sm text-[var(--color-text-muted)] italic py-4 text-center">{emptyText}</p>
            )}
        </div>
    );

    return (
        <div className="panel overflow-hidden">
            {/* Header */}
            <div className="panel-header px-6 py-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-500/12 flex items-center justify-center">
                    <Building2 className="w-4.5 h-4.5 text-indigo-400" />
                </div>
                <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Top Companies</h3>
            </div>

            {/* Side-by-side layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[var(--color-border)]">
                {/* Most Scraped — Left */}
                <div className="p-5">
                    <h4 className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
                        <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                        Most Scraped
                    </h4>
                    <CompanyList
                        items={topScraped}
                        maxCount={maxScraped}
                        accentColor="text-indigo-300"
                        barGradient="from-indigo-400 to-indigo-600"
                        emptyText="No companies tracked yet."
                    />
                </div>

                {/* Most Applied — Right */}
                <div className="p-5">
                    <h4 className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
                        <Award className="w-3.5 h-3.5 text-emerald-400" />
                        Most Applied To
                    </h4>
                    <CompanyList
                        items={topApplied}
                        maxCount={maxApplied}
                        accentColor="text-emerald-300"
                        barGradient="from-emerald-400 to-emerald-600"
                        emptyText="No applications recorded yet."
                    />
                </div>
            </div>
        </div>
    );
}
