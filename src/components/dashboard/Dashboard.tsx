import KpiCard from './KpiCard';
import StatutoryActionCard from './StatutoryActionCard';
import { Target, TrendingUp, Zap, FileCode, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';

export default function Dashboard() {
    const [stats, setStats] = useState({
        challenges: 0,
        startups: 0,
        pilots: 0,
        activePilots: 0,
        applications: 0,
        shortlisted: 0,
        completedPilots: 0,
        validated: 0,
        scaled: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/analytics')
            .then(res => setStats(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const kpiData = [
        { title: 'Active Challenges', value: stats.challenges.toString(), trend: 'up' as const, trendValue: '+12%', icon: <Target />, to: '/challenges?status=PUBLISHED' },
        { title: 'Pilot Solutions', value: stats.pilots.toString(), trend: 'up' as const, trendValue: '+21%', icon: <Zap />, to: '/pilots?status=ACTIVE' },
        { title: 'SLA Adherence', value: '94.8%', trend: 'neutral' as const, trendValue: '0%', icon: <TrendingUp />, to: '/validation' },
        { title: 'Audit Logs', value: 'Live', trend: 'up' as const, trendValue: '+5%', icon: <FileCode />, to: '/passport' },
    ];

    const actions = [
        {
            id: '1',
            title: 'Smart Waste Management (Pune Zone 4)',
            description: 'Sensor data telemetry completed with 94.8% SLA adherence. Milestone 2 disbursement (₹4,50,000) awaits validator sign-off.',
            severity: 'warning' as const,
            actionText: 'Review Milestone',
            linkTo: '/pilots',
        },
        {
            id: '2',
            title: 'Hospital Waiting Time Reduction',
            description: 'Direct tender submission window closed. AI Copilot pre-filtered 6 compliant health-tech solutions based on sovereign criteria.',
            severity: 'info' as const,
            actionText: 'View Filtered Bids',
            linkTo: '/startups'
        },
        {
            id: '3',
            title: 'Road Maintenance Prediction (Thane)',
            description: 'LiDAR telemetry detection efficiency recorded at 11% vs required 30% baseline. Automatic pilot penalty pause triggered.',
            severity: 'critical' as const,
            actionText: 'Override Protocol',
            linkTo: '/validation'
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
            <header>
                <h1 className="text-3xl font-display font-bold text-on-surface mb-2">Government Innovation Dashboard</h1>
                <p className="text-on-surface-variant font-medium">
                    Monitor active challenges, startup solutions, measurable pilots, and evidence-verified outcomes across municipal departments.
                    <br className="hidden md:block" /> Maharashtra State Innovation Society (MSIS) sovereign sandbox ledger with immutable telemetry verification.
                </p>
            </header>

            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {loading ? (
                    <div className="md:col-span-4 p-8 flex justify-center text-on-surface-variant font-medium">
                        <Loader2 className="animate-spin mr-2" /> Syncing with State Backbone...
                    </div>
                ) : (
                    kpiData.map((kpi, i) => (
                        <KpiCard key={i} {...kpi} />
                    ))
                )}
            </section>

            <section>
                <StatutoryActionCard items={actions} />
            </section>

            {/* State Innovation Pipeline Funnel */}
            <section className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-5 shadow-sm">
                <h3 className="font-display font-bold mb-5 flex items-center justify-between text-on-surface border-b border-outline-variant/20 pb-4">
                    Innovation Pipeline Activity
                </h3>
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between max-w-4xl mx-auto">
                    {['Challenges', 'Applications', 'Shortlisted', 'Pilots', 'Validated', 'Scaled'].map((step, idx) => {
                        const val = idx === 0 ? stats.challenges :
                            idx === 1 ? stats.applications :
                                idx === 2 ? stats.shortlisted :
                                    idx === 3 ? stats.pilots :
                                        idx === 4 ? stats.validated :
                                            stats.scaled;
                        const links = ['/challenges', '/startups/profiles', '/evaluation', '/pilots', '/validation', '/scale'];
                        return (
                            <Link to={links[idx]} key={idx} className="flex flex-col items-center group cursor-pointer hover:opacity-80 transition-opacity">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg mb-2 shadow-sm ${idx === 0 ? 'bg-primary text-on-primary' :
                                    idx === 2 ? 'bg-secondary text-on-secondary' :
                                        idx === 4 ? 'bg-tertiary-fixed text-on-tertiary-fixed border border-outline-variant' :
                                            idx === 5 ? 'bg-tertiary text-on-tertiary' :
                                                'bg-surface-container text-on-surface-variant border border-outline-variant'
                                    }`}>
                                    {val}
                                </div>
                                <div className="text-xs uppercase font-bold tracking-wider text-on-surface-variant group-hover:text-primary transition-colors">{step}</div>
                            </Link>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
