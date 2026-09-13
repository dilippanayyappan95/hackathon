import { Bell, Search, ShieldCheck, User } from 'lucide-react';

export default function Navbar() {
    return (
        <nav className="h-16 flex items-center justify-between px-6 bg-surface-container-lowest border-b border-outline-variant/30 sticky top-0 z-50">
            <div className="flex items-center gap-4">
                <div className="flex items-center justify-center p-2 bg-primary-container text-on-primary-container rounded-md">
                    <ShieldCheck size={24} />
                </div>
                <div>
                    <h1 className="text-xl font-bold font-display text-primary tracking-tight">GovProof</h1>
                    <p className="text-xs text-on-surface-variant font-medium tracking-wide uppercase">Innovation Procurement Ledger</p>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size={18} />
                    <input
                        type="text"
                        placeholder="Search tender IDs, compliant bids..."
                        className="pl-10 pr-4 py-2 bg-surface-container w-80 rounded-md border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary/50 text-sm transition-all"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <button className="p-2 relative text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors">
                        <Bell size={20} />
                        <span className="absolute top-1.5 right-2 w-2 h-2 bg-error rounded-full ring-2 ring-surface-container-lowest"></span>
                    </button>

                    <div className="h-8 w-px bg-outline-variant/40"></div>

                    <button className="flex items-center gap-2 hover:bg-surface-container-high p-1 pr-3 rounded-full border border-surface-container-high transition-colors">
                        <div className="h-8 w-8 bg-surface-tint flex items-center justify-center rounded-full text-white text-sm font-medium shadow-level-2">
                            <User size={16} />
                        </div>
                        <div className="hidden lg:block text-left">
                            <p className="text-xs font-bold text-on-surface leading-none mb-1">C. Sharma</p>
                            <p className="text-[10px] text-on-surface-variant tracking-wider uppercase leading-none">Dept of Urban Dev</p>
                        </div>
                    </button>
                </div>
            </div>
        </nav>
    );
}
