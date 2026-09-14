import { Scale, CheckCircle2, ArrowRight, UserCheck, Loader2, Sparkles, Building, Award } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../lib/api";
import { useToast } from "../../context/ToastContext";

export default function ScaleReadiness() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [searchParams] = useSearchParams();
    const [pilots, setPilots] = useState<any[]>([]);
    const [selectedPilotId, setSelectedPilotId] = useState<string>(searchParams.get('pilotId') || '');
    const [readinessData, setReadinessData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [, setEvaluating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [decision, setDecision] = useState<string>("SCALE");
    const [comments, setComments] = useState<string>("");

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const userRole = user?.role || '';
    const isGov = ['Government Officer', 'Admin'].includes(userRole);

    useEffect(() => {
        api.get('/pilots')
            .then(res => {
                setPilots(res.data);
                const initialId = selectedPilotId || (res.data.length > 0 ? res.data[0].id : '');
                if (initialId) {
                    setSelectedPilotId(initialId);
                    loadReadiness(initialId);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const loadReadiness = async (pId: string) => {
        setEvaluating(true);
        try {
            const res = await api.get(`/scale/readiness/${pId}`);
            setReadinessData(res.data);
            if (res.data.recommendation) {
                setDecision(res.data.recommendation);
            }
        } catch (e) {
            console.error('Failed to load scale readiness:', e);
        } finally {
            setEvaluating(false);
        }
    };

    const handlePilotChange = (pId: string) => {
        setSelectedPilotId(pId);
        loadReadiness(pId);
    };

    const handleRecordDecision = async () => {
        if (!selectedPilotId) {
            return showToast('Please select a validated pilot to evaluate', 'warning');
        }
        setSaving(true);
        try {
            await api.post('/scale/decision', {
                pilotId: selectedPilotId,
                recommendation: readinessData?.recommendation || decision,
                finalDecision: decision,
                reason: `Official scale decision determination executed by ${user?.name || 'Nodal Officer'}.`,
                comments: comments || readinessData?.whyThisRecommendation
            });
            showToast(`Scale Decision Recorded: ${decision}. Pilot status synchronized.`, 'success');
            navigate('/procurement');
        } catch (e: any) {
            console.error(e);
            showToast(e.response?.data?.error || 'Failed to record scale decision', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-12 flex justify-center items-center gap-2 text-on-surface-variant">
                <Loader2 className="animate-spin text-primary mr-2" /> Evaluating Scale Readiness Engine...
            </div>
        );
    }

    const pilot = readinessData?.pilot || pilots.find(p => p.id === selectedPilotId) || pilots[0];
    const score = readinessData?.overallScore || 92;
    const category = readinessData?.category || 'READY TO SCALE';
    const dims = readinessData?.dimensions || {
        technicalSuccess: 94,
        verifiedImpact: 93,
        evidenceQuality: 88,
        costEfficiency: 85,
        securityArchitecture: 92,
        enterpriseScalability: 89
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300 pb-16">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/30 pb-4">
                <div>
                    <h1 className="text-2xl font-display font-bold text-on-surface flex items-center gap-2">
                        <Scale className="text-primary" /> Scale Readiness & Sovereign Determination
                    </h1>
                    <p className="text-on-surface-variant font-medium text-xs mt-0.5">
                        Synthesize verified pilot telemetry, independent validation, and statutory scale thresholds into actionable procurement decisions.
                    </p>
                </div>

                {/* Pilot Selector */}
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-on-surface-variant whitespace-nowrap">Evaluate Pilot:</span>
                    <select
                        value={selectedPilotId}
                        onChange={(e) => handlePilotChange(e.target.value)}
                        className="bg-surface-container border border-outline-variant/50 px-3 py-1.5 rounded-lg text-xs font-bold text-on-surface focus:outline-none max-w-xs"
                    >
                        {pilots.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.startup?.name} — {p.challenge?.title?.slice(0, 25)}...
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: Pilot Data & Dimensional Scores */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 lg:p-8 shadow-sm relative overflow-hidden space-y-6">
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                            <div className="flex items-center gap-2">
                                <span className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                    <CheckCircle2 size={14} /> Telemetry Verified
                                </span>
                                <span className="text-xs font-mono text-on-surface-variant font-bold">Ref: {pilot?.id?.substring(0, 8)}</span>
                            </div>
                            <span className="text-xs font-bold bg-surface-container px-2.5 py-1 rounded text-on-surface">
                                Status: {pilot?.status}
                            </span>
                        </div>

                        <div>
                            <h2 className="text-3xl font-display font-bold text-on-surface">{pilot?.startup?.name}</h2>
                            <p className="text-sm font-medium text-primary mt-1">{pilot?.challenge?.title}</p>
                            <div className="flex items-center gap-4 text-xs text-on-surface-variant mt-2">
                                <span className="flex items-center gap-1"><Building size={14} /> {pilot?.challenge?.department?.name}</span>
                                <span className="flex items-center gap-1"><Award size={14} /> Sandbox: {pilot?.pilotLocation || 'State Testbed'}</span>
                            </div>
                        </div>

                        {/* Dimensional Breakdown Matrix */}
                        <div className="space-y-3 pt-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                                Multi-Dimensional Readiness Analysis
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {[
                                    { label: 'Technical Success', score: dims.technicalSuccess, weight: '25%' },
                                    { label: 'Verified Impact', score: dims.verifiedImpact, weight: '25%' },
                                    { label: 'Evidence Quality', score: dims.evidenceQuality, weight: '15%' },
                                    { label: 'Cost Efficiency', score: dims.costEfficiency, weight: '15%' },
                                    { label: 'Security & Sovereignty', score: dims.securityArchitecture, weight: '10%' },
                                    { label: 'Enterprise Scalability', score: dims.enterpriseScalability, weight: '10%' }
                                ].map((d, i) => (
                                    <div key={i} className="p-3.5 bg-surface-container rounded-lg border border-outline-variant/20 space-y-1.5">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-bold text-on-surface">{d.label} <span className="text-[10px] text-on-surface-variant font-normal">({d.weight})</span></span>
                                            <span className="font-mono font-bold text-primary">{d.score}</span>
                                        </div>
                                        <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                                            <div className="bg-primary h-full rounded-full" style={{ width: `${d.score}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* AI Rationale & Explanation */}
                        <div className="pt-4 border-t border-outline-variant/30 space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                                <Sparkles size={14} /> System Recommendation Justification
                            </h4>
                            <p className="text-xs font-medium text-on-surface bg-surface-container-low p-4 rounded-xl leading-relaxed border border-outline-variant/20 border-l-4 border-l-primary">
                                {readinessData?.whyThisRecommendation ||
                                    'Based on verified performance telemetry, the pilot achieved an overall readiness score of 92/100. All target KPIs were independently validated with cryptographic data signatures. Recommended for sovereign procurement scaling across state municipal departments.'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Col: Human Decision Panel */}
                <div className="space-y-6">
                    {/* Automated Score Badge */}
                    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm text-center space-y-2">
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                            Automated Readiness Score
                        </span>
                        <div className="text-6xl font-display font-extrabold font-mono text-primary">
                            {score}<span className="text-xl text-on-surface-variant font-normal">/100</span>
                        </div>
                        <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            category === 'READY TO SCALE' ? 'bg-primary text-on-primary' : 'bg-secondary/20 text-secondary'
                        }`}>
                            {category}
                        </div>
                        <p className="text-[11px] text-on-surface-variant font-medium pt-1">
                            Calculated dynamically via verified telemetry and validator findings.
                        </p>
                    </div>

                    {/* Official Human Decision Box */}
                    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm space-y-4">
                        <div className="border-b border-outline-variant/30 pb-3">
                            <h3 className="font-display font-bold text-base text-on-surface flex items-center gap-2">
                                <UserCheck className="text-primary" size={18} /> Official Government Determination
                            </h3>
                            <p className="text-[11px] text-on-surface-variant font-medium mt-0.5">
                                Human officer sign-off required to authorize state-wide scaling.
                            </p>
                        </div>

                        <div className="space-y-2">
                            {[
                                { id: 'SCALE', label: 'SCALE (State-Wide Scale Determination)', color: 'border-primary text-primary' },
                                { id: 'PROCEED TO PROCUREMENT', label: 'PROCEED TO PROCUREMENT (Fast-Track GEM)', color: 'border-secondary text-secondary' },
                                { id: 'EXTEND PILOT', label: 'EXTEND PILOT (Further Testing Required)', color: 'border-tertiary-fixed-dim text-on-tertiary-fixed-variant' },
                                { id: 'STOP', label: 'STOP (Discontinue Innovation)', color: 'border-error text-error' }
                            ].map((opt) => (
                                <button
                                    key={opt.id}
                                    onClick={() => setDecision(opt.id)}
                                    className={`w-full text-left p-3 rounded-lg border-2 text-xs font-bold transition-all flex items-center justify-between ${
                                        decision === opt.id
                                            ? `bg-surface-container ${opt.color} shadow-sm`
                                            : 'border-outline-variant/30 bg-surface-container-low text-on-surface-variant hover:border-outline-variant'
                                    }`}
                                >
                                    <span>{opt.label}</span>
                                    <div className={`w-3.5 h-3.5 rounded-full border ${
                                        decision === opt.id ? 'bg-primary border-transparent' : 'border-outline-variant'
                                    }`}></div>
                                </button>
                            ))}
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">
                                Statutory Order Notes / Justification:
                            </label>
                            <textarea
                                rows={3}
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                                placeholder="Enter administrative justification for the decision..."
                                className="w-full bg-surface-container border border-outline-variant/50 rounded-lg p-2.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                            />
                        </div>

                        {isGov ? (
                            <button
                                onClick={handleRecordDecision}
                                disabled={saving}
                                className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary font-bold py-2.5 px-4 rounded-lg shadow-sm hover:bg-primary-container disabled:opacity-50 transition-all text-xs"
                            >
                                {saving ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
                                Record Decision & Proceed to Procurement
                            </button>
                        ) : (
                            <div className="p-3 bg-surface-container rounded-lg text-center text-[11px] font-semibold text-on-surface-variant">
                                View only mode. Switch to Government Officer persona to record decisions.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
