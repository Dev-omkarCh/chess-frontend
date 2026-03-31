"use client";

import { useState, useEffect } from "react";
import {
    X,
    Sword,
    Clock,
    MessageSquare,
    Trophy,
    Shuffle,
    Send,
    Shield,
    Zap,
    Timer,
    Gamepad2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { getPiece } from "@/lib/pieces-registry";
import toast from "react-hot-toast";
import { Challenge, Friend } from "@/types/social";

// ─── Types ────────────────────────────────────────────────────────────────────

// ─── Constants ────────────────────────────────────────────────────────────────

const TIME_CONTROLS: {
    value: Challenge["timeControl"];
    label: string;
    sub: string;
    icon: React.ElementType;
}[] = [
        { value: "1m", label: "1", sub: "Bullet", icon: Zap },
        { value: "3m", label: "3", sub: "Blitz", icon: Zap },
        { value: "5m", label: "5", sub: "Blitz", icon: Timer },
        { value: "10m", label: "10", sub: "Rapid", icon: Clock },
    ];

const KEYFRAMES = `
@keyframes cdFadeIn {
  from { opacity: 0; transform: translateY(10px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0)    scale(1);    }
}
@keyframes cdShimmer {
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
}
@keyframes cdPieceFloat {
  0%, 100% { transform: translateY(0)   rotate(0deg); }
  50%       { transform: translateY(-6px) rotate(3deg); }
}
@keyframes cdPulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
}
@keyframes cdSpin {
  to { transform: rotate(360deg); }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.001ms !important; }
}
`;

// ─── Sub-components ───────────────────────────────────────────────────────────

function AvatarBlock({ friend }: { friend: Friend | null }) {
    if (!friend) return null;

    const eloColor =
        friend.elo >= 2000 ? "text-yellow-400" :
            friend.elo >= 1500 ? "text-primary" :
                "text-muted-foreground";

    return (
        <div
            className="flex items-center gap-4 px-5 py-2 rounded-xl bg-muted/60 border border-border relative"
            style={{ animation: "cdFadeIn 0.35s ease-out forwards" }}
        >
            {/* Subtle board-pattern bg */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: `
            linear-gradient(45deg, var(--foreground) 25%, transparent 25%),
            linear-gradient(-45deg, var(--foreground) 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, var(--foreground) 75%),
            linear-gradient(-45deg, transparent 75%, var(--foreground) 75%)
          `,
                    backgroundSize: "20px 20px",
                    backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
                }}
            />

            {/* Avatar */}
            <div className="relative flex-shrink-0 h-fit">
                <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center overflow-hidden",
                    "bg-card border-2 border-primary/40 text-foreground font-bold text-lg select-none",
                    "shadow-[0_0_16px_2px_color-mix(in_oklch,var(--primary)_20%,transparent)]"
                )}>
                    <img src={friend.avatar || "/placeholder.com"} />
                </div>
                {/* Online dot */}
                {<span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ${friend.isOnline ? "bg-emerald-500" : "bg-gray-500 opacity-55"} border-2 border-card`} />}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm leading-tight truncate">
                    {friend.username}
                </p>
                <p className={cn("text-xs font-mono font-bold mt-0.5 flex items-center gap-1", eloColor)}>
                    <Trophy className="w-3 h-3" />
                    {friend.elo} ELO
                </p>
            </div>

            {/* Floating piece accent */}
            <span
                className="text-3xl opacity-10 select-none flex-shrink-0"
                style={{ animation: "cdPieceFloat 3s ease-in-out infinite" }}
                aria-hidden
            >
                <img src={getPiece("n", "w", "neo")} alt="" className="h-10 w-10" />
            </span>
        </div>
    );
}

// Segmented control — used for time control & match type
function SegmentedControl<T extends string>({
    options,
    value,
    onChange,
    renderOption,
}: {
    options: readonly T[];
    value: T;
    onChange: (v: T) => void;
    renderOption: (v: T, selected: boolean) => React.ReactNode;
}) {
    return (
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
            {options.map((opt) => {
                const selected = value === opt;
                return (
                    <button
                        key={opt}
                        onClick={() => onChange(opt)}
                        className={cn(
                            "relative rounded-lg px-2 py-2.5 text-xs font-semibold transition-all duration-200",
                            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                            "active:scale-[0.97]",
                            selected
                                ? "bg-primary text-primary-foreground shadow-[0_2px_12px_color-mix(in_oklch,var(--primary)_35%,transparent)]"
                                : "bg-muted border border-border text-muted-foreground hover:bg-accent hover:text-foreground hover:border-primary/30"
                        )}
                    >
                        {renderOption(opt, selected)}
                    </button>
                );
            })}
        </div>
    );
}

// Toggle switch
function Toggle({
    checked,
    onChange,
    id,
}: {
    checked: boolean;
    onChange: (v: boolean) => void;
    id?: string;
}) {
    return (
        <button
            id={id}
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                checked ? "bg-primary" : "bg-muted border border-border"
            )}
        >
            <span className={cn(
                "inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200",
                checked ? "translate-x-6" : "translate-x-1"
            )} />
        </button>
    );
}

// Side selector — three visual chess-board squares
function SideSelector({
    value,
    onChange,
}: {
    value: Challenge["side"];
    onChange: (v: Challenge["side"]) => void;
}) {
    const options: { value: Challenge["side"]; label: string; piece: string; bg: string; pieceColor: string }[] = [
        { value: "white", label: "White", piece: getPiece("k", "w", "standard") || "", bg: "#F0D9B5", pieceColor: "#1a1a1a" },
        { value: "random", label: "Random", piece: getPiece('p', "w", "neo") || "", bg: "linear-gradient(135deg,#F0D9B5 50%,#B58863 50%)", pieceColor: "#5a5a5a" },
        { value: "black", label: "Black", piece: getPiece('k', "b", "standard") || "", bg: "#B58863", pieceColor: "#F0D9B5" },
    ];

    return (
        <div className="grid grid-cols-3 gap-2">
            {options.map((opt) => {
                const selected = value === opt.value;
                return (
                    <button
                        key={opt.value}
                        onClick={() => onChange(opt.value)}
                        className={cn(
                            "relative rounded-xl overflow-hidden flex flex-col items-center justify-end pb-2 pt-5",
                            "border-2 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                            "active:scale-[0.97] h-24",
                            selected
                                ? "border-primary shadow-[0_0_16px_2px_color-mix(in_oklch,var(--primary)_30%,transparent)]"
                                : "border-border hover:border-primary/40"
                        )}
                        style={{ background: opt.bg }}
                    >
                        {/* Checker overlay */}
                        <div className="absolute inset-0 opacity-10"
                            style={{
                                backgroundImage: `linear-gradient(45deg,#000 25%,transparent 25%,transparent 75%,#000 75%)`,
                                backgroundSize: "12px 12px",
                            }}
                        />
                        {/* Piece */}
                        <span
                            className="relative z-10 text-4xl leading-none select-none"
                            style={{
                                color: opt.pieceColor,
                                filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.4))",
                                animation: selected ? "cdPieceFloat 2s ease-in-out infinite" : undefined,
                            }}
                        >

                            <img src={opt.piece} alt="" className={
                                cn(
                                    "h-15 w-15",
                                    // opt.label === "Random" ? " opacity-25" : ""
                                )
                            } />
                        </span>
                        {/* Label */}
                        <span className={cn(
                            "relative z-10 text-[10px] font-bold uppercase tracking-wider mt-1.5 px-1.5 py-0.5 rounded-full",
                            selected ? "bg-primary text-primary-foreground" : "bg-black/30 text-white"
                        )}>
                            {opt.value === "random" ? <Shuffle className="w-3 h-3 inline" /> : opt.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}

// Section label
function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
            {children}
        </p>
    );
}

// ─── Main Dialog ──────────────────────────────────────────────────────────────


interface ChallengeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    friend: Friend | null;
    onSendChallenge: (challenge: Challenge) => void;
    isClose?: boolean;
}

export default function ChallengeDialog({
    open,
    onOpenChange,
    friend,
    onSendChallenge,
    isClose,
}: ChallengeDialogProps) {
    const [challenge, setChallenge] = useState<Challenge>({
        friend: friend,
        type: "casual",
        timeControl: "5m",
        chatEnabled: true,
        side: "random",
    });
    const [sending, setSending] = useState(false);

    // Keep friend in sync when prop changes
    useEffect(() => {
        setChallenge((c) => ({ ...c, friend }));
    }, [friend]);

    // Reset on close
    useEffect(() => {
        if (!open) {
            setSending(false);
        }
    }, [open]);

    const patch = <K extends keyof Challenge>(key: K, value: Challenge[K]) =>
        setChallenge((c) => ({ ...c, [key]: value }));

    const handleSend = async () => {
        if (!challenge.friend) return;
        if (!challenge.friend.isOnline) return toast.error("Can't Challenge, Friend is Offline");
        setSending(true);
        onSendChallenge(challenge);
        setSending(false);
        onOpenChange(false);

    };

    // Summary line shown at the bottom
    const summary = [
        challenge.timeControl,
        challenge.type === "ranked" ? "Ranked" : "Casual",
        challenge.side === "random" ? "Random side" : `Playing ${challenge.side}`,
        challenge.chatEnabled ? "Chat on" : "Chat off",
    ].join(" · ");

    console.log(open);

    if (!open) return null;

    return (
        <>
            <style>{KEYFRAMES}</style>

            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent
                    className={cn(
                        "bg-card border border-border text-card-foreground",
                        "rounded-2xl sm:rounded-2xl p-0 gap-0 overflow-hidden",
                        "w-full max-w-sm sm:max-w-md",
                        // Override shadcn default close button positioning if needed
                        "[&>button]:top-4 [&>button]:right-4",
                        "z-100"
                    )}
                    // Prevent closing when `isClose` is false (e.g. while sending)
                    onInteractOutside={(e) => {
                        if (isClose === false || sending) e.preventDefault();
                    }}
                    onEscapeKeyDown={(e) => {
                        if (isClose === false || sending) e.preventDefault();
                    }}
                >
                    {/* ── Decorative header band ── */}
                    <div className="relative h-2 w-full overflow-hidden">
                        <div
                            className="absolute inset-0"
                            style={{
                                background: "linear-gradient(90deg, var(--primary) 0%, color-mix(in oklch, var(--primary) 60%, transparent) 50%, var(--primary) 100%)",
                                backgroundSize: "200% auto",
                                animation: "cdShimmer 3s linear infinite",
                            }}
                        />
                    </div>

                    {/* ── Header ── */}
                    <DialogHeader className="px-5 pt-4 pb-2">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center flex-shrink-0">
                                <Sword className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                                <DialogTitle className="text-base font-bold text-foreground leading-tight">
                                    Challenge a Friend
                                </DialogTitle>
                                {friend && (
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Sending to{" "}
                                        <span className="text-foreground font-semibold">{friend.username}</span>
                                    </p>
                                )}
                            </div>
                        </div>
                    </DialogHeader>

                    {/* ── Body ── */}
                    <div
                        className="px-5 pb-5 flex flex-col gap-5 overflow-y-auto"
                        style={{ maxHeight: "calc(100dvh - 200px)", animation: "cdFadeIn 0.3s ease-out" }}
                    >
                        {/* Friend card */}
                        <AvatarBlock friend={friend} />

                        {/* Time control */}
                        <div>
                            <SectionLabel>Time Control</SectionLabel>
                            <SegmentedControl
                                options={["1m", "3m", "5m", "10m"] as const}
                                value={challenge.timeControl}
                                onChange={(v) => patch("timeControl", v)}
                                renderOption={(v, selected) => {
                                    const tc = TIME_CONTROLS.find((t) => t.value === v)!;
                                    return (
                                        <span className="flex flex-col items-center gap-0.5">
                                            <span className="text-base font-black leading-none">{tc.label}<span className="text-[10px] font-bold ml-px">m</span></span>
                                            <span className={cn("text-[10px] font-medium", selected ? "text-primary-foreground/80" : "text-muted-foreground")}>
                                                {tc.sub}
                                            </span>
                                        </span>
                                    );
                                }}
                            />
                        </div>

                        {/* Match type */}
                        <div>
                            <SectionLabel>Match Type</SectionLabel>
                            <SegmentedControl
                                options={["casual", "ranked"] as const}
                                value={challenge.type}
                                onChange={(v) => patch("type", v)}
                                renderOption={(v, selected) => (
                                    <span className="flex items-center justify-center gap-1.5">
                                        {v === "ranked"
                                            ? <Trophy className="w-3.5 h-3.5" />
                                            : <Shield className="w-3.5 h-3.5" />
                                        }
                                        <span className="capitalize">{v}</span>
                                    </span>
                                )}
                            />
                        </div>

                        {/* Side selection */}
                        <div>
                            <SectionLabel>Your Side</SectionLabel>
                            <SideSelector value={challenge.side} onChange={(v) => patch("side", v)} />
                        </div>

                        {/* Chat toggle */}
                        <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-muted/40 px-4 py-3">
                            <div className="flex items-center gap-2.5">
                                <div className={cn(
                                    "w-7 h-7 rounded-lg flex items-center justify-center transition-colors",
                                    challenge.chatEnabled ? "bg-primary/15 border border-primary/25" : "bg-muted border border-border"
                                )}>
                                    <MessageSquare className={cn("w-3.5 h-3.5 transition-colors", challenge.chatEnabled ? "text-primary" : "text-muted-foreground")} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-foreground leading-tight">Enable Chat</p>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">
                                        {challenge.chatEnabled ? "Both players can chat" : "Chat disabled for this game"}
                                    </p>
                                </div>
                            </div>
                            <Toggle
                                checked={challenge.chatEnabled}
                                onChange={(v) => patch("chatEnabled", v)}
                                id="chat-toggle"
                            />
                        </div>

                        {/* Summary */}
                        <p className="text-center text-[11px] text-muted-foreground px-2 leading-relaxed">
                            {summary}
                        </p>

                        {/* Send button */}
                        <button
                            onClick={handleSend}
                            disabled={!challenge.friend || sending}
                            className={cn(
                                "w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3",
                                "text-sm font-bold transition-all duration-200",
                                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                                "disabled:opacity-50 disabled:cursor-not-allowed",
                                "active:scale-[0.98]",
                                !sending && "hover:opacity-90",
                                "bg-primary text-primary-foreground",
                                "shadow-[0_4px_16px_color-mix(in_oklch,var(--primary)_30%,transparent)]"
                            )}
                        >
                            {sending ? (
                                <>
                                    <span
                                        className="w-4 h-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground"
                                        style={{ animation: "cdSpin 0.7s linear infinite" }}
                                    />
                                    Sending challenge…
                                </>
                            ) : (
                                <>
                                    <Gamepad2 className="w-5 h-5" />
                                    Challenge
                                </>
                            )}
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}