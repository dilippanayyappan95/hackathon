import { useState } from "react";
import { ArrowRight, Bot, Target, FileText, CheckCircle2, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../lib/api";
import { useToast } from "../../context/ToastContext";

const STEPS = [
    "Problem & Outcome",
    "Metrics & Baseline",
    "Eligibility & Requirements",
    "Review & Publish"
];

const DEPARTMENTS = [
    "Maharashtra Urban Innovation Department",
    "Maharashtra Health Innovation Department",
    "Maharashtra Education Innovation Department",
    "Maharashtra Water & Infrastructure Department"
];

export default function CreateChallenge() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [currentStep, setCurrentStep] = useState(0);
    const [title, setTitle] = useState('');
    const [problemStatement, setProblemStatement] = useState('');
    const [department, setDepartment] = useState(DEPARTMENTS[0]);
    const [category, setCategory] = useState('Healthcare');
    const [baselineValue, setBaselineValue] = useState('');
    const [targetValue, setTargetValue] = useState('');
    const [budget, setBudget] = useState('₹25,00,000');
    const [timeline, setTimeline] = useState('6 Months');
    const [location, setLocation] = useState('Municipal Sandbox');
    const [loading, setLoading] = useState(false);

    const handlePublish = async () => {
        if (!title.trim()) {
            return showToast('Please enter a challenge title', 'warning');
        }
        setLoading(true);
        try {
            await api.post('/challenges', {
                title,
                problemStatement: problemStatement || title,
                description: problemStatement || title,
                category,
                budget,
                timeline,
                targetValue,
                baselineValue,
                location,
                status: 'PUBLISHED'
            });
            showToast("Challenge Published Successfully!", 'success');
            navigate('/challenges');
        } catch (e: any) {
            console.error(e);
            showToast(e.response?.data?.error || "Failed to publish challenge", 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300 pb-16">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
                <div>
                    <h1 className="text-2xl font-display font-bold text-on-surface">Publish Innovation Challenge</h1>
                    <p className="text-on-surface-variant font-medium text-xs mt-0.5">
                        Configure statutory parameters and target KPI metrics for state sandbox testing.
                    </p>
                </div>
                <Link
                    to="/challenges/new/ai"
                    className="flex items-center gap-1.5 bg-secondary/10 text-secondary border border-secondary/30 font-bold py-2 px-3.5 rounded-lg text-xs hover:bg-secondary/20 transition-all"
                >
                    <Bot size={16} /> Draft with AI Copilot
                </Link>
            </div>

            {/* Stepper Header */}
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between relative">
                    {STEPS.map((step, idx) => {
                        const isActive = idx === currentStep;
                        const isCompleted = idx < currentStep;
                        return (
                            <div key={idx} className="flex flex-col items-center gap-1.5 flex-1 text-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm transition-all ${
                                    isActive ? 'bg-primary text-on-primary ring-2 ring-primary/30' :
                                    isCompleted ? 'bg-secondary text-on-secondary' :
                                    'bg-surface-container text-on-surface-variant border border-outline-variant/50'
                                }`}>
                                    {isCompleted ? <CheckCircle2 size={16} /> : idx + 1}
                                </div>
                                <span className={`text-[11px] font-bold uppercase tracking-wider ${isActive ? 'text-primary' : 'text-on-surface-variant opacity-80'}`}>
                                    {step}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Wizard Form Body */}
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm p-6 lg:p-8">
                {currentStep === 0 && (
                    <div className="space-y-4 animate-in slide-in-from-right-4">
                        <h3 className="text-base font-bold text-on-surface flex items-center gap-2 mb-4">
                            <FileText className="text-primary" size={18} /> Step 1: Define Problem & Department
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="challenge-title" className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Challenge Title</label>
                                <input
                                    id="challenge-title"
                                    name="title"
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Hospital Waiting Time Reduction & Patient Queue Orchestration"
                                    className="w-full bg-surface-container border border-outline-variant/50 rounded-lg p-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="challenge-department" className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Operating Department</label>
                                    <select
                                        id="challenge-department"
                                        name="department"
                                        value={department}
                                        onChange={(e) => setDepartment(e.target.value)}
                                        className="w-full bg-surface-container border border-outline-variant/50 rounded-lg p-2.5 text-xs font-semibold focus:outline-none"
                                    >
                                        {DEPARTMENTS.map((d, i) => (
                                            <option key={i} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="challenge-category" className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Innovation Domain</label>
                                    <select
                                        id="challenge-category"
                                        name="category"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full bg-surface-container border border-outline-variant/50 rounded-lg p-2.5 text-xs font-semibold focus:outline-none"
                                    >
                                        <option value="Healthcare">Healthcare</option>
                                        <option value="Waste Management">Waste Management</option>
                                        <option value="Water Management">Water & Infrastructure</option>
                                        <option value="Education">Education</option>
                                        <option value="Infrastructure">Smart Road Infrastructure</option>
                                        <option value="GovTech">GovTech</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="challenge-problem" className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Problem Statement Formulation</label>
                                <textarea
                                    id="challenge-problem"
                                    name="problemStatement"
                                    rows={4}
                                    value={problemStatement}
                                    onChange={(e) => setProblemStatement(e.target.value)}
                                    placeholder="Describe the existing baseline operational constraint, latency, or OPEX bloat..."
                                    className="w-full bg-surface-container border border-outline-variant/50 rounded-lg p-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 1 && (
                    <div className="space-y-4 animate-in slide-in-from-right-4">
                        <h3 className="text-base font-bold text-on-surface flex items-center gap-2 mb-4">
                            <Target className="text-primary" size={18} /> Step 2: Target KPIs & Budget
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="challenge-baseline" className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Baseline Constraint Metric</label>
                                <input
                                    id="challenge-baseline"
                                    name="baselineValue"
                                    type="text"
                                    value={baselineValue}
                                    onChange={(e) => setBaselineValue(e.target.value)}
                                    placeholder="e.g. 90 minutes average wait time"
                                    className="w-full bg-surface-container border border-outline-variant/50 rounded-lg p-3 text-xs font-medium focus:outline-none"
                                />
                            </div>
                            <div>
                                <label htmlFor="challenge-target" className="block text-xs font-bold text-secondary uppercase mb-1">Target Improvement Objective</label>
                                <input
                                    id="challenge-target"
                                    name="targetValue"
                                    type="text"
                                    value={targetValue}
                                    onChange={(e) => setTargetValue(e.target.value)}
                                    placeholder="e.g. 45 minutes average wait time (50% reduction)"
                                    className="w-full bg-surface-container border border-outline-variant/50 rounded-lg p-3 text-xs font-mono font-bold text-secondary focus:outline-none"
                                />
                            </div>
                            <div>
                                <label htmlFor="challenge-budget" className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Allocated Pilot Budget (₹)</label>
                                <input
                                    id="challenge-budget"
                                    name="budget"
                                    type="text"
                                    value={budget}
                                    onChange={(e) => setBudget(e.target.value)}
                                    placeholder="e.g. ₹25,00,000"
                                    className="w-full bg-surface-container border border-outline-variant/50 rounded-lg p-3 text-xs font-medium focus:outline-none"
                                />
                            </div>
                            <div>
                                <label htmlFor="challenge-timeline" className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Pilot Duration</label>
                                <select
                                    id="challenge-timeline"
                                    name="timeline"
                                    value={timeline}
                                    onChange={(e) => setTimeline(e.target.value)}
                                    className="w-full bg-surface-container border border-outline-variant/50 rounded-lg p-3 text-xs font-medium focus:outline-none"
                                >
                                    <option value="3 Months">3 Months</option>
                                    <option value="6 Months">6 Months</option>
                                    <option value="12 Months">12 Months</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="space-y-4 animate-in slide-in-from-right-4">
                        <h3 className="text-base font-bold text-on-surface flex items-center gap-2 mb-4">
                            <CheckCircle2 className="text-primary" size={18} /> Step 3: Eligibility & Sandbox Location
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="challenge-location" className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Pilot Sandbox Location</label>
                                <input
                                    id="challenge-location"
                                    name="location"
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="e.g. Mumbai General District Hospital (OPD Block A)"
                                    className="w-full bg-surface-container border border-outline-variant/50 rounded-lg p-3 text-xs font-medium focus:outline-none"
                                />
                            </div>
                            <div className="p-4 bg-surface-container rounded-lg border border-outline-variant/30 space-y-2">
                                <span className="text-xs font-bold text-on-surface">Standard Statutory Inclusions:</span>
                                <ul className="text-xs text-on-surface-variant space-y-1.5 list-disc pl-4 font-medium">
                                    <li>Direct departmental API telemetry integration without vendor lock-in</li>
                                    <li>Indian sovereign cloud data residency (MeitY empaneled)</li>
                                    <li>DPIIT startup recognition and ISO 27001 data governance</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 3 && (
                    <div className="space-y-4 animate-in slide-in-from-right-4">
                        <h3 className="text-base font-bold text-on-surface mb-3">Step 4: Review & Publish Challenge</h3>
                        <div className="bg-surface-container p-5 rounded-xl border border-outline-variant/30 space-y-3">
                            <h4 className="font-display font-bold text-lg text-primary">{title || "Untitled Challenge"}</h4>
                            <p className="text-xs text-on-surface-variant font-medium">{problemStatement}</p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-outline-variant/20 text-xs">
                                <div><span className="text-on-surface-variant">Dept:</span> <strong className="block">{department.replace('Maharashtra ', '')}</strong></div>
                                <div><span className="text-on-surface-variant">Target:</span> <strong className="block text-secondary">{targetValue || 'TBD'}</strong></div>
                                <div><span className="text-on-surface-variant">Budget:</span> <strong className="block font-mono">{budget}</strong></div>
                                <div><span className="text-on-surface-variant">Timeline:</span> <strong className="block">{timeline}</strong></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Wizard Controls */}
                <div className="mt-8 pt-5 border-t border-outline-variant/30 flex items-center justify-between">
                    <button
                        type="button"
                        disabled={currentStep === 0}
                        onClick={() => setCurrentStep(prev => prev - 1)}
                        className="px-4 py-2 rounded-lg font-bold text-xs text-on-surface-variant border border-outline-variant/50 hover:bg-surface-container disabled:opacity-30 transition-all"
                    >
                        Back
                    </button>

                    {currentStep < STEPS.length - 1 ? (
                        <button
                            type="button"
                            onClick={() => setCurrentStep(prev => prev + 1)}
                            className="flex items-center gap-1.5 bg-primary text-on-primary font-bold py-2 px-5 rounded-lg text-xs shadow-sm hover:bg-primary-container transition-transform active:scale-95"
                        >
                            Next Step <ArrowRight size={14} />
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handlePublish}
                            disabled={loading || !title.trim()}
                            className="flex items-center gap-2 bg-secondary text-on-secondary font-bold py-2.5 px-6 rounded-lg text-xs shadow-sm hover:bg-secondary-container disabled:opacity-50 transition-all"
                        >
                            {loading ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle2 size={14} />} Publish Challenge
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
