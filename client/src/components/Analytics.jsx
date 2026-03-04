import { useState, useMemo } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Calendar, TrendingUp } from 'lucide-react';

const DATE_RANGES = [
    { label: '7D', days: 7 },
    { label: '14D', days: 14 },
    { label: '30D', days: 30 },
    { label: 'All', days: null },
];

export default function Analytics({ jobData }) {
    const [selectedRange, setSelectedRange] = useState(14);

    // All hooks must be called before any early returns
    const dateCounts = useMemo(() => {
        if (!jobData || jobData.length === 0) return {};
        const counts = {};
        jobData.forEach(job => {
            if (!job.job_scraped_date) return;
            try {
                const dateObj = new Date(job.job_scraped_date);
                if (isNaN(dateObj.getTime())) return;
                const dateKey = dateObj.toISOString().split('T')[0];
                counts[dateKey] = (counts[dateKey] || 0) + 1;
            } catch (e) { /* skip */ }
        });
        return counts;
    }, [jobData]);

    const chartData = useMemo(() => {
        const sortedDates = Object.keys(dateCounts).sort();
        if (sortedDates.length === 0) return [];

        // Apply date range filter
        const filtered = selectedRange
            ? sortedDates.slice(-selectedRange)
            : sortedDates;

        return filtered.map(dateKey => {
            const d = new Date(dateKey);
            const localD = new Date(d.getTime() + Math.abs(d.getTimezoneOffset() * 60000));
            return {
                Date: localD.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                fullDate: dateKey,
                Total_Jobs: dateCounts[dateKey]
            };
        });
    }, [dateCounts, selectedRange]);

    // Now handle empty state AFTER all hooks
    if (!jobData || jobData.length === 0) {
        return (
            <div className="panel p-6 h-96 flex items-center justify-center">
                <p className="text-[var(--color-text-muted)] text-sm font-medium">Waiting for Job Data...</p>
            </div>
        );
    }

    // Compute summary stats
    const totalInRange = chartData.reduce((sum, d) => sum + d.Total_Jobs, 0);
    const avgInRange = chartData.length > 0 ? Math.round(totalInRange / chartData.length) : 0;

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#131a2e] border border-[#1c2541] rounded-xl px-4 py-3 shadow-xl">
                    <p className="text-[11px] text-[var(--color-text-muted)] uppercase tracking-wider font-semibold mb-1">{label}</p>
                    <p className="text-lg font-bold text-indigo-400">{payload[0].value} <span className="text-xs text-[var(--color-text-muted)] font-medium">jobs</span></p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="panel overflow-hidden">
            {/* Header with date range filters */}
            <div className="panel-header px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-500/12 flex items-center justify-center">
                        <TrendingUp className="w-4.5 h-4.5 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Date-Wise Job Count</h3>
                        <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                            {totalInRange} jobs total · ~{avgInRange}/day avg
                        </p>
                    </div>
                </div>

                {/* Date range filter buttons */}
                <div className="flex items-center gap-1.5 bg-[var(--color-base)] p-1 rounded-lg border border-[var(--color-border)]">
                    <Calendar className="w-3.5 h-3.5 text-[var(--color-text-muted)] ml-2" />
                    {DATE_RANGES.map(range => (
                        <button
                            key={range.label}
                            onClick={() => setSelectedRange(range.days)}
                            className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all ${selectedRange === range.days
                                ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 shadow-sm'
                                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] border border-transparent'
                                }`}
                        >
                            {range.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chart */}
            <div className="h-80 w-full px-4 pb-4 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                        <defs>
                            <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#818cf8" stopOpacity={0.25} />
                                <stop offset="100%" stopColor="#818cf8" stopOpacity={0.01} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1c2541" vertical={false} />
                        <XAxis
                            dataKey="Date"
                            stroke="#2a3454"
                            tick={{ fill: '#6b7a96', fontSize: 11, fontWeight: 500 }}
                            axisLine={{ stroke: '#1c2541' }}
                            tickLine={false}
                            dy={10}
                            interval={chartData.length > 20 ? 2 : chartData.length > 10 ? 1 : 0}
                        />
                        <YAxis
                            stroke="#2a3454"
                            tick={{ fill: '#6b7a96', fontSize: 11, fontWeight: 500 }}
                            axisLine={{ stroke: '#1c2541' }}
                            tickLine={false}
                            dx={-10}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            name="Total Jobs"
                            dataKey="Total_Jobs"
                            stroke="#818cf8"
                            strokeWidth={2.5}
                            fill="url(#colorJobs)"
                            dot={{ r: 3.5, fill: '#1e1b4b', strokeWidth: 2, stroke: '#818cf8' }}
                            activeDot={{ r: 6, fill: '#6366f1', stroke: '#e0e7ff', strokeWidth: 2 }}
                            animationDuration={800}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
