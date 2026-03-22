"use client";

import { useState, useEffect, useRef, type FC, type ReactNode, JSX } from "react";
import {
    Brain,
    Zap,
    Shield,
    Globe,
    Cpu,
    GitBranch,
    MessageSquare,
    X,
    Send,
    Crown,
    Activity,
    Lock,
    Server,
    ArrowRight,
    Star,
    Database,
    Network,
    ChevronRight,
    Sparkles,
    Trophy,
    Users,
    TrendingUp,
    BookOpen,
    type LucideIcon,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════════════════ */

type NavSection = "Home" | "Features" | "Architecture";
type PlayMode = "matchmaking" | "ai";
type MessageRole = "user" | "ai";
type MoveQuality = "good" | "inaccuracy" | "mistake" | "brilliant";

interface ChatMessage {
    role: MessageRole;
    text: string;
}

interface AnalysisMove {
    index: number;
    move: string;
    eval: string;
    note: string;
    type: MoveQuality;
}

interface BentoFeature {
    title: string;
    desc: string;
    Icon: LucideIcon;
    iconClass: string;
    accentClass: string;
}

interface StatItem {
    value: string;
    label: string;
}

interface CreditTier {
    tier: string;
    credits: string;
    features: string;
    colorClass: string;
    bgClass: string;
    borderClass: string;
}

interface ArchNodeProps {
    title: string;
    items: string[];
    Icon: LucideIcon;
    accentTopClass: string;
    iconClass: string;
    borderClass: string;
}

interface ProfileStat {
    label: string;
    value: number;
    barClass: string;
    textClass: string;
}

interface TechBadgeProps {
    label: string;
    colorClass: string;
    bgClass: string;
    borderClass: string;
}

interface SecurityCard {
    Icon: LucideIcon;
    iconClass: string;
    borderClass: string;
    title: string;
    desc: string;
}

/* ═══════════════════════════════════════════════════════════════════════════
   MINI CHESSBOARD
═══════════════════════════════════════════════════════════════════════════ */

type PieceMap = Record<string, string>;

const PIECES: PieceMap = {
    "0,0": "♜", "0,1": "♞", "0,2": "♝", "0,3": "♛",
    "0,4": "♚", "0,5": "♝", "0,6": "♞", "0,7": "♜",
    "1,0": "♟", "1,1": "♟", "1,2": "♟", "1,3": "♟",
    "1,4": "♟", "1,5": "♟", "1,6": "♟", "1,7": "♟",
    "6,0": "♙", "6,1": "♙", "6,2": "♙", "6,3": "♙",
    "6,4": "♙", "6,5": "♙", "6,6": "♙", "6,7": "♙",
    "7,0": "♖", "7,1": "♘", "7,2": "♗", "7,3": "♕",
    "7,4": "♔", "7,5": "♗", "7,6": "♘", "7,7": "♖",
};

const HIGHLIGHTED = new Set(["3,3", "3,4", "4,3", "4,4"]);

const MiniChessboard: FC = () => (
    <div className="grid border-2 border-primary/30 rounded-xl overflow-hidden shadow-[0_0_60px_var(--tw-shadow-color)] shadow-primary/10"
        style={{ gridTemplateColumns: "repeat(8, 1fr)" }}>
        {Array.from({ length: 64 }).map((_, i) => {
            const row = Math.floor(i / 8);
            const col = i % 8;
            const key = `${row},${col}`;
            const isLight = (row + col) % 2 === 0;
            const isHighlighted = HIGHLIGHTED.has(key);
            return (
                <div
                    key={i}
                    className={[
                        "w-[52px] h-[52px] flex items-center justify-center text-2xl leading-none transition-colors duration-300",
                        isHighlighted
                            ? "bg-primary/30 shadow-[inset_0_0_0_2px_var(--tw-ring-color)] ring-1 ring-primary/60"
                            : isLight
                                ? "bg-foreground/5"
                                : "bg-background/80",
                    ].join(" ")}
                >
                    {PIECES[key] ?? ""}
                </div>
            );
        })}
    </div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   FLOATING CHAT
═══════════════════════════════════════════════════════════════════════════ */

const AI_REPLIES: string[] = [
    "Great question! The Sicilian Defense offers dynamic counterplay. Your win rate with it is 64% — well above your average.",
    "Based on your last 50 games, you tend to struggle in rook endgames. I recommend practicing the Lucena position.",
    "Your tactical pattern recognition has improved 18% this month. Keep focusing on pin and fork combinations.",
];

const FloatingChat: FC = () => {
    const [open, setOpen] = useState<boolean>(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: "ai", text: "Hello! I'm your betterChess AI. Ask me anything about openings, endgames, or your recent games." },
    ]);
    const [input, setInput] = useState<string>("");
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, open]);

    const send = (): void => {
        if (!input.trim()) return;
        const reply = AI_REPLIES[Math.floor(Math.random() * AI_REPLIES.length)];
        setMessages((prev) => [
            ...prev,
            { role: "user", text: input },
            { role: "ai", text: reply },
        ]);
        setInput("");
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === "Enter") send();
    };

    return (
        <div className="fixed bottom-7 right-7 z-[1000] flex flex-col items-end gap-3">
            {open && (
                <div className="w-[360px] h-[480px] bg-popover/95 backdrop-blur-2xl border border-primary/20 rounded-2xl flex flex-col shadow-[0_24px_80px_rgba(0,0,0,0.5)] animate-slideUp overflow-hidden">
                    {/* Header */}
                    <div className="px-5 py-4 border-b border-border flex items-center gap-3 bg-card/50">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_var(--tw-shadow-color)] shadow-primary" />
                        <span className="text-sm font-semibold text-foreground tracking-wide">betterChess AI Assistant</span>
                        <button
                            onClick={() => setOpen(false)}
                            className="ml-auto text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-accent"
                            aria-label="Close chat"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div className={[
                                    "max-w-[80%] px-4 py-2.5 text-[13px] leading-relaxed rounded-2xl",
                                    m.role === "user"
                                        ? "bg-primary/20 border border-primary/30 text-primary-foreground rounded-br-sm"
                                        : "bg-muted border border-border text-foreground rounded-bl-sm",
                                ].join(" ")}>
                                    {m.text}
                                </div>
                            </div>
                        ))}
                        <div ref={endRef} />
                    </div>

                    {/* Input */}
                    <div className="px-4 py-3 border-t border-border flex gap-2 bg-card/30">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask about openings, patterns…"
                            className="flex-1 bg-muted border border-border rounded-xl px-4 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60 transition-colors"
                        />
                        <button
                            onClick={send}
                            className="w-10 h-10 bg-primary/20 border border-primary/40 rounded-xl flex items-center justify-center text-primary hover:bg-primary/30 transition-colors cursor-pointer"
                            aria-label="Send message"
                        >
                            <Send size={15} />
                        </button>
                    </div>
                </div>
            )}

            {/* Toggle button */}
            <button
                onClick={() => setOpen((o) => !o)}
                className="w-14 h-14 rounded-full bg-primary/20 border border-primary/40 backdrop-blur-xl flex items-center justify-center text-primary shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:bg-primary/30 hover:scale-105 transition-all cursor-pointer"
                aria-label="Toggle AI chat"
            >
                {open ? <X size={22} /> : <MessageSquare size={22} />}
            </button>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   TECH BADGE
═══════════════════════════════════════════════════════════════════════════ */

const TechBadge: FC<TechBadgeProps> = ({ label, colorClass, bgClass, borderClass }) => (
    <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide border ${colorClass} ${bgClass} ${borderClass}`}>
        {label}
    </span>
);

/* ═══════════════════════════════════════════════════════════════════════════
   BENTO CARD
═══════════════════════════════════════════════════════════════════════════ */

interface BentoCardProps {
    children: ReactNode;
    className?: string;
}

const BentoCard: FC<BentoCardProps> = ({ children, className = "" }) => (
    <div className={`bg-card border border-border rounded-2xl p-7 relative overflow-hidden backdrop-blur-xl hover:bg-card-hover transition-colors duration-200 ${className}`}>
        {children}
    </div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION HEADER
═══════════════════════════════════════════════════════════════════════════ */

interface SectionHeaderProps {
    eyebrow: string;
    title: string;
    subtitle?: string;
}

const SectionHeader: FC<SectionHeaderProps> = ({ eyebrow, title, subtitle }) => (
    <div className="text-center max-w-2xl mx-auto mb-16">
        <p className="text-xs font-bold tracking-[0.15em] text-primary uppercase mb-3">{eyebrow}</p>
        <h2 className="text-foreground font-black leading-tight tracking-tight mb-4" style={{ fontSize: "clamp(28px,4vw,44px)" }}>
            {title}
        </h2>
        {subtitle && (
            <p className="text-muted-foreground text-base leading-relaxed">{subtitle}</p>
        )}
    </div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   ARCHITECTURE NODE
═══════════════════════════════════════════════════════════════════════════ */

const ArchNode: FC<ArchNodeProps> = ({ title, items, Icon: NodeIcon, accentTopClass, iconClass, borderClass }) => (
    <div className={`bg-card border ${borderClass} rounded-2xl p-6 relative overflow-hidden backdrop-blur-xl`}>
        <div className={`absolute top-0 left-0 right-0 h-0.5 ${accentTopClass}`} />
        <div className="flex items-center gap-3 mb-5">
            <NodeIcon size={20} className={iconClass} />
            <h4 className="text-foreground font-bold text-[15px]">{title}</h4>
        </div>
        <ul className="flex flex-col gap-2.5">
            {items.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-[13px] text-muted-foreground leading-snug">
                    <ChevronRight size={13} className={`${iconClass} mt-0.5 shrink-0`} />
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    </div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   POST-GAME ANALYSIS
═══════════════════════════════════════════════════════════════════════════ */

const ANALYSIS_MOVES: AnalysisMove[] = [
    { index: 1, move: "e4", eval: "+0.2", note: "Classical opening. Solid foundation for central control.", type: "good" },
    { index: 2, move: "Nc3", eval: "+0.4", note: "Develops piece, controls d5. Textbook.", type: "good" },
    { index: 3, move: "d4", eval: "+0.1", note: "Slight inaccuracy. Bd3 was more precise here.", type: "inaccuracy" },
    { index: 4, move: "Bg5", eval: "−0.3", note: "Missed tactical motif — knight fork on f7 was available.", type: "mistake" },
    { index: 5, move: "Qd3", eval: "+1.2", note: "Excellent! Sets up a devastating battery on the d-file.", type: "brilliant" },
];

interface QualityStyle {
    text: string;
    bg: string;
    border: string;
    badge: string;
    label: string;
}

const QUALITY_STYLES: Record<MoveQuality, QualityStyle> = {
    good: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", label: "Good" },
    inaccuracy: { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", badge: "bg-amber-500/15 text-amber-400 border-amber-500/30", label: "Inaccuracy" },
    mistake: { text: "text-danger", bg: "bg-danger/10", border: "border-danger/20", badge: "bg-danger/15 text-danger border-danger/30", label: "Mistake" },
    brilliant: { text: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20", badge: "bg-violet-500/15 text-violet-400 border-violet-500/30", label: "Brilliant!" },
};

const PostGameAnalysis: FC = () => (
    <div className="flex flex-col gap-2.5">
        {ANALYSIS_MOVES.map((m) => {
            const s = QUALITY_STYLES[m.type];
            return (
                <div key={m.index} className={`flex items-start gap-4 px-4 py-3.5 ${s.bg} border ${s.border} rounded-xl`}>
                    <span className="font-mono font-bold text-[14px] text-foreground min-w-[44px] pt-0.5">
                        {m.index}. {m.move}
                    </span>
                    <p className="flex-1 text-[13px] text-muted-foreground leading-relaxed">{m.note}</p>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${s.badge}`}>{s.label}</span>
                        <span className="text-[12px] font-mono text-muted-foreground">{m.eval}</span>
                    </div>
                </div>
            );
        })}
    </div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   NAVBAR
═══════════════════════════════════════════════════════════════════════════ */

interface NavProps {
    active: NavSection;
    setActive: (s: NavSection) => void;
}

const NAV_SECTIONS: NavSection[] = ["Home", "Features", "Architecture"];

const Nav: FC<NavProps> = ({ active, setActive }) => (
    <nav className="fixed top-0 left-0 right-0 z-[999] bg-background/85 backdrop-blur-2xl border-b border-border h-16 flex items-center px-[clamp(16px,5vw,64px)] gap-8">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mr-auto">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-base">
                ♔
            </div>
            <span className="text-[17px] font-black text-foreground tracking-tight">betterChess</span>
            <span className="text-[10px] font-bold tracking-[0.1em] text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/25">BETA</span>
        </div>

        {/* Section links */}
        {NAV_SECTIONS.map((s) => (
            <button
                key={s}
                onClick={() => setActive(s)}
                className={[
                    "text-sm font-medium pb-0.5 border-b-2 transition-all duration-200 cursor-pointer bg-transparent border-x-0 border-t-0",
                    active === s
                        ? "text-primary border-b-primary"
                        : "text-muted-foreground border-b-transparent hover:text-foreground",
                ].join(" ")}
            >
                {s}
            </button>
        ))}

        {/* CTA */}
        <button className="bg-primary/15 border border-primary/35 rounded-xl px-5 py-2 text-[13px] font-semibold text-primary hover:bg-primary/25 transition-colors cursor-pointer tracking-wide">
            Sign in with Google
        </button>
    </nav>
);

/* ═══════════════════════════════════════════════════════════════════════════
   PROFILE STAT BAR
═══════════════════════════════════════════════════════════════════════════ */

const PROFILE_STATS: ProfileStat[] = [
    { label: "Tactical Aggression", value: 74, barClass: "bg-danger", textClass: "text-danger" },
    { label: "Endgame Accuracy", value: 52, barClass: "bg-amber-400", textClass: "text-amber-400" },
    { label: "Opening Prep", value: 88, barClass: "bg-emerald-400", textClass: "text-emerald-400" },
    { label: "Time Pressure Play", value: 41, barClass: "bg-danger", textClass: "text-danger" },
];

/* ═══════════════════════════════════════════════════════════════════════════
   BENTO FEATURES DATA
═══════════════════════════════════════════════════════════════════════════ */

const BENTO_FEATURES: BentoFeature[] = [
    {
        title: "Real-Time Play",
        desc: "WebSocket-powered game rooms with sub-50ms move sync. Play anyone, anywhere, lag-free.",
        Icon: Activity,
        iconClass: "text-emerald-400",
        accentClass: "text-emerald-400",
    },
    {
        title: "LangGraph AI Brain",
        desc: "Stateful AI workflows using LangGraph for multi-step reasoning — not just single prompts.",
        Icon: Brain,
        iconClass: "text-violet-400",
        accentClass: "text-violet-400",
    },
    {
        title: "RAG Pattern Engine",
        desc: "Retrieval-Augmented Generation pulls your historical game context to identify deep strategic tendencies.",
        Icon: Database,
        iconClass: "text-primary",
        accentClass: "text-primary",
    },
    {
        title: "Stockfish 16 Core",
        desc: "The world's strongest chess engine powers centipawn evaluation for every single move.",
        Icon: Cpu,
        iconClass: "text-amber-400",
        accentClass: "text-amber-400",
    },
    {
        title: "SSE AI Streaming",
        desc: "Server-Sent Events stream AI analysis token-by-token for a ChatGPT-like review experience.",
        Icon: Zap,
        iconClass: "text-danger",
        accentClass: "text-danger",
    },
    {
        title: "Google OAuth + RBAC",
        desc: "Secure authentication with role-based access and admin panels for credit management.",
        Icon: Shield,
        iconClass: "text-emerald-400",
        accentClass: "text-emerald-400",
    },
];

/* ═══════════════════════════════════════════════════════════════════════════
   CREDIT TIERS
═══════════════════════════════════════════════════════════════════════════ */

const CREDIT_TIERS: CreditTier[] = [
    {
        tier: "Free",
        credits: "50 credits / mo",
        features: "Basic game review",
        colorClass: "text-muted-foreground",
        bgClass: "bg-muted/50",
        borderClass: "border-border",
    },
    {
        tier: "Pro",
        credits: "500 credits / mo",
        features: "Full AI analysis + RAG patterns",
        colorClass: "text-primary",
        bgClass: "bg-primary/10",
        borderClass: "border-primary/25",
    },
    {
        tier: "Elite",
        credits: "Unlimited*",
        features: "Requires Admin Approval",
        colorClass: "text-amber-400",
        bgClass: "bg-amber-500/10",
        borderClass: "border-amber-500/25",
    },
];

/* ═══════════════════════════════════════════════════════════════════════════
   STATS
═══════════════════════════════════════════════════════════════════════════ */

const HERO_STATS: StatItem[] = [
    { value: "2.4M+", label: "Games Analyzed" },
    { value: "94ms", label: "Avg Move Latency" },
    { value: "99.9%", label: "Uptime SLA" },
];

/* ═══════════════════════════════════════════════════════════════════════════
   SECURITY CARDS
═══════════════════════════════════════════════════════════════════════════ */

const SECURITY_CARDS: SecurityCard[] = [
    {
        Icon: Shield,
        iconClass: "text-emerald-400",
        borderClass: "border-emerald-500/20",
        title: "Google OAuth 2.0",
        desc: "Passwordless auth via Google. JWT session tokens with 7-day refresh cycles and device fingerprinting for anomaly detection.",
    },
    {
        Icon: Crown,
        iconClass: "text-amber-400",
        borderClass: "border-amber-500/20",
        title: "Admin Control Panel",
        desc: "Admins view all users, approve Elite tier requests, manage credit grants, and monitor LLM spend in real time.",
    },
    {
        Icon: Lock,
        iconClass: "text-danger",
        borderClass: "border-danger/20",
        title: "Gated Credit System",
        desc: "Every LLM call is debited against a user credit balance. Admins set per-user limits to keep API costs predictable.",
    },
];

/* ═══════════════════════════════════════════════════════════════════════════
   TECH BADGE DATA
═══════════════════════════════════════════════════════════════════════════ */

interface TechTag {
    l: string;
    colorClass: string;
    bgClass: string;
    borderClass: string;
}

const TECH_TAGS: TechTag[] = [
    { l: "Next.js 14", colorClass: "text-primary", bgClass: "bg-primary/10", borderClass: "border-primary/25" },
    { l: "TypeScript", colorClass: "text-primary", bgClass: "bg-primary/10", borderClass: "border-primary/25" },
    { l: "Tailwind v4", colorClass: "text-primary", bgClass: "bg-primary/10", borderClass: "border-primary/25" },
    { l: "Framer Motion", colorClass: "text-primary", bgClass: "bg-primary/10", borderClass: "border-primary/25" },
    { l: "FastAPI", colorClass: "text-emerald-400", bgClass: "bg-emerald-500/10", borderClass: "border-emerald-500/25" },
    { l: "Python 3.12", colorClass: "text-emerald-400", bgClass: "bg-emerald-500/10", borderClass: "border-emerald-500/25" },
    { l: "WebSockets", colorClass: "text-emerald-400", bgClass: "bg-emerald-500/10", borderClass: "border-emerald-500/25" },
    { l: "Stockfish 16", colorClass: "text-emerald-400", bgClass: "bg-emerald-500/10", borderClass: "border-emerald-500/25" },
    { l: "PostgreSQL", colorClass: "text-emerald-400", bgClass: "bg-emerald-500/10", borderClass: "border-emerald-500/25" },
    { l: "Redis", colorClass: "text-emerald-400", bgClass: "bg-emerald-500/10", borderClass: "border-emerald-500/25" },
    { l: "LangGraph", colorClass: "text-violet-400", bgClass: "bg-violet-500/10", borderClass: "border-violet-500/25" },
    { l: "LangChain", colorClass: "text-violet-400", bgClass: "bg-violet-500/10", borderClass: "border-violet-500/25" },
    { l: "GPT-4o", colorClass: "text-violet-400", bgClass: "bg-violet-500/10", borderClass: "border-violet-500/25" },
    { l: "pgvector", colorClass: "text-violet-400", bgClass: "bg-violet-500/10", borderClass: "border-violet-500/25" },
    { l: "RAG Pipeline", colorClass: "text-violet-400", bgClass: "bg-violet-500/10", borderClass: "border-violet-500/25" },
    { l: "SSE Streaming", colorClass: "text-violet-400", bgClass: "bg-violet-500/10", borderClass: "border-violet-500/25" },
    { l: "Google OAuth", colorClass: "text-amber-400", bgClass: "bg-amber-500/10", borderClass: "border-amber-500/25" },
    { l: "JWT", colorClass: "text-amber-400", bgClass: "bg-amber-500/10", borderClass: "border-amber-500/25" },
    { l: "Docker", colorClass: "text-amber-400", bgClass: "bg-amber-500/10", borderClass: "border-amber-500/25" },
    { l: "Nginx", colorClass: "text-amber-400", bgClass: "bg-amber-500/10", borderClass: "border-amber-500/25" },
];

/* ═══════════════════════════════════════════════════════════════════════════
   HOME SECTION
═══════════════════════════════════════════════════════════════════════════ */

interface HomeSectionProps {
    playMode: PlayMode;
    setPlayMode: (m: PlayMode) => void;
}

const HomeSection: FC<HomeSectionProps> = ({ playMode, setPlayMode }) => (
    <section
        className="section-fade pt-[140px] pb-20 max-w-[1200px] mx-auto px-[clamp(16px,6vw,80px)]"
    >
        {/* ── HERO ── */}
        <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-primary/8 border border-primary/20 rounded-full px-4 py-1.5 mb-7">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_theme(colors.emerald.400)] animate-pulse" />
                <span className="text-xs font-bold text-primary tracking-[0.1em]">AI-POWERED CHESS PLATFORM</span>
            </div>

            <h1
                className="font-black leading-[1.05] tracking-[-0.03em] mb-6 bg-gradient-to-br from-foreground via-primary to-violet-400 bg-clip-text text-transparent"
                style={{ fontSize: "clamp(44px,7vw,88px)" }}
            >
                Play Smarter.<br />Think Deeper.
            </h1>

            <p className="text-muted-foreground leading-relaxed max-w-lg mx-auto mb-12" style={{ fontSize: "clamp(16px,2vw,20px)" }}>
                The only platform where every game feeds an intelligence that understands{" "}
                <em className="text-primary not-italic font-semibold">your</em> chess psychology — not just your moves.
            </p>

            {/* Mode Selector */}
            <div className="inline-flex bg-card border border-border rounded-2xl p-1.5 gap-1 mb-6">
                {([
                    { id: "matchmaking" as PlayMode, label: "Global Matchmaking", emoji: "🌐" },
                    { id: "ai" as PlayMode, label: "The Grandmaster AI", emoji: "🤖" },
                ] as const).map((m) => (
                    <button
                        key={m.id}
                        onClick={() => setPlayMode(m.id)}
                        className={[
                            "px-5 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 cursor-pointer border",
                            playMode === m.id
                                ? "bg-primary/20 text-primary border-primary/40"
                                : "bg-transparent text-muted-foreground border-transparent hover:text-foreground hover:bg-accent",
                        ].join(" ")}
                    >
                        {m.emoji} {m.label}
                    </button>
                ))}
            </div>

            <div className="flex justify-center">
                <button className="bg-primary text-primary-foreground rounded-2xl px-9 py-4 text-base font-bold tracking-wide shadow-[0_8px_32px_var(--tw-shadow-color)] shadow-primary/40 hover:opacity-90 hover:scale-[1.02] transition-all flex items-center gap-2.5 cursor-pointer border-0">
                    Start Playing
                    <ArrowRight size={18} />
                </button>
            </div>
        </div>

        {/* ── CHESSBOARD + AI PANEL ── */}
        <div className="grid grid-cols-2 gap-8 items-center mb-24">
            <div className="flex justify-center animate-float">
                <MiniChessboard />
            </div>

            <div className="flex flex-col gap-4">
                {/* AI Card */}
                <div className="bg-card border border-border rounded-2xl p-7 backdrop-blur-xl">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-11 h-11 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center">
                            <Brain size={20} className="text-violet-400" />
                        </div>
                        <div>
                            <p className="font-bold text-[15px] text-foreground">Grandmaster AI — ELO 2847</p>
                            <p className="text-xs text-muted-foreground">Powered by LangGraph + Stockfish 16</p>
                        </div>
                        <span className="ml-auto w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_theme(colors.emerald.400)]" />
                    </div>
                    <p className="text-[13px] text-muted-foreground leading-relaxed mb-5">
                        Unlike static engines, our AI adapts to your psychological patterns — it knows when you
                        play aggressively after a loss, and exploits it.
                    </p>
                    <div className="flex gap-2 flex-wrap">
                        {["Pattern Memory", "Psych Profiling", "RAG Context", "Adaptive Difficulty"].map((t) => (
                            <span key={t} className="px-3 py-1 rounded-lg text-xs font-semibold text-violet-400 bg-violet-500/10 border border-violet-500/25 tracking-wide">
                                {t}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3">
                    {HERO_STATS.map((s) => (
                        <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center hover:bg-card-hover transition-colors">
                            <p className="text-xl font-black text-primary mb-1 tracking-tight">{s.value}</p>
                            <p className="text-[11px] text-muted-foreground font-medium">{s.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* ── AI CREDIT SYSTEM ── */}
        <div className="max-w-[900px] mx-auto mb-24">
            <div className="bg-card border border-amber-500/25 rounded-3xl p-10 backdrop-blur-xl relative overflow-hidden shadow-[0_0_60px_theme(colors.amber.500/6)]">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 via-amber-500/60 to-transparent" />
                <div className="flex items-start gap-8 flex-wrap">
                    <div className="flex-1 min-w-[260px]">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 bg-amber-500/12 rounded-xl border border-amber-500/25">
                                <Star size={22} className="text-amber-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-foreground tracking-tight">AI Credit System</h3>
                                <p className="text-xs text-muted-foreground">Sustainable intelligence, at scale</p>
                            </div>
                        </div>
                        <p className="text-[14px] text-muted-foreground leading-relaxed">
                            Every AI interaction — game reviews, psychological analysis, pattern detection — is powered
                            by a token credit system. This keeps our LLM costs predictable and ensures elite quality.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 min-w-[240px]">
                        {CREDIT_TIERS.map((t) => (
                            <div key={t.tier} className={`flex items-center justify-between px-4 py-3 ${t.bgClass} border ${t.borderClass} rounded-xl`}>
                                <div>
                                    <span className={`text-sm font-bold ${t.colorClass}`}>{t.tier}</span>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">{t.features}</p>
                                </div>
                                <span className="text-xs text-muted-foreground font-mono">{t.credits}</span>
                            </div>
                        ))}
                        <p className="text-[11px] text-muted-foreground text-right mt-1">
                            * Elite features require Admin Approval for the Demo.
                        </p>
                    </div>
                </div>
            </div>
        </div>

        {/* ── BENTO FEATURES GRID ── */}
        <SectionHeader
            eyebrow="Platform Features"
            title="Built Different"
            subtitle="Not a chess app with AI bolted on. An intelligence layer built from the ground up, for chess."
        />
        <div className="grid grid-cols-3 gap-4 max-w-[1100px] mx-auto mb-24">
            {BENTO_FEATURES.map((f) => (
                <BentoCard key={f.title}>
                    <f.Icon size={24} className={`${f.iconClass} mb-5`} />
                    <h3 className="text-base font-bold text-foreground mb-2.5">{f.title}</h3>
                    <p className="text-[13px] text-muted-foreground leading-relaxed">{f.desc}</p>
                </BentoCard>
            ))}
        </div>

        {/* ── POST-GAME REVIEW ── */}
        <SectionHeader
            eyebrow="Post-Game Intelligence"
            title="Your AI Chess Coach"
            subtitle="After every game, our AI synthesizes Stockfish evaluation with your historical patterns to deliver insights no human coach could."
        />
        <div className="grid grid-cols-2 gap-8 max-w-[1100px] mx-auto mb-20 items-start">
            {/* Analysis panel */}
            <div className="bg-card border border-border rounded-3xl p-7 backdrop-blur-xl">
                <div className="flex items-center gap-2.5 mb-6">
                    <Activity size={17} className="text-primary" />
                    <span className="text-sm font-bold text-foreground">Move-by-Move Analysis</span>
                    <span className="ml-auto text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 font-semibold">LIVE DEMO</span>
                </div>
                <PostGameAnalysis />
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-4">
                {/* Psychological profile */}
                <div className="bg-card border border-violet-500/20 rounded-2xl p-6 backdrop-blur-xl">
                    <p className="text-xs font-bold text-violet-400 tracking-[0.1em] uppercase mb-4">Psychological Profile</p>
                    <div className="flex flex-col gap-4">
                        {PROFILE_STATS.map((s) => (
                            <div key={s.label}>
                                <div className="flex justify-between mb-1.5">
                                    <span className="text-xs text-muted-foreground">{s.label}</span>
                                    <span className={`text-xs font-bold ${s.textClass}`}>{s.value}%</span>
                                </div>
                                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${s.barClass} rounded-full`}
                                        style={{ width: `${s.value}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RAG Insight */}
                <div className="bg-card border border-border rounded-2xl p-6 backdrop-blur-xl">
                    <p className="text-xs font-bold text-primary tracking-[0.1em] uppercase mb-3">RAG Insight — This Session</p>
                    <p className="text-[13px] text-muted-foreground leading-relaxed mb-4">
                        Across your last 47 games, you've blundered in the{" "}
                        <strong className="text-foreground">late middlegame under time pressure</strong>{" "}
                        71% of the time — especially after sacrificing material. Your pattern matches the
                        &ldquo;Impatience Trap&rdquo; identified in 2,300+ players at your ELO.
                    </p>
                    <div className="flex items-center gap-2.5 px-4 py-2.5 bg-primary/8 border border-primary/15 rounded-xl">
                        <Brain size={15} className="text-primary shrink-0" />
                        <span className="text-xs text-primary">Context from 47 historical games via RAG</span>
                    </div>
                </div>
            </div>
        </div>
    </section>
);

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURES SECTION
═══════════════════════════════════════════════════════════════════════════ */

interface AllFeature {
    title: string;
    desc: string;
    Icon: LucideIcon;
    iconClass: string;
}

const ALL_FEATURES: AllFeature[] = [
    { title: "Global Matchmaking", desc: "Compete against ranked players worldwide with ELO-based pairing.", Icon: Globe, iconClass: "text-primary" },
    { title: "Grandmaster AI", desc: "Face an adaptive AI that knows your weaknesses and exploits them intelligently.", Icon: Brain, iconClass: "text-violet-400" },
    { title: "Game Review", desc: "Full move-by-move analysis after every game, powered by Stockfish + GPT-4o.", Icon: Activity, iconClass: "text-emerald-400" },
    { title: "AI Chat Assistant", desc: "Ask the floating chat anything — openings, strategies, your personal stats.", Icon: MessageSquare, iconClass: "text-amber-400" },
    { title: "Psychological Profiling", desc: "Deep pattern analysis across your game history using RAG embeddings.", Icon: TrendingUp, iconClass: "text-danger" },
    { title: "Admin Dashboard", desc: "Platform operators manage credits, approvals, and user tiers from a secure panel.", Icon: Shield, iconClass: "text-emerald-400" },
];

const FeaturesSection: FC = () => (
    <section className="section-fade pt-[120px] pb-20 max-w-[1200px] mx-auto px-[clamp(16px,6vw,80px)]">
        <SectionHeader
            eyebrow="All Features"
            title="Everything You Need to Dominate"
            subtitle="A complete ecosystem built around the idea that better feedback loops create better chess players."
        />
        <div className="grid grid-cols-3 gap-4">
            {ALL_FEATURES.map((f) => (
                <BentoCard key={f.title}>
                    <f.Icon size={24} className={`${f.iconClass} mb-5`} />
                    <h3 className="text-base font-bold text-foreground mb-2.5">{f.title}</h3>
                    <p className="text-[13px] text-muted-foreground leading-relaxed">{f.desc}</p>
                </BentoCard>
            ))}
        </div>
    </section>
);

/* ═══════════════════════════════════════════════════════════════════════════
   ARCHITECTURE SECTION
═══════════════════════════════════════════════════════════════════════════ */

const ArchitectureSection: FC = () => (
    <section className="section-fade pt-[120px] pb-20 max-w-[1200px] mx-auto px-[clamp(16px,6vw,80px)]">
        <SectionHeader
            eyebrow="Technical Deep-Dive"
            title="Engineering the Intelligence Layer"
            subtitle="betterChess is a distributed, poly-repo system designed for real-time scale and AI-native workflows."
        />

        {/* ── POLY REPO ── */}
        <div className="mb-20">
            <h3 className="text-foreground font-black text-xl tracking-tight mb-2">Distributed Poly-Repo Architecture</h3>
            <p className="text-muted-foreground text-sm mb-8 leading-relaxed">Three independent repositories — each deployable, scalable, and owned by a different concern.</p>

            <div className="grid grid-cols-3 gap-5 mb-6">
                <ArchNode
                    title="Frontend — Next.js App"
                    accentTopClass="bg-gradient-to-r from-primary to-primary/0"
                    iconClass="text-primary"
                    borderClass="border-primary/20"
                    Icon={Globe}
                    items={[
                        "Next.js 14 App Router + TypeScript",
                        "Tailwind CSS v4 with OKLCH theme tokens",
                        "Framer Motion for all animations",
                        "WebSocket client for real-time game state",
                        "SSE consumer for streaming AI analysis",
                        "shadcn/ui component primitives",
                    ]}
                />
                <ArchNode
                    title="Core Backend — Game Server"
                    accentTopClass="bg-gradient-to-r from-emerald-400 to-emerald-400/0"
                    iconClass="text-emerald-400"
                    borderClass="border-emerald-500/20"
                    Icon={Server}
                    items={[
                        "FastAPI (Python) for REST endpoints",
                        "WebSocket server for live game rooms",
                        "Stockfish 16 subprocess integration",
                        "PostgreSQL for game history + user data",
                        "Redis for real-time room state + pub/sub",
                        "Google OAuth 2.0 via authlib",
                    ]}
                />
                <ArchNode
                    title="AI Backend — Intelligence"
                    accentTopClass="bg-gradient-to-r from-violet-400 to-violet-400/0"
                    iconClass="text-violet-400"
                    borderClass="border-violet-500/20"
                    Icon={Brain}
                    items={[
                        "LangGraph for stateful AI agent workflows",
                        "RAG pipeline with pgvector embeddings",
                        "OpenAI GPT-4o for game analysis",
                        "SSE streaming responses to frontend",
                        "Credit accounting per-request",
                        "Async Celery workers for batch analysis",
                    ]}
                />
            </div>

            {/* Connection rail */}
            <div className="bg-card border border-border rounded-2xl px-8 py-5 flex items-center justify-center gap-0 flex-wrap">
                {([
                    { label: "Browser Client", className: "text-primary   bg-primary/10   border-primary/30" },
                    null,
                    { label: "Core Backend", className: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
                    null,
                    { label: "AI Backend", className: "text-violet-400 bg-violet-500/10 border-violet-500/30" },
                ] as (null | { label: string; className: string })[]).map((item, i) =>
                    item ? (
                        <div key={i} className={`px-5 py-2.5 rounded-xl border text-sm font-bold ${item.className}`}>{item.label}</div>
                    ) : (
                        <div key={i} className="flex flex-col items-center px-3">
                            <span className="text-muted-foreground text-sm">— ⇄ —</span>
                            <span className="text-[10px] text-muted-foreground mt-0.5">{i === 1 ? "WebSocket / HTTPS" : "gRPC / HTTP"}</span>
                        </div>
                    )
                )}
            </div>
        </div>

        {/* ── INTELLIGENCE LAYER ── */}
        <div className="mb-20">
            <h3 className="text-foreground font-black text-xl tracking-tight mb-2">The Intelligence Layer</h3>
            <p className="text-muted-foreground text-sm mb-8 leading-relaxed">A multi-agent pipeline combining classical engine evaluation with LLM reasoning and personal historical context.</p>

            <div className="grid grid-cols-2 gap-5">
                <div className="flex flex-col gap-4">
                    {/* LangGraph */}
                    <div className="bg-card border border-violet-500/20 rounded-2xl p-6 backdrop-blur-xl">
                        <div className="flex items-center gap-2.5 mb-4">
                            <GitBranch size={18} className="text-violet-400" />
                            <h4 className="text-foreground font-bold text-[15px]">LangGraph Workflow</h4>
                        </div>
                        <p className="text-[13px] text-muted-foreground leading-relaxed mb-4">
                            LangGraph enables stateful, multi-step AI agent pipelines. Unlike single-prompt GPT calls,
                            LangGraph workflows maintain state across nodes — enabling branching logic, tool calls, and
                            iterative reasoning across your full game tree.
                        </p>
                        <div className="flex gap-2 flex-wrap">
                            {["StateGraph", "Conditional Edges", "Tool Nodes", "Memory Persistence"].map((t) => (
                                <span key={t} className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-violet-400 bg-violet-500/10 border border-violet-500/25">{t}</span>
                            ))}
                        </div>
                    </div>

                    {/* RAG */}
                    <div className="bg-card border border-primary/20 rounded-2xl p-6 backdrop-blur-xl">
                        <div className="flex items-center gap-2.5 mb-4">
                            <Database size={18} className="text-primary" />
                            <h4 className="text-foreground font-bold text-[15px]">RAG — Personal Game Context</h4>
                        </div>
                        <p className="text-[13px] text-muted-foreground leading-relaxed mb-4">
                            After each game, positions and evaluations are embedded into pgvector. When you request analysis,
                            the RAG pipeline retrieves your 50 most similar historical positions — giving the LLM real context
                            about your personal tendencies, not generic advice.
                        </p>
                        <div className="flex gap-2 flex-wrap">
                            {["pgvector", "Embeddings", "Semantic Search", "Player Fingerprint"].map((t) => (
                                <span key={t} className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-primary bg-primary/10 border border-primary/25">{t}</span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    {/* Stockfish */}
                    <div className="bg-card border border-amber-500/20 rounded-2xl p-6 backdrop-blur-xl">
                        <div className="flex items-center gap-2.5 mb-4">
                            <Cpu size={18} className="text-amber-400" />
                            <h4 className="text-foreground font-bold text-[15px]">Stockfish 16 Integration</h4>
                        </div>
                        <p className="text-[13px] text-muted-foreground leading-relaxed">
                            Stockfish runs as a managed subprocess in the Core Backend. For each game, we store centipawn
                            evaluations at every ply. This structured evaluation data feeds the LLM as grounded truth —
                            ensuring AI analysis is never hallucinated.
                        </p>
                    </div>

                    {/* WS vs SSE */}
                    <div className="bg-card border border-border rounded-2xl p-6 backdrop-blur-xl flex-1">
                        <div className="flex items-center gap-2.5 mb-4">
                            <Network size={18} className="text-primary" />
                            <h4 className="text-foreground font-bold text-[15px]">WebSockets vs. SSE</h4>
                        </div>
                        <div className="flex flex-col gap-3">
                            <div className="p-4 bg-emerald-500/8 border border-emerald-500/20 rounded-xl">
                                <p className="text-[12px] font-bold text-emerald-400 mb-1.5">WebSockets — Live Chess Games</p>
                                <p className="text-[12px] text-muted-foreground leading-relaxed">
                                    Bi-directional, persistent connection. Required for real-time move sync where both players
                                    must send and receive data simultaneously with sub-100ms latency.
                                </p>
                            </div>
                            <div className="p-4 bg-primary/8 border border-primary/20 rounded-xl">
                                <p className="text-[12px] font-bold text-primary mb-1.5">SSE — AI Analysis Streaming</p>
                                <p className="text-[12px] text-muted-foreground leading-relaxed">
                                    Server-to-client only. Perfect for streaming LLM token output. Simpler than WebSockets,
                                    works over standard HTTP/2, and handles reconnection natively.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* ── SECURITY & SCALE ── */}
        <div className="mb-16">
            <h3 className="text-foreground font-black text-xl tracking-tight mb-2">Security & Scale</h3>
            <p className="text-muted-foreground text-sm mb-8 leading-relaxed">Production-grade security and cost controls from day one.</p>
            <div className="grid grid-cols-3 gap-4">
                {SECURITY_CARDS.map((c) => (
                    <div key={c.title} className={`bg-card border ${c.borderClass} rounded-2xl p-6 backdrop-blur-xl hover:bg-card-hover transition-colors`}>
                        <c.Icon size={22} className={`${c.iconClass} mb-5`} />
                        <h4 className="text-foreground font-bold text-[15px] mb-2.5">{c.title}</h4>
                        <p className="text-[13px] text-muted-foreground leading-relaxed">{c.desc}</p>
                    </div>
                ))}
            </div>
        </div>

        {/* ── FULL TECH STACK ── */}
        <div className="bg-card border border-border rounded-2xl px-8 py-7">
            <p className="text-xs font-bold text-muted-foreground tracking-[0.1em] uppercase mb-4">Full Technology Stack</p>
            <div className="flex gap-2 flex-wrap">
                {TECH_TAGS.map((t) => (
                    <TechBadge key={t.l} label={t.l} colorClass={t.colorClass} bgClass={t.bgClass} borderClass={t.borderClass} />
                ))}
            </div>
        </div>
    </section>
);

/* ═══════════════════════════════════════════════════════════════════════════
   FOOTER
═══════════════════════════════════════════════════════════════════════════ */

const Footer: FC = () => (
    <footer className="border-t border-border px-[clamp(16px,6vw,80px)] py-8 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
            <span className="text-lg text-foreground">♔</span>
            <span className="text-sm font-bold text-muted-foreground">betterChess</span>
        </div>
        <p className="text-xs text-muted-foreground">© 2025 betterChess. Built with LangGraph, Stockfish, and obsession.</p>
        <div className="flex gap-4">
            {(["Privacy", "Terms", "GitHub"] as const).map((l) => (
                <a key={l} href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors no-underline">
                    {l}
                </a>
            ))}
        </div>
    </footer>
);

/* ═══════════════════════════════════════════════════════════════════════════
   ROOT APP
═══════════════════════════════════════════════════════════════════════════ */

export default function BetterChessApp(): JSX.Element {
    const [active, setActive] = useState<NavSection>("Home");
    const [playMode, setPlayMode] = useState<PlayMode>("matchmaking");

    return (
        <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
            {/* Global keyframe animations injected once */}
            <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0);    }
          50%       { transform: translateY(-12px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .section-fade { animation: fadeIn 0.6s ease both; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-slideUp { animation: slideUp 0.25s ease; }
      `}</style>

            {/* Ambient background glows — purely decorative, pointer-events off */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden>
                <div className="absolute -top-48 left-[20%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl animate-pulse" style={{ animationDuration: "6s" }} />
                <div className="absolute top-[40%] -right-24 w-[400px] h-[400px] rounded-full bg-primary/4 blur-3xl animate-pulse" style={{ animationDuration: "8s", animationDelay: "2s" }} />
                <div className="absolute bottom-[10%] left-[10%] w-[500px] h-[500px] rounded-full bg-violet-500/3 blur-3xl animate-pulse" style={{ animationDuration: "10s", animationDelay: "4s" }} />
            </div>

            {/* Content above glows */}
            <div className="relative z-10">
                <Nav active={active} setActive={setActive} />

                {active === "Home" && <HomeSection playMode={playMode} setPlayMode={setPlayMode} />}
                {active === "Features" && <FeaturesSection />}
                {active === "Architecture" && <ArchitectureSection />}

                <Footer />
            </div>

            <FloatingChat />
        </div>
    );
}