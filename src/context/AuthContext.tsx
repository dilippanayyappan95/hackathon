import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

export interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    departmentId?: string;
    department?: string;
    startupId?: string;
    startup?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isGovernment: boolean;
    isStartup: boolean;
    isExpert: boolean;
    isValidator: boolean;
    isProcurement: boolean;
    login: (email: string, password?: string) => Promise<User>;
    loginDemo: (email: string) => Promise<User>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState(true);

    const refreshUser = async () => {
        try {
            const res = await api.get('/auth/me');
            setUser(res.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.user));
        } catch {
            // If token invalid, clear
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
        }
    };

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken) {
            setToken(storedToken);
            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch {
                    setUser(null);
                }
            }
            refreshUser().finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, []);

    const login = async (email: string, password?: string): Promise<User> => {
        setIsLoading(true);
        try {
            const res = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            setToken(res.data.token);
            setUser(res.data.user);
            return res.data.user;
        } finally {
            setIsLoading(false);
        }
    };

    const loginDemo = async (email: string): Promise<User> => {
        setIsLoading(true);
        try {
            const res = await api.post('/auth/demo-switch', { email });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            setToken(res.data.token);
            setUser(res.data.user);
            return res.data.user;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        window.location.href = '/login';
    };

    const role = user?.role || '';
    const isStartup = role === 'Startup';
    const isExpert = role === 'Expert';
    const isValidator = role === 'Validator';
    const isProcurement = role === 'Procurement Officer';
    const isGovernment = ['Government Officer', 'Admin', 'Procurement Officer', 'Validator', 'Expert'].includes(role);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!token && !!user,
                isLoading,
                isGovernment,
                isStartup,
                isExpert,
                isValidator,
                isProcurement,
                login,
                loginDemo,
                logout,
                refreshUser
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
