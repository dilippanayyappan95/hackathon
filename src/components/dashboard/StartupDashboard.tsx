import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Rocket, Target, Inbox, Play, Database, FileCheck2,
    ArrowRight, Activity, Building2, CheckCircle2,
    Clock, ExternalLink, Loader2
} from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import GovProofWorkflowStepper from '../common/GovProofWorkflowStepper';

export default function StartupDashboard() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [challenges, setChallenges] = useState<any[]>([]);
    const [applications, setApplications] = useState<any[]>([]);
    const [pilots, setPilots] = useState<any[]>([]);
    const [passports, setPassports] = useState<any[]>([]);
    const [evidence, setEvidence] = useState<any[]>([]);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            api.get('/challenges?status=PUBLISHED').catch(() => ({ data: [] })),
            api.get('/applications').catch(() => ({ data: [] })),
            api.get('/pilots').catch(() => ({ data: [] })),
            api.get('/passports').catch(() => ({ data: [] })),
            api.get('/evidence').catch(() => ({ data: [] })),
        ])
            .then(([chRes, appRes, pilotRes, passRes, evRes]) => {
                setChallenges(chRes.data || []);
                setApplications(appRes.data || []);
                setPilots(pilotRes.data || []);
                setPassports(passRes.data || []);
                setEvidence(evRes.data || []);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="p-16 text-center text-on-surface-variant flex items-center justify-center gap-2">
                <Loader2 className="animate-spin text-primary" size={24} /> Loading Startup Command Center...
            </div>
        );
    }

    const myApplications = applications;
    const myPilots = pilots;
    const myPassports = passports;
    const verifiedEvidenceCount = evidence.filter((e: any) => e.verifiedStatus === 'VERIFIED').length;
    const pendingEvidenceCount = evidence.filter((e: any) => e.verifiedStatus === 'SUBMITTED' || e.verifiedStatus === 'UNDER_REVIEW').length;

    return (
        <div className="space-y-6 animate-in fade-in duration-300 pb-16">
            {/* Startup Enterprise Header */}
            <div className="bg-gradient-to-r from-primary to-primary-container p-6 rounded-2xl text-on-primary shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase bg-tertiary-fixed text-on-tertiary-fixed px-2 py-0.5 rounded font-bold">
                            STARTUP WORKSPACE
                        </span>
                        <span className="text-[10px] font-mono text-on-primary/80 bg-white/10 px-2 py-0.5 rounded">
                            DPIIT EMPANELED
                        </span>
                    </div>
                    <h1 className="text-2xl lg:text-3xl font-display font-bold">
                        {user?.startup || 'MedFlow AI'} Command Center
                    </h1>
                    <p className="text-xs text-on-primary/90 font-medium">
                        Track open public challenges, application reviews, sandbox pilot telemetry, and your verified Innovation Proof Passports.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        to="/challenges"
                        className="px-4 py-2 bg-tertiary-fixed text-on-tertiary-fixed font-bold text-xs rounded-lg shadow-sm hover:bg-tertiary-fixed/90 transition-all flex items-center gap-1.5"
                    >
                        <Target size={14} /> Discover Challenges
                    </Link>
                    <Link
                        to="/startups/profiles"
                        className="px-4 py-2 bg-white/10 text-on-primary hover:bg-white/20 font-bold text-xs rounded-lg transition-all flex items-center gap-1.5"
                    >
                        <Building2 size={14} /> View Enterprise Profile
                    </Link>
                </div>
            </div>

            {/* Stepper */}
            <GovProofWorkflowStepper currentStage={myPassports.length > 0 ? 'passport' : myPilots.length > 0 ? 'pilot' : 'discovery'} />

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
                <Link
                    to="/challenges"
                    className="p-4 bg-surface-container-lowest border border-outline-variant/30 rounded-xl hover:border-primary hover:shadow-sm transition-all group"
                >
                    <div className="flex items-center justify-between text-primary mb-2">
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase">Open Challenges</span>
                        <Target size={16} className="group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="text-2xl font-bold font-display text-on-surface">{challenges.length}</div>
                    <span className="text-[10px] text-tertiary-fixed-variant font-medium flex items-center gap-0.5 mt-1">
                        Active Public Testbeds <ArrowRight size={10} />
                    </span>
                </Link>

                <Link
                    to="/applications"
                    className="p-4 bg-surface-container-lowest border border-outline-variant/30 rounded-xl hover:border-primary hover:shadow-sm transition-all group"
                >
                    <div className="flex items-center justify-between text-secondary mb-2">
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase">My Applications</span>
                        <Inbox size={16} className="group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="text-2xl font-bold font-display text-on-surface">{myApplications.length}</div>
                    <span className="text-[10px] text-on-surface-variant font-medium flex items-center gap-0.5 mt-1">
                        Under Screening <ArrowRight size={10} />
                    </span>
                </Link>

                <Link
                    to="/pilots"
                    className="p-4 bg-surface-container-lowest border border-outline-variant/30 rounded-xl hover:border-primary hover:shadow-sm transition-all group"
                >
                    <div className="flex items-center justify-between text-primary mb-2">
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase">Active Pilots</span>
                        <Play size={16} className="group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="text-2xl font-bold font-display text-on-surface">{myPilots.length}</div>
                    <span className="text-[10px] text-primary font-medium flex items-center gap-0.5 mt-1">
                        Controlled Testbeds <ArrowRight size={10} />
                    </span>
                </Link>

                <Link
                    to="/evidence"
                    className="p-4 bg-surface-container-lowest border border-outline-variant/30 rounded-xl hover:border-primary hover:shadow-sm transition-all group"
                >
                    <div className="flex items-center justify-between text-secondary mb-2">
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase">Evidence Uploads</span>
                        <Database size={16} className="group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="text-2xl font-bold font-display text-on-surface">{verifiedEvidenceCount}</div>
                    <span className="text-[10px] text-tertiary-fixed-variant font-medium flex items-center gap-0.5 mt-1">
                        {pendingEvidenceCount} Pending Review
                    </span>
                </Link>

                <Link
                    to="/validation"
                    className="p-4 bg-surface-container-lowest border border-outline-variant/30 rounded-xl hover:border-primary hover:shadow-sm transition-all group"
                >
                    <div className="flex items-center justify-between text-primary mb-2">
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase">Validation Status</span>
                        <CheckCircle2 size={16} className="group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="text-2xl font-bold font-display text-on-surface">
                        {myPilots.filter(p => p.status === 'COMPLETED').length > 0 ? 'VALIDATED' : 'IN REVIEW'}
                    </div>
                    <span className="text-[10px] text-on-surface-variant font-medium flex items-center gap-0.5 mt-1">
                        Independent Audit
                    </span>
                </Link>

                <Link
                    to="/passports"
                    className="p-4 bg-surface-container-lowest border border-outline-variant/30 rounded-xl hover:border-primary hover:shadow-sm transition-all group"
                >
                    <div className="flex items-center justify-between text-tertiary-fixed-variant mb-2">
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase">Proof Passports</span>
                        <FileCheck2 size={16} className="group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="text-2xl font-bold font-display text-on-surface">{myPassports.length}</div>
                    <span className="text-[10px] text-primary font-bold flex items-center gap-0.5 mt-1">
                        Ready to Scale <ArrowRight size={10} />
                    </span>
                </Link>
            </div>

            {/* Active Sandbox Pilots & Telemetry Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                        <div>
                            <h2 className="text-lg font-display font-bold text-on-surface flex items-center gap-2">
                                <Activity className="text-primary" size={20} /> Active Sandbox Pilot Telemetry
                            </h2>
                            <p className="text-xs text-on-surface-variant">Live KPI telemetry tracked across government pilot environments.</p>
                        </div>
                        <Link to="/pilots/arena" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                            Full Pilot Arena <ArrowRight size={12} />
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {myPilots.length === 0 ? (
                            <div className="text-center py-8 text-on-surface-variant text-xs">No active pilots found. Apply to challenges below.</div>
                        ) : (
                            myPilots.map((p: any, idx: number) => (
                                <div key={idx} className="p-4 bg-surface-container rounded-xl border border-outline-variant/20 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-[10px] font-mono text-primary font-bold uppercase">{p.challenge?.department?.name || 'Department'}</span>
                                            <h3 className="font-bold text-sm text-on-surface">{p.challenge?.title}</h3>
                                        </div>
                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary text-on-primary">
                                            {p.status}
                                        </span>
                                    </div>

                                    {/* KPI Metrics */}
                                    {p.kpis && p.kpis.length > 0 && (
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-outline-variant/20 text-xs">
                                            {p.kpis.slice(0, 3).map((k: any, kidx: number) => (
                                                <div key={kidx} className="bg-surface-container-lowest p-2.5 rounded-lg border border-outline-variant/20">
                                                    <div className="text-[10px] text-on-surface-variant truncate font-medium">{k.name}</div>
                                                    <div className="flex items-baseline gap-1.5 mt-1">
                                                        <span className="font-bold text-xs text-primary">{k.actualValue || k.baselineValue} {k.unit}</span>
                                                        <span className="text-[9px] text-on-surface-variant">(Target: {k.targetValue})</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between text-[11px] pt-1">
                                        <span className="text-on-surface-variant font-medium">Pilot Location: {p.location || 'Municipal Testbed Zone'}</span>
                                        <Link to={`/pilots/arena?id=${p.id}`} className="font-bold text-primary hover:underline flex items-center gap-1">
                                            Telemetry Console <ArrowRight size={11} />
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Proof Passport Badge Showcase */}
                <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="border-b border-outline-variant/20 pb-3">
                        <h2 className="text-lg font-display font-bold text-on-surface flex items-center gap-2">
                            <FileCheck2 className="text-tertiary-fixed-variant" size={20} /> Innovation Proof Passport
                        </h2>
                        <p className="text-xs text-on-surface-variant">Cryptographically validated proof of performance.</p>
                    </div>

                    {myPassports.length === 0 ? (
                        <div className="text-center py-8 text-on-surface-variant text-xs">No passports generated yet. Passports are issued after validation.</div>
                    ) : (
                        myPassports.map((pass: any, pidx: number) => (
                            <div key={pidx} className="p-4 bg-gradient-to-br from-surface-container to-surface-container-low rounded-xl border-2 border-primary/20 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                                        {pass.passportNumber}
                                    </span>
                                    <span className="text-[9px] font-bold text-tertiary-fixed-variant flex items-center gap-1">
                                        <CheckCircle2 size={12} /> VALIDATED
                                    </span>
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-on-surface">{pass.pilot?.challenge?.title || 'Municipal Waiting Time Reduction'}</div>
                                    <div className="text-[10px] text-on-surface-variant mt-0.5">SHA-256: {pass.auditHash?.slice(0, 16)}...</div>
                                </div>
                                <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between">
                                    <span className="text-[10px] text-primary font-bold uppercase">Ready to Scale</span>
                                    <Link
                                        to={`/passports/${pass.id}`}
                                        className="px-3 py-1 bg-primary text-on-primary text-[10px] font-bold rounded shadow-sm hover:bg-primary-container transition-all flex items-center gap-1"
                                    >
                                        View Passport <ExternalLink size={10} />
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}

                    <div className="p-3 bg-surface-container rounded-lg border border-outline-variant/20 text-xs space-y-1">
                        <span className="font-bold text-on-surface flex items-center gap-1">
                            <Rocket size={13} className="text-primary" /> Fast-Track Scaling
                        </span>
                        <p className="text-[11px] text-on-surface-variant leading-relaxed">
                            Verified Proof Passports qualify your solution for state-wide accelerated procurement without re-tendering.
                        </p>
                    </div>
                </div>
            </div>

            {/* Recommended Challenges for Startup */}
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                    <div>
                        <h2 className="text-lg font-display font-bold text-on-surface">Available Public Challenges</h2>
                        <p className="text-xs text-on-surface-variant">Submit innovative proposals for active government testbeds.</p>
                    </div>
                    <Link to="/challenges" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                        View All Challenges ({challenges.length}) <ArrowRight size={12} />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {challenges.slice(0, 3).map((ch: any, idx: number) => (
                        <div key={idx} className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/20 space-y-3 flex flex-col justify-between hover:border-primary transition-all">
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-[10px]">
                                    <span className="font-mono text-primary font-bold">{ch.department?.name || 'Department'}</span>
                                    <span className="px-2 py-0.5 bg-primary/10 text-primary font-bold rounded">{ch.category}</span>
                                </div>
                                <h3 className="font-bold text-sm text-on-surface line-clamp-1">{ch.title}</h3>
                                <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">{ch.problemStatement}</p>
                            </div>

                            <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between">
                                <span className="text-[10px] text-on-surface-variant font-medium flex items-center gap-1">
                                    <Clock size={11} /> {ch.timeline || '90 Days'}
                                </span>
                                <Link
                                    to={`/challenges/${ch.id}`}
                                    className="px-3 py-1 bg-primary text-on-primary text-xs font-bold rounded-lg hover:bg-primary-container transition-all flex items-center gap-1"
                                >
                                    Apply <ArrowRight size={12} />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
