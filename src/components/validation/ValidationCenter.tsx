import { ShieldCheck, ExternalLink, CheckCircle2, AlertTriangle, XCircle, Search, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../lib/api";

export default function ValidationCenter() {
    const navigate = useNavigate();
    const [pilots, setPilots] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        api.get('/pilots')
            .then(res => setPilots(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleValidate = async (pilot: any, status: string) => {
        if (!pilot.evidence || pilot.evidence.length === 0) {
            alert('No evidence to validate on this pilot.');
            return;
        }
        setSubmitting(true);
        try {
            await api.patch(`/pilots/evidence/${pilot.evidence[0].id}/validate`, { status });
            alert(`Evidence ${status} successfully.`);
            navigate('/scale');
        } catch (e) {
            console.error(e);
            alert('Error updating verification status.');
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin inline mr-2" />Loading validations...</div>;
    const p = pilots[0]; // For demo focus on the first pilot
    if (!p) return <div className="p-8 text-center">No pilots awaiting validation.</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-300 pb-16">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/30 pb-4">
                <div>
                    <h1 className="text-2xl font-display font-bold text-on-surface flex items-center gap-2">
                        <ShieldCheck className="text-primary" /> Independent Validation Center
                    </h1>
                    <p className="text-on-surface-variant font-medium text-sm mt-1">Sovereign audit of submitted pilot telemetry and KPI claims.</p>
                </div>

                <div className="relative w-full max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size={16} />
                    <input type="text" placeholder="Search validations..." className="w-full bg-surface-container-lowest border border-outline-variant/50 pl-9 pr-3 py-2 rounded-md text-sm font-medium focus:ring-1 focus:ring-secondary/50 focus:outline-none transition-all" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Validation Queue */}
                <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm">
                    <h3 className="px-5 py-4 border-b border-outline-variant/30 font-bold bg-surface-container-low">Evidence Awaiting Audit</h3>
                    <div className="divide-y divide-outline-variant/20">
                        <div className="p-5 hover:bg-surface-container transition-colors cursor-pointer border-l-4 border-primary">
                            <div className="flex items-center justify-between mb-1">
                                <h4 className="font-bold text-sm">{p.startup}</h4>
                                <span className="text-[10px] bg-secondary-fixed/30 text-secondary border border-secondary-fixed-dim px-2 py-0.5 rounded font-bold uppercase tracking-wider">Pending</span>
                            </div>
                            <p className="text-xs text-on-surface-variant font-medium mb-3">{p.id} • KPI: {p.actual}</p>
                            <p className="text-xs font-bold text-on-surface">3 Documents Uploaded</p>
                        </div>

                        <div className="p-5 bg-surface-container-low opacity-50 cursor-not-allowed border-l-4 border-transparent">
                            <div className="flex items-center justify-between mb-1">
                                <h4 className="font-bold text-sm">MedFlow AI</h4>
                                <span className="text-[10px] bg-primary-fixed-dim/30 text-primary border border-primary/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Verified</span>
                            </div>
                            <p className="text-xs text-on-surface-variant font-medium">MH-HEALTH-2026-042</p>
                        </div>
                    </div>
                </div>

                {/* Validation Workspace */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4 mb-5">
                            <div>
                                <div className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Evaluating Claim against Target</div>
                                <h2 className="text-xl font-display font-bold flex items-center gap-2">{p.title} <Link to={`/pilots/evidence`} className="text-sm font-medium text-secondary hover:underline flex items-center gap-1"><ExternalLink size={14} /> View Evidence Vault</Link></h2>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <div className="p-4 bg-surface-container rounded-lg border border-outline-variant/30 text-center">
                                <div className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Baseline</div>
                                <div className="text-xl font-mono font-medium">{p.baseline || 'TBD'}</div>
                            </div>
                            <div className="p-4 bg-surface-container rounded-lg border border-outline-variant/30 text-center">
                                <div className="text-xs font-bold uppercase tracking-wider text-secondary mb-1">Target</div>
                                <div className="text-2xl font-mono font-bold text-secondary">{p.target || 'TBD'}</div>
                            </div>
                            <div className="p-4 bg-primary-fixed-dim/10 rounded-lg border border-primary-fixed-dim text-center">
                                <div className="text-xs font-bold uppercase tracking-wider text-primary mb-1">Claimed Actual</div>
                                <div className="text-3xl font-mono font-bold text-primary">{p.actual || 'TBD'}</div>
                            </div>
                        </div>

                        <h3 className="font-bold border-b border-outline-variant/30 pb-3 mb-4">Verification Audit</h3>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Data Source Integrity</label>
                                <select className="w-full bg-surface-container border border-outline-variant/50 rounded-md p-3 text-sm font-medium focus:outline-none">
                                    <option>Verified: API Integration (Municipal Servers)</option>
                                    <option>Self-Reported (Manual)</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Calculation Verification</label>
                                <select className="w-full bg-surface-container border border-outline-variant/50 rounded-md p-3 text-sm font-medium focus:outline-none">
                                    <option>Matched: Statistical Significance Confirmed</option>
                                    <option>Mismatch: Requires Rectification</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Auditor Comments</label>
                                <textarea rows={3} placeholder="Provide statutory audit justification..." className="w-full bg-surface-container border border-outline-variant/50 rounded-md p-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary resize-none"></textarea>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-outline-variant/30 flex flex-wrap items-center gap-3">
                            <button onClick={() => handleValidate(p, 'Verified')} disabled={submitting} className="flex-1 min-w-[200px] flex items-center justify-center gap-2 bg-primary text-on-primary font-bold py-3 px-4 rounded-md shadow-level-2 hover:bg-primary-container transition-transform active:scale-[0.98]">
                                {submitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />} Verify Claim
                            </button>
                            <button onClick={() => handleValidate(p, 'Partially Verified')} disabled={submitting} className="flex-1 min-w-[200px] flex items-center justify-center gap-2 bg-secondary text-on-secondary font-bold py-3 px-4 rounded-md shadow-level-2 hover:bg-secondary-container hover:text-on-secondary-container transition-transform active:scale-[0.98]">
                                <AlertTriangle size={18} /> Partially Verify
                            </button>
                            <button onClick={() => handleValidate(p, 'Rejected')} disabled={submitting} className="flex-1 min-w-[200px] flex items-center justify-center gap-2 bg-error text-on-error font-bold py-3 px-4 rounded-md shadow-level-2 hover:bg-error-container hover:text-on-error-container transition-transform active:scale-[0.98]">
                                <XCircle size={18} /> Reject Claim
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
