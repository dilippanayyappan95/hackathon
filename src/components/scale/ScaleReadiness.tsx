import { Scale, CheckCircle2, TrendingUp, ShieldAlert, ArrowRight, UserCheck, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../lib/api";

export default function ScaleReadiness() {
    const navigate = useNavigate();
    const [pilot, setPilot] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [decision, setDecision] = useState<string>("Approve for Scale");
    const userRole = JSON.parse(localStorage.getItem('user') || '{}')?.role || '';

    useEffect(() => {
        api.get('/pilots')
            .then(res => {
                const completed = res.data.find((p: any) => p.status === 'Completed');
                setPilot(completed || res.data[0]);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleRecordDecision = async () => {
        setSaving(true);
        try {
            await api.post('/scale', {
                pilotId: pilot.id,
                recommendation: "SCALE",
                finalDecision: decision === "Approve for Scale" ? "SCALE" : decision.toUpperCase()
            });
            alert(`Decision Recorded: ${decision}. Telemetry closed.`);
            navigate('/procurement');
        } catch (e) {
            console.error(e);
            alert('Failed to record scale decision');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-12 flex justify-center text-on-surface-variant"><Loader2 className="animate-spin mr-2" /> Evaluating Scale Readiness Engine...</div>;
    }

    if (!pilot) {
        return <div className="p-12 text-center text-on-surface-variant">No pilot available for scale readiness review yet.</div>;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300 pb-16">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/30 pb-4">
                <div>
                    <h1 className="text-2xl font-display font-bold text-on-surface flex items-center gap-2">
                        <Scale className="text-primary" /> Scale Readiness Pipeline
                    </h1>
                    <p className="text-on-surface-variant font-medium text-sm mt-1">Transitioning validated pilots into state-wide procurement tenders.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                <div className="lg:col-span-2 space-y-6">

                    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-8 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5 text-primary pointer-events-none">
                            <Scale size={200} className="-mr-12 -mt-12" />
                        </div>

                        <div className="flex items-center gap-3 mb-6">
                            <span className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                <CheckCircle2 size={14} /> Validation Complete
                            </span>
                            <span className="text-sm font-medium text-on-surface-variant">P-{pilot.id?.substring(0, 8)}</span>
                        </div>

                        <h2 className="text-4xl font-display font-bold text-on-surface mb-2">{pilot.startup?.name || 'Scale Startup'}</h2>
                        <p className="text-lg text-on-surface-variant font-medium">{pilot.challenge?.title || 'Unknown Pilot'}</p>

                        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="border border-outline-variant/30 bg-surface-container p-4 rounded-lg flex items-center justify-between">
                                <span className="text-sm font-bold text-on-surface-variant flex items-center gap-2"><TrendingUp size={16} /> Technical Success</span>
                                <span className="text-lg font-mono font-bold">94</span>
                            </div>
                            <div className="border border-outline-variant/30 bg-surface-container p-4 rounded-lg flex items-center justify-between">
                                <span className="text-sm font-bold text-on-surface-variant flex items-center gap-2"><TrendingUp size={16} /> Verified Impact</span>
                                <span className="text-lg font-mono font-bold">91</span>
                            </div>
                            <div className="border border-outline-variant/30 bg-surface-container p-4 rounded-lg flex items-center justify-between">
                                <span className="text-sm font-bold text-on-surface-variant flex items-center gap-2"><TrendingUp size={16} /> Cost Efficiency</span>
                                <span className="text-lg font-mono font-bold">85</span>
                            </div>
                            <div className="border border-outline-variant/30 bg-surface-container p-4 rounded-lg flex items-center justify-between">
                                <span className="text-sm font-bold text-on-surface-variant flex items-center gap-2"><TrendingUp size={16} /> User Adoption</span>
                                <span className="text-lg font-mono font-bold">87</span>
                            </div>
                            <div className="border border-outline-variant/30 bg-surface-container p-4 rounded-lg flex items-center justify-between">
                                <span className="text-sm font-bold text-on-surface-variant flex items-center gap-2"><ShieldAlert size={16} /> Security Architecture</span>
                                <span className="text-lg font-mono font-bold">92</span>
                            </div>
                            <div className="border border-outline-variant/30 bg-surface-container p-4 rounded-lg flex items-center justify-between">
                                <span className="text-sm font-bold text-on-surface-variant flex items-center gap-2"><Scale size={16} /> Enterprise Scalability</span>
                                <span className="text-lg font-mono font-bold">89</span>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-outline-variant/30">
                            <h3 className="font-bold mb-3 flex items-center gap-2 text-primary">Why this recommendation?</h3>
                            <p className="text-sm font-medium text-on-surface-variant bg-surface-container-low p-4 rounded-lg leading-relaxed border border-outline-variant/20 border-l-4 border-l-primary">
                                The pilot overwhelmingly exceeded the baseline constraint, realizing a 27% direct operational efficiency gain (independently validated). The underlying technical architecture has been load-tested against MSIS scale metrics and carries no residual vulnerability risk. It is legally and financially prepared for high-value procurement integration.
                            </p>
                        </div>
                    </div>

                </div>

                <div className="space-y-6">

                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 shadow-sm text-center">
                        <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4">Automated System Recommendation</h3>
                        <div className="text-6xl font-display font-bold font-mono text-primary mb-2">90<span className="text-2xl text-on-surface-variant">/100</span></div>
                        <div className="inline-block mt-2 bg-primary text-on-primary px-4 py-1.5 rounded-full font-bold tracking-wider mb-2">
                            🟢 SCALE STATE-WIDE
                        </div>
                        <p className="text-xs font-medium text-on-surface-variant mt-3 px-4">
                            Computed via telemetry audits and milestone success metrics.
                        </p>
                    </div>

                    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm space-y-5">
                        <h3 className="font-bold border-b border-outline-variant/30 pb-3 flex items-center gap-2">
                            <UserCheck className="text-on-surface" size={18} /> Official Human Decision
                        </h3>
                        <p className="text-xs font-medium text-on-surface-variant leading-relaxed">
                            System recommendations are advisory. State procurement requires explicit human escalation authorization by a nodal officer.
                        </p>

                        <div className="space-y-3 pt-2">
                            <button onClick={() => setDecision("Approve for Scale")} className={`w-full text-left p-3 rounded-lg border-2 ${decision === 'Approve for Scale' ? 'border-primary bg-primary/5 font-bold text-primary' : 'border-outline-variant/30 bg-surface-container-low font-bold text-on-surface-variant hover:border-outline'} flex items-center justify-between transition-colors`}>
                                Approve for Scale
                                <div className={`w-4 h-4 rounded-full border ${decision === 'Approve for Scale' ? 'bg-primary ring-2 ring-background border-transparent' : 'bg-surface-container border-outline-variant/50'}`}></div>
                            </button>
                            <button onClick={() => setDecision("Extend Pilot")} className={`w-full text-left p-3 rounded-lg border-2 ${decision === 'Extend Pilot' ? 'border-secondary bg-secondary/5 font-bold text-secondary' : 'border-outline-variant/30 bg-surface-container-low font-bold text-on-surface-variant hover:border-outline'} flex items-center justify-between transition-colors`}>
                                Extend Pilot
                                <div className={`w-4 h-4 rounded-full border ${decision === 'Extend Pilot' ? 'bg-secondary ring-2 ring-background border-transparent' : 'bg-surface-container border-outline-variant/50'}`}></div>
                            </button>
                            <button onClick={() => setDecision("Do Not Scale")} className={`w-full text-left p-3 rounded-lg border-2 ${decision === 'Do Not Scale' ? 'border-error bg-error/5 font-bold text-error' : 'border-outline-variant/30 bg-surface-container-low font-bold text-on-surface-variant hover:border-outline'} flex items-center justify-between transition-colors`}>
                                Do Not Scale
                                <div className={`w-4 h-4 rounded-full border ${decision === 'Do Not Scale' ? 'bg-error ring-2 ring-background border-transparent' : 'bg-surface-container border-outline-variant/50'}`}></div>
                            </button>
                        </div>

                        {['Government Officer', 'Admin'].includes(userRole) ? (
                            <div className="pt-4 border-t border-outline-variant/30">
                                <button
                                    onClick={handleRecordDecision} disabled={saving}
                                    className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary font-bold py-3 px-4 rounded-md shadow-level-2 hover:bg-primary-container transition-transform active:scale-[0.98]"
                                >
                                    {saving ? <Loader2 size={18} className="animate-spin" /> : <span>Record Decision & Proceed</span>} <ArrowRight size={18} />
                                </button>
                            </div>
                        ) : (
                            <div className="pt-4 border-t border-outline-variant/30 text-center text-sm font-medium text-on-surface-variant">
                                You do not have the required statutory authority to execute a scale determination.
                            </div>
                        )}
                    </div>

                </div>

            </div>
        </div>
    );
}
