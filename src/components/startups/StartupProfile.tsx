import { Building2, ShieldCheck, ExternalLink, Activity, Target, Lock, FileCheck2, Loader2 } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../lib/api";

export default function StartupProfile() {
    const [searchParams] = useSearchParams();
    const startupId = searchParams.get('id');
    const [startups, setStartups] = useState<any[]>([]);
    const [selectedStartup, setSelectedStartup] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        api.get('/startups')
            .then(res => {
                setStartups(res.data);
                if (startupId) {
                    const match = res.data.find((s: any) => s.id === startupId);
                    setSelectedStartup(match || res.data[0]);
                } else if (res.data.length > 0) {
                    setSelectedStartup(res.data[0]);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [startupId]);

    if (loading) {
        return (
            <div className="p-12 text-center text-on-surface-variant flex items-center justify-center gap-2">
                <Loader2 className="animate-spin text-primary" size={20} /> Loading Startup Enterprise Profile...
            </div>
        );
    }

    if (!selectedStartup) {
        return <div className="p-12 text-center text-on-surface-variant">No startup profile found.</div>;
    }

    const s = selectedStartup;

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300 pb-16">
            {/* Startup Selector Strip */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <span className="text-xs font-bold text-on-surface-variant shrink-0 mr-1">Select Profile:</span>
                {startups.map((st) => {
                    const isSelected = s.id === st.id;
                    return (
                        <button
                            key={st.id}
                            onClick={() => setSelectedStartup(st)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 border transition-all ${
                                isSelected
                                    ? 'bg-primary text-on-primary border-primary shadow-sm'
                                    : 'bg-surface-container-lowest text-on-surface border-outline-variant/40 hover:bg-surface-container'
                            }`}
                        >
                            {st.name}
                        </button>
                    );
                })}
            </div>

            {/* Hero Header */}
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm relative">
                <div className="h-28 bg-gradient-to-r from-primary/15 via-secondary/15 to-primary/10 w-full relative" />
                <div className="px-8 pb-8">
                    <div className="flex flex-col md:flex-row gap-6 relative">
                        <div className="w-20 h-20 bg-surface-container-lowest border-4 border-surface-container rounded-xl flex items-center justify-center text-3xl shadow-md -mt-10 z-10 shrink-0">
                            🏢
                        </div>

                        <div className="flex-1 mt-2 md:-mt-2 flex flex-col md:flex-row justify-between md:items-start gap-4">
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-display font-bold text-on-surface flex items-center gap-2">
                                    {s.name}
                                    <ShieldCheck className="text-secondary" size={22} />
                                </h1>
                                <p className="text-on-surface-variant font-medium text-xs mt-1">{s.domain} • Maharashtra Innovation Testbed</p>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    <span className="bg-surface-container text-[10px] font-bold uppercase px-2 py-0.5 rounded text-on-surface-variant tracking-wider border border-outline-variant/50">
                                        DPIIT: {s.dpiitNumber || 'DIPP89231'}
                                    </span>
                                    <span className="bg-tertiary-fixed/30 text-[10px] font-bold uppercase px-2 py-0.5 rounded text-on-tertiary-fixed-variant tracking-wider border border-tertiary-fixed-dim">
                                        ISO 27001 Certified
                                    </span>
                                    <span className="bg-primary/10 text-[10px] font-bold uppercase px-2 py-0.5 rounded text-primary tracking-wider">
                                        MeitY Sovereign Cloud
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Link
                                    to={`/discover?challengeId=`}
                                    className="flex items-center gap-1.5 font-bold text-on-primary bg-primary px-4 py-2 text-xs rounded-lg shadow-sm hover:bg-primary-container transition-all"
                                >
                                    Match with Challenges
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Overview */}
                    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm space-y-4">
                        <h3 className="font-bold text-base text-on-surface border-b border-outline-variant/30 pb-2">
                            Company Overview & Technological Solution
                        </h3>
                        <p className="text-on-surface-variant font-medium text-xs leading-relaxed">
                            {s.description || 'Enterprise grade solution provider deploying edge-integrated algorithmic architecture across state municipal environments with continuous measurement auditing.'}
                        </p>

                        <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                            <div className="p-3.5 bg-surface-container border border-outline-variant/30 rounded-lg">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block mb-0.5">Technology Stack</span>
                                <div className="font-semibold text-on-surface">{s.technology || 'AI / IoT Telemetry Infrastructure'}</div>
                            </div>
                            <div className="p-3.5 bg-surface-container border border-outline-variant/30 rounded-lg">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block mb-0.5">Operating Domain</span>
                                <div className="font-semibold text-on-surface">{s.domain}</div>
                            </div>
                        </div>
                    </div>

                    {/* Verified Deployments */}
                    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm space-y-4">
                        <h3 className="font-bold text-base text-on-surface flex items-center gap-2 border-b border-outline-variant/30 pb-2">
                            <Building2 className="text-primary" size={16} /> Validated Municipal Sandbox Deployments
                        </h3>
                        <div className="p-4 bg-surface-container rounded-xl border border-outline-variant/30 flex flex-col sm:flex-row gap-4 items-start justify-between">
                            <div className="space-y-1">
                                <h4 className="font-bold text-sm text-on-surface">State Innovation Testbed Sandbox</h4>
                                <p className="text-xs text-on-surface-variant font-medium">{s.domain} Department • 6 Months</p>
                                <p className="text-xs text-on-surface font-medium pt-1">
                                    Continuous telemetry verification recorded and independently audited with 0% data tampering.
                                </p>
                            </div>
                            <Link
                                to="/passports"
                                className="shrink-0 text-xs font-bold text-secondary flex items-center gap-1 hover:underline"
                            >
                                Proof Passport <ExternalLink size={12} />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Right: Scorecard */}
                <div className="space-y-6">
                    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm space-y-4">
                        <div>
                            <h3 className="text-base font-display font-bold text-on-surface">Sovereign Validation Index</h3>
                            <p className="text-xs font-medium text-on-surface-variant">GovProof Pre-Qualification Rating</p>
                        </div>

                        <div className="space-y-2 text-xs">
                            <div className="flex items-center justify-between py-1.5 border-b border-outline-variant/20">
                                <span className="font-bold text-on-surface-variant flex items-center gap-1.5"><FileCheck2 size={14} /> Statutory Eligibility</span>
                                <span className="font-mono font-bold text-primary">100%</span>
                            </div>
                            <div className="flex items-center justify-between py-1.5 border-b border-outline-variant/20">
                                <span className="font-bold text-on-surface-variant flex items-center gap-1.5"><Target size={14} /> Technical Feasibility</span>
                                <span className="font-mono font-bold text-primary">94%</span>
                            </div>
                            <div className="flex items-center justify-between py-1.5 border-b border-outline-variant/20">
                                <span className="font-bold text-on-surface-variant flex items-center gap-1.5"><Lock size={14} /> Data Sovereignty</span>
                                <span className="font-mono font-bold text-primary">92%</span>
                            </div>
                            <div className="flex items-center justify-between py-1.5">
                                <span className="font-bold text-on-surface-variant flex items-center gap-1.5"><Activity size={14} /> Pilot Readiness</span>
                                <span className="font-mono font-bold text-secondary">95%</span>
                            </div>
                        </div>

                        <div className="pt-2">
                            <div className="bg-primary/10 border border-primary/30 p-3.5 rounded-lg flex items-center justify-between">
                                <span className="font-bold text-primary uppercase text-[11px] tracking-wider">Overall Qualification</span>
                                <span className="text-2xl font-mono font-extrabold text-primary">93/100</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
