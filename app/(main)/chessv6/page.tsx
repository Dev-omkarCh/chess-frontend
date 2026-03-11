"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Chess, Square, PieceSymbol, Color } from "chess.js";
import { useAppSelector } from "@/lib/hooks";
import { RootState } from "@/lib/store";
import {
    FaFlag, FaHandshake, FaVolumeUp, FaVolumeMute,
    FaPaperPlane, FaSmile, FaChevronLeft, FaChevronRight,
} from "react-icons/fa";
import { MdFlipCameraAndroid } from "react-icons/md";
import { BsChatDots, BsArrowLeft } from "react-icons/bs";
import { GiChessKing, GiChessBishop } from "react-icons/gi";
import { HiLightningBolt } from "react-icons/hi";
import { IoSearchOutline, IoClose } from "react-icons/io5";
import { TbChessFilled } from "react-icons/tb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
    Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { BoardSettings, BoardTheme, getColor, getPiece, pieceStyleType } from "@/lib/pieces-registry";
import { Settings } from "lucide-react";
import BoardSettingsDialog from "@/components/lobby/SettingsDialog";
import { ThemeToggle } from "@/components/ThemeToggle";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
type AppScreen = "lobby" | "setup" | "game";
type GameStatus = "playing" | "check" | "checkmate" | "stalemate" | "draw" | "resigned";
type PromotionPiece = "q" | "r" | "b" | "n";

interface TimeControl { label: string; seconds: number; desc: string; icon: React.ReactNode }
interface MoveEntry {
    san: string; from: Square; to: Square; piece: string;
    captured?: string; color: "w" | "b"; moveNumber: number; fen: string;
}
interface CapturedPieces { w: PieceSymbol[]; b: PieceSymbol[] }
interface ChatMessage {
    id: string; sender: "me" | "opponent";
    type: "text" | "emoji" | "gif"; content: string; timestamp: Date;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = ["8", "7", "6", "5", "4", "3", "2", "1"];

const UNICODE: Record<string, string> = {
    wK: "♔", wQ: "♕", wR: "♖", wB: "♗", wN: "♘", wP: "♙",
    bK: "♚", bQ: "♛", bR: "♜", bB: "♝", bN: "♞", bP: "♟",
};
const PIECE_VAL: Record<PieceSymbol, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

const TIME_CONTROLS: TimeControl[] = [
    { label: "1 min", seconds: 60, desc: "Bullet", icon: <HiLightningBolt className="text-yellow-400 text-xl" /> },
    { label: "3 min", seconds: 180, desc: "Blitz", icon: <HiLightningBolt className="text-orange-400 text-xl" /> },
    { label: "5 min", seconds: 300, desc: "Rapid", icon: <GiChessBishop className="text-emerald-400 text-xl" /> },
    { label: "10 min", seconds: 600, desc: "Classical", icon: <GiChessKing className="text-blue-400 text-xl" /> },
];

const QUICK_EMOJIS = ["👍", "😂", "😮", "😢", "😡", "🎉", "🤝", "👏", "🔥", "❓", "⚡", "♟️", "🤔", "😤", "🙏", "💀"];

const MOCK_GIFS = [
    { id: "g1", url: "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif", title: "chess" },
    { id: "g2", url: "https://media.giphy.com/media/3oEjI789af0AVurF60/giphy.gif", title: "thinking" },
    { id: "g3", url: "https://media.giphy.com/media/l46Cy1rHbQ92uuLXa/giphy.gif", title: "gg" },
    { id: "g4", url: "https://media.giphy.com/media/fUqfaPVjiAQcfticZH/giphy.gif", title: "winning" },
    { id: "g5", url: "https://media.giphy.com/media/26BRBKqUiq586bRVm/giphy.gif", title: "nice" },
    { id: "g6", url: "https://media.giphy.com/media/3ornk57KwDXf81rjWM/giphy.gif", title: "wow" },
];

const BOT_REPLIES = [
    "Nice move! ♟", "Hmm, didn't see that 🤔", "You're good!", "GG!",
    "😮", "👏", "Let's play again!", "Interesting...", "Well played 🎉",
];

// ─────────────────────────────────────────────────────────────────────────────
// Clock
// ─────────────────────────────────────────────────────────────────────────────
function Clock({ seconds, active }: { seconds: number; active: boolean }) {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    const isLow = seconds < 30 && active;
    return (
        <div className={cn(
            "font-mono font-black tabular-nums tracking-widest select-none rounded-lg px-3 py-2 text-xl transition-all duration-300 min-w-[80px] text-center",
            active
                ? isLow
                    ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30"
                    : "bg-primary text-primary-foreground shadow-md"
                : "bg-muted text-muted-foreground"
        )}>
            {m}:{s}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Captured pieces display
// ─────────────────────────────────────────────────────────────────────────────
function Captured({ pieces, color }: { pieces: PieceSymbol[]; color: Color }) {
    const sorted = [...pieces].sort((a, b) => PIECE_VAL[b] - PIECE_VAL[a]);
    const adv = pieces.reduce((s, p) => s + PIECE_VAL[p], 0);
    if (pieces.length === 0) return <div className="h-5" />;
    return (
        <div className="flex items-center gap-px flex-wrap h-5">
            {sorted.map((p, i) => (
                <span key={i} className={cn(
                    "text-sm leading-none",
                    color === "w"
                        ? "text-white [text-shadow:0_1px_3px_rgba(0,0,0,1)]"
                        : "text-neutral-900 [text-shadow:0_1px_2px_rgba(255,255,255,0.4)]"
                )}
                >
                    <img src={getPiece(p, color, "space")} className="w-4 h-4" />
                </span>
            ))}
            {adv > 0 && <span className="text-xs text-muted-foreground font-bold ml-1">+{adv}</span>}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Player strip (shown above/below board)
// ─────────────────────────────────────────────────────────────────────────────
function PlayerStrip({
    name, subtitle, color, seconds, active, capturedPieces, isGameOver,
}: {
    name: string; subtitle: string; color: Color;
    seconds: number; active: boolean;
    capturedPieces: PieceSymbol[]; isGameOver: boolean;
}) {
    return (
        <div className={cn(
            "flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all duration-300 w-full",
            active && !isGameOver
                ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                : "border-border bg-card"
        )}>
            <div className="flex items-center gap-3 min-w-0">
                {/* Avatar */}
                <div className={cn(
                    "w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-xl font-black border-2 shadow-sm",
                    color === "w"
                        ? "bg-neutral-50 text-neutral-900 border-neutral-300"
                        : "bg-neutral-900 text-white border-neutral-700"
                )}>
                    {color === "w" ? "♔" : "♚"}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="font-bold text-base leading-tight truncate">{name}</p>
                    <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
                    <Captured pieces={capturedPieces} color={color === "w" ? "b" : "w"} />
                </div>
            </div>
            <Clock seconds={seconds} active={active && !isGameOver} />
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Chat panel
// ─────────────────────────────────────────────────────────────────────────────
function ChatPanel({
    messages, onSend, onClose,
}: {
    messages: ChatMessage[];
    onSend: (type: "text" | "emoji" | "gif", content: string) => void;
    onClose: () => void;
}) {
    const [input, setInput] = useState("");
    const [tab, setTab] = useState<"chat" | "emoji" | "gif">("chat");
    const [gifSearch, setGifSearch] = useState("");
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const send = () => {
        if (!input.trim()) return;
        onSend("text", input.trim());
        setInput("");
    };

    const filteredGifs = MOCK_GIFS.filter(g => !gifSearch || g.title.includes(gifSearch.toLowerCase()));

    return (
        <div className="flex flex-col h-full bg-card border-l border-border">
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border flex-shrink-0">
                <BsChatDots className="text-primary text-base" />
                <span className="font-bold text-sm flex-1">Chat</span>
                <div className="flex gap-1 bg-muted rounded-lg p-1">
                    {(["chat", "emoji", "gif"] as const).map(t => (
                        <button key={t} onClick={() => setTab(t)}
                            className={cn(
                                "text-xs px-2.5 py-1 rounded-md font-semibold transition-all",
                                tab === t ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                            )}>
                            {t === "chat" ? "Chat" : t === "emoji" ? "😊" : "GIF"}
                        </button>
                    ))}
                </div>
                <button onClick={onClose} className="ml-1 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-accent">
                    <IoClose className="text-base" />
                </button>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-8">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-2xl">♟️</div>
                        <p className="text-sm text-muted-foreground">No messages yet.<br />Say hello! 👋</p>
                    </div>
                ) : messages.map(msg => (
                    <div key={msg.id} className={cn("flex gap-2 items-end", msg.sender === "me" ? "flex-row-reverse" : "flex-row")}>
                        <div className={cn(
                            "w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-black border-2",
                            msg.sender === "me"
                                ? "bg-neutral-50 text-neutral-900 border-neutral-200"
                                : "bg-neutral-900 text-white border-neutral-700"
                        )}>
                            {msg.sender === "me" ? "♔" : "♚"}
                        </div>
                        <div className={cn(
                            "max-w-[75%] rounded-2xl px-3 py-2",
                            msg.sender === "me"
                                ? "bg-primary text-primary-foreground rounded-br-sm"
                                : "bg-muted text-foreground rounded-bl-sm"
                        )}>
                            {msg.type === "gif"
                                ? <img src={msg.content} alt="gif" className="rounded-xl max-w-full max-h-28 object-cover" />
                                : <span className={cn("text-sm leading-relaxed", msg.type === "emoji" && "text-2xl")}>{msg.content}</span>
                            }
                            <p className={cn("text-[10px] mt-1 opacity-60", msg.sender === "me" ? "text-right" : "")}>
                                {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                        </div>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            {/* Emoji picker */}
            {tab === "emoji" && (
                <div className="border-t border-border p-3 bg-muted/30 flex-shrink-0">
                    <div className="grid grid-cols-8 gap-1.5">
                        {QUICK_EMOJIS.map(e => (
                            <button key={e} onClick={() => { onSend("emoji", e); setTab("chat"); }}
                                className="text-xl hover:scale-125 transition-transform p-1 rounded-lg hover:bg-accent">
                                {e}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* GIF picker */}
            {tab === "gif" && (
                <div className="border-t border-border flex-shrink-0 bg-muted/30">
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
                        <IoSearchOutline className="text-muted-foreground flex-shrink-0" />
                        <input value={gifSearch} onChange={e => setGifSearch(e.target.value)}
                            placeholder="Search GIFs…"
                            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 p-2 max-h-36 overflow-y-auto">
                        {filteredGifs.map(g => (
                            <button key={g.id} onClick={() => { onSend("gif", g.url); setTab("chat"); }}
                                className="rounded-xl overflow-hidden border border-border hover:border-primary hover:scale-105 transition-all">
                                <img src={g.url} alt={g.title} className="w-full h-16 object-cover" />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Text input */}
            {tab === "chat" && (
                <div className="border-t border-border flex items-center gap-2 px-3 py-2.5 flex-shrink-0 bg-card">
                    <button onClick={() => setTab("emoji")}
                        className="text-muted-foreground hover:text-primary transition-colors flex-shrink-0">
                        <FaSmile className="text-lg" />
                    </button>
                    <button onClick={() => setTab("gif")}
                        className="text-muted-foreground hover:text-primary transition-colors text-xs font-black flex-shrink-0">
                        GIF
                    </button>
                    <input value={input} onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && send()}
                        placeholder="Message…"
                        className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground min-w-0" />
                    <button onClick={send} disabled={!input.trim()}
                        className="text-primary hover:scale-110 transition-transform disabled:opacity-30 disabled:scale-100 flex-shrink-0">
                        <FaPaperPlane className="text-sm" />
                    </button>
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Setup Screen
// ─────────────────────────────────────────────────────────────────────────────
function SetupScreen({ onStart, onBack }: {
    onStart: (timeSeconds: number, chatEnabled: boolean) => void;
    onBack: () => void;
}) {
    const [selectedTime, setSelectedTime] = useState(3);
    const [chatEnabled, setChatEnabled] = useState(true);

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-lg">
                <button onClick={onBack}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-10 transition-colors group font-medium">
                    <BsArrowLeft className="group-hover:-translate-x-0.5 transition-transform" />
                    Back to Lobby
                </button>

                <div className="flex items-center gap-4 mb-10">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <GiChessKing className="text-4xl text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight leading-none">New Game</h1>
                        <p className="text-muted-foreground mt-1">Configure your match settings</p>
                    </div>
                </div>

                {/* Time controls */}
                <div className="mb-8">
                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Time Control</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {TIME_CONTROLS.map((tc, i) => (
                            <button key={i} onClick={() => setSelectedTime(i)}
                                className={cn(
                                    "flex flex-col items-center gap-3 py-5 px-3 rounded-2xl border-2 transition-all font-semibold",
                                    selectedTime === i
                                        ? "border-primary bg-primary/8 shadow-xl shadow-primary/15 scale-[1.03]"
                                        : "border-border bg-card hover:border-primary/40 hover:bg-accent hover:scale-[1.01]"
                                )}>
                                <span className="text-3xl">{tc.icon}</span>
                                <div className="text-center">
                                    <p className={cn("font-black text-base leading-none", selectedTime === i ? "text-foreground" : "text-muted-foreground")}>{tc.label}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{tc.desc}</p>
                                </div>
                                {selectedTime === i && (
                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Chat toggle */}
                <div className="mb-8 bg-card border border-border rounded-2xl px-5 py-4 flex items-center justify-between">
                    <div>
                        <p className="font-bold text-base">In-game Chat</p>
                        <p className="text-sm text-muted-foreground mt-0.5">Send messages, emojis &amp; GIFs during the game</p>
                    </div>
                    <Switch checked={chatEnabled} onCheckedChange={setChatEnabled}
                        className="data-[state=checked]:bg-primary ml-4" />
                </div>

                {/* Summary */}
                <div className="mb-6 rounded-2xl bg-muted/50 border border-border px-5 py-4 flex items-center gap-4">
                    <span className="text-2xl">{TIME_CONTROLS[selectedTime].icon}</span>
                    <div className="text-sm text-muted-foreground">
                        <span className="font-bold text-foreground text-base">{TIME_CONTROLS[selectedTime].label} {TIME_CONTROLS[selectedTime].desc}</span>
                        <span className="mx-2">·</span>
                        Chat {chatEnabled ? <span className="text-primary font-semibold">enabled</span> : <span className="font-semibold">disabled</span>}
                    </div>
                </div>

                <button
                    onClick={() => onStart(TIME_CONTROLS[selectedTime].seconds, chatEnabled)}
                    className="w-full py-4 rounded-2xl text-lg font-black tracking-wide bg-primary text-primary-foreground hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl shadow-primary/25">
                    Start Game →
                </button>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Lobby Screen
// ─────────────────────────────────────────────────────────────────────────────
function LobbyScreen({ onNewGame, username }: { onNewGame: () => void; username: string }) {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
            <div className="text-center w-full max-w-sm">
                {/* Decorative mini board */}
                <div className="relative inline-block mb-10 mx-auto">
                    <div className="grid grid-cols-4 w-32 h-32 rounded-3xl overflow-hidden shadow-2xl border-4 border-border mx-auto">
                        {Array.from({ length: 16 }).map((_, i) => (
                            <div key={i} className={cn(
                                "w-full h-full",
                                (Math.floor(i / 4) + (i % 4)) % 2 === 0
                                    ? "bg-[oklch(0.91_0.03_95)]"
                                    : "bg-[oklch(0.48_0.10_155)]"
                            )} />
                        ))}
                    </div>
                    <GiChessKing className="absolute inset-0 m-auto text-6xl text-white [filter:drop-shadow(0_4px_12px_rgba(0,0,0,0.6))]" />
                </div>

                <h1 className="text-5xl font-black tracking-tight mb-2">Chess</h1>
                <p className="text-muted-foreground text-base mb-1">
                    Welcome back, <span className="text-foreground font-bold">{username}</span>
                </p>
                <p className="text-sm text-muted-foreground/60 mb-12">Play · Think · Win</p>

                <button
                    onClick={onNewGame}
                    className="w-full py-4 rounded-2xl text-lg font-black bg-primary text-primary-foreground hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl shadow-primary/25 mb-4">
                    ♟ New Game
                </button>
                <p className="text-sm text-muted-foreground/50">More modes coming soon</p>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Move navigation bar
// ─────────────────────────────────────────────────────────────────────────────
function MoveNav({
    onFirst, onBack, onForward, onLast, onReturnLive,
    canBack, canForward, isViewing,
}: {
    onFirst: () => void; onBack: () => void; onForward: () => void;
    onLast: () => void; onReturnLive: () => void;
    canBack: boolean; canForward: boolean; isViewing: boolean;
}) {
    return (
        <div className="flex items-center gap-1">
            <button onClick={onFirst} disabled={!canBack}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                ⏮
            </button>
            <button onClick={onBack} disabled={!canBack}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                <FaChevronLeft className="text-xs" />
            </button>
            <button onClick={onForward} disabled={!canForward}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                <FaChevronRight className="text-xs" />
            </button>
            <button onClick={onLast} disabled={!canForward}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                ⏭
            </button>
            {isViewing && (
                <button onClick={onReturnLive}
                    className="ml-1 px-2.5 h-8 rounded-lg text-xs font-bold bg-blue-500/10 text-blue-500 border border-blue-500/25 hover:bg-blue-500/20 transition-all">
                    Live ↩
                </button>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function ChessPage() {
    const user = useAppSelector((state: RootState) => state.auth.user);
    const username = user?.username ?? "You";

    // Navigation
    const [screen, setScreen] = useState<AppScreen>("lobby");

    // Game
    const [game, setGame] = useState(() => new Chess());
    const [gameStatus, setGameStatus] = useState<GameStatus>("playing");
    const [boardFlipped, setBoardFlipped] = useState(false);
    const [selected, setSelected] = useState<Square | null>(null);
    const [legalSquares, setLegalSquares] = useState<Square[]>([]);
    const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
    const [moves, setMoves] = useState<MoveEntry[]>([]);
    const [viewIndex, setViewIndex] = useState(-1); // -1 = live
    const [captured, setCaptured] = useState<CapturedPieces>({ w: [], b: [] });
    const [promotion, setPromotion] = useState<{ from: Square; to: Square } | null>(null);
    const [gameResult, setGameResult] = useState("");
    const [animSq, setAnimSq] = useState<Square | null>(null);

    // Arrows (right-click drag, chess.com style)
    const [arrows, setArrows] = useState<{ from: Square; to: Square }[]>([]);
    const arrowDragRef = useRef<{ from: Square } | null>(null);
    const boardRef = useRef<HTMLDivElement>(null);

    // Timers
    const [initTime, setInitTime] = useState(600);
    const [wTime, setWTime] = useState(600);
    const [bTime, setBTime] = useState(600);
    const [activeTimer, setActiveTimer] = useState<"w" | "b" | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Chat
    const [chatEnabled, setChatEnabled] = useState(true);
    const [chatOpen, setChatOpen] = useState(false);
    const [chatMsgs, setChatMsgs] = useState<ChatMessage[]>([]);
    const [unread, setUnread] = useState(0);

    // UI
    const [sound, setSound] = useState(true);
    const [showResign, setShowResign] = useState(false);
    const [showDraw, setShowDraw] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const moveListRef = useRef<HTMLDivElement>(null);

    // Derived
    const isOver = ["checkmate", "stalemate", "draw", "resigned"].includes(gameStatus);
    const isViewing = viewIndex >= 0;
    const displayGame = isViewing
        ? (() => { const g = new Chess(moves[viewIndex].fen); return g; })()
        : game;

    const paired: [MoveEntry, MoveEntry | null][] = [];
    for (let i = 0; i < moves.length; i += 2) paired.push([moves[i], moves[i + 1] ?? null]);

    // Settings
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const [boardTheme, setBoardTheme] = useState<BoardTheme>("green");
    const [pieceStyle, setPieceStyle] = useState<pieceStyleType>("standard");

    // Scroll move list
    useEffect(() => {
        if (moveListRef.current && !isViewing)
            moveListRef.current.scrollTop = moveListRef.current.scrollHeight;
    }, [moves, isViewing]);

    // Timer
    useEffect(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (!activeTimer || isOver) return;
        timerRef.current = setInterval(() => {
            if (activeTimer === "w") {
                setWTime(t => { if (t <= 1) { clearInterval(timerRef.current!); endGame("Black wins on time! ⏱"); return 0; } return t - 1; });
            } else {
                setBTime(t => { if (t <= 1) { clearInterval(timerRef.current!); endGame("White wins on time! ⏱"); return 0; } return t - 1; });
            }
        }, 1000);
        return () => clearInterval(timerRef.current!);
    }, [activeTimer, isOver]);

    const endGame = useCallback((result: string) => {
        setActiveTimer(null);
        setGameResult(result);
        setGameStatus("checkmate");
        setShowResult(true);
    }, []);

    const beep = useCallback((type: "move" | "capture" | "check" | "illegal") => {
        if (!sound) return;
        try {
            const ac = new (window.AudioContext || (window as any).webkitAudioContext)();
            const move = new Audio("/assets/sounds/move-self.mp3");
            const o = ac.createOscillator(); const g = ac.createGain();
            o.connect(g); g.connect(ac.destination);
            o.frequency.value = { move: 480, capture: 320, check: 800, illegal: 190 }[type];
            g.gain.setValueAtTime(0.07, ac.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.2);
            o.start(); o.stop(ac.currentTime + 0.2);
            move.play();
        } catch { }
    }, [sound]);

    const startGame = useCallback((timeSeconds: number, chat: boolean) => {
        setGame(new Chess()); setGameStatus("playing");
        setSelected(null); setLegalSquares([]); setLastMove(null);
        setMoves([]); setViewIndex(-1);
        setCaptured({ w: [], b: [] });
        setInitTime(timeSeconds); setWTime(timeSeconds); setBTime(timeSeconds);
        setActiveTimer("w");
        setChatEnabled(chat); setChatOpen(false); setUnread(0); setChatMsgs([]);
        setShowResult(false); setGameResult("");
        setScreen("game");
    }, []);

    // History navigation
    const goFirst = useCallback(() => { if (moves.length) { setViewIndex(0); setSelected(null); setLegalSquares([]); } }, [moves]);
    const goBack = useCallback(() => {
        setViewIndex(v => { const n = v === -1 ? moves.length - 1 : Math.max(0, v - 1); setSelected(null); setLegalSquares([]); return n; });
    }, [moves]);
    const goFwd = useCallback(() => {
        setViewIndex(v => { if (v === -1) return -1; const n = v + 1 >= moves.length ? -1 : v + 1; setSelected(null); setLegalSquares([]); return n; });
    }, [moves]);
    const goLast = useCallback(() => { setViewIndex(-1); setSelected(null); setLegalSquares([]); }, []);
    const returnLive = useCallback(() => { setViewIndex(-1); setSelected(null); setLegalSquares([]); }, []);
    const jumpTo = useCallback((idx: number) => {
        setViewIndex(idx >= moves.length - 1 ? -1 : idx);
        setSelected(null); setLegalSquares([]);
    }, [moves]);

    const canBack = moves.length > 0 && viewIndex !== 0;
    const canFwd = isViewing;

    // Square click
    const handleClick = useCallback((sq: Square) => {
        setArrows([]); // left-click clears annotations
        if (isViewing) { returnLive(); return; }
        if (isOver) return;
        const piece = game.get(sq);
        if (selected) {
            if (selected === sq) { setSelected(null); setLegalSquares([]); return; }
            if (legalSquares.includes(sq)) {
                const moving = game.get(selected);
                if (moving?.type === "p") {
                    const r = sq[1];
                    if ((moving.color === "w" && r === "8") || (moving.color === "b" && r === "1")) {
                        setPromotion({ from: selected, to: sq }); setSelected(null); setLegalSquares([]); return;
                    }
                }
                execMove(selected, sq); return;
            }
            if (piece && piece.color === game.turn()) { pickSq(sq); return; }
            setSelected(null); setLegalSquares([]); return;
        }
        if (piece && piece.color === game.turn()) pickSq(sq);
    }, [game, selected, legalSquares, isOver, isViewing]);

    const pickSq = useCallback((sq: Square) => {
        setSelected(sq);
        setLegalSquares(game.moves({ square: sq, verbose: true }).map(m => m.to as Square));
    }, [game]);

    const execMove = useCallback((from: Square, to: Square, promo: PromotionPiece = "q") => {
        const gc = new Chess(game.fen());
        try {
            const r = gc.move({ from, to, promotion: promo });
            if (!r) { beep("illegal"); return; }
            setGame(gc); setLastMove({ from, to });
            setSelected(null); setLegalSquares([]);
            setAnimSq(to); setTimeout(() => setAnimSq(null), 350);
            setArrows([]);
            if (r.captured) {
                setCaptured(prev => ({ ...prev, [r.color]: [...prev[r.color as "w" | "b"], r.captured as PieceSymbol] }));
                beep("capture");
            } else beep("move");
            const entry: MoveEntry = {
                san: r.san, from, to, piece: r.piece, captured: r.captured,
                color: r.color, moveNumber: Math.ceil(gc.history().length / 2), fen: gc.fen(),
            };
            setMoves(p => [...p, entry]); setViewIndex(-1); setActiveTimer(gc.turn());
            if (gc.isCheckmate()) { beep("check"); setTimeout(() => endGame(`${gc.turn() === "w" ? "Black" : "White"} wins by checkmate! 🏆`), 80); }
            else if (gc.isStalemate()) setTimeout(() => endGame("Draw by stalemate"), 80);
            else if (gc.isDraw()) setTimeout(() => endGame("Draw"), 80);
            else if (gc.isCheck()) { beep("check"); setGameStatus("check"); }
            else setGameStatus("playing");
        } catch { beep("illegal"); }
    }, [game, beep, endGame]);

    const handlePromo = useCallback((p: PromotionPiece) => {
        if (!promotion) return;
        execMove(promotion.from, promotion.to, p);
        setPromotion(null);
    }, [promotion, execMove]);

    const handleResign = useCallback(() => {
        endGame(`${game.turn() === "w" ? "Black" : "White"} wins — you resigned.`);
        setGameStatus("resigned"); setShowResign(false);
    }, [game, endGame]);

    const sendChat = useCallback((type: "text" | "emoji" | "gif", content: string) => {
        const msg: ChatMessage = { id: Date.now().toString(), sender: "me", type, content, timestamp: new Date() };
        setChatMsgs(p => [...p, msg]);
        setTimeout(() => {
            const reply: ChatMessage = {
                id: (Date.now() + 1).toString(), sender: "opponent", type: "text",
                content: BOT_REPLIES[Math.floor(Math.random() * BOT_REPLIES.length)],
                timestamp: new Date(),
            };
            setChatMsgs(p => [...p, reply]);
            if (!chatOpen) setUnread(c => c + 1);
        }, 1500 + Math.random() * 2000);
    }, [chatOpen]);

    const handleSetBoardTheme = (theme: BoardTheme) => {
        setBoardTheme(theme);
    };

    const handleSetPieceStyle = (style: pieceStyleType) => {
        setPieceStyle(style);
    };

    // ── Arrow helpers ────────────────────────────────────────────────────────
    /** Convert a client-space point to a board square, accounting for flip */
    const pointToSquare = useCallback((clientX: number, clientY: number): Square | null => {
        const el = boardRef.current;
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        const xFrac = (clientX - rect.left) / rect.width;
        const yFrac = (clientY - rect.top) / rect.height;
        if (xFrac < 0 || xFrac > 1 || yFrac < 0 || yFrac > 1) return null;
        const fileIdx = boardFlipped ? 7 - Math.floor(xFrac * 8) : Math.floor(xFrac * 8);
        const rankIdx = boardFlipped ? Math.floor(yFrac * 8) : 7 - Math.floor(yFrac * 8);
        return `${FILES[fileIdx]}${rankIdx + 1}` as Square;
    }, [boardFlipped]);

    const handleBoardMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (e.button !== 2) return; // only right-click
        e.preventDefault();
        const sq = pointToSquare(e.clientX, e.clientY);
        if (sq) arrowDragRef.current = { from: sq };
    }, [pointToSquare]);

    const handleBoardMouseUp = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (e.button !== 2) return;
        e.preventDefault();
        if (!arrowDragRef.current) return;
        const from = arrowDragRef.current.from;
        arrowDragRef.current = null;
        const to = pointToSquare(e.clientX, e.clientY);
        if (!to) return;
        if (from === to) {
            // single-square right-click: clear all arrows
            setArrows([]);
            return;
        }
        setArrows(prev => {
            // toggle: if identical arrow exists remove it, otherwise add
            const exists = prev.findIndex(a => a.from === from && a.to === to);
            if (exists !== -1) return prev.filter((_, i) => i !== exists);
            return [...prev, { from, to }];
        });
    }, [pointToSquare]);

    /** Get SVG coords for the center of a square (0-800 viewBox) */
    const sqToXY = useCallback((sq: Square): [number, number] => {
        const file = sq[0]; const rank = parseInt(sq[1]);
        const fileIdx = FILES.indexOf(file);
        const rankIdx = rank - 1; // 0=rank1 .. 7=rank8
        const col = boardFlipped ? 7 - fileIdx : fileIdx;
        const row = boardFlipped ? rankIdx : 7 - rankIdx;
        return [col * 100 + 50, row * 100 + 50];
    }, [boardFlipped]);

    const renderArrows = () => {
        if (arrows.length === 0) return null;

        // ── Constants (viewBox 800×800, each square = 100 units) ──────────────
        const SW = 13;           // shaft half-width
        const HW = 30;           // arrowhead base half-width
        const HL = 38;           // arrowhead length (base → tip)
        const ORIGIN_PULL = 26;  // how far shaft starts from origin centre
        const FILL = "rgba(255,185,0,0.70)";
        const SHADOW = "drop-shadow(0 1px 5px rgba(0,0,0,0.60))";

        /** Flat-based triangle arrowhead. Tip at (tx,ty), pointing along (ux,uy). */
        const headPoly = (tx: number, ty: number, ux: number, uy: number): string => {
            const px = -uy, py = ux;                       // perpendicular unit
            const bx = tx - ux * HL, by = ty - uy * HL;  // base centre
            return [
                `${tx},${ty}`,                              // tip (sharp point)
                `${bx + px * HW},${by + py * HW}`,         // base left
                `${bx - px * HW},${by - py * HW}`,         // base right
            ].join(" ");
        };

        /** Rectangular shaft from (sx,sy) to (ex,ey). Direction given by (ux,uy). */
        const shaftPoly = (sx: number, sy: number, ex: number, ey: number, ux: number, uy: number): string => {
            const px = -uy, py = ux;
            return [
                `${sx + px * SW},${sy + py * SW}`,
                `${sx - px * SW},${sy - py * SW}`,
                `${ex - px * SW},${ey - py * SW}`,
                `${ex + px * SW},${ey + py * SW}`,
            ].join(" ");
        };

        /** True if the from→to delta matches a knight move pattern. */
        const isKnightMove = (from: Square, to: Square): boolean => {
            const df = Math.abs(FILES.indexOf(to[0]) - FILES.indexOf(from[0]));
            const dr = Math.abs(parseInt(to[1]) - parseInt(from[1]));
            return (df === 1 && dr === 2) || (df === 2 && dr === 1);
        };

        return (
            <svg
                viewBox="0 0 800 800"
                className="absolute inset-0 w-full h-full pointer-events-none z-40"
                style={{ borderRadius: "inherit" }}
            >
                {arrows.map((arrow, i) => {
                    const [x1, y1] = sqToXY(arrow.from);
                    const [x2, y2] = sqToXY(arrow.to);

                    // ── Knight L-arrow ────────────────────────────────────────
                    if (isKnightMove(arrow.from, arrow.to)) {
                        const absDf = Math.abs(FILES.indexOf(arrow.to[0]) - FILES.indexOf(arrow.from[0]));

                        // Elbow is at the "corner" of the L.
                        // When the move spans 2 files: go horizontal first → elbow shares x2,y1
                        // When the move spans 2 ranks: go vertical first   → elbow shares x1,y2
                        const elbowX = absDf === 2 ? x2 : x1;
                        const elbowY = absDf === 2 ? y1 : y2;

                        // Segment 1 direction (origin → elbow)
                        const d1x = elbowX - x1, d1y = elbowY - y1;
                        const len1 = Math.sqrt(d1x * d1x + d1y * d1y);
                        const u1x = d1x / len1, u1y = d1y / len1;

                        // Segment 2 direction (elbow → destination)
                        const d2x = x2 - elbowX, d2y = y2 - elbowY;
                        const len2 = Math.sqrt(d2x * d2x + d2y * d2y);
                        const u2x = d2x / len2, u2y = d2y / len2;

                        // Shaft 1: starts away from origin, ends at elbow
                        const s1x = x1 + u1x * ORIGIN_PULL, s1y = y1 + u1y * ORIGIN_PULL;
                        const e1x = elbowX, e1y = elbowY;

                        // Shaft 2: starts at elbow, ends where the arrowhead begins
                        const s2x = elbowX, s2y = elbowY;
                        const e2x = x2 - u2x * HL, e2y = y2 - u2y * HL;

                        return (
                            <g key={i} style={{ filter: SHADOW }}>
                                {/* Shaft segment 1 */}
                                <polygon points={shaftPoly(s1x, s1y, e1x, e1y, u1x, u1y)} fill={FILL} />
                                {/* Filled square at the elbow corner to close the gap */}
                                <rect
                                    x={elbowX - SW} y={elbowY - SW}
                                    width={SW * 2} height={SW * 2}
                                    fill={FILL}
                                />
                                {/* Shaft segment 2 */}
                                <polygon points={shaftPoly(s2x, s2y, e2x, e2y, u2x, u2y)} fill={FILL} />
                                {/* Arrowhead — flat-base triangle, no notch */}
                                <polygon points={headPoly(x2, y2, u2x, u2y)} fill={FILL} />
                            </g>
                        );
                    }

                    // ── Straight arrow ────────────────────────────────────────
                    const dx = x2 - x1, dy = y2 - y1;
                    const len = Math.sqrt(dx * dx + dy * dy);
                    if (len < 1) return null;
                    const ux = dx / len, uy = dy / len;

                    const sx = x1 + ux * ORIGIN_PULL, sy = y1 + uy * ORIGIN_PULL;
                    const ex = x2 - ux * HL, ey = y2 - uy * HL; // shaft ends where head begins

                    return (
                        <g key={i} style={{ filter: SHADOW }}>
                            {/* Rectangular shaft */}
                            <polygon points={shaftPoly(sx, sy, ex, ey, ux, uy)} fill={FILL} />
                            {/* Flat-base triangle head */}
                            <polygon points={headPoly(x2, y2, ux, uy)} fill={FILL} />
                        </g>
                    );
                })}
            </svg>
        );
    };

    // Board render
    const renderBoard = () => {
        const ranks = boardFlipped ? [...RANKS].reverse() : RANKS;
        const files = boardFlipped ? [...FILES].reverse() : FILES;
        return ranks.map(rank => files.map(file => {
            const sq = `${file}${rank}` as Square;
            const piece = displayGame.get(sq);
            const fi = FILES.indexOf(file), ri = RANKS.indexOf(rank);
            const isLight = (fi + ri) % 2 === 0;
            const isSel = !isViewing && selected === sq;
            const isLegal = !isViewing && legalSquares.includes(sq);
            const hlMove = isViewing && viewIndex > 0
                ? { from: moves[viewIndex].from, to: moves[viewIndex].to } : lastMove;
            const isLF = hlMove?.from === sq, isLT = hlMove?.to === sq;
            const inCheck = displayGame.isCheck() && piece?.type === "k" && piece.color === displayGame.turn();
            const isAnim = !isViewing && animSq === sq;

            return (
                <div key={sq}
                    onClick={() => handleClick(sq)}
                    style={{
                        aspectRatio: "1/1",
                        backgroundColor: isLight ?
                            getColor(boardTheme).dark :
                            getColor(boardTheme).light
                    }}
                    className={cn(
                        "relative flex items-center justify-center select-none overflow-hidden",
                        !isViewing && !isOver ? "cursor-pointer" : "cursor-default",
                    )}
                >
                    {/* Rank label */}
                    {file === (boardFlipped ? "h" : "a") && (
                        <span className={cn(
                            "absolute top-0.5 left-1 text-[10px] sm:text-xs font-bold z-10 pointer-events-none leading-none select-none",
                        )}
                            style={{
                                color: isLight ?
                                    getColor(boardTheme).light :
                                    getColor(boardTheme).dark
                            }}
                        >{rank}</span>
                    )}
                    {/* File label */}
                    {rank === (boardFlipped ? "8" : "1") && (
                        <span className={cn(
                            "absolute bottom-0.5 right-1 text-[10px] sm:text-xs font-bold z-10 pointer-events-none leading-none select-none",
                            isLight ? "text-[oklch(0.46_0.105_155)]" : "text-[oklch(0.91_0.03_95)]"
                        )}
                            style={{
                                color: isLight ?
                                    getColor(boardTheme).light :
                                    getColor(boardTheme).dark
                            }}
                        >{file}</span>
                    )}
                    {/* Last move */}
                    {(isLF || isLT) && <div className="absolute inset-0 bg-yellow-400/35 pointer-events-none z-[1]" />}
                    {/* Selected */}
                    {isSel && <div className="absolute inset-0 bg-yellow-300/55 ring-[3px] ring-inset ring-yellow-400 pointer-events-none z-[2]" />}
                    {/* Check */}
                    {inCheck && <div className="absolute inset-0 bg-red-500/60 ring-[3px] ring-inset ring-red-500 pointer-events-none z-[2]" />}
                    {/* Legal move dot / ring */}
                    {isLegal && (
                        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                            {piece
                                ? <div className="absolute inset-0 ring-[4px] ring-inset ring-black/20 pointer-events-none" />
                                : <div className="w-[32%] h-[32%] rounded-full bg-black/18" />
                            }
                        </div>
                    )}
                    {/* Piece */}
                    {piece && (
                        <span className={cn(
                            "relative z-20 w-full h-full flex items-center justify-center leading-none font-normal",
                            "text-[2.2rem] sm:text-[2.8rem] md:text-[3.2rem] lg:text-[3.5rem]",
                            "transition-transform duration-150",
                            isAnim && "scale-110",
                            isSel && "scale-110",
                            piece.color === "w"
                                ? "text-white [text-shadow:0_2px_6px_rgba(0,0,0,0.9),0_0_12px_rgba(0,0,0,0.3)]"
                                : "text-[#0a0a0a] [text-shadow:0_1px_4px_rgba(255,255,255,0.35)]",
                            !isViewing && !isOver && "hover:scale-105",
                        )}>
                            <img src={getPiece(piece.type, piece.color, pieceStyle)} />
                        </span>
                    )}
                </div>
            );
        }));
    };

    // ── Screen router ────────────────────────────────────────────────────────
    if (screen === "lobby") return <LobbyScreen onNewGame={() => setScreen("setup")} username={username} />;
    if (screen === "setup") return <SetupScreen onStart={startGame} onBack={() => setScreen("lobby")} />;

    // ── Game screen ──────────────────────────────────────────────────────────
    return (
        <TooltipProvider>
            {/* Full-height layout: header + body */}
            <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">

                {/* ═══ HEADER ═══ */}
                <header className="flex-shrink-0 h-14 border-b border-border bg-card flex items-center px-4 gap-3 z-50">
                    <button onClick={() => setScreen("lobby")}
                        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group font-medium">
                        <BsArrowLeft className="group-hover:-translate-x-0.5 transition-transform" />
                        <span className="hidden sm:inline">Lobby</span>
                    </button>
                    <div className="w-px h-5 bg-border" />
                    {/* <TbChessFilled className="text-xl text-primary" /> */}
                    <span className="font-black text-base tracking-tight">Chess</span>

                    {/* Status badge */}
                    <Badge variant="outline" className={cn(
                        "text-xs font-semibold h-6 px-2.5",
                        gameStatus === "check" && "border-orange-500/60 text-orange-500 bg-orange-500/8",
                        (gameStatus === "checkmate" || gameStatus === "resigned") && "border-red-500/50 text-red-500 bg-red-500/8",
                        gameStatus === "playing" && "border-primary/40 text-primary bg-primary/8",
                        (gameStatus === "stalemate" || gameStatus === "draw") && "border-border text-muted-foreground",
                        isViewing && "border-blue-500/50 text-blue-500 bg-blue-500/8",
                    )}>
                        {isViewing ? `← Move ${viewIndex + 1}/${moves.length}`
                            : gameStatus === "check" ? "⚠ Check!"
                                : gameStatus === "checkmate" ? "Checkmate"
                                    : gameStatus === "stalemate" ? "Stalemate"
                                        : gameStatus === "draw" ? "Draw"
                                            : gameStatus === "resigned" ? "Resigned"
                                                : game.turn() === "w" ? "White" : "Black"}
                    </Badge>

                    <div className="ml-auto flex items-center gap-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button onClick={() => setSound(v => !v)}
                                    className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-all">
                                    {sound ? <FaVolumeUp /> : <FaVolumeMute />}
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>{sound ? "Mute" : "Unmute"}</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button onClick={() => setBoardFlipped(v => !v)}
                                    className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-all text-lg">
                                    <MdFlipCameraAndroid />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>Flip board</TooltipContent>
                        </Tooltip>
                        {chatEnabled && (
                            <button
                                onClick={() => { setChatOpen(v => !v); setUnread(0); }}
                                className={cn(
                                    "relative flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-semibold transition-all",
                                    chatOpen
                                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                        : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                                )}>
                                <BsChatDots className="text-sm" />
                                <span>Chat</span>
                                {unread > 0 && !chatOpen && (
                                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center leading-none">
                                        {unread}
                                    </span>
                                )}
                            </button>
                        )}
                    </div>
                    <ThemeToggle />
                    <button className="rounded-full hover:bg-muted transition-colors z-20" onClick={() => setIsSettingsOpen(true)}>
                        <Settings className="h-5 w-5 text-muted-foreground" />
                    </button>
                </header>

                {/* ═══ BODY ═══ */}
                <div className="flex-1 flex overflow-hidden min-h-0">

                    {/* ── LEFT PANEL: board + players ── */}
                    <main className={cn(
                        "flex flex-col items-center justify-start flex-1 min-w-0 overflow-hidden transition-all duration-300",
                        "p-4 sm:p-6 overflow-y-auto",
                        chatOpen ? "lg:px-8" : "lg:px-12 xl:px-16"
                    )}>

                        {/* Board + side info wrapper — chess.com style: players above/below board */}
                        <div className="flex flex-col items-start gap-3 w-full"
                            style={{ maxWidth: "min(100%, min(calc(100vh - 180px), 700px))" }}>

                            {/* BLACK player strip */}
                            <PlayerStrip
                                name="Black" subtitle="Computer" color="b"
                                seconds={bTime} active={activeTimer === "b" && !isOver}
                                capturedPieces={captured.w} isGameOver={isOver}
                            />

                            {/* Board */}
                            <div className="relative w-full">
                                <div
                                    ref={boardRef}
                                    onMouseDown={handleBoardMouseDown}
                                    onMouseUp={handleBoardMouseUp}
                                    onContextMenu={e => e.preventDefault()}
                                    className={cn(
                                        "relative w-full grid grid-cols-8 rounded-2xl overflow-hidden border-4 shadow-2xl transition-all",
                                        isViewing ? "border-blue-500/60 shadow-blue-500/10"
                                            : gameStatus === "check" ? "border-orange-500/50 shadow-orange-500/10"
                                                : "border-border shadow-black/20"
                                    )} style={{ aspectRatio: "1/1" }}>
                                    {renderBoard()}
                                    {renderArrows()}
                                </div>

                                {/* Promotion overlay */}
                                {promotion && (
                                    <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center rounded-2xl z-30">
                                        <div className="bg-card border-2 border-border rounded-2xl p-6 shadow-2xl">
                                            <p className="text-center text-xs font-black uppercase tracking-[0.15em] text-muted-foreground mb-5">
                                                Promote Pawn
                                            </p>
                                            <div className="flex gap-3">
                                                {(["q", "r", "b", "n"] as PromotionPiece[]).map(p => {
                                                    const c = game.turn();
                                                    const labels: Record<string, string> = { q: "Queen", r: "Rook", b: "Bishop", n: "Knight" };
                                                    return (
                                                        <button key={p} onClick={() => handlePromo(p)}
                                                            className="w-20 h-20 rounded-2xl flex flex-col items-center justify-center gap-1 bg-muted hover:bg-primary hover:text-primary-foreground transition-all border-2 border-border hover:border-primary hover:scale-105 active:scale-95">
                                                            <span className="text-4xl">{UNICODE[`${c}${p.toUpperCase()}`]}</span>
                                                            <span className="text-xs font-semibold opacity-70">{labels[p]}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* WHITE player strip */}
                            <PlayerStrip
                                name="White" subtitle={username} color="w"
                                seconds={wTime} active={activeTimer === "w" && !isOver}
                                capturedPieces={captured.b} isGameOver={isOver}
                            />

                            {/* Controls bar */}
                            <div className="w-full flex items-center justify-between gap-3 pt-1">
                                {/* Nav controls */}
                                <MoveNav
                                    onFirst={goFirst} onBack={goBack} onForward={goFwd}
                                    onLast={goLast} onReturnLive={returnLive}
                                    canBack={canBack} canForward={canFwd} isViewing={isViewing}
                                />

                                {/* Action buttons */}
                                <div className="flex items-center gap-2">
                                    {isOver ? (
                                        <>
                                            <button onClick={() => setScreen("setup")}
                                                className="h-9 px-5 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-md shadow-primary/20">
                                                Play Again
                                            </button>
                                            <button onClick={() => setScreen("lobby")}
                                                className="h-9 px-4 rounded-xl text-sm font-semibold bg-muted text-muted-foreground hover:bg-accent hover:text-foreground transition-all border border-border">
                                                Lobby
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <button onClick={() => setShowDraw(true)}
                                                        className="h-9 px-4 rounded-xl text-sm font-semibold border border-border bg-card hover:bg-accent text-muted-foreground hover:text-foreground transition-all flex items-center gap-1.5">
                                                        <FaHandshake className="text-sm" /> Draw
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent>Offer a draw</TooltipContent>
                                            </Tooltip>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <button onClick={() => setShowResign(true)}
                                                        className="h-9 px-4 rounded-xl text-sm font-semibold border border-red-500/40 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center gap-1.5">
                                                        <FaFlag className="text-xs" /> Resign
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent>Resign game</TooltipContent>
                                            </Tooltip>
                                            <button onClick={() => setScreen("setup")}
                                                className="h-9 px-4 rounded-xl text-sm font-semibold border border-border bg-card hover:bg-accent text-muted-foreground hover:text-foreground transition-all hidden sm:flex">
                                                New Game
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </main>

                    {/* ── RIGHT PANEL: move history ── */}
                    <aside className={cn(
                        "hidden lg:flex flex-col border-l border-border bg-card transition-all duration-300 flex-shrink-0",
                        chatOpen ? "w-72 xl:w-80" : "w-64 xl:w-72"
                    )}>
                        {/* Move history */}
                        <div className={cn("flex flex-col border-b border-border", chatOpen ? "flex-[0_0_auto]" : "flex-1 min-h-0")}>
                            <div className="flex items-center gap-2 px-4 py-3.5 border-b border-border flex-shrink-0">
                                <span className="font-bold text-sm">Move History</span>
                                {moves.length > 0 && (
                                    <Badge variant="outline" className="ml-auto text-xs h-5 px-2">{moves.length}</Badge>
                                )}
                            </div>
                            <div ref={moveListRef}
                                className={cn("overflow-y-auto p-3 min-h-0", chatOpen ? "max-h-56" : "flex-1")}>
                                {paired.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full py-12 gap-3 text-center">
                                        <span className="text-4xl opacity-20">♟</span>
                                        <p className="text-sm text-muted-foreground">No moves yet</p>
                                    </div>
                                ) : (
                                    <table className="w-full border-collapse">
                                        <tbody>
                                            {paired.map(([w, b], i) => {
                                                const wi = i * 2, bi = i * 2 + 1;
                                                const wActive = isViewing ? viewIndex === wi : wi === moves.length - 1 && !isViewing;
                                                const bActive = isViewing ? viewIndex === bi : bi === moves.length - 1 && !isViewing;
                                                return (
                                                    <tr key={i} className="group">
                                                        <td className="w-7 pl-2 py-0.5 text-xs font-mono text-muted-foreground select-none">{i + 1}.</td>
                                                        <td className="py-0.5 px-0.5 w-[46%]">
                                                            <button onClick={() => jumpTo(wi)} className={cn(
                                                                "w-full text-left px-2 py-1 rounded-lg text-sm font-mono transition-all",
                                                                wActive ? "bg-primary text-primary-foreground font-bold" : "hover:bg-accent",
                                                                w.captured && !wActive && "text-orange-500"
                                                            )}>{w.san}</button>
                                                        </td>
                                                        <td className="py-0.5 px-0.5 w-[46%]">
                                                            {b && (
                                                                <button onClick={() => jumpTo(bi)} className={cn(
                                                                    "w-full text-left px-2 py-1 rounded-lg text-sm font-mono transition-all",
                                                                    bActive ? "bg-primary text-primary-foreground font-bold" : "hover:bg-accent",
                                                                    b.captured && !bActive && "text-orange-500"
                                                                )}>{b.san}</button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>

                        {/* Chat panel */}
                        {chatEnabled && chatOpen && (
                            <div className="flex-1 min-h-0 overflow-hidden">
                                <ChatPanel messages={chatMsgs} onSend={sendChat} onClose={() => setChatOpen(false)} />
                            </div>
                        )}
                    </aside>
                </div>

                {/* ── MOBILE: move history + chat as bottom sheet tabs ── */}
                <div className="lg:hidden flex-shrink-0 border-t border-border bg-card">
                    {/* Mobile move history toggle + nav */}
                    <div className="flex items-center gap-2 px-3 py-2 overflow-x-auto">
                        <MoveNav
                            onFirst={goFirst} onBack={goBack} onForward={goFwd}
                            onLast={goLast} onReturnLive={returnLive}
                            canBack={canBack} canForward={canFwd} isViewing={isViewing}
                        />
                        <div className="ml-auto flex items-center gap-1 text-xs font-mono text-muted-foreground">
                            {paired.slice(-3).map(([w, b], i) => (
                                <span key={i} className="flex gap-1">
                                    <span>{w.san}</span>
                                    {b && <span>{b.san}</span>}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ═══ RESIGN DIALOG ═══ */}
                <Dialog open={showResign} onOpenChange={setShowResign}>
                    <DialogContent className="sm:max-w-sm">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <FaFlag className="text-red-500" /> Resign Game
                            </DialogTitle>
                            <DialogDescription>Your opponent will win. This cannot be undone.</DialogDescription>
                        </DialogHeader>
                        <div className="flex gap-3 pt-2">
                            <Button variant="outline" onClick={() => setShowResign(false)} className="flex-1">Cancel</Button>
                            <Button onClick={handleResign} className="flex-1 bg-red-500 hover:bg-red-600 text-white border-0">Resign</Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* ═══ DRAW DIALOG ═══ */}
                <Dialog open={showDraw} onOpenChange={setShowDraw}>
                    <DialogContent className="sm:max-w-sm">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <FaHandshake className="text-primary" /> Offer Draw
                            </DialogTitle>
                            <DialogDescription>This will end the game as a tie.</DialogDescription>
                        </DialogHeader>
                        <div className="flex gap-3 pt-2">
                            <Button variant="outline" onClick={() => setShowDraw(false)} className="flex-1">Cancel</Button>
                            <Button onClick={() => { setShowDraw(false); endGame("Game drawn by agreement 🤝"); setGameStatus("draw"); }}
                                className="flex-1 bg-primary text-primary-foreground hover:opacity-90 border-0">Accept</Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* ═══ RESULT DIALOG ═══ */}
                <Dialog open={showResult} onOpenChange={setShowResult}>
                    <DialogContent className="sm:max-w-md">
                        <div className="flex flex-col items-center gap-6 py-4 text-center">
                            <div className="w-20 h-20 rounded-3xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
                                <GiChessKing className="text-5xl text-primary" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black mb-2">Game Over</h2>
                                <p className="text-foreground font-semibold text-lg">{gameResult}</p>
                                <p className="text-sm text-muted-foreground mt-1">{moves.length} moves played</p>
                            </div>
                            <div className="flex flex-col gap-3 w-full">
                                <button onClick={() => { setShowResult(false); setScreen("setup"); }}
                                    className="w-full py-4 rounded-2xl text-base font-black bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-lg shadow-primary/20">
                                    Play Again
                                </button>
                                <button onClick={() => setShowResult(false)}
                                    className="w-full py-3 rounded-2xl text-sm font-semibold border border-border bg-card hover:bg-accent text-muted-foreground hover:text-foreground transition-all">
                                    Review Game
                                </button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                <BoardSettingsDialog
                    open={isSettingsOpen}
                    onClose={() => setIsSettingsOpen(false)}
                    setBoardTheme={handleSetBoardTheme}
                    setPieceStyle={handleSetPieceStyle}
                />

            </div>
        </TooltipProvider >
    );
}