import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ShieldCheck, ArrowRight, Lock, Mail, Loader2,
    Eye, EyeOff, Building2, UserCheck, Briefcase, Award, Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const DEMO_PERSONAS = [
    {
        name: 'Dr. Rajesh Varma',
        role: 'Government Officer',
        dept: 'Health Innovation Department',
        email: 'gov@demo.com',
        workspace: 'government',
        icon: ShieldCheck,
        color: 'text-primary'
    },
    {
        name: 'Vikram Mehta',
        role: 'Startup Founder',
        dept: 'MedFlow AI (DPIIT #89231)',
        email: 'founder@medflow.com',
        workspace: 'startup',
        icon: Building2,
        color: 'text-tertiary-fixed'
    },
    {
        name: 'Dr. Arvind Kulkarni',
        role: 'Expert Evaluator',
        dept: 'Technical Advisory Board',
        email: 'expert@demo.com',
        workspace: 'government',
        icon: Award,
        color: 'text-secondary'
    },
    {
        name: 'MSIS Audit Authority',
        role: 'Independent Validator',
        dept: 'Sovereign Audit Directorate',
        email: 'validator@demo.com',
        workspace: 'government',
        icon: UserCheck,
        color: 'text-primary'
    },
    {
        name: 'P. Deshmukh',
        role: 'Procurement Officer',
        dept: 'Urban Innovation Directorate',
        email: 'procurement@demo.com',
        workspace: 'government',
        icon: Briefcase,
        color: 'text-secondary'
    }
];

export default function Login() {
    const navigate = useNavigate();
    const { login, loginDemo } = useAuth();

    const [workspace, setWorkspace] = useState<'government' | 'startup'>('government');
    const [email, setEmail] = useState('gov@demo.com');
    const [password, setPassword] = useState('demo123');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleWorkspaceChange = (selected: 'government' | 'startup') => {
        setWorkspace(selected);
        if (selected === 'government') {
            setEmail('gov@demo.com');
            setPassword('demo123');
        } else {
            setEmail('founder@medflow.com');
            setPassword('demo123');
        }
        setError('');
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const user = await login(email, password);
            if (user.role === 'Startup') {
                navigate('/startup-dashboard');
            } else {
                navigate('/government-dashboard');
            }
        } catch {
            setError('Invalid enterprise credentials. Please check your email/password or use a demo persona below.');
        } finally {
            setLoading(false);
        }
    };

    const handleDemoPersona = async (demoEmail: string) => {
        setLoading(true);
        setError('');
        try {
            const user = await loginDemo(demoEmail);
            if (user.role === 'Startup') {
                navigate('/startup-dashboard');
            } else {
                navigate('/government-dashboard');
            }
        } catch {
            setError('Failed to switch demo persona.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-background">
            {/* Left Pane - Sovereign Proposition */}
            <div className="hidden md:flex flex-col justify-center px-12 lg:px-20 bg-primary text-on-primary relative overflow-hidden">
                <div className="absolute inset-0 opacity-5 pointer-events-none">
                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                        </pattern>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                </div>

                <div className="relative z-10 space-y-6 max-w-lg">
                    <div className="w-16 h-16 bg-on-primary text-primary rounded-2xl flex items-center justify-center shadow-lg mb-8">
                        <ShieldCheck size={36} />
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-display font-bold tracking-tight leading-tight">
                        GovProof
                    </h1>
                    <h2 className="text-xl lg:text-2xl font-bold text-primary-fixed-dim/90 mb-4 font-display">
                        Government Innovation <span className="text-tertiary-fixed">→</span> Proof Passport <span className="text-tertiary-fixed">→</span> Scale
                    </h2>
                    <p className="text-base text-primary-fixed/80 leading-relaxed font-medium">
                        Sovereign testbed validation platform helping public departments move from problem statements to verified Proof Passports and fast-track procurement.
                    </p>

                    <div className="pt-8 border-t border-white/10 space-y-2">
                        <div className="flex items-center gap-2 text-sm text-primary-fixed">
                            <Sparkles size={16} className="text-tertiary-fixed" />
                            <span>4 State Departments • 10 Startups • Cryptographic Proof Passports</span>
                        </div>
                        <p className="text-xs text-primary-fixed-dim">Zero fake static numbers — backed 100% by live telemetry and independent validation.</p>
                    </div>
                </div>
            </div>

            {/* Right Pane - Enterprise Login Form */}
            <div className="flex flex-col justify-center px-8 sm:px-12 lg:px-20 bg-surface-container-lowest py-8 overflow-y-auto">
                <div className="max-w-md w-full mx-auto space-y-6">
                    {/* Header */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-mono uppercase bg-primary/10 text-primary px-2 py-0.5 rounded font-bold">
                                SOVEREIGN GATEWAY
                            </span>
                        </div>
                        <h2 className="text-2xl lg:text-3xl font-display font-bold text-on-surface tracking-tight">Enterprise Sign In</h2>
                        <p className="text-xs text-on-surface-variant mt-1">Authenticate to access your authorized innovation workspace.</p>
                    </div>

                    {/* Workspace Selector */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-on-surface-variant">Choose your workspace</label>
                        <div className="grid grid-cols-2 p-1 bg-surface-container rounded-xl border border-outline-variant/30">
                            <button
                                type="button"
                                onClick={() => handleWorkspaceChange('government')}
                                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                                    workspace === 'government'
                                        ? 'bg-primary text-on-primary shadow-sm'
                                        : 'text-on-surface-variant hover:text-on-surface'
                                }`}
                            >
                                <ShieldCheck size={14} /> Government
                            </button>
                            <button
                                type="button"
                                onClick={() => handleWorkspaceChange('startup')}
                                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                                    workspace === 'startup'
                                        ? 'bg-primary text-on-primary shadow-sm'
                                        : 'text-on-surface-variant hover:text-on-surface'
                                }`}
                            >
                                <Building2 size={14} /> Startup
                            </button>
                        </div>
                    </div>

                    {/* Form */}
                    <form className="space-y-4" onSubmit={handleLogin}>
                        {error && (
                            <div className="bg-error-container text-on-error-container text-xs font-semibold p-3 rounded-lg text-center">
                                {error}
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-on-surface-variant">Official Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant" size={16} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={workspace === 'government' ? 'gov@demo.com' : 'founder@medflow.com'}
                                    className="w-full bg-surface-container pl-10 pr-4 py-2.5 rounded-lg border border-outline-variant/50 focus:outline-none focus:border-primary text-xs font-medium text-on-surface"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-on-surface-variant">Password</label>
                                <span className="text-[11px] text-primary font-semibold hover:underline cursor-pointer">
                                    Forgot Password?
                                </span>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant" size={16} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-surface-container pl-10 pr-10 py-2.5 rounded-lg border border-outline-variant/50 focus:outline-none focus:border-primary text-xs font-medium text-on-surface"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant hover:text-on-surface"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="rememberMe"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary"
                            />
                            <label htmlFor="rememberMe" className="text-xs text-on-surface-variant font-medium cursor-pointer">
                                Remember authenticated session
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary font-bold py-2.5 px-4 rounded-lg shadow-sm hover:bg-primary-container disabled:opacity-50 transition-all text-xs"
                        >
                            {loading ? <Loader2 className="animate-spin" size={16} /> : <>Sign In to {workspace === 'government' ? 'Government' : 'Startup'} Workspace <ArrowRight size={16} /></>}
                        </button>
                    </form>

                    {/* 1-Click Demo Persona Shortcuts */}
                    <div className="pt-4 border-t border-outline-variant/20 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-on-surface">1-Click Demo Persona Sign In</span>
                            <span className="text-[10px] text-on-surface-variant font-mono uppercase bg-surface-container px-2 py-0.5 rounded font-bold">
                                Demo Mode
                            </span>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            {DEMO_PERSONAS.map((p, idx) => {
                                const Icon = p.icon;
                                return (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => handleDemoPersona(p.email)}
                                        disabled={loading}
                                        className="flex items-center justify-between p-2.5 rounded-lg border border-outline-variant/30 hover:border-primary bg-surface-container-low hover:bg-surface-container text-left transition-all group"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-7 h-7 rounded-md bg-surface-container-lowest flex items-center justify-center border border-outline-variant/20 group-hover:border-primary/50">
                                                <Icon size={14} className={p.color} />
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-on-surface group-hover:text-primary">{p.name}</div>
                                                <div className="text-[10px] text-on-surface-variant">{p.role} • {p.dept}</div>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                            Log In <ArrowRight size={12} />
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
