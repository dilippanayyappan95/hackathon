import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RoleGuardProps {
    allowedRoles: string[];
    children: React.ReactNode;
}

export default function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
    const { user, isAuthenticated, isLoading } = useAuth();

    if (isLoading) return null;

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const userRole = user?.role || '';
    const hasPermission = allowedRoles.includes(userRole) || userRole === 'Admin';

    if (!hasPermission) {
        const homePath = userRole === 'Startup' ? '/startup-dashboard' : '/';
        return (
            <div className="max-w-2xl mx-auto my-12 p-8 bg-surface-container-lowest border border-error-container/50 rounded-2xl shadow-sm text-center space-y-4 animate-in fade-in">
                <div className="w-16 h-16 bg-error-container text-on-error-container rounded-2xl flex items-center justify-center mx-auto">
                    <ShieldAlert size={32} />
                </div>
                <div>
                    <h2 className="text-xl font-display font-bold text-on-surface">Statutory Authorization Required</h2>
                    <p className="text-xs text-on-surface-variant font-medium mt-1">
                        Your authenticated role (<strong className="text-primary uppercase">{userRole}</strong>) does not have access permissions for this module.
                    </p>
                </div>
                <div className="pt-4 flex justify-center">
                    <Link
                        to={homePath}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary font-bold text-xs rounded-lg shadow-sm hover:bg-primary-container transition-all"
                    >
                        Return to Authorized Dashboard <ArrowRight size={14} />
                    </Link>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
