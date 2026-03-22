"use client";

import { useState, useEffect, useRef } from "react";
import {
    Brain, Zap, Globe2, Users, Bell, History,
    Bot, ShieldCheck, Play, Sparkles,
    MessageSquare, TrendingUp, Crown, Star,
    ArrowRight, Check, BarChart3, Cpu,
    BookOpen, Medal, Layers, GitBranch, Info,
    LogIn, Menu, X, Network,
} from "lucide-react";
import UserAccountDropdown from "@/components/social/UserAccountDropdown";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/hooks";
import { RootState } from "@/lib/store";


// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const HERO_BADGES = ["RAG", "SSE", "LangGraph", "Vector DB", "LangChain", "Vectorless RAG"]
const WATCH_DEMO_LINK = "https://youtu.be/6w1kStwtR5A"

// ─────────────────────────────────────────────────────────────────────────────
// Scroll-reveal hook
// ─────────────────────────────────────────────────────────────────────────────
function useInView(threshold = 0.12) {
    const ref = useRef<HTMLDivElement>(null);
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
            { threshold }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [threshold]);
    return { ref, inView };
}

// ─────────────────────────────────────────────────────────────────────────────
// Reveal wrapper — fade + slide up on scroll
// ─────────────────────────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, className = "" }: {
    children: React.ReactNode; delay?: number; className?: string;
}) {
    const { ref, inView } = useInView();
    return (
        <div
            ref={ref}
            className={`transition-all duration-700 ease-out ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-7"} ${className}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Glass card — uses bg-card, border-border from theme
// ─────────────────────────────────────────────────────────────────────────────
function GlassCard({ children, className = "", glow = false }: {
    children: React.ReactNode; className?: string; glow?: boolean;
}) {
    return (
        <div className={`
      relative rounded-2xl border border-border bg-card backdrop-blur-sm
      shadow-[0_2px_40px_rgba(0,0,0,0.35)]
      ${glow ? "shadow-[0_0_60px_-15px_rgba(var(--primary)/0.35)]" : ""}
      transition-all duration-300
      ${className}
    `}>
            {children}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section pill badge
// ─────────────────────────────────────────────────────────────────────────────
function Pill({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
    return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/20 bg-muted text-muted-foreground text-xs font-semibold tracking-widest">
            {icon && <span className="text-primary">{icon}</span>}
            {children}
        </span>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section label — small uppercase eyebrow above headings
// ─────────────────────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-xs font-black uppercase tracking-[0.18em] text-primary mb-3">
            {children}
        </p>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Google icon SVG (inline, no external dependency)
// ─────────────────────────────────────────────────────────────────────────────
function GoogleIcon({ size = 16 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Decorative chess-board grid (uses primary color)
// ─────────────────────────────────────────────────────────────────────────────
function ChessBoardBg() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden>
            <div
                className="absolute -right-32 -top-24 w-130 h-130 opacity-[0.045]"
                style={{ transform: "rotate(14deg)" }}
            >
                <div className="grid grid-cols-8 w-full h-full rounded-3xl overflow-hidden">
                    {Array.from({ length: 64 }).map((_, i) => (
                        <div
                            key={i}
                            className={(Math.floor(i / 8) + (i % 8)) % 2 === 0 ? "bg-primary" : "bg-transparent"}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Ambient orbs — use bg-primary with opacity
// ─────────────────────────────────────────────────────────────────────────────
function Orbs() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
            {/* Top-left warm orb */}
            <div className="absolute -top-48 -left-48 w-150 h-150 rounded-full bg-primary opacity-[0.09] blur-[120px]" />
            {/* Bottom-right cool orb */}
            <div className="absolute -bottom-32 -right-24 w-120 h-120 rounded-full bg-primary opacity-[0.06] blur-[100px]" />
            {/* Center subtle */}
            <div className="absolute top-[40%] left-[35%] w-70 h-70 rounded-full bg-primary opacity-[0.04] blur-[80px]" />
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// NAVBAR
// ─────────────────────────────────────────────────────────────────────────────
function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const router = useRouter();
    const { isAuthenticated } = useAppSelector((state: RootState) => state.auth);

    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 24);
        window.addEventListener("scroll", fn, { passive: true });
        return () => window.removeEventListener("scroll", fn);
    }, []);

    const links = ["Features", "AI Engine", "Assistant", "Access", "Pricing"];

    return (
        <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled
            ? "bg-background/90 backdrop-blur-xl border-b border-border shadow-lg"
            : "bg-transparent"
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* Logo */}
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-lg">
                            <span className="text-primary-foreground font-black text-base leading-none">♟</span>
                        </div>
                        <span className="font-black text-foreground text-lg tracking-tight">
                            better<span className="text-primary">Chess</span>
                        </span>
                    </div>

                    {/* Desktop links */}
                    <div className="hidden md:flex items-center gap-0.5">
                        {links.map(l => (
                            <a
                                key={l}
                                href={`#${l.toLowerCase().replace(" ", "-")}`}
                                className="px-3.5 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all font-medium"
                            >
                                {l}
                            </a>
                        ))}
                    </div>

                    {/* Desktop CTAs */}
                    {!isAuthenticated && (
                        <div className="hidden md:flex items-center gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card text-card-foreground hover:bg-accent text-sm font-medium transition-all"
                                onClick={() => router.push("/login")}
                            >
                                <GoogleIcon size={15} />
                                Sign in
                            </button>
                            <button
                                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:opacity-90 text-sm font-bold transition-all shadow-lg hover:-translate-y-px"
                                onClick={() => router.push("/dashboard")}
                            >
                                Play Now
                            </button>
                        </div>
                    )}

                    <div className="flex">
                        {/* Mobile toggle */}
                        <button
                            onClick={() => setMobileOpen(v => !v)}
                            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                        >
                            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
                        </button>
                        {isAuthenticated && <UserAccountDropdown />}

                    </div>
                </div>


            </div>

            {/* Mobile drawer */}
            {mobileOpen && (
                <div className="md:hidden bg-background/98 backdrop-blur-xl border-b border-border px-4 py-4">
                    <div className="flex flex-col gap-1 mb-4">
                        {links.map(l => (
                            <a
                                key={l}
                                href={`#${l.toLowerCase()}`}
                                onClick={() => setMobileOpen(false)}
                                className="px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all font-medium"
                            >
                                {l}
                            </a>
                        ))}
                    </div>
                    {!isAuthenticated && (
                        <div className="flex gap-2 pt-3 border-t border-border">
                            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border bg-card text-card-foreground text-sm font-medium"
                                onClick={() => router.push("/login")}>
                                <GoogleIcon size={15} /> Sign in
                            </button>
                            <button className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold text-center"
                                onClick={() => router.push("/dashboard")}
                            >
                                Play Now
                            </button>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// HERO
// ─────────────────────────────────────────────────────────────────────────────


function Hero() {
    const words = ["Intelligence.", "Precision.", "Mastery.", "Vision."];
    const [wordIdx, setWordIdx] = useState(0);
    const [fade, setFade] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const t = setInterval(() => {
            setFade(false);
            setTimeout(() => { setWordIdx(i => (i + 1) % words.length); setFade(true); }, 350);
        }, 2800);
        return () => clearInterval(t);
    }, []);

    return (
        <section id="play" className="relative min-h-screen flex items-center justify-center pt-20 pb-12 overflow-hidden">
            <Orbs />
            <ChessBoardBg />

            {/* Subtle grid texture */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.018]"
                style={{
                    backgroundImage: "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)",
                    backgroundSize: "56px 56px",
                }}
            />

            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

                {/* Eyebrow pill */}
                <div className="flex justify-center mb-8" style={{ animation: "bc-fadeDown 0.65s ease both" }}>
                    <Pill icon={<Sparkles className="animate-pulse" size={15} />}>
                        AI-POWERED CHESS PLATFORM
                    </Pill>

                </div>

                {/* Headline */}
                <h1
                    className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] mb-6"
                    style={{ animation: "bc-fadeUp 0.75s ease 0.1s both" }}
                >
                    <span className="text-foreground">Chess Reimagined</span>
                    <br />
                    <span className="text-muted-foreground/40">with</span>{" "}
                    <span
                        className="text-primary transition-opacity duration-300"
                        style={{ opacity: fade ? 1 : 0 }}
                    >
                        {words[wordIdx]}
                    </span>
                </h1>

                {/* Subheading */}
                <p
                    className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed font-light"
                    style={{ animation: "bc-fadeUp 0.75s ease 0.2s both" }}
                >
                    The only platform where every game feeds an intelligence that understands your chess <em className="text-foreground not-italic font-semibold">psychology</em>. — not just your moves.

                </p>

                {/* CTA row */}
                <div
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
                    style={{ animation: "bc-fadeUp 0.75s ease 0.3s both" }}
                >
                    <button
                        className="group flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-base transition-all shadow-[0_0_40px_-8px] shadow-primary hover:opacity-90 hover:-translate-y-0.5"
                        onClick={() => router.push("/dashboard")}
                    >
                        Play Now
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>

                    <a
                        className="flex items-center gap-3 px-8 py-4 rounded-2xl border border-border bg-muted text-card-foreground hover:bg-accent font-semibold text-base transition-all"
                        href={WATCH_DEMO_LINK}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <div className="w-7 h-7 rounded-full bg-card flex items-center justify-center">
                            <Play size={11} className="text-foreground ml-0.5" fill="currentColor" />
                        </div>
                        Watch Demo
                    </a>
                </div>

                {/* Tech stack pills */}
                <div
                    className="flex flex-wrap justify-center gap-2.5"
                    style={{ animation: "bc-fadeUp 0.75s ease 0.42s both" }}
                >
                    {HERO_BADGES.map(t => (
                        <span
                            key={t}
                            className="px-3 py-1.5 text-xs text-muted-foreground border border-border rounded-lg bg-muted font-mono"
                        >
                            {t}
                        </span>
                    ))}
                </div>

                {/* Hero card — mock AI analysis */}
                <div
                    className="mt-20 flex justify-center"
                    style={{ animation: "bc-fadeUp 0.9s ease 0.5s both" }}
                >
                    <GlassCard className="w-full max-w-lg p-6 text-left" glow>
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
                                <Brain size={18} className="text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-sm font-bold text-foreground">AI Analysis</span>
                                    <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: "oklch(0.72 0.17 162)" }}>
                                        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "oklch(0.72 0.17 162)" }} />
                                        Live
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                                    <span className="text-primary font-medium">Pattern detected:</span> You tend to over-extend your queenside pawns in the middlegame, leaving your king exposed in 73% of your last 22 Sicilian games.
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                                        <div className="h-full w-[73%] rounded-full bg-primary opacity-80" />
                                    </div>
                                    <span className="text-xs text-muted-foreground font-mono">73%</span>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </section>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// SOCIAL ZONE
// ─────────────────────────────────────────────────────────────────────────────
function SocialZone() {
    const { ref, inView } = useInView();

    const cards = [
        {
            icon: <Globe2 size={22} />,
            title: "Global Matchmaking",
            desc: "Ranked and casual queues with real-time ELO matching across every skill tier. Find your level in seconds.",
            tag: "Ranked · Casual",
        },
        {
            icon: <Users size={22} />,
            title: "Real-time Friend Network",
            desc: "Send, accept, and manage friend requests with live presence indicators. Challenge friends with one tap.",
            tag: "Live Presence · WebSocket",
        },
        {
            icon: <Bell size={22} />,
            title: "Smart Notifications",
            desc: "Instant push alerts for game invites, friend activity, and AI analysis completions. Never miss a move.",
            tag: "Instant · Persistent",
        },
    ];

    return (
        <section id="features" className="relative py-32 overflow-hidden">
            <div className="absolute right-0 top-0 w-96 h-96 rounded-full bg-primary opacity-[0.05] blur-[100px] pointer-events-none" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <Reveal className="text-center mb-16">
                    <SectionLabel>Social Zone</SectionLabel>
                    <h2 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight mb-4">
                        Chess is better<br />
                        <span className="text-muted-foreground/40">together.</span>
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                        A living, breathing community — built for real competition and real connection.
                    </p>
                </Reveal>

                <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {cards.map((c, i) => (
                        <div
                            key={i}
                            className={`transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                            style={{ transitionDelay: `${i * 110}ms` }}
                        >
                            <GlassCard className="group h-full p-6 hover:-translate-y-1.5 hover:border-primary/30 cursor-default">
                                <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-5">
                                    {c.icon}
                                </div>
                                <h3 className="font-bold text-foreground text-lg mb-2">{c.title}</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed mb-5">{c.desc}</p>
                                <span className="text-xs text-muted-foreground font-mono border border-border px-2.5 py-1 rounded-lg bg-muted">
                                    {c.tag}
                                </span>
                            </GlassCard>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// AI ENGINE SECTION
// ─────────────────────────────────────────────────────────────────────────────
function AIEngine() {
    const metrics = [
        { label: "Accuracy", value: "94.2%" },
        { label: "Mistakes", value: "3" },
        { label: "Inaccuracies", value: "7" },
        { label: "Best Moves", value: "31" },
    ];

    const insights = [
        "Opening: Sicilian Defense — your historical win rate drops 18% in this line",
        "Move 14. Nd5 was the critical moment — a missed +1.2 advantage",
        "Endgame transition: King activity 2 tempos behind optimal",
        "Long-term: Passive rook placement in 68% of your drawn games",
    ];

    return (
        <section id="ai-engine" className="relative py-32 overflow-hidden">
            <div className="absolute left-0 bottom-0 w-125 h-125 rounded-full bg-primary opacity-[0.06] blur-[120px] pointer-events-none" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    {/* Left: copy */}
                    <Reveal>
                        <SectionLabel>AI Analysis Engine</SectionLabel>
                        <h2 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight leading-tight mb-5">
                            Not just moves.<br />
                            <span className="text-primary">Your entire story.</span>
                        </h2>
                        <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                            Our Context-Aware Game Review doesn't analyze games in isolation. It understands your full match history — surfacing long-term patterns, recurring weaknesses, and structural habits across dozens of games.
                        </p>

                        <div className="space-y-3 mb-8">
                            {[
                                "Full PGN move-by-move breakdown with eval bars",
                                "Cross-game pattern recognition across your history",
                                "Opening repertoire strength mapping",
                                "Critical moment identification with best alternatives",
                            ].map((item, i) => (
                                <Reveal key={i} delay={i * 80}>
                                    <div className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0 mt-0.5">
                                            <Check size={10} className="text-primary" />
                                        </div>
                                        <span className="text-muted-foreground text-sm">{item}</span>
                                    </div>
                                </Reveal>
                            ))}
                        </div>

                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted border border-border w-fit">
                            <Cpu size={13} className="text-primary" />
                            <span className="text-xs text-muted-foreground font-mono">Powered by BetterChess</span>
                        </div>
                    </Reveal>

                    {/* Right: mock analysis card */}
                    <Reveal delay={140}>
                        <GlassCard className="p-6" glow>
                            {/* Header */}
                            <div className="flex items-center justify-between mb-5 pb-4 border-b border-border">
                                <div>
                                    <p className="text-xs text-muted-foreground font-mono mb-0.5">GAME #2847 · 12 MIN AGO</p>
                                    <p className="text-foreground font-bold">vs. Stockfish Lv.4</p>
                                </div>
                                <span className="px-3 py-1 rounded-lg bg-danger/15 border border-danger/20 text-danger-foreground text-xs font-bold">
                                    LOSS
                                </span>
                            </div>

                            {/* Metrics */}
                            <div className="grid grid-cols-4 gap-3 mb-5">
                                {metrics.map((m, i) => (
                                    <div key={i} className="text-center">
                                        <div className="text-xl font-black text-number">{m.value}</div>
                                        <div className="text-[10px] text-muted-foreground mt-0.5 font-mono">{m.label}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Eval bar */}
                            <div className="mb-5">
                                <div className="flex justify-between text-[10px] text-muted-foreground font-mono mb-1.5">
                                    <span>GAME EVALUATION</span>
                                    <span>Move 42 / 42</span>
                                </div>
                                <div className="h-2 rounded-full bg-muted overflow-hidden">
                                    <div className="h-full w-full rounded-full bg-yellow-500 opacity-60" />
                                </div>
                            </div>

                            {/* Insights */}
                            <div className="space-y-2">
                                <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest mb-2">AI Insights</p>
                                {insights.map((ins, i) => (
                                    <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-muted/60 border border-border">
                                        <Sparkles size={11} className="text-primary mt-0.5 shrink-0" />
                                        <p className="text-xs text-muted-foreground leading-relaxed">{ins}</p>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>
                    </Reveal>
                </div>
            </div>
        </section>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// AI ASSISTANT SECTION
// ─────────────────────────────────────────────────────────────────────────────
function AIAssistant() {
    const FULL_TEXT = "Based on your last 15 Ruy Lopez games, your knight on f3 is consistently misplaced by move 18. Consider the d4 push earlier to free your bishop pair and take control of the center...";
    const [streamText, setStreamText] = useState("");
    const { ref, inView } = useInView(0.2);

    useEffect(() => {
        if (!inView) return;
        let i = 0;
        setStreamText("");
        const t = setInterval(() => {
            i++;
            setStreamText(FULL_TEXT.slice(0, i));
            if (i >= FULL_TEXT.length) clearInterval(t);
        }, 26);
        return () => clearInterval(t);
    }, [inView]);

    const capabilities = [
        { icon: <Zap size={14} />, title: "Streaming via SSE", desc: "Token-by-token real-time responses" },
        { icon: <History size={14} />, title: "History-Aware", desc: "Knows every game you've played" },
        { icon: <TrendingUp size={14} />, title: "Pattern Memory", desc: "Tracks habits across your career" },
        { icon: <BookOpen size={14} />, title: "Opening Coach", desc: "Personalized repertoire guidance" },
    ];

    return (
        <section id="assistant" className="relative py-32 overflow-hidden">
            <div className="absolute right-0 top-[20%] w-112.5 h-112.5 rounded-full bg-primary opacity-[0.05] blur-[110px] pointer-events-none" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    {/* Left: mock chat UI */}
                    <Reveal>
                        <GlassCard className="p-6">
                            {/* Chat header */}
                            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border">
                                <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center">
                                    <Brain size={16} className="text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-foreground font-bold text-sm leading-none">betterChess AI</p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                        <span className="text-xs text-muted-foreground">Context-aware · Streaming</span>
                                    </div>
                                </div>
                                <div className="flex gap-1.5">
                                    <span className="px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-primary text-[10px] font-mono">SSE</span>
                                    <span className="px-2 py-0.5 rounded-md bg-muted border border-border text-muted-foreground text-[10px] font-mono">LIVE</span>
                                </div>
                            </div>

                            {/* Messages */}
                            <div ref={ref} className="space-y-4 mb-5 min-h-30">
                                {/* User message */}
                                <div className="flex gap-3 flex-row-reverse">
                                    <div className="w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center text-xs font-black text-foreground shrink-0">
                                        ♔
                                    </div>
                                    <div className="max-w-[78%] rounded-2xl rounded-tr-sm px-4 py-3 bg-primary/15 border border-primary/20">
                                        <p className="text-sm text-foreground leading-relaxed">Why do I keep losing in the endgame?</p>
                                    </div>
                                </div>
                                {/* AI message */}
                                <div className="flex gap-3">
                                    <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center text-xs font-black text-primary shrink-0">
                                        AI
                                    </div>
                                    <div className="max-w-[78%] rounded-2xl rounded-tl-sm px-4 py-3 bg-card border border-border">
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {streamText}
                                            {streamText.length < FULL_TEXT.length && (
                                                <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 align-middle animate-pulse" />
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Input bar */}
                            <div className="flex items-center gap-2 p-3 rounded-xl bg-muted border border-border">
                                <input
                                    readOnly
                                    placeholder="Ask your Grandmaster AI…"
                                    className="flex-1 bg-transparent text-sm text-muted-foreground outline-none placeholder:text-muted-foreground/50"
                                />
                                <button className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center hover:opacity-90 transition-opacity">
                                    <ArrowRight size={14} className="text-primary-foreground" />
                                </button>
                            </div>
                        </GlassCard>
                    </Reveal>

                    {/* Right: copy */}
                    <Reveal delay={140}>
                        <SectionLabel>Floating AI Assistant</SectionLabel>
                        <h2 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight leading-tight mb-5">
                            A Grandmaster<br />
                            <span className="text-primary">in your pocket.</span>
                        </h2>
                        <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                            Ask anything about your chess journey. The AI streams answers in real-time via SSE, grounded in your personal game history — not generic advice pulled from a textbook.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {capabilities.map((item, i) => (
                                <Reveal key={i} delay={i * 60}>
                                    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-card border border-border hover:bg-accent hover:border-primary/25 transition-all">
                                        <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                            {item.icon}
                                        </div>
                                        <div>
                                            <p className="text-foreground text-sm font-semibold leading-none">{item.title}</p>
                                            <p className="text-muted-foreground text-xs mt-0.5">{item.desc}</p>
                                        </div>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </Reveal>
                </div>
            </div>
        </section>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// ACCESS / CREDIT SYSTEM
// ─────────────────────────────────────────────────────────────────────────────
function AccessSystem() {
    const aiFeatures = [
        { icon: <BarChart3 size={14} />, text: "Post-game deep analysis" },
        { icon: <MessageSquare size={14} />, text: "AI Assistant sessions" },
        { icon: <TrendingUp size={14} />, text: "Cross-game pattern reports" },
        { icon: <Star size={14} />, text: "Priority compute queue" },
    ];

    const tiers = [
        {
            name: "Free Tier",
            credits: "3 analyses / month",
            badge: "Default",
            features: ["Basic move evaluation", "Blunder highlight"],
            active: false,
        },
        {
            name: "Early Access",
            credits: "Unlimited AI credits",
            badge: "Admin Approved",
            features: ["Full context analysis", "SSE Streaming Assistant", "Pattern memory engine", "Priority compute queue"],
            active: true,
        },
    ];

    return (
        <section id="access" className="relative py-32 overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-primary opacity-[0.025] blur-[200px]" />
            </div>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

                <Reveal className="text-center mb-12">
                    <SectionLabel>Compute &amp; Access</SectionLabel>
                    <h2 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight mb-4">
                        Exclusive Early Access<br />
                        <span className="text-muted-foreground/40">Program.</span>
                    </h2>
                </Reveal>

                <Reveal delay={100}>
                    {/* Main access card */}
                    <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-[0_0_80px_-20px] shadow-primary/20">
                        {/* Top accent line */}
                        <div className="h-0.75 w-full bg-primary opacity-70" />

                        <div className="p-8 sm:p-12">
                            <div className="flex flex-col lg:flex-row gap-12 items-start">

                                {/* Left: framing */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center">
                                            <Crown size={22} className="text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-foreground font-black text-xl leading-none">Early Access Program</p>
                                            <p className="text-muted-foreground text-sm mt-0.5">Full AI feature suite</p>
                                        </div>
                                        <span className="px-3 py-1 rounded-full bg-primary/15 border border-primary/25 text-primary text-xs font-bold tracking-wide">
                                            INVITE ONLY
                                        </span>
                                    </div>

                                    <p className="text-muted-foreground text-base leading-relaxed mb-6">
                                        Our AI analysis runs on dedicated Gemini compute. To ensure every analysis is thorough and high-quality, AI features are{" "}
                                        <span className="text-foreground font-semibold">credit-based</span>. Think of credits as reserving a focused session with a top-tier engine — the quality justifies it.
                                    </p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                                        {aiFeatures.map((item, i) => (
                                            <div key={i} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                                                <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                                    {item.icon}
                                                </div>
                                                {item.text}
                                            </div>
                                        ))}
                                    </div>

                                    <button className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-primary text-primary-foreground hover:opacity-90 font-bold transition-all shadow-lg hover:-translate-y-px text-sm">
                                        <LogIn size={15} />
                                        Request Full Demo Access
                                        <ArrowRight size={14} />
                                    </button>
                                </div>

                                {/* Right: tier cards */}
                                <div className="lg:w-72 w-full space-y-3 shrink-0">
                                    <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-[0.18em] mb-4">
                                        AI Credit Tiers
                                    </p>

                                    {tiers.map((tier, i) => (
                                        <div
                                            key={i}
                                            className={`relative p-4 rounded-2xl border transition-all ${tier.active
                                                ? "border-primary/40 bg-primary/8 shadow-[0_0_30px_-8px] shadow-primary/30"
                                                : "border-border bg-muted/50"
                                                }`}
                                        >
                                            {tier.active && (
                                                <div className="absolute -top-px left-4 right-4 h-px bg-primary opacity-50" />
                                            )}
                                            <div className="flex items-start justify-between mb-2">
                                                <p className={`font-bold text-sm ${tier.active ? "text-foreground" : "text-muted-foreground"}`}>
                                                    {tier.name}
                                                </p>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tier.active
                                                    ? "bg-primary/15 border-primary/30 text-primary"
                                                    : "bg-muted border-border text-muted-foreground"
                                                    }`}>
                                                    {tier.badge}
                                                </span>
                                            </div>
                                            <p className={`text-xs mb-3 font-mono ${tier.active ? "text-primary" : "text-muted-foreground"}`}>
                                                {tier.credits}
                                            </p>
                                            <div className="space-y-1.5">
                                                {tier.features.map((f, j) => (
                                                    <div key={j} className="flex items-center gap-2">
                                                        <Check size={10} className={tier.active ? "text-primary" : "text-muted-foreground"} />
                                                        <span className={`text-xs ${tier.active ? "text-muted-foreground" : "text-muted-foreground/50"}`}>{f}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Info note */}
                                    <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-muted border border-border">
                                        <Info size={13} className="text-primary shrink-0 mt-0.5" />
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            <span className="text-foreground font-semibold">Admin approval</span> unlocks the full suite. Requests are typically reviewed within 24 hours.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE GRID
// ─────────────────────────────────────────────────────────────────────────────
function FeatureGrid() {
    const { ref, inView } = useInView();

    const features = [
        { icon: <GoogleIcon size={20} />, title: "Google OAuth 2.0", desc: "One-click sign-in. No passwords, fully secure and seamless." },
        { icon: <History size={19} className="text-primary" />, title: "Complete Game History", desc: "Every game stored and searchable. Filter by opening, result, or date." },
        { icon: <GitBranch size={19} className="text-primary" />, title: "Move-by-Move PGN", desc: "Full PGN with annotations. Export, share, or import into any chess tool." },
        { icon: <Bot size={19} className="text-primary" />, title: "Tiered Bot Opponents", desc: "From beginner to master level — each bot with distinct playstyles." },
        { icon: <Medal size={19} className="text-primary" />, title: "ELO Rating System", desc: "Dynamic ELO after every ranked game. Track your progression over time." },
        { icon: <Layers size={19} className="text-primary" />, title: "Time Control Modes", desc: "Bullet, Blitz, Rapid, and Classical. Every pace, every preference." },
        { icon: <ShieldCheck size={19} className="text-primary" />, title: "Anti-cheat Engine", desc: "Statistical anomaly detection keeps competition fair and clean." },
        { icon: <Zap size={19} className="text-primary" />, title: "Real-time WebSocket", desc: "Sub-50ms move sync via Socket.IO. No lag, no exceptions." },
    ];

    return (
        <section id="pricing" className="relative py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <Reveal className="text-center mb-16">
                    <SectionLabel>Platform Features</SectionLabel>
                    <h2 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight mb-4">
                        Everything you need to<br />
                        <span className="text-muted-foreground/40">master the game.</span>
                    </h2>
                </Reveal>

                <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {features.map((f, i) => (
                        <div
                            key={i}
                            className={`transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-7"}`}
                            style={{ transitionDelay: `${i * 55}ms` }}
                        >
                            <GlassCard className="group h-full p-5 hover:-translate-y-1 hover:border-primary/25 transition-all duration-300 cursor-default">
                                <div className="mb-3.5">{f.icon}</div>
                                <h3 className="font-bold text-foreground text-sm mb-1.5">{f.title}</h3>
                                <p className="text-muted-foreground text-xs leading-relaxed">{f.desc}</p>
                            </GlassCard>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// FINAL CTA
// ─────────────────────────────────────────────────────────────────────────────
function FinalCTA() {
    return (
        <section className="relative py-32 overflow-hidden">
            <div className="absolute inset-0 bg-primary opacity-[0.06] blur-[180px] pointer-events-none" />
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                <Reveal>
                    <div className="w-20 h-20 rounded-3xl bg-primary/15 border border-primary/25 flex items-center justify-center mx-auto mb-8 shadow-xl">
                        <span className="text-5xl leading-none text-primary">♟</span>
                    </div>
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-foreground tracking-tight mb-5">
                        Your next move<br />starts here.
                    </h2>
                    <p className="text-muted-foreground text-lg mb-10 max-w-lg mx-auto leading-relaxed">
                        Join the platform where intelligence meets instinct. Every game is a lesson. Every lesson is remembered.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="#play"
                            className="group flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-base transition-all hover:opacity-90 hover:-translate-y-0.5 shadow-lg"
                        >
                            Get Started Free
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </a>
                        <button className="flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl border border-border bg-card text-card-foreground hover:bg-accent font-semibold text-base transition-all">
                            <GoogleIcon size={16} />
                            Continue with Google
                        </button>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────────────────────────────────────
function Footer() {
    return (
        <footer className="border-t border-border py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                            <span className="text-primary-foreground font-black text-sm leading-none">♟</span>
                        </div>
                        <span className="font-black text-foreground text-base tracking-tight">
                            better<span className="text-primary">Chess</span>
                        </span>
                    </div>
                    <p className="text-muted-foreground text-sm font-mono">
                        Built with Passion
                    </p>
                    <div className="flex gap-6">
                        {["Privacy", "Terms", "Status"].map(l => (
                            <a key={l} href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                                {l}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT PAGE EXPORT
// ─────────────────────────────────────────────────────────────────────────────
export default function BetterChessLanding() {

    const [watchDemoStatus, setWatchDemoStatus] = useState(false);
    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,900;1,9..40,400&display=swap');

        html {
          scroll-behavior: smooth;
          font-family: 'DM Sans', sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        @keyframes bc-fadeDown {
          from { opacity: 0; transform: translateY(-14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes bc-fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }

        ::selection { background: color-mix(in oklch, var(--primary) 30%, transparent); }
      `}</style>

            <div className="bg-background min-h-screen font-sans">
                <Navbar />
                <Hero />
                <SocialZone />
                <AIEngine />
                <AIAssistant />
                <AccessSystem />
                <FeatureGrid />
                <FinalCTA />
                <Footer />
            </div>
        </>
    );
}