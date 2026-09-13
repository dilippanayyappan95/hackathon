import type { ReactNode } from 'react';
import { ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

interface KpiCardProps {
    title: string;
    value: string;
    trend: 'up' | 'down' | 'neutral';
    trendValue: string;
    icon?: ReactNode;
    to?: string;
}

export default function KpiCard({ title, value, trend, trendValue, icon, to }: KpiCardProps) {
    const CardWrapper = to ? Link : 'div';
    return (
        <CardWrapper to={to as string} className="bg-surface-container-lowest p-5 rounded-lg border border-outline-variant/30 shadow-sm flex flex-col gap-3 hover:border-secondary/30 transition-colors focus:ring-2 focus:ring-secondary/50 focus:outline-none">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wide">{title}</h3>
                {icon && <div className="text-secondary/70">{icon}</div>}
            </div>

            <div className="flex items-end justify-between">
                <div className="text-3xl font-display font-bold text-on-surface">{value}</div>

                <div className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full ${trend === 'up' ? 'bg-tertiary-fixed text-on-tertiary-fixed' :
                    trend === 'down' ? 'bg-error-container text-on-error-container' :
                        'bg-surface-container text-on-surface-variant'
                    }`}>
                    {trend === 'up' && <ArrowUpRight size={14} />}
                    {trend === 'down' && <ArrowDownRight size={14} />}
                    {trend === 'neutral' && <Activity size={14} />}
                    {trendValue}
                </div>
            </div>
        </CardWrapper>
    );
}
