"use client"
import { useState } from 'react';
import {
    Play, Users, Bot, Settings, Trophy,
    History, Swords, ChevronDown, User,
    LogOut, BarChart3, Menu, X, Home, Search
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useRouter } from 'next/navigation';
import { RootState } from '@/lib/store';
import { useSelector } from 'react-redux';
import { useLogout } from '@/hooks/useLogout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { cn } from '@/lib/utils';

export default function ResponsiveChessDashboard() {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar state
    const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
    const router = useRouter();
    const user = useSelector((state: RootState) => state.auth.user);
    const { isLoading, handleLogout, error } = useLogout();
    // const isLoading = true;

    return (
        <div className="flex h-screen bg-background text-foreground transition-colors duration-500 overflow-hidden">

            {/* --- 1. MOBILE SIDEBAR OVERLAY (Drawer) --- */}
            <div className={`fixed inset-0 z-100 lg:hidden transition-opacity duration-300 ${isSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}>
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
                <aside className={`absolute left-0 top-0 h-full w-72 bg-card border-r border-border p-6 transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3 font-bold text-primary text-xl">
                            <Swords size={24} /> <span>Better Chess</span>
                        </div>
                        <button onClick={() => setIsSidebarOpen(false)}><X size={24} /></button>
                    </div>
                    <nav className="space-y-2">
                        <SidebarItem icon={<Play size={20} />} label="Play" active isOpen={isDesktopCollapsed} />
                        <SidebarItem icon={<Trophy size={20} />} label="Tournaments" isOpen={isDesktopCollapsed} />
                        <SidebarItem icon={<History size={20} />} label="Archive" isOpen={isDesktopCollapsed} />
                        <SidebarItem icon={<BarChart3 size={20} />} label="Stats" isOpen={isDesktopCollapsed} />
                        <SidebarItem icon={<Users size={20} />} label="Social" isOpen={isDesktopCollapsed} />
                    </nav>
                </aside>
            </div>

            {/* --- 2. DESKTOP SIDEBAR (Permanent) --- */}
            <aside className={`hidden lg:flex flex-col bg-card border-r border-border transition-all duration-300 ${isDesktopCollapsed ? 'w-20' : 'w-64'}`}>
                <div className="p-6 flex items-center gap-3 font-bold text-primary text-xl overflow-hidden whitespace-nowrap">
                    <Swords size={28} className="shrink-0" />
                    {!isDesktopCollapsed && <span>Better Chess</span>}
                </div>
                <nav className="flex-1 px-4 space-y-2">
                    <SidebarItem icon={<Play size={20} />} label="Play" active isOpen={isSidebarOpen} />
                    <SidebarItem icon={<History size={20} />} label="Archive" isOpen={isSidebarOpen} />
                    <SidebarItem icon={<BarChart3 size={20} />} label="Stats" isOpen={isSidebarOpen} />
                    <SidebarItem icon={<Users size={20} />} label="Social" isOpen={isSidebarOpen} />
                    <SidebarItem icon={<Trophy size={20} />} label="Tournaments" isOpen={isSidebarOpen} muted />
                </nav>
                <div className="p-4 border-t border-border">
                    <SidebarItem icon={<Settings size={20} />} label="Settings" isOpen={isSidebarOpen} />
                </div>
            </aside>

            {/* --- 3. MAIN CONTENT --- */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* TOP NAV */}
                <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md flex items-center justify-between px-4 lg:px-8 shrink-0">

                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="w- flex items-center gap-4 p-3 rounded-lg hover:bg-accent transition-all lg:hidden"
                    >
                        <Menu size={20} />
                    </button>
                    <button
                        onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
                        className="w- items-center gap-4 p-3 rounded-lg hover:bg-accent transition-all hidden lg:flex"
                    >
                        <Menu size={20} />
                    </button>

                    <div className="flex items-center gap-4 ml-auto">
                        <div className="bg-primary/10 px-3 py-1 rounded-full border border-primary/20 flex items-center gap-2">
                            <Trophy size={14} className="text-primary" />
                            <span className="text-xs lg:text-sm font-bold text-primary">{user?.elo}</span>
                        </div>

                        <ThemeToggle />

                        <div className="relative">
                            <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-accent transition-all">
                                <span className="text-sm font-medium hidden sm:block">{user?.username}</span>
                                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">{user?.profilePicture}</div>
                                <ChevronDown size={14} className="hidden sm:block" />
                            </button>

                            {isProfileOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-2xl shadow-2xl p-2 z-110">
                                    <div className="p-3 border-b border-border mb-1 text-sm">
                                        <p className="font-bold truncate">{user?.username}</p>
                                        <p className="text-muted-foreground text-xs truncate">{user?.email}</p>
                                    </div>
                                    <DropdownItem icon={<User size={16} />} label="Profile" path="/profile" />
                                    <DropdownItem icon={<BarChart3 size={16} />} label="Performance" path='/performance' />
                                    <div className="h-px bg-border my-2" />
                                    <DropdownItem icon={<LogOut size={16} />} label="Logout" variant="danger" logout={handleLogout} isLoading={isLoading} />
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* DASHBOARD BODY */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-8 pb-24 lg:pb-8">
                    <div className="max-w-5xl mx-auto space-y-6">
                        <header>
                            <h1 className="text-2xl lg:text-4xl font-black tracking-tight py-1">Play Chess</h1>
                            <p className="text-muted-foreground text-sm lg:text-base">Join 1,240 players online now.</p>
                        </header>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                            <GameCard
                                icon={<Play className="text-emerald-500 group-hover:fill-primary transition-colors ease-in-out duration-500" />}
                                title="Quick Play"
                                desc="Find a random opponent"
                                primary
                                onClick={() => router.push("/quick-play")}
                            />
                            <GameCard
                                icon={<Users className="text-blue-500 group-hover:fill-blue-500 transition-colors ease-in-out duration-500" />}
                                title="Friend"
                                desc="Challenge someone"
                                onClick={() => router.push("/social")}
                            />
                            <GameCard
                                icon={<Bot className="text-purple-500 group-hover:fill-purple-500 transition-colors ease-in-out duration-500" />}
                                title="Computer"
                                desc="Stockfish level 8"
                                onClick={() => router.push("/playBot")}
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                            <div className="bg-primary/5 h-48 rounded-3xl border-2 border-dashed border-border flex items-center justify-center text-muted-foreground">Recent Games</div>
                            <div className="bg-primary/5 h-48 rounded-3xl border-2 border-dashed border-border flex items-center justify-center text-muted-foreground">Daily Puzzle</div>
                        </div>
                    </div>
                </main>

                {/* --- 4. MOBILE BOTTOM NAV (Only visible on small screens) --- */}
                <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border flex items-center justify-around px-4 pb-safe z-50">
                    <MobileTab icon={<Home size={20} />} label="Home" active />
                    <MobileTab icon={<Search size={20} />} label="Browse" />
                    <MobileTab icon={<Play size={20} />} label="Play" />
                    <MobileTab icon={<Trophy size={20} />} label="Ranks" />
                </nav>
            </div>
        </div>
    );
}

// --- SUB-COMPONENTS ---

function SidebarItem({ icon, label, active = false, isOpen, muted }: { icon: any, label: string, active?: boolean, isOpen: boolean, muted?: boolean }) {
    return (
        <button className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${muted ? 'opacity-50 cursor-not-allowed text-muted-foreground' : active ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'hover:bg-accent text-muted-foreground hover:text-foreground'}`}>
            <span className="shrink-0">{icon}</span>
            {!isOpen && <span className="font-semibold truncate">{label}</span>}
        </button>
    );
}

function MobileTab({ icon, label, active = false }: any) {
    return (
        <button className={`flex flex-col items-center gap-1 ${active ? 'text-primary' : 'text-muted-foreground'}`}>
            {icon} <span className="text-[10px] font-medium">{label}</span>
        </button>
    );
}

interface GameCardProps {
    icon: any,
    title: string,
    desc: string,
    primary?: boolean,
    onClick: () => void
}

function GameCard({ icon, title, desc, primary = false, onClick }: GameCardProps) {
    return (
        <button
            className={cn(
                "p-6 rounded-3xl border text-left transition-all cursor-pointer group",
                primary ? "bg-primary/5 border-primary ring-1 ring-primary/20" : "bg-card border-border hover:border-primary/50"
            )}
            onClick={onClick}
        >
            <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center border border-border mb-4">{icon}</div>
            <h3 className="font-bold">{title}</h3>
            <p className="text-xs text-muted-foreground">{desc}</p>
        </button>
    );
}

interface DropdownItemProps {
    icon: any,
    label: string,
    variant?: 'normal' | 'danger',
    path?: string,
    logout?: () => void,
    isLoading?: boolean
}

function DropdownItem({ icon, label, variant, path, logout, isLoading }: DropdownItemProps) {
    const router = useRouter();
    return (
        <button
            onClick={() => {
                if (path) router.push(path);
                if (logout) logout();
            }}
            disabled={isLoading}
            className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-sm transition-colors 
                ${variant === 'danger' ? 'text-danger hover:bg-danger' : 'hover:bg-accent'}
                ${isLoading ? 'cursor-not-allowed opacity-70 bg-danger/50 hover:bg-danger/50 hover:text-danger-foreground flex justify-center items-center' : 'hover:text-danger-foreground'}`
            }>
            {isLoading ? (
                <LoadingSpinner />
            ) : (<>
                {icon} {label}
            </>)}
        </button>
    );
}