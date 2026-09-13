import { Search, Filter, ArrowRight, Wallet, Activity, Loader2 } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../lib/api";

export default function PilotManagement() {
    const [pilots, setPilots] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || "");
    const [statusFilter] = useState(searchParams.get('status') || "");

    useEffect(() => {
        const query = new URLSearchParams();
        if (statusFilter) query.append('status', statusFilter);
        if (searchQuery) query.append('search', searchQuery);

        api.get(`/pilots?${query.toString()}`)
            .then(res => setPilots(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [searchQuery, statusFilter]);
    return (
        <div className="space-y-6 animate-in fade-in duration-300">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/30 pb-4">
                <div>
                    <h1 className="text-2xl font-display font-bold text-on-surface">Active Pilots Management</h1>
                    <p className="text-on-surface-variant font-medium text-sm mt-1">Monitor milestone telemetry and manage ongoing challenge deployments.</p>
                </div>
                <Link to="/pilots/arena" className="flex items-center gap-2 bg-secondary-container/50 text-secondary border border-secondary/20 font-bold py-2 px-4 rounded-md hover:bg-secondary-container transition-colors text-sm">
                    <Activity size={18} /> Pilot Arena Comparison
                </Link>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm pt-2">
                <div className="p-4 border-b border-outline-variant/30 bg-surface-container-lowest flex flex-col md:flex-row items-center gap-4">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size={16} />
                        <input
                            type="text"
                            placeholder="Search by ID, Startup, or Department..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onBlur={(e) => {
                                setSearchParams(prev => {
                                    if (e.target.value) prev.set('search', e.target.value);
                                    else prev.delete('search');
                                    return prev;
                                });
                            }}
                            className="w-full bg-surface-container border border-outline-variant/50 pl-9 pr-3 py-2 rounded-md text-sm font-medium focus:ring-1 focus:ring-secondary/50 focus:outline-none transition-all"
                        />
                    </div>
                    <button className="flex items-center gap-2 bg-surface-container border border-outline-variant/50 px-3 py-2 rounded-md text-sm font-medium hover:bg-surface-container-high transition-colors text-on-surface-variant">
                        <Filter size={16} /> Filter by Status
                    </button>
                </div>

                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-surface-container-low border-b border-outline-variant/30">
                            <th className="px-5 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Pilot Ref ID / Startup</th>
                            <th className="px-5 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Deployment Location</th>
                            <th className="px-5 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-right">Target vs Actual</th>
                            <th className="px-5 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Status</th>
                            <th className="px-5 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/20">
                        {loading && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-on-surface-variant">
                                    <Loader2 className="animate-spin inline mr-2" size={16} /> Loading Pilot Telemetry...
                                </td>
                            </tr>
                        )}
                        {!loading && pilots.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-on-surface-variant">No active pilots found.</td>
                            </tr>
                        )}
                        {pilots.map((pilot, i) => (
                            <tr key={i} onClick={() => navigate('/passport')} className="cursor-pointer hover:bg-surface-container-low transition-colors group">
                                <td className="px-5 py-4">
                                    <div className="font-semibold text-on-surface mb-1 flex items-center gap-2">
                                        {pilot.startup?.name}
                                        <span className="text-[10px] bg-surface-container px-1.5 py-0.5 rounded text-outline uppercase font-mono">P-{pilot.id?.substring(0, 4)}</span>
                                    </div>
                                    <div className="text-xs text-on-surface-variant font-medium">{pilot.challenge?.title}</div>
                                </td>
                                <td className="px-5 py-4 text-sm font-medium text-on-surface-variant">
                                    {pilot.challenge?.department?.name} <br /><span className="text-xs opacity-70">Zone A</span>
                                </td>
                                <td className="px-5 py-4 text-sm font-mono font-medium text-right relative">
                                    <div className="text-xs text-outline mb-1">Target: {pilot.target || "95%"}</div>
                                    <div className={`font-bold ${pilot.status === 'Completed' ? 'text-primary' : pilot.status === 'Needs Extension' ? 'text-secondary' : 'text-error'}`}>
                                        Actual: {pilot.actual || "TBD"}
                                    </div>
                                </td>
                                <td className="px-5 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${pilot.status === 'Completed' ? 'bg-primary-fixed-dim/30 text-primary border border-primary/20' :
                                        pilot.status === 'Needs Extension' ? 'bg-secondary-fixed/50 text-secondary border border-secondary-fixed-dim' :
                                            'bg-error-container/30 text-error border border-error/20'
                                        }`}>
                                        {pilot.status}
                                    </span>
                                </td>
                                <td className="px-5 py-4 text-right">
                                    <Link to="/passport" className="text-sm font-semibold text-primary hover:text-primary-container transition-colors inline-flex items-center gap-1">
                                        View Details <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Financial Overview - Required by Milestones & Payments */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-outline-variant/30">
                <div className="bg-surface-container-lowest border border-outline-variant/30 p-5 rounded-xl shadow-sm">
                    <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4 flex items-center gap-2"><Wallet size={16} /> Total Contract Value</h4>
                    <div className="text-3xl font-mono font-bold text-on-surface">₹75,00,000</div>
                    <div className="text-xs font-medium text-on-surface-variant mt-2 border-t border-outline-variant/30 pt-2 flex justify-between">
                        <span>Currently Deployed:</span> <strong>3 Active Pilots</strong>
                    </div>
                </div>
                <div className="bg-surface-container-lowest border border-outline-variant/30 p-5 rounded-xl shadow-sm">
                    <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4">Milestones Paid</h4>
                    <div className="text-3xl font-mono font-bold text-secondary">₹30,00,000</div>
                    <div className="text-xs font-medium text-on-surface-variant mt-2 border-t border-outline-variant/30 pt-2 flex justify-between">
                        <span>Percentage Paid:</span> <strong>40%</strong>
                    </div>
                </div>
                <div className="bg-surface-container-lowest border border-outline-variant/30 p-5 rounded-xl shadow-sm">
                    <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4">Pending Payments</h4>
                    <div className="text-3xl font-mono font-bold text-on-surface">₹45,00,000</div>
                    <div className="text-xs font-medium text-on-surface-variant mt-2 border-t border-outline-variant/30 pt-2 flex justify-between">
                        <span>Under Review:</span> <strong className="text-secondary">₹12,00,000</strong>
                    </div>
                </div>
            </div>
        </div>
    );
}
