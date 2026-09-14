import { Target, Zap, ShieldCheck, FileCheck2, Loader2, ArrowRight, Building2, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import GovProofWorkflowStepper from '../common/GovProofWorkflowStepper';

export default function Dashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState<any>({
        challenges: 0,
        publishedChallenges: 0,
        applications: 0,
        shortlisted: 0,
        selected: 0,
        pilots: 0,
        activePilots: 0,
        completedPilots: 0,
        evidence: 0,
        verifiedEvidence: 0,
        validations: 0,
        validated: 0,
        passports: 0,
        scaled: 0,
        startups: 0,
        successRate: 100,
        validationRate: 100,
        departments: [],
        recentAudit: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/analytics')
            .then(res => setStats(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const kpiCards = [
        {
            title: 'Active Challenges',
            value: (stats.publishedChallenges || stats.challenges || 0).toString(),
            subtext: `${stats.challenges} Total Challenges Created`,
            icon: <Target className="text-primary" size={24} />,
            to: '/challenges?status=PUBLISHED',
            badge: 'Published',
            color: 'bg-primary-container text-on-primary-container'
        },
        {
            title: 'Active Pilots',
            value: (stats.activePilots || stats.pilots || 0).toString(),
            subtext: `${stats.completedPilots || 0} Pilots Completed`,
            icon: <Zap className="text-secondary" size={24} />,
            to: '/pilots?status=ACTIVE',
            badge: 'Sandbox Testing',
            color: 'bg-secondary/10 text-secondary'
        },
        {
            title: 'Verified Evidence',
            value: (stats.verifiedEvidence || 0).toString(),
            subtext: `${stats.evidence || 0} Total Artifacts in Vault`,
            icon: <ShieldCheck className="text-tertiary-fixed-variant" size={24} />,
            to: '/evidence?status=VERIFIED',
            badge: `${stats.validationRate || 100}% Verified`,
            color: 'bg-tertiary-fixed/30 text-on-tertiary-fixed-variant'
        },
        {
            title: 'Proof Passports',
            value: (stats.passports || 0).toString(),
            subtext: `${stats.scaled || 0} Scaled for Procurement`,
            icon: <FileCheck2 className="text-secondary-container" size={24} />,
            to: '/passports',
            badge: 'Integrity Hash Verified',
            color: 'bg-secondary-fixed/40 text-secondary'
        },
    ];

    const actionAlerts = [
        {
            id: '1',
            title: 'Hospital Waiting Time Reduction (Mumbai General)',
            description: '47% wait time reduction verified (48 min actual vs 45 min target). Proof Passport GPP-MH-2026-0042 ready for state-wide procurement escalation.',
            severity: 'success',
            actionText: 'Inspect Proof Passport',
            linkTo: '/passports',
        },
        {
            id: '2',
            title: 'Smart Waste Collection Optimization (Pune Zone 4)',
            description: 'Independent validation sign-off completed with 27% OPEX reduction. Tender draft blueprint approved for municipal scaling.',
            severity: 'info',
            actionText: 'View Scale Blueprint',
            linkTo: '/scale',
        },
        {
            id: '3',
            title: 'Road Maintenance Prediction (Thane Highway)',
            description: 'Telemetry turnaround recorded at 10.7 days vs 8-day SLA. Automatic pause triggered pending contractor review.',
            severity: 'warning',
            actionText: 'Audit Evidence Record',
            linkTo: '/validation',
        }
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/30 pb-5">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="bg-primary/10 text-primary border border-primary/20 text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded">
                            Sovereign Testbed Ledger
                        </span>
                    </div>
                    <h1 className="text-3xl font-display font-bold text-on-surface">Government Innovation Dashboard</h1>
                    <p className="text-on-surface-variant font-medium text-sm mt-1">
                        Continuous telemetry verification, KPI measurement, independent audit, and Proof Passport lifecycle.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        to="/challenges/new/ai"
                        className="flex items-center gap-2 bg-primary text-on-primary font-bold py-2.5 px-4 rounded-lg shadow-sm hover:bg-primary-container transition-all text-sm"
                    >
                        Draft Challenge with AI
                    </Link>
                    <Link
                        to="/passports"
                        className="flex items-center gap-2 bg-surface-container border border-outline-variant/50 hover:bg-surface-container-high font-bold py-2.5 px-4 rounded-lg transition-all text-sm text-on-surface"
                    >
                        <FileCheck2 size={16} /> Proof Passports
                    </Link>
                </div>
            </header>

            {/* Reusable Workflow Stepper */}
            <GovProofWorkflowStepper currentStage={stats.scaled > 0 ? 'scale' : stats.passports > 0 ? 'passport' : stats.validated > 0 ? 'validation' : 'pilot'} />

            {/* KPI Metric Cards */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {loading ? (
                    <div className="col-span-4 p-8 flex justify-center text-on-surface-variant font-medium items-center gap-2">
                        <Loader2 className="animate-spin text-primary" size={20} /> Loading database metrics from sovereign backbone...
                    </div>
                ) : (
                    kpiCards.map((card, i) => (
                        <div
                            key={i}
                            onClick={() => navigate(card.to)}
                            className="bg-surface-container-lowest border border-outline-variant/30 hover:border-outline-variant rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{card.title}</span>
                                    <div className="text-3xl font-display font-bold text-on-surface mt-2 group-hover:text-primary transition-colors">
                                        {card.value}
                                    </div>
                                    <p className="text-xs text-on-surface-variant mt-1.5 font-medium">{card.subtext}</p>
                                </div>
                                <div className={`p-3 rounded-xl ${card.color}`}>
                                    {card.icon}
                                </div>
                            </div>
                            <div className="mt-4 pt-3 border-t border-outline-variant/20 flex items-center justify-between text-xs">
                                <span className="font-semibold text-primary group-hover:underline flex items-center gap-1">
                                    View Repository <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                                </span>
                                <span className="text-[10px] font-mono bg-surface-container px-1.5 py-0.5 rounded text-on-surface-variant font-bold">
                                    {card.badge}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </section>

            {/* State Innovation Pipeline Funnel */}
            <section className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4 mb-6">
                    <div>
                        <h3 className="font-display font-bold text-lg text-on-surface">State Innovation Pipeline Activity</h3>
                        <p className="text-xs font-medium text-on-surface-variant mt-0.5">End-to-end verified workflow stages from Problem to Procurement Scale</p>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded">
                        Live Lifecycle
                    </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                    {[
                        { label: 'Challenges', count: stats.challenges || 0, link: '/challenges', step: '1', color: 'border-primary/40 bg-primary/5 text-primary' },
                        { label: 'Applications', count: stats.applications || 0, link: '/applications', step: '2', color: 'border-secondary/40 bg-secondary/5 text-secondary' },
                        { label: 'Shortlisted', count: stats.shortlisted || 0, link: '/applications?status=SHORTLISTED', step: '3', color: 'border-outline-variant bg-surface-container text-on-surface' },
                        { label: 'Pilots', count: stats.pilots || 0, link: '/pilots', step: '4', color: 'border-secondary-container/40 bg-secondary-container/10 text-secondary' },
                        { label: 'Validated', count: stats.validated || 0, link: '/validation', step: '5', color: 'border-tertiary-fixed-dim bg-tertiary-fixed/20 text-on-tertiary-fixed-variant' },
                        { label: 'Scaled', count: stats.scaled || 0, link: '/scale', step: '6', color: 'border-primary bg-primary text-on-primary' }
                    ].map((step, idx) => (
                        <Link
                            to={step.link}
                            key={idx}
                            className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center transition-all hover:scale-105 hover:shadow-sm cursor-pointer ${step.color}`}
                        >
                            <span className="text-[10px] uppercase font-bold tracking-widest opacity-80 mb-1">Step {step.step}</span>
                            <span className="text-3xl font-display font-extrabold font-mono mb-1">{step.count}</span>
                            <span className="text-xs font-bold uppercase tracking-wider">{step.label}</span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Actionable Statutory Alerts & Department Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: Alerts */}
                <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm space-y-4">
                    <h3 className="font-display font-bold text-lg text-on-surface border-b border-outline-variant/20 pb-3 flex items-center justify-between">
                        <span>Active Telemetry & Verification Alerts</span>
                        <span className="text-xs font-medium text-on-surface-variant font-mono">Live Sync</span>
                    </h3>

                    <div className="space-y-3">
                        {actionAlerts.map(alert => (
                            <div
                                key={alert.id}
                                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                                    alert.severity === 'success'
                                        ? 'bg-tertiary-fixed/10 border-tertiary-fixed-dim/40'
                                        : alert.severity === 'info'
                                        ? 'bg-secondary/5 border-secondary/20'
                                        : 'bg-error-container/20 border-error/20'
                                }`}
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        {alert.severity === 'success' && <CheckCircle2 size={16} className="text-tertiary" />}
                                        <h4 className="font-bold text-sm text-on-surface">{alert.title}</h4>
                                    </div>
                                    <p className="text-xs text-on-surface-variant font-medium leading-relaxed">{alert.description}</p>
                                </div>
                                <Link
                                    to={alert.linkTo}
                                    className="shrink-0 text-xs font-bold bg-surface-container-lowest border border-outline-variant/50 hover:bg-surface-container px-3.5 py-2 rounded-lg text-on-surface transition-colors inline-flex items-center gap-1.5 shadow-sm"
                                >
                                    {alert.actionText} <ArrowRight size={12} />
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Col: Departmental Allocation Index */}
                <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm space-y-4">
                    <h3 className="font-display font-bold text-lg text-on-surface border-b border-outline-variant/20 pb-3 flex items-center gap-2">
                        <Building2 size={18} className="text-primary" /> Participating Departments
                    </h3>

                    <div className="space-y-3">
                        {(stats.departments || []).map((d: any, idx: number) => (
                            <div key={idx} className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/20 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-on-surface leading-tight">{d.name.replace('Maharashtra ', '')}</p>
                                    <span className="text-[10px] text-on-surface-variant font-medium">{d.publishedChallenges} Active Challenges</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-mono font-bold text-primary">{d.totalChallenges}</span>
                                    <div className="text-[9px] uppercase tracking-wider text-on-surface-variant font-bold">Allocated</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-2 border-t border-outline-variant/20">
                        <Link
                            to="/analytics"
                            className="w-full text-center text-xs font-bold text-secondary hover:underline inline-block"
                        >
                            View Full State Analytics Ledger →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
