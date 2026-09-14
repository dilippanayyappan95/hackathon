import { Search, ShieldCheck, User, LogOut, ChevronDown, Check } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DEMO_ROLES = [
    { name: 'Dr. Rajesh Varma', email: 'gov@demo.com', role: 'Government Officer', label: 'Government Officer (Health Innovation)', dept: 'Health Innovation Dept' },
    { name: 'C. Sharma', email: 'officer.urban@demo.com', role: 'Government Officer', label: 'Government Officer (Urban Innovation)', dept: 'Urban Innovation Dept' },
    { name: 'Vikram Mehta', email: 'founder@medflow.com', role: 'Startup', label: 'Startup Founder (MedFlow AI)', dept: 'MedFlow AI (DPIIT #89231)' },
    { name: 'Dr. Arvind Kulkarni', email: 'expert@demo.com', role: 'Expert', label: 'Expert Panelist (Dr. A. Kulkarni)', dept: 'State Review Board' },
    { name: 'MSIS Audit Authority', email: 'validator@demo.com', role: 'Validator', label: 'Sovereign Validator (MSIS Audit)', dept: 'State Audit Authority' },
    { name: 'P. Deshmukh', email: 'procurement@demo.com', role: 'Procurement Officer', label: 'Procurement Officer (P. Deshmukh)', dept: 'Procurement Directorate' },
];

export default function Navbar() {
    const navigate = useNavigate();
    const { user, loginDemo, logout } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const roleMenuRef = useRef<HTMLDivElement>(null);
    const profileMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (roleMenuRef.current && !roleMenuRef.current.contains(event.target as Node)) {
                setIsRoleDropdownOpen(false);
            }
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSwitchRole = async (demo: typeof DEMO_ROLES[0]) => {
        try {
            const switchedUser = await loginDemo(demo.email);
            setIsRoleDropdownOpen(false);
            if (switchedUser.role === 'Startup') {
                navigate('/startup-dashboard');
            } else {
                navigate('/government-dashboard');
            }
        } catch (e) {
            console.error('Failed to switch demo persona', e);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/challenges?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <nav className="h-16 flex items-center justify-between px-6 bg-surface-container-lowest border-b border-outline-variant/30 sticky top-0 z-50 shadow-sm">
            {/* Logo */}
            <div className="flex items-center gap-4">
                <Link to={user?.role === 'Startup' ? '/startup-dashboard' : '/'} className="flex items-center gap-3 group">
                    <div className="flex items-center justify-center p-2 bg-primary text-on-primary rounded-lg shadow-sm group-hover:bg-primary-container transition-colors">
                        <ShieldCheck size={22} className="text-tertiary-fixed" />
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-xl font-bold font-display text-primary tracking-tight">GovProof</span>
                            <span className="text-[10px] font-mono uppercase bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold">SOVEREIGN</span>
                        </div>
                        <p className="text-[10px] text-on-surface-variant font-medium tracking-wide uppercase">Innovation Validation Platform</p>
                    </div>
                </Link>
            </div>

            {/* Center Search Bar */}
            <form onSubmit={handleSearch} className="relative hidden md:block w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size={16} />
                <input
                    id="navbar-search"
                    name="search"
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search challenges, startups, pilot records..."
                    className="w-full pl-9 pr-4 py-2 bg-surface-container rounded-lg border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-secondary/50 text-xs transition-all"
                />
            </form>

            {/* Right Controls */}
            <div className="flex items-center gap-3">
                {/* Demo Role Quick Switcher */}
                <div className="relative" ref={roleMenuRef}>
                    <button
                        type="button"
                        onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                        className="flex items-center gap-2 bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/60 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs"
                        title="Quick Switch Demo Persona (Demo Mode)"
                    >
                        <span className="text-[9px] font-mono tracking-wider uppercase bg-secondary/15 text-secondary border border-secondary/30 px-1.5 py-0.5 rounded font-extrabold">
                            DEMO MODE
                        </span>
                        <span className="text-primary font-bold">{user?.role || 'Switch Role'}</span>
                        <ChevronDown size={14} className="text-on-surface-variant" />
                    </button>

                    {isRoleDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-72 bg-surface-container-lowest border border-outline-variant/40 rounded-xl shadow-level-3 p-2 z-50 animate-in fade-in zoom-in-95">
                            <div className="px-3 py-2 border-b border-outline-variant/30 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center justify-between">
                                <span>Switch Demo Persona</span>
                                <span className="text-[9px] font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded">DEMO MODE</span>
                            </div>
                            <div className="py-1 space-y-1 max-h-80 overflow-y-auto">
                                {DEMO_ROLES.map((demo, idx) => {
                                    const isCurrent = user?.email === demo.email;
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleSwitchRole(demo)}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                                                isCurrent ? 'bg-primary text-on-primary font-bold' : 'hover:bg-surface-container text-on-surface font-medium'
                                            }`}
                                        >
                                            <div>
                                                <div className="font-bold">{demo.label}</div>
                                                <div className={`text-[10px] ${isCurrent ? 'text-primary-fixed-dim' : 'text-on-surface-variant'}`}>{demo.dept}</div>
                                            </div>
                                            {isCurrent && <Check size={14} />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <div className="h-6 w-px bg-outline-variant/40 hidden sm:block"></div>

                {/* User Profile Pill */}
                <div className="relative" ref={profileMenuRef}>
                    <button
                        type="button"
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-2 hover:bg-surface-container p-1.5 pr-3 rounded-full border border-outline-variant/30 transition-colors"
                    >
                        <div className="h-7 w-7 bg-primary text-on-primary flex items-center justify-center rounded-full text-xs font-bold shadow-sm">
                            <User size={14} />
                        </div>
                        <div className="hidden lg:block text-left">
                            <p className="text-xs font-bold text-on-surface leading-none">{user?.name || 'Authorized User'}</p>
                            <p className="text-[10px] text-on-surface-variant tracking-wider uppercase leading-none mt-1">
                                {user?.department || user?.startup || user?.role || 'GovProof Core'}
                            </p>
                        </div>
                        <ChevronDown size={14} className="text-on-surface-variant" />
                    </button>

                    {isProfileOpen && (
                        <div className="absolute right-0 mt-2 w-64 bg-surface-container-lowest border border-outline-variant/40 rounded-xl shadow-level-3 p-3 z-50 animate-in fade-in zoom-in-95">
                            <div className="pb-3 border-b border-outline-variant/30">
                                <p className="text-sm font-bold text-on-surface">{user?.name}</p>
                                <p className="text-xs text-on-surface-variant">{user?.email}</p>
                                <div className="mt-2 inline-block bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold uppercase px-2 py-0.5 rounded">
                                    {user?.role}
                                </div>
                            </div>
                            <div className="pt-2 space-y-1 text-xs">
                                <Link
                                    to="/settings"
                                    onClick={() => setIsProfileOpen(false)}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-on-surface-variant hover:bg-surface-container transition-colors"
                                >
                                    Platform Settings & Profile
                                </Link>
                                <button
                                    onClick={logout}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-error hover:bg-error-container/40 transition-colors"
                                >
                                    <LogOut size={14} /> Sign Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
