"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Chess, Square, PieceSymbol, Color } from "chess.js";
import { useAppSelector } from "@/lib/hooks";
import { RootState } from "@/lib/store";
import {
    FaChessKing, FaFlag, FaHandshake,
    FaVolumeUp, FaVolumeMute, FaPaperPlane,
    FaSmile, FaChevronLeft, FaChevronRight,
} from "react-icons/fa";
import { MdFlipCameraAndroid } from "react-icons/md";
import { BsClockHistory, BsChatDots, BsArrowLeft } from "react-icons/bs";
import { GiChessKing, GiChessBishop } from "react-icons/gi";
import { IoSearchOutline } from "react-icons/io5";
import { HiLightningBolt } from "react-icons/hi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
    Tooltip, TooltipContent,
    TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type AppScreen = "lobby" | "setup" | "game";
type GameStatus = "playing" | "check" | "checkmate" | "stalemate" | "draw" | "resigned";
type PromotionPiece = "q" | "r" | "b" | "n";

interface TimeControl { label: string; seconds: number; desc: string; icon: React.ReactNode }
interface MoveHistoryEntry {
    san: string; from: Square; to: Square;
    piece: string; captured?: string; color: "w" | "b";
    moveNumber: number; fen: string;
}
interface CapturedPieces { w: PieceSymbol[]; b: PieceSymbol[] }
interface ChatMessage {
    id: string; sender: "me" | "opponent";
    type: "text" | "emoji" | "gif";
    content: string; timestamp: Date;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = ["8", "7", "6", "5", "4", "3", "2", "1"];

const PIECE_UNICODE: Record<string, string> = {
    wK: "♔", wQ: "♕", wR: "♖", wB: "♗", wN: "♘", wP: "♙",
    bK: "♚", bQ: "♛", bR: "♜", bB: "♝", bN: "♞", bP: "♟",
};

const PIECE_VALUES: Record<PieceSymbol, number> = {
    p: 1, n: 3, b: 3, r: 5, q: 9, k: 0,
};

const TIME_CONTROLS: TimeControl[] = [
    { label: "1 min", seconds: 60, desc: "Bullet", icon: <HiLightningBolt className="text-yellow-400" /> },
    { label: "3 min", seconds: 180, desc: "Blitz", icon: <HiLightningBolt className="text-orange-400" /> },
    { label: "5 min", seconds: 300, desc: "Rapid", icon: <GiChessBishop className="text-emerald-400" /> },
    { label: "10 min", seconds: 600, desc: "Classical", icon: <GiChessKing className="text-blue-400" /> },
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

// ─────────────────────────────────────────────────────────────────────────────
// Clock
// ─────────────────────────────────────────────────────────────────────────────

function Clock({ seconds, active }: { seconds: number; active: boolean }) {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    const isLow = seconds < 30;
    return (
        <div className={cn(
            "font-mono font-black tabular-nums tracking-widest text-lg sm:text-xl px-3 py-1.5 rounded-lg transition-all duration-300 select-none",
            active
                ? isLow
                    ? "bg-red-500 text-white animate-pulse shadow-md shadow-red-500/40"
                    : "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-md shadow-[var(--primary)]/25"
                : "bg-[var(--muted)] text-[var(--muted-foreground)]"
        )}>
            {m}:{s}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Captured pieces
// ─────────────────────────────────────────────────────────────────────────────

function CapturedDisplay({ pieces, color }: { pieces: PieceSymbol[]; color: Color }) {
    const sorted = [...pieces].sort((a, b) => PIECE_VALUES[b] - PIECE_VALUES[a]);
    const adv = pieces.reduce((s, p) => s + PIECE_VALUES[p], 0);
    return (
        <div className="flex items-center gap-0.5 flex-wrap min-h-[16px]">
            {sorted.map((p, i) => (
                <span key={i} className={cn(
                    "text-[11px] leading-none",
                    color === "w"
                        ? "text-white [text-shadow:0_1px_2px_rgba(0,0,0,1)]"
                        : "text-[#111] [text-shadow:0_1px_1px_rgba(255,255,255,0.3)]"
                )}>{PIECE_UNICODE[`${color}${p.toUpperCase()}`]}</span>
            ))}
            {adv > 0 && (
                <span className="text-[10px] text-[var(--muted-foreground)] font-bold ml-1">+{adv}</span>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Player card
// ─────────────────────────────────────────────────────────────────────────────

function PlayerCard({
    name, subtitle, color, seconds, active, capturedBy, isGameOver,
}: {
    name: string; subtitle: string; color: Color;
    seconds: number; active: boolean; capturedBy: PieceSymbol[]; isGameOver: boolean;
}) {
    return (
        <div className={cn(
            "flex items-center justify-between px-3 py-2.5 rounded-xl border-2 transition-all duration-300",
            active && !isGameOver
                ? "border-[var(--primary)] bg-[var(--primary)]/5 shadow-md shadow-[var(--primary)]/15"
                : "border-[var(--border)] bg-[var(--card)]"
        )}>
            <div className="flex items-center gap-2.5 min-w-0">
                <div className={cn(
                    "w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-lg font-bold border-2",
                    color === "w"
                        ? "bg-white text-gray-900 border-gray-300 shadow-sm"
                        : "bg-[#1a1a1a] text-white border-gray-700 shadow-sm"
                )}>
                    {color === "w" ? "♔" : "♚"}
                </div>
                <div className="min-w-0">
                    <p className="font-bold text-sm leading-none truncate">{name}</p>
                    <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5 truncate">{subtitle}</p>
                    <div className="mt-0.5">
                        <CapturedDisplay pieces={capturedBy} color={color === "w" ? "b" : "w"} />
                    </div>
                </div>
            </div>
            <Clock seconds={seconds} active={active} />
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Chat window
// ─────────────────────────────────────────────────────────────────────────────

function ChatWindow({
    messages, onSend,
}: {
    messages: ChatMessage[];
    onSend: (type: "text" | "emoji" | "gif", content: string) => void;
}) {
    const [input, setInput] = useState("");
    const [tab, setTab] = useState<"chat" | "emoji" | "gif">("chat");
    const [gifSearch, setGifSearch] = useState("");
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;
        onSend("text", input.trim());
        setInput("");
    };

    const filteredGifs = MOCK_GIFS.filter(g =>
        !gifSearch || g.title.includes(gifSearch.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
            {/* Header tabs */}
            <div className="px-3 py-2 border-b border-[var(--border)] flex items-center gap-2 flex-shrink-0">
                <BsChatDots className="text-[var(--primary)] text-sm flex-shrink-0" />
                <span className="font-bold text-xs text-[var(--foreground)]">Chat</span>
                <div className="ml-auto flex gap-1 bg-[var(--muted)] rounded-lg p-0.5">
                    {(["chat", "emoji", "gif"] as const).map(t => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={cn(
                                "text-[10px] px-2 py-0.5 rounded-md font-semibold transition-all",
                                tab === t
                                    ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm"
                                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                            )}
                        >
                            {t === "chat" ? "💬 Chat" : t === "emoji" ? "😊" : "GIF"}
                        </button>
                    ))}
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-4 gap-2 text-center">
                        <span className="text-3xl">♟️</span>
                        <p className="text-xs text-[var(--muted-foreground)]">No messages yet.<br />Say hello! 👋</p>
                    </div>
                ) : (
                    messages.map(msg => (
                        <div key={msg.id} className={cn("flex gap-1.5", msg.sender === "me" ? "justify-end" : "justify-start")}>
                            {msg.sender === "opponent" && (
                                <div className="w-5 h-5 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center text-[9px] flex-shrink-0 mt-auto">♚</div>
                            )}
                            <div className={cn(
                                "max-w-[78%] rounded-2xl px-3 py-1.5",
                                msg.sender === "me"
                                    ? "bg-[var(--primary)] text-[var(--primary-foreground)] rounded-br-sm"
                                    : "bg-[var(--muted)] text-[var(--foreground)] rounded-bl-sm"
                            )}>
                                {msg.type === "gif"
                                    ? <img src={msg.content} alt="gif" className="rounded-lg max-w-full max-h-20 object-cover" />
                                    : <span className={cn("text-sm", msg.type === "emoji" && "text-2xl")}>{msg.content}</span>
                                }
                                <p className={cn(
                                    "text-[9px] mt-0.5 opacity-60",
                                    msg.sender === "me" ? "text-right" : ""
                                )}>
                                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </p>
                            </div>
                            {msg.sender === "me" && (
                                <div className="w-5 h-5 rounded-full bg-white border border-gray-300 text-gray-900 flex items-center justify-center text-[9px] flex-shrink-0 mt-auto">♔</div>
                            )}
                        </div>
                    ))
                )}
                <div ref={bottomRef} />
            </div>

            {/* Emoji picker */}
            {tab === "emoji" && (
                <div className="border-t border-[var(--border)] p-2.5 bg-[var(--muted)]/30">
                    <div className="grid grid-cols-8 gap-1">
                        {QUICK_EMOJIS.map(e => (
                            <button
                                key={e}
                                onClick={() => { onSend("emoji", e); setTab("chat"); }}
                                className="text-lg hover:scale-125 transition-transform p-0.5 rounded hover:bg-[var(--accent)]"
                            >{e}</button>
                        ))}
                    </div>
                </div>
            )}

            {/* GIF picker */}
            {tab === "gif" && (
                <div className="border-t border-[var(--border)] bg-[var(--muted)]/30 flex-shrink-0">
                    <div className="flex items-center gap-2 px-2.5 pt-2 pb-1">
                        <IoSearchOutline className="text-[var(--muted-foreground)] flex-shrink-0" />
                        <input
                            value={gifSearch}
                            onChange={e => setGifSearch(e.target.value)}
                            placeholder="Search GIFs…"
                            className="flex-1 bg-transparent text-xs outline-none placeholder:text-[var(--muted-foreground)] text-[var(--foreground)]"
                        />
                    </div>
                    <div className="grid grid-cols-3 gap-1 px-2 pb-2 max-h-28 overflow-y-auto">
                        {filteredGifs.map(gif => (
                            <button
                                key={gif.id}
                                onClick={() => { onSend("gif", gif.url); setTab("chat"); }}
                                className="rounded-lg overflow-hidden border border-[var(--border)] hover:scale-105 transition-transform hover:border-[var(--primary)]"
                            >
                                <img src={gif.url} alt={gif.title} className="w-full h-14 object-cover" />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Text input */}
            {tab === "chat" && (
                <div className="border-t border-[var(--border)] flex items-center gap-2 px-3 py-2 flex-shrink-0 bg-[var(--muted)]/20">
                    <button
                        onClick={() => setTab("emoji")}
                        className="text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors text-base flex-shrink-0"
                    ><FaSmile /></button>
                    <button
                        onClick={() => setTab("gif")}
                        className="text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors text-[10px] font-black flex-shrink-0 leading-none"
                    >GIF</button>
                    <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleSend()}
                        placeholder="Say something…"
                        className="flex-1 text-xs bg-transparent outline-none placeholder:text-[var(--muted-foreground)] text-[var(--foreground)] min-w-0"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className="text-[var(--primary)] hover:scale-110 transition-transform disabled:opacity-30 disabled:scale-100 flex-shrink-0"
                    ><FaPaperPlane className="text-xs" /></button>
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Setup screen
// ─────────────────────────────────────────────────────────────────────────────

function SetupScreen({
    onStart, onBack,
}: {
    onStart: (timeSeconds: number, chatEnabled: boolean) => void;
    onBack: () => void;
}) {
    const [selectedTime, setSelectedTime] = useState(3); // default 10 min
    const [chatEnabled, setChatEnabled] = useState(true);

    return (
        <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-sm">

                {/* Back */}
                <button
                    onClick={onBack}
                    className="flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-10 transition-colors group"
                >
                    <BsArrowLeft className="group-hover:-translate-x-0.5 transition-transform" />
                    Back
                </button>

                {/* Title */}
                <div className="mb-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center">
                            <GiChessKing className="text-3xl text-[var(--primary)]" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight leading-none">New Game</h1>
                            <p className="text-[var(--muted-foreground)] text-sm mt-0.5">Choose your settings</p>
                        </div>
                    </div>
                </div>

                {/* Time controls */}
                <div className="mb-8">
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[var(--muted-foreground)] mb-3">Time Control</p>
                    <div className="grid grid-cols-2 gap-2.5">
                        {TIME_CONTROLS.map((tc, i) => (
                            <button
                                key={tc.label}
                                onClick={() => setSelectedTime(i)}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all text-left",
                                    selectedTime === i
                                        ? "border-[var(--primary)] bg-[var(--primary)]/8 shadow-lg shadow-[var(--primary)]/20 scale-[1.02]"
                                        : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/40 hover:bg-[var(--accent)]"
                                )}
                            >
                                <span className="text-2xl flex-shrink-0">{tc.icon}</span>
                                <div>
                                    <p className={cn("font-bold text-sm leading-none", selectedTime === i ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]")}>
                                        {tc.label}
                                    </p>
                                    <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">{tc.desc}</p>
                                </div>
                                {selectedTime === i && (
                                    <span className="ml-auto text-[var(--primary)] text-sm">✓</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Chat toggle */}
                <div className="mb-8 bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-4 flex items-center justify-between">
                    <div>
                        <p className="font-bold text-sm">In-game Chat</p>
                        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Messages, emojis &amp; GIFs</p>
                    </div>
                    <Switch
                        checked={chatEnabled}
                        onCheckedChange={setChatEnabled}
                        className="data-[state=checked]:bg-[var(--primary)]"
                    />
                </div>

                {/* Summary pill */}
                <div className="mb-5 rounded-xl bg-[var(--muted)]/60 border border-[var(--border)] px-4 py-3 flex items-center gap-3">
                    <span className="text-lg">{TIME_CONTROLS[selectedTime].icon}</span>
                    <p className="text-sm text-[var(--muted-foreground)]">
                        <span className="font-bold text-[var(--foreground)]">{TIME_CONTROLS[selectedTime].label}</span>
                        {" "}{TIME_CONTROLS[selectedTime].desc}
                        {" · "}Chat {chatEnabled ? "on" : "off"}
                    </p>
                </div>

                {/* Start */}
                <button
                    onClick={() => onStart(TIME_CONTROLS[selectedTime].seconds, chatEnabled)}
                    className={cn(
                        "w-full py-4 rounded-xl text-base font-black tracking-wide transition-all",
                        "bg-[var(--primary)] text-[var(--primary-foreground)]",
                        "hover:opacity-90 hover:scale-[1.015] active:scale-[0.985]",
                        "shadow-xl shadow-[var(--primary)]/30"
                    )}
                >
                    Start Game →
                </button>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Lobby screen
// ─────────────────────────────────────────────────────────────────────────────

function LobbyScreen({ onNewGame, username }: { onNewGame: () => void; username: string }) {
    return (
        <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center p-6">
            <div className="text-center w-full max-w-xs">

                {/* Board graphic */}
                <div className="relative inline-block mb-8 mx-auto">
                    <div className="grid grid-cols-4 w-24 h-24 rounded-2xl overflow-hidden shadow-2xl border-2 border-[var(--border)] mx-auto">
                        {Array.from({ length: 16 }).map((_, i) => (
                            <div key={i} className={cn(
                                "w-full h-full",
                                (Math.floor(i / 4) + (i % 4)) % 2 === 0
                                    ? "bg-[oklch(0.90_0.035_95)]"
                                    : "bg-[oklch(0.50_0.09_155)]"
                            )} />
                        ))}
                    </div>
                    <GiChessKing className="absolute inset-0 m-auto text-5xl text-white [filter:drop-shadow(0_2px_10px_rgba(0,0,0,0.6))]" />
                </div>

                <h1 className="text-4xl font-black tracking-tight mb-1">Chess</h1>
                <p className="text-[var(--muted-foreground)] text-sm mb-1">
                    Welcome back, <span className="text-[var(--foreground)] font-semibold">{username}</span>
                </p>
                <p className="text-xs text-[var(--muted-foreground)] mb-10 opacity-70">Play · Think · Win</p>

                <button
                    onClick={onNewGame}
                    className={cn(
                        "w-full py-4 rounded-xl text-base font-black tracking-wide transition-all mb-3",
                        "bg-[var(--primary)] text-[var(--primary-foreground)]",
                        "hover:opacity-90 hover:scale-[1.015] active:scale-[0.985]",
                        "shadow-xl shadow-[var(--primary)]/30"
                    )}
                >
                    ♟ New Game
                </button>
                <p className="text-xs text-[var(--muted-foreground)] opacity-60">More modes coming soon</p>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN CHESS PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function ChessPage() {
    const user = useAppSelector((state: RootState) => state.auth.user);
    const username = user?.username ?? "You";

    // ── Screen navigation ────────────────────────────────────────────────────
    const [screen, setScreen] = useState<AppScreen>("lobby");
    const [chatEnabled, setChatEnabled] = useState(true);

    // ── Game state ───────────────────────────────────────────────────────────
    const [game, setGame] = useState(() => new Chess());
    const [gameStatus, setGameStatus] = useState<GameStatus>("playing");
    const [boardFlipped, setBoardFlipped] = useState(false);
    const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
    const [legalMoves, setLegalMoves] = useState<Square[]>([]);
    const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
    const [moveHistory, setMoveHistory] = useState<MoveHistoryEntry[]>([]);
    const [viewIndex, setViewIndex] = useState(-1); // -1 = live
    const [capturedPieces, setCapturedPieces] = useState<CapturedPieces>({ w: [], b: [] });
    const [promotionPending, setPromotionPending] = useState<{ from: Square; to: Square } | null>(null);
    const [gameResult, setGameResult] = useState("");
    const [animatingSquare, setAnimatingSquare] = useState<Square | null>(null);

    // ── Timers ───────────────────────────────────────────────────────────────
    const [initialTime, setInitialTime] = useState(600);
    const [whiteTime, setWhiteTime] = useState(600);
    const [blackTime, setBlackTime] = useState(600);
    const [activeTimer, setActiveTimer] = useState<"w" | "b" | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // ── Chat ─────────────────────────────────────────────────────────────────
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [showChat, setShowChat] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // ── UI ───────────────────────────────────────────────────────────────────
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [showResignDialog, setShowResignDialog] = useState(false);
    const [showDrawDialog, setShowDrawDialog] = useState(false);
    const [showResultDialog, setShowResultDialog] = useState(false);
    const moveHistoryRef = useRef<HTMLDivElement>(null);

    // ── Derived ──────────────────────────────────────────────────────────────
    const isGameOver = ["checkmate", "stalemate", "draw", "resigned"].includes(gameStatus);
    const isViewingHistory = viewIndex >= 0;
    const displayedGame = isViewingHistory
        ? (() => { const g = new Chess(moveHistory[viewIndex].fen); return g; })()
        : game;

    const pairedMoves: [MoveHistoryEntry, MoveHistoryEntry | null][] = [];
    for (let i = 0; i < moveHistory.length; i += 2) {
        pairedMoves.push([moveHistory[i], moveHistory[i + 1] ?? null]);
    }

    // ── Scroll move history ──────────────────────────────────────────────────
    useEffect(() => {
        if (moveHistoryRef.current && !isViewingHistory) {
            moveHistoryRef.current.scrollTop = moveHistoryRef.current.scrollHeight;
        }
    }, [moveHistory, isViewingHistory]);

    // ── Timer ────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (!activeTimer || isGameOver) return;
        timerRef.current = setInterval(() => {
            if (activeTimer === "w") {
                setWhiteTime(t => {
                    if (t <= 1) { clearInterval(timerRef.current!); triggerEnd("Black wins on time! ⏱"); return 0; }
                    return t - 1;
                });
            } else {
                setBlackTime(t => {
                    if (t <= 1) { clearInterval(timerRef.current!); triggerEnd("White wins on time! ⏱"); return 0; }
                    return t - 1;
                });
            }
        }, 1000);
        return () => clearInterval(timerRef.current!);
    }, [activeTimer, isGameOver]);

    // ── End game ─────────────────────────────────────────────────────────────
    const triggerEnd = useCallback((result: string) => {
        setActiveTimer(null);
        setGameResult(result);
        setGameStatus("checkmate");
        setShowResultDialog(true);
    }, []);

    // ── Sound ────────────────────────────────────────────────────────────────
    const playSound = useCallback((type: "move" | "capture" | "check" | "illegal") => {
        if (!soundEnabled) return;
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            const f = { move: 440, capture: 300, check: 780, illegal: 180 }[type];
            osc.frequency.value = f;
            gain.gain.setValueAtTime(0.07, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
            osc.start(); osc.stop(ctx.currentTime + 0.18);
        } catch { }
    }, [soundEnabled]);

    // ── Start game ───────────────────────────────────────────────────────────
    const startGame = useCallback((timeSeconds: number, chat: boolean) => {
        const g = new Chess();
        setGame(g);
        setGameStatus("playing");
        setSelectedSquare(null); setLegalMoves([]);
        setLastMove(null); setMoveHistory([]);
        setViewIndex(-1);
        setCapturedPieces({ w: [], b: [] });
        setInitialTime(timeSeconds);
        setWhiteTime(timeSeconds); setBlackTime(timeSeconds);
        setActiveTimer("w");
        setChatEnabled(chat);
        setShowChat(false); setUnreadCount(0);
        setChatMessages([]);
        setShowResultDialog(false); setGameResult("");
        setScreen("game");
    }, []);

    // ── History navigation ───────────────────────────────────────────────────
    const goToStart = useCallback(() => {
        if (moveHistory.length === 0) return;
        setViewIndex(0);
        setSelectedSquare(null); setLegalMoves([]);
    }, [moveHistory]);

    const goBack = useCallback(() => {
        if (moveHistory.length === 0) return;
        setViewIndex(prev => {
            if (prev === -1) return moveHistory.length - 1;
            return Math.max(0, prev - 1);
        });
        setSelectedSquare(null); setLegalMoves([]);
    }, [moveHistory]);

    const goForward = useCallback(() => {
        if (viewIndex === -1) return;
        setViewIndex(prev => {
            const next = prev + 1;
            if (next >= moveHistory.length) return -1;
            return next;
        });
        setSelectedSquare(null); setLegalMoves([]);
    }, [viewIndex, moveHistory]);

    const returnToLive = useCallback(() => {
        setViewIndex(-1);
        setSelectedSquare(null); setLegalMoves([]);
    }, []);

    const jumpToMove = useCallback((idx: number) => {
        setViewIndex(idx >= moveHistory.length - 1 ? -1 : idx);
        setSelectedSquare(null); setLegalMoves([]);
    }, [moveHistory]);

    // ── Square click ─────────────────────────────────────────────────────────
    const handleSquareClick = useCallback((square: Square) => {
        if (isViewingHistory) { returnToLive(); return; }
        if (isGameOver) return;
        const piece = game.get(square);
        if (selectedSquare) {
            if (selectedSquare === square) { setSelectedSquare(null); setLegalMoves([]); return; }
            if (legalMoves.includes(square)) {
                const moving = game.get(selectedSquare);
                if (moving?.type === "p") {
                    const r = square[1];
                    if ((moving.color === "w" && r === "8") || (moving.color === "b" && r === "1")) {
                        setPromotionPending({ from: selectedSquare, to: square });
                        setSelectedSquare(null); setLegalMoves([]); return;
                    }
                }
                executeMove(selectedSquare, square); return;
            }
            if (piece && piece.color === game.turn()) { selectSquare(square); return; }
            setSelectedSquare(null); setLegalMoves([]); return;
        }
        if (piece && piece.color === game.turn()) selectSquare(square);
    }, [game, selectedSquare, legalMoves, isGameOver, isViewingHistory]);

    const selectSquare = useCallback((sq: Square) => {
        setSelectedSquare(sq);
        setLegalMoves(game.moves({ square: sq, verbose: true }).map(m => m.to as Square));
    }, [game]);

    const executeMove = useCallback((from: Square, to: Square, promo: PromotionPiece = "q") => {
        const gc = new Chess(game.fen());
        try {
            const r = gc.move({ from, to, promotion: promo });
            if (!r) { playSound("illegal"); return; }
            setGame(gc);
            setLastMove({ from, to });
            setSelectedSquare(null); setLegalMoves([]);
            setAnimatingSquare(to);
            setTimeout(() => setAnimatingSquare(null), 300);
            if (r.captured) {
                setCapturedPieces(prev => ({
                    ...prev,
                    [r.color]: [...prev[r.color as "w" | "b"], r.captured as PieceSymbol],
                }));
                playSound("capture");
            } else {
                playSound("move");
            }
            const entry: MoveHistoryEntry = {
                san: r.san, from, to, piece: r.piece, captured: r.captured,
                color: r.color, moveNumber: Math.ceil(gc.history().length / 2), fen: gc.fen(),
            };
            setMoveHistory(prev => [...prev, entry]);
            setViewIndex(-1);
            setActiveTimer(gc.turn());
            if (gc.isCheckmate()) {
                playSound("check");
                const w = gc.turn() === "w" ? "Black" : "White";
                setTimeout(() => triggerEnd(`${w} wins by checkmate! 🏆`), 80);
            } else if (gc.isStalemate()) {
                setTimeout(() => triggerEnd("Draw by stalemate"), 80);
            } else if (gc.isDraw()) {
                setTimeout(() => triggerEnd("Draw"), 80);
            } else if (gc.isCheck()) {
                playSound("check"); setGameStatus("check");
            } else {
                setGameStatus("playing");
            }
        } catch { playSound("illegal"); }
    }, [game, playSound, triggerEnd]);

    const handlePromotion = useCallback((p: PromotionPiece) => {
        if (!promotionPending) return;
        executeMove(promotionPending.from, promotionPending.to, p);
        setPromotionPending(null);
    }, [promotionPending, executeMove]);

    const handleResign = useCallback(() => {
        const w = game.turn() === "w" ? "Black" : "White";
        setGameStatus("resigned");
        triggerEnd(`${w} wins — you resigned.`);
        setShowResignDialog(false);
    }, [game, triggerEnd]);

    // ── Chat ─────────────────────────────────────────────────────────────────
    const handleChatSend = useCallback((type: "text" | "emoji" | "gif", content: string) => {
        const msg: ChatMessage = {
            id: Date.now().toString(), sender: "me", type, content, timestamp: new Date(),
        };
        setChatMessages(prev => [...prev, msg]);
        // Simulated opponent reply
        setTimeout(() => {
            const replies = ["Nice move! ♟", "Hmm, didn't see that 🤔", "You're good!", "GG", "😮", "👏", "Let's go again!"];
            const opp: ChatMessage = {
                id: (Date.now() + 1).toString(), sender: "opponent", type: "text",
                content: replies[Math.floor(Math.random() * replies.length)],
                timestamp: new Date(),
            };
            setChatMessages(prev => [...prev, opp]);
            if (!showChat) setUnreadCount(c => c + 1);
        }, 1500 + Math.random() * 2500);
    }, [showChat]);

    // ── Board render ─────────────────────────────────────────────────────────
    const renderBoard = () => {
        const ranks = boardFlipped ? [...RANKS].reverse() : RANKS;
        const files = boardFlipped ? [...FILES].reverse() : FILES;

        return ranks.map(rank =>
            files.map(file => {
                const square = `${file}${rank}` as Square;
                const piece = displayedGame.get(square);
                const fi = FILES.indexOf(file);
                const ri = RANKS.indexOf(rank);
                const isLight = (fi + ri) % 2 === 0;

                const isSelected = !isViewingHistory && selectedSquare === square;
                const isLegal = !isViewingHistory && legalMoves.includes(square);

                const hlMove = isViewingHistory && viewIndex > 0
                    ? { from: moveHistory[viewIndex].from, to: moveHistory[viewIndex].to }
                    : lastMove;

                const isLastFrom = hlMove?.from === square;
                const isLastTo = hlMove?.to === square;
                const isInCheck = displayedGame.isCheck() && piece?.type === "k" && piece.color === displayedGame.turn();
                const isAnimating = !isViewingHistory && animatingSquare === square;

                return (
                    <div
                        key={square}
                        onClick={() => handleSquareClick(square)}
                        style={{ aspectRatio: "1/1" }}
                        className={cn(
                            "relative flex items-center justify-center select-none transition-all duration-75",
                            isLight ? "bg-[oklch(0.91_0.03_95)]" : "bg-[oklch(0.49_0.095_155)]",
                            !isViewingHistory && !isGameOver ? "cursor-pointer hover:brightness-[1.08]" : "cursor-default",
                            isViewingHistory && "opacity-90",
                        )}
                    >
                        {/* Rank label */}
                        {file === (boardFlipped ? "h" : "a") && (
                            <span className={cn(
                                "absolute top-0.5 left-0.5 text-[9px] sm:text-[10px] font-bold z-10 pointer-events-none leading-none select-none",
                                isLight ? "text-[oklch(0.49_0.095_155)]" : "text-[oklch(0.91_0.03_95)]"
                            )}>{rank}</span>
                        )}
                        {/* File label */}
                        {rank === (boardFlipped ? "8" : "1") && (
                            <span className={cn(
                                "absolute bottom-0.5 right-0.5 text-[9px] sm:text-[10px] font-bold z-10 pointer-events-none leading-none select-none",
                                isLight ? "text-[oklch(0.49_0.095_155)]" : "text-[oklch(0.91_0.03_95)]"
                            )}>{file}</span>
                        )}
                        {/* Last move highlight */}
                        {(isLastFrom || isLastTo) && (
                            <div className="absolute inset-0 bg-yellow-400/30 pointer-events-none z-[1]" />
                        )}
                        {/* Selected */}
                        {isSelected && (
                            <div className="absolute inset-0 bg-yellow-300/50 ring-2 ring-inset ring-yellow-400 pointer-events-none z-[2]" />
                        )}
                        {/* Check */}
                        {isInCheck && (
                            <div className="absolute inset-0 bg-red-500/55 ring-2 ring-inset ring-red-500 pointer-events-none z-[2]" />
                        )}
                        {/* Legal move */}
                        {isLegal && (
                            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                                {piece
                                    ? <div className="absolute inset-0 ring-[3.5px] ring-inset ring-black/25 pointer-events-none" />
                                    : <div className="w-[30%] h-[30%] rounded-full bg-black/18" />
                                }
                            </div>
                        )}
                        {/* Piece */}
                        {piece && (
                            <span className={cn(
                                "relative z-20 flex items-center justify-center w-full h-full leading-none",
                                "text-[2rem] sm:text-[2.6rem] md:text-[3rem]",
                                "transition-transform duration-100",
                                isAnimating && "scale-[1.15]",
                                isSelected && "scale-[1.12]",
                                piece.color === "w"
                                    ? "text-white [text-shadow:0_2px_5px_rgba(0,0,0,0.9),0_0_10px_rgba(0,0,0,0.3)]"
                                    : "text-[#0d0d0d] [text-shadow:0_1px_3px_rgba(255,255,255,0.3),0_0_6px_rgba(255,255,255,0.1)]"
                            )}>
                                {PIECE_UNICODE[`${piece.color}${piece.type.toUpperCase()}`]}
                            </span>
                        )}
                    </div>
                );
            })
        );
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Screen router
    // ─────────────────────────────────────────────────────────────────────────

    if (screen === "lobby") return <LobbyScreen onNewGame={() => setScreen("setup")} username={username} />;
    if (screen === "setup") return <SetupScreen onStart={startGame} onBack={() => setScreen("lobby")} />;

    // ─────────────────────────────────────────────────────────────────────────
    // Game screen
    // ─────────────────────────────────────────────────────────────────────────

    const canGoBack = moveHistory.length > 0 && viewIndex !== 0;
    const canGoForward = isViewingHistory;

    return (
        <TooltipProvider>
            <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col">

                {/* ── Header ── */}
                <header className="border-b border-[var(--border)] px-3 sm:px-4 py-2.5 flex items-center gap-2 bg-[var(--card)] sticky top-0 z-40 shadow-sm">
                    <button
                        onClick={() => setScreen("lobby")}
                        className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors group mr-1"
                    >
                        <BsArrowLeft className="group-hover:-translate-x-0.5 transition-transform" />
                        <span className="hidden sm:inline font-medium">Lobby</span>
                    </button>

                    <div className="w-px h-4 bg-[var(--border)]" />

                    <GiChessKing className="text-lg text-[var(--primary)] flex-shrink-0" />
                    <span className="font-black text-sm tracking-tight">Chess</span>

                    <Badge
                        variant="outline"
                        className={cn(
                            "text-[10px] h-5 px-2 font-semibold ml-1",
                            gameStatus === "check" && "border-orange-500/70 text-orange-500 bg-orange-500/8",
                            (gameStatus === "checkmate" || gameStatus === "resigned") && "border-red-500/60 text-red-500",
                            gameStatus === "playing" && "border-[var(--primary)]/50 text-[var(--primary)]",
                            isViewingHistory && "border-blue-500/50 text-blue-500 bg-blue-500/8",
                        )}
                    >
                        {isViewingHistory
                            ? `← Move ${viewIndex + 1} / ${moveHistory.length}`
                            : gameStatus === "check" ? "⚠ Check!"
                                : gameStatus === "checkmate" ? "Checkmate"
                                    : gameStatus === "stalemate" ? "Stalemate"
                                        : gameStatus === "draw" ? "Draw"
                                            : gameStatus === "resigned" ? "Resigned"
                                                : game.turn() === "w" ? "White to move" : "Black to move"
                        }
                    </Badge>

                    <div className="flex items-center gap-1 ml-auto">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSoundEnabled(v => !v)}>
                                    {soundEnabled ? <FaVolumeUp className="text-xs" /> : <FaVolumeMute className="text-xs text-[var(--muted-foreground)]" />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>{soundEnabled ? "Mute sounds" : "Enable sounds"}</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setBoardFlipped(v => !v)}>
                                    <MdFlipCameraAndroid className="text-sm" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Flip board</TooltipContent>
                        </Tooltip>

                        {chatEnabled && (
                            <button
                                onClick={() => { setShowChat(v => !v); setUnreadCount(0); }}
                                className={cn(
                                    "relative flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold transition-all",
                                    showChat
                                        ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-md"
                                        : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]"
                                )}
                            >
                                <BsChatDots />
                                <span className="hidden sm:inline">Chat</span>
                                {unreadCount > 0 && !showChat && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold leading-none">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>
                        )}
                    </div>
                </header>

                {/* ── Main layout ── */}
                <main className="flex-1 flex flex-col lg:flex-row gap-3 p-3 sm:p-4 max-w-[1400px] mx-auto w-full">

                    {/* ── Left sidebar ── */}
                    <aside className="lg:w-56 xl:w-64 flex flex-row lg:flex-col gap-2 lg:gap-3 order-2 lg:order-1 flex-shrink-0">

                        {/* Black player */}
                        <div className="flex-1 lg:flex-none">
                            <PlayerCard
                                name="Black" subtitle="Computer" color="b"
                                seconds={blackTime} active={activeTimer === "b" && !isGameOver}
                                capturedBy={capturedPieces.w} isGameOver={isGameOver}
                            />
                        </div>

                        {/* Desktop nav controls */}
                        <div className="hidden lg:flex flex-col gap-2 py-1">
                            <div className="flex items-center gap-1.5 bg-[var(--card)] border border-[var(--border)] rounded-xl p-2">
                                {/* |◀ */}
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" className="flex-1 h-8 text-[10px] font-black hover:bg-[var(--accent)]"
                                            onClick={goToStart} disabled={moveHistory.length === 0 || viewIndex === 0}>
                                            ⏮
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>First move</TooltipContent>
                                </Tooltip>
                                {/* ◀ */}
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" className="flex-1 h-8 hover:bg-[var(--accent)]"
                                            onClick={goBack} disabled={!canGoBack}>
                                            <FaChevronLeft className="text-xs" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Previous move</TooltipContent>
                                </Tooltip>
                                {/* ▶ */}
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" className="flex-1 h-8 hover:bg-[var(--accent)]"
                                            onClick={goForward} disabled={!canGoForward}>
                                            <FaChevronRight className="text-xs" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Next move</TooltipContent>
                                </Tooltip>
                                {/* ▶| */}
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" className="flex-1 h-8 text-[10px] font-black hover:bg-[var(--accent)]"
                                            onClick={returnToLive} disabled={!isViewingHistory}>
                                            ⏭
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Latest move</TooltipContent>
                                </Tooltip>
                            </div>

                            {isViewingHistory && (
                                <button
                                    onClick={returnToLive}
                                    className="text-[11px] text-center py-1.5 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/25 hover:bg-blue-500/18 transition-colors font-semibold"
                                >
                                    ↩ Return to live
                                </button>
                            )}
                        </div>

                        {/* White player */}
                        <div className="flex-1 lg:flex-none">
                            <PlayerCard
                                name="White" subtitle={username} color="w"
                                seconds={whiteTime} active={activeTimer === "w" && !isGameOver}
                                capturedBy={capturedPieces.b} isGameOver={isGameOver}
                            />
                        </div>
                    </aside>

                    {/* ── Center: board ── */}
                    <section className="flex-1 flex flex-col items-center gap-3 order-1 lg:order-2 min-w-0">

                        {/* Board */}
                        <div className="w-full" style={{ maxWidth: "min(100%, min(calc(100vh - 260px), 580px))" }}>
                            <div
                                className={cn(
                                    "w-full grid grid-cols-8 rounded-2xl overflow-hidden",
                                    "border-[3px] shadow-2xl",
                                    isViewingHistory
                                        ? "border-blue-500/50 shadow-blue-500/10"
                                        : gameStatus === "check"
                                            ? "border-orange-500/60"
                                            : "border-[var(--border)]"
                                )}
                                style={{ aspectRatio: "1/1" }}
                            >
                                {renderBoard()}
                            </div>

                            {/* Promotion overlay */}
                            {promotionPending && (
                                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center rounded-2xl z-30">
                                    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 shadow-2xl">
                                        <p className="text-center text-[10px] font-black uppercase tracking-[0.15em] text-[var(--muted-foreground)] mb-4">
                                            Promote Pawn
                                        </p>
                                        <div className="flex gap-2.5">
                                            {(["q", "r", "b", "n"] as PromotionPiece[]).map(p => {
                                                const c = game.turn();
                                                const labels: Record<string, string> = { q: "Queen", r: "Rook", b: "Bishop", n: "Knight" };
                                                return (
                                                    <button
                                                        key={p}
                                                        onClick={() => handlePromotion(p)}
                                                        className="w-16 h-16 rounded-xl flex flex-col items-center justify-center gap-1 bg-[var(--muted)] hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] transition-all border border-[var(--border)] hover:scale-105 active:scale-95"
                                                    >
                                                        <span className="text-3xl">{PIECE_UNICODE[`${c}${p.toUpperCase()}`]}</span>
                                                        <span className="text-[9px] font-semibold opacity-60">{labels[p]}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Bottom action bar */}
                        <div className="flex items-center gap-2 flex-wrap justify-center w-full" style={{ maxWidth: 580 }}>
                            {/* Mobile nav */}
                            <div className="flex items-center gap-1 lg:hidden bg-[var(--card)] border border-[var(--border)] rounded-xl px-1.5 py-1">
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-[10px]" onClick={goToStart} disabled={moveHistory.length === 0 || viewIndex === 0}>⏮</Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={goBack} disabled={!canGoBack}><FaChevronLeft className="text-xs" /></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={goForward} disabled={!canGoForward}><FaChevronRight className="text-xs" /></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-[10px]" onClick={returnToLive} disabled={!isViewingHistory}>⏭</Button>
                                {isViewingHistory && (
                                    <span className="text-[10px] text-blue-500 font-bold px-1">Live ↩</span>
                                )}
                            </div>

                            {isGameOver ? (
                                <>
                                    <Button
                                        onClick={() => setScreen("setup")}
                                        className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 font-bold text-sm h-9 px-5"
                                    >
                                        Play Again
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setScreen("lobby")}
                                        className="border-[var(--border)] text-sm h-9 px-4"
                                    >
                                        Lobby
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="outline" size="sm"
                                                onClick={() => setShowDrawDialog(true)}
                                                className="border-[var(--border)] gap-1.5 h-9 text-xs font-semibold"
                                            >
                                                <FaHandshake /> Draw
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Offer draw</TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="outline" size="sm"
                                                onClick={() => setShowResignDialog(true)}
                                                className="border-red-500/40 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 gap-1.5 h-9 text-xs font-semibold transition-all"
                                            >
                                                <FaFlag /> Resign
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Resign game</TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="outline" size="sm"
                                                onClick={() => setScreen("setup")}
                                                className="border-[var(--border)] h-9 text-xs"
                                            >
                                                New Game
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Start a new game</TooltipContent>
                                    </Tooltip>
                                </>
                            )}
                        </div>
                    </section>

                    {/* ── Right: moves + chat ── */}
                    <aside className="lg:w-56 xl:w-64 order-3 flex flex-col gap-3 min-h-0 flex-shrink-0">

                        {/* Move history */}
                        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] flex flex-col overflow-hidden"
                            style={{ minHeight: 160, flex: showChat ? "0 1 auto" : "1 1 auto", maxHeight: showChat ? 260 : undefined }}>
                            <div className="px-3 py-2.5 border-b border-[var(--border)] flex items-center gap-2 flex-shrink-0">
                                <BsClockHistory className="text-[var(--primary)] text-sm flex-shrink-0" />
                                <span className="font-bold text-sm">Moves</span>
                                {moveHistory.length > 0 && (
                                    <Badge variant="outline" className="ml-auto text-[10px] h-4 px-1.5">{moveHistory.length}</Badge>
                                )}
                            </div>
                            <div
                                ref={moveHistoryRef}
                                className="overflow-y-auto p-2"
                                style={{ maxHeight: 300 }}
                            >
                                {pairedMoves.length === 0 ? (
                                    <p className="text-[var(--muted-foreground)] text-xs text-center py-6 opacity-70">
                                        No moves yet
                                    </p>
                                ) : (
                                    <table className="w-full border-collapse">
                                        <tbody>
                                            {pairedMoves.map(([white, black], i) => {
                                                const wi = i * 2, bi = i * 2 + 1;
                                                return (
                                                    <tr key={i}>
                                                        <td className="text-[var(--muted-foreground)] w-5 pl-1 py-0.5 text-[10px] font-mono select-none">{i + 1}.</td>
                                                        <td className="py-0.5 px-0.5 w-[46%]">
                                                            <button
                                                                onClick={() => jumpToMove(wi)}
                                                                className={cn(
                                                                    "w-full text-left px-1.5 py-0.5 rounded text-xs font-mono transition-all",
                                                                    (isViewingHistory ? viewIndex === wi : wi === moveHistory.length - 1 && !isViewingHistory)
                                                                        ? "bg-[var(--primary)] text-[var(--primary-foreground)] font-bold"
                                                                        : "hover:bg-[var(--accent)]",
                                                                    white.captured && !(isViewingHistory ? viewIndex === wi : wi === moveHistory.length - 1 && !isViewingHistory)
                                                                    && "text-orange-500"
                                                                )}
                                                            >
                                                                {white.san}
                                                            </button>
                                                        </td>
                                                        <td className="py-0.5 px-0.5 w-[46%]">
                                                            {black && (
                                                                <button
                                                                    onClick={() => jumpToMove(bi)}
                                                                    className={cn(
                                                                        "w-full text-left px-1.5 py-0.5 rounded text-xs font-mono transition-all",
                                                                        (isViewingHistory ? viewIndex === bi : bi === moveHistory.length - 1 && !isViewingHistory)
                                                                            ? "bg-[var(--primary)] text-[var(--primary-foreground)] font-bold"
                                                                            : "hover:bg-[var(--accent)]",
                                                                        black.captured && !(isViewingHistory ? viewIndex === bi : bi === moveHistory.length - 1 && !isViewingHistory)
                                                                        && "text-orange-500"
                                                                    )}
                                                                >
                                                                    {black.san}
                                                                </button>
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
                        {chatEnabled && showChat && (
                            <div className="flex-shrink-0" style={{ height: 320 }}>
                                <ChatWindow messages={chatMessages} onSend={handleChatSend} />
                            </div>
                        )}
                    </aside>
                </main>

                {/* ── Resign dialog ── */}
                <Dialog open={showResignDialog} onOpenChange={setShowResignDialog}>
                    <DialogContent className="sm:max-w-xs">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-base">
                                <FaFlag className="text-red-500" /> Resign Game
                            </DialogTitle>
                            <DialogDescription className="text-sm">
                                Your opponent will win. Are you sure?
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex gap-3 mt-2">
                            <Button variant="outline" onClick={() => setShowResignDialog(false)} className="flex-1">Cancel</Button>
                            <Button onClick={handleResign} className="flex-1 bg-red-500 hover:bg-red-600 text-white">Resign</Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* ── Draw dialog ── */}
                <Dialog open={showDrawDialog} onOpenChange={setShowDrawDialog}>
                    <DialogContent className="sm:max-w-xs">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-base">
                                <FaHandshake className="text-[var(--primary)]" /> Offer Draw
                            </DialogTitle>
                            <DialogDescription className="text-sm">
                                This will end the game as a tie.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex gap-3 mt-2">
                            <Button variant="outline" onClick={() => setShowDrawDialog(false)} className="flex-1">Cancel</Button>
                            <Button onClick={() => {
                                setShowDrawDialog(false);
                                triggerEnd("Game drawn by agreement 🤝");
                                setGameStatus("draw");
                            }} className="flex-1 bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90">
                                Accept
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* ── Result dialog ── */}
                <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
                    <DialogContent className="sm:max-w-sm">
                        <div className="pt-4 pb-2 flex flex-col items-center gap-5 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center">
                                <GiChessKing className="text-4xl text-[var(--primary)]" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black mb-1.5">Game Over</h2>
                                <p className="text-[var(--foreground)] font-semibold">{gameResult}</p>
                                <p className="text-xs text-[var(--muted-foreground)] mt-1 opacity-70">{moveHistory.length} moves played</p>
                            </div>
                            <div className="flex flex-col gap-2 w-full">
                                <Button
                                    onClick={() => { setShowResultDialog(false); setScreen("setup"); }}
                                    className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 font-black py-5 text-base"
                                >
                                    Play Again
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowResultDialog(false)}
                                    className="border-[var(--border)]"
                                >
                                    Review Game
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

            </div>
        </TooltipProvider>
    );
}