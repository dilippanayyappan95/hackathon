import { Activity, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../lib/api";

export default function PilotArena() {
    const [pilots, setPilots] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/pilots')
            .then(res => setPilots(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="space-y-6 animate-in fade-in duration-300">

            <div className="text-center py-8">
                <h1 className="text-3xl font-display font-bold text-on-surface flex items-center justify-center gap-3">
                    <Activity className="text-secondary" size={32} /> Pilot Arena Comparison
                </h1>
                <p className="text-on-surface-variant font-medium text-sm mt-3">Side-by-side performance benchmarking for competing deployments.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">

                {loading ? (
                    <div className="col-span-1 lg:col-span-2 p-12 text-center text-on-surface flex justify-center items-center gap-3">
                        <Loader2 className="animate-spin text-primary" /> Loading telemetry data from active pilots...
                    </div>
                ) : pilots.length >= 2 ? (
                    <>
                        {/* Competitor A */}
                        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow relative">
                            <div className="p-6 border-b border-outline-variant/30 flex items-center justify-between bg-primary/5">
                                <div>
                                    <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider bg-surface-container px-2 py-1 rounded-md mb-2 inline-block shadow-sm">
                                        Solution A
                                    </span>
                                    <h2 className="text-xl font-display font-bold text-on-surface flex items-center gap-2">{pilots[0].startup?.name || 'Local Startup'}</h2>
                                    <p className="text-sm font-medium text-on-surface-variant mt-1">{pilots[0].challenge?.title || 'Unknown Pilot'}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-mono font-bold text-primary">{pilots[0].status === 'Completed' ? '92%' : 'Active'}</div>
                                    <div className="text-[10px] font-bold text-on-surface-variant mt-1 uppercase">Overall Score</div>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                <div>
                                    <div className="text-xs font-bold text-on-surface-variant uppercase mb-3">Key Performance Indicator: Target vs Actual</div>
                                    <div className="flex items-end justify-between border-b-2 border-outline-variant/20 pb-2">
                                        <span className="font-medium text-sm text-on-surface-variant">{pilots[0].target || 'TBD'}</span>
                                        <span className="text-2xl font-mono font-bold text-primary">{pilots[0].actual || 'TBD'}</span>
                                    </div>
                                    <div className="w-full bg-surface-container h-2 mt-2 rounded-full overflow-hidden">
                                        <div className="bg-primary h-full rounded-full" style={{ width: '90%' }}></div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4">
                                    <div className="flex justify-between items-center bg-surface-container/50 px-4 py-3 rounded-lg border border-outline-variant/20">
                                        <span className="text-sm font-medium text-on-surface-variant">Cost Efficiency</span>
                                        <span className="font-mono font-bold">94%</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-surface-container/50 px-4 py-3 rounded-lg border border-outline-variant/20">
                                        <span className="text-sm font-medium text-on-surface-variant">User Adoption Rate</span>
                                        <span className="font-mono font-bold">87%</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-surface-container/50 px-4 py-3 rounded-lg border border-outline-variant/20">
                                        <span className="text-sm font-medium text-on-surface-variant">System Reliability</span>
                                        <span className="font-mono font-bold">99.9%</span>
                                    </div>
                                </div>

                                <div className="pt-6 mt-6 border-t border-outline-variant/30 text-center">
                                    <div className="text-xs font-bold text-on-surface-variant uppercase mb-3">System Recommendation</div>
                                    <div className="bg-primary-fixed-dim/20 border border-primary-fixed px-4 py-3 rounded-md text-primary font-bold tracking-wider">
                                        🟢 SCALE READY WINNER
                                    </div>
                                    <Link to="/passport" className="mt-4 inline-block text-sm font-bold text-on-surface-variant underline hover:text-primary transition-colors">
                                        Generate Protocol Passport
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Competitor B */}
                        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm relative opacity-90 backdrop-blur-sm grayscale-[0.2]">
                            <div className="p-6 border-b border-outline-variant/30 flex items-center justify-between">
                                <div>
                                    <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider bg-surface-container px-2 py-1 rounded-md mb-2 inline-block">
                                        Solution B
                                    </span>
                                    <h2 className="text-xl font-display font-bold text-on-surface flex items-center gap-2">{pilots[1].startup?.name || 'Local Startup'}</h2>
                                    <p className="text-sm font-medium text-on-surface-variant mt-1">{pilots[1].challenge?.title || 'Unknown Pilot'}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-mono font-bold text-secondary">{pilots[1].status === 'Active' ? '70%' : 'Active'}</div>
                                    <div className="text-[10px] font-bold text-on-surface-variant mt-1 uppercase">Overall Score</div>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                <div>
                                    <div className="text-xs font-bold text-on-surface-variant uppercase mb-3">Key Performance Indicator: Target vs Actual</div>
                                    <div className="flex items-end justify-between border-b-2 border-outline-variant/20 pb-2">
                                        <span className="font-medium text-sm text-on-surface-variant">{pilots[1].target || 'TBD'}</span>
                                        <span className="text-2xl font-mono font-bold text-secondary">{pilots[1].actual || 'TBD'}</span>
                                    </div>
                                    <div className="w-full bg-surface-container h-2 mt-2 rounded-full overflow-hidden">
                                        <div className="bg-secondary h-full rounded-full" style={{ width: '55%' }}></div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4">
                                    <div className="flex justify-between items-center bg-surface-container/50 px-4 py-3 rounded-lg border border-outline-variant/20">
                                        <span className="text-sm font-medium text-on-surface-variant">Cost Efficiency</span>
                                        <span className="font-mono font-bold">75%</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-surface-container/50 px-4 py-3 rounded-lg border border-outline-variant/20">
                                        <span className="text-sm font-medium text-on-surface-variant">User Adoption Rate</span>
                                        <span className="font-mono font-bold">62%</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-surface-container/50 px-4 py-3 rounded-lg border border-outline-variant/20">
                                        <span className="text-sm font-medium text-on-surface-variant">System Reliability</span>
                                        <span className="font-mono font-bold">94.2%</span>
                                    </div>
                                </div>

                                <div className="pt-6 mt-6 border-t border-outline-variant/30 text-center">
                                    <div className="text-xs font-bold text-on-surface-variant uppercase mb-3">System Recommendation</div>
                                    <div className="bg-secondary-fixed/20 border border-secondary-fixed-dim px-4 py-3 rounded-md text-secondary font-bold tracking-wider">
                                        🟡 EXTENSION REQUIRED
                                    </div>
                                    <Link to="/validation" className="mt-4 inline-block text-sm font-bold text-on-surface-variant underline hover:text-on-surface transition-colors">Review Deficiencies</Link>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="col-span-1 lg:col-span-2 p-12 text-center text-on-surface-variant border border-dashed border-outline-variant/50 rounded-xl">
                        Not enough pilot data to form arena comparison correctly. Wait until applications deploy.
                    </div>
                )}
            </div>
        </div>
    );
}
