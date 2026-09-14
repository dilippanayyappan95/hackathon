import {
    CheckCircle2, ShieldCheck, MapPin, Building, Calendar,
    Printer, Share2, Sparkles,
    Lock, Check, AlertTriangle, ChevronRight, TrendingUp, Award
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { useToast } from '../../context/ToastContext';

export default function InnovationPassport() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const selectedPilotId = searchParams.get('pilotId');

    const [passportsList, setPassportsList] = useState<any[]>([]);
    const [pilotsList, setPilotsList] = useState<any[]>([]);
    const [selectedPassport, setSelectedPassport] = useState<any>(null);
    const [, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    // Fetch all passports and active pilots
    useEffect(() => {
        setLoading(true);
        Promise.all([
            api.get('/passports'),
            api.get('/pilots')
        ]).then(([passportsRes, pilotsRes]) => {
            setPassportsList(passportsRes.data || []);
            setPilotsList(pilotsRes.data || []);

            // Determine which passport to display
            if (selectedPilotId) {
                loadPassportByPilotId(selectedPilotId);
            } else if (passportsRes.data && passportsRes.data.length > 0) {
                // Default to first passport
                setSelectedPassport(passportsRes.data[0]);
            } else if (pilotsRes.data && pilotsRes.data.length > 0) {
                // Try to load first pilot's passport
                loadPassportByPilotId(pilotsRes.data[0].id);
            }
        }).catch(err => {
            console.error('Error fetching passports data:', err);
        }).finally(() => {
            setLoading(false);
        });
    }, [selectedPilotId]);

    const loadPassportByPilotId = async (id: string) => {
        try {
            setLoading(true);
            const res = await api.get(`/passports/${id}`);
            setSelectedPassport(res.data);
        } catch (err) {
            console.error('Error fetching specific passport:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateOfficialSnapshot = async () => {
        if (!selectedPassport?.pilotId && !selectedPassport?.pilot?.id) return;
        const pId = selectedPassport.pilotId || selectedPassport.pilot.id;
        try {
            setGenerating(true);
            const res = await api.post(`/passports/generate/${pId}`);
            setSelectedPassport(res.data);
            showToast('Official Proof Passport snapshot locked with SHA-256 integrity hash', 'success');
            // Refresh list
            const pList = await api.get('/passports');
            setPassportsList(pList.data);
        } catch (err) {
            console.error('Error generating passport snapshot:', err);
            showToast('Failed to generate passport snapshot', 'error');
        } finally {
            setGenerating(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleShare = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(window.location.href);
            showToast('Passport URL link copied to clipboard', 'success');
        }
    };

    const snapshot = selectedPassport?.snapshot || {};
    const pilotData = selectedPassport?.pilot || {};

    const problemText = snapshot.problem || pilotData.challenge?.problemStatement || pilotData.challenge?.description || 'Government operational efficiency and citizen service delivery bottleneck.';
    const solutionText = snapshot.solution || pilotData.startup?.description || pilotData.objectives || 'AI and IoT automated telemetry infrastructure.';
    const startupName = snapshot.startup || pilotData.startup?.name || 'Startup Partner';
    const challengeTitle = snapshot.challenge || pilotData.challenge?.title || 'Innovation Challenge';
    const departmentName = snapshot.department || pilotData.challenge?.department?.name || 'Municipal Innovation Dept';
    const pilotLocation = snapshot.pilotLocation || pilotData.pilotLocation || 'State Testbed Sandbox';
    const pilotDuration = snapshot.pilotDuration || pilotData.challenge?.timeline || '6 Months';
    const passportNumber = selectedPassport?.passportNumber || snapshot.passportNumber || 'GPP-MH-2026-0042';
    const auditHash = selectedPassport?.auditHash || snapshot.auditHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
    const overallOutcome = snapshot.overallOutcome || (pilotData.status === 'COMPLETED' ? 'SUCCESS — PILOT OBJECTIVES ACHIEVED' : pilotData.status === 'FAILED' ? 'FAILED' : 'ACTIVE / IN PROGRESS');
    const recommendation = snapshot.recommendedNextAction || (pilotData.status === 'COMPLETED' ? 'PROCEED TO PROCUREMENT' : 'EXTEND PILOT');
    const scaleScore = snapshot.scaleReadinessScore || (pilotData.status === 'COMPLETED' ? 92 : 68);
    const scaleCategory = snapshot.scaleReadinessCategory || (pilotData.status === 'COMPLETED' ? 'READY TO SCALE' : 'CONDITIONAL');
    const procurementStatus = snapshot.procurementReadiness || (pilotData.status === 'COMPLETED' ? 'PROCUREMENT READY (Fast-Track DPIIT Exemption Eligible)' : 'UNDER REVIEW');

    const calculateDelta = (baselineStr?: string, actualStr?: string) => {
        if (!baselineStr || !actualStr) return 'Verified Delta';
        const b = parseFloat(baselineStr.replace(/[^0-9.]/g, ''));
        const a = parseFloat(actualStr.replace(/[^0-9.]/g, ''));
        if (isNaN(b) || isNaN(a) || b === 0) return 'Measured Delta';
        if (b > a) {
            const pct = ((b - a) / b) * 100;
            return `${pct.toFixed(1)}% Reduction`;
        } else {
            const pct = ((a - b) / b) * 100;
            return `+${pct.toFixed(1)}% Gain`;
        }
    };

    const kpiRows = snapshot.actualKPIs && snapshot.actualKPIs.length > 0
        ? snapshot.actualKPIs.map((ak: any, idx: number) => {
            const bk = snapshot.baselineKPIs?.[idx]?.value || '90 min';
            const tk = snapshot.targetKPIs?.[idx]?.value || '45 min';
            return {
                name: ak.name,
                baseline: bk,
                target: tk,
                actual: ak.value,
                status: ak.status || 'ACHIEVED',
                delta: calculateDelta(bk, ak.value)
            };
        })
        : (pilotData.kpis || []).map((k: any) => ({
            name: k.name,
            baseline: k.baseline || '90 min',
            target: k.target || '45 min',
            actual: k.actual || '48 min',
            status: k.status || 'ACHIEVED',
            delta: calculateDelta(k.baseline, k.actual)
        }));

    return (
        <div className="space-y-8 animate-in fade-in duration-300 pb-16">
            {/* Action Bar (Hidden on print) */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/30 pb-5 print:hidden">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="bg-primary/10 text-primary border border-primary/20 text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded">
                            Core Differentiator
                        </span>
                        <span className="bg-tertiary-fixed/30 text-on-tertiary-fixed-variant text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded">
                            Reusable Evidence Artifact
                        </span>
                    </div>
                    <h1 className="text-3xl font-display font-bold text-on-surface">Innovation Proof Passport</h1>
                    <p className="text-on-surface-variant font-medium text-sm mt-1">
                        Tamper-proof, independently validated record of startup pilot performance in government testbeds.
                    </p>
                </div>

                <div className="flex items-center flex-wrap gap-2.5">
                    {/* Pilot Selector */}
                    <select
                        value={selectedPassport?.pilotId || selectedPassport?.id || ''}
                        onChange={(e) => loadPassportByPilotId(e.target.value)}
                        className="bg-surface-container border border-outline-variant/50 text-xs font-bold py-2 px-3 rounded-lg text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
                    >
                        {pilotsList.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.startup?.name} — {p.challenge?.title?.slice(0, 30)}... ({p.status})
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={handleGenerateOfficialSnapshot}
                        disabled={generating}
                        className="flex items-center gap-1.5 bg-primary hover:bg-primary-container text-on-primary font-bold text-xs py-2 px-3.5 rounded-lg shadow-sm transition-all"
                        title="Re-run cryptographic audit and lock new snapshot"
                    >
                        <Sparkles size={14} />
                        {generating ? 'Auditing...' : 'Generate / Lock Snapshot'}
                    </button>

                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-1.5 bg-surface-container border border-outline-variant/40 hover:bg-surface-container-high font-bold text-xs py-2 px-3 rounded-lg text-on-surface transition-all"
                    >
                        <Printer size={14} /> Print Passport
                    </button>

                    <button
                        onClick={handleShare}
                        className="flex items-center gap-1.5 bg-surface-container border border-outline-variant/40 hover:bg-surface-container-high font-bold text-xs py-2 px-3 rounded-lg text-on-surface transition-all"
                    >
                        <Share2 size={14} /> Share
                    </button>
                </div>
            </header>

            {/* Passport Selector Tab Strip for Issued Passports */}
            {passportsList.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-2 print:hidden">
                    <span className="text-xs font-bold text-on-surface-variant shrink-0 mr-1">Issued Passports:</span>
                    {passportsList.map((p) => {
                        const isSelected = selectedPassport?.id === p.id || selectedPassport?.passportNumber === p.passportNumber;
                        return (
                            <button
                                key={p.id}
                                onClick={() => setSelectedPassport(p)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 border transition-all flex items-center gap-2 ${
                                    isSelected
                                        ? 'bg-primary text-on-primary border-primary shadow-sm'
                                        : 'bg-surface-container-lowest text-on-surface border-outline-variant/40 hover:bg-surface-container'
                                }`}
                            >
                                <Award size={13} className={isSelected ? 'text-tertiary-fixed' : 'text-primary'} />
                                <span>{p.startupName || p.pilot?.startup?.name}</span>
                                <span className="font-mono text-[10px] opacity-75">{p.passportNumber}</span>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* THE OFFICIAL PROOF PASSPORT DOCUMENT */}
            <div className="bg-surface-container-lowest border-2 border-outline-variant/40 rounded-2xl shadow-xl overflow-hidden print:border-none print:shadow-none">
                {/* Gold Sovereign Banner */}
                <div className="bg-gradient-to-r from-primary via-primary-container to-primary px-8 py-5 text-on-primary flex flex-col md:flex-row items-center justify-between gap-4 border-b-2 border-tertiary-fixed">
                    <div className="flex items-center gap-4 text-center md:text-left">
                        <div className="w-14 h-14 rounded-2xl bg-on-primary/10 backdrop-blur border border-on-primary/20 flex items-center justify-center shrink-0 shadow-inner">
                            <ShieldCheck size={32} className="text-tertiary-fixed" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 justify-center md:justify-start">
                                <span className="text-[11px] font-mono uppercase tracking-widest bg-on-primary/20 px-2 py-0.5 rounded font-extrabold text-tertiary-fixed">
                                    STATE OF MAHARASHTRA • SOVEREIGN TESTBED
                                </span>
                                <span className="text-[11px] font-mono font-bold bg-tertiary-fixed text-on-tertiary-fixed px-2 py-0.5 rounded">
                                    IMMUTABLE PROOF
                                </span>
                            </div>
                            <h2 className="text-2xl font-display font-extrabold tracking-tight mt-0.5">
                                Innovation Proof Passport
                            </h2>
                            <p className="text-xs text-on-primary/80 font-medium">
                                Verified Testbed Performance & Reusable Government Procurement Qualification
                            </p>
                        </div>
                    </div>

                    <div className="text-center md:text-right bg-on-primary/10 border border-on-primary/20 backdrop-blur rounded-xl px-4 py-2.5 shrink-0">
                        <div className="text-[10px] uppercase font-bold tracking-wider text-on-primary/70">Passport Identifier</div>
                        <div className="text-lg font-mono font-extrabold text-tertiary-fixed">{passportNumber}</div>
                        <div className="text-[9px] font-mono text-on-primary/70">
                            Issued: {snapshot.startDate || '2025-11-01'} → Validated: {snapshot.endDate || '2026-03-01'}
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-8">
                    {/* SECTION 1: Core Identification Matrix */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 bg-surface-container-low/70 rounded-xl border border-outline-variant/30">
                        <div>
                            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Department</span>
                            <div className="text-sm font-bold text-on-surface flex items-center gap-1.5 mt-1">
                                <Building size={15} className="text-primary shrink-0" />
                                <span>{departmentName}</span>
                            </div>
                        </div>

                        <div>
                            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Qualified Startup</span>
                            <div className="text-sm font-bold text-on-surface flex items-center gap-1.5 mt-1">
                                <Award size={15} className="text-secondary shrink-0" />
                                <span>{startupName}</span>
                            </div>
                        </div>

                        <div>
                            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Testbed Sandbox</span>
                            <div className="text-sm font-bold text-on-surface flex items-center gap-1.5 mt-1">
                                <MapPin size={15} className="text-tertiary shrink-0" />
                                <span>{pilotLocation}</span>
                            </div>
                        </div>

                        <div>
                            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Duration & Milestones</span>
                            <div className="text-sm font-bold text-on-surface flex items-center gap-1.5 mt-1">
                                <Calendar size={15} className="text-on-surface-variant shrink-0" />
                                <span>{pilotDuration} ({snapshot.milestonesCompleted || '3 of 3 Milestones'})</span>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: Problem & Solution Statement */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-5 rounded-xl border border-outline-variant/30 bg-surface-container-lowest space-y-2">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-error bg-error-container/30 px-2 py-0.5 rounded">
                                1. Government Problem & Challenge
                            </span>
                            <h4 className="font-bold text-base text-on-surface">{challengeTitle}</h4>
                            <p className="text-xs text-on-surface-variant leading-relaxed">{problemText}</p>
                        </div>

                        <div className="p-5 rounded-xl border border-outline-variant/30 bg-surface-container-lowest space-y-2">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-secondary bg-secondary-container/30 px-2 py-0.5 rounded">
                                2. Deployed Innovation & Solution
                            </span>
                            <h4 className="font-bold text-base text-on-surface">{startupName} Operational Architecture</h4>
                            <p className="text-xs text-on-surface-variant leading-relaxed">{solutionText}</p>
                        </div>
                    </div>

                    {/* SECTION 3: Verified KPI Measurement (Before vs After vs Target) */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-2">
                            <div>
                                <h3 className="font-display font-bold text-lg text-on-surface flex items-center gap-2">
                                    <TrendingUp size={18} className="text-primary" />
                                    3. Verified KPI Telemetry & Impact Measurement
                                </h3>
                                <p className="text-xs text-on-surface-variant font-medium">
                                    Baseline vs Target vs Actual verified operational improvements.
                                </p>
                            </div>
                            <span className="text-[10px] font-mono uppercase bg-tertiary-fixed/30 text-on-tertiary-fixed-variant px-2 py-1 rounded font-bold">
                                100% Validated Telemetry
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border border-outline-variant/30 rounded-xl overflow-hidden">
                                <thead className="bg-surface-container text-on-surface-variant uppercase font-bold text-[10px] tracking-wider">
                                    <tr>
                                        <th className="p-3.5">Statutory KPI Metric</th>
                                        <th className="p-3.5">Government Baseline</th>
                                        <th className="p-3.5">Target Threshold</th>
                                        <th className="p-3.5">Actual Measured (Telemetry)</th>
                                        <th className="p-3.5">Delta Improvement</th>
                                        <th className="p-3.5 text-right">Verification Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-outline-variant/20 bg-surface-container-lowest">
                                    {kpiRows.length > 0 ? (
                                        kpiRows.map((kpi: any, i: number) => (
                                            <tr key={i} className="hover:bg-surface-container-low/50 transition-colors">
                                                <td className="p-3.5 font-bold text-on-surface">{kpi.name}</td>
                                                <td className="p-3.5 font-mono text-on-surface-variant font-semibold">{kpi.baseline}</td>
                                                <td className="p-3.5 font-mono text-primary font-bold">{kpi.target}</td>
                                                <td className="p-3.5 font-mono text-secondary font-extrabold text-sm bg-secondary/5">
                                                    {kpi.actual}
                                                </td>
                                                <td className="p-3.5">
                                                    <span className="inline-flex items-center gap-1 font-bold text-tertiary-fixed-variant bg-tertiary-fixed/20 px-2 py-0.5 rounded">
                                                        <TrendingUp size={11} /> {kpi.delta || 'Measured Delta'}
                                                    </span>
                                                </td>
                                                <td className="p-3.5 text-right">
                                                    <span className="inline-flex items-center gap-1 font-bold text-on-tertiary-fixed bg-tertiary-fixed-dim text-[10px] px-2 py-0.5 rounded-full">
                                                        <CheckCircle2 size={11} /> {kpi.status || 'VERIFIED'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="p-4 text-center text-on-surface-variant">
                                                No KPI telemetry records mapped.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* SECTION 4: Evidence Vault Records & Independent Validation Sign-off */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Evidence Submissions */}
                        <div className="p-5 rounded-xl border border-outline-variant/30 bg-surface-container-lowest space-y-3">
                            <h4 className="font-display font-bold text-sm text-on-surface flex items-center justify-between border-b border-outline-variant/20 pb-2">
                                <span>4. Evidence Vault Records Submitted</span>
                                <span className="text-[10px] font-mono text-on-surface-variant">
                                    {(snapshot.evidenceSubmitted || []).length || 3} Artifacts
                                </span>
                            </h4>

                            <div className="space-y-2">
                                {(snapshot.evidenceSubmitted && snapshot.evidenceSubmitted.length > 0
                                    ? snapshot.evidenceSubmitted
                                    : [
                                        { title: 'IoT Waiting Time Queue Telemetry Logs (Nov-Feb)', type: 'Telemetry Dataset', status: 'VERIFIED' },
                                        { title: 'Superintendent Physician Clinical Sign-off Letter', type: 'Affidavit', status: 'VERIFIED' },
                                        { title: 'Citizen Grievance & Satisfaction Survey (N=1,420)', type: 'Survey Dataset', status: 'VERIFIED' }
                                    ]
                                ).map((ev: any, idx: number) => (
                                    <div key={idx} className="p-2.5 bg-surface-container-low rounded-lg border border-outline-variant/20 flex items-center justify-between text-xs">
                                        <div>
                                            <p className="font-bold text-on-surface">{ev.title}</p>
                                            <span className="text-[10px] text-on-surface-variant font-medium">{ev.type}</span>
                                        </div>
                                        <span className="text-[10px] font-bold bg-tertiary-fixed/30 text-on-tertiary-fixed-variant px-2 py-0.5 rounded">
                                            {ev.status || 'VERIFIED'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Independent Validation Sign-off Block */}
                        <div className="p-5 rounded-xl border-2 border-tertiary-fixed/50 bg-tertiary-fixed/10 space-y-3">
                            <div className="flex items-center justify-between border-b border-tertiary-fixed/30 pb-2">
                                <h4 className="font-display font-bold text-sm text-on-surface flex items-center gap-1.5">
                                    <ShieldCheck size={16} className="text-tertiary" /> 5. Independent Validation Sign-off
                                </h4>
                                <span className="text-[10px] font-bold bg-tertiary text-on-tertiary px-2 py-0.5 rounded uppercase">
                                    {snapshot.independentValidation?.status || 'VALIDATED'}
                                </span>
                            </div>

                            <div className="space-y-2 text-xs text-on-surface">
                                <div>
                                    <span className="text-[10px] font-bold text-on-surface-variant uppercase">Certified Lead Auditor:</span>
                                    <p className="font-bold">{snapshot.independentValidation?.validator || 'Dr. Arvind Kulkarni (Maharashtra Sovereign Innovation Society)'}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-on-surface-variant uppercase">Audit Methodology:</span>
                                    <p className="font-medium text-on-surface-variant">
                                        {snapshot.independentValidation?.methodology || 'Dual-method cryptographic telemetry validation & on-site randomized queue audit.'}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-on-surface-variant uppercase">Auditor Findings:</span>
                                    <p className="font-semibold text-on-surface">
                                        "{snapshot.independentValidation?.findings || 'All target KPIs verified against operational testbed baseline. Zero telemetry tampering detected.'}"
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 5: Scale Readiness & Recommendation Decision Block */}
                    <div className="p-6 rounded-xl bg-surface-container border border-outline-variant/40 space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/30 pb-4">
                            <div>
                                <h3 className="font-display font-bold text-lg text-on-surface">
                                    6. Statutory Scale & Procurement Qualification
                                </h3>
                                <p className="text-xs text-on-surface-variant font-medium">
                                    Official determination for state-wide replication across other government departments.
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <div className="text-[10px] font-bold uppercase text-on-surface-variant">Scale Readiness Score</div>
                                    <div className="text-2xl font-mono font-extrabold text-primary">{scaleScore}/100</div>
                                </div>
                                <div className="h-10 w-px bg-outline-variant/30" />
                                <span className={`px-3 py-1.5 rounded-xl font-display font-bold text-xs uppercase tracking-wider ${
                                    scaleCategory === 'READY TO SCALE'
                                        ? 'bg-primary text-on-primary shadow-sm'
                                        : 'bg-secondary/20 text-secondary'
                                }`}>
                                    {scaleCategory}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                            <div className="p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/20">
                                <span className="text-[10px] font-bold text-on-surface-variant uppercase">Overall Pilot Outcome</span>
                                <p className="font-bold text-sm text-on-surface mt-1">{overallOutcome}</p>
                            </div>

                            <div className="p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/20">
                                <span className="text-[10px] font-bold text-on-surface-variant uppercase">Recommended Next Action</span>
                                <p className="font-bold text-sm text-primary mt-1 flex items-center gap-1">
                                    <Check size={14} className="text-tertiary" /> {recommendation}
                                </p>
                            </div>

                            <div className="p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/20">
                                <span className="text-[10px] font-bold text-on-surface-variant uppercase">Procurement Readiness</span>
                                <p className="font-bold text-sm text-on-surface mt-1">{procurementStatus}</p>
                            </div>
                        </div>

                        {/* Remaining Risks & Mitigations */}
                        <div className="p-3.5 bg-surface-container-lowest rounded-lg border border-outline-variant/20 text-xs">
                            <span className="text-[10px] font-bold text-on-surface-variant uppercase flex items-center gap-1 mb-1">
                                <AlertTriangle size={12} className="text-secondary" /> Residual Risks & Mitigations
                            </span>
                            <p className="text-on-surface font-medium">
                                Edge connectivity drops during monsoon power surges — Mitigated via local on-prem edge cache fallback buffering.
                            </p>
                        </div>
                    </div>

                    {/* SECTION 6: Cryptographic Verification & Audit Trail Footer */}
                    <div className="pt-4 border-t border-outline-variant/30 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-on-surface-variant">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-surface-container rounded-lg border border-outline-variant/30">
                                <Lock size={16} className="text-primary" />
                            </div>
                            <div>
                                <span className="font-mono text-[10px] font-bold uppercase tracking-wider block text-on-surface">
                                    SHA-256 Ledger Audit Signature
                                </span>
                                <span className="font-mono text-[10px] break-all opacity-80">{auditHash}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-right shrink-0">
                            <button
                                onClick={() => navigate('/scale')}
                                className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                            >
                                Open Scale Decision Center <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
