import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { BarChart3 } from 'lucide-react';

const CAT_COLORS = {
    VM: { scraped: '#8b5cf6', applied: '#a78bfa' },  // violet
    SSO: { scraped: '#f59e0b', applied: '#fbbf24' },  // amber
    RO: { scraped: '#f43f5e', applied: '#fb7185' },  // rose
};

export default function CategoryBreakdown({ jobData = [] }) {
    const chartData = useMemo(() => {
        if (!jobData || jobData.length === 0) return [];

        const categories = [
            { key: 'VM', label: 'VM', filter: j => j._sourceTab === 'VM' },
            { key: 'SSO', label: 'SSO', filter: j => j._sourceTab === 'SSO' },
            { key: 'RO', label: 'RO', filter: j => j._sourceTab && j._sourceTab.startsWith('RO') },
        ];

        return categories.map(cat => {
            const catJobs = jobData.filter(cat.filter);
            const applied = catJobs.filter(j =>
                j.Status && ['complete', 'applied', 'submitted'].includes(j.Status.toLowerCase().trim())
            ).length;

            return {
                category: cat.label,
                Scraped: catJobs.length,
                Applied: applied,
                scrapedColor: CAT_COLORS[cat.key].scraped,
                appliedColor: CAT_COLORS[cat.key].applied,
            };
        });
    }, [jobData]);

    if (chartData.length === 0 || chartData.every(d => d.Scraped === 0)) {
        return null;
    }

    const totalScraped = chartData.reduce((s, d) => s + d.Scraped, 0);
    const totalApplied = chartData.reduce((s, d) => s + d.Applied, 0);
    const conversionRate = totalScraped > 0 ? ((totalApplied / totalScraped) * 100).toFixed(1) : 0;

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#131a2e] border border-[#1c2541] rounded-xl px-4 py-3 shadow-xl">
                    <p className="text-[11px] text-[var(--color-text-muted)] uppercase tracking-wider font-bold mb-2">{label} Jobs</p>
                    {payload.map((entry, i) => (
                        <div key={i} className="flex items-center gap-2 mb-1">
                            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: entry.color }} />
                            <span className="text-xs text-[var(--color-text-secondary)]">{entry.name}:</span>
                            <span className="text-xs font-bold text-[var(--color-text-primary)]">{entry.value}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    const CustomLegend = () => (
        <div className="flex items-center justify-center gap-6 mt-2">
            <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-indigo-500" />
                <span className="text-[11px] text-[var(--color-text-secondary)] font-medium">Scraped</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-emerald-400" />
                <span className="text-[11px] text-[var(--color-text-secondary)] font-medium">Applied</span>
            </div>
        </div>
    );

    return (
        <div className="panel overflow-hidden">
            <div className="panel-header px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-violet-500/12 flex items-center justify-center">
                        <BarChart3 className="w-4.5 h-4.5 text-violet-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Category Breakdown</h3>
                        <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                            Scraped vs Applied per category · {conversionRate}% conversion rate
                        </p>
                    </div>
                </div>

                {/* Quick stats */}
                <div className="flex items-center gap-3">
                    {chartData.map(d => (
                        <div key={d.category} className="flex items-center gap-1.5 bg-[var(--color-base)] px-3 py-1.5 rounded-lg border border-[var(--color-border)]">
                            <span className="w-2 h-2 rounded-full" style={{ background: d.scrapedColor }} />
                            <span className="text-[11px] font-bold text-[var(--color-text-primary)]">{d.category}</span>
                            <span className="text-[10px] text-[var(--color-text-muted)]">{d.Scraped}/{d.Applied}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="h-64 w-full px-4 pb-4 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }} barCategoryGap="30%">
                        <CartesianGrid strokeDasharray="3 3" stroke="#1c2541" vertical={false} />
                        <XAxis
                            dataKey="category"
                            stroke="#2a3454"
                            tick={{ fill: '#8892a8', fontSize: 12, fontWeight: 600 }}
                            axisLine={{ stroke: '#1c2541' }}
                            tickLine={false}
                            dy={8}
                        />
                        <YAxis
                            stroke="#2a3454"
                            tick={{ fill: '#6b7a96', fontSize: 11, fontWeight: 500 }}
                            axisLine={{ stroke: '#1c2541' }}
                            tickLine={false}
                            dx={-10}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.06)' }} />
                        <Bar dataKey="Scraped" name="Scraped" radius={[6, 6, 0, 0]} maxBarSize={60}>
                            {chartData.map((entry, i) => (
                                <Cell key={i} fill={entry.scrapedColor} />
                            ))}
                        </Bar>
                        <Bar dataKey="Applied" name="Applied" radius={[6, 6, 0, 0]} maxBarSize={60}>
                            {chartData.map((entry, i) => (
                                <Cell key={i} fill="#34d399" />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
                <CustomLegend />
            </div>
        </div>
    );
}
