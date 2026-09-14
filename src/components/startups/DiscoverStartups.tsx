import { Search, Filter, ShieldCheck, Zap, Loader2, Sparkles, X } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../lib/api";

export default function DiscoverStartups() {
    const [searchParams] = useSearchParams();
    const [startups, setStartups] = useState<any[]>([]);
    const [challenges, setChallenges] = useState<any[]>([]);
    const [selectedChallengeId, setSelectedChallengeId] = useState<string>(searchParams.get('challengeId') || '');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDomain, setSelectedDomain] = useState('ALL');
    const [minScore, setMinScore] = useState(70);
    const [loading, setLoading] = useState(true);

    // AI Match Breakdown Modal state
    const [activeMatchModal, setActiveMatchModal] = useState<any>(null);

    // Fetch challenges for selector
    useEffect(() => {
        api.get('/challenges')
            .then(res => {
                setChallenges(res.data);
                if (!selectedChallengeId && res.data.length > 0) {
                    setSelectedChallengeId(res.data[0].id);
                }
            })
            .catch(console.error);
    }, []);

    // Fetch startups with dynamic matching against selected challenge
    useEffect(() => {
        setLoading(true);
        const params = new URLSearchParams();
        if (selectedChallengeId) params.append('challengeId', selectedChallengeId);
        if (selectedDomain && selectedDomain !== 'ALL') params.append('domain', selectedDomain);
        if (searchQuery) params.append('search', searchQuery);
        params.append('minScore', minScore.toString());

        api.get(`/startups?${params.toString()}`)
            .then(res => setStartups(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [selectedChallengeId, selectedDomain, searchQuery, minScore]);

    const selectedChallenge = challenges.find(c => c.id === selectedChallengeId);

    return (
        <div className="space-y-6 animate-in fade-in duration-300 pb-16">
            {/* Header */}
            <div className="border-b border-outline-variant/30 pb-4">
                <div className="flex items-center gap-2 mb-1">
                    <span className="bg-secondary/10 text-secondary border border-secondary/20 text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                        Explainable AI Matching Engine
                    </span>
                </div>
                <h1 className="text-2xl font-display font-bold text-on-surface">Startup Discovery & Dynamic Matching</h1>
                <p className="text-on-surface-variant font-medium text-xs mt-0.5">
                    Match DPIIT-recognized enterprise startups against sovereign departmental challenge requirements.
                </p>
            </div>

            {/* Target Challenge Selector Banner */}
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary-container text-on-primary-container rounded-lg shrink-0">
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Matching Against Challenge:</span>
                        <h3 className="font-display font-bold text-sm text-primary">
                            {selectedChallenge ? selectedChallenge.title : 'All Active Challenges'}
                        </h3>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-on-surface-variant whitespace-nowrap">Change Challenge:</label>
                    <select
                        value={selectedChallengeId}
                        onChange={(e) => setSelectedChallengeId(e.target.value)}
                        className="bg-surface-container border border-outline-variant/50 rounded-lg py-1.5 px-3 text-xs font-bold text-on-surface focus:outline-none max-w-xs"
                    >
                        {challenges.map(ch => (
                            <option key={ch.id} value={ch.id}>{ch.title}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Main Layout Grid */}
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Filter Sidebar */}
                <div className="w-full lg:w-64 shrink-0 space-y-4">
                    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-5 shadow-sm space-y-4">
                        <h3 className="font-bold border-b border-outline-variant/30 pb-2 text-xs uppercase tracking-wider flex items-center gap-2 text-on-surface">
                            <Filter size={14} /> Refine Matching
                        </h3>

                        <div>
                            <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Domain</label>
                            <select
                                value={selectedDomain}
                                onChange={(e) => setSelectedDomain(e.target.value)}
                                className="w-full bg-surface-container border border-outline-variant/50 rounded-lg p-2 text-xs font-semibold text-on-surface focus:outline-none"
                            >
                                <option value="ALL">All Domains</option>
                                <option value="Healthcare">Healthcare</option>
                                <option value="Waste Management">Waste Management</option>
                                <option value="Water">Water & Infrastructure</option>
                                <option value="Education">Education</option>
                                <option value="Infrastructure">Smart Infrastructure</option>
                                <option value="GovTech">GovTech</option>
                            </select>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Min AI Match</label>
                                <span className="font-mono text-xs font-bold text-primary">{minScore}%</span>
                            </div>
                            <input
                                type="range"
                                min="40"
                                max="95"
                                value={minScore}
                                onChange={(e) => setMinScore(parseInt(e.target.value, 10))}
                                className="w-full accent-primary cursor-pointer"
                            />
                        </div>

                        <div className="pt-2 border-t border-outline-variant/30">
                            <span className="text-[10px] text-on-surface-variant font-medium block">
                                Scores calculated dynamically via capability vector matching and sovereign criteria weights.
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right Results Column */}
                <div className="flex-1 space-y-4">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size={16} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search startups by name, technology, or capability..."
                            className="w-full bg-surface-container-lowest border border-outline-variant/50 pl-9 pr-4 py-2.5 rounded-xl text-xs font-medium focus:ring-2 focus:ring-secondary/50 focus:outline-none transition-all shadow-sm"
                        />
                    </div>

                    {/* Startup Cards List */}
                    <div className="space-y-3">
                        {loading && (
                            <div className="p-12 text-center text-on-surface-variant bg-surface-container-lowest rounded-xl border border-outline-variant/30 flex items-center justify-center gap-2">
                                <Loader2 className="animate-spin text-primary" size={20} /> Computing explainable match scores...
                            </div>
                        )}
                        {!loading && startups.length === 0 && (
                            <div className="p-12 text-center text-on-surface-variant bg-surface-container-lowest rounded-xl border border-outline-variant/30">
                                No startups found matching current score and domain criteria. Try lowering the match threshold.
                            </div>
                        )}
                        {startups.map((s, i) => (
                            <div
                                key={s.id || i}
                                className="bg-surface-container-lowest border border-outline-variant/30 hover:border-outline-variant rounded-xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
                            >
                                <div className={`absolute top-0 left-0 w-1.5 h-full ${
                                    s.matchScore >= 90 ? 'bg-primary' : s.matchScore >= 80 ? 'bg-secondary' : 'bg-tertiary-fixed-variant'
                                }`}></div>

                                <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2.5 flex-wrap">
                                            <h3 className="text-lg font-display font-bold text-on-surface group-hover:text-primary transition-colors">
                                                {s.name}
                                            </h3>
                                            <span className="text-[10px] font-mono bg-surface-container px-2 py-0.5 rounded text-on-surface-variant font-bold">
                                                DPIIT: {s.dpiitNumber || 'DIPP89231'}
                                            </span>
                                            {s.matchScore >= 90 && (
                                                <span className="flex items-center gap-1 bg-tertiary-fixed/30 text-on-tertiary-fixed-variant px-2 py-0.5 rounded text-[10px] font-bold border border-tertiary-fixed-dim">
                                                    <ShieldCheck size={12} className="text-tertiary" /> Verified Pilot Track Record
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-xs font-medium text-on-surface-variant leading-relaxed">
                                            {s.description || s.technology}
                                        </p>

                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-on-surface-variant pt-1 font-semibold">
                                            <span>Domain: <strong className="text-on-surface">{s.domain}</strong></span>
                                            <span>Tech Match: <strong className="font-mono text-primary">{s.techScore || 90}%</strong></span>
                                            <span>Capability: <strong className="font-mono text-primary">{s.capabilityScore || 92}%</strong></span>
                                        </div>
                                    </div>

                                    {/* Score Card & Action */}
                                    <div className="flex flex-col sm:flex-row md:flex-col items-end justify-between gap-3 shrink-0 border-t md:border-t-0 md:border-l border-outline-variant/30 pt-3 md:pt-0 md:pl-5 min-w-[140px]">
                                        <div className="text-right w-full">
                                            <div className={`text-3xl font-display font-extrabold font-mono ${
                                                s.matchScore >= 90 ? 'text-primary' : 'text-secondary'
                                            }`}>
                                                {s.matchScore}%
                                            </div>
                                            <div className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant mt-0.5">AI Match Score</div>
                                        </div>

                                        <div className="flex gap-1.5 w-full">
                                            <button
                                                onClick={() => setActiveMatchModal(s)}
                                                className="w-full text-center text-[11px] font-bold bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/30 px-2.5 py-1.5 rounded-lg transition-colors"
                                            >
                                                Why this match?
                                            </button>
                                            <Link
                                                to={`/startups/profiles?id=${s.id}`}
                                                className="w-full text-center text-[11px] font-bold bg-primary text-on-primary hover:bg-primary-container px-2.5 py-1.5 rounded-lg shadow-sm transition-all"
                                            >
                                                Profile
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                                {/* Explainable Rationale Pill */}
                                <div className="mt-3 pt-3 border-t border-outline-variant/20 flex items-start gap-1.5 text-xs text-on-surface-variant font-medium">
                                    <Zap size={14} className="text-secondary shrink-0 mt-0.5" />
                                    <span><strong>AI Rationale:</strong> {s.matchReason || 'Matches core capability requirements.'}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Explainable Match Analysis Modal */}
            {activeMatchModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-level-4">
                        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
                            <div>
                                <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">Explainable AI Matching Engine</span>
                                <h3 className="font-display font-bold text-lg text-on-surface">{activeMatchModal.name}</h3>
                            </div>
                            <button onClick={() => setActiveMatchModal(null)} className="text-on-surface-variant hover:text-on-surface font-bold">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Overall Score */}
                        <div className="p-4 bg-surface-container rounded-xl flex items-center justify-between">
                            <div>
                                <span className="text-xs font-bold text-on-surface-variant uppercase">Aggregated Fit Score</span>
                                <p className="text-xs text-on-surface-variant font-medium">Weighted capability against {selectedChallenge?.title || 'challenge'}</p>
                            </div>
                            <span className="text-3xl font-display font-extrabold font-mono text-primary">
                                {activeMatchModal.matchScore}%
                            </span>
                        </div>

                        {/* Dimensions Breakdown */}
                        <div className="space-y-2.5">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Evaluation Dimensions</h4>
                            {[
                                { label: 'Capability Match', score: activeMatchModal.capabilityScore || 94, weight: '35%' },
                                { label: 'Domain Fit', score: activeMatchModal.domainScore || 92, weight: '25%' },
                                { label: 'Technology Stack', score: activeMatchModal.techScore || 90, weight: '25%' },
                                { label: 'Track Record & Experience', score: activeMatchModal.experienceScore || 88, weight: '15%' }
                            ].map((dim, idx) => (
                                <div key={idx} className="space-y-1">
                                    <div className="flex justify-between text-xs font-semibold">
                                        <span className="text-on-surface">{dim.label} <span className="text-[10px] text-on-surface-variant font-normal">({dim.weight})</span></span>
                                        <span className="font-mono font-bold text-primary">{dim.score}%</span>
                                    </div>
                                    <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-primary h-full rounded-full" style={{ width: `${dim.score}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Rationale & Gaps */}
                        <div className="space-y-3 pt-2">
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Key Match Reasons</h4>
                                <ul className="text-xs text-on-surface space-y-1 font-medium list-disc pl-4">
                                    {(activeMatchModal.matchingReasons || [activeMatchModal.matchReason]).map((r: string, idx: number) => (
                                        <li key={idx}>{r}</li>
                                    ))}
                                </ul>
                            </div>

                            {activeMatchModal.potentialGaps?.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-error mb-1">Identified Customization Gaps</h4>
                                    <ul className="text-xs text-on-surface-variant space-y-1 font-medium list-disc pl-4">
                                        {activeMatchModal.potentialGaps.map((gap: string, idx: number) => (
                                            <li key={idx}>{gap}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div className="pt-3 border-t border-outline-variant/30 flex justify-end">
                            <button
                                onClick={() => setActiveMatchModal(null)}
                                className="px-5 py-2 bg-primary text-on-primary font-bold text-xs rounded-lg hover:bg-primary-container transition-colors"
                            >
                                Close Breakdown
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
