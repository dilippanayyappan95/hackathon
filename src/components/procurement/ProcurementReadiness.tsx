import { FileText, ArrowRight, Download, Target, ShieldCheck, Cpu, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../lib/api";

export default function ProcurementReadiness() {
    const [pilots, setPilots] = useState<any[]>([]);
    const [selectedPilotId, setSelectedPilotId] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [draftingTender, setDraftingTender] = useState(false);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            api.get('/procurement'),
            api.get('/pilots')
        ]).then(([, pilotsRes]) => {
            setPilots(pilotsRes.data || []);
            if (pilotsRes.data && pilotsRes.data.length > 0) {
                setSelectedPilotId(pilotsRes.data[0].id);
            }
        }).catch(console.error)
        .finally(() => setLoading(false));
    }, []);

    const selectedPilot = pilots.find(p => p.id === selectedPilotId) || pilots[0];

    const handleGenerateTender = () => {
        setDraftingTender(true);
        setTimeout(() => {
            setDraftingTender(false);
            const tenderContent = `GOVERNMENT OF MAHARASHTRA\nSTATE INNOVATION PROCUREMENT TENDER SPECIFICATION\n\nTitle: State-Wide Scaling of ${selectedPilot?.challenge?.title || 'Innovation'}\nQualified Vendor: ${selectedPilot?.startup?.name || 'Startup Partner'}\nStatus: Scale Approved (DPIIT Fast-Track Exemption)\nTarget KPI: ${selectedPilot?.target || '45 min'}\nMeasured Pilot Telemetry: ${selectedPilot?.actual || '48 min'}\nContract Term: 5 Years\n\nSovereign Hash: ${selectedPilot?.id || 'SHA256-VERIFIED'}`;
            const blob = new Blob([tenderContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Tender_Draft_${selectedPilot?.startup?.name?.replace(/\s+/g, '_') || 'Vendor'}_2026.txt`;
            a.click();
        }, 800);
    };

    if (loading) {
        return (
            <div className="p-12 text-center text-on-surface-variant flex items-center justify-center gap-2">
                <Loader2 className="animate-spin text-primary" size={20} /> Loading Procurement Readiness Records...
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
                            Fast-Track Procurement Sandbox
                        </span>
                    </div>
                    <h1 className="text-2xl font-display font-bold text-on-surface flex items-center gap-2">
                        <FileText className="text-primary" /> Procurement & Tender Blueprint
                    </h1>
                    <p className="text-on-surface-variant font-medium text-xs mt-0.5">
                        Direct conversion of validated Proof Passport telemetry into standardized government tender specifications.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-on-surface-variant whitespace-nowrap">Scale Candidate:</span>
                    <select
                        value={selectedPilotId}
                        onChange={(e) => setSelectedPilotId(e.target.value)}
                        className="bg-surface-container border border-outline-variant/50 px-3 py-1.5 rounded-lg text-xs font-bold text-on-surface focus:outline-none max-w-xs"
                    >
                        {pilots.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.startup?.name} ({p.status})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Procurement Blueprint Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Col: Pre-Filled Tender Draft */}
                <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm flex flex-col">
                    <div className="p-6 border-b border-outline-variant/30 bg-surface-container-low/40 flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-primary text-base">Pre-Filled Tender Specification</h3>
                            <p className="text-xs font-medium text-on-surface-variant mt-0.5">Auto-drafted directly from validated pilot telemetry.</p>
                        </div>
                        <span className="text-[10px] font-mono font-bold bg-primary/10 text-primary px-2 py-1 rounded uppercase">
                            DPIIT Fast-Track
                        </span>
                    </div>

                    <div className="p-6 bg-surface-container/20 flex-1 space-y-4">
                        <div className="p-4 bg-surface-container-lowest border border-outline-variant/40 rounded-xl space-y-2">
                            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                                Statutory Scope of Work (Telemetry-Verified)
                            </span>
                            <p className="font-medium text-xs text-on-surface leading-relaxed">
                                Deployment and operational scaling of {selectedPilot?.startup?.name}'s automated algorithmic platform across municipal institutions. Mandatory SLA threshold: Maintain measured KPI performance improvement ({selectedPilot?.target || '45 min'} or better) with 99.9% telemetry uptime.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="p-3.5 bg-surface-container-lowest border border-outline-variant/30 rounded-lg">
                                <span className="text-[10px] font-bold text-on-surface-variant uppercase">Contract Life</span>
                                <div className="font-mono font-bold text-sm text-on-surface mt-0.5">5 Years (Standard)</div>
                            </div>
                            <div className="p-3.5 bg-surface-container-lowest border border-outline-variant/30 rounded-lg">
                                <span className="text-[10px] font-bold text-on-surface-variant uppercase">Tender Classification</span>
                                <div className="font-bold text-sm text-secondary mt-0.5">Direct Innovation Fast-Track</div>
                            </div>
                        </div>

                        <div className="p-3 bg-surface-container rounded-lg border border-outline-variant/20 flex items-center justify-between text-xs">
                            <span className="font-bold text-on-surface flex items-center gap-1.5">
                                <ShieldCheck size={14} className="text-tertiary" /> Fast-Track Exemption
                            </span>
                            <span className="text-[10px] font-bold bg-tertiary-fixed/30 text-on-tertiary-fixed-variant px-2 py-0.5 rounded">
                                L1 Bidding Bypassed
                            </span>
                        </div>
                    </div>

                    <div className="p-5 border-t border-outline-variant/30 bg-surface-container-lowest">
                        <button
                            onClick={handleGenerateTender}
                            disabled={draftingTender}
                            className="w-full flex items-center justify-center gap-2 font-bold bg-primary text-on-primary py-2.5 px-4 rounded-lg shadow-sm hover:bg-primary-container disabled:opacity-50 transition-all text-xs"
                        >
                            {draftingTender ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                            Download Statutory Tender Dossier (PDF/TXT)
                        </button>
                    </div>
                </div>

                {/* Right Col: Vendor Qualifications & Sovereign Certifications */}
                <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm flex flex-col">
                    <div className="p-6 border-b border-outline-variant/30 bg-surface-container-low/40">
                        <h3 className="font-bold text-base text-on-surface">Qualified Enterprise Vendor Details</h3>
                        <p className="text-xs font-medium text-on-surface-variant mt-0.5">Validated entity ready for immediate procurement onboarding.</p>
                    </div>

                    <div className="p-6 space-y-4 flex-1">
                        <div className="p-5 bg-surface-container-low rounded-xl border border-outline-variant/30 text-center space-y-1">
                            <span className="text-[10px] font-bold text-on-surface-variant uppercase">Selected Vendor</span>
                            <h2 className="text-2xl font-display font-bold text-primary">{selectedPilot?.startup?.name}</h2>
                            <span className="inline-block text-xs font-mono bg-surface-container text-on-surface font-bold px-2.5 py-0.5 rounded border border-outline-variant/30">
                                DPIIT: {selectedPilot?.startup?.dpiitNumber || 'DIPP89231'}
                            </span>
                        </div>

                        <div className="space-y-2 text-xs">
                            <span className="font-bold text-on-surface-variant uppercase text-[10px] block">
                                Sovereign Compliance Package
                            </span>

                            <div className="flex items-center justify-between p-3 border border-outline-variant/20 rounded-lg bg-surface-container">
                                <span className="font-medium text-on-surface flex items-center gap-2">
                                    <Target size={14} className="text-primary" /> Innovation Proof Passport
                                </span>
                                <span className="text-[10px] font-bold bg-tertiary-fixed/30 text-on-tertiary-fixed-variant px-2 py-0.5 rounded">
                                    ATTACHED & VERIFIED
                                </span>
                            </div>

                            <div className="flex items-center justify-between p-3 border border-outline-variant/20 rounded-lg bg-surface-container">
                                <span className="font-medium text-on-surface flex items-center gap-2">
                                    <ShieldCheck size={14} className="text-secondary" /> ISO 27001 & Sovereign Cloud Audit
                                </span>
                                <span className="text-[10px] font-bold bg-tertiary-fixed/30 text-on-tertiary-fixed-variant px-2 py-0.5 rounded">
                                    CERTIFIED
                                </span>
                            </div>

                            <div className="flex items-center justify-between p-3 border border-outline-variant/20 rounded-lg bg-surface-container">
                                <span className="font-medium text-on-surface flex items-center gap-2">
                                    <Cpu size={14} className="text-on-surface-variant" /> Telemetry API Integration Interface
                                </span>
                                <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded">
                                    ACTIVE
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 border-t border-outline-variant/30 bg-surface-container-lowest">
                        <Link
                            to="/passports"
                            className="w-full flex items-center justify-center gap-2 font-bold bg-secondary text-on-secondary py-2.5 px-4 rounded-lg shadow-sm hover:bg-secondary-container transition-colors text-xs"
                        >
                            Inspect Linked Proof Passport <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
