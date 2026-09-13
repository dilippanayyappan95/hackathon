import { ShieldCheck, ArrowRight, Lock, Mail, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import api from '../../lib/api';

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('admin@maharashtra.gov.in');
    const [password, setPassword] = useState('password123');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));

            const role = res.data.user.role;
            if (role === 'Startup') {
                navigate('/discover');
            } else {
                navigate('/');
            }
        } catch (_err) {
            setError('Invalid Enterprise Credentials.');
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-background">

            {/* Left Pane - Branding & Proposition */}
            <div className="hidden md:flex flex-col justify-center px-16 lg:px-24 bg-primary text-on-primary relative overflow-hidden">
                {/* Subtle Background Pattern */}
                <div className="absolute inset-0 opacity-5 pointer-events-none">
                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                        </pattern>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                </div>

                <div className="relative z-10 space-y-6 max-w-lg">
                    <div className="w-16 h-16 bg-on-primary text-primary rounded-xl flex items-center justify-center shadow-lg mb-8">
                        <ShieldCheck size={36} />
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-display font-bold tracking-tight leading-tight">
                        GOVPROOF
                    </h1>
                    <h2 className="text-xl lg:text-2xl font-bold text-primary-fixed-dim/90 mb-4 font-display">
                        Government Innovation <span className="text-tertiary-fixed">→</span> Proof <span className="text-tertiary-fixed">→</span> Procurement <span className="text-tertiary-fixed">→</span> Scale
                    </h2>
                    <p className="text-lg text-primary-fixed/80 leading-relaxed font-medium">
                        A structured platform for discovering, testing, validating and scaling innovative solutions for government.
                    </p>

                    <div className="pt-12">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className={`w-10 h-10 rounded-full border-2 border-primary ${i === 1 ? 'bg-surface' : i === 2 ? 'bg-surface-dim' : i === 3 ? 'bg-tertiary-fixed' : 'bg-secondary-fixed'
                                    } flex items-center justify-center text-xs font-bold text-on-surface shadow-sm`}>
                                    P{i}
                                </div>
                            ))}
                            <div className="w-10 h-10 rounded-full border-2 border-primary bg-primary-container flex items-center justify-center text-xs font-bold text-on-primary-container shadow-sm">
                                +12
                            </div>
                        </div>
                        <p className="text-sm font-medium text-primary-fixed-dim mt-4">Used by 12+ State Municipal Departments</p>
                    </div>
                </div>
            </div>

            {/* Right Pane - Authentication Form */}
            <div className="flex flex-col justify-center px-8 sm:px-16 lg:px-32 bg-surface-container-lowest">
                <div className="max-w-md w-full mx-auto space-y-8">
                    <div className="md:hidden flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-primary-container text-on-primary-container rounded-lg flex items-center justify-center shadow-sm">
                            <ShieldCheck size={24} />
                        </div>
                        <h1 className="text-2xl font-display font-bold text-primary tracking-tight">GOVPROOF</h1>
                    </div>

                    <div>
                        <h2 className="text-3xl font-display font-bold text-on-surface tracking-tight mb-2">Secure Gateway</h2>
                        <p className="text-on-surface-variant font-medium">Authenticate to access the sovereign testbed index.</p>
                    </div>

                    <form className="space-y-5 mt-8" onSubmit={handleLogin}>
                        {error && (
                            <div className="bg-error-container text-on-error-container text-sm font-semibold p-3 rounded text-center">
                                {error}
                            </div>
                        )}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-on-surface-variant flex justify-between">
                                Official Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@maharashtra.gov.in"
                                    className="w-full bg-surface-container pl-10 pr-4 py-3 rounded-md border border-outline-variant/50 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary text-sm font-medium text-on-surface placeholder:text-outline transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-on-surface-variant flex justify-between">
                                Password
                                <a href="#" className="font-bold text-secondary hover:text-secondary-container transition-colors">Forgot Password?</a>
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant" size={18} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                    className="w-full bg-surface-container pl-10 pr-4 py-3 rounded-md border border-outline-variant/50 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary text-sm font-medium text-on-surface placeholder:text-outline transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary font-bold py-3 px-4 rounded-md shadow-level-2 hover:bg-primary-container disabled:opacity-50 transition-transform active:scale-[0.98]"
                            >
                                {loading ? <Loader2 className="animate-spin" size={18} /> : <>Sign In to Dashboard <ArrowRight size={18} /></>}
                            </button>
                        </div>
                    </form>

                    <div className="pt-8 text-center text-sm font-medium text-on-surface-variant">
                        <p>Don't have enterprise credentials?</p>
                        <p className="mt-1 text-xs opacity-70">Contact your departmental nodal officer for access provisioning.</p>
                    </div>
                </div>
            </div>

        </div>
    );
}
