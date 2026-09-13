import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard, Target, Bot, Rocket, Search, CheckCircle2,
    Activity, Play, FileCheck2, Scale, BookOpen, ShieldCheck,
    Settings, LogOut, BarChart
} from "lucide-react";

const NAV_GROUPS = [
    {
        heading: "",
        items: [
            { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        ]
    },
    {
        heading: "Innovation Pipeline",
        items: [
            { icon: Target, label: 'Challenges', path: '/challenges' },
            { icon: Bot, label: 'AI Copilot', path: '/challenges/new' },
        ]
    },
    {
        heading: "Startups & Discover",
        items: [
            { icon: Search, label: 'Discover Startups', path: '/discover' },
            { icon: Rocket, label: 'Startup Profiles', path: '/startups/profiles' },
        ]
    },
    {
        heading: "Evaluation & Pilots",
        items: [
            { icon: Play, label: 'Active Pilots', path: '/pilots' },
            { icon: Activity, label: 'Pilot Arena', path: '/pilots/arena' },
            { icon: CheckCircle2, label: 'Evaluation Center', path: '/evaluation' },
        ]
    },
    {
        heading: "Proof & Scale",
        items: [
            { icon: ShieldCheck, label: 'Validation Center', path: '/validation' },
            { icon: FileCheck2, label: 'Proof Passports', path: '/passport' },
            { icon: Scale, label: 'Scale Readiness', path: '/scale' },
        ]
    },
    {
        heading: "Procurement Admin",
        items: [
            { icon: BookOpen, label: 'Procurement Prep', path: '/procurement' },
            { icon: BarChart, label: 'System Analytics', path: '/analytics' },
        ]
    }
];

export default function Sidebar() {
    const location = useLocation();

    return (
        <aside className="w-64 bg-surface-container-lowest border-r border-outline-variant/30 min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4 sticky top-16 hidden md:flex overflow-y-auto custom-scrollbar">
            <div className="space-y-6">
                {NAV_GROUPS.map((group, gIdx) => (
                    <div key={gIdx} className="space-y-1">
                        {group.heading && (
                            <p className="px-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 mt-4 opacity-70">
                                {group.heading}
                            </p>
                        )}
                        {group.items.map((item, i) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                            return (
                                <Link
                                    key={i}
                                    to={item.path}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-semibold transition-all ${isActive
                                        ? 'bg-primary text-on-primary shadow-level-2'
                                        : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon size={18} className={isActive ? 'opacity-100 text-on-primary' : 'opacity-70'} />
                                        {item.label}
                                    </div>
                                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed-dim" />}
                                </Link>
                            )
                        })}
                    </div>
                ))}
            </div>

            <div className="space-y-4 pt-8 shrink-0">
                <div className="space-y-1">
                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-all">
                        <Settings size={18} className="opacity-70" />
                        Settings
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-semibold text-error hover:bg-error-container/50 transition-all">
                        <LogOut size={18} className="opacity-70" />
                        Sign Out
                    </button>
                </div>
            </div>
        </aside>
    );
}
