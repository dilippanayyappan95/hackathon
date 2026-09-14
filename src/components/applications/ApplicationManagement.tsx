import { Inbox, Search, Filter, Loader2, Play, Eye, UserCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../lib/api';
import { useToast } from '../../context/ToastContext';

export default function ApplicationManagement() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [searchParams, setSearchParams] = useSearchParams();
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedApp, setSelectedApp] = useState<any>(null);
    const [updating, setUpdating] = useState(false);

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const isGov = ['Government Officer', 'Admin'].includes(user?.role);

    const loadApplications = () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (statusFilter && statusFilter !== 'ALL') params.append('status', statusFilter);
        if (searchQuery) params.append('search', searchQuery);

        api.get(`/applications?${params.toString()}`)
            .then(res => setApplications(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadApplications();
    }, [statusFilter, searchQuery]);

    const handleUpdateStatus = async (appId: string, newStatus: string) => {
        setUpdating(true);
        try {
            await api.patch(`/applications/${appId}/status`, { status: newStatus });
            showToast(`Application updated to ${newStatus}`, 'success');
            loadApplications();
            if (selectedApp?.id === appId) {
                setSelectedApp((prev: any) => ({ ...prev, status: newStatus }));
            }
        } catch (e: any) {
            console.error(e);
            showToast(e.response?.data?.error || 'Failed to update application status', 'error');
        } finally {
            setUpdating(false);
        }
    };

    const handleCreatePilot = async (appId: string) => {
        setUpdating(true);
        try {
            await api.post(`/applications/${appId}/pilot`, {});
            showToast('Pilot Project provisioned and sandbox initialized!', 'success');
            loadApplications();
            navigate('/pilots');
        } catch (e: any) {
            console.error(e);
            showToast(e.response?.data?.error || 'Failed to provision pilot', 'error');
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300 pb-16">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/30 pb-4">
                <div>
                    <h1 className="text-2xl font-display font-bold text-on-surface flex items-center gap-2">
                        <Inbox className="text-primary" /> Application Review & Screening
                    </h1>
                    <p className="text-on-surface-variant font-medium text-xs mt-0.5">
                        Track startup proposals, conduct eligibility screening, and provision sandboxes for selected innovations.
                    </p>
                </div>
            </div>

            {/* Filter / Search Bar */}
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size={16} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by startup name or proposal..."
                        className="w-full bg-surface-container border border-outline-variant/50 pl-9 pr-3 py-2 rounded-lg text-xs font-medium focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                    <Filter size={14} className="text-on-surface-variant" />
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setSearchParams(prev => {
                                if (e.target.value !== 'ALL') prev.set('status', e.target.value);
                                else prev.delete('status');
                                return prev;
                            });
                        }}
                        className="bg-surface-container border border-outline-variant/50 px-3 py-2 rounded-lg text-xs font-bold text-on-surface focus:outline-none"
                    >
                        <option value="ALL">All Application Statuses</option>
                        <option value="SUBMITTED">Submitted</option>
                        <option value="SHORTLISTED">Shortlisted</option>
                        <option value="UNDER_EVALUATION">Under Evaluation</option>
                        <option value="SELECTED">Selected for Pilot</option>
                        <option value="REJECTED">Rejected</option>
                    </select>
                </div>
            </div>

            {/* Applications List & Detail Split View */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: Applications Table */}
                <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-4 bg-surface-container-low border-b border-outline-variant/30 flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                            Applications ({applications.length})
                        </span>
                        <span className="text-[10px] font-mono text-on-surface-variant font-bold">
                            Live Database Records
                        </span>
                    </div>

                    <div className="divide-y divide-outline-variant/20">
                        {loading && (
                            <div className="p-12 text-center text-on-surface-variant flex items-center justify-center gap-2">
                                <Loader2 className="animate-spin text-primary" size={18} /> Loading applications...
                            </div>
                        )}
                        {!loading && applications.length === 0 && (
                            <div className="p-12 text-center text-on-surface-variant text-xs font-medium">
                                No applications found for current filters.
                            </div>
                        )}
                        {applications.map((app) => {
                            const isSelected = selectedApp?.id === app.id;
                            return (
                                <div
                                    key={app.id}
                                    onClick={() => setSelectedApp(app)}
                                    className={`p-5 cursor-pointer transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                                        isSelected ? 'bg-primary/5 border-l-4 border-primary' : 'hover:bg-surface-container-low'
                                    }`}
                                >
                                    <div className="space-y-1.5 flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-bold text-sm text-on-surface">{app.startup?.name}</h3>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                                app.status === 'SELECTED' ? 'bg-primary text-on-primary' :
                                                app.status === 'SHORTLISTED' ? 'bg-secondary/20 text-secondary' :
                                                app.status === 'REJECTED' ? 'bg-error-container text-on-error-container' :
                                                'bg-surface-container text-on-surface-variant'
                                            }`}>
                                                {app.status}
                                            </span>
                                        </div>
                                        <p className="text-xs font-medium text-primary line-clamp-1">{app.challenge?.title}</p>
                                        <p className="text-xs text-on-surface-variant line-clamp-2">{app.solutionSummary}</p>
                                    </div>

                                    <div className="text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between gap-2">
                                        <div className="text-xs font-mono font-bold text-on-surface">{app.proposedBudget || '₹25,00,000'}</div>
                                        <span className="text-[10px] text-on-surface-variant font-medium">{app.proposedTimeline || '6 Months'}</span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedApp(app);
                                            }}
                                            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                                        >
                                            <Eye size={13} /> View
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Col: Selected Application Detail / Screening Card */}
                <div className="space-y-6">
                    {selectedApp ? (
                        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm space-y-5 animate-in fade-in">
                            <div className="border-b border-outline-variant/30 pb-4">
                                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Candidate Dossier</span>
                                <h3 className="text-xl font-display font-bold text-on-surface mt-0.5">{selectedApp.startup?.name}</h3>
                                <p className="text-xs text-on-surface-variant font-medium mt-1">{selectedApp.challenge?.title}</p>
                            </div>

                            <div className="space-y-3 text-xs">
                                <div>
                                    <span className="font-bold text-on-surface-variant uppercase text-[10px]">Proposed Architecture:</span>
                                    <p className="p-3 bg-surface-container rounded-lg font-medium text-on-surface mt-1 leading-relaxed">
                                        {selectedApp.solutionSummary}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div className="p-2.5 bg-surface-container rounded-lg">
                                        <span className="text-[10px] text-on-surface-variant uppercase font-bold">Proposed Budget</span>
                                        <div className="font-mono font-bold text-sm text-on-surface mt-0.5">{selectedApp.proposedBudget || '₹25,00,000'}</div>
                                    </div>
                                    <div className="p-2.5 bg-surface-container rounded-lg">
                                        <span className="text-[10px] text-on-surface-variant uppercase font-bold">Timeline</span>
                                        <div className="font-bold text-sm text-on-surface mt-0.5">{selectedApp.proposedTimeline || '6 Months'}</div>
                                    </div>
                                </div>

                                {selectedApp.evaluations?.length > 0 && (
                                    <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                                        <span className="text-[10px] font-bold text-primary uppercase">Expert Evaluation Score</span>
                                        <div className="text-2xl font-mono font-extrabold text-primary mt-0.5">
                                            {selectedApp.evaluations[0].overallScore}/100
                                        </div>
                                        <p className="text-[11px] text-on-surface-variant font-medium mt-1">
                                            "{selectedApp.evaluations[0].comments}"
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* State Transition Actions */}
                            {isGov && (
                                <div className="pt-4 border-t border-outline-variant/30 space-y-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block mb-2">
                                        Government Screening Actions
                                    </span>

                                    {selectedApp.status === 'SUBMITTED' && (
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => handleUpdateStatus(selectedApp.id, 'SHORTLISTED')}
                                                disabled={updating}
                                                className="py-2 px-3 bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/30 rounded-lg text-xs font-bold transition-colors"
                                            >
                                                Shortlist
                                            </button>
                                            <button
                                                onClick={() => handleUpdateStatus(selectedApp.id, 'REJECTED')}
                                                disabled={updating}
                                                className="py-2 px-3 bg-error-container/40 hover:bg-error-container text-error rounded-lg text-xs font-bold transition-colors"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}

                                    {selectedApp.status === 'SHORTLISTED' && (
                                        <Link
                                            to="/evaluation"
                                            className="w-full py-2.5 px-4 bg-primary text-on-primary hover:bg-primary-container rounded-lg text-xs font-bold text-center block shadow-sm transition-all"
                                        >
                                            <UserCheck size={14} className="inline mr-1.5" /> Move to Expert Evaluation
                                        </Link>
                                    )}

                                    {selectedApp.status === 'SELECTED' && (
                                        <button
                                            onClick={() => handleCreatePilot(selectedApp.id)}
                                            disabled={updating}
                                            className="w-full py-2.5 px-4 bg-primary text-on-primary hover:bg-primary-container rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                                        >
                                            <Play size={14} /> Provision Sandbox Pilot
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-8 text-center text-on-surface-variant text-xs font-medium">
                            Select an application from the list to inspect technical proposals and perform nodal screening.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
