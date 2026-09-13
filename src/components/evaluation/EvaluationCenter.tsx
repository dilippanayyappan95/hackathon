import { CheckSquare, Save, AlertTriangle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";

export default function EvaluationCenter() {
    const navigate = useNavigate();
    const [application, setApplication] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [conflict, setConflict] = useState(false);
    const [comments, setComments] = useState('');

    useEffect(() => {
        api.get('/applications')
            .then(res => {
                const pendings = res.data.filter((a: any) => a.status === 'Applied' || a.status === 'Selected');
                setApplication(pendings[0] || null);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const [scores, setScores] = useState({
        tech: 80,
        impact: 75,
        cost: 85,
        scale: 70,
        sec: 90,
        ready: 80,
        sust: 75
    });

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
        if (!application || !conflict) return alert('Please declare no conflict of interest.');
        setSubmitting(true);
        try {
            await api.post('/evaluations', {
                applicationId: application.id,
                overallScore: getOverall(),
                scores: scores,
                comments: comments,
                conflict: conflict
            });
            alert('Evaluation submitted successfully.');
            navigate('/pilots');
        } catch (e) {
            console.error(e);
            alert('Error submitting evaluation');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin inline mr-2" />Loading evaluations...</div>;
    if (!application) return <div className="p-8 text-center text-on-surface-variant font-bold">No pending applications for evaluation found.</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300 pb-20">

            <div>
                <h1 className="text-2xl font-display font-bold text-on-surface">Expert Evaluation Center</h1>
                <p className="text-on-surface-variant font-medium text-sm mt-1">Official nodal screening prior to pilot provisioning.</p>
            </div>

            {/* Target Info */}
            <div className="bg-surface-container border border-outline-variant/30 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Evaluating Startup</div>
                    <h3 className="font-display font-bold text-primary text-xl">{application.startup?.name}</h3>
                </div>
                <div className="hidden md:block w-px h-10 bg-outline-variant/40"></div>
                <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Against Challenge</div>
                    <h3 className="font-bold text-sm text-on-surface">{application.challenge?.title}</h3>
                </div>
                <div className="hidden md:block w-px h-10 bg-outline-variant/40"></div>
                <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Status</div>
                    <span className="inline-block bg-secondary-fixed text-on-secondary-fixed border border-secondary-fixed-dim px-2 py-0.5 rounded text-xs font-bold uppercase">Pending</span>
                </div>
            </div>

            {/* Interface */}
            <div className="flex flex-col md:flex-row gap-6">

                {/* Sliders */}
                <div className="flex-1 space-y-6 bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm">
                    <h3 className="font-bold border-b border-outline-variant/30 pb-3 flex items-center gap-2">
                        <CheckSquare className="text-primary" size={18} /> Evaluation Matrix
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
                        <div key={metric.key} className="space-y-3 p-3 bg-surface-container rounded-lg border border-outline-variant/20 hover:border-outline-variant/50 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-bold text-on-surface">{metric.label}</label>
                                    <span className="text-[10px] font-bold bg-surface px-1.5 py-0.5 rounded text-on-surface-variant border border-outline-variant/40">{metric.weight} Weight</span>
                                </div>
                                <span className="font-mono font-bold text-primary">{scores[metric.key as keyof typeof scores]}/100</span>
                            </div>
                            <input
                                type="range"
                                min="0" max="100"
                                value={scores[metric.key as keyof typeof scores]}
                                onChange={(e) => setScores({ ...scores, [metric.key]: parseInt(e.target.value) })}
                                className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                        </div>
                    ))}
                </div>

                {/* Action Panel */}
                <div className="w-full md:w-80 shrink-0 space-y-6">
                    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm text-center">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-4">Calculated Score</h4>
                        <div className="text-7xl font-display font-light font-mono text-primary mb-2">
                            {getOverall()}
                        </div>
                        <p className="text-xs font-medium text-on-surface-variant">Weighted appropriately as per municipal procurement rules.</p>
                    </div>

                    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Qualitative Justification</label>
                            <textarea value={comments} onChange={e => setComments(e.target.value)} rows={4} placeholder="Summarize strengths & weaknesses..." className="w-full bg-surface-container border border-outline-variant/50 rounded-md p-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary resize-none"></textarea>
                        </div>

                        <div className="pt-2 border-t border-outline-variant/30">
                            <label className="flex items-start gap-2 text-xs font-medium text-on-surface-variant cursor-pointer">
                                <input type="checkbox" checked={conflict} onChange={e => setConflict(e.target.checked)} required className="mt-0.5 border-outline bg-surface rounded text-primary focus:ring-primary accent-primary" />
                                I declare no conflict of interest evaluating this participant.
                            </label>
                        </div>

                        <div className="pt-4 flex flex-col gap-3">
                            <button className="flex items-center justify-center gap-2 font-bold text-on-surface-variant border border-outline-variant/50 hover:bg-surface-container px-4 py-2 rounded-md transition-colors text-sm">
                                <AlertTriangle size={16} /> Flag Risk
                            </button>
                            <button
                                onClick={submitEvaluation} disabled={submitting}
                                className="w-full flex items-center justify-center gap-2 font-bold text-on-primary bg-primary shadow-level-2 hover:bg-primary-container px-4 py-2 rounded-md transition-all text-sm active:scale-[0.98]"
                            >
                                {submitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Submit Formal Evaluation
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
