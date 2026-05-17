"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    Swords,
    Clock,
    Users,
    RefreshCw,
    ArrowLeft,
    Wifi,
    WifiOff,
    Trophy,
    Zap,
    Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getPiece } from "@/lib/pieces-registry";
import { RootState } from "@/lib/store";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useSocket } from "@/context/SocketProvider";
import "./index.css";

// ─── Types ────────────────────────────────────────────────────────────────────

type MatchStatus = "searching" | "found" | "timeout" | "cancelled";

interface MatchResult {
    gameId: string;
    opponent: {
        name: string;
        rating: number;
        avatar: string; // initials
        country: string;
    };
}

const TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const SIMULATE_MATCH_AT = 120;         // seconds — set to a big number for real usage

function useMatchmaking() {
    const [status, setStatus] = useState<MatchStatus>("searching");
    const [elapsed, setElapsed] = useState(0);           // seconds
    const [match, setMatch] = useState<MatchResult | null>(null);
    const startRef = useRef<number>(Date.now());
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const { socket } = useSocket();
    const dispatch = useAppDispatch();
    const router = useRouter();

    const stopTimer = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
    }, []);

    const startSearching = useCallback(() => {
        setStatus("searching");
        setElapsed(0);
        setMatch(null);
        startRef.current = Date.now();

        timerRef.current = setInterval(() => {
            const secs = Math.floor((Date.now() - startRef.current) / 1000);
            setElapsed(secs);

            // ── Simulated match found ──────────────────────────────────────────────
            if (secs >= SIMULATE_MATCH_AT) {
                stopTimer();
                const result: MatchResult = {
                    gameId: `game_${Math.random().toString(36).slice(2, 10)}`,
                    opponent: {
                        name: "Magnus K.",
                        rating: 1847,
                        avatar: "MK",
                        country: "🇳🇴",
                    },
                };
                setMatch(result);
                setStatus("found");
                return;
            }

            // ── Timeout ───────────────────────────────────────────────────────────
            if (Date.now() - startRef.current >= TIMEOUT_MS) {
                stopTimer();
                setStatus("timeout");
            }
        }, 1000);
    }, [stopTimer]);

    const cancel = useCallback(() => {
        stopTimer();
        setStatus("cancelled");
    }, [stopTimer]);

    const retry = useCallback(() => {
        startSearching();
    }, [startSearching]);

    useEffect(() => {
        startSearching();
        return stopTimer;
    }, [startSearching, stopTimer]);

    useEffect(() => {
        if (!socket) return;

        socket.on('match:found', ({ gameId, white, black }: { gameId: string; white: string; black: string }) => {
            stopTimer();
            setStatus("found");
            router.push(`/chess/${gameId}`);
            // Optionally fetch opponent details here using gameId, then setMatch(...)
        });

    }, [socket, dispatch, router]) // Include socket and dispatch in dependencies to avoid warnings;

    return { status, elapsed, match, cancel, retry };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(secs: number) {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Animated chess-board grid in the background */
function ChessBoardBg() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden>
            {/* Checker grid */}
            <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                    backgroundImage: `
            linear-gradient(45deg, var(--foreground) 25%, transparent 25%),
            linear-gradient(-45deg, var(--foreground) 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, var(--foreground) 75%),
            linear-gradient(-45deg, transparent 75%, var(--foreground) 75%)
          `,
                    backgroundSize: "60px 60px",
                    backgroundPosition: "0 0, 0 30px, 30px -30px, -30px 0px",
                    animation: "bgDrift 40s linear infinite",
                }}
            />
            {/* Radial vignette */}
            <div
                className="absolute inset-0"
                style={{
                    background:
                        "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 30%, var(--background) 100%)",
                }}
            />
        </div>
    );
}

/** Floating chess piece silhouettes */
// const PIECES = ["♟", "♞", "♝", "♜", "♛", "♚", "♙", "♘", "♗", "♖", "♕", "♔"];

function FloatingPieces() {
    // Deterministic positions so SSR matches client
    const items = [
        { piece: "♟", x: 8, y: 12, size: 28, dur: 18, delay: 0 },
        { piece: "♞", x: 88, y: 20, size: 36, dur: 22, delay: 3 },
        { piece: "♜", x: 15, y: 75, size: 32, dur: 25, delay: 7 },
        { piece: "♛", x: 80, y: 70, size: 44, dur: 20, delay: 1.5 },
        { piece: "♝", x: 50, y: 5, size: 30, dur: 28, delay: 5 },
        { piece: "♚", x: 5, y: 45, size: 40, dur: 16, delay: 9 },
        { piece: "♙", x: 92, y: 48, size: 26, dur: 24, delay: 2 },
        { piece: "♗", x: 40, y: 88, size: 34, dur: 19, delay: 11 },
    ];

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden>
            {items.map((item, i) => (
                <span
                    key={i}
                    className="absolute opacity-[0.06] text-foreground"
                    style={{
                        left: `${item.x}%`,
                        top: `${item.y}%`,
                        fontSize: item.size,
                        animation: `floatPiece ${item.dur}s ease-in-out ${item.delay}s infinite`,
                    }}
                >
                    {item.piece}
                </span>
            ))}
        </div>
    );
}

/** Sonar / radar rings */
function SonarRings({ active }: { active: boolean }) {
    if (!active) return null;
    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden>
            {[0, 1, 2, 3].map((i) => (
                <span
                    key={i}
                    className="absolute rounded-full border border-primary/30"
                    style={{
                        width: 160 + i * 80,
                        height: 160 + i * 80,
                        animation: `sonarPulse 3s ease-out ${i * 0.75}s infinite`,
                    }}
                />
            ))}
        </div>
    );
}

/** Match-found celebration burst */
function MatchFoundBurst() {
    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden>
            {Array.from({ length: 12 }).map((_, i) => (
                <span
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-primary"
                    style={{
                        animation: `burstParticle 0.8s ease-out forwards`,
                        animationDelay: `${i * 0.04}s`,
                        "--angle": `${i * 30}deg`,
                    } as React.CSSProperties}
                />
            ))}
        </div>
    );
}

/** Avatar circle for player / opponent */
function AvatarCircle({
    initials,
    label,
    rating,
    country,
    glow = false,
    dim = false,
    size = "lg",
}: {
    initials: string;
    label: string;
    rating?: number;
    country?: string;
    glow?: boolean;
    dim?: boolean;
    size?: "sm" | "lg";
}) {
    const szOuter = size === "lg" ? "w-20 h-20 sm:w-24 sm:h-24" : "w-14 h-14 sm:w-16 sm:h-16";
    const szText = size === "lg" ? "text-2xl sm:text-3xl" : "text-lg";

    return (
        <div className={cn("flex flex-col items-center gap-2 transition-opacity duration-500", dim && "opacity-30")}>
            <div className={cn(
                "relative rounded-full flex items-center justify-center font-bold tracking-tight",
                "bg-muted border-2 border-border text-foreground transition-all duration-500",
                szOuter, szText,
                glow && "border-primary shadow-[0_0_24px_4px_color-mix(in_oklch,var(--primary)_40%,transparent)]"
            )}>
                {initials}
                {country && (
                    <span className="absolute -bottom-1 -right-1 text-sm leading-none">{country}</span>
                )}
            </div>
            <div className="text-center">
                <p className="text-sm font-semibold text-foreground leading-tight">{label}</p>
                {rating !== undefined && (
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-0.5">
                        <Trophy className="w-3 h-3 text-primary" />
                        {rating}
                    </p>
                )}
            </div>
        </div>
    );
}

/** The spinning search indicator between two avatars */
function SearchIndicator({ status }: { status: MatchStatus }) {
    return (
        <div className="relative flex items-center justify-center flex-shrink-0">
            {status === "found" && <MatchFoundBurst />}

            {/* Outer spinning ring */}
            {status === "searching" && (
                <span
                    className="absolute w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-dashed border-primary/40"
                    style={{ animation: "spin 8s linear infinite" }}
                />
            )}

            {/* Center icon */}
            <div className={cn(
                "relative z-10 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                status === "found"
                    ? "bg-primary border-primary scale-110"
                    : "bg-card border-border"
            )}>
                {status === "found"
                    ? <Swords className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
                    : (
                        <span
                            className="text-2xl sm:text-3xl text-primary"
                            style={{ animation: "pieceBob 2s ease-in-out infinite" }}
                        >
                            <img src={getPiece("b", "w", "neo")} alt="Rook" />
                        </span>
                    )
                }
            </div>

            {/* VS badge when found */}
            {status === "found" && (
                <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-black tracking-widest text-primary"
                    style={{ animation: "fadeSlideUp 0.4s ease-out forwards" }}
                >
                    VS
                </span>
            )}
        </div>
    );
}

/** 5-minute timeout dialog */
function TimeoutDialog({ onRetry, onBack }: { onRetry: () => void; onBack: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
            <div className={cn(
                "bg-card border border-border rounded-t-2xl sm:rounded-2xl shadow-2xl",
                "w-full sm:max-w-md p-6 sm:p-8",
                "animate-[slideUp_0.35s_cubic-bezier(0.34,1.56,0.64,1)_forwards]"
            )}>
                {/* Icon */}
                <div className="flex justify-center mb-5">
                    <div className="w-16 h-16 rounded-full bg-muted border border-border flex items-center justify-center">
                        <Clock className="w-8 h-8 text-muted-foreground" />
                    </div>
                </div>

                <h2 className="text-xl font-bold text-foreground text-center mb-2">
                    Taking longer than usual…
                </h2>
                <p className="text-sm text-muted-foreground text-center mb-6 leading-relaxed">
                    We couldn't find a match in 5 minutes. Servers might be busy right now.
                </p>

                {/* Options */}
                <div className="space-y-3">
                    <button
                        onClick={onRetry}
                        className={cn(
                            "w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3",
                            "bg-primary text-primary-foreground text-sm font-semibold",
                            "hover:opacity-90 active:scale-[0.98] transition-all"
                        )}
                    >
                        <RefreshCw className="w-4 h-4" />
                        Search again
                    </button>
                    <button
                        onClick={onBack}
                        className={cn(
                            "w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3",
                            "bg-muted text-muted-foreground border border-border text-sm font-medium",
                            "hover:bg-accent hover:text-foreground active:scale-[0.98] transition-all"
                        )}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to lobby
                    </button>
                </div>

                <p className="text-xs text-muted-foreground text-center mt-4">
                    Try again in a few minutes when more players are online.
                </p>
            </div>
        </div>
    );
}

/** Stat pill */
function StatPill({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
    return (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted border border-border text-xs text-muted-foreground">
            <Icon className="w-3.5 h-3.5 text-primary" />
            {label}
        </div>
    );
}

export default function MatchmakingPage() {
    const router = useRouter();
    const { status, elapsed, match, cancel, retry } = useMatchmaking();
    const [redirecting, setRedirecting] = useState(false);
    const { onlineUsers, usersInQueue } = useAppSelector((state: RootState) => state.game);
    // const { socket } = useSocket();

    // Auto-redirect when match is found
    useEffect(() => {
        if (status === "found" && match) {
            const t = setTimeout(() => {
                setRedirecting(true);
                // Give "found" animation a moment to play, then navigate
                setTimeout(() => {
                    // router.push(`/chess/${match.gameId}`);
                    cancel();
                }, 1200);
            }, 600);
            return () => clearTimeout(t);
        }
    }, [status, match, router]);

    const handleBack = () => router.push("/dashboard");

    const isSearching = status === "searching";
    const isFound = status === "found";
    const isTimeout = status === "timeout";

    // Shimmer text style for the status heading
    const shimmerStyle: React.CSSProperties = isSearching
        ? {
            background: "linear-gradient(90deg, var(--foreground) 25%, var(--primary) 50%, var(--foreground) 75%)",
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            animation: "shimmer 3s linear infinite",
        }
        : {};

    return (
        <>
            <main className="relative min-h-dvh bg-background flex flex-col items-center justify-center overflow-hidden px-4 py-10">

                {/* ── Background layers ── */}
                <ChessBoardBg />
                <FloatingPieces />

                {/* Sonar rings behind everything */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <SonarRings active={isSearching} />
                </div>

                {/* ── Content card ── */}
                <div
                    className={cn(
                        "relative z-10 w-full max-w-lg flex flex-col items-center gap-8",
                        "animate-[fadeIn_0.6s_ease-out_forwards]"
                    )}
                >
                    {/* Header */}
                    <div className="text-center space-y-1">
                        <div className="flex items-center justify-center gap-2 mb-3">
                            {isSearching && <Wifi className="w-4 h-4 text-primary animate-pulse" />}
                            {isFound && <Zap className="w-4 h-4 text-primary" />}
                            {!isSearching && !isFound && <WifiOff className="w-4 h-4 text-muted-foreground" />}
                            <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                                {isSearching ? "Matchmaking" : isFound ? "Match Found!" : "Search Ended"}
                            </span>
                        </div>
                        <h1
                            className="text-3xl sm:text-4xl font-black tracking-tight"
                            style={shimmerStyle}
                            aria-live="polite"
                        >
                            {isSearching && "Finding your opponent…"}
                            {isFound && "Opponent found!"}
                            {status === "cancelled" && "Search cancelled"}
                        </h1>
                        {isSearching && (
                            <p className="text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1">
                                Looking for a player near your rating
                                <span className="inline-flex gap-0.5 ml-1">
                                    {[0, 1, 2].map((i) => (
                                        <span
                                            key={i}
                                            className="w-1 h-1 rounded-full bg-muted-foreground"
                                            style={{ animation: `dotBlink 1.4s ease-in-out ${i * 0.2}s infinite` }}
                                        />
                                    ))}
                                </span>
                            </p>
                        )}
                    </div>

                    {/* ── Player vs Opponent row ── */}
                    <div
                        className={cn(
                            "relative w-full rounded-2xl border border-border bg-card/80 backdrop-blur-md p-6 sm:p-8",
                            "flex items-center justify-between gap-4",
                            isFound && "border-primary/50",
                            isFound && "animate-[pulseGlow_2s_ease-in-out_1]"
                        )}
                    >
                        {/* Player */}
                        <AvatarCircle
                            initials="You"
                            label="You"
                            rating={1512}
                            glow={isFound}
                        />

                        {/* Center — spinner or VS */}
                        <SearchIndicator status={status} />

                        {/* Opponent */}
                        {isFound && match ? (
                            <div style={{ animation: "fadeIn 0.5s ease-out forwards" }}>
                                <AvatarCircle
                                    initials={match.opponent.avatar}
                                    label={match.opponent.name}
                                    rating={match.opponent.rating}
                                    country={match.opponent.country}
                                    glow
                                />
                            </div>
                        ) : (
                            <AvatarCircle
                                initials="?"
                                label="Searching…"
                                dim={!isSearching}
                            />
                        )}
                    </div>

                    {/* ── Timer ── */}
                    <div className="flex flex-col items-center gap-1" aria-live="polite" aria-atomic>
                        <div className={cn(
                            "font-mono text-5xl sm:text-6xl font-black tabular-nums tracking-tight",
                            isFound ? "text-primary" : "text-foreground"
                        )}>
                            {formatTime(elapsed)}
                        </div>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest">
                            {isFound ? "Match found in" : "Elapsed"}
                        </p>
                    </div>

                    {/* ── Stats row ── */}
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        <StatPill icon={Users} label={`${usersInQueue} available`} />
                        <StatPill icon={Shield} label="Rated match" />
                        <StatPill icon={Zap} label="Rapid · 10+0" />
                    </div>

                    {/* ── Action buttons ── */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs sm:max-w-sm">
                        {isSearching && (
                            <>
                                <button
                                    onClick={() => { cancel() }}
                                    className={cn(
                                        "w-full flex items-center justify-center gap-2 rounded-xl px-5 py-3",
                                        "border border-border bg-muted text-muted-foreground text-sm font-medium",
                                        "hover:bg-accent hover:text-foreground active:scale-[0.98] transition-all"
                                    )}
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Cancel
                                </button>
                            </>
                        )}

                        {isFound && !redirecting && (
                            <p className="text-sm text-muted-foreground animate-pulse text-center">
                                Redirecting to game…
                            </p>
                        )}

                        {redirecting && (
                            <p className="text-sm text-primary font-semibold text-center animate-pulse">
                                Starting game…
                            </p>
                        )}

                        {status === "cancelled" && (
                            <>
                                <button
                                    onClick={retry}
                                    className="w-full flex items-center justify-center gap-2 rounded-xl px-5 py-3 bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Search again
                                </button>
                                <button
                                    onClick={handleBack}
                                    className="w-full flex items-center justify-center gap-2 rounded-xl px-5 py-3 border border-border bg-muted text-muted-foreground text-sm font-medium hover:bg-accent hover:text-foreground active:scale-[0.98] transition-all"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to lobby
                                </button>
                            </>
                        )}
                    </div>

                    {/* ── Tips carousel (keeps users engaged) ── */}
                    {isSearching && <EngagementTip elapsed={elapsed} />}
                </div>

                {/* ── Timeout dialog ── */}
                {isTimeout && (
                    <TimeoutDialog onRetry={retry} onBack={handleBack} />
                )}
            </main>
        </>
    );
}

// ─── Engagement tip rotator ───────────────────────────────────────────────────

const TIPS = [
    { icon: "♟", text: "A knight on the rim is dim. Centralise your pieces early." },
    { icon: "♜", text: "Rooks belong on open files. Double them up for maximum pressure." },
    { icon: "♛", text: "Don't bring your queen out too early — it becomes an easy target." },
    { icon: "♝", text: "Bishops are strongest on open diagonals. Clear the pawns!" },
    { icon: "♚", text: "Castle early to safeguard your king — don't leave him in the centre." },
    { icon: "♙", text: "Passed pawns must be pushed. A far-advanced passer wins games." },
];

function EngagementTip({ elapsed }: { elapsed: number }) {
    const index = Math.floor(elapsed / 10) % TIPS.length;
    const tip = TIPS[index];

    return (
        <div
            key={index}
            className={cn(
                "w-full max-w-sm rounded-xl border border-border bg-muted/60 px-4 py-3",
                "flex items-start gap-3 text-left",
                "animate-[fadeIn_0.4s_ease-out_forwards]"
            )}
        >
            <span className="text-2xl shrink-0 leading-none mt-0.5">{tip.icon}</span>
            <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-0.5">
                    Chess Tip
                </p>
                <p className="text-xs text-foreground/80 leading-relaxed">{tip.text}</p>
            </div>
        </div>
    );
}