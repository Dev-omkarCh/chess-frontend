"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Chess, Square, PieceSymbol, Color } from "chess.js";
import { useAppSelector } from "@/lib/hooks";
import { RootState } from "@/lib/store";
import {
    FaChessKing, FaChessQueen, FaChessRook, FaChessBishop,
    FaChessKnight, FaChessPawn, FaFlag, FaHandshake,
    FaUndoAlt, FaRedo, FaVolumeUp, FaVolumeMute,
} from "react-icons/fa";
import { MdFlipCameraAndroid } from "react-icons/md"
import { IoMdSettings } from "react-icons/io";
import { BsClockHistory } from "react-icons/bs";
import { GiChessKing } from "react-icons/gi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type GameStatus = "idle" | "playing" | "check" | "checkmate" | "stalemate" | "draw" | "resigned";
type PromotionPiece = "q" | "r" | "b" | "n";

interface MoveHistory {
    san: string; // Standard Algebraic Notation
    from: Square;
    to: Square;
    piece: string;
    captured?: string;
    color: "w" | "b";
    moveNumber: number;
}

interface CapturedPieces {
    w: PieceSymbol[];
    b: PieceSymbol[];
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

const INITIAL_TIME = 10 * 60; // 10 minutes

// ─────────────────────────────────────────────────────────────────────────────
// Helper: piece icon component
// ─────────────────────────────────────────────────────────────────────────────

function PieceIcon({ piece, color, size = "text-2xl" }: { piece: PieceSymbol; color: Color; size?: string }) {
    const key = `${color}${piece.toUpperCase()}`;
    const icons: Record<string, React.ReactNode> = {
        wK: <FaChessKing />, wQ: <FaChessQueen />, wR: <FaChessRook />,
        wB: <FaChessBishop />, wN: <FaChessKnight />, wP: <FaChessPawn />,
        bK: <FaChessKing />, bQ: <FaChessQueen />, bR: <FaChessRook />,
        bB: <FaChessBishop />, bN: <FaChessKnight />, bP: <FaChessPawn />,
    };
    return (
        <span className={cn(size, color === "w" ? "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" : "text-gray-900 drop-shadow-[0_1px_1px_rgba(255,255,255,0.3)]")}>
            {icons[key]}
        </span>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Clock display
// ─────────────────────────────────────────────────────────────────────────────

function Clock({ seconds, active }: { seconds: number; active: boolean }) {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    const isLow = seconds < 30;
    return (
        <div className={cn(
            "font-mono text-2xl sm:text-3xl font-bold px-4 py-2 rounded-lg transition-all duration-300 tabular-nums tracking-wider",
            active
                ? isLow
                    ? "bg-[var(--danger)] text-white animate-pulse shadow-lg shadow-red-500/30"
                    : "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-lg shadow-[var(--primary)]/30"
                : "bg-[var(--muted)] text-[var(--muted-foreground)]"
        )}>
            {m}:{s}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Captured pieces display
// ─────────────────────────────────────────────────────────────────────────────

function CapturedDisplay({ pieces, color }: { pieces: PieceSymbol[]; color: Color }) {
    const sorted = [...pieces].sort((a, b) => PIECE_VALUES[b] - PIECE_VALUES[a]);
    const advantage = pieces.reduce((s, p) => s + PIECE_VALUES[p], 0);
    return (
        <div className="flex items-center gap-1 flex-wrap min-h-[24px]">
            {sorted.map((p, i) => (
                <span key={i} className={cn(
                    "text-sm leading-none",
                    color === "w" ? "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]" : "text-gray-900 drop-shadow-[0_1px_1px_rgba(255,255,255,0.2)]"
                )}>
                    {PIECE_UNICODE[`${color}${p.toUpperCase()}`]}
                </span>
            ))}
            {advantage > 0 && (
                <span className="text-xs text-[var(--muted-foreground)] font-semibold ml-1">+{advantage}</span>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Move history entry
// ─────────────────────────────────────────────────────────────────────────────

function MoveEntry({ move, isLast }: { move: MoveHistory; isLast: boolean }) {
    return (
        <span className={cn(
            "px-2 py-0.5 rounded text-sm font-mono transition-colors",
            isLast ? "bg-[var(--primary)] text-[var(--primary-foreground)] font-bold" : "hover:bg-[var(--accent)]",
            move.captured ? "text-[var(--danger-foreground)]" : "text-[var(--foreground)]"
        )}>
            {move.san}
        </span>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Chess Page
// ─────────────────────────────────────────────────────────────────────────────

export default function ChessPage() {
    const user = useAppSelector((state: RootState) => state.auth.user);

    // Game state
    const [game, setGame] = useState(() => new Chess());
    const [gameStatus, setGameStatus] = useState<GameStatus>("idle");
    const [boardFlipped, setBoardFlipped] = useState(false);
    const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
    const [legalMoves, setLegalMoves] = useState<Square[]>([]);
    const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
    const [moveHistory, setMoveHistory] = useState<MoveHistory[]>([]);
    const [capturedPieces, setCapturedPieces] = useState<CapturedPieces>({ w: [], b: [] });
    const [historyStack, setHistoryStack] = useState<string[]>([]);
    const [promotionPending, setPromotionPending] = useState<{ from: Square; to: Square } | null>(null);
    const [gameResult, setGameResult] = useState<string>("");

    // Timer state
    const [whiteTime, setWhiteTime] = useState(INITIAL_TIME);
    const [blackTime, setBlackTime] = useState(INITIAL_TIME);
    const [activeTimer, setActiveTimer] = useState<"w" | "b" | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // UI state
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [showResignDialog, setShowResignDialog] = useState(false);
    const [showDrawDialog, setShowDrawDialog] = useState(false);
    const [showResultDialog, setShowResultDialog] = useState(false);
    const [animatingSquare, setAnimatingSquare] = useState<Square | null>(null);

    // Scroll move history to bottom
    const moveHistoryRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (moveHistoryRef.current) {
            moveHistoryRef.current.scrollTop = moveHistoryRef.current.scrollHeight;
        }
    }, [moveHistory]);

    // ── Timer logic ──────────────────────────────────────────────────────────
    useEffect(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (!activeTimer || gameStatus === "checkmate" || gameStatus === "stalemate" || gameStatus === "draw" || gameStatus === "resigned") return;

        timerRef.current = setInterval(() => {
            if (activeTimer === "w") {
                setWhiteTime((t) => {
                    if (t <= 1) {
                        clearInterval(timerRef.current!);
                        endGame("Black wins on time!", "b");
                        return 0;
                    }
                    return t - 1;
                });
            } else {
                setBlackTime((t) => {
                    if (t <= 1) {
                        clearInterval(timerRef.current!);
                        endGame("White wins on time!", "w");
                        return 0;
                    }
                    return t - 1;
                });
            }
        }, 1000);

        return () => clearInterval(timerRef.current!);
    }, [activeTimer, gameStatus]);

    // ── Game helpers ─────────────────────────────────────────────────────────
    const endGame = useCallback((result: string, _winner?: string) => {
        setActiveTimer(null);
        setGameResult(result);
        setShowResultDialog(true);
        setGameStatus("checkmate");
    }, []);

    const updateGameStatus = useCallback((g: Chess) => {
        if (g.isCheckmate()) {
            const winner = g.turn() === "w" ? "Black" : "White";
            endGame(`${winner} wins by checkmate! 🏆`);
            setGameStatus("checkmate");
        } else if (g.isStalemate()) {
            endGame("Draw by stalemate");
            setGameStatus("stalemate");
        } else if (g.isDraw()) {
            endGame("Draw");
            setGameStatus("draw");
        } else if (g.isCheck()) {
            setGameStatus("check");
        } else {
            setGameStatus("playing");
        }
    }, [endGame]);

    const playSound = useCallback((type: "move" | "capture" | "check" | "illegal") => {
        if (!soundEnabled) return;
        // In production, use actual audio files; here we use Web Audio API for beeps
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            const freq = { move: 440, capture: 330, check: 880, illegal: 220 }[type];
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
            osc.start();
            osc.stop(ctx.currentTime + 0.15);
        } catch { /* AudioContext not available */ }
    }, [soundEnabled]);

    // ── Start new game ───────────────────────────────────────────────────────
    const startNewGame = useCallback(() => {
        const newGame = new Chess();
        setGame(newGame);
        setGameStatus("playing");
        setSelectedSquare(null);
        setLegalMoves([]);
        setLastMove(null);
        setMoveHistory([]);
        setCapturedPieces({ w: [], b: [] });
        setHistoryStack([]);
        setWhiteTime(INITIAL_TIME);
        setBlackTime(INITIAL_TIME);
        setActiveTimer("w");
        setShowResultDialog(false);
        setGameResult("");
    }, []);

    // ── Square click handler ─────────────────────────────────────────────────
    const handleSquareClick = useCallback((square: Square) => {
        if (gameStatus === "idle" || gameStatus === "checkmate" || gameStatus === "stalemate" || gameStatus === "draw" || gameStatus === "resigned") return;

        const piece = game.get(square);

        // If a square is already selected
        if (selectedSquare) {
            // Clicking the same square deselects
            if (selectedSquare === square) {
                setSelectedSquare(null);
                setLegalMoves([]);
                return;
            }

            // Try to make move
            if (legalMoves.includes(square)) {
                // Check for promotion
                const movingPiece = game.get(selectedSquare);
                if (movingPiece?.type === "p") {
                    const toRank = square[1];
                    if ((movingPiece.color === "w" && toRank === "8") || (movingPiece.color === "b" && toRank === "1")) {
                        setPromotionPending({ from: selectedSquare, to: square });
                        setSelectedSquare(null);
                        setLegalMoves([]);
                        return;
                    }
                }
                executeMove(selectedSquare, square);
                return;
            }

            // Click on own piece — reselect
            if (piece && piece.color === game.turn()) {
                selectSquare(square);
                return;
            }

            setSelectedSquare(null);
            setLegalMoves([]);
            return;
        }

        // Select a piece
        if (piece && piece.color === game.turn()) {
            selectSquare(square);
        }
    }, [game, selectedSquare, legalMoves, gameStatus]);

    const selectSquare = useCallback((square: Square) => {
        setSelectedSquare(square);
        const moves = game.moves({ square, verbose: true }).map((m) => m.to as Square);
        setLegalMoves(moves);
    }, [game]);

    const executeMove = useCallback((from: Square, to: Square, promotion: PromotionPiece = "q") => {
        const gameCopy = new Chess(game.fen());
        const prevFen = game.fen();

        try {
            const result = gameCopy.move({ from, to, promotion });
            if (!result) { playSound("illegal"); return; }

            setHistoryStack((prev) => [...prev, prevFen]);
            setGame(gameCopy);
            setLastMove({ from, to });
            setSelectedSquare(null);
            setLegalMoves([]);
            setAnimatingSquare(to);
            setTimeout(() => setAnimatingSquare(null), 300);

            // Update captured pieces
            if (result.captured) {
                const capturedColor = result.color === "w" ? "b" : "w";
                setCapturedPieces((prev) => ({
                    ...prev,
                    [result.color]: [...prev[result.color as keyof CapturedPieces], result.captured as PieceSymbol],
                }));
                playSound("capture");
            } else {
                playSound("move");
            }

            // Update move history
            const moveNum = Math.ceil(gameCopy.history().length / 2);
            setMoveHistory((prev) => [...prev, {
                san: result.san,
                from,
                to,
                piece: result.piece,
                captured: result.captured,
                color: result.color,
                moveNumber: moveNum,
            }]);

            // Switch timer
            setActiveTimer(gameCopy.turn());

            // Check game status
            if (gameCopy.isCheck()) playSound("check");
            updateGameStatus(gameCopy);

        } catch {
            playSound("illegal");
        }
    }, [game, playSound, updateGameStatus]);

    // ── Promotion handler ────────────────────────────────────────────────────
    const handlePromotion = useCallback((piece: PromotionPiece) => {
        if (!promotionPending) return;
        executeMove(promotionPending.from, promotionPending.to, piece);
        setPromotionPending(null);
    }, [promotionPending, executeMove]);

    // ── Undo ─────────────────────────────────────────────────────────────────
    const handleUndo = useCallback(() => {
        if (historyStack.length === 0) return;
        const prevFen = historyStack[historyStack.length - 1];
        const prevGame = new Chess(prevFen);
        setGame(prevGame);
        setHistoryStack((prev) => prev.slice(0, -1));
        setMoveHistory((prev) => prev.slice(0, -1));
        setLastMove(null);
        setSelectedSquare(null);
        setLegalMoves([]);
        setActiveTimer(prevGame.turn());
        setGameStatus("playing");

        // Reverse captured piece
        setCapturedPieces((prev) => {
            const lastCapture = moveHistory[moveHistory.length - 1];
            if (!lastCapture?.captured) return prev;
            const color = lastCapture.color as "w" | "b";
            const pieces = [...prev[color]];
            const idx = pieces.lastIndexOf(lastCapture.captured as PieceSymbol);
            if (idx !== -1) pieces.splice(idx, 1);
            return { ...prev, [color]: pieces };
        });
    }, [historyStack, moveHistory]);

    // ── Resign ───────────────────────────────────────────────────────────────
    const handleResign = useCallback(() => {
        const winner = game.turn() === "w" ? "Black" : "White";
        setActiveTimer(null);
        setGameStatus("resigned");
        endGame(`${winner} wins! Opponent resigned.`);
        setShowResignDialog(false);
    }, [game, endGame]);

    // ── Render board ─────────────────────────────────────────────────────────
    const renderBoard = () => {
        const ranks = boardFlipped ? [...RANKS].reverse() : RANKS;
        const files = boardFlipped ? [...FILES].reverse() : FILES;

        return ranks.map((rank) =>
            files.map((file) => {
                const square = `${file}${rank}` as Square;
                const piece = game.get(square);
                const fileIdx = FILES.indexOf(file);
                const rankIdx = RANKS.indexOf(rank);
                const isLight = (fileIdx + rankIdx) % 2 === 0;
                const isSelected = selectedSquare === square;
                const isLegal = legalMoves.includes(square);
                const isLastFrom = lastMove?.from === square;
                const isLastTo = lastMove?.to === square;
                const isInCheck = game.isCheck() && piece?.type === "k" && piece.color === game.turn();
                const isAnimating = animatingSquare === square;

                return (
                    <div
                        key={square}
                        onClick={() => handleSquareClick(square)}
                        className={cn(
                            "relative flex items-center justify-center cursor-pointer select-none",
                            "transition-colors duration-150",
                            // Base square colors
                            isLight
                                ? "bg-[oklch(0.88_0.04_95)]"
                                : "bg-[oklch(0.52_0.08_150)]",
                            // Highlights
                            isSelected && "ring-2 ring-inset ring-yellow-400 bg-yellow-200/40",
                            (isLastFrom || isLastTo) && !isSelected && "bg-yellow-300/30",
                            isInCheck && "bg-red-500/70 ring-2 ring-red-500",
                            // Hover
                            "hover:brightness-110"
                        )}
                        style={{ aspectRatio: "1/1" }}
                    >
                        {/* Rank label (leftmost file) */}
                        {file === (boardFlipped ? "h" : "a") && (
                            <span className={cn(
                                "absolute top-0.5 left-1 text-[10px] sm:text-xs font-bold z-10 pointer-events-none leading-none",
                                isLight ? "text-[oklch(0.52_0.08_150)]" : "text-[oklch(0.88_0.04_95)]"
                            )}>
                                {rank}
                            </span>
                        )}
                        {/* File label (bottom rank) */}
                        {rank === (boardFlipped ? "8" : "1") && (
                            <span className={cn(
                                "absolute bottom-0.5 right-1 text-[10px] sm:text-xs font-bold z-10 pointer-events-none leading-none",
                                isLight ? "text-[oklch(0.52_0.08_150)]" : "text-[oklch(0.88_0.04_95)]"
                            )}>
                                {file}
                            </span>
                        )}

                        {/* Legal move indicator */}
                        {isLegal && (
                            <div className={cn(
                                "absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
                            )}>
                                {piece ? (
                                    <div className="absolute inset-0 ring-4 ring-inset ring-black/40 rounded-sm" />
                                ) : (
                                    <div className="w-[30%] h-[30%] rounded-full bg-black/20" />
                                )}
                            </div>
                        )}

                        {/* Piece */}
                        {piece && (
                            <span className={cn(
                                "relative z-20 flex items-center justify-center w-full h-full",
                                "text-3xl sm:text-4xl md:text-[2.5rem] leading-none",
                                "transition-transform duration-150",
                                isAnimating && "scale-110",
                                isSelected && "scale-110",
                                piece.color === "w"
                                    ? "text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.9),0_0_6px_rgba(0,0,0,0.5)]"
                                    : "text-[#1a1a1a] [text-shadow:0_1px_2px_rgba(255,255,255,0.4)]",
                                "cursor-pointer"
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
    // Derived
    // ─────────────────────────────────────────────────────────────────────────
    const currentTurn = game.turn();
    const isGameOver = ["checkmate", "stalemate", "draw", "resigned"].includes(gameStatus);
    const pairedMoves: [MoveHistory, MoveHistory | null][] = [];
    for (let i = 0; i < moveHistory.length; i += 2) {
        pairedMoves.push([moveHistory[i], moveHistory[i + 1] ?? null]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <TooltipProvider>
            <div className="min-h-screen bg-background text-foreground flex flex-col">

                {/* ── Header ── */}
                <header className="border-b border-border px-4 py-3 flex items-center justify-between bg-card sticky top-0 z-40">
                    <div className="flex items-center gap-3">
                        <GiChessKing className="text-3xl text-primary" />
                        <div>
                            <h1 className="text-lg font-bold tracking-tight leading-none">Chess</h1>
                            <p className="text-xs text-muted-foreground leading-none mt-0.5">vs Computer</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {gameStatus !== "idle" && (
                            <Badge
                                variant="outline"
                                className={cn(
                                    "text-xs font-semibold",
                                    gameStatus === "check" && "border-orange-500 text-orange-500 bg-orange-500/10",
                                    gameStatus === "checkmate" && "border-danger text-danger",
                                    gameStatus === "playing" && "border-primary text-primary",
                                )}
                            >
                                {gameStatus === "check" ? "⚠ Check!" :
                                    gameStatus === "checkmate" ? "Checkmate" :
                                        gameStatus === "stalemate" ? "Stalemate" :
                                            gameStatus === "draw" ? "Draw" :
                                                gameStatus === "resigned" ? "Resigned" :
                                                    currentTurn === "w" ? "White's Turn" : "Black's Turn"}
                            </Badge>
                        )}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => setSoundEnabled(v => !v)} className="h-8 w-8">
                                    {soundEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>{soundEnabled ? "Mute" : "Unmute"}</TooltipContent>
                        </Tooltip>
                    </div>
                </header>

                {/* ── Main layout ── */}
                <main className="flex-1 flex flex-col lg:flex-row gap-4 p-3 sm:p-4 max-w-[1400px] mx-auto w-full">

                    {/* ── Left panel (on desktop: sidebar; on mobile: above board) ── */}
                    <aside className="lg:w-64 xl:w-72 flex flex-row lg:flex-col gap-3 lg:gap-4 order-2 lg:order-1">

                        {/* Black player card */}
                        <div className={cn(
                            "flex-1 lg:flex-none bg-[var(--card)] rounded-xl border border-[var(--border)] p-3 transition-all",
                            currentTurn === "b" && gameStatus === "playing" && "border-[var(--primary)] shadow-lg shadow-[var(--primary)]/20"
                        )}>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gray-900 border-2 border-[var(--border)] flex items-center justify-center text-white text-xs font-bold">
                                        ♚
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm leading-none">Black</p>
                                        <p className="text-xs text-[var(--muted-foreground)]">Computer</p>
                                    </div>
                                </div>
                                <Clock seconds={blackTime} active={activeTimer === "b" && !isGameOver} />
                            </div>
                            <CapturedDisplay pieces={capturedPieces.w} color="w" />
                        </div>

                        {/* White player card */}
                        <div className={cn(
                            "flex-1 lg:flex-none bg-[var(--card)] rounded-xl border border-[var(--border)] p-3 transition-all",
                            currentTurn === "w" && gameStatus === "playing" && "border-[var(--primary)] shadow-lg shadow-[var(--primary)]/20"
                        )}>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-white border-2 border-[var(--border)] flex items-center justify-center text-gray-900 text-xs font-bold">
                                        ♔
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm leading-none">White</p>
                                        <p className="text-xs text-[var(--muted-foreground)]">{user?.username ?? "You"}</p>
                                    </div>
                                </div>
                                <Clock seconds={whiteTime} active={activeTimer === "w" && !isGameOver} />
                            </div>
                            <CapturedDisplay pieces={capturedPieces.b} color="b" />
                        </div>
                    </aside>

                    {/* ── Board + controls ── */}
                    <section className="flex-1 flex flex-col items-center gap-3 order-1 lg:order-2">

                        {/* Board wrapper */}
                        <div className="w-full max-w-[min(100%,600px)] relative">
                            {/* Board grid */}
                            <div
                                className={cn(
                                    "w-full grid grid-cols-8 rounded-xl overflow-hidden",
                                    "shadow-2xl border-2 border-[var(--border)]",
                                    "ring-1 ring-black/10"
                                )}
                                style={{ aspectRatio: "1/1" }}
                            >
                                {gameStatus === "idle" ? (
                                    // Start screen overlay
                                    <div className="col-span-8 row-span-8 flex flex-col items-center justify-center bg-[var(--card)] gap-6 p-8"
                                        style={{ gridRow: "1 / 9", gridColumn: "1 / 9" }}>
                                        <GiChessKing className="text-8xl text-[var(--primary)] drop-shadow-lg" />
                                        <div className="text-center">
                                            <h2 className="text-2xl font-bold mb-1">Ready to play?</h2>
                                            <p className="text-[var(--muted-foreground)] text-sm">10 minute game • Standard rules</p>
                                        </div>
                                        <Button onClick={startNewGame} size="lg" className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 px-10 text-lg font-bold">
                                            New Game
                                        </Button>
                                    </div>
                                ) : (
                                    renderBoard()
                                )}
                            </div>

                            {/* Promotion modal */}
                            {promotionPending && (
                                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center rounded-xl z-30">
                                    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-2xl">
                                        <p className="text-center text-sm font-semibold mb-4 text-[var(--muted-foreground)]">Choose promotion</p>
                                        <div className="flex gap-3">
                                            {(["q", "r", "b", "n"] as PromotionPiece[]).map((p) => {
                                                const color = game.turn() === "w" ? "w" : "b";
                                                const symbols: Record<string, string> = { q: "Queen", r: "Rook", b: "Bishop", n: "Knight" };
                                                return (
                                                    <button
                                                        key={p}
                                                        onClick={() => handlePromotion(p)}
                                                        className={cn(
                                                            "w-16 h-16 rounded-xl flex flex-col items-center justify-center gap-1",
                                                            "bg-[var(--muted)] hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)]",
                                                            "transition-all border border-[var(--border)] text-3xl font-bold"
                                                        )}
                                                    >
                                                        <span>{PIECE_UNICODE[`${color}${p.toUpperCase()}`]}</span>
                                                        <span className="text-[10px] font-normal">{symbols[p]}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 flex-wrap justify-center">
                            {gameStatus === "idle" ? (
                                <Button onClick={startNewGame} className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 font-bold">
                                    New Game
                                </Button>
                            ) : isGameOver ? (
                                <Button onClick={startNewGame} className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 font-bold">
                                    Play Again
                                </Button>
                            ) : (
                                <>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="outline" size="icon" onClick={handleUndo} disabled={historyStack.length === 0} className="border-[var(--border)]">
                                                <FaUndoAlt />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Undo move</TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="outline" size="icon" onClick={() => setBoardFlipped(v => !v)} className="border-[var(--border)]">
                                                <MdFlipCameraAndroid />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Flip board</TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="outline" size="sm" onClick={() => setShowDrawDialog(true)} className="border-[var(--border)] gap-1.5">
                                                <FaHandshake /> Draw
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Offer draw</TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="outline" size="sm" onClick={() => setShowResignDialog(true)}
                                                className="border-[var(--danger)] text-[var(--danger-foreground)] hover:bg-[var(--danger)] hover:text-white gap-1.5">
                                                <FaFlag /> Resign
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Resign game</TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="outline" size="sm" onClick={startNewGame} className="border-[var(--border)] gap-1.5">
                                                New Game
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Start a new game</TooltipContent>
                                    </Tooltip>
                                </>
                            )}
                        </div>
                    </section>

                    {/* ── Right panel: Move history ── */}
                    <aside className="lg:w-64 xl:w-72 order-3 bg-[var(--card)] rounded-xl border border-[var(--border)] flex flex-col overflow-hidden">
                        <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2">
                            <BsClockHistory className="text-[var(--primary)]" />
                            <h3 className="font-semibold text-sm">Move History</h3>
                            {moveHistory.length > 0 && (
                                <Badge variant="outline" className="ml-auto text-xs">{moveHistory.length} moves</Badge>
                            )}
                        </div>

                        <div
                            ref={moveHistoryRef}
                            className="flex-1 overflow-y-auto p-3 min-h-[200px] max-h-[300px] lg:max-h-none"
                        >
                            {pairedMoves.length === 0 ? (
                                <p className="text-[var(--muted-foreground)] text-sm text-center py-8">
                                    {gameStatus === "idle" ? "Start a game to see moves" : "No moves yet"}
                                </p>
                            ) : (
                                <table className="w-full text-sm">
                                    <tbody>
                                        {pairedMoves.map(([white, black], i) => (
                                            <tr key={i} className="hover:bg-[var(--accent)] rounded">
                                                <td className="text-[var(--muted-foreground)] w-8 pl-1 py-0.5 font-mono text-xs">{i + 1}.</td>
                                                <td className="py-0.5 px-1">
                                                    <MoveEntry move={white} isLast={!black && i === pairedMoves.length - 1} />
                                                </td>
                                                <td className="py-0.5 px-1">
                                                    {black && <MoveEntry move={black} isLast={i === pairedMoves.length - 1} />}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* FEN display */}
                        {gameStatus !== "idle" && (
                            <div className="px-3 py-2 border-t border-[var(--border)]">
                                <p className="text-[10px] text-[var(--muted-foreground)] mb-1 font-medium uppercase tracking-wide">FEN</p>
                                <p className="text-[10px] font-mono text-[var(--muted-foreground)] break-all leading-tight line-clamp-2">
                                    {game.fen()}
                                </p>
                            </div>
                        )}
                    </aside>
                </main>

                {/* ── Resign dialog ── */}
                <Dialog open={showResignDialog} onOpenChange={setShowResignDialog}>
                    <DialogContent className="sm:max-w-sm">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <FaFlag className="text-[var(--danger-foreground)]" /> Resign Game
                            </DialogTitle>
                            <DialogDescription>
                                Are you sure you want to resign? Your opponent will win the game.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex gap-3 mt-2">
                            <Button variant="outline" onClick={() => setShowResignDialog(false)} className="flex-1">
                                Cancel
                            </Button>
                            <Button onClick={handleResign} className="flex-1 bg-[var(--danger)] text-white hover:opacity-90">
                                Resign
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* ── Draw dialog ── */}
                <Dialog open={showDrawDialog} onOpenChange={setShowDrawDialog}>
                    <DialogContent className="sm:max-w-sm">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <FaHandshake className="text-[var(--primary)]" /> Offer Draw
                            </DialogTitle>
                            <DialogDescription>
                                Offering a draw will end the game as a tie. Both players must agree.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex gap-3 mt-2">
                            <Button variant="outline" onClick={() => setShowDrawDialog(false)} className="flex-1">
                                Cancel
                            </Button>
                            <Button onClick={() => {
                                setShowDrawDialog(false);
                                endGame("Game drawn by agreement");
                                setGameStatus("draw");
                            }} className="flex-1 bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90">
                                Accept Draw
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* ── Game result dialog ── */}
                <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
                    <DialogContent className="sm:max-w-sm text-center">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold">Game Over</DialogTitle>
                            <DialogDescription className="text-base font-medium text-[var(--foreground)] pt-2">
                                {gameResult}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col gap-3 mt-4">
                            <div className="text-sm text-[var(--muted-foreground)]">
                                {moveHistory.length} moves played
                            </div>
                            <Button onClick={startNewGame} className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 font-bold text-base py-5">
                                Play Again
                            </Button>
                            <Button variant="outline" onClick={() => setShowResultDialog(false)}>
                                Review Game
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

            </div>
        </TooltipProvider>
    );
}