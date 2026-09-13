import { AlertCircle, ArrowRight, ShieldAlert } from 'lucide-react';

interface StatutoryAction {
    id: string;
    title: string;
    description: string;
    severity: 'critical' | 'warning' | 'info';
    actionText: string;
    linkTo?: string;
}

import { Link } from 'react-router-dom';

export default function StatutoryActionCard({ items }: { items: StatutoryAction[] }) {
    return (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden shadow-sm">
            <div className="bg-surface-container-low border-b border-outline-variant/30 px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-error">
                    <ShieldAlert size={20} />
                    <h2 className="font-display font-bold text-lg text-on-surface">Needs Statutory Attention</h2>
                </div>
                <span className="bg-error-container text-on-error-container text-xs font-bold px-2.5 py-1 rounded-full">
                    {items.length} Immediate Actions
                </span>
            </div>

            <div className="divide-y divide-outline-variant/20">
                {items.map((item) => (
                    <div key={item.id} className="p-5 hover:bg-surface-container/30 transition-colors group">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    {item.severity === 'critical' ? (
                                        <AlertCircle size={16} className="text-error" />
                                    ) : (
                                        <div className="w-2 h-2 rounded-full bg-error ml-1" />
                                    )}
                                    <h3 className="font-semibold text-on-surface">{item.title}</h3>
                                </div>
                                <p className="text-sm text-on-surface-variant leading-relaxed">
                                    {item.description}
                                </p>
                            </div>

                            <Link to={item.linkTo || "/"} className="flex-shrink-0 flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-md font-medium text-sm hover:bg-primary-container transition-colors shadow-sm active:translate-y-px">
                                {item.actionText}
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
