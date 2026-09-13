import { ArrowLeft, Target, Calendar, Wallet, FileText, CheckCircle2, Loader2 } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../lib/api";

export default function ChallengeDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ch, setCh] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);

    useEffect(() => {
        if (!id) return;
        api.get(`/challenges/${id}`)
            .then(res => setCh(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    const handleApply = async () => {
        setApplying(true);
        try {
            await api.post(`/challenges/${id}/apply`);
            alert("Application Submitted Successfully!");
            navigate('/pilots');
        } catch (e) {
            console.error(e);
            alert("Failed to submit application");
        } finally {
            setApplying(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto p-12 text-center text-on-surface-variant flex items-center justify-center gap-2">
                <Loader2 className="animate-spin text-primary" size={24} /> Loading Challenge...
            </div>
        );
    }
    if (!ch) {
        return (
            <div className="max-w-6xl mx-auto p-12 text-center text-on-surface flex items-center justify-center">
                Challenge not found.
            </div>
        );
    }

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const isStartup = user?.role?.name === 'Startup';


    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300 pb-16">

            <div className="flex items-center justify-between">
                <Link to="/challenges" className="flex items-center gap-2 text-on-surface-variant hover:text-primary font-semibold text-sm transition-colors">
                    <ArrowLeft size={16} /> Back to Repository
                </Link>
                <span className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    {ch.status}
                </span>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm">
                {/* Header Hero */}
                <div className="p-8 border-b border-outline-variant/30 bg-gradient-to-r from-surface-container-low to-surface-container-lowest">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="space-y-4">
                            <div>
                                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider bg-surface-container px-2 py-1 rounded-md mb-3 inline-block">
                                    {ch.department ? ch.department.name : 'Unknown Department'}
                                </span>
                                <h1 className="text-3xl font-display font-bold text-on-surface leading-tight">{ch.title}</h1>
                            </div>
                            <p className="text-on-surface-variant max-w-2xl font-medium leading-relaxed">
                                {ch.description || "Deploying a telemetry-based dynamic routing system to ensure zero overflow events and lowering total municipal vehicle dispatch mileage across the zone."}
                            </p>
                        </div>
                        {/* Quick Stats Block */}
                        <div className="shrink-0 flex items-center gap-3 bg-surface-container border border-outline-variant/50 rounded-lg p-1.5">
                            <div className="px-4 py-3 bg-surface-container-lowest rounded-md text-center shadow-sm">
                                <div className="text-2xl font-display font-bold text-primary">{ch.applicationsCount}</div>
                                <div className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider mt-1">Applications</div>
                            </div>
                            <div className="px-4 py-3 bg-surface-container-lowest rounded-md text-center shadow-sm">
                                <div className="text-2xl font-display font-bold text-primary">{ch.applications?.length || 0}</div>
                                <div className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider mt-1">Duration</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Bar */}
                <div className="px-8 py-4 bg-surface-container-lowest flex items-center justify-between border-b border-outline-variant/30">
                    <div className="flex gap-4">
                        {['Overview', 'Requirements', 'KPIs', 'Applications', 'Evaluation', 'Audit'].map((tab, i) => (
                            <button key={i} className={`font-semibold text-sm pb-4 -mb-4 border-b-2 transition-colors ${i === 0 ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}>
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-4 border border-secondary-fixed/50 bg-secondary-fixed/10 pl-4 p-1 rounded-lg">
                        <div className="text-sm font-semibold">
                            <span className="text-on-surface-variant mr-2">Next Action:</span>
                            <span className="text-on-surface">{isStartup ? 'Submit Application' : 'Review Solutions'}</span>
                        </div>
                        {isStartup ? (
                            <button onClick={handleApply} disabled={applying} className="bg-primary text-on-primary px-4 py-2 rounded-md font-bold text-sm shadow-sm hover:bg-primary-container disabled:opacity-50 transition-colors flex items-center gap-2">
                                {applying ? <Loader2 size={16} className="animate-spin" /> : <Target size={16} />}
                                Apply to Pilot
                            </button>
                        ) : (
                            <Link to="/discover" className="bg-secondary text-on-secondary px-4 py-2 rounded-md font-bold text-sm shadow-sm hover:bg-secondary-container transition-colors">
                                Review Solutions
                            </Link>
                        )}
                    </div>
                </div>

                {/* Body content */}
                <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

                    <div className="col-span-2 space-y-8">
                        <section className="space-y-4">
                            <h3 className="text-lg font-bold flex items-center gap-2"><Target className="text-primary" /> Target Outcome</h3>
                            <div className="bg-surface-container border border-outline-variant/30 p-5 rounded-lg flex flex-col md:flex-row gap-6 items-center">
                                <div className="flex-1 text-center border-r border-outline-variant/30 pr-6">
                                    <div className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">Baseline</div>
                                    <div className="text-xl font-mono font-medium">₹25L/month</div>
                                </div>
                                <div className="flex-1 text-center">
                                    <div className="text-sm font-bold text-secondary uppercase tracking-wider mb-2">Required Target</div>
                                    <div className="text-2xl font-mono font-bold text-secondary">{ch.targetValue || "TBD"}</div>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-lg font-bold flex items-center gap-2"><CheckCircle2 className="text-primary" /> Success Key Performance Indicators</h3>
                            <ul className="space-y-3 bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-5">
                                {['Vehicle Mileage Reduced (%)', 'Overflow Index (%)', 'Sensor Uptime (%)', 'Citizen App Response Time'].map((k, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-primary-container text-primary flex items-center justify-center font-bold text-xs">{i + 1}</div>
                                        <span className="font-medium text-sm">{k}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-surface-container border border-outline-variant/30 p-5 rounded-lg space-y-5">
                            <h3 className="font-bold border-b border-outline-variant/30 pb-3">Procurement Specs</h3>

                            <div className="flex items-start gap-3">
                                <Wallet className="text-on-surface-variant shrink-0 mt-0.5" size={18} />
                                <div>
                                    <div className="text-xs font-bold text-on-surface-variant uppercase">Max Pilot Budget</div>
                                    <div className="font-mono font-bold mt-0.5">{ch.budget}</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Calendar className="text-on-surface-variant shrink-0 mt-0.5" size={18} />
                                <div>
                                    <div className="text-xs font-bold text-on-surface-variant uppercase">Launch Deadline</div>
                                    <div className="font-medium mt-0.5">3 Months</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <FileText className="text-on-surface-variant shrink-0 mt-0.5" size={18} />
                                <div>
                                    <div className="text-xs font-bold text-on-surface-variant uppercase">Validation Protocol</div>
                                    <div className="font-medium mt-0.5">Independent IoT Audit</div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
