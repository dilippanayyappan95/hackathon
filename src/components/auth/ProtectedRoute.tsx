import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    children?: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
                <div className="p-3 bg-primary text-on-primary rounded-xl shadow-lg flex items-center justify-center">
                    <ShieldCheck size={32} className="text-tertiary-fixed" />
                </div>
                <div className="flex items-center gap-2 text-on-surface font-display font-bold text-sm">
                    <Loader2 className="animate-spin text-primary" size={18} /> Verifying Sovereign Credentials...
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children ? <>{children}</> : <Outlet />;
}
