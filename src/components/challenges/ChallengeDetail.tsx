import { ArrowLeft, Target, Calendar, Wallet, FileText, CheckCircle2, Loader2, Users, Send, Rocket, AlertCircle } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../lib/api";
import { useToast } from "../../context/ToastContext";

export default function ChallengeDetail() {
    const { id } = useParams();
    const { showToast } = useToast();
    const [ch, setCh] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'requirements' | 'kpis' | 'applications'>('overview');
    
    // Application modal state
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
    const [solutionSummary, setSolutionSummary] = useState('');
    const [proposedBudget, setProposedBudget] = useState('');
    const [proposedTimeline, setProposedTimeline] = useState('');
    const [applying, setApplying] = useState(false);
    const [applyError, setApplyError] = useState('');

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const isStartup = user?.role === 'Startup';
    const isGov = ['Government Officer', 'Admin'].includes(user?.role);

    const loadChallenge = () => {
        if (!id) return;
        api.get(`/challenges/${id}`)
            .then(res => {
                setCh(res.data);
                if (!proposedBudget) setProposedBudget(res.data.budget || '₹25,00,000');
                if (!proposedTimeline) setProposedTimeline(res.data.timeline || '6 Months');
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadChallenge();
    }, [id]);

    const handleApply = async (e: React.FormEvent) => {
        e.preventDefault();
        setApplying(true);
        setApplyError('');
        try {
            await api.post(`/challenges/${id}/apply`, {
                solutionSummary,
                proposedBudget,
                proposedTimeline
            });
            setIsApplyModalOpen(false);
            showToast("Application Submitted Successfully to Government Portal!", 'success');
            loadChallenge();
        } catch (e: any) {
            console.error(e);
            const msg = e.response?.data?.error || "Failed to submit application";
            setApplyError(msg);
            showToast(msg, 'error');
        } finally {
            setApplying(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto p-12 text-center text-on-surface-variant flex items-center justify-center gap-2">
                <Loader2 className="animate-spin text-primary" size={24} /> Loading Challenge Dossier...
            </div>
        );
    }

    if (!ch) {
        return (
            <div className="max-w-5xl mx-auto p-12 text-center text-on-surface">
                Challenge not found.
            </div>
        );
    }

    const hasApplied = ch.applications?.some((a: any) => a.startupId === user?.startupId);

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300 pb-16">
            {/* Top Navigation */}
            <div className="flex items-center justify-between">
                <Link to="/challenges" className="flex items-center gap-2 text-on-surface-variant hover:text-primary font-bold text-xs transition-colors">
                    <ArrowLeft size={16} /> Back to Repository
                </Link>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-mono bg-surface-container px-2 py-1 rounded text-on-surface-variant font-bold uppercase">
                        Ref: {ch.id?.substring(0, 8)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        ch.status === 'PUBLISHED' ? 'bg-primary/10 text-primary border border-primary/20' :
                        ch.status === 'COMPLETED' ? 'bg-tertiary-fixed/30 text-on-tertiary-fixed-variant border border-tertiary-fixed-dim' :
                        'bg-secondary-fixed/30 text-secondary border border-secondary-fixed-dim'
                    }`}>
                        {ch.status}
                    </span>
                </div>
            </div>

            {/* Main Header Card */}
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 lg:p-8 border-b border-outline-variant/30 bg-surface-container-low/40">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="space-y-3 max-w-3xl">
                            <span className="text-[11px] font-bold text-primary uppercase tracking-wider bg-primary/10 px-2.5 py-1 rounded-md inline-block">
                                {ch.department ? ch.department.name : 'State Innovation Department'} • {ch.category || 'General'}
                            </span>
                            <h1 className="text-2xl lg:text-3xl font-display font-bold text-on-surface leading-tight">
                                {ch.title}
                            </h1>
                            <p className="text-on-surface-variant font-medium text-sm leading-relaxed">
                                {ch.problemStatement || ch.description}
                            </p>
                        </div>

                        {/* Summary Badges */}
                        <div className="flex sm:flex-col gap-2 shrink-0">
                            <div className="px-4 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-center min-w-[120px]">
                                <div className="text-2xl font-display font-bold text-primary">{ch.applications?.length || 0}</div>
                                <div className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider mt-0.5">Applications</div>
                            </div>
                            <div className="px-4 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-center min-w-[120px]">
                                <div className="text-2xl font-display font-bold text-secondary">{ch.timeline || '6 Mos'}</div>
                                <div className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider mt-0.5">Pilot Duration</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab Bar & Action Buttons */}
                <div className="px-6 py-3 bg-surface-container-lowest flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/30">
                    <div className="flex gap-4 overflow-x-auto">
                        {[
                            { key: 'overview', label: 'Overview' },
                            { key: 'requirements', label: 'Requirements' },
                            { key: 'kpis', label: 'Target KPIs' },
                            { key: 'applications', label: `Applications (${ch.applications?.length || 0})` }
                        ].map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key as any)}
                                className={`font-bold text-xs pb-3 -mb-3 border-b-2 transition-colors whitespace-nowrap ${
                                    activeTab === tab.key
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-on-surface-variant hover:text-on-surface'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            to={`/discover?challengeId=${ch.id}`}
                            className="flex items-center gap-1.5 bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/30 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors"
                        >
                            <Users size={14} /> AI Matched Startups
                        </Link>

                        {isStartup && (
                            hasApplied ? (
                                <span className="bg-tertiary-fixed/30 text-on-tertiary-fixed-variant border border-tertiary-fixed-dim px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5">
                                    <CheckCircle2 size={14} /> Application Submitted
                                </span>
                            ) : (
                                <button
                                    onClick={() => setIsApplyModalOpen(true)}
                                    className="flex items-center gap-1.5 bg-primary text-on-primary hover:bg-primary-container px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-transform active:scale-95"
                                >
                                    <Send size={14} /> Apply to Challenge
                                </button>
                            )
                        )}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="p-6 lg:p-8">
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                <section className="space-y-3">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-2">
                                        <Target className="text-primary" size={16} /> Target Outcome Framework
                                    </h3>
                                    <div className="bg-surface-container border border-outline-variant/30 p-5 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="border-r-0 sm:border-r border-outline-variant/30 pr-4">
                                            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Baseline Constraint</span>
                                            <p className="text-base font-mono font-bold text-on-surface mt-1">{ch.baselineValue || "Legacy baseline measurement"}</p>
                                        </div>
                                        <div>
                                            <span className="text-[11px] font-bold text-secondary uppercase tracking-wider">Target Objective</span>
                                            <p className="text-xl font-mono font-extrabold text-secondary mt-1">{ch.targetValue || "20% improvement"}</p>
                                        </div>
                                    </div>
                                </section>

                                <section className="space-y-3">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">Required Solution Characteristics</h3>
                                    <p className="text-sm text-on-surface font-medium leading-relaxed bg-surface-container-low p-4 rounded-lg border border-outline-variant/20">
                                        {ch.description || "Deploy an edge-integrated software and telemetry infrastructure with automated algorithmic triage, continuous measurement auditing, and real-time dashboard visibility."}
                                    </p>
                                </section>
                            </div>

                            {/* Sidebar Specs */}
                            <div className="space-y-4">
                                <div className="bg-surface-container border border-outline-variant/30 p-5 rounded-xl space-y-4">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant border-b border-outline-variant/30 pb-2">
                                        Procurement Specifications
                                    </h4>
                                    <div className="flex items-start gap-3">
                                        <Wallet className="text-primary shrink-0 mt-0.5" size={16} />
                                        <div>
                                            <div className="text-[10px] font-bold text-on-surface-variant uppercase">Max Pilot Budget</div>
                                            <div className="font-mono font-bold text-sm text-on-surface">{ch.budget || "₹25,00,000"}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Calendar className="text-primary shrink-0 mt-0.5" size={16} />
                                        <div>
                                            <div className="text-[10px] font-bold text-on-surface-variant uppercase">Pilot Timeline</div>
                                            <div className="font-bold text-sm text-on-surface">{ch.timeline || "6 Months"}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <FileText className="text-primary shrink-0 mt-0.5" size={16} />
                                        <div>
                                            <div className="text-[10px] font-bold text-on-surface-variant uppercase">Sandbox Location</div>
                                            <div className="font-medium text-xs text-on-surface">{ch.location || "State Innovation Sandbox"}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'requirements' && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">Mandatory Requirements & Standards</h3>
                            <div className="space-y-3">
                                {(ch.requirements || []).map((req: any, i: number) => (
                                    <div key={i} className="p-4 bg-surface-container rounded-lg border border-outline-variant/30 flex items-start gap-3">
                                        <CheckCircle2 size={18} className="text-primary shrink-0 mt-0.5" />
                                        <div>
                                            <span className="text-sm font-bold text-on-surface">{req.description}</span>
                                            {req.isMandatory && (
                                                <span className="ml-2 text-[10px] uppercase font-bold bg-error-container text-on-error-container px-1.5 py-0.2 rounded">
                                                    Mandatory
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'kpis' && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">Target Key Performance Indicators</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(ch.kpis || []).map((kpi: any, i: number) => (
                                    <div key={i} className="p-5 bg-surface-container rounded-xl border border-outline-variant/30 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-bold text-sm text-on-surface">{kpi.name}</h4>
                                            <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded">{kpi.unit || '%'}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-center pt-2 border-t border-outline-variant/20">
                                            <div className="bg-surface-container-lowest p-2 rounded">
                                                <div className="text-[10px] uppercase font-bold text-on-surface-variant">Baseline</div>
                                                <div className="text-sm font-mono font-bold text-on-surface">{kpi.baseline || 'Baseline'}</div>
                                            </div>
                                            <div className="bg-surface-container-lowest p-2 rounded">
                                                <div className="text-[10px] uppercase font-bold text-secondary">Target</div>
                                                <div className="text-sm font-mono font-bold text-secondary">{kpi.target}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'applications' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">Submitted Startup Applications</h3>
                                {isGov && (
                                    <Link to="/applications" className="text-xs font-bold text-secondary hover:underline">
                                        Open Full Application Screener →
                                    </Link>
                                )}
                            </div>

                            {ch.applications?.length === 0 ? (
                                <div className="p-8 text-center text-on-surface-variant bg-surface-container-low rounded-xl">
                                    No applications submitted yet.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {ch.applications.map((app: any, i: number) => (
                                        <div key={i} className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-bold text-sm text-on-surface">{app.startup?.name}</h4>
                                                    <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded uppercase font-bold">
                                                        {app.status}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-on-surface-variant font-medium mt-1">{app.solutionSummary}</p>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <Link
                                                    to="/evaluation"
                                                    className="bg-surface-container border border-outline-variant/50 hover:bg-surface-container-high px-3 py-1.5 rounded-lg text-xs font-bold text-on-surface"
                                                >
                                                    Evaluate
                                                </Link>
                                                {app.status === 'SELECTED' && (
                                                    <Link
                                                        to="/pilots"
                                                        className="bg-primary text-on-primary hover:bg-primary-container px-3 py-1.5 rounded-lg text-xs font-bold"
                                                    >
                                                        View Pilot
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Apply Modal */}
            {isApplyModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-level-4">
                        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
                            <h3 className="font-display font-bold text-lg text-on-surface flex items-center gap-2">
                                <Rocket className="text-primary" size={20} /> Apply to Challenge
                            </h3>
                            <button onClick={() => setIsApplyModalOpen(false)} className="text-on-surface-variant hover:text-on-surface font-bold">✕</button>
                        </div>

                        {applyError && (
                            <div className="p-3 bg-error-container text-on-error-container rounded-lg text-xs font-bold flex items-center gap-2">
                                <AlertCircle size={14} /> {applyError}
                            </div>
                        )}

                        <form onSubmit={handleApply} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Solution Summary / Proposed Architecture</label>
                                <textarea
                                    rows={4}
                                    value={solutionSummary}
                                    onChange={(e) => setSolutionSummary(e.target.value)}
                                    placeholder="Describe your technical approach and how your solution satisfies the baseline constraint..."
                                    className="w-full bg-surface-container border border-outline-variant/50 rounded-lg p-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Proposed Budget (₹)</label>
                                    <input
                                        type="text"
                                        value={proposedBudget}
                                        onChange={(e) => setProposedBudget(e.target.value)}
                                        placeholder="e.g. ₹25,00,000"
                                        className="w-full bg-surface-container border border-outline-variant/50 rounded-lg p-2.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Proposed Timeline</label>
                                    <input
                                        type="text"
                                        value={proposedTimeline}
                                        onChange={(e) => setProposedTimeline(e.target.value)}
                                        placeholder="e.g. 6 Months"
                                        className="w-full bg-surface-container border border-outline-variant/50 rounded-lg p-2.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
                                </div>
                            </div>

                            <div className="pt-3 border-t border-outline-variant/30 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsApplyModalOpen(false)}
                                    className="px-4 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={applying || !solutionSummary}
                                    className="px-5 py-2 text-xs font-bold bg-primary text-on-primary hover:bg-primary-container rounded-lg shadow-sm disabled:opacity-50 flex items-center gap-2"
                                >
                                    {applying ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Submit Application
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
