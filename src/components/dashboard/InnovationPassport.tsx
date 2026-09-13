import { CheckCircle, ShieldCheck, MapPin, Building, Calendar, FileCheck2, Hexagon, BarChart3, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../../lib/api';

export default function InnovationPassport() {
    const [pilot, setPilot] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/pilots')
            .then(res => {
                const completed = res.data.find((p: any) => p.status === 'Completed');
                setPilot(completed || res.data[0]);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="p-12 flex justify-center text-on-surface-variant">
                <Loader2 className="animate-spin mr-2" /> Generating Immutable Passport...
            </div>
        );
    }

    if (!pilot) {
        return <div className="p-12 text-center text-on-surface-variant">No pilot passport available.</div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">

            {/* Passport Header */}
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex gap-5">
                    <div className="w-16 h-16 rounded-lg bg-primary-fixed-dim/20 flex items-center justify-center border border-primary-fixed-dim/50 shadow-level-2 mt-1">
                        <Hexagon size={32} className="text-secondary" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-display font-bold text-on-surface">{pilot.startup?.name || 'Innovation Partner'}</h1>
                            {pilot.status === 'Completed' && (
                                <span className="flex items-center gap-1 bg-tertiary-fixed-dim text-on-tertiary-fixed font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full">
                                    <CheckCircle size={12} /> Verified Vendor
                                </span>
                            )}
                        </div>
                        <p className="text-lg font-medium text-on-surface-variant mb-4">{pilot.challenge?.title || 'GovProof Pilot'}</p>

                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-on-surface-variant">
                            <div className="flex items-center gap-1.5"><Building size={16} /> {pilot.challenge?.department?.name || 'Department'}</div>
                            <div className="flex items-center gap-1.5"><MapPin size={16} /> {pilot.location || 'Zone 4'}</div>
                            <div className="flex items-center gap-1.5"><Calendar size={16} /> Pilot Ref: P-{pilot.id?.substring(0, 8)}</div>
                        </div>
                    </div>
                </div>

                <div className="bg-surface-container rounded-lg px-4 py-3 border border-outline-variant/30 min-w-[220px]">
                    <p className="text-xs uppercase tracking-wide font-bold text-on-surface-variant mb-2">Audit Hash (SHA-256)</p>
                    <div className="font-mono text-xs text-on-surface bg-surface-container-lowest p-2 rounded border border-outline-variant/20 overflow-hidden text-ellipsis mb-2">
                        {pilot.id ? pilot.id.replace(/-/g, '').substring(0, 16) : 'a3b9...f4c2'}...
                    </div>
                    <button className="text-xs font-semibold text-secondary hover:text-secondary-container transition-colors flex items-center gap-1">
                        <FileCheck2 size={14} /> View On-Chain Ledger
                    </button>
                </div>
            </div>

            {/* Analytics Matrix */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-display font-bold text-lg text-on-surface">Pilot Performance vs Baseline Tenders</h3>
                            <select className="bg-surface-container border border-outline-variant/50 text-sm font-medium py-1.5 px-3 rounded-md text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-secondary/50">
                                <option>Weekly Fleet Fuel Consumption</option>
                                <option>Route Optimization (%)</option>
                                <option>SLA Breaches</option>
                            </select>
                        </div>

                        <div className="h-64 bg-surface-container/50 border border-outline-variant/20 rounded-lg flex items-center justify-center flex-col gap-2">
                            <BarChart3 className="text-outline/50" size={32} />
                            <p className="text-sm font-medium text-on-surface-variant">Telemetry Chart Visualization Render Target</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm">
                        <div className="bg-surface-container-low px-5 py-4 border-b border-outline-variant/30">
                            <h3 className="font-display font-bold text-on-surface flex items-center gap-2">
                                <ShieldCheck className="text-tertiary" size={18} /> Independent Evidence Audit
                            </h3>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Lead Auditor</p>
                                <p className="font-medium text-on-surface">Dr. S. Kulkarni (NEERI)</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Statutory Link</p>
                                <a href="#" className="font-medium text-secondary hover:underline">Solid Waste Mgmt Rules (2016)</a>
                            </div>
                            <div className="pt-2">
                                <button className="w-full bg-surface text-on-surface border border-outline-variant font-semibold py-2 rounded-md text-sm hover:bg-surface-container transition-colors shadow-level-2">
                                    Download Compliance Matrix
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-primary text-on-primary rounded-xl p-5 shadow-level-3 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <ShieldCheck size={120} />
                        </div>
                        <h3 className="font-display font-bold text-lg mb-1">Procurement Blueprint</h3>
                        <p className="text-sm text-primary-fixed-dim/90 mb-4 leading-relaxed max-w-[200px]">
                            Generate final government tender requirements based on pilot telemetry.
                        </p>
                        <button className="bg-on-primary text-primary font-bold py-2 px-4 rounded-md text-sm hover:bg-primary-fixed transition-colors shadow-sm">
                            Draft Tender Now
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
}
