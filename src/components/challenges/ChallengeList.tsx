import { Search, Plus, ArrowRight, Loader2 } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../lib/api";
import { DEPARTMENTS } from "../../data/mockData";

export default function ChallengeList() {
    const [challenges, setChallenges] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || "");
    const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || "");
    const userRole = JSON.parse(localStorage.getItem('user') || '{}')?.role || '';

    useEffect(() => {
        const query = new URLSearchParams();
        if (statusFilter) query.append('status', statusFilter);
        if (searchQuery) query.append('search', searchQuery);

        api.get(`/challenges?${query.toString()}`)
            .then(res => setChallenges(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [searchQuery, statusFilter]);
    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-display font-bold text-on-surface">Challenge Repository</h1>
                    <p className="text-on-surface-variant font-medium text-sm mt-1">Manage departmental problem statements and allocations</p>
                </div>
                {['Government Officer', 'Admin'].includes(userRole) && (
                    <Link to="/challenges/new" className="flex items-center gap-2 bg-primary text-on-primary font-bold py-2.5 px-4 rounded-md shadow-level-2 hover:bg-primary-container transition-transform active:scale-[0.98] text-sm">
                        <Plus size={18} />
                        Create Challenge
                    </Link>
                )}
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-outline-variant/30 bg-surface-container-low flex flex-col md:flex-row items-center gap-4">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size={16} />
                        <input
                            type="text"
                            placeholder="Search by ID, Title, or Department..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-surface-container-lowest border border-outline-variant/50 pl-9 pr-3 py-2 rounded-md text-sm font-medium focus:ring-2 focus:ring-secondary/50 focus:outline-none transition-all"
                        />
                    </div>

                    <div className="flex w-full md:w-auto items-center gap-3">
                        <select
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-surface-container-lowest border border-outline-variant/50 text-sm font-medium py-2 px-3 rounded-md focus:outline-none w-full md:w-48 text-on-surface-variant"
                        >
                            <option value="">All Departments</option>
                            {DEPARTMENTS.map((d, i) => <option key={i} value={d}>{d}</option>)}
                        </select>

                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setSearchParams(prev => {
                                    if (e.target.value) prev.set('status', e.target.value);
                                    else prev.delete('status');
                                    return prev;
                                });
                            }}
                            className="bg-surface-container border border-outline-variant/50 px-3 py-2 rounded-md text-sm font-medium hover:bg-surface-container-high transition-colors text-on-surface-variant flex gap-2 items-center"
                        >
                            <option value="">All Statuses</option>
                            <option value="PUBLISHED">Published</option>
                            <option value="UNDER_EVALUATION">Evaluating</option>
                            <option value="COMPLETED">Completed</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-container-lowest border-b border-outline-variant/30">
                                <th className="px-5 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider w-1/3">Challenge Title</th>
                                <th className="px-5 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Domain</th>
                                <th className="px-5 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-right">Budget</th>
                                <th className="px-5 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Status</th>
                                <th className="px-5 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/20">
                            {loading && (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-on-surface-variant">
                                        <Loader2 className="animate-spin inline mr-2" size={20} /> Loading challenges from network...
                                    </td>
                                </tr>
                            )}
                            {!loading && challenges.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-on-surface-variant">
                                        No active challenges found.
                                    </td>
                                </tr>
                            )}
                            {challenges
                                .filter(ch =>
                                    ch.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    ch.id?.includes(searchQuery) ||
                                    ch.department?.name?.toLowerCase().includes(searchQuery.toLowerCase())
                                )
                                .map((ch, i) => (
                                    <tr key={ch.id || i} onClick={() => navigate(`/challenges/${ch.id}`)} className="cursor-pointer hover:bg-surface-container-low transition-colors group">
                                        <td className="px-5 py-4">
                                            <div className="font-semibold text-on-surface mb-1 flex items-center gap-2">
                                                {ch.title}
                                                <span className="text-[10px] bg-surface-container px-1.5 py-0.5 rounded text-outline uppercase font-mono">{(ch.id as string).substring(0, 8)}</span>
                                            </div>
                                            <div className="text-xs text-on-surface-variant">{ch.department ? ch.department.name : 'Unassigned'}</div>
                                        </td>
                                        <td className="px-5 py-4 text-sm font-medium text-on-surface-variant">
                                            Innovation
                                        </td>
                                        <td className="px-5 py-4 text-sm font-mono font-medium text-on-surface text-right">
                                            {ch.targetValue || 'TBA'}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${ch.status === 'Active' ? 'bg-tertiary-fixed-dim/30 text-on-tertiary-fixed-variant border border-tertiary-fixed-dim' :
                                                ch.status === 'Draft' ? 'bg-surface-container text-on-surface-variant border border-outline-variant/50' :
                                                    ch.status === 'Evaluation' ? 'bg-secondary-fixed/50 text-secondary border border-secondary-fixed-dim' :
                                                        'bg-primary-fixed text-primary border border-primary-fixed-dim'
                                                }`}>
                                                {ch.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <Link to={`/challenges/${ch.id}`} className="text-sm font-semibold text-secondary hover:text-secondary-container transition-colors inline-flex items-center gap-1">
                                                Review <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>

                <div className="bg-surface-container-low p-4 border-t border-outline-variant/30 flex items-center justify-between text-sm">
                    <span className="text-on-surface-variant font-medium">Showing {challenges.length} challenges</span>
                    <div className="flex gap-1">
                        {/* Pagination purely illustrative */}
                        <button className="px-3 py-1 bg-surface-container-lowest border border-outline-variant/50 rounded-md font-medium hover:bg-surface-container">Prev</button>
                        <button className="px-3 py-1 bg-primary text-on-primary rounded-md font-medium">1</button>
                        <button className="px-3 py-1 bg-surface-container-lowest border border-outline-variant/50 rounded-md font-medium hover:bg-surface-container">Next</button>
                    </div>
                </div>
            </div>
        </div >
    );
}
