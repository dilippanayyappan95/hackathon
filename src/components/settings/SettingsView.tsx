import { Settings, ShieldCheck, User, Database, Lock, Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../../lib/api';

export default function SettingsView() {
    const [user, setUser] = useState<any>(null);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) {
            try {
                setUser(JSON.parse(stored));
            } catch {
                setUser(null);
            }
        }

        api.get('/audit')
            .then(res => setAuditLogs(res.data))
            .catch(console.error);
    }, []);

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300 pb-16">
            {/* Header */}
            <div className="border-b border-outline-variant/30 pb-4">
                <h1 className="text-2xl font-display font-bold text-on-surface flex items-center gap-2">
                    <Settings className="text-primary" /> Sovereign Platform Settings & Governance
                </h1>
                <p className="text-on-surface-variant font-medium text-xs mt-0.5">
                    Security configuration, statutory authorization roles, cryptographic keys, and immutable audit trails.
                </p>
            </div>

            {/* Profile & Security Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* User Identity Card */}
                <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-lg">
                            <User size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-base text-on-surface">{user?.name || 'Authorized Officer'}</h3>
                            <span className="text-xs text-on-surface-variant">{user?.email}</span>
                        </div>
                    </div>

                    <div className="pt-3 border-t border-outline-variant/20 space-y-2 text-xs">
                        <div className="flex justify-between py-1 border-b border-outline-variant/10">
                            <span className="text-on-surface-variant">Statutory Role:</span>
                            <span className="font-bold text-primary uppercase">{user?.role}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-outline-variant/10">
                            <span className="text-on-surface-variant">Affiliation:</span>
                            <span className="font-semibold text-on-surface">{user?.department || user?.startup || 'State Innovation Directorate'}</span>
                        </div>
                        <div className="flex justify-between py-1">
                            <span className="text-on-surface-variant">Session Status:</span>
                            <span className="font-bold text-tertiary-fixed-variant flex items-center gap-1">
                                <Check size={12} /> Active JWT
                            </span>
                        </div>
                    </div>
                </div>

                {/* Sovereign Security Standards */}
                <div className="md:col-span-2 bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm space-y-4">
                    <h3 className="font-display font-bold text-base text-on-surface flex items-center gap-2 border-b border-outline-variant/20 pb-3">
                        <ShieldCheck size={18} className="text-primary" /> Sovereign Testbed Cryptographic Assurance
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-3.5 bg-surface-container rounded-lg border border-outline-variant/20 space-y-1">
                            <span className="font-bold text-on-surface flex items-center gap-1.5">
                                <Lock size={14} className="text-primary" /> Data Residency
                            </span>
                            <p className="text-on-surface-variant text-[11px] leading-relaxed">
                                Sovereign cloud VPC located within Indian jurisdiction (MeitY Empaneled Data Center).
                            </p>
                        </div>

                        <div className="p-3.5 bg-surface-container rounded-lg border border-outline-variant/20 space-y-1">
                            <span className="font-bold text-on-surface flex items-center gap-1.5">
                                <Database size={14} className="text-secondary" /> Proof Passport Ledger
                            </span>
                            <p className="text-on-surface-variant text-[11px] leading-relaxed">
                                Immutable SHA-256 telemetry hashes prevent post-pilot KPI tampering.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Complete Audit Trail */}
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                    <div>
                        <h3 className="font-display font-bold text-base text-on-surface">Platform Statutory Audit Log</h3>
                        <p className="text-xs text-on-surface-variant font-medium">Immutable log of challenges, evaluations, validations, and scale decisions.</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-on-surface-variant">
                        {auditLogs.length} Records
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-surface-container text-on-surface-variant font-bold text-[10px] uppercase tracking-wider">
                            <tr>
                                <th className="p-3">Action Identifier</th>
                                <th className="p-3">Entity</th>
                                <th className="p-3">Authorizing User</th>
                                <th className="p-3">Details / Snapshot</th>
                                <th className="p-3 text-right">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/20">
                            {auditLogs.map((log: any, idx: number) => (
                                <tr key={idx} className="hover:bg-surface-container-low transition-colors">
                                    <td className="p-3 font-mono font-bold text-primary">{log.action}</td>
                                    <td className="p-3 font-semibold text-on-surface">{log.entity}</td>
                                    <td className="p-3 text-on-surface-variant">{log.user?.name || log.user?.email || 'System'}</td>
                                    <td className="p-3 text-on-surface font-medium max-w-sm truncate">{log.details || 'System event'}</td>
                                    <td className="p-3 font-mono text-[11px] text-on-surface-variant text-right">
                                        {new Date(log.timestamp).toLocaleString()}
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
