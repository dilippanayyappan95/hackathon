import { useState } from "react";
import { ArrowRight, Bot, Target, FileText, CheckCircle2, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../lib/api";

const STEPS = [
    "Problem & Outcome",
    "Metrics & Budget",
    "Eligibility",
    "Evaluation",
    "Review & Publish"
];

export default function CreateChallenge() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [targetValue, setTargetValue] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePublish = async () => {
        setLoading(true);
        try {
            // Using a hardcoded department mapped in Seed for demo purposes if not strictly selected
            // Actual auth token in interceptor will safely log the audit trail
            await api.post('/challenges', {
                title,
                description,
                targetValue
            });
            navigate('/challenges');
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-display font-bold text-on-surface">Publish New Challenge</h1>
                    <p className="text-on-surface-variant font-medium text-sm mt-1">Configure parameters for sovereign innovation procurement</p>
                </div>
                <Link to="/challenges/new/ai" className="flex items-center gap-2 bg-secondary-container/50 text-secondary font-bold py-2 px-4 rounded-md hover:bg-secondary-container transition-colors text-sm">
                    <Bot size={18} /> Draft with AI Copilot
                </Link>
            </div>

            {/* Stepper */}
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm overflow-x-auto">
                <div className="flex items-center justify-between min-w-[600px] relative">
                    <div className="absolute top-1/2 left-0 w-full h-[2px] bg-outline-variant/30 -translate-y-1/2 z-0"></div>
                    {STEPS.map((step, idx) => {
                        const isActive = idx === currentStep;
                        const isCompleted = idx < currentStep;
                        return (
                            <div key={idx} className="relative z-10 flex flex-col items-center gap-2">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-colors ${isActive ? 'bg-primary text-on-primary border-2 border-primary' :
                                    isCompleted ? 'bg-secondary text-on-secondary border-2 border-secondary' :
                                        'bg-surface-container text-outline border-2 border-outline-variant/50'
                                    }`}>
                                    {isCompleted ? <CheckCircle2 size={18} /> : idx + 1}
                                </div>
                                <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>{step}</span>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Form Content */}
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm p-6 lg:p-8">

                {currentStep === 0 && (
                    <div className="space-y-6 animate-in slide-in-from-right-4">
                        <h3 className="text-lg font-display font-bold text-on-surface flex items-center gap-2 mb-6">
                            <FileText className="text-primary" /> Define Problem & Desired Outcome
                        </h3>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-on-surface-variant">Challenge Title</label>
                                <input value={title} onChange={(e) => setTitle(e.target.value)} type="text" placeholder="e.g. Smart Waste Collection Optimization" className="w-full bg-surface-container border border-outline-variant/50 rounded-md p-3 focus:outline-none focus:ring-1 focus:ring-primary font-medium" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-on-surface-variant">Detailed Problem Statement</label>
                                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Describe the current baseline constraints..." className="w-full bg-surface-container border border-outline-variant/50 rounded-md p-3 focus:outline-none focus:ring-1 focus:ring-primary font-medium resize-none"></textarea>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-on-surface-variant">Operating Department</label>
                                    <select className="w-full bg-surface-container border border-outline-variant/50 rounded-md p-3 focus:outline-none focus:ring-1 focus:ring-primary font-medium">
                                        <option>Maharashtra Urban Innovation Department</option>
                                        <option>Maharashtra Health Innovation Department</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-on-surface-variant">Innovation Domain</label>
                                    <select className="w-full bg-surface-container border border-outline-variant/50 rounded-md p-3 focus:outline-none focus:ring-1 focus:ring-primary font-medium">
                                        <option>Waste Management</option>
                                        <option>Healthcare</option>
                                        <option>Smart City Infrastructure</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 1 && (
                    <div className="space-y-6 animate-in slide-in-from-right-4">
                        <h3 className="text-lg font-display font-bold text-on-surface flex items-center gap-2 mb-6">
                            <Target className="text-primary" /> Core Metrics & Pilot Framework
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-on-surface-variant">Baseline Metric</label>
                                <input type="text" placeholder="e.g. ₹12L/month OPEX" className="w-full bg-surface-container border border-outline-variant/50 rounded-md p-3 font-medium" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-on-surface-variant">Target Improvement</label>
                                <input value={targetValue} onChange={(e) => setTargetValue(e.target.value)} type="text" placeholder="e.g. 20% reduction" className="w-full bg-surface-container border border-outline-variant/50 rounded-md p-3 font-medium" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-on-surface-variant">Pilot Duration</label>
                                <select className="w-full bg-surface-container border border-outline-variant/50 rounded-md p-3 font-medium">
                                    <option>3 Months</option>
                                    <option>6 Months</option>
                                    <option>12 Months</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-on-surface-variant">Allocated Budget (₹)</label>
                                <input type="number" placeholder="2500000" className="w-full bg-surface-container border border-outline-variant/50 rounded-md p-3 font-medium" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Dummy states for next steps simulating wizard progression */}
                {currentStep > 1 && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 py-8 text-center">
                        <div className="w-16 h-16 bg-surface-container mx-auto rounded-full flex items-center justify-center mb-4 text-primary">
                            {currentStep === 4 ? <CheckCircle2 size={32} /> : <FileText size={32} />}
                        </div>
                        <h3 className="text-2xl font-display font-bold text-on-surface">{STEPS[currentStep]} Configuration Loaded</h3>
                        <p className="text-on-surface-variant max-w-md mx-auto">Standard municipal guidelines apply to this section automatically. Please proceed to review.</p>
                    </div>
                )}

                {/* Wizard Controls */}
                <div className="mt-10 pt-6 border-t border-outline-variant/30 flex items-center justify-between">
                    <button
                        disabled={currentStep === 0}
                        onClick={() => setCurrentStep(prev => prev - 1)}
                        className="px-6 py-2.5 rounded-md font-bold text-sm text-on-surface-variant border border-outline-variant/50 hover:bg-surface-container disabled:opacity-30 transition-all"
                    >
                        Back
                    </button>

                    {currentStep < STEPS.length - 1 ? (
                        <button
                            onClick={() => setCurrentStep(prev => prev + 1)}
                            className="flex items-center gap-2 bg-primary text-on-primary font-bold py-2.5 px-6 rounded-md shadow-level-2 hover:bg-primary-container transition-transform active:scale-[0.98] text-sm"
                        >
                            Next Step <ArrowRight size={16} />
                        </button>
                    ) : (
                        <button
                            onClick={handlePublish}
                            disabled={loading || !title}
                            className="flex items-center gap-2 bg-secondary text-on-secondary font-bold py-2.5 px-6 rounded-md shadow-level-2 hover:bg-secondary-container hover:text-on-secondary-container disabled:opacity-50 transition-all text-sm"
                        >
                            {loading ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                            Publish Challenge
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
