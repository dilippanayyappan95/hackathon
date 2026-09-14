import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            removeToast(id);
        }, 4000);
    }, [removeToast]);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Toast Container */}
            <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4">
                {toasts.map((toast) => {
                    const isSuccess = toast.type === 'success';
                    const isError = toast.type === 'error';
                    const isWarning = toast.type === 'warning';

                    return (
                        <div
                            key={toast.id}
                            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-level-3 backdrop-blur-md transition-all animate-in slide-in-from-bottom-5 duration-300 ${
                                isSuccess
                                    ? 'bg-surface-container-lowest border-primary/40 text-on-surface'
                                    : isError
                                    ? 'bg-surface-container-lowest border-error/50 text-on-surface'
                                    : isWarning
                                    ? 'bg-surface-container-lowest border-secondary/50 text-on-surface'
                                    : 'bg-surface-container-lowest border-outline-variant/60 text-on-surface'
                            }`}
                        >
                            <div className="mt-0.5 shrink-0">
                                {isSuccess && <CheckCircle2 size={18} className="text-primary" />}
                                {isError && <AlertCircle size={18} className="text-error" />}
                                {isWarning && <AlertTriangle size={18} className="text-secondary" />}
                                {!isSuccess && !isError && !isWarning && <Info size={18} className="text-on-surface-variant" />}
                            </div>
                            <div className="flex-1 text-xs font-medium leading-relaxed">
                                {toast.message}
                            </div>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="text-on-surface-variant hover:text-on-surface p-0.5 rounded transition-colors shrink-0"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
