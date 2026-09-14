import { ShieldCheck, ExternalLink, CheckCircle2, AlertTriangle, XCircle, Loader2, Check, Info } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../lib/api";
import { useToast } from "../../context/ToastContext";

export default function ValidationCenter() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [searchParams] = useSearchParams();
    const [pilots, setPilots] = useState<any[]>([]);
    const [selectedPilotId, setSelectedPilotId] = useState<string>(searchParams.get('pilotId') || '');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [methodology, setMethodology] = useState('Dual-method cryptographic telemetry validation & on-site randomized queue audit');
    const [findings, setFindings] = useState('Measured KPI performance verified against baseline: Outpatient waiting times reduced from 90 min to 48 min (46.7% reduction). Zero telemetry tampering detected.');
    const [confidence, setConfidence] = useState('High');

    useEffect(() => {
        setLoading(true);
        api.get('/pilots')
            .then(res => {
                setPilots(res.data);
                if (!selectedPilotId && res.data.length > 0) {
                    setSelectedPilotId(res.data[0].id);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const selectedPilot = pilots.find(p => p.id === selectedPilotId) || pilots[0];

    const handleValidate = async (status: string) => {
        if (!selectedPilot) return;
        setSubmitting(true);
        try {
            await api.post('/validation', {
                pilotId: selectedPilot.id,
                decision: status,
                methodology,
                findings,
                confidence
            });
            showToast(`Validation recorded as ${status}. Innovation Proof Passport updated.`, 'success');
            navigate(`/passports?pilotId=${selectedPilot.id}`);
        } catch (e: any) {
            console.error(e);
            showToast(e.response?.data?.error || 'Error recording validation determination', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="p-12 text-center text-on-surface-variant flex items-center justify-center gap-2">
                <Loader2 className="animate-spin text-primary" size={20} /> Loading Validation Center...
            </div>
        );
    }

    if (!selectedPilot) {
        return (
            <div className="p-12 text-center text-on-surface-variant font-medium">
                No active pilots available for independent audit.
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-300 pb-16">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/30 pb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="bg-primary/10 text-primary border border-primary/20 text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                            Third-Party Independent Audit
                        </span>
                    </div>
                    <h1 className="text-2xl font-display font-bold text-on-surface flex items-center gap-2">
                        <ShieldCheck className="text-primary" /> Independent Validation Center
                    </h1>
                    <p className="text-on-surface-variant font-medium text-xs mt-0.5">
                        Statutory audit and verification of submitted pilot telemetry and KPI claims.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-on-surface-variant whitespace-nowrap">Audit Pilot:</span>
                    <select
                        value={selectedPilotId}
                        onChange={(e) => setSelectedPilotId(e.target.value)}
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

            {/* Simulation Transparency Banner */}
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 text-xs text-on-surface-variant">
                <div className="flex items-center gap-2">
                    <Info size={15} className="text-secondary shrink-0" />
                    <span><strong>Prototype Demonstration:</strong> Telemetry values reflect simulated municipal testbed data to demonstrate the validation and Proof Passport generation workflow.</span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-surface-container px-2 py-0.5 rounded text-on-surface uppercase shrink-0">Demo Telemetry</span>
            </div>

            {/* Validation Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Col: Evidence & Telemetry Summary */}
                <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm space-y-5">
                    <div className="border-b border-outline-variant/30 pb-4">
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Target Pilot Project</span>
                        <h3 className="text-lg font-display font-bold text-on-surface mt-1">{selectedPilot.startup?.name}</h3>
                        <p className="text-xs text-primary font-medium">{selectedPilot.challenge?.title}</p>
                    </div>

                    {/* KPI Telemetry Comparison */}
                    <div className="space-y-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block">
                            Measured Telemetry vs Threshold
                        </span>
                        <div className="grid grid-cols-2 gap-2 text-center text-xs">
                            <div className="p-3 bg-surface-container rounded-lg">
                                <span className="text-[10px] text-on-surface-variant font-bold uppercase">Baseline</span>
                                <div className="font-mono font-bold text-sm text-on-surface mt-0.5">{selectedPilot.baseline || '90 min'}</div>
                            </div>
                            <div className="p-3 bg-surface-container rounded-lg">
                                <span className="text-[10px] text-secondary font-bold uppercase">Target</span>
                                <div className="font-mono font-bold text-sm text-secondary mt-0.5">{selectedPilot.target || '45 min'}</div>
                            </div>
                        </div>
                        <div className="p-3 bg-tertiary-fixed/20 border border-tertiary-fixed-dim rounded-lg text-center">
                            <span className="text-[10px] font-bold uppercase text-on-tertiary-fixed-variant">Measured Actual (Telemetry)</span>
                            <div className="font-mono font-extrabold text-xl text-on-tertiary-fixed-variant mt-0.5">
                                {selectedPilot.actual || '48 min'}
                            </div>
                        </div>
                    </div>

                    {/* Evidence Documents */}
                    <div className="pt-2 border-t border-outline-variant/30 space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                                Vault Artifacts ({(selectedPilot.evidence || []).length})
                            </span>
                            <Link to="/evidence" className="text-[11px] font-bold text-secondary hover:underline flex items-center gap-1">
                                <ExternalLink size={12} /> View Vault
                            </Link>
                        </div>
                        <div className="space-y-1.5">
                            {(selectedPilot.evidence && selectedPilot.evidence.length > 0 ? selectedPilot.evidence : [
                                { title: 'IoT Waiting Time Queue Telemetry Logs (Nov-Feb)', fileType: 'Telemetry Dataset', verifiedStatus: 'VERIFIED' },
                                { title: 'Superintendent Physician Clinical Sign-off Letter', fileType: 'Affidavit', verifiedStatus: 'VERIFIED' }
                            ]).map((ev: any, i: number) => (
                                <div key={i} className="p-2 bg-surface-container rounded-lg text-xs flex items-center justify-between">
                                    <span className="font-medium truncate max-w-[180px]">{ev.title || ev.fileUrl}</span>
                                    <span className="text-[9px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded">{ev.verifiedStatus || 'SUBMITTED'}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right 2 Cols: Independent Validation Findings Form */}
                <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 lg:p-8 shadow-sm space-y-6">
                    <div className="border-b border-outline-variant/30 pb-4">
                        <h3 className="font-display font-bold text-lg text-on-surface">Statutory Verification Form</h3>
                        <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                            Independent auditor sign-off on data integrity, statistical methodology, and operational outcome.
                        </p>
                    </div>

                    <div className="space-y-4 text-xs">
                        <div>
                            <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Audit Methodology</label>
                            <input
                                type="text"
                                value={methodology}
                                onChange={(e) => setMethodology(e.target.value)}
                                className="w-full bg-surface-container border border-outline-variant/50 rounded-lg p-2.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Auditor Findings & Observations</label>
                            <textarea
                                rows={4}
                                value={findings}
                                onChange={(e) => setFindings(e.target.value)}
                                className="w-full bg-surface-container border border-outline-variant/50 rounded-lg p-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Data Confidence Level</label>
                                <select
                                    value={confidence}
                                    onChange={(e) => setConfidence(e.target.value)}
                                    className="w-full bg-surface-container border border-outline-variant/50 rounded-lg p-2.5 text-xs font-semibold focus:outline-none"
                                >
                                    <option value="High">High (Cryptographic & Physical Audit Verified)</option>
                                    <option value="Medium">Medium (Statistical Sample Verified)</option>
                                    <option value="Low">Low (Requires Additional Telemetry)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Telemetry Integrity</label>
                                <div className="p-2.5 bg-surface-container rounded-lg text-xs font-bold text-primary flex items-center gap-1.5">
                                    <Check size={14} /> Tamper-Proof Cryptographic Hash Verified
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Statutory Determination Buttons */}
                    <div className="pt-4 border-t border-outline-variant/30 space-y-3">
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
                            Execute Formal Determination
                        </span>
                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                onClick={() => handleValidate('VALIDATED')}
                                disabled={submitting}
                                className="flex-1 min-w-[160px] flex items-center justify-center gap-1.5 bg-primary text-on-primary font-bold py-2.5 px-4 rounded-lg shadow-sm hover:bg-primary-container disabled:opacity-50 text-xs transition-all"
                            >
                                {submitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                                VALIDATED (Sign-off)
                            </button>

                            <button
                                onClick={() => handleValidate('PARTIALLY_VALIDATED')}
                                disabled={submitting}
                                className="flex-1 min-w-[160px] flex items-center justify-center gap-1.5 bg-secondary/20 hover:bg-secondary/30 text-secondary border border-secondary/40 font-bold py-2.5 px-4 rounded-lg text-xs transition-all"
                            >
                                <AlertTriangle size={14} /> PARTIALLY VALIDATED
                            </button>

                            <button
                                onClick={() => handleValidate('REJECTED')}
                                disabled={submitting}
                                className="flex-1 min-w-[160px] flex items-center justify-center gap-1.5 bg-error-container/40 hover:bg-error-container text-error font-bold py-2.5 px-4 rounded-lg text-xs transition-all"
                            >
                                <XCircle size={14} /> REJECTED
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
