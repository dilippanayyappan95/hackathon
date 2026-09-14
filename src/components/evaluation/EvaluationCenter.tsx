import { CheckSquare, Save, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../lib/api";
import { useToast } from "../../context/ToastContext";

export default function EvaluationCenter() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [searchParams] = useSearchParams();
    const [applications, setApplications] = useState<any[]>([]);
    const [selectedAppId, setSelectedAppId] = useState<string>(searchParams.get('appId') || '');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [conflict, setConflict] = useState(true);
    const [comments, setComments] = useState('');

    const [scores, setScores] = useState({
        tech: 85,
        impact: 80,
        cost: 85,
        scale: 75,
        sec: 90,
        ready: 85,
        sust: 80
    });

    useEffect(() => {
        setLoading(true);
        api.get('/applications')
            .then(res => {
                const active = res.data.filter((a: any) => ['SUBMITTED', 'SHORTLISTED', 'UNDER_EVALUATION', 'SELECTED'].includes(a.status));
                setApplications(active.length > 0 ? active : res.data);
                if (!selectedAppId && active.length > 0) {
                    setSelectedAppId(active[0].id);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const selectedApp = applications.find(a => a.id === selectedAppId) || applications[0];

    const getOverall = () => {
        return Math.round(
            (scores.tech * 0.25) +
            (scores.impact * 0.20) +
            (scores.cost * 0.15) +
            (scores.scale * 0.15) +
            (scores.sec * 0.10) +
            (scores.ready * 0.10) +
            (scores.sust * 0.05)
        );
    };

    const submitEvaluation = async () => {
        if (!selectedApp) {
            return showToast('No candidate application selected for evaluation', 'warning');
        }
        if (!conflict) {
            return showToast('Please complete statutory declaration of no conflict of interest', 'warning');
        }
        setSubmitting(true);
        try {
            await api.post('/evaluations', {
                applicationId: selectedApp.id,
                overallScore: getOverall(),
                scores: scores,
                comments: comments || 'Technical feasibility and operational architecture meet public testbed criteria.',
                conflict: conflict
            });
            showToast('Evaluation submitted successfully. Candidate moved to Selected status.', 'success');
            navigate('/applications');
        } catch (e: any) {
            console.error(e);
            showToast(e.response?.data?.error || 'Error submitting evaluation', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="p-12 text-center text-on-surface-variant flex items-center justify-center gap-2">
                <Loader2 className="animate-spin text-primary" size={20} /> Loading Evaluation Portal...
            </div>
        );
    }

    if (!selectedApp) {
        return (
            <div className="p-12 text-center text-on-surface-variant font-medium">
                No active applications found for evaluation.
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/30 pb-4">
                <div>
                    <h1 className="text-2xl font-display font-bold text-on-surface flex items-center gap-2">
                        <CheckSquare className="text-primary" /> Expert Evaluation Center
                    </h1>
                    <p className="text-on-surface-variant font-medium text-xs mt-0.5">
                        Structured multi-criteria nodal scoring and technical vetting prior to pilot sandbox provisioning.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <label htmlFor="eval-candidate-select" className="text-xs font-bold text-on-surface-variant whitespace-nowrap">Candidate:</label>
                    <select
                        id="eval-candidate-select"
                        name="selectedAppId"
                        value={selectedAppId}
                        onChange={(e) => setSelectedAppId(e.target.value)}
                        className="bg-surface-container border border-outline-variant/50 px-3 py-1.5 rounded-lg text-xs font-bold text-on-surface focus:outline-none max-w-xs"
                    >
                        {applications.map(a => (
                            <option key={a.id} value={a.id}>
                                {a.startup?.name} — {a.challenge?.title?.slice(0, 20)}... ({a.status})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Target Info Banner */}
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-0.5">Evaluating Startup</div>
                    <h3 className="font-display font-bold text-primary text-xl">{selectedApp.startup?.name}</h3>
                    <p className="text-xs text-on-surface-variant font-medium mt-1">{selectedApp.solutionSummary}</p>
                </div>

                <div className="hidden md:block w-px h-10 bg-outline-variant/30"></div>

                <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-0.5">Challenge</div>
                    <h4 className="font-bold text-xs text-on-surface">{selectedApp.challenge?.title}</h4>
                    <span className="text-[10px] text-on-surface-variant">{selectedApp.challenge?.department?.name}</span>
                </div>

                <div className="hidden md:block w-px h-10 bg-outline-variant/30"></div>

                <div className="text-right shrink-0">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-0.5">Status</div>
                    <span className="inline-block bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded text-xs font-bold uppercase">
                        {selectedApp.status}
                    </span>
                </div>
            </div>

            {/* Scoring Matrix & Action Panel */}
            <div className="flex flex-col md:flex-row gap-6">
                {/* Left: Sliders */}
                <div className="flex-1 space-y-4 bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm">
                    <h3 className="font-display font-bold text-sm text-on-surface border-b border-outline-variant/30 pb-3 flex items-center gap-2">
                        <CheckSquare className="text-primary" size={16} /> Structured Scoring Matrix
                    </h3>

                    {[
                        { key: 'tech', label: 'Technical Feasibility', weight: '25%' },
                        { key: 'impact', label: 'Expected Impact', weight: '20%' },
                        { key: 'cost', label: 'Cost Efficiency', weight: '15%' },
                        { key: 'scale', label: 'Scalability', weight: '15%' },
                        { key: 'sec', label: 'Security & Compliance', weight: '10%' },
                        { key: 'ready', label: 'Startup Readiness', weight: '10%' },
                        { key: 'sust', label: 'Sustainability', weight: '5%' }
                    ].map((metric) => (
                        <div key={metric.key} className="space-y-2 p-3 bg-surface-container rounded-lg border border-outline-variant/20 hover:border-outline-variant/40 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <label htmlFor={`metric-score-${metric.key}`} className="text-xs font-bold text-on-surface">{metric.label}</label>
                                    <span className="text-[10px] font-bold bg-surface-container-lowest px-1.5 py-0.5 rounded text-on-surface-variant border border-outline-variant/30">{metric.weight}</span>
                                </div>
                                <span className="font-mono font-bold text-xs text-primary">{scores[metric.key as keyof typeof scores]}/100</span>
                            </div>
                            <input
                                id={`metric-score-${metric.key}`}
                                name={`score_${metric.key}`}
                                type="range"
                                min="0" max="100"
                                value={scores[metric.key as keyof typeof scores]}
                                onChange={(e) => setScores({ ...scores, [metric.key]: parseInt(e.target.value) })}
                                className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                        </div>
                    ))}
                </div>

                {/* Right: Calculated Score & Justification */}
                <div className="w-full md:w-80 shrink-0 space-y-5">
                    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm text-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Weighted Aggregated Score</span>
                        <div className="text-6xl font-display font-light font-mono text-primary my-2">
                            {getOverall()}
                        </div>
                        <span className="inline-block text-[10px] font-bold bg-tertiary-fixed/30 text-on-tertiary-fixed-variant px-2.5 py-0.5 rounded">
                            {getOverall() >= 75 ? 'RECOMMENDED FOR PILOT' : 'NEEDS REVISION'}
                        </span>
                    </div>

                    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-5 shadow-sm space-y-4">
                        <div className="space-y-1.5">
                            <label htmlFor="qualitative-justification" className="text-xs font-bold text-on-surface uppercase">Qualitative Justification</label>
                            <textarea
                                id="qualitative-justification"
                                name="qualitativeJustification"
                                value={comments}
                                onChange={e => setComments(e.target.value)}
                                rows={3}
                                placeholder="State technical strengths, potential architectural risks, and pilot sandbox requirements..."
                                className="w-full bg-surface-container border border-outline-variant/50 rounded-lg p-2.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                            />
                        </div>

                        <div className="pt-2 border-t border-outline-variant/30">
                            <label htmlFor="conflict-checkbox" className="flex items-start gap-2 text-xs font-medium text-on-surface-variant cursor-pointer">
                                <input
                                    id="conflict-checkbox"
                                    name="conflictDeclaration"
                                    type="checkbox"
                                    checked={conflict}
                                    onChange={e => setConflict(e.target.checked)}
                                    className="mt-0.5 border-outline bg-surface rounded text-primary focus:ring-primary accent-primary"
                                />
                                <span>I declare zero conflict of interest evaluating this candidate.</span>
                            </label>
                        </div>

                        <button
                            onClick={submitEvaluation}
                            disabled={submitting || !conflict}
                            className="w-full flex items-center justify-center gap-2 font-bold text-on-primary bg-primary shadow-sm hover:bg-primary-container disabled:opacity-50 py-2.5 px-4 rounded-lg transition-all text-xs active:scale-[0.98]"
                        >
                            {submitting ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />} Submit Formal Evaluation
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
