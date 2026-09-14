import { CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export type WorkflowStage =
    | 'problem'
    | 'challenge'
    | 'discovery'
    | 'evaluation'
    | 'pilot'
    | 'evidence'
    | 'validation'
    | 'passport'
    | 'scale';

interface GovProofWorkflowStepperProps {
    currentStage?: WorkflowStage | number;
    className?: string;
    compact?: boolean;
}

export const WORKFLOW_STAGES = [
    {
        id: 'problem',
        step: 1,
        title: 'Problem',
        subtitle: 'Department Need',
        path: '/challenges/new/ai',
        persona: 'Government',
        description: 'Unstructured operational bottleneck identified'
    },
    {
        id: 'challenge',
        step: 2,
        title: 'Challenge',
        subtitle: 'Problem Formulation',
        path: '/challenges/new',
        persona: 'Government',
        description: 'Structured specifications, baseline KPIs & budgets'
    },
    {
        id: 'discovery',
        step: 3,
        title: 'Discovery',
        subtitle: 'Startup Matching',
        path: '/challenges',
        persona: 'Startup',
        description: 'AI match score & DPIIT eligibility screening'
    },
    {
        id: 'evaluation',
        step: 4,
        title: 'Evaluation',
        subtitle: 'Expert Panel',
        path: '/evaluation',
        persona: 'Expert',
        description: 'COI declarations, technical & financial scoring'
    },
    {
        id: 'pilot',
        step: 5,
        title: 'Pilot',
        subtitle: 'Controlled Sandbox',
        path: '/pilots',
        persona: 'Government',
        description: 'Sandbox deployment, milestones & telemetry tracking'
    },
    {
        id: 'evidence',
        step: 6,
        title: 'Evidence',
        subtitle: 'Cryptographic Vault',
        path: '/evidence',
        persona: 'Startup / Gov',
        description: 'Telemetry logs, audit receipts & verification'
    },
    {
        id: 'validation',
        step: 7,
        title: 'Validation',
        subtitle: 'Third-Party Review',
        path: '/validation',
        persona: 'Validator',
        description: 'Independent audit methodology & sign-off'
    },
    {
        id: 'passport',
        step: 8,
        title: 'Proof Passport',
        subtitle: 'Innovation Record',
        path: '/passport',
        persona: 'Government',
        description: 'Cryptographic SHA-256 evidence record'
    },
    {
        id: 'scale',
        step: 9,
        title: 'Scale & Tender',
        subtitle: 'Procurement Blueprint',
        path: '/procurement',
        persona: 'Procurement',
        description: 'Tender specs, scale decision & national deployment'
    }
];

export function GovProofWorkflowStepper({
    currentStage = 'problem',
    className = '',
    compact = false
}: GovProofWorkflowStepperProps) {
    let currentStepNumber = 1;
    if (typeof currentStage === 'number') {
        currentStepNumber = currentStage;
    } else {
        const found = WORKFLOW_STAGES.find(s => s.id === currentStage);
        if (found) currentStepNumber = found.step;
    }

    if (compact) {
        return (
            <div className={`bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 ${className}`}>
                <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {WORKFLOW_STAGES.map((stage) => {
                        const isCompleted = stage.step < currentStepNumber;
                        const isCurrent = stage.step === currentStepNumber;

                        return (
                            <Link
                                key={stage.id}
                                to={stage.path}
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                                    isCurrent
                                        ? 'bg-primary text-on-primary font-bold shadow-xs'
                                        : isCompleted
                                        ? 'bg-tertiary-fixed/20 text-on-surface border border-tertiary-fixed-dim/30 hover:bg-tertiary-fixed/30'
                                        : 'bg-surface-container-lowest text-on-surface-variant/70 border border-outline-variant/15 hover:text-on-surface'
                                }`}
                                title={`${stage.title}: ${stage.subtitle}`}
                            >
                                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                                    isCurrent
                                        ? 'bg-on-primary text-primary font-bold'
                                        : isCompleted
                                        ? 'bg-tertiary text-on-tertiary'
                                        : 'bg-surface-container-high text-on-surface-variant'
                                }`}>
                                    {isCompleted ? <CheckCircle2 className="w-3 h-3" /> : stage.step}
                                </span>
                                <span>{stage.title}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-surface-container-low border border-outline-variant/30 rounded-2xl p-4 md:p-5 shadow-xs transition-all ${className}`}>
            {/* Header with Title and Persona Key */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4 pb-3 border-b border-outline-variant/20">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                        <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface flex items-center gap-2">
                            GovProof Sovereign Innovation Journey
                            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant border border-outline-variant/30">
                                9-Stage Validation
                            </span>
                        </h3>
                        <p className="text-[11px] text-on-surface-variant">
                            From unstructured departmental need to verified proof passport and sovereign procurement blueprint.
                        </p>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-3 text-[11px] text-on-surface-variant">
                    <span className="inline-flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-tertiary inline-block"></span> Completed
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-primary inline-block"></span> Active Stage
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-outline-variant/50 inline-block"></span> Upcoming
                    </span>
                </div>
            </div>

            {/* Stepper Steps Strip */}
            <div className="overflow-x-auto pb-1.5 scrollbar-thin">
                <div className="flex items-center min-w-[780px] justify-between gap-1 relative">
                    {WORKFLOW_STAGES.map((stage, idx) => {
                        const isCompleted = stage.step < currentStepNumber;
                        const isCurrent = stage.step === currentStepNumber;

                        return (
                            <div key={stage.id} className="flex items-center flex-1 last:flex-initial group">
                                <Link
                                    to={stage.path}
                                    title={`${stage.title}: ${stage.description} (${stage.persona} Persona)`}
                                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition-all w-full text-left ${
                                        isCurrent
                                            ? 'bg-primary/10 border-primary text-primary shadow-xs ring-1 ring-primary/40'
                                            : isCompleted
                                            ? 'bg-tertiary-fixed/15 border-tertiary-fixed-dim/40 text-on-surface hover:bg-tertiary-fixed/25'
                                            : 'bg-surface-container/40 border-outline-variant/20 text-on-surface-variant opacity-75 hover:opacity-100 hover:bg-surface-container'
                                    }`}
                                >
                                    {/* Step Badge */}
                                    <div
                                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-mono font-extrabold shrink-0 ${
                                            isCurrent
                                                ? 'bg-primary text-on-primary animate-pulse'
                                                : isCompleted
                                                ? 'bg-tertiary text-on-tertiary'
                                                : 'bg-surface-container-high text-on-surface-variant'
                                        }`}
                                    >
                                        {isCompleted ? <CheckCircle2 size={13} /> : stage.step}
                                    </div>

                                    {/* Text Info */}
                                    <div className="min-w-0 pr-1">
                                        <div className="text-[11px] font-bold leading-tight truncate flex items-center gap-1">
                                            <span>{stage.title}</span>
                                        </div>
                                        {!compact && (
                                            <div className="text-[9px] text-on-surface-variant font-medium leading-none truncate mt-0.5">
                                                {stage.subtitle}
                                            </div>
                                        )}
                                    </div>
                                </Link>

                                {/* Connector Arrow */}
                                {idx < WORKFLOW_STAGES.length - 1 && (
                                    <ChevronRight
                                        size={14}
                                        className={`shrink-0 mx-0.5 ${
                                            isCompleted ? 'text-tertiary' : 'text-outline-variant/40'
                                        }`}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default GovProofWorkflowStepper;
