import { Bot, Save, Trash2, ArrowLeft, Send } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/api";

export default function AICopilot() {
    const [input, setInput] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [draft, setDraft] = useState<null | any>(null);

    const handleGenerate = async () => {
        if (!input) return;
        setIsGenerating(true);
        setDraft(null);
        try {
            const response = await api.post('/challenges/ai-copilot', { problem: input });
            setDraft(response.data);
        } catch (error) {
            console.error("Failed to generate AI Challenge Draft", error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">

            <div className="flex items-center gap-4">
                <Link to="/challenges" className="p-2 border border-outline-variant/50 rounded-md hover:bg-surface-container text-on-surface-variant transition-colors">
                    <ArrowLeft size={18} />
                </Link>
                <div>
                    <h1 className="text-2xl font-display font-bold text-on-surface flex items-center gap-2">
                        <Bot className="text-secondary" /> AI Challenge Copilot
                    </h1>
                    <p className="text-on-surface-variant font-medium text-sm mt-1">Accelerate procurement drafting with sovereign dataset intelligence.</p>
                </div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm">

                {/* Input Area */}
                <div className="p-6 border-b border-outline-variant/30 bg-surface-container-low/50">
                    <label className="block text-sm font-semibold text-on-surface mb-2">Describe the departmental obstacle or baseline constraint:</label>
                    <div className="relative">
                        <textarea
                            rows={3}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="e.g. Our city spends too much on waste collection and efficiency is low."
                            className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg p-4 font-medium text-on-surface pb-12 focus:ring-2 focus:ring-secondary/50 focus:outline-none transition-all resize-none"
                        ></textarea>
                        <div className="absolute right-3 bottom-3 flex gap-2">
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating || !input}
                                className="flex items-center gap-2 bg-secondary text-on-secondary font-bold py-1.5 px-4 rounded-md shadow-sm hover:bg-secondary-container hover:text-on-secondary-container transition-all disabled:opacity-50 disabled:pointer-events-none"
                            >
                                {isGenerating ? "Analyzing..." : "Generate Draft"}
                                {!isGenerating && <Send size={16} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {isGenerating && (
                    <div className="p-12 flex flex-col items-center justify-center text-on-surface-variant gap-4">
                        <div className="relative w-12 h-12">
                            <div className="absolute inset-0 border-4 border-surface-variant rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <p className="font-medium animate-pulse">Cross-referencing state procurement guidelines...</p>
                    </div>
                )}

                {/* Results Area */}
                {draft && !isGenerating && (
                    <div className="p-6 bg-surface-container-lowest animate-in slide-in-from-top-4 duration-500">
                        <div className="bg-tertiary-fixed/20 border border-tertiary-fixed text-on-tertiary-fixed-variant p-3 rounded-md text-sm font-semibold mb-6 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Bot size={16} /> AI-generated draft — human review required.
                            </div>
                        </div>

                        <div className="space-y-6">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Problem Statement Formulation</label>
                                    <p className="p-3 bg-surface-container border border-outline-variant/30 rounded-md text-sm font-medium leading-relaxed">
                                        {draft.problem}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Desired Outcome</label>
                                    <p className="p-3 bg-surface-container border border-outline-variant/30 rounded-md text-sm font-medium leading-relaxed">
                                        {draft.outcome}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Baseline</label>
                                    <p className="p-3 bg-surface-container border border-outline-variant/30 rounded-md text-sm font-medium">{draft.baseline}</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Target Metrics</label>
                                    <p className="p-3 bg-surface-container border border-outline-variant/30 rounded-md text-sm font-medium text-tertiary">{draft.target}</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Ideal Pilot Duration</label>
                                    <p className="p-3 bg-surface-container border border-outline-variant/30 rounded-md text-sm font-medium">{draft.duration}</p>
                                </div>
                            </div>

                            <hr className="border-outline-variant/20" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-sm font-bold text-on-surface mb-3">Key Performance Indicators</h4>
                                    <ul className="space-y-2">
                                        {draft.kpis.map((kpi: string, i: number) => (
                                            <li key={i} className="flex items-start gap-2 text-sm font-medium text-on-surface-variant">
                                                <div className="w-1.5 h-1.5 bg-secondary rounded-full mt-1.5 shrink-0"></div> {kpi}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-on-surface mb-3">Identified Risks</h4>
                                    <ul className="space-y-2">
                                        {draft.risks.map((risk: string, i: number) => (
                                            <li key={i} className="flex items-start gap-2 text-sm font-medium text-on-surface-variant">
                                                <div className="w-1.5 h-1.5 bg-error rounded-full mt-1.5 shrink-0"></div> {risk}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                        </div>

                        {/* Action Bar */}
                        <div className="mt-8 pt-4 border-t border-outline-variant/30 flex items-center justify-between">
                            <button className="flex items-center gap-2 text-error font-semibold text-sm hover:bg-error-container/30 px-3 py-2 rounded-md transition-colors">
                                <Trash2 size={16} /> Discard
                            </button>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleGenerate}
                                    className="px-4 py-2 text-on-surface-variant font-bold border border-outline-variant/50 rounded-md hover:bg-surface-container transition-colors text-sm"
                                >
                                    Regenerate
                                </button>
                                <Link to="/challenges/new" className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-md font-bold text-sm shadow-level-2 hover:bg-primary-container transition-colors">
                                    <Save size={16} /> Accept & Proceed to Create
                                </Link>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}
