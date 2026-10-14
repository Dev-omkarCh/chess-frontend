"use client"
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Play, Users, Bot, Settings, Trophy, History, Swords, ChevronDown, User,
    LogOut, BarChart3, Menu, X, Home, ArrowUpRight, Sparkles, Bell, Flame,
    Zap, Timer, Puzzle, GraduationCap, Brain, Medal, Crown, Target,
    BookOpen, Clock, Hourglass, ChevronRight, Link2, Check, type LucideIcon
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useRouter, usePathname } from 'next/navigation';
import { RootState } from '@/lib/store';
import { useSelector } from 'react-redux';
import { useLogout } from '@/hooks/useLogout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { cn } from '@/lib/utils';

import {
    FEATURES, TIME_CONTROLS, DEFAULT_TIME_CONTROL,
    type FeatureKey, type TimeControl, type TimeCategory,
} from '@/lib/dashboard.config';
import { getErrorMessage } from '@/lib/api/client';
import type { DashboardApi } from '@/lib/api/dashboard.api';
import { PREVIEW } from '@/lib/mocks/dashboard.mock';
import { useDashboardData, type DataSource, type Section } from '@/hooks/useDashboardData';
import type {
    ActiveGame, AppNotification, DailyPuzzle, Friend, LeaderboardData,
    OpeningOfWeek, PlayerStats, RecentGame, Tournament,
} from '@/types/dashboard';
import apiClient from '@/api/axois';
import { Chess, Square } from 'chess.js';
import { BoardTheme, getColor, getPiece, pieceStyleType } from '@/lib/pieces-registry';

/* =========================================================================
   CONFIG
   ========================================================================= */

const IS_DEV = process.env.NODE_ENV !== 'production';

/**
 * Where data comes from.
 * - production: always the real API
 * - development: mock "active player" by default. Switch live with the dev
 *   panel (bottom-right), or set NEXT_PUBLIC_DASHBOARD_SOURCE=api in .env.local
 */
const DEFAULT_SOURCE: DataSource = IS_DEV
    ? ((process.env.NEXT_PUBLIC_DASHBOARD_SOURCE as DataSource | undefined) ?? 'mock-full')
    : 'api';

const NAV: { group: string; items: { label: string; icon: LucideIcon; href: string; feature: FeatureKey }[] }[] = [
    {
        group: 'Play', items: [
            { label: 'Play', icon: Play, href: '/dashboard', feature: 'quickPlay' },
            { label: 'Tournaments', icon: Trophy, href: '/tournaments', feature: 'tournaments' },
        ]
    },
    {
        group: 'Improve', items: [
            { label: 'Puzzles', icon: Puzzle, href: '/puzzles', feature: 'puzzles' },
            { label: 'Learn', icon: GraduationCap, href: '/learn', feature: 'learn' },
            { label: 'Analysis', icon: Brain, href: '/analysis', feature: 'analysis' },
            { label: 'Archive', icon: History, href: '/archive', feature: 'archive' },
            { label: 'Stats', icon: BarChart3, href: '/stats', feature: 'stats' },
        ]
    },
    {
        group: 'Community', items: [
            { label: 'Social', icon: Users, href: '/social', feature: 'social' },
            { label: 'Leaderboard', icon: Medal, href: '/leaderboard', feature: 'leaderboard' },
        ]
    },
];

const BOT_LEVELS = ['Beginner', 'Casual', 'Club', 'Intermediate', 'Advanced', 'Expert', 'Master', 'Stockfish max'];
const CATEGORY_ICON: Record<TimeCategory, LucideIcon> = { Bullet: Zap, Blitz: Flame, Rapid: Timer };

const focusRing = 'outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background';

/* =========================================================================
   HELPERS + SMALL HOOKS
   ========================================================================= */

function timeAgo(iso: string) {
    const s = Math.max(0, Math.floor((Date.now() - Date.parse(iso)) / 1000));
    if (s < 60) return 'Just now';
    const m = Math.floor(s / 60);
    if (m < 60) return `${m} min ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} hour${h > 1 ? 's' : ''} ago`;
    const d = Math.floor(h / 24);
    return d === 1 ? 'Yesterday' : `${d} days ago`;
}

function formatClock(seconds: number) {
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

function previewSection<T>(data: T): Section<T> {
    return { status: 'success', data };
}

function useCountUp(target: number, duration = 900) {
    const [value, setValue] = useState(0);
    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setValue(target); return; }
        let raf = 0;
        const start = performance.now();
        const tick = (now: number) => {
            const p = Math.min((now - start) / duration, 1);
            setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
            if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [target, duration]);
    return value;
}

function useDismiss<T extends HTMLElement>(open: boolean, onClose: () => void) {
    const [node, setNode] = useState<T | null>(null);
    useEffect(() => {
        if (!open) return;
        const onDown = (e: MouseEvent) => { if (node && !node.contains(e.target as Node)) onClose(); };
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('mousedown', onDown);
        document.addEventListener('keydown', onKey);
        return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
    }, [open, onClose, node]);
    return setNode;
}

function useCountdown(initialSeconds: number) {
    const [s, setS] = useState(initialSeconds);
    useEffect(() => {
        const id = setInterval(() => setS(x => Math.max(0, x - 1)), 1000);
        return () => clearInterval(id);
    }, []);
    return { h: Math.floor(s / 3600), m: Math.floor((s % 3600) / 60), sec: s % 60 };
}

/* =========================================================================
   MAIN PAGE
   ========================================================================= */

export default function ResponsiveChessDashboard() {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
    const [greeting, setGreeting] = useState('Welcome back');
    const [source, setSource] = useState<DataSource>(DEFAULT_SOURCE);
    const router = useRouter();
    const user = useSelector((state: RootState) => state.auth.user);
    const { isLoading, handleLogout } = useLogout();
    const { state, reload, markAllRead, api } = useDashboardData(source);
    const [recentGameHistory, setRecentGameHistory] = useState<RecentGame[]>([]);

    const closeProfile = useCallback(() => setIsProfileOpen(false), []);
    const closeNotif = useCallback(() => { setIsNotifOpen(false); markAllRead(); }, [markAllRead]);
    const profileRef = useDismiss<HTMLDivElement>(isProfileOpen, closeProfile);
    const notifRef = useDismiss<HTMLDivElement>(isNotifOpen, closeNotif);

    const username = user?.username || 'Player';
    const stats = state.stats.data;
    const isNew = stats?.totalGames === 0;
    const rating = stats?.rating ?? user?.elo ?? 1200;
    const notifications = state.notifications.data ?? [];
    const unreadCount = notifications.filter(n => n.unread).length;

    // Coming-soon sections use static previews until their flag is turned on.
    const puzzleSection = FEATURES.puzzles ? state.puzzle : previewSection(PREVIEW.puzzle);
    const openingSection = FEATURES.learn ? state.opening : previewSection(PREVIEW.opening);
    const leaderboardSection = FEATURES.leaderboard ? state.leaderboard : previewSection(PREVIEW.leaderboard);
    const tournamentSection = FEATURES.tournaments ? state.tournament : previewSection(PREVIEW.tournament);

    useEffect(() => {
        const h = new Date().getHours();
        setGreeting(h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening');
    }, []);

    useEffect(() => {
        if (!user?._id) return;
        async function fetchRecentGames() {
            try {
                const response = await apiClient.get(`/v1/games/${user?._id}/recent`);
                setRecentGameHistory(response.data.games) as unknown as RecentGame[];
            } catch (error) {
                console.error('Failed to fetch recent games:', error);
            }
        }
        fetchRecentGames();
    }, [user]);

    const heroTitle = isNew ? `Welcome to Better Chess, ${username}` : `${greeting}, ${username}`;
    const heroSub = !stats
        ? 'Loading your stats...'
        : isNew
            ? 'Pick a time control below and play your first game.'
            : stats.streak > 0
                ? `You're on a ${stats.streak}-win streak. Keep it going.`
                : 'Ready for your next game?';

    return (
        <div className="flex h-screen bg-background text-foreground transition-colors duration-500 overflow-hidden">
            <style>{`
                @keyframes bc-float { 0%,100% { transform: translateY(0) rotate(-4deg); } 50% { transform: translateY(-14px) rotate(2deg); } }
                .bc-float { animation: bc-float 7s ease-in-out infinite; }
                .font-display { font-family: var(--font-display, inherit); }
                @media (prefers-reduced-motion: reduce) { .bc-float { animation: none; } }
            `}</style>

            {/* --- 1. MOBILE SIDEBAR (Drawer) --- */}
            <div className={cn('fixed inset-0 z-100 lg:hidden transition-opacity duration-300', isSidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible')}>
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
                <aside className={cn('absolute left-0 top-0 h-full w-72 bg-card border-r border-border flex flex-col transition-transform duration-300', isSidebarOpen ? 'translate-x-0' : '-translate-x-full')}>
                    <div className="p-6 flex items-center justify-between">
                        <Brand collapsed={false} />
                        <button aria-label="Close menu" onClick={() => setIsSidebarOpen(false)} className={cn('rounded-lg p-1', focusRing)}><X size={22} /></button>
                    </div>
                    <SidebarNav collapsed={false} onNavigate={() => setIsSidebarOpen(false)} />
                    <SidebarFooter collapsed={false} username={username} rating={rating} avatar={user?.avatar} onNavigate={() => setIsSidebarOpen(false)} />
                </aside>
            </div>

            {/* --- 2. DESKTOP SIDEBAR --- */}
            <aside className={cn('hidden lg:flex flex-col bg-card border-r border-border transition-all duration-300', isDesktopCollapsed ? 'w-20' : 'w-64')}>
                <div className="p-6"><Brand collapsed={isDesktopCollapsed} /></div>
                <SidebarNav collapsed={isDesktopCollapsed} />
                <SidebarFooter collapsed={isDesktopCollapsed} username={username} rating={rating} avatar={user?.avatar} />
            </aside>

            {/* --- 3. MAIN CONTENT --- */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* TOP NAV */}
                <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md flex items-center justify-between px-4 lg:px-8 shrink-0 relative z-20">
                    <button aria-label="Open menu" onClick={() => setIsSidebarOpen(true)} className={cn('p-3 rounded-lg hover:bg-accent transition-colors lg:hidden', focusRing)}>
                        <Menu size={20} />
                    </button>
                    <button aria-label="Collapse sidebar" onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)} className={cn('p-3 rounded-lg hover:bg-accent transition-colors hidden lg:flex', focusRing)}>
                        <Menu size={20} />
                    </button>

                    <div className="flex items-center gap-2 sm:gap-3 ml-auto">
                        <RatingPill rating={rating} />

                        {/* Notifications */}
                        {FEATURES.notifications && (
                            <div className="relative" ref={notifRef}>
                                <button
                                    aria-label={`Notifications, ${unreadCount} unread`}
                                    aria-expanded={isNotifOpen}
                                    onClick={() => { if (isNotifOpen) closeNotif(); else { setIsNotifOpen(true); setIsProfileOpen(false); } }}
                                    className={cn('relative p-2.5 rounded-full hover:bg-accent transition-colors', focusRing)}
                                >
                                    <Bell size={18} />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                                            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-500 border-2 border-card" />
                                        </span>
                                    )}
                                </button>
                                {isNotifOpen && (
                                    <NotificationsMenu section={state.notifications} items={notifications} />
                                )}
                            </div>
                        )}

                        <ThemeToggle />

                        {/* Profile menu */}
                        <div className="relative" ref={profileRef}>
                            <button
                                aria-expanded={isProfileOpen}
                                onClick={() => { setIsProfileOpen(!isProfileOpen); if (isNotifOpen) closeNotif(); }}
                                className={cn('flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-accent transition-colors', focusRing)}
                            >
                                <Avatar name={username} src={user?.avatar} size="h-8 w-8" />
                                <span className="text-sm font-medium hidden sm:block">{username}</span>
                                <ChevronDown size={14} className={cn('hidden sm:block transition-transform', isProfileOpen && 'rotate-180')} />
                            </button>

                            {isProfileOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-2xl shadow-2xl p-2 z-110">
                                    <div className="p-3 border-b border-border mb-1 text-sm">
                                        <p className="font-bold truncate">{user?.username}</p>
                                        <p className="text-muted-foreground text-xs truncate">{user?.email}</p>
                                    </div>
                                    <DropdownItem icon={<User size={16} />} label="Profile" path="/profile" />
                                    <DropdownItem icon={<BarChart3 size={16} />} label="Performance" path="/performance" />
                                    <DropdownItem icon={<Settings size={16} />} label="Settings" path="/settings" soon={!FEATURES.settings} />
                                    <div className="h-px bg-border my-2" />
                                    <DropdownItem icon={<LogOut size={16} />} label="Logout" variant="danger" logout={handleLogout} isLoading={isLoading} />
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* DASHBOARD BODY */}
                <div className="relative flex-1 min-h-0">
                    {/* Ambient background: soft glow + faint chessboard pattern */}
                    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
                        <div className="absolute -top-40 right-[-8rem] h-[28rem] w-[28rem] rounded-full bg-primary/15 blur-3xl" />
                        <div className="absolute top-[40%] -left-40 h-[24rem] w-[24rem] rounded-full bg-purple-500/10 blur-3xl" />
                        <div className="absolute inset-0 opacity-[0.025] [background-size:56px_56px] bg-[conic-gradient(#000_25%,transparent_0_50%,#000_0_75%,transparent_0)] dark:bg-[conic-gradient(#fff_25%,transparent_0_50%,#fff_0_75%,transparent_0)]" />
                    </div>

                    <main className="relative h-full overflow-y-auto p-4 lg:p-8 pb-28 lg:pb-8">
                        <div className="max-w-7xl mx-auto space-y-6">

                            {/* HERO */}
                            <section className="relative overflow-hidden rounded-[2rem] border border-border bg-card/60 backdrop-blur-xl">
                                <div aria-hidden className="pointer-events-none absolute -right-10 -top-6 hidden md:block select-none">
                                    <div className="bc-float font-display text-[17rem] leading-none bg-gradient-to-b from-primary/50 to-primary/0 bg-clip-text text-transparent">
                                        {'\u265E\uFE0E'}
                                    </div>
                                </div>
                                <div className="relative p-6 lg:p-10 max-w-2xl">
                                    <p className="text-muted-foreground text-sm flex items-center gap-2 min-h-5">
                                        {state.onlineCount.data != null && (
                                            <>
                                                <span className="relative flex h-2 w-2">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                                                </span>
                                                {state.onlineCount.data.toLocaleString('en-US')} players online now
                                            </>
                                        )}
                                    </p>
                                    <h1 className="font-display text-3xl lg:text-5xl font-black tracking-tight mt-3 leading-[1.05]">
                                        {heroTitle}
                                    </h1>
                                    <p className="text-muted-foreground mt-3 max-w-md">{heroSub}</p>

                                    <QuickPlayPicker />
                                </div>
                            </section>

                            {/* STATS STRIP */}
                            <StatsStrip section={state.stats} onRetry={reload} />

                            {/* MAIN GRID */}
                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                                {/* LEFT (wide) */}
                                <div className="xl:col-span-2 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                                        <FriendCard api={api} />
                                        <ComingSoon active={!FEATURES.playComputer} className="h-full">
                                            <ComputerCard />
                                        </ComingSoon>
                                    </div>

                                    <Panel
                                        title="Recent games" icon={<History size={18} className="text-primary" />}
                                        action={FEATURES.archive
                                            ? <button onClick={() => router.push('/archive')} className={cn('text-xs text-primary font-semibold hover:underline rounded', focusRing)}>View all</button>
                                            : <SoonBadge label="Archive soon" />}
                                    >
                                        <RecentGamesBody
                                            section={{
                                                data: recentGameHistory,
                                                status: "success",
                                            }}
                                            onRetry={reload}
                                        />
                                    </Panel>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <OpeningCard section={openingSection} soon={!FEATURES.learn} onRetry={reload} />
                                        <Leaderboard section={leaderboardSection} soon={!FEATURES.leaderboard} username={username} rating={rating} onRetry={reload} />
                                    </div>
                                </div>

                                {/* RIGHT (narrow) */}
                                <div className="space-y-6">
                                    {isNew && state.activeGame.data === null
                                        ? <GettingStarted hasFriends={(state.friends.data?.length ?? 0) > 0} />
                                        : <ContinueGame section={state.activeGame} onRetry={reload} />}
                                    <PuzzleCard section={puzzleSection} soon={!FEATURES.puzzles} onRetry={reload} />
                                    <FriendsOnline section={state.friends} api={api} onRetry={reload} />
                                    <TournamentCard section={tournamentSection} soon={!FEATURES.tournaments} api={api} onRetry={reload} />
                                </div>
                            </div>
                        </div>
                    </main>
                </div>

                {/* --- 4. MOBILE BOTTOM NAV (only implemented pages) --- */}
                <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-card/90 backdrop-blur-md border-t border-border flex items-center justify-around px-2 pb-safe z-50">
                    <MobileTab icon={<Home size={20} />} label="Home" href="/dashboard" />
                    <MobileTab icon={<Users size={20} />} label="Social" href="/social" />
                    <button
                        aria-label="Quick play"
                        onClick={() => router.push('/quick-play')}
                        className={cn('-mt-6 h-14 w-14 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 flex items-center justify-center', focusRing)}
                    >
                        <Play size={24} className="fill-current" />
                    </button>
                    <MobileTab icon={<User size={20} />} label="Profile" href="/profile" />
                    <MobileTab icon={<Menu size={20} />} label="More" onClick={() => setIsSidebarOpen(true)} />
                </nav>
            </div>

            {IS_DEV && <DevDataSwitcher source={source} onChange={setSource} />}
        </div>
    );
}

/* =========================================================================
   DEV TOOL: switch between live API and mock players (development only)
   ========================================================================= */

function DevDataSwitcher({ source, onChange }: { source: DataSource; onChange: (s: DataSource) => void }) {
    const [open, setOpen] = useState(false);
    const options: { value: DataSource; label: string }[] = [
        { value: 'mock-full', label: 'Active player' },
        { value: 'mock-empty', label: 'New player' },
        { value: 'mock-error', label: 'Server error' },
        { value: 'api', label: 'Live API' },
    ];
    return (
        <div className="fixed bottom-20 right-4 z-50 lg:bottom-4">
            {open ? (
                <div className="w-48 rounded-2xl border border-border bg-card p-2 shadow-2xl">
                    <div className="flex items-center justify-between px-2 pb-1.5 pt-1">
                        <p className="text-xs font-bold">Dev data source</p>
                        <button aria-label="Close dev panel" onClick={() => setOpen(false)} className={cn('rounded p-0.5', focusRing)}><X size={14} /></button>
                    </div>
                    {options.map(o => (
                        <button
                            key={o.value} onClick={() => onChange(o.value)} aria-pressed={source === o.value}
                            className={cn('flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors',
                                source === o.value ? 'bg-primary text-primary-foreground' : 'hover:bg-accent', focusRing)}
                        >
                            {o.label} {source === o.value && <Check size={12} />}
                        </button>
                    ))}
                </div>
            ) : (
                <button
                    onClick={() => setOpen(true)}
                    className={cn('rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold shadow-lg hover:bg-accent', focusRing)}
                >
                    Dev: {options.find(o => o.value === source)?.label}
                </button>
            )}
        </div>
    );
}

/* =========================================================================
   COMING SOON HELPERS
   ========================================================================= */

function SoonBadge({ label = 'Soon' }: { label?: string }) {
    return <span className="shrink-0 rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[11px] font-bold text-muted-foreground">{label}</span>;
}

/**
 * Dims its children and puts a "Coming soon" pill on top.
 * The <fieldset disabled> also disables every button/input inside, including for keyboard users.
 */
function ComingSoon({ active, children, className }: { active: boolean; children: React.ReactNode; className?: string }) {
    if (!active) return <>{children}</>;
    return (
        <div className={cn('relative', className)}>
            <fieldset disabled aria-hidden className="m-0 h-full min-w-0 border-0 p-0 opacity-45 saturate-50 [filter:blur(1.5px)] pointer-events-none select-none">
                {children}
            </fieldset>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/90 px-3 py-1.5 text-xs font-bold shadow-lg">
                    <Hourglass size={13} className="text-primary" /> Coming soon
                </span>
            </div>
        </div>
    );
}

/* =========================================================================
   HEADER PIECES
   ========================================================================= */

function RatingPill({ rating }: { rating: number }) {
    const router = useRouter();
    const content = (
        <>
            <Trophy size={14} className="text-primary" />
            <span className="hidden sm:inline text-xs text-muted-foreground font-medium">Rating</span>
            <span className="text-xs lg:text-sm font-bold text-primary tabular-nums">{rating}</span>
        </>
    );
    const base = 'bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20 flex items-center gap-2';
    return FEATURES.stats
        ? <button onClick={() => router.push('/stats')} title="Your stats" className={cn(base, 'hover:bg-primary/15 transition-colors', focusRing)}>{content}</button>
        : <div className={base}>{content}</div>;
}

function NotificationsMenu({ section, items }: { section: Section<AppNotification[]>; items: AppNotification[] }) {
    return (
        <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-card border border-border rounded-2xl shadow-2xl p-2 z-110">
            <p className="px-3 py-2 text-sm font-bold">Notifications</p>
            {section.status === 'loading' && <div className="space-y-2 p-1"><Skeleton className="h-12 rounded-xl" /><Skeleton className="h-12 rounded-xl" /></div>}
            {section.status === 'error' && <p role="alert" className="px-3 py-4 text-xs text-muted-foreground">Couldn&apos;t load notifications. {section.error}</p>}
            {section.status === 'success' && items.length === 0 && (
                <p className="px-3 py-6 text-center text-xs text-muted-foreground">You&apos;re all caught up.</p>
            )}
            {items.map(n => (
                <div key={n.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-accent transition-colors">
                    <span className={cn('mt-1.5 h-2 w-2 rounded-full shrink-0', n.unread ? 'bg-primary' : 'bg-border')} />
                    <div className="min-w-0">
                        <p className="text-sm leading-snug">{n.text}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(n.createdAt)}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

/* =========================================================================
   HERO: QUICK PLAY PICKER
   ========================================================================= */

function QuickPlayPicker() {
    const router = useRouter();
    const [time, setTime] = useState<TimeControl>(DEFAULT_TIME_CONTROL);

    // encodeURIComponent: a raw "+" in a URL is read as a space.
    const start = () => router.push(`/quick-play?time=${encodeURIComponent(time)}`);

    return (
        <div className="mt-6 space-y-4">
            <div role="radiogroup" aria-label="Time control" className="grid grid-cols-4 gap-2 max-w-md">
                {TIME_CONTROLS.map(tc => {
                    const Icon = CATEGORY_ICON[tc.label];
                    const selected = time === tc.value;
                    return (
                        <button
                            key={tc.value} role="radio" aria-checked={selected}
                            onClick={() => setTime(tc.value)}
                            className={cn(
                                'flex flex-col items-center gap-0.5 py-2.5 rounded-xl border transition-all',
                                selected
                                    ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/25'
                                    : 'bg-background/60 border-border hover:border-primary/50',
                                focusRing
                            )}
                        >
                            <span className="text-base font-bold tabular-nums">{tc.value}</span>
                            <span className={cn('flex items-center gap-1 text-[11px] font-medium', selected ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                                <Icon size={11} /> {tc.label}
                            </span>
                        </button>
                    );
                })}
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <button
                    onClick={start}
                    className={cn('inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 transition-all', focusRing)}
                >
                    <Play size={18} className="fill-current" /> Play {time}
                </button>
                <button
                    onClick={() => router.push('/quick-play?custom=1')}
                    disabled={!FEATURES.customGame}
                    className={cn('inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl border border-border bg-background/60 text-sm font-semibold transition-colors',
                        FEATURES.customGame ? 'hover:border-primary/50' : 'opacity-60 cursor-not-allowed', focusRing)}
                >
                    Custom game {!FEATURES.customGame && <SoonBadge />}
                </button>
            </div>
        </div>
    );
}

/* =========================================================================
   STATS STRIP
   ========================================================================= */

function StatsStrip({ section, onRetry }: { section: Section<PlayerStats>; onRetry: () => void }) {
    if (section.status === 'error') return <SectionError what="your stats" message={section.error} onRetry={onRetry} />;
    const stats = section.data;
    if (!stats) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[0, 1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-3xl" />)}
            </div>
        );
    }

    const isNew = stats.totalGames === 0;
    const history = stats.ratingHistory;
    const delta = history.length > 1 ? history[history.length - 1] - history[0] : 0;

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Rating" icon={<Trophy size={15} className="text-primary" />}>
                <div className="flex items-end justify-between gap-2">
                    <div>
                        <CountUp value={stats.rating} />
                        <p className={cn('text-xs font-semibold mt-1', isNew ? 'text-muted-foreground' : delta >= 0 ? 'text-emerald-500' : 'text-rose-500')}>
                            {isNew ? 'Starting rating' : `${delta >= 0 ? '+' : ''}${delta} last ${history.length} games`}
                        </p>
                    </div>
                    <Sparkline data={history} />
                </div>
            </StatCard>

            <StatCard label="Win rate" icon={<Target size={15} className="text-emerald-500" />}>
                {isNew ? (
                    <>
                        <span className="font-display text-3xl lg:text-4xl font-black text-muted-foreground/50">&mdash;</span>
                        <p className="text-xs text-muted-foreground mt-1">Play a game to see this</p>
                    </>
                ) : (
                    <>
                        <CountUp value={stats.winRate} suffix="%" />
                        <div className="mt-2 h-1.5 rounded-full bg-border overflow-hidden">
                            <div className="h-full rounded-full bg-emerald-500 transition-all duration-1000" style={{ width: `${stats.winRate}%` }} />
                        </div>
                    </>
                )}
            </StatCard>

            <StatCard label="Win streak" icon={<Flame size={15} className="text-orange-500" />}>
                <CountUp value={stats.streak} />
                <div className="mt-2 flex gap-1" aria-hidden>
                    {Array.from({ length: 7 }).map((_, i) => (
                        <span key={i} className={cn('h-1.5 flex-1 rounded-full', i < stats.streak ? 'bg-orange-500' : 'bg-border')} />
                    ))}
                </div>
                {stats.streak === 0 && <p className="text-xs text-muted-foreground mt-1.5">{isNew ? 'Win your first game' : 'Win a game to start one'}</p>}
            </StatCard>

            <StatCard label="Games today" icon={<Clock size={15} className="text-blue-500" />}>
                <div className="flex items-baseline gap-1">
                    <CountUp value={stats.gamesToday} />
                    <span className="text-sm text-muted-foreground font-medium">/ {stats.dailyGoal} goal</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-border overflow-hidden">
                    <div className="h-full rounded-full bg-blue-500 transition-all duration-1000" style={{ width: `${Math.min(100, (stats.gamesToday / stats.dailyGoal) * 100)}%` }} />
                </div>
            </StatCard>
        </div>
    );
}

function StatCard({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="rounded-3xl border border-border bg-card/70 backdrop-blur-xl p-4 lg:p-5">
            <p className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">{icon}{label}</p>
            {children}
        </div>
    );
}

function CountUp({ value, suffix = '' }: { value: number; suffix?: string }) {
    const v = useCountUp(value);
    return <span className="font-display text-3xl lg:text-4xl font-black tabular-nums tracking-tight">{v}{suffix}</span>;
}

function Sparkline({ data }: { data: number[] }) {
    const w = 96, h = 36;
    // New player: no history yet, so draw a dashed baseline.
    if (data.length < 2) {
        return (
            <svg viewBox={`0 0 ${w} ${h}`} className="h-9 w-24 shrink-0 text-border" fill="none" aria-hidden>
                <line x1="0" y1={h / 2} x2={w} y2={h / 2} stroke="currentColor" strokeWidth="2" strokeDasharray="4 5" strokeLinecap="round" />
            </svg>
        );
    }
    const min = Math.min(...data), max = Math.max(...data);
    const pts = data.map((v, i) => [(i / (data.length - 1)) * w, h - 3 - ((v - min) / (max - min || 1)) * (h - 6)]);
    const last = pts[pts.length - 1];
    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="h-9 w-24 shrink-0 text-primary" fill="none" aria-hidden>
            <polyline points={pts.map(p => p.join(',')).join(' ')} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={last[0]} cy={last[1]} r="3" fill="currentColor" />
        </svg>
    );
}

/* =========================================================================
   MODE CARDS: FRIEND + COMPUTER
   ========================================================================= */

type Feedback = { kind: 'idle' | 'sending' | 'ok' | 'error'; message?: string };

function FriendCard({ api }: { api: DashboardApi }) {
    const [username, setUsername] = useState('');
    const [time, setTime] = useState<TimeControl>(DEFAULT_TIME_CONTROL);
    const [feedback, setFeedback] = useState<Feedback>({ kind: 'idle' });
    const busy = feedback.kind === 'sending';

    const sendChallenge = async () => {
        const name = username.trim();
        if (!name || busy) return;
        setFeedback({ kind: 'sending' });
        try {
            await api.createChallenge({ username: name, timeControl: time });
            setFeedback({ kind: 'ok', message: `Challenge sent to ${name}.` });
            setUsername('');
        } catch (e) {
            setFeedback({ kind: 'error', message: getErrorMessage(e) });
        }
    };

    const copyInviteLink = async () => {
        if (busy) return;
        setFeedback({ kind: 'sending' });
        try {
            const { url } = await api.createInviteLink({ timeControl: time });
            try {
                await navigator.clipboard.writeText(url);
                setFeedback({ kind: 'ok', message: 'Invite link copied.' });
            } catch {
                setFeedback({ kind: 'ok', message: `Invite link: ${url}` });
            }
        } catch (e) {
            setFeedback({ kind: 'error', message: getErrorMessage(e) });
        }
    };

    return (
        <div className="group relative h-full overflow-hidden rounded-3xl border border-border bg-card/70 backdrop-blur-xl p-6 hover:border-blue-500/50 transition-colors">
            <div aria-hidden className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-blue-500/15 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center border border-border mb-4">
                    <Users className="text-blue-500" />
                </div>
                <h3 className="font-display font-bold text-lg">Play a friend</h3>
                <p className="text-xs text-muted-foreground mt-1">Challenge someone by username or share an invite link.</p>

                <div role="radiogroup" aria-label="Time control" className="mt-4 grid grid-cols-4 gap-1 p-1 rounded-xl bg-background/60 border border-border text-xs font-semibold">
                    {TIME_CONTROLS.map(tc => (
                        <button
                            key={tc.value} role="radio" aria-checked={time === tc.value} onClick={() => setTime(tc.value)}
                            className={cn('py-1.5 rounded-lg tabular-nums transition-colors', time === tc.value ? 'bg-blue-500 text-white' : 'hover:bg-accent', focusRing)}
                        >
                            {tc.value}
                        </button>
                    ))}
                </div>

                <div className="mt-3 flex gap-2">
                    <input
                        value={username} onChange={e => setUsername(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && sendChallenge()}
                        placeholder="Username" aria-label="Friend's username"
                        className={cn('min-w-0 flex-1 rounded-xl border border-border bg-background/60 px-3 py-2.5 text-sm placeholder:text-muted-foreground', focusRing)}
                    />
                    <button
                        onClick={sendChallenge} disabled={!username.trim() || busy}
                        className={cn('px-4 rounded-xl bg-blue-500 text-white text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-500/90 transition-colors', focusRing)}
                    >
                        {busy ? 'Sending...' : 'Challenge'}
                    </button>
                </div>

                <button onClick={copyInviteLink} disabled={busy} className={cn('mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-500 hover:underline rounded disabled:opacity-50', focusRing)}>
                    <Link2 size={13} /> Copy an invite link
                </button>

                <p role="status" aria-live="polite" className={cn('mt-2 min-h-4 text-xs break-words', feedback.kind === 'error' ? 'text-rose-500' : 'text-emerald-500')}>
                    {feedback.message}
                </p>
            </div>
        </div>
    );
}

function ComputerCard() {
    const router = useRouter();
    const [level, setLevel] = useState(4);
    const [color, setColor] = useState<'white' | 'black' | 'random'>('random');

    return (
        <div className="group relative h-full overflow-hidden rounded-3xl border border-border bg-card/70 backdrop-blur-xl p-6 hover:border-purple-500/50 transition-colors">
            <div aria-hidden className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-purple-500/15 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center border border-border mb-4">
                    <Bot className="text-purple-500" />
                </div>
                <h3 className="font-display font-bold text-lg">Play the computer</h3>
                <p className="text-xs text-muted-foreground mt-1">Practice against Stockfish, up to level 8.</p>

                <div className="mt-5">
                    <div className="flex items-center justify-between text-xs mb-2">
                        <label htmlFor="bot-level" className="font-semibold">Level {level}</label>
                        <span className="text-muted-foreground">{BOT_LEVELS[level - 1]}</span>
                    </div>
                    <input
                        id="bot-level" type="range" min={1} max={8} value={level}
                        onChange={e => setLevel(Number(e.target.value))}
                        className={cn('w-full accent-purple-500 cursor-pointer', focusRing)}
                    />
                </div>

                <div role="radiogroup" aria-label="Play as" className="mt-4 grid grid-cols-3 gap-1 p-1 rounded-xl bg-background/60 border border-border text-xs font-semibold">
                    {(['white', 'black', 'random'] as const).map(c => (
                        <button
                            key={c} role="radio" aria-checked={color === c} onClick={() => setColor(c)}
                            className={cn('py-1.5 rounded-lg capitalize transition-colors', color === c ? 'bg-purple-500 text-white' : 'hover:bg-accent', focusRing)}
                        >
                            {c}
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => router.push(`/playBot?level=${level}&color=${color}`)}
                    className={cn('mt-4 w-full py-2.5 rounded-xl bg-purple-500 text-white font-bold text-sm hover:bg-purple-500/90 transition-colors', focusRing)}
                >
                    Start game
                </button>
            </div>
        </div>
    );
}

/* =========================================================================
   RECENT GAMES
   ========================================================================= */

function RecentGamesBody({ section, onRetry }: { section: Section<RecentGame[]>; onRetry: () => void }) {
    const router = useRouter();
    if (section.status === 'error') return <SectionError what="recent games" message={section.error} onRetry={onRetry} />;
    if (!section.data) return <SkeletonRows rows={4} height="h-16" />;
    if (section.data.length === 0) {
        return (
            <EmptyState
                icon={<Swords size={28} />} title="No games yet"
                text="Your finished games will show up here with a board preview and rating change."
                cta="Play your first game" onClick={() => router.push('/quick-play')}
            />
        );
    }
    return (
        <div className="space-y-2.5">
            {section.data.map(g => (
                <RecentGameRow key={g.id} game={g} onReview={FEATURES.analysis ? () => router.push(`/analysis/${g.id}`) : undefined} />
            ))}
        </div>
    );
}

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = ["8", "7", "6", "5", "4", "3", "2", "1"];

function RecentGameRow({ game, onReview }: { game: RecentGame; onReview?: () => void }) {
    const styles = {
        win: { chip: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', label: 'Win', elo: 'text-emerald-500' },
        loss: { chip: 'text-rose-500 bg-rose-500/10 border-rose-500/20', label: 'Loss', elo: 'text-rose-500' },
        draw: { chip: 'text-muted-foreground bg-muted/50 border-border', label: 'Draw', elo: 'text-muted-foreground' },
    }[game.result];

    const [boardFlipped, setBoardFlipped] = useState(false);
    const displayGame = new Chess();
    displayGame.load(game.fen);
    const [boardTheme, setBoardTheme] = useState<BoardTheme>("green");
    const [pieceStyle, setPieceStyle] = useState<pieceStyleType>("standard");

    const renderBoard = () => {
        const ranks = boardFlipped ? [...RANKS].reverse() : RANKS;
        const files = boardFlipped ? [...FILES].reverse() : FILES;

        return ranks.map(rank => files.map(file => {
            const sq = `${file}${rank}` as Square;
            const piece = displayGame.get(sq);
            const fi = FILES.indexOf(file), ri = RANKS.indexOf(rank);
            const isLight = (fi + ri) % 2 === 0;

            return (
                <div key={sq}
                    style={{
                        backgroundColor: isLight ? getColor(boardTheme).light : getColor(boardTheme).dark
                    }}
                    className="relative flex items-center justify-center select-none overflow-hidden aspect-square"
                >
                    {/* Piece - scaled down for mini board */}
                    {piece && (
                        <span className="relative z-20 w-full h-full flex items-center justify-center leading-none">
                            <img
                                src={getPiece(piece.type, piece.color, pieceStyle)}
                                className="w-full h-full object-contain p-[1px]"
                                alt=""
                            />
                        </span>
                    )}
                </div>
            );
        }));
    };

    return (
        <div className="group flex items-center gap-3 sm:gap-4 p-2.5 pr-3 rounded-2xl bg-background/50 border border-border/60 hover:border-primary/40 transition-colors">
            {/* MINI BOARD CONTAINER - Fixed small width/height and grid layout */}
            <div
                className="relative w-20 h-20 sm:w-20 sm:h-20 shrink-0 grid grid-cols-8 grid-rows-8 rounded-lg overflow-hidden border border-border/40 shadow-sm select-none"
                onContextMenu={e => e.preventDefault()}
            >
                {renderBoard()}
            </div>

            <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2">
                    <span className="font-bold text-sm truncate">{game.opponent}</span>
                    <span className="text-[11px] text-muted-foreground tabular-nums">({game.opponentRating})</span>
                </p>
                <p className="text-[11px] text-muted-foreground truncate">{game.opening}, {game.timeControl}, {timeAgo(game.playedAt)}</p>
            </div>

            <span className={cn('hidden sm:inline-flex px-2.5 py-1 rounded-full border text-xs font-bold', styles.chip)}>
                {styles.label}
            </span>

            <span className={cn('w-9 text-right text-sm font-bold tabular-nums', styles.elo)}>
                {game.eloChange > 0 ? '+' : '-'}{Math.abs(game.eloChange) || 14}
            </span>

            {onReview && (
                <button
                    onClick={onReview}
                    className={cn('px-3 py-1.5 rounded-lg bg-card border border-border text-xs font-semibold hover:bg-accent transition-all lg:opacity-0 lg:group-hover:opacity-100 focus-visible:opacity-100', focusRing)}
                >
                    Review
                </button>
            )}
        </div>
    );
}

/* =========================================================================
   RIGHT COLUMN
   ========================================================================= */

function GettingStarted({ hasFriends }: { hasFriends: boolean }) {
    const router = useRouter();
    const steps = [
        { title: 'Play your first game', text: 'Pick a time control and find an opponent.', done: false, cta: 'Quick play', go: () => router.push('/quick-play') },
        { title: 'Add a friend', text: 'Challenge people you know.', done: hasFriends, cta: 'Find friends', go: () => router.push('/social') },
    ];
    return (
        <section className="relative overflow-hidden rounded-3xl border border-primary/40 bg-primary/5 p-5">
            <div aria-hidden className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-primary/20 blur-2xl" />
            <h3 className="relative font-display font-bold text-base mb-4">Getting started</h3>
            <ul className="relative space-y-3">
                {steps.map(s => (
                    <li key={s.title} className="flex items-start gap-3">
                        <span className={cn('mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border', s.done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-border bg-background')}>
                            {s.done && <Check size={14} />}
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold">{s.title}</p>
                            <p className="text-xs text-muted-foreground">{s.text}</p>
                        </div>
                        {!s.done && (
                            <button onClick={s.go} className={cn('shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-90 transition-opacity', focusRing)}>{s.cta}</button>
                        )}
                    </li>
                ))}
            </ul>
        </section>
    );
}

function ContinueGame({ section, onRetry }: { section: Section<ActiveGame | null>; onRetry: () => void }) {
    const router = useRouter();
    if (section.status === 'loading' || section.status === 'idle') return <Skeleton className="h-52 rounded-3xl" />;
    if (section.status === 'error') {
        return <Panel title="Continue playing" icon={<Hourglass size={18} className="text-primary" />}><SectionError what="your active game" message={section.error} onRetry={onRetry} /></Panel>;
    }
    const game = section.data;
    if (!game) {
        return (
            <Panel title="Continue playing" icon={<Hourglass size={18} className="text-primary" />}>
                <EmptyState compact icon={<Swords size={24} />} title="No active games" text="Start one and it will wait for you here." cta="Quick play" onClick={() => router.push('/quick-play')} />
            </Panel>
        );
    }
    return (
        <section className="relative overflow-hidden rounded-3xl border border-primary/40 bg-primary/5 p-5">
            <div aria-hidden className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-primary/20 blur-2xl" />
            <div className="relative flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-base">Continue playing</h3>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-primary-foreground">
                    <Clock size={11} /> Your move
                </span>
            </div>
            <div className="relative flex gap-4">
                <MiniBoard fen={game.fen} className="w-24 shrink-0" />
                <div className="min-w-0">
                    <p className="font-bold text-sm truncate">vs {game.opponent}</p>
                    <p className="text-xs text-muted-foreground tabular-nums">{game.opponentRating} rating, {game.timeControl}</p>
                    <p className="mt-2 text-xs text-muted-foreground">Time left</p>
                    <p className="font-display text-2xl font-black tabular-nums leading-none">{formatClock(game.timeLeftSeconds)}</p>
                </div>
            </div>
            <button
                onClick={() => router.push(`/game/${game.id}`)}
                className={cn('relative mt-4 w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/25 hover:opacity-90 transition-opacity', focusRing)}
            >
                Resume game
            </button>
        </section>
    );
}

function PuzzleCard({ section, soon, onRetry }: { section: Section<DailyPuzzle>; soon: boolean; onRetry: () => void }) {
    const router = useRouter();
    const puzzle = section.data;
    return (
        <Panel
            title="Daily puzzle" icon={<Sparkles size={18} className="text-amber-500" />} soon={soon}
            action={puzzle && <span className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-500"><Flame size={12} />{puzzle.solvedStreak} day streak</span>}
        >
            {section.status === 'error' ? <SectionError what="the daily puzzle" message={section.error} onRetry={onRetry} />
                : !puzzle ? <Skeleton className="h-56 rounded-2xl" /> : (
                    <>
                        <MiniBoard fen={puzzle.fen} highlight={puzzle.highlight} className="w-full" />
                        <div className="mt-3 flex items-center justify-between text-xs">
                            <span className="font-semibold">{puzzle.toMove}</span>
                            <span className="px-2 py-0.5 rounded-full border border-amber-500/20 bg-amber-500/10 font-bold text-amber-500">{puzzle.title}</span>
                        </div>
                        <button
                            onClick={() => router.push('/puzzles')}
                            className={cn('mt-3 w-full py-2.5 rounded-xl border border-border hover:border-primary/50 bg-background/60 font-semibold text-xs transition-colors flex items-center justify-center gap-2', focusRing)}
                        >
                            Solve puzzle <ArrowUpRight size={14} />
                        </button>
                    </>
                )}
        </Panel>
    );
}

type ChallengeState = 'sending' | 'sent' | 'error';

function FriendsOnline({ section, api, onRetry }: { section: Section<Friend[]>; api: DashboardApi; onRetry: () => void }) {
    const router = useRouter();
    const [status, setStatus] = useState<Record<string, ChallengeState>>({});

    const challenge = async (f: Friend) => {
        setStatus(p => ({ ...p, [f.id]: 'sending' }));
        try {
            await api.createChallenge({ opponentId: f.id, timeControl: DEFAULT_TIME_CONTROL });
            setStatus(p => ({ ...p, [f.id]: 'sent' }));
        } catch {
            setStatus(p => ({ ...p, [f.id]: 'error' }));
        }
    };
    const label = (s?: ChallengeState) => s === 'sending' ? 'Sending...' : s === 'sent' ? 'Sent' : s === 'error' ? 'Retry' : 'Challenge';

    return (
        <Panel
            title="Friends online" icon={<Users size={18} className="text-blue-500" />}
            action={<button onClick={() => router.push('/social')} className={cn('text-xs text-primary font-semibold hover:underline rounded', focusRing)}>See all</button>}
        >
            {section.status === 'error' ? <SectionError what="your friends" message={section.error} onRetry={onRetry} />
                : !section.data ? <SkeletonRows rows={3} height="h-11" />
                    : section.data.length === 0 ? (
                        <EmptyState compact icon={<Users size={24} />} title="No friends yet" text="Add friends to challenge them in one click." cta="Find friends" onClick={() => router.push('/social')} />
                    ) : (
                        <ul className="space-y-1">
                            {section.data.map(f => (
                                <li key={f.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-accent/60 transition-colors">
                                    <div className="relative">
                                        <Avatar name={f.name} size="h-9 w-9" />
                                        <span className={cn('absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card', f.status === 'online' ? 'bg-emerald-500' : 'bg-amber-500')} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold truncate">{f.name}</p>
                                        <p className="text-[11px] text-muted-foreground">{f.status === 'online' ? 'Online' : 'In a game'}, {f.rating}</p>
                                    </div>
                                    <button
                                        onClick={() => challenge(f)}
                                        title={`Challenge to ${DEFAULT_TIME_CONTROL}`}
                                        disabled={f.status !== 'online' || status[f.id] === 'sending' || status[f.id] === 'sent'}
                                        className={cn('px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors', status[f.id] === 'error' && 'border-rose-500/50 text-rose-500', focusRing)}
                                    >
                                        {label(status[f.id])}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
        </Panel>
    );
}

function TournamentCard({ section, soon, api, onRetry }: { section: Section<Tournament>; soon: boolean; api: DashboardApi; onRetry: () => void }) {
    const t = section.data;
    // Fixed value for the preview so server and client render the same text.
    const initialSeconds = soon || !t ? 2 * 3600 + 14 * 60 + 9 : Math.max(0, Math.floor((Date.parse(t.startsAt) - Date.now()) / 1000));
    return (
        <Panel title={t?.name ?? 'Tournament'} icon={<Trophy size={18} className="text-amber-500" />} soon={soon}>
            {section.status === 'error' ? <SectionError what="the next tournament" message={section.error} onRetry={onRetry} />
                : !t ? <Skeleton className="h-28 rounded-2xl" />
                    : <TournamentBody key={t.id} tournament={t} initialSeconds={initialSeconds} api={api} />}
        </Panel>
    );
}

function TournamentBody({ tournament, initialSeconds, api }: { tournament: Tournament; initialSeconds: number; api: DashboardApi }) {
    const { h, m, sec } = useCountdown(initialSeconds);
    const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
    const pad = (n: number) => String(n).padStart(2, '0');

    const register = async () => {
        setState('sending');
        try { await api.registerForTournament(tournament.id); setState('done'); } catch { setState('error'); }
    };

    return (
        <>
            <p className="text-xs text-muted-foreground">Opens in</p>
            <div className="mt-1 flex items-baseline gap-1 font-display font-black tabular-nums">
                <span className="text-3xl">{pad(h)}</span><span className="text-xs text-muted-foreground mr-2">h</span>
                <span className="text-3xl">{pad(m)}</span><span className="text-xs text-muted-foreground mr-2">m</span>
                <span className="text-3xl">{pad(sec)}</span><span className="text-xs text-muted-foreground">s</span>
            </div>
            <button
                onClick={register} disabled={state === 'sending' || state === 'done'}
                className={cn('mt-4 w-full py-2.5 rounded-xl border text-xs font-semibold transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed',
                    state === 'done' ? 'bg-primary/10 border-primary/40 text-primary' : 'border-border bg-background/60 hover:border-primary/50', focusRing)}
            >
                {state === 'done' ? <><Check size={14} /> Registered</> : state === 'sending' ? 'Registering...' : state === 'error' ? 'Try again' : <><Bell size={14} /> Register</>}
            </button>
        </>
    );
}

/* =========================================================================
   BOTTOM ROW
   ========================================================================= */

function OpeningCard({ section, soon, onRetry }: { section: Section<OpeningOfWeek>; soon: boolean; onRetry: () => void }) {
    const router = useRouter();
    const o = section.data;
    return (
        <Panel title="Opening of the week" icon={<BookOpen size={18} className="text-primary" />} soon={soon}>
            {section.status === 'error' ? <SectionError what="the opening" message={section.error} onRetry={onRetry} />
                : !o ? <Skeleton className="h-28 rounded-2xl" /> : (
                    <>
                        <div className="flex gap-4">
                            <MiniBoard fen={o.fen} className="w-24 shrink-0" />
                            <div className="min-w-0">
                                <p className="font-display font-bold">{o.name}</p>
                                <p className="text-xs text-muted-foreground mt-1 tabular-nums">{o.moves}</p>
                                <p className="text-xs text-muted-foreground mt-2">{o.description}</p>
                            </div>
                        </div>
                        <button onClick={() => router.push('/learn')} className={cn('mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline rounded', focusRing)}>
                            Study this opening <ChevronRight size={14} />
                        </button>
                    </>
                )}
        </Panel>
    );
}

function Leaderboard({ section, soon, username, rating, onRetry }: { section: Section<LeaderboardData>; soon: boolean; username: string; rating: number; onRetry: () => void }) {
    const router = useRouter();
    const board = section.data;
    return (
        <Panel
            title="Top players" icon={<Crown size={18} className="text-amber-500" />} soon={soon}
            action={<button onClick={() => router.push('/leaderboard')} className={cn('text-xs text-primary font-semibold hover:underline rounded', focusRing)}>Full board</button>}
        >
            {section.status === 'error' ? <SectionError what="the leaderboard" message={section.error} onRetry={onRetry} />
                : !board ? <SkeletonRows rows={5} height="h-8" /> : (
                    <>
                        <ol className="space-y-1">
                            {board.top.map(p => (
                                <li key={p.rank} className="flex items-center gap-3 px-2 py-1.5 rounded-lg">
                                    <span className={cn('w-5 text-center text-xs font-black tabular-nums', p.rank === 1 ? 'text-amber-500' : 'text-muted-foreground')}>{p.rank}</span>
                                    <span className="flex-1 text-sm font-medium truncate">{p.name}</span>
                                    <span className="text-xs font-bold tabular-nums">{p.rating}</span>
                                </li>
                            ))}
                        </ol>
                        <div className="mt-2 flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2">
                            <span className="w-5 text-center text-xs font-black text-primary tabular-nums">{board.userRank ?? '-'}</span>
                            <span className="flex-1 text-sm font-semibold truncate">
                                {username} (you){board.userRank === null && <span className="font-normal text-muted-foreground">, unranked</span>}
                            </span>
                            <span className="text-xs font-bold tabular-nums">{rating}</span>
                        </div>
                    </>
                )}
        </Panel>
    );
}

/* =========================================================================
   SHARED UI PIECES
   ========================================================================= */

function Panel({ title, icon, action, children, soon = false, className }: { title: string; icon?: React.ReactNode; action?: React.ReactNode; children: React.ReactNode; soon?: boolean; className?: string }) {
    return (
        <section className={cn('rounded-3xl border border-border bg-card/70 backdrop-blur-xl p-5 lg:p-6', className)}>
            <div className="flex items-center justify-between gap-3 mb-4">
                <h3 className="flex items-center gap-2 font-display font-bold text-base min-w-0">{icon}<span className="truncate">{title}</span></h3>
                {soon ? <SoonBadge /> : action}
            </div>
            <ComingSoon active={soon}>{children}</ComingSoon>
        </section>
    );
}

function EmptyState({ icon, title, text, cta, onClick, compact = false }: { icon: React.ReactNode; title: string; text: string; cta: string; onClick: () => void; compact?: boolean }) {
    return (
        <div className={cn('flex flex-col items-center text-center rounded-2xl border border-dashed border-border', compact ? 'p-5' : 'p-10')}>
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">{icon}</div>
            <p className="font-bold text-sm">{title}</p>
            <p className="mt-1 max-w-xs text-xs text-muted-foreground">{text}</p>
            <button onClick={onClick} className={cn('mt-4 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:opacity-90 transition-opacity', focusRing)}>{cta}</button>
        </div>
    );
}

function SectionError({ what, message, onRetry }: { what: string; message?: string; onRetry: () => void }) {
    return (
        <div role="alert" className="flex flex-col items-center rounded-2xl border border-dashed border-rose-500/30 bg-rose-500/5 p-5 text-center">
            <p className="text-sm font-bold">Couldn&apos;t load {what}</p>
            {message && <p className="mt-1 max-w-xs text-xs text-muted-foreground">{message}</p>}
            <button onClick={onRetry} className={cn('mt-3 rounded-xl border border-border bg-card px-4 py-1.5 text-xs font-semibold hover:bg-accent transition-colors', focusRing)}>Try again</button>
        </div>
    );
}

function Skeleton({ className }: { className?: string }) {
    return <div className={cn('animate-pulse bg-muted/60', className ?? 'rounded-xl')} />;
}

function SkeletonRows({ rows, height }: { rows: number; height: string }) {
    return <div className="space-y-2.5">{Array.from({ length: rows }).map((_, i) => <Skeleton key={i} className={cn('w-full rounded-2xl', height)} />)}</div>;
}

function Avatar({ name, src, size = 'h-8 w-8' }: { name: string; src?: string; size?: string }) {
    return (
        <div className={cn('rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold overflow-hidden shrink-0', size)}>
            {src ? <img src={src} alt="" className="w-full h-full object-cover" /> : name.charAt(0).toUpperCase() || 'U'}
        </div>
    );
}

/* --- Mini chessboard rendered from a FEN string --- */

const GLYPHS: Record<string, string> = { k: '\u265A', q: '\u265B', r: '\u265C', b: '\u265D', n: '\u265E', p: '\u265F' };

function parseFen(fen: string) {
    return fen.split(' ')[0].split('/').map(row => {
        const out: (string | null)[] = [];
        for (const ch of row) {
            if (/\d/.test(ch)) for (let i = 0; i < Number(ch); i++) out.push(null);
            else out.push(ch);
        }
        return out;
    });
}

function MiniBoard({ fen, highlight = [], className }: { fen: string; highlight?: string[]; className?: string }) {
    const board = useMemo(() => parseFen(fen), [fen]);
    return (
        <div className={cn('[container-type:inline-size]', className)} aria-hidden>
            <div className="grid grid-cols-8 aspect-square overflow-hidden rounded-xl border border-border">
                {board.flatMap((row, r) => row.map((piece, c) => {
                    const square = 'abcdefgh'[c] + (8 - r);
                    const dark = (r + c) % 2 === 1;
                    const isWhite = piece ? piece === piece.toUpperCase() : false;
                    return (
                        <div
                            key={square}
                            className={cn('flex items-center justify-center leading-none',
                                dark ? 'bg-primary/40' : 'bg-primary/10',
                                highlight.includes(square) && 'bg-amber-400/50 ring-1 ring-inset ring-amber-400')}
                            style={{ fontSize: '10cqw' }}
                        >
                            {piece && (
                                <span className={isWhite ? 'text-white [text-shadow:0_0_1px_#000,0_1px_1px_rgba(0,0,0,.6)]' : 'text-zinc-900'}>
                                    {GLYPHS[piece.toLowerCase()]}{'\uFE0E'}
                                </span>
                            )}
                        </div>
                    );
                }))}
            </div>
        </div>
    );
}

/* =========================================================================
   SIDEBAR + NAV
   ========================================================================= */

function Brand({ collapsed }: { collapsed: boolean }) {
    return (
        <div className="flex items-center gap-3 font-display font-black text-primary text-xl overflow-hidden whitespace-nowrap">
            <Swords size={28} className="shrink-0" />
            {!collapsed && <span>Better Chess</span>}
        </div>
    );
}

function SidebarNav({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
    const router = useRouter();
    const pathname = usePathname();
    return (
        <nav className="flex-1 overflow-y-auto px-4 space-y-5" aria-label="Main">
            {NAV.map((section, i) => (
                <div key={section.group} className="space-y-1">
                    {collapsed
                        ? i > 0 && <div className="h-px bg-border mx-2 mb-3" />
                        : <p className="px-3 pb-1 text-xs font-semibold text-muted-foreground/80">{section.group}</p>}
                    {section.items.map(item => {
                        const Icon = item.icon;
                        const soon = !FEATURES[item.feature];
                        const active = !soon && (pathname === item.href || (item.href !== '/dashboard' && !!pathname?.startsWith(item.href)));
                        return (
                            <button
                                key={item.label}
                                title={soon ? `${item.label} is coming soon` : collapsed ? item.label : undefined}
                                aria-disabled={soon}
                                aria-current={active ? 'page' : undefined}
                                onClick={() => { if (soon) return; router.push(item.href); onNavigate?.(); }}
                                className={cn(
                                    'w-full flex items-center gap-4 p-3 rounded-xl transition-all',
                                    soon ? 'text-muted-foreground/60 cursor-not-allowed'
                                        : active ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                                            : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                                    focusRing
                                )}
                            >
                                <Icon size={20} className="shrink-0" />
                                {!collapsed && <span className="font-semibold truncate">{item.label}</span>}
                                {!collapsed && soon && (
                                    <span className="ml-auto rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">Soon</span>
                                )}
                            </button>
                        );
                    })}
                </div>
            ))}
        </nav>
    );
}

function SidebarFooter({ collapsed, username, rating, avatar, onNavigate }: { collapsed: boolean; username: string; rating: number; avatar?: string; onNavigate?: () => void }) {
    const router = useRouter();
    const settingsSoon = !FEATURES.settings;
    return (
        <div className="p-4 border-t border-border space-y-2">
            <button
                onClick={() => { router.push('/profile'); onNavigate?.(); }}
                className={cn('w-full flex items-center gap-3 rounded-xl p-2 hover:bg-accent transition-colors', focusRing)}
                title={collapsed ? username : undefined}
            >
                <Avatar name={username} src={avatar} size="h-9 w-9" />
                {!collapsed && (
                    <div className="min-w-0 text-left">
                        <p className="text-sm font-bold truncate">{username}</p>
                        <p className="text-[11px] text-muted-foreground tabular-nums">Rating {rating}</p>
                    </div>
                )}
            </button>
            <button
                aria-disabled={settingsSoon}
                onClick={() => { if (settingsSoon) return; router.push('/settings'); onNavigate?.(); }}
                title={settingsSoon ? 'Settings is coming soon' : collapsed ? 'Settings' : undefined}
                className={cn('w-full flex items-center gap-4 p-3 rounded-xl transition-colors',
                    settingsSoon ? 'text-muted-foreground/60 cursor-not-allowed' : 'text-muted-foreground hover:bg-accent hover:text-foreground', focusRing)}
            >
                <Settings size={20} className="shrink-0" />
                {!collapsed && <span className="font-semibold">Settings</span>}
                {!collapsed && settingsSoon && <span className="ml-auto rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">Soon</span>}
            </button>
        </div>
    );
}

function MobileTab({ icon, label, href, onClick }: { icon: React.ReactNode; label: string; href?: string; onClick?: () => void }) {
    const router = useRouter();
    const pathname = usePathname();
    const active = !!href && pathname === href;
    return (
        <button
            onClick={() => (onClick ? onClick() : href && router.push(href))}
            aria-current={active ? 'page' : undefined}
            className={cn('flex flex-col items-center gap-1 px-2 rounded-lg', active ? 'text-primary' : 'text-muted-foreground', focusRing)}
        >
            {icon} <span className="text-[10px] font-medium">{label}</span>
        </button>
    );
}

interface DropdownItemProps {
    icon: React.ReactNode;
    label: string;
    variant?: 'normal' | 'danger';
    path?: string;
    logout?: () => void;
    isLoading?: boolean;
    soon?: boolean;
}

function DropdownItem({ icon, label, variant, path, logout, isLoading, soon }: DropdownItemProps) {
    const router = useRouter();
    return (
        <button
            onClick={() => {
                if (soon) return;
                if (path) router.push(path);
                if (logout) logout();
            }}
            aria-disabled={soon}
            disabled={isLoading}
            className={cn(
                'w-full flex items-center gap-3 p-2.5 rounded-xl text-sm transition-colors',
                variant === 'danger' ? 'text-danger hover:bg-danger/10' : 'hover:bg-accent',
                soon && 'cursor-not-allowed text-muted-foreground/60 hover:bg-transparent',
                isLoading && 'cursor-not-allowed opacity-70 bg-danger/50',
                focusRing
            )}
        >
            {isLoading ? <LoadingSpinner /> : <>{icon} {label} {soon && <span className="ml-auto"><SoonBadge /></span>}</>}
        </button>
    );
}