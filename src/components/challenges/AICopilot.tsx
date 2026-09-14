import { Bot, Save, ArrowLeft, Send, Sparkles, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../lib/api";
import { useToast } from "../../context/ToastContext";

const DEPARTMENTS = [
    "Maharashtra Urban Innovation Department",
    "Maharashtra Health Innovation Department",
    "Maharashtra Education Innovation Department",
    "Maharashtra Water & Infrastructure Department"
];

export default function AICopilot() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [input, setInput] = useState("");
    const [selectedDept, setSelectedDept] = useState(DEPARTMENTS[1]); // Default Health
    const [selectedCat, setSelectedCat] = useState("Healthcare");
    const [isGenerating, setIsGenerating] = useState(false);
    const [draft, setDraft] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");

    const handleGenerate = async () => {
        if (!input.trim()) return;
        setIsGenerating(true);
        setError("");
        try {
            const response = await api.post('/challenges/ai-copilot', {
                problem: input,
                department: selectedDept,
                category: selectedCat
            });
            setDraft(response.data);
            showToast("Structured Challenge Draft synthesized by AI Copilot", 'success');
        } catch (err: any) {
            console.error("Failed to generate AI Challenge Draft", err);
            const msg = err.response?.data?.error || "Failed to generate draft from AI Copilot. Please check your inputs.";
            setError(msg);
            showToast(msg, 'error');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAcceptAndPublish = async () => {
        if (!draft) return;
        setIsSaving(true);
        try {
            await api.post('/challenges', {
                title: draft.title,
                problemStatement: draft.problemStatement,
                description: draft.suggestedSolution,
                category: draft.category || selectedCat,
                budget: draft.budget,
                timeline: draft.duration,
                targetValue: draft.target,
                baselineValue: draft.baseline,
                requiredCapabilities: draft.requiredCapabilities,
                expectedOutcomes: draft.expectedOutcomes,
                status: 'PUBLISHED',
                kpis: draft.kpis,
                requirements: (draft.requiredCapabilities || []).map((c: string) => ({ description: c, isMandatory: true }))
            });
            showToast("Challenge Published to Sovereign Repository successfully!", 'success');
            navigate('/challenges');
        } catch (err: any) {
            console.error(err);
            showToast(err.response?.data?.error || "Failed to save challenge to repository", 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300 pb-16">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
                <div className="flex items-center gap-3">
                    <Link to="/challenges" className="p-2 border border-outline-variant/50 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors">
                        <ArrowLeft size={16} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-display font-bold text-on-surface flex items-center gap-2">
                            <Bot className="text-secondary" size={24} /> AI Challenge Copilot
                        </h1>
                        <p className="text-on-surface-variant font-medium text-xs mt-0.5">
                            Synthesize unstructured departmental problems into structured innovation procurement challenges.
                        </p>
                    </div>
                </div>
                <Link
                    to="/challenges/new"
                    className="text-xs font-bold text-primary hover:underline"
                >
                    Manual Form Wizard →
                </Link>
            </div>

            {/* Input Form Card */}
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 bg-surface-container-low/50 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Department</label>
                            <select
                                value={selectedDept}
                                onChange={(e) => setSelectedDept(e.target.value)}
                                className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg p-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-secondary"
                            >
                                {DEPARTMENTS.map((d, i) => (
                                    <option key={i} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Category / Domain</label>
                            <select
                                value={selectedCat}
                                onChange={(e) => setSelectedCat(e.target.value)}
                                className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg p-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-secondary"
                            >
                                <option value="Healthcare">Healthcare & Hospital Queuing</option>
                                <option value="Waste Management">Municipal Solid Waste</option>
                                <option value="Water Management">Water & Infrastructure</option>
                                <option value="Education">Education & School Retention</option>
                                <option value="Infrastructure">Smart Road Infrastructure</option>
                                <option value="GovTech">GovTech & Citizen Grievance</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                            Describe the Government Problem / Constraint:
                        </label>
                        <textarea
                            rows={3}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="e.g. Hospital outpatient waiting times in district civil hospitals exceed 90 minutes before doctor consultation, causing severe crowding."
                            className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg p-3 text-xs font-medium text-on-surface focus:ring-2 focus:ring-secondary/50 focus:outline-none transition-all resize-none"
                        />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <span className="text-[11px] text-on-surface-variant flex items-center gap-1">
                            <Sparkles size={12} className="text-secondary" /> AI assisted decision support — human officer approval required
                        </span>
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || !input.trim()}
                            className="flex items-center gap-2 bg-secondary text-on-secondary font-bold py-2 px-5 rounded-lg shadow-sm hover:bg-secondary-container transition-all disabled:opacity-50 text-xs"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" /> Synthesizing...
                                </>
                            ) : (
                                <>
                                    <Send size={14} /> Generate Structured Challenge
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-error-container text-on-error-container text-xs font-bold flex items-center gap-2">
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                {/* Generated Output */}
                {draft && !isGenerating && (
                    <div className="p-6 lg:p-8 space-y-6 animate-in slide-in-from-top-4 duration-300 bg-surface-container-lowest">
                        <div className="bg-tertiary-fixed/20 border border-tertiary-fixed-dim text-on-tertiary-fixed-variant p-3 rounded-lg text-xs font-bold flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                                <CheckCircle2 size={14} className="text-tertiary" /> Synthesized Challenge Draft Generated
                            </span>
                            <span className="text-[10px] uppercase font-mono bg-surface-container px-2 py-0.5 rounded">Ready for Review</span>
                        </div>

                        {/* Title & Problem */}
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Generated Challenge Title</label>
                                <input
                                    type="text"
                                    value={draft.title}
                                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                                    className="w-full font-display font-bold text-xl text-on-surface bg-surface-container p-2.5 rounded-lg border border-outline-variant/40 mt-1"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Baseline Constraint</label>
                                    <textarea
                                        rows={2}
                                        value={draft.baseline}
                                        onChange={(e) => setDraft({ ...draft, baseline: e.target.value })}
                                        className="w-full text-xs font-mono font-medium text-on-surface bg-surface-container p-2.5 rounded-lg border border-outline-variant/40 mt-1 resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-secondary uppercase tracking-wider">Target Objective</label>
                                    <textarea
                                        rows={2}
                                        value={draft.target}
                                        onChange={(e) => setDraft({ ...draft, target: e.target.value })}
                                        className="w-full text-xs font-mono font-bold text-secondary bg-surface-container p-2.5 rounded-lg border border-outline-variant/40 mt-1 resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* KPIs & Specs */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-surface-container p-3.5 rounded-lg">
                                <span className="text-[10px] uppercase font-bold text-on-surface-variant">Allocated Budget</span>
                                <input
                                    type="text"
                                    value={draft.budget}
                                    onChange={(e) => setDraft({ ...draft, budget: e.target.value })}
                                    className="w-full bg-transparent font-mono font-bold text-sm text-on-surface mt-0.5 focus:outline-none"
                                />
                            </div>
                            <div className="bg-surface-container p-3.5 rounded-lg">
                                <span className="text-[10px] uppercase font-bold text-on-surface-variant">Pilot Duration</span>
                                <input
                                    type="text"
                                    value={draft.duration}
                                    onChange={(e) => setDraft({ ...draft, duration: e.target.value })}
                                    className="w-full bg-transparent font-bold text-sm text-on-surface mt-0.5 focus:outline-none"
                                />
                            </div>
                            <div className="bg-surface-container p-3.5 rounded-lg">
                                <span className="text-[10px] uppercase font-bold text-on-surface-variant">Target Domain</span>
                                <div className="font-bold text-sm text-on-surface mt-0.5">{draft.category || selectedCat}</div>
                            </div>
                        </div>

                        {/* KPIs List */}
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Measurable Key Performance Indicators</h4>
                            <div className="space-y-2">
                                {(draft.kpis || []).map((k: any, i: number) => (
                                    <div key={i} className="p-3 bg-surface-container rounded-lg border border-outline-variant/30 flex items-center justify-between text-xs">
                                        <span className="font-bold text-on-surface">{k.name}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="font-mono text-on-surface-variant">Base: {k.baseline}</span>
                                            <span className="font-mono font-bold text-secondary">Target: {k.target}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Required Capabilities */}
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Required Capabilities</h4>
                            <div className="flex flex-wrap gap-2">
                                {(draft.requiredCapabilities || []).map((cap: string, i: number) => (
                                    <span key={i} className="bg-surface-container border border-outline-variant/40 px-2.5 py-1 rounded-md text-xs font-semibold text-on-surface">
                                        ✓ {cap}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-6 border-t border-outline-variant/30 flex items-center justify-between">
                            <button
                                onClick={handleGenerate}
                                className="px-4 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container rounded-lg border border-outline-variant/50 transition-colors"
                            >
                                Regenerate Variations
                            </button>

                            <button
                                onClick={handleAcceptAndPublish}
                                disabled={isSaving}
                                className="flex items-center gap-2 bg-primary text-on-primary font-bold py-2.5 px-6 rounded-lg shadow-sm hover:bg-primary-container transition-all text-xs"
                            >
                                {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Accept & Publish Challenge
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
