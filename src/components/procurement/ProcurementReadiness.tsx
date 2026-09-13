import { FileText, ArrowRight, UploadCloud, Target, ShieldCheck, Cpu } from "lucide-react";
import { PILOTS } from "../../data/mockData";
import { Link } from "react-router-dom";

export default function ProcurementReadiness() {
    const p = PILOTS[0];

    return (
        <div className="space-y-6 animate-in fade-in duration-300 pb-16">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/30 pb-4">
                <div>
                    <h1 className="text-2xl font-display font-bold text-on-surface flex items-center gap-2">
                        <FileText className="text-primary" /> Procurement Generation
                    </h1>
                    <p className="text-on-surface-variant font-medium text-sm mt-1">Direct transition of Scale-Ready winner into GEM/Gov procurement tender.</p>
                </div>
                <button className="flex items-center gap-2 bg-surface-container border border-outline-variant/50 hover:bg-surface-container-high transition-colors font-bold py-2 px-4 rounded-md text-sm">
                    <UploadCloud size={18} /> Upload Annexure
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm flex flex-col">
                    <div className="p-6 border-b border-outline-variant/30">
                        <h3 className="font-bold mb-1 text-primary">Pre-Filled Tender Draft</h3>
                        <p className="text-sm font-medium text-on-surface-variant">Auto-generated via verified telemetric specs.</p>
                    </div>
                    <div className="p-6 bg-surface-container/30 flex-1 space-y-4">
                        <div className="p-4 bg-surface-container-lowest border border-outline-variant/50 rounded-lg">
                            <div className="text-xs font-bold text-on-surface-variant uppercase mb-2">Scope of Work (Auto-Drafted)</div>
                            <p className="font-medium text-sm leading-relaxed">
                                Implementation of smart municipal solid waste routing spanning 5,000 baseline points. Minimum requirement of 25% fuel efficiency via dynamic ultrasonic sensor orchestration.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-surface-container-lowest border border-outline-variant/50 rounded-lg">
                                <div className="text-xs font-bold text-on-surface-variant uppercase mb-1">Contract Lifecycle</div>
                                <span className="font-mono font-bold">5 Years</span>
                            </div>
                            <div className="p-4 bg-surface-container-lowest border border-outline-variant/50 rounded-lg">
                                <div className="text-xs font-bold text-on-surface-variant uppercase mb-1">Tender Category</div>
                                <span className="font-mono font-bold">Services / IoT</span>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 border-t border-outline-variant/30">
                        <button className="w-full flex items-center justify-center gap-2 font-bold bg-primary text-on-primary py-3 px-4 rounded-md shadow-level-2 hover:bg-primary-container transition-colors">
                            <FileText size={18} /> Generate PDF Tender Document
                        </button>
                    </div>
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm flex flex-col">
                    <div className="p-6 border-b border-outline-variant/30">
                        <h3 className="font-bold mb-1 flex items-center gap-2">Direct Vendor Import <span className="bg-primary/10 text-primary border border-primary/20 text-[10px] uppercase px-2 py-0.5 rounded ml-2">Fast Track</span></h3>
                        <p className="text-sm font-medium text-on-surface-variant">Scale-Ready startups bypass traditional L1 bidding rules via Innovation Policy.</p>
                    </div>

                    <div className="p-6 space-y-5 flex-1">
                        <div className="text-center bg-surface-container p-6 rounded-lg border border-outline-variant/50 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                <ShieldCheck size={80} />
                            </div>
                            <div className="font-medium text-sm text-on-surface-variant mb-2">Selected Vendor</div>
                            <h2 className="text-2xl font-display font-bold text-primary mb-1">{p.startup}</h2>
                            <div className="text-xs font-mono bg-surface text-on-surface-variant inline-block px-2 py-1 rounded border border-outline-variant/30">DPIIT: DIPP89231</div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-outline-variant/30">
                            <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Required Compliance Uploads</h4>
                            <div className="flex items-center justify-between p-3 border border-outline-variant/20 rounded-md bg-surface-container-low">
                                <span className="text-sm font-medium flex items-center gap-2"><Target size={14} className="text-secondary" /> Pilot Success Certificate</span>
                                <span className="text-[10px] bg-secondary-fixed/30 text-secondary px-2 rounded uppercase font-bold text-on-secondary-fixed border border-secondary-fixed-dim">Attached</span>
                            </div>
                            <div className="flex items-center justify-between p-3 border border-outline-variant/20 rounded-md bg-surface-container-low">
                                <span className="text-sm font-medium flex items-center gap-2"><Cpu size={14} className="text-primary opacity-60" /> Hardware Import Declaration</span>
                                <button className="text-[10px] bg-surface border border-outline-variant text-on-surface-variant px-2 py-0.5 rounded font-bold uppercase tracking-wider hover:bg-surface-container transition-colors">Missing - Upload</button>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-outline-variant/30">
                        <Link
                            to="/dashboard"
                            className="w-full flex items-center justify-center gap-2 font-bold bg-secondary text-secondary-fixed-dim py-3 px-4 rounded-md shadow-level-2 hover:bg-secondary-container hover:text-on-secondary-container transition-colors"
                        >
                            Submit to State Finance <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
}
