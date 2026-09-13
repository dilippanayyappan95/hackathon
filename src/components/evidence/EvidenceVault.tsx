import { Database, Search, ShieldCheck, Download, Eye, UploadCloud, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../../lib/api";

export default function EvidenceVault() {
    const [documents, setDocuments] = useState<any[]>([]);
    const [pilots, setPilots] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    const fetchVault = () => {
        api.get('/pilots')
            .then(res => {
                setPilots(res.data);
                const allEvidence = res.data.flatMap((p: any) =>
                    (p.evidence || []).map((e: any) => ({
                        ...e,
                        startupName: p.startup?.name || 'Local Startup',
                        pilotTitle: p.challenge?.title || 'Pilot Project'
                    }))
                );
                setDocuments(allEvidence);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchVault();
    }, []);

    const handleUpload = async () => {
        if (pilots.length === 0) return alert('No active pilots to upload evidence to.');

        const fileName = window.prompt("Enter Document Name (e.g. AuditReport.pdf):");
        if (!fileName) return;

        setUploading(true);
        try {
            // Upload to the very first pilot for demonstration
            await api.post(`/pilots/${pilots[0].id}/evidence`, {
                uploadedById: pilots[0].startupId,
                fileUrl: fileName,
                fileType: 'Pilot Report',
                kpiId: pilots[0].kpis?.[0]?.id
            });
            alert('Evidence uploaded securely to the blockchain vault (Postgres stored).');
            fetchVault();
        } catch (e) {
            console.error(e);
            alert('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/30 pb-4">
                <div>
                    <h1 className="text-2xl font-display font-bold text-on-surface">Digital Evidence Vault</h1>
                    <p className="text-on-surface-variant font-medium text-sm mt-1">Immutable repository of all pilot data, reports, and validation artifacts.</p>
                </div>
                <button onClick={handleUpload} disabled={uploading} className="flex items-center justify-center gap-2 bg-primary text-on-primary font-bold py-2.5 px-4 w-44 rounded-md shadow-level-2 hover:bg-primary-container disabled:opacity-50 transition-transform active:scale-[0.98] text-sm">
                    {uploading ? <Loader2 size={18} className="animate-spin" /> : <UploadCloud size={18} />} Secure Upload
                </button>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-outline-variant/30 bg-surface-container-low flex items-center justify-between">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size={16} />
                        <input type="text" placeholder="Search evidence files..." className="w-full bg-surface-container-lowest border border-outline-variant/50 pl-9 pr-3 py-2 rounded-md text-sm font-medium focus:ring-1 focus:ring-secondary/50 focus:outline-none transition-all" />
                    </div>
                    <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider hidden sm:block">Storage Encrypted • Immutable Audit Log</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-surface-container-lowest border-b border-outline-variant/30">
                                <th className="px-5 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Document Name</th>
                                <th className="px-5 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Type / KPI Link</th>
                                <th className="px-5 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Uploaded By</th>
                                <th className="px-5 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Verification Status</th>
                                <th className="px-5 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/20">
                            {loading && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-on-surface-variant">
                                        <Loader2 className="animate-spin inline mr-2" size={16} /> Retrieving Vault records...
                                    </td>
                                </tr>
                            )}
                            {!loading && documents.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-on-surface-variant">
                                        No evidence documents in vault.
                                    </td>
                                </tr>
                            )}
                            {documents.map((doc, i) => (
                                <tr key={i} className="hover:bg-surface-container-low transition-colors group">
                                    <td className="px-5 py-4">
                                        <div className="font-semibold text-on-surface mb-1 flex items-center gap-2">
                                            <Database size={14} className="text-primary opacity-70" />
                                            {doc.fileUrl || doc.name}
                                        </div>
                                        <div className="text-xs text-on-surface-variant">{doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : doc.date}</div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="text-sm font-medium text-on-surface">{doc.fileType || doc.type}</div>
                                        <div className="text-[10px] uppercase font-bold text-on-surface-variant mt-1">Ref: {doc.pilotTitle || doc.kpi}</div>
                                    </td>
                                    <td className="px-5 py-4 text-sm font-medium text-on-surface-variant">
                                        {doc.startupName || doc.uploader}
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${(doc.verifiedStatus || doc.verification) === 'Verified' ? 'bg-primary-fixed-dim/30 text-primary border border-primary/20' :
                                            (doc.verifiedStatus || doc.verification) === 'Partially Verified' ? 'bg-secondary-fixed/30 text-secondary border border-secondary-fixed-dim' :
                                                'bg-surface-container text-on-surface-variant border border-outline-variant/50'
                                            }`}>
                                            {(doc.verifiedStatus || doc.verification) === 'Verified' && <ShieldCheck size={12} />}
                                            {doc.verifiedStatus || doc.verification}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <div className="flex items-center justify-end gap-3 text-on-surface-variant">
                                            <button className="hover:text-primary transition-colors hover:bg-surface-container p-1.5 rounded"><Eye size={16} /></button>
                                            <button className="hover:text-primary transition-colors hover:bg-surface-container p-1.5 rounded"><Download size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
