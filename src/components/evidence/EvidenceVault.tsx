import { Database, Search, ShieldCheck, Download, Eye, UploadCloud, Loader2, Plus, Filter, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../../lib/api";
import { useToast } from "../../context/ToastContext";

export default function EvidenceVault() {
    const { showToast } = useToast();
    const [documents, setDocuments] = useState<any[]>([]);
    const [pilots, setPilots] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    // Upload Modal State
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedPilotId, setSelectedPilotId] = useState('');
    const [evidenceTitle, setEvidenceTitle] = useState('');
    const [evidenceType, setEvidenceType] = useState('Telemetry Dataset');
    const [evidenceDesc, setEvidenceDesc] = useState('');
    const [uploading, setUploading] = useState(false);

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const isGovOrValidator = ['Government Officer', 'Admin', 'Validator'].includes(user?.role);

    const fetchVault = () => {
        setLoading(true);
        Promise.all([
            api.get('/evidence'),
            api.get('/pilots')
        ]).then(([evRes, pilotsRes]) => {
            setDocuments(evRes.data || []);
            setPilots(pilotsRes.data || []);
            if (pilotsRes.data && pilotsRes.data.length > 0 && !selectedPilotId) {
                setSelectedPilotId(pilotsRes.data[0].id);
            }
        }).catch(console.error)
        .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchVault();
    }, []);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPilotId) {
            return showToast('Please select an active pilot deployment', 'warning');
        }
        if (!evidenceTitle.trim()) {
            return showToast('Please enter an evidence title or dataset reference', 'warning');
        }
        setUploading(true);
        try {
            await api.post('/evidence', {
                pilotId: selectedPilotId,
                title: evidenceTitle.trim(),
                description: evidenceDesc.trim() || 'Submitted pilot evidence artifact',
                fileType: evidenceType,
                fileUrl: `Vault_${evidenceTitle.trim().replace(/\s+/g, '_')}_2026.pdf`
            });
            showToast('Evidence artifact registered in Evidence Vault', 'success');
            setIsUploadModalOpen(false);
            setEvidenceTitle('');
            setEvidenceDesc('');
            fetchVault();
        } catch (err: any) {
            console.error(err);
            showToast(err.response?.data?.error || 'Failed to upload evidence artifact', 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleVerify = async (evId: string, status: string) => {
        try {
            await api.patch(`/evidence/${evId}/verify`, { status });
            showToast(`Evidence status updated to ${status}`, 'success');
            fetchVault();
        } catch (err: any) {
            console.error(err);
            showToast(err.response?.data?.error || 'Failed to update verification status', 'error');
        }
    };

    const filteredDocs = documents.filter(doc => {
        if (statusFilter !== 'ALL' && doc.verifiedStatus !== statusFilter) return false;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const matchTitle = doc.title?.toLowerCase().includes(q) || doc.fileUrl?.toLowerCase().includes(q);
            const matchPilot = doc.pilot?.challenge?.title?.toLowerCase().includes(q);
            const matchStartup = doc.pilot?.startup?.name?.toLowerCase().includes(q);
            if (!matchTitle && !matchPilot && !matchStartup) return false;
        }
        return true;
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-300 pb-16">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/30 pb-4">
                <div>
                    <h1 className="text-2xl font-display font-bold text-on-surface flex items-center gap-2">
                        <Database className="text-primary" /> Digital Evidence Vault
                    </h1>
                    <p className="text-on-surface-variant font-medium text-xs mt-0.5">
                        Immutable repository of all pilot data, reports, and validation artifacts.
                    </p>
                </div>
                <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="flex items-center justify-center gap-2 bg-primary text-on-primary font-bold py-2 px-4 rounded-lg shadow-sm hover:bg-primary-container transition-all text-xs"
                >
                    <Plus size={16} /> Submit Evidence Artifact
                </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-outline-variant/30 bg-surface-container-low flex flex-col md:flex-row items-center justify-between gap-3">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size={16} />
                        <input
                            type="text"
                            placeholder="Search evidence files, startups, challenges..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-surface-container-lowest border border-outline-variant/50 pl-9 pr-3 py-2 rounded-lg text-xs font-medium focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                        <Filter size={14} className="text-on-surface-variant" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-surface-container-lowest border border-outline-variant/50 px-3 py-1.5 rounded-lg text-xs font-bold text-on-surface focus:outline-none"
                        >
                            <option value="ALL">All Verification Statuses</option>
                            <option value="VERIFIED">Verified</option>
                            <option value="UNDER_REVIEW">Under Review</option>
                            <option value="SUBMITTED">Submitted</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-surface-container-lowest border-b border-outline-variant/30 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                                <th className="px-5 py-3.5">Artifact Name / File</th>
                                <th className="px-5 py-3.5">Pilot Project & Startup</th>
                                <th className="px-5 py-3.5">Artifact Type</th>
                                <th className="px-5 py-3.5">Verification Status</th>
                                <th className="px-5 py-3.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/20 text-xs">
                            {loading && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-on-surface-variant">
                                        <Loader2 className="animate-spin inline mr-2 text-primary" size={18} /> Retrieving Vault records...
                                    </td>
                                </tr>
                            )}
                            {!loading && filteredDocs.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-on-surface-variant font-medium">
                                        No evidence artifacts found matching current filter.
                                    </td>
                                </tr>
                            )}
                            {filteredDocs.map((doc, i) => (
                                <tr key={doc.id || i} className="hover:bg-surface-container-low transition-colors group">
                                    <td className="px-5 py-4">
                                        <div className="font-bold text-sm text-on-surface mb-0.5 flex items-center gap-2">
                                            <FileText size={15} className="text-primary shrink-0" />
                                            {doc.title || doc.fileUrl}
                                        </div>
                                        <div className="text-[11px] text-on-surface-variant">
                                            {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'Active Snapshot'}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="font-bold text-on-surface">{doc.pilot?.startup?.name || 'Enterprise Startup'}</div>
                                        <div className="text-[11px] text-on-surface-variant truncate max-w-xs">{doc.pilot?.challenge?.title}</div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className="font-medium text-on-surface bg-surface-container px-2 py-0.5 rounded text-[11px]">
                                            {doc.fileType || 'Pilot Report'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                            doc.verifiedStatus === 'VERIFIED' ? 'bg-tertiary-fixed/30 text-on-tertiary-fixed-variant border border-tertiary-fixed-dim' :
                                            doc.verifiedStatus === 'UNDER_REVIEW' ? 'bg-secondary/20 text-secondary border border-secondary/30' :
                                            doc.verifiedStatus === 'REJECTED' ? 'bg-error-container text-on-error-container' :
                                            'bg-surface-container text-on-surface-variant border border-outline-variant/40'
                                        }`}>
                                            {doc.verifiedStatus === 'VERIFIED' && <ShieldCheck size={12} />}
                                            {doc.verifiedStatus || 'SUBMITTED'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {isGovOrValidator && doc.verifiedStatus !== 'VERIFIED' && (
                                                <button
                                                    onClick={() => handleVerify(doc.id, 'VERIFIED')}
                                                    className="px-2.5 py-1 bg-primary text-on-primary rounded text-[11px] font-bold hover:bg-primary-container shadow-sm transition-colors"
                                                    title="Mark Verified"
                                                >
                                                    Verify
                                                </button>
                                            )}
                                            <button
                                                onClick={() => showToast(`Viewing artifact: ${doc.title || doc.fileUrl}`, 'info')}
                                                className="p-1.5 hover:bg-surface-container rounded text-on-surface-variant hover:text-primary transition-colors"
                                                title="View"
                                            >
                                                <Eye size={15} />
                                            </button>
                                            <button
                                                onClick={() => showToast(`Downloading signed copy of: ${doc.title || doc.fileUrl}`, 'info')}
                                                className="p-1.5 hover:bg-surface-container rounded text-on-surface-variant hover:text-primary transition-colors"
                                                title="Download"
                                            >
                                                <Download size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Upload Modal */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-level-4">
                        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
                            <h3 className="font-display font-bold text-base text-on-surface flex items-center gap-2">
                                <UploadCloud className="text-primary" size={18} /> Submit Evidence Artifact
                            </h3>
                            <button onClick={() => setIsUploadModalOpen(false)} className="text-on-surface-variant hover:text-on-surface font-bold text-sm">✕</button>
                        </div>

                        <form onSubmit={handleUpload} className="space-y-3.5 text-xs">
                            <div>
                                <label className="block font-bold text-on-surface-variant uppercase mb-1">Target Pilot Project</label>
                                <select
                                    value={selectedPilotId}
                                    onChange={(e) => setSelectedPilotId(e.target.value)}
                                    className="w-full bg-surface-container border border-outline-variant/50 rounded-lg p-2.5 font-semibold text-on-surface focus:outline-none"
                                    required
                                >
                                    {pilots.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.startup?.name} — {p.challenge?.title?.slice(0, 25)}...
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block font-bold text-on-surface-variant uppercase mb-1">Evidence Title</label>
                                <input
                                    type="text"
                                    value={evidenceTitle}
                                    onChange={(e) => setEvidenceTitle(e.target.value)}
                                    placeholder="e.g. IoT Sensor Telemetry Logs Q1"
                                    className="w-full bg-surface-container border border-outline-variant/50 rounded-lg p-2.5 font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-on-surface-variant uppercase mb-1">Artifact Type</label>
                                <select
                                    value={evidenceType}
                                    onChange={(e) => setEvidenceType(e.target.value)}
                                    className="w-full bg-surface-container border border-outline-variant/50 rounded-lg p-2.5 font-semibold focus:outline-none"
                                >
                                    <option value="Telemetry Dataset">Telemetry Dataset</option>
                                    <option value="Pilot Report">Pilot Report</option>
                                    <option value="Affidavit / Clinical Sign-off">Affidavit / Clinical Sign-off</option>
                                    <option value="Citizen Satisfaction Survey">Citizen Satisfaction Survey</option>
                                    <option value="Security Audit Certificate">Security Audit Certificate</option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-bold text-on-surface-variant uppercase mb-1">Description / Methodology</label>
                                <textarea
                                    rows={3}
                                    value={evidenceDesc}
                                    onChange={(e) => setEvidenceDesc(e.target.value)}
                                    placeholder="Explain how telemetry was sampled and cryptographic hashes computed..."
                                    className="w-full bg-surface-container border border-outline-variant/50 rounded-lg p-2.5 font-medium focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                                />
                            </div>

                            <div className="pt-3 border-t border-outline-variant/30 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsUploadModalOpen(false)}
                                    className="px-4 py-2 font-bold text-on-surface-variant hover:bg-surface-container rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading || !evidenceTitle.trim()}
                                    className="px-5 py-2 font-bold bg-primary text-on-primary hover:bg-primary-container rounded-lg shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                                >
                                    {uploading ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />} Upload to Vault
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
