import { Briefcase, Server, ShieldCheck, UserCog, CheckCircle, AlertTriangle } from 'lucide-react';

export default function StatCards({ jobData = [], workflowTracker = [], errors = [], selectedCategory, onCategorySelect }) {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayLocale = new Date().toLocaleDateString();

    const liveJobsCount = Array.isArray(jobData) ? jobData.filter(j => {
        if (!j.job_scraped_date) return false;
        try {
            const jobDate = new Date(j.job_scraped_date);
            return !isNaN(jobDate.getTime()) &&
                (jobDate.toISOString().split('T')[0] === todayStr ||
                    jobDate.toLocaleDateString() === todayLocale);
        } catch (e) {
            return false;
        }
    }).length : 0;
    const errorCount = Array.isArray(errors) ? errors.length : 0;

    const vmCount = jobData.filter(j => j._sourceTab === 'VM').length;
    const ssoCount = jobData.filter(j => j._sourceTab === 'SSO').length;
    const roCount = jobData.filter(j => j._sourceTab && j._sourceTab.startsWith('RO')).length;

    const appliedCount = jobData.filter(j =>
        j.Status && ['complete', 'applied', 'submitted'].includes(j.Status.toLowerCase().trim())
    ).length;

    const handleCategoryClick = (category) => {
        if (onCategorySelect) {
            onCategorySelect(selectedCategory === category ? null : category);
        }
    };

    const cards = [
        {
            label: 'Live Jobs', value: liveJobsCount, icon: Briefcase,
            gradient: 'from-blue-500 to-blue-600',
            iconBg: 'bg-blue-500/15', iconColor: 'text-blue-400',
            hoverBorder: 'hover:border-blue-500/25',
            clickable: false,
        },
        {
            label: 'Applied', value: appliedCount, icon: CheckCircle,
            gradient: 'from-emerald-500 to-emerald-600',
            iconBg: 'bg-emerald-500/15', iconColor: 'text-emerald-400',
            hoverBorder: 'hover:border-emerald-500/25',
            clickable: false,
        },
        {
            label: 'VM Jobs', value: vmCount, icon: Server, category: 'VM',
            gradient: 'from-violet-500 to-purple-600',
            iconBg: 'bg-violet-500/15', iconColor: 'text-violet-400',
            hoverBorder: 'hover:border-violet-500/25',
            activeBorder: 'border-violet-500/40', activeBg: 'bg-violet-500/10',
            clickable: true,
        },
        {
            label: 'SSO Jobs', value: ssoCount, icon: ShieldCheck, category: 'SSO',
            gradient: 'from-amber-500 to-orange-500',
            iconBg: 'bg-amber-500/15', iconColor: 'text-amber-400',
            hoverBorder: 'hover:border-amber-500/25',
            activeBorder: 'border-amber-500/40', activeBg: 'bg-amber-500/10',
            clickable: true,
        },
        {
            label: 'RO Jobs', value: roCount, icon: UserCog, category: 'RO',
            gradient: 'from-rose-500 to-pink-600',
            iconBg: 'bg-rose-500/15', iconColor: 'text-rose-400',
            hoverBorder: 'hover:border-rose-500/25',
            activeBorder: 'border-rose-500/40', activeBg: 'bg-rose-500/10',
            clickable: true,
        },
        {
            label: 'Errors', value: errorCount, icon: AlertTriangle,
            gradient: 'from-red-500 to-red-600',
            iconBg: 'bg-red-500/15', iconColor: 'text-red-400',
            hoverBorder: 'hover:border-red-500/25',
            clickable: false,
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {cards.map((card) => {
                const Icon = card.icon;
                const isActive = card.clickable && selectedCategory === card.category;

                return (
                    <div
                        key={card.label}
                        onClick={() => card.clickable && handleCategoryClick(card.category)}
                        className={`
                            relative rounded-2xl p-5 border shadow-lg overflow-hidden
                            flex flex-col items-center justify-center text-center
                            transition-all duration-200 card-hover
                            ${card.clickable ? 'cursor-pointer' : ''}
                            ${isActive
                                ? `${card.activeBg} ${card.activeBorder} scale-[1.02]`
                                : `bg-[var(--color-surface)] border-[var(--color-border)] ${card.hoverBorder}`
                            }
                        `}
                    >
                        {/* Permanent top gradient accent */}
                        <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${card.gradient} ${isActive ? 'opacity-100' : 'opacity-50'}`} />

                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.iconBg} ${card.iconColor} transition-colors`}>
                            <Icon className="w-5 h-5" />
                        </div>

                        <span className="text-[var(--color-text-muted)] text-[11px] uppercase font-semibold tracking-widest mb-1.5">
                            {card.label}
                        </span>

                        <span className="text-3xl font-extrabold text-white tracking-tight">
                            {card.value}
                        </span>

                        {card.clickable && (
                            <span className={`text-[10px] mt-1.5 font-medium tracking-wide transition-colors ${isActive ? card.iconColor : 'text-[var(--color-text-muted)]'}`}>
                                {isActive ? '● ACTIVE' : 'Click to filter'}
                            </span>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
