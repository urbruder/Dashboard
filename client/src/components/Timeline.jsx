import { useMemo } from 'react';
import { Clock, Briefcase, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';

const EVENT_TYPES = {
    scraped: {
        icon: Briefcase, label: 'Scraped',
        color: 'text-indigo-400', dot: 'bg-indigo-400',
    },
    applied: {
        icon: CheckCircle, label: 'Applied',
        color: 'text-emerald-400', dot: 'bg-emerald-400',
    },
    error: {
        icon: AlertTriangle, label: 'Error',
        color: 'text-red-400', dot: 'bg-red-400',
    },
};

const CAT_STYLES = {
    VM: 'bg-violet-500/12 text-violet-400 border-violet-500/20',
    SSO: 'bg-amber-500/12 text-amber-400 border-amber-500/20',
    RO: 'bg-rose-500/12 text-rose-400 border-rose-500/20',
};

function getCatStyle(source) {
    if (source === 'VM') return CAT_STYLES.VM;
    if (source === 'SSO') return CAT_STYLES.SSO;
    if (source && source.startsWith('RO')) return CAT_STYLES.RO;
    return 'bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] border-[var(--color-border)]';
}

export default function Timeline({ jobData = [], errors = [] }) {
    // ALL hooks first before any conditional returns
    const events = useMemo(() => {
        const items = [];

        if (Array.isArray(jobData)) {
            jobData.forEach(job => {
                const date = job.job_scraped_date;
                if (!date) return;
                try {
                    const d = new Date(date);
                    if (isNaN(d.getTime())) return;

                    items.push({
                        type: 'scraped', timestamp: d,
                        company: job.company_name || 'Unknown',
                        title: job.job_title || '',
                        source: job._sourceTab || '',
                    });

                    const status = (job.Status || '').toLowerCase().trim();
                    if (['complete', 'applied', 'submitted'].includes(status)) {
                        items.push({
                            type: 'applied', timestamp: d,
                            company: job.company_name || 'Unknown',
                            title: job.job_title || '',
                            source: job._sourceTab || '',
                        });
                    }
                } catch (e) { /* skip */ }
            });
        }

        if (Array.isArray(errors)) {
            errors.forEach(err => {
                const date = err.Timestamp;
                if (!date) return;
                try {
                    const d = new Date(date);
                    if (isNaN(d.getTime())) return;
                    items.push({
                        type: 'error', timestamp: d,
                        message: err['Error Message'] || 'Unknown error',
                        workflow: err.Workflow || 'System',
                    });
                } catch (e) { /* skip */ }
            });
        }

        items.sort((a, b) => b.timestamp - a.timestamp);
        return items.slice(0, 25);
    }, [jobData, errors]);

    const groupedByDate = useMemo(() => {
        const groups = {};
        events.forEach(event => {
            const dateKey = event.timestamp.toLocaleDateString(undefined, {
                weekday: 'short', month: 'short', day: 'numeric',
            });
            if (!groups[dateKey]) groups[dateKey] = [];
            groups[dateKey].push(event);
        });
        return groups;
    }, [events]);

    // Empty check AFTER hooks
    if (events.length === 0) {
        return (
            <div className="panel p-6 text-center">
                <p className="text-[var(--color-text-muted)] text-sm">No recent activity to display.</p>
            </div>
        );
    }

    return (
        <div className="panel overflow-hidden h-full flex flex-col">
            {/* Header */}
            <div className="panel-header px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-cyan-500/12 flex items-center justify-center">
                        <Clock className="w-4.5 h-4.5 text-cyan-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Activity Timeline</h3>
                        <p className="text-[11px] text-[var(--color-text-muted)]">Recent job activity & events</p>
                    </div>
                </div>
                <span className="text-[10px] text-[var(--color-text-muted)] bg-[var(--color-base)] px-2.5 py-1 rounded-lg border border-[var(--color-border)] font-medium">
                    {events.length} events
                </span>
            </div>

            {/* Timeline content */}
            <div className="p-5 flex-1 overflow-y-auto">
                {Object.entries(groupedByDate).map(([dateLabel, dateEvents], groupIdx) => (
                    <div key={dateLabel} className={groupIdx > 0 ? 'mt-4' : ''}>
                        {/* Date header */}
                        <div className="flex items-center gap-2 mb-2.5">
                            <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider whitespace-nowrap">{dateLabel}</span>
                            <div className="flex-1 h-px bg-[var(--color-border)]" />
                            <span className="text-[9px] text-[var(--color-text-muted)]">{dateEvents.length}</span>
                        </div>

                        {/* Events */}
                        <div className="space-y-0 relative">
                            <div className="absolute left-[15px] top-3 bottom-3 w-px timeline-line" />

                            {dateEvents.map((event, idx) => {
                                const config = EVENT_TYPES[event.type];

                                return (
                                    <div key={idx} className="flex items-start gap-3 py-1.5 relative group">
                                        <div className={`w-[7px] h-[7px] rounded-full ${config.dot} mt-1.5 relative z-10 ring-2 ring-[var(--color-surface)] shrink-0 ml-[12px]`} />

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className={`text-[9px] font-bold uppercase tracking-wider ${config.color}`}>
                                                    {config.label}
                                                </span>
                                                {event.source && (
                                                    <span className={`text-[8px] font-bold px-1 py-0.5 rounded border leading-none ${getCatStyle(event.source)}`}>
                                                        {event.source}
                                                    </span>
                                                )}
                                                <span className="text-[9px] text-[var(--color-text-muted)]">
                                                    {event.timestamp.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>

                                            {event.type === 'error' ? (
                                                <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5 truncate" title={event.message}>
                                                    <span className="text-red-400/70 font-medium">{event.workflow}:</span> {event.message}
                                                </p>
                                            ) : (
                                                <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5 truncate" title={`${event.company} — ${event.title}`}>
                                                    <span className="text-[var(--color-text-primary)] font-medium">{event.company}</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
