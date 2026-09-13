import { Search, Filter, ShieldCheck, Zap, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../lib/api";

export default function DiscoverStartups() {
    const [startups, setStartups] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/startups')
            .then(res => setStartups(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);
    return (
        <div className="space-y-6 animate-in fade-in duration-300">

            <div>
                <h1 className="text-2xl font-display font-bold text-on-surface">Find Best Startup Solutions</h1>
                <p className="text-on-surface-variant font-medium text-sm mt-1">AI-assisted discovery and matching against sovereign state challenges.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Filters Panel */}
                <div className="w-full md:w-64 shrink-0 space-y-6">
                    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-5 shadow-sm space-y-5">
                        <h3 className="font-bold border-b border-outline-variant/30 pb-3 flex items-center gap-2 text-on-surface">
                            <Filter size={16} /> Refine Matching
                        </h3>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Related Challenge</label>
                            <select className="w-full bg-surface-container border border-outline-variant/50 rounded-md p-2 text-sm font-medium focus:outline-none">
                                <option>Smart Waste Collection</option>
                                <option>Hospital Waiting Time</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Startup Domain</label>
                            <div className="space-y-2 mt-2">
                                {['Waste Management', 'Healthcare', 'Infrastructure', 'Education'].map((cat, i) => (
                                    <label key={i} className="flex items-center gap-2 text-sm font-medium text-on-surface-variant cursor-pointer">
                                        <input type="checkbox" className="rounded text-primary focus:ring-primary h-4 w-4 border-outline bg-surface-container accent-primary" /> {cat}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Minimum AI Match</label>
                            <input type="range" min="0" max="100" defaultValue="80" className="w-full accent-primary" />
                            <div className="text-xs font-bold text-on-surface-variant text-right">80%</div>
                        </div>
                    </div>
                </div>

                {/* Results Grid */}
                <div className="flex-1 space-y-4">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant text-lg" size={18} />
                        <input type="text" placeholder="Search startups by name, technology, or keywords..." className="w-full bg-surface-container-lowest border border-outline-variant/50 pl-10 pr-4 py-3 rounded-xl text-sm font-medium focus:ring-2 focus:ring-secondary/50 focus:outline-none transition-all shadow-sm" />
                    </div>

                    {/* Cards */}
                    <div className="grid grid-cols-1 gap-4">
                        {loading && (
                            <div className="p-12 text-center text-on-surface-variant flex justify-center">
                                <Loader2 className="animate-spin" />
                            </div>
                        )}
                        {!loading && startups.length === 0 && (
                            <div className="p-12 text-center text-on-surface-variant flex justify-center">
                                No startups found
                            </div>
                        )}
                        {startups.slice().sort((a, b) => b.matchScore - a.matchScore).map((startup, i) => (
                            <div key={i} className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                <div className={`absolute top-0 left-0 w-1.5 h-full ${startup.matchScore >= 90 ? 'bg-primary' : startup.matchScore >= 85 ? 'bg-secondary' : 'bg-tertiary-fixed'}`}></div>

                                <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-xl font-display font-bold text-on-surface group-hover:text-primary transition-colors">{startup.name}</h3>
                                            {startup.matchScore >= 90 && (
                                                <span className="flex items-center gap-1 bg-surface-container text-on-surface-variant px-2 py-0.5 rounded-full text-xs font-bold border border-outline-variant/30"><ShieldCheck size={12} className="text-secondary" /> Verified Track Record</span>
                                            )}
                                        </div>
                                        <p className="text-sm font-medium text-on-surface-variant mb-4">{startup.domain || 'Innovation'} • ISO 27001 Certified</p>

                                        <div className="flex gap-4">
                                            <div className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                                                Tech Match: <span className="text-on-surface font-mono bg-surface-container px-1 py-0.5 rounded">98%</span>
                                            </div>
                                            <div className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                                                Pilot Readiness: <span className="text-on-surface font-mono bg-surface-container px-1 py-0.5 rounded">95%</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-3 shrink-0 border-t md:border-t-0 md:border-l border-outline-variant/30 pt-4 md:pt-0 md:pl-6">
                                        <div className="text-center">
                                            <div className={`text-3xl font-display font-bold font-mono ${startup.matchScore >= 90 ? 'text-primary' : 'text-secondary'}`}>
                                                {startup.matchScore}%
                                            </div>
                                            <div className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mt-1">AI Match Score</div>
                                        </div>
                                        <div className="flex gap-2 w-full mt-2">
                                            <Link to="/startups/profiles" className="w-full flex items-center justify-center text-sm font-bold border border-outline-variant/50 hover:bg-surface-container text-on-surface-variant px-3 py-2 rounded-md transition-colors">
                                                View Profile
                                            </Link>
                                            <Link to="/pilots/arena" className="w-full flex items-center justify-center text-sm font-bold bg-primary text-on-primary hover:bg-primary-container px-3 py-2 rounded-md shadow-sm transition-colors">
                                                Pre-Select
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-outline-variant/20">
                                    <p className="text-xs font-medium text-on-surface-variant flex items-center gap-1">
                                        <Zap size={12} className="text-secondary opacity-70" />
                                        <strong>Why it matches:</strong> {startup.matchReason || 'Solution capabilities align with public innovation objectives.'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
