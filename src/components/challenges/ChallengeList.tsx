import { Search, Plus, ArrowRight, Loader2, Target } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../lib/api";

const DEPARTMENTS = [
    "Maharashtra Urban Innovation Department",
    "Maharashtra Health Innovation Department",
    "Maharashtra Education Innovation Department",
    "Maharashtra Water & Infrastructure Department"
];

export default function ChallengeList() {
    const [challenges, setChallenges] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || "");
    const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || "");
    const [deptFilter, setDeptFilter] = useState(searchParams.get('department') || "");
    const userRole = JSON.parse(localStorage.getItem('user') || '{}')?.role || '';

    useEffect(() => {
        const query = new URLSearchParams();
        if (statusFilter && statusFilter !== 'ALL') query.append('status', statusFilter);
        if (searchQuery) query.append('search', searchQuery);

        api.get(`/challenges?${query.toString()}`)
            .then(res => setChallenges(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [searchQuery, statusFilter]);

    const filteredChallenges = challenges.filter(ch => {
        if (deptFilter && deptFilter !== 'ALL') {
            if (ch.department?.name !== deptFilter) return false;
        }
        return true;
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/30 pb-4">
                <div>
                    <h1 className="text-2xl font-display font-bold text-on-surface flex items-center gap-2">
                        <Target className="text-primary" /> Challenge Repository
                    </h1>
                    <p className="text-on-surface-variant font-medium text-sm mt-1">
                        Sovereign departmental problem statements, pilot allocations, and target KPI frameworks.
                    </p>
                </div>
                {['Government Officer', 'Admin'].includes(userRole) && (
                    <div className="flex items-center gap-2">
                        <Link
                            to="/challenges/new/ai"
                            className="flex items-center gap-1.5 bg-secondary/10 text-secondary border border-secondary/30 font-bold py-2 px-3.5 rounded-lg hover:bg-secondary/20 transition-all text-sm"
                        >
                            Draft with AI Copilot
                        </Link>
                        <Link
                            to="/challenges/new"
                            className="flex items-center gap-1.5 bg-primary text-on-primary font-bold py-2 px-3.5 rounded-lg shadow-sm hover:bg-primary-container transition-all text-sm"
                        >
                            <Plus size={16} /> Create Challenge
                        </Link>
                    </div>
                )}
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-outline-variant/30 bg-surface-container-low flex flex-col md:flex-row items-center gap-3">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size={16} />
                        <input
                            id="challenge-search"
                            name="search"
                            type="search"
                            placeholder="Search by Title, ID, or Keywords..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-surface-container-lowest border border-outline-variant/50 pl-9 pr-3 py-2 rounded-lg text-sm font-medium focus:ring-2 focus:ring-secondary/50 focus:outline-none transition-all"
                        />
                    </div>

                    <div className="flex w-full md:w-auto items-center gap-2.5 flex-1 justify-end">
                        <select
                            id="dept-filter"
                            name="deptFilter"
                            value={deptFilter}
                            onChange={(e) => setDeptFilter(e.target.value)}
                            className="bg-surface-container-lowest border border-outline-variant/50 text-xs font-semibold py-2 px-3 rounded-lg focus:outline-none text-on-surface-variant max-w-xs"
                        >
                            <option value="ALL">All Departments</option>
                            {DEPARTMENTS.map((d, i) => <option key={i} value={d}>{d.replace('Maharashtra ', '')}</option>)}
                        </select>

                        <select
                            id="status-filter"
                            name="statusFilter"
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setSearchParams(prev => {
                                    if (e.target.value) prev.set('status', e.target.value);
                                    else prev.delete('status');
                                    return prev;
                                });
                            }}
                            className="bg-surface-container-lowest border border-outline-variant/50 px-3 py-2 rounded-lg text-xs font-semibold text-on-surface-variant focus:outline-none"
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="PUBLISHED">Published</option>
                            <option value="UNDER_EVALUATION">Under Evaluation</option>
                            <option value="PILOT">Pilot Active</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="DRAFT">Draft</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                            <tr className="bg-surface-container-lowest border-b border-outline-variant/30">
                                <th className="px-5 py-3 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider w-2/5">Challenge Title / Dept</th>
                                <th className="px-5 py-3 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Target Objective</th>
                                <th className="px-5 py-3 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Budget / Term</th>
                                <th className="px-5 py-3 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Status</th>
                                <th className="px-5 py-3 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/20">
                            {loading && (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-on-surface-variant">
                                        <Loader2 className="animate-spin inline mr-2 text-primary" size={20} /> Retrieving challenges from sovereign database...
                                    </td>
                                </tr>
                            )}
                            {!loading && filteredChallenges.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-on-surface-variant">
                                        No challenges found matching current filters.
                                    </td>
                                </tr>
                            )}
                            {filteredChallenges.map((ch, i) => (
                                <tr
                                    key={ch.id || i}
                                    onClick={() => navigate(`/challenges/${ch.id}`)}
                                    className="cursor-pointer hover:bg-surface-container-low transition-colors group"
                                >
                                    <td className="px-5 py-4">
                                        <div className="font-bold text-sm text-on-surface mb-1 flex items-center gap-2 group-hover:text-primary transition-colors">
                                            {ch.title}
                                            <span className="text-[10px] bg-surface-container px-1.5 py-0.5 rounded text-on-surface-variant uppercase font-mono">
                                                {(ch.id as string).substring(0, 8)}
                                            </span>
                                        </div>
                                        <div className="text-xs text-on-surface-variant font-medium">
                                            {ch.department ? ch.department.name : 'Unassigned'} • {ch.category || 'General'}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-xs font-medium text-on-surface max-w-xs">
                                        <span className="text-secondary font-bold">{ch.targetValue || 'Defined Target'}</span>
                                        <div className="text-[10px] text-on-surface-variant mt-0.5 truncate">{ch.problemStatement || ch.description}</div>
                                    </td>
                                    <td className="px-5 py-4 text-xs font-mono font-medium text-on-surface">
                                        <div>{ch.budget || '₹25,00,000'}</div>
                                        <div className="text-[10px] text-on-surface-variant font-sans">{ch.timeline || '6 Months'}</div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                                            ch.status === 'PUBLISHED' ? 'bg-primary/10 text-primary border border-primary/20' :
                                            ch.status === 'COMPLETED' ? 'bg-tertiary-fixed/30 text-on-tertiary-fixed-variant border border-tertiary-fixed-dim' :
                                            ch.status === 'PILOT' ? 'bg-secondary-fixed/40 text-secondary border border-secondary-fixed-dim' :
                                            ch.status === 'UNDER_EVALUATION' ? 'bg-secondary/10 text-secondary border border-secondary/20' :
                                            'bg-surface-container text-on-surface-variant border border-outline-variant/50'
                                        }`}>
                                            {ch.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <span className="text-xs font-bold text-secondary hover:text-secondary-container transition-colors inline-flex items-center gap-1">
                                            Details <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="bg-surface-container-low p-3.5 border-t border-outline-variant/30 flex items-center justify-between text-xs text-on-surface-variant">
                    <span className="font-semibold">Showing {filteredChallenges.length} challenges</span>
                    <span className="font-mono text-[11px]">Sovereign Ledger Status: Synchronized</span>
                </div>
            </div>
        </div>
    );
}
