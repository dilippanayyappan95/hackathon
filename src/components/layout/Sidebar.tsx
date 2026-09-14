import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard, Target, Bot, Rocket, Search, CheckCircle2,
    Activity, Play, FileCheck2, Scale, BookOpen, ShieldCheck,
    Settings, LogOut, BarChart, Inbox, Database, UserCheck
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Sidebar() {
    const location = useLocation();
    const { user, logout } = useAuth();
    const role = user?.role || 'Government Officer';

    const getNavGroups = () => {
        if (role === 'Startup') {
            return [
                {
                    heading: "Overview",
                    items: [
                        { icon: LayoutDashboard, label: 'Startup Dashboard', path: '/startup-dashboard' },
                    ]
                },
                {
                    heading: "Opportunities",
                    items: [
                        { icon: Target, label: 'Discover Challenges', path: '/challenges' },
                        { icon: Search, label: 'Ecosystem Directory', path: '/discover' },
                        { icon: Rocket, label: 'My Enterprise Profile', path: '/startups/profiles' },
                    ]
                },
                {
                    heading: "My Activity",
                    items: [
                        { icon: Inbox, label: 'My Applications', path: '/applications' },
                        { icon: Play, label: 'Active Pilots', path: '/pilots' },
                        { icon: Activity, label: 'Pilot Arena', path: '/pilots/arena' },
                    ]
                },
                {
                    heading: "Proof & Verification",
                    items: [
                        { icon: Database, label: 'Evidence Vault', path: '/evidence' },
                        { icon: ShieldCheck, label: 'Validation Status', path: '/validation' },
                        { icon: FileCheck2, label: 'My Proof Passports', path: '/passports' },
                    ]
                },
                {
                    heading: "Governance",
                    items: [
                        { icon: Settings, label: 'Settings & Security', path: '/settings' },
                    ]
                }
            ];
        }

        if (role === 'Expert') {
            return [
                {
                    heading: "Overview",
                    items: [
                        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
                    ]
                },
                {
                    heading: "Expert Evaluation",
                    items: [
                        { icon: CheckCircle2, label: 'Evaluation Center', path: '/evaluation' },
                        { icon: Inbox, label: 'Startup Applications', path: '/applications' },
                        { icon: Play, label: 'Assigned Pilots', path: '/pilots' },
                        { icon: FileCheck2, label: 'Proof Passports', path: '/passports' },
                    ]
                },
                {
                    heading: "Governance",
                    items: [
                        { icon: Settings, label: 'Settings', path: '/settings' },
                    ]
                }
            ];
        }

        if (role === 'Validator') {
            return [
                {
                    heading: "Overview",
                    items: [
                        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
                    ]
                },
                {
                    heading: "Independent Validation",
                    items: [
                        { icon: UserCheck, label: 'Validation Center', path: '/validation' },
                        { icon: Database, label: 'Evidence Vault', path: '/evidence' },
                        { icon: Play, label: 'Active Pilots', path: '/pilots' },
                        { icon: FileCheck2, label: 'Proof Passports', path: '/passports' },
                    ]
                },
                {
                    heading: "Governance",
                    items: [
                        { icon: Settings, label: 'Settings', path: '/settings' },
                    ]
                }
            ];
        }

        if (role === 'Procurement Officer') {
            return [
                {
                    heading: "Overview",
                    items: [
                        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
                    ]
                },
                {
                    heading: "Procurement & Scaling",
                    items: [
                        { icon: BookOpen, label: 'Procurement Readiness', path: '/procurement' },
                        { icon: FileCheck2, label: 'Proof Passports', path: '/passports' },
                        { icon: Scale, label: 'Scale Decisions', path: '/scale' },
                        { icon: Play, label: 'Active Pilots', path: '/pilots' },
                    ]
                },
                {
                    heading: "Governance",
                    items: [
                        { icon: Settings, label: 'Settings', path: '/settings' },
                    ]
                }
            ];
        }

        // Default: Government Officer & Admin
        return [
            {
                heading: "Overview",
                items: [
                    { icon: LayoutDashboard, label: 'Government Dashboard', path: '/' },
                ]
            },
            {
                heading: "Innovation Pipeline",
                items: [
                    { icon: Target, label: 'Challenges', path: '/challenges' },
                    { icon: Bot, label: 'AI Challenge Copilot', path: '/challenges/new/ai' },
                    { icon: Inbox, label: 'Applications', path: '/applications' },
                ]
            },
            {
                heading: "Discovery & Matching",
                items: [
                    { icon: Search, label: 'Discover Startups', path: '/discover' },
                    { icon: Rocket, label: 'Startup Profiles', path: '/startups/profiles' },
                ]
            },
            {
                heading: "Evaluation & Pilots",
                items: [
                    { icon: CheckCircle2, label: 'Evaluation Center', path: '/evaluation' },
                    { icon: Play, label: 'Active Pilots', path: '/pilots' },
                    { icon: Activity, label: 'Pilot Arena', path: '/pilots/arena' },
                ]
            },
            {
                heading: "Proof & Verification",
                items: [
                    { icon: Database, label: 'Evidence Vault', path: '/evidence' },
                    { icon: ShieldCheck, label: 'Validation Center', path: '/validation' },
                    { icon: FileCheck2, label: 'Proof Passports', path: '/passports' },
                ]
            },
            {
                heading: "Scale & Procurement",
                items: [
                    { icon: Scale, label: 'Scale Readiness', path: '/scale' },
                    { icon: BookOpen, label: 'Procurement Prep', path: '/procurement' },
                    { icon: BarChart, label: 'Platform Analytics', path: '/analytics' },
                ]
            },
            {
                heading: "Governance",
                items: [
                    { icon: Settings, label: 'Settings & Audit', path: '/settings' },
                ]
            }
        ];
    };

    const navGroups = getNavGroups();

    return (
        <aside className="w-64 bg-surface-container-lowest border-r border-outline-variant/30 min-h-[calc(100vh-4rem)] flex flex-col justify-between p-3 sticky top-16 hidden md:flex overflow-y-auto">
            <div className="space-y-4">
                {navGroups.map((group, gIdx) => (
                    <div key={gIdx} className="space-y-0.5">
                        {group.heading && (
                            <p className="px-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 mt-3 opacity-70">
                                {group.heading}
                            </p>
                        )}
                        {group.items.map((item, i) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path ||
                                (item.path !== '/' && item.path !== '/startup-dashboard' && location.pathname.startsWith(item.path));
                            return (
                                <Link
                                    key={i}
                                    to={item.path}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                                        isActive
                                            ? 'bg-primary text-on-primary shadow-sm font-bold'
                                            : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <Icon size={16} className={isActive ? 'opacity-100 text-tertiary-fixed' : 'opacity-70'} />
                                        <span>{item.label}</span>
                                    </div>
                                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed" />}
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* User Session Footer */}
            <div className="pt-4 border-t border-outline-variant/20 space-y-2">
                <div className="px-3 py-2 bg-surface-container rounded-lg border border-outline-variant/20">
                    <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Authorized Role</div>
                    <div className="text-xs font-bold text-primary truncate uppercase">{role}</div>
                    <div className="text-[10px] text-on-surface-variant truncate">{user?.name}</div>
                </div>

                <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-error hover:bg-error-container/20 transition-all"
                >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
}
