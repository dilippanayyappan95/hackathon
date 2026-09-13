import { Building2, ShieldCheck, Download, ExternalLink, Activity, Target, Lock, FileCheck2, Hexagon } from "lucide-react";
import { Link } from "react-router-dom";
import { STARTUPS } from "../../data/mockData";

export default function StartupProfile() {
    const startup = STARTUPS[0];

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300 pb-16">

            {/* Hero Header */}
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm relative">
                <div className="h-32 bg-primary/10 w-full relative">
                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 10% 20%, rgb(0, 32, 70) 0%, transparent 20%)', backgroundSize: '100px 100px' }}></div>
                </div>
                <div className="px-8 pb-8">
                    <div className="flex flex-col md:flex-row gap-6 relative">

                        <div className="w-24 h-24 bg-surface-container-lowest border border-outline-variant border-4 rounded-xl flex items-center justify-center text-4xl shadow-md -mt-12 z-10">
                            🌱
                        </div>

                        <div className="flex-1 mt-2 md:-mt-2 flex flex-col md:flex-row justify-between md:items-start gap-4">
                            <div>
                                <h1 className="text-3xl font-display font-bold text-on-surface flex items-center gap-2">
                                    {startup.name}
                                    <ShieldCheck className="text-secondary" size={24} />
                                </h1>
                                <p className="text-on-surface-variant font-medium mt-1">{startup.domain} • Mumbai, Maharashtra</p>
                                <div className="flex gap-2 mt-3">
                                    <span className="bg-surface-container text-xs font-bold uppercase px-2 py-1 rounded text-on-surface-variant tracking-wider border border-outline-variant/50">DPIIT Recognized</span>
                                    <span className="bg-surface-container text-xs font-bold uppercase px-2 py-1 rounded text-on-surface-variant tracking-wider border border-outline-variant/50">ISO 27001</span>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button className="flex items-center gap-2 font-bold text-primary bg-primary/10 border border-primary/20 px-4 py-2 text-sm rounded-md hover:bg-primary/20 transition-colors">
                                    <Download size={16} /> Pitch Deck
                                </button>
                                <Link to="/pilots/arena" className="flex items-center gap-2 font-bold text-on-primary bg-primary px-5 py-2 text-sm rounded-md shadow-level-2 hover:bg-primary-container transition-transform active:scale-[0.98]">
                                    Assign to Pilot
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                <div className="lg:col-span-2 space-y-6">

                    {/* Overview tabs */}
                    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm">
                        <div className="flex gap-6 px-6 pt-4 border-b border-outline-variant/30">
                            {['Overview', 'Capabilities', 'Previous Pilots', 'Documents'].map((tab, i) => (
                                <button key={i} className={`font-semibold text-sm pb-3 -mb-px border-b-2 transition-colors ${i === 0 ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}>
                                    {tab}
                                </button>
                            ))}
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <h3 className="font-bold mb-2">Company Overview</h3>
                                <p className="text-on-surface-variant font-medium text-sm leading-relaxed">
                                    EcoGrid Innovations builds IoT-driven telemetry hardware and routing algorithms to optimize municipal waste collection. Using ultrasonic bin sensors and dynamic vehicle dispatch logic, we reduce fuel consumption by up to 27% and limit solid waste overflow in tier-1 cities. Our systems are fully API-compatible with state dashboards.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-surface-container border border-outline-variant/30 rounded-lg">
                                    <div className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Founded</div>
                                    <div className="font-medium text-sm">2021</div>
                                </div>
                                <div className="p-4 bg-surface-container border border-outline-variant/30 rounded-lg">
                                    <div className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Company Stage</div>
                                    <div className="font-medium text-sm">Series A (Revenue Generating)</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Previous Deployments */}
                    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm">
                        <h3 className="font-bold flex items-center gap-2 mb-4 border-b border-outline-variant/30 pb-3">
                            <Building2 className="text-primary" size={18} /> Validated Government Deployments
                        </h3>
                        <div className="space-y-4">
                            <div className="border border-outline-variant/50 p-4 rounded-lg flex flex-col sm:flex-row gap-4 items-start">
                                <div className="w-12 h-12 bg-secondary/10 text-secondary border border-secondary/20 rounded-lg flex flex-col items-center justify-center shrink-0">
                                    <div className="text-[10px] font-bold uppercase">2025</div>
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm">Navi Mumbai Smart Collection Pilot</h4>
                                    <p className="text-xs text-on-surface-variant font-medium mt-1">NMMC Waste Dept • 6 Months</p>
                                    <p className="text-sm font-medium mt-2">Achieved 18% fuel cost reduction. Data validated by independent municipal audit.</p>
                                </div>
                                <div className="ml-auto mt-2 sm:mt-0 pt-2 sm:pt-0 w-full sm:w-auto">
                                    <Link to="/passport" className="text-xs font-bold text-secondary uppercase flex items-center gap-1 hover:underline">
                                        View Proof Passport <ExternalLink size={12} />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="space-y-6">

                    {/* Scorecard */}
                    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm space-y-5 relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 opacity-5 text-primary">
                            <Hexagon size={120} />
                        </div>

                        <div>
                            <h2 className="text-lg font-display font-bold text-on-surface">Procurement Readiness</h2>
                            <p className="text-xs font-medium text-on-surface-variant">Aggregated GovProof Validation Index</p>
                        </div>

                        <div className="flex items-center justify-between py-2 border-b border-outline-variant/30">
                            <span className="text-sm font-bold text-on-surface-variant flex items-center gap-2"><FileCheck2 size={16} /> Eligibility</span>
                            <span className="font-mono font-bold text-sm">100%</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-outline-variant/30">
                            <span className="text-sm font-bold text-on-surface-variant flex items-center gap-2"><Target size={16} /> Technical Readiness</span>
                            <span className="font-mono font-bold text-sm">92%</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-outline-variant/30">
                            <span className="text-sm font-bold text-on-surface-variant flex items-center gap-2"><Lock size={16} /> Security Architecture</span>
                            <span className="font-mono font-bold text-sm">85%</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-outline-variant/30">
                            <span className="text-sm font-bold text-on-surface-variant flex items-center gap-2"><Activity size={16} /> Pilot Readiness</span>
                            <span className="font-mono font-bold text-sm text-secondary">95%</span>
                        </div>

                        <div className="pt-2">
                            <div className="bg-primary-container p-4 rounded-lg flex items-center justify-between border border-primary-fixed-dim">
                                <span className="font-bold text-on-primary-container uppercase text-xs tracking-wider">Overall Index</span>
                                <span className="text-2xl font-mono font-bold text-primary">91/100</span>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
