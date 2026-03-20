"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Chess, Square, Move } from "chess.js";
import {
    Flag, Handshake, Settings, ChevronLeft, ChevronRight,
    MoreHorizontal, Plus, Send, Smile, Image as ImageIcon,
    ChevronsLeft, ChevronsRight, X, Volume2, Monitor, Eye
} from "lucide-react";

// --- Types ---
type Player = "w" | "b";
type TimeControl = { w: number; b: number };
type ChatMessage = { id: string; sender: "me" | "opponent" | "system"; type: "text" | "emoji" | "gif"; content: string };
type PromotionData = { from: Square; to: Square } | null;

// Mock GIFs for the picker
const MOCK_GIFS = [
    "https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif", // Thinking
    "https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif", // Hello
    "https://media.giphy.com/media/11ISwbgCxEzMyY/giphy.gif",     // Shocked
];

export default function ChessPlayPage() {
    // Game State
    const [game, setGame] = useState<Chess>(new Chess());
    const [boardFen, setBoardFen] = useState(game.fen());
    const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
    const [possibleMoves, setPossibleMoves] = useState<Move[]>([]);

    // History & Navigation
    const [moveHistory, setMoveHistory] = useState<Move[]>([]);
    const [historyFens, setHistoryFens] = useState<string[]>([game.fen()]);
    const [currentHistoryIndex, setCurrentHistoryIndex] = useState<number>(0);

    // Modals & Overlays
    const [isGameOver, setIsGameOver] = useState<boolean>(false);
    const [gameStatus, setGameStatus] = useState<string>("Game on");
    const [pendingPromotion, setPendingPromotion] = useState<PromotionData>(null);
    const [showSettings, setShowSettings] = useState(false);
    const [activeTab, setActiveTab] = useState<"moves" | "chat">("moves");

    // Chat State
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([{ id: "1", sender: "system", type: "text", content: "Match started. Good luck!" }]);
    const [chatInput, setChatInput] = useState("");
    const [showGifPicker, setShowGifPicker] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Settings State
    const [settings, setSettings] = useState({ sound: true, showCoords: true, autoQueen: false });

    // Timers
    const [timers, setTimers] = useState<TimeControl>({ w: 600, b: 600 });
    const isViewingHistory = currentHistoryIndex < historyFens.length - 1;

    // --- Helpers ---
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? "0" : ""}${s}`;
    };

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (activeTab === "chat") scrollToBottom();
    }, [chatMessages, activeTab]);

    // Timer Countdown
    useEffect(() => {
        if (isGameOver || isViewingHistory) return;
        const interval = setInterval(() => {
            setTimers((prev) => {
                const turn = game.turn();
                if (prev[turn] <= 0) {
                    setIsGameOver(true);
                    setGameStatus(`${turn === "w" ? "Black" : "White"} wins on time`);
                    return prev;
                }
                return { ...prev, [turn]: prev[turn] - 1 };
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [game, isGameOver, isViewingHistory]);

    // --- Move Logic ---
    const executeMove = (moveData: { from: string, to: string, promotion?: string }) => {
        try {
            const move = game.move(moveData);
            const newFen = game.fen();

            setBoardFen(newFen);
            setMoveHistory(game.history({ verbose: true }) as Move[]);

            const newFens = [...historyFens.slice(0, currentHistoryIndex + 1), newFen];
            setHistoryFens(newFens);
            setCurrentHistoryIndex(newFens.length - 1);

            setSelectedSquare(null);
            setPossibleMoves([]);
            setPendingPromotion(null);

            if (game.isCheckmate()) {
                setIsGameOver(true);
                setGameStatus(`Checkmate! ${game.turn() === "w" ? "Black" : "White"} wins.`);
            } else if (game.isDraw() || game.isStalemate()) {
                setIsGameOver(true);
                setGameStatus("Draw");
            }
        } catch (e) {
            console.error("Invalid move", e);
        }
    };

    const handleSquareClick = useCallback((square: Square) => {
        if (isGameOver) return;

        // Snap to present if interacting while viewing history
        if (isViewingHistory) {
            setCurrentHistoryIndex(historyFens.length - 1);
            setBoardFen(historyFens[historyFens.length - 1]);
            return;
        }

        const piece = game.get(square);
        const isCurrentTurn = piece && piece.color === game.turn();

        if (selectedSquare) {
            // Check for promotion
            const moves = game.moves({ verbose: true }) as Move[];
            const isPromotionMove = moves.some(m => m.from === selectedSquare && m.to === square && m.promotion);

            if (isPromotionMove) {
                if (settings.autoQueen) {
                    executeMove({ from: selectedSquare, to: square, promotion: "q" });
                } else {
                    setPendingPromotion({ from: selectedSquare, to: square });
                }
                return;
            }

            // Try normal move
            try {
                executeMove({ from: selectedSquare, to: square });
            } catch (e) {
                if (isCurrentTurn) {
                    setSelectedSquare(square);
                    setPossibleMoves(game.moves({ square, verbose: true }) as Move[]);
                } else {
                    setSelectedSquare(null);
                    setPossibleMoves([]);
                }
            }
        } else {
            if (isCurrentTurn) {
                setSelectedSquare(square);
                setPossibleMoves(game.moves({ square, verbose: true }) as Move[]);
            }
        }
    }, [game, selectedSquare, isGameOver, isViewingHistory, historyFens, settings.autoQueen]);

    // --- Navigation ---
    const navigateHistory = (direction: "start" | "prev" | "next" | "end") => {
        let newIndex = currentHistoryIndex;
        if (direction === "start") newIndex = 0;
        else if (direction === "prev") newIndex = Math.max(0, currentHistoryIndex - 1);
        else if (direction === "next") newIndex = Math.min(historyFens.length - 1, currentHistoryIndex + 1);
        else if (direction === "end") newIndex = historyFens.length - 1;

        setCurrentHistoryIndex(newIndex);
        setBoardFen(historyFens[newIndex]);
        setSelectedSquare(null);
        setPossibleMoves([]);
    };

    // --- Chat ---
    const sendChat = (type: "text" | "emoji" | "gif", content: string) => {
        if (!content.trim()) return;
        const newMsg: ChatMessage = { id: Date.now().toString(), sender: "me", type, content };
        setChatMessages(prev => [...prev, newMsg]);
        setChatInput("");
        setShowGifPicker(false);

        // Mock opponent response
        if (type === "text") {
            setTimeout(() => {
                setChatMessages(prev => [...prev, { id: Date.now().toString(), sender: "opponent", type: "text", content: "Good move!" }]);
            }, 2000);
        }
    };

    const resetGame = () => {
        const newGame = new Chess();
        setGame(newGame);
        setBoardFen(newGame.fen());
        setMoveHistory([]);
        setHistoryFens([newGame.fen()]);
        setCurrentHistoryIndex(0);
        setSelectedSquare(null);
        setPossibleMoves([]);
        setIsGameOver(false);
        setTimers({ w: 600, b: 600 });
        setGameStatus("Game on");
        setChatMessages([{ id: Date.now().toString(), sender: "system", type: "text", content: "New match started." }]);
    };

    // Get board array from current FEN state (allows viewing history properly)
    const tempGame = new Chess(boardFen);
    const board = tempGame.board();

    // Move Pairs for Sidebar
    const movePairs = [];
    for (let i = 0; i < moveHistory.length; i += 2) {
        movePairs.push({ white: moveHistory[i], black: moveHistory[i + 1] || null });
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-start p-2 md:p-6 lg:p-8 font-sans">
            <div className="w-full max-w-[1400px] flex flex-col lg:flex-row gap-4 lg:gap-8">

                {/* --- LEFT: CHESSBOARD --- */}
                <div className="flex-1 flex flex-col items-center justify-center w-full">

                    {/* Opponent Top Bar */}
                    <div className="w-full max-w-[min(100vw-1rem,700px)] flex justify-between items-center bg-card text-card-foreground p-3 rounded-t-lg border border-border border-b-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Opponent`} alt="Opponent" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm leading-tight">GrandmasterBot</h3>
                                <span className="text-xs text-muted-foreground">Rating: 2500</span>
                            </div>
                        </div>
                        <div className={`px-4 py-2 rounded-md font-mono text-xl font-bold ${game.turn() === 'b' && !isGameOver ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                            {formatTime(timers.b)}
                        </div>
                    </div>

                    {/* Board Container */}
                    <div className="w-full max-w-[min(100vw-1rem,700px)] aspect-square bg-border relative shadow-2xl flex flex-col">
                        {board.map((row, rowIndex) => (
                            <div key={rowIndex} className="flex-1 flex flex-row">
                                {row.map((piece, colIndex) => {
                                    const file = String.fromCharCode(97 + colIndex);
                                    const rank = 8 - rowIndex;
                                    const square = `${file}${rank}` as Square;

                                    const isDark = (rowIndex + colIndex) % 2 === 1;
                                    const isSelected = selectedSquare === square;
                                    const isPossibleMove = possibleMoves.some(m => m.to === square);
                                    const isLastMove = !isViewingHistory && moveHistory.length > 0 &&
                                        (moveHistory[moveHistory.length - 1].from === square || moveHistory[moveHistory.length - 1].to === square);

                                    let bgClass = isDark ? "bg-[#739552]" : "bg-[#ebecd0]";
                                    if (isSelected) bgClass = "bg-[#f4f680]";
                                    else if (isLastMove) bgClass = isDark ? "bg-[#aab55d]" : "bg-[#cdd26a]";

                                    return (
                                        <div
                                            key={square}
                                            onClick={() => handleSquareClick(square)}
                                            className={`flex-1 relative flex items-center justify-center cursor-pointer transition-colors ${bgClass}`}
                                        >
                                            {settings.showCoords && colIndex === 0 && <span className={`absolute top-1 left-1 text-[10px] font-bold ${isDark ? "text-[#ebecd0]" : "text-[#739552]"}`}>{rank}</span>}
                                            {settings.showCoords && rowIndex === 7 && <span className={`absolute bottom-0.5 right-1 text-[10px] font-bold ${isDark ? "text-[#ebecd0]" : "text-[#739552]"}`}>{file}</span>}

                                            {isPossibleMove && (
                                                <div className={`absolute rounded-full z-10 ${piece ? 'w-full h-full border-4 border-black/20' : 'w-1/3 h-1/3 bg-black/20'}`} />
                                            )}

                                            {piece && (
                                                <img
                                                    src={`https://upload.wikimedia.org/wikipedia/commons/${piece.color === 'w'
                                                        ? { p: '4/45/Chess_plt45.svg', n: '7/70/Chess_nlt45.svg', b: 'b/b1/Chess_blt45.svg', r: '7/72/Chess_rlt45.svg', q: '1/15/Chess_qlt45.svg', k: '4/42/Chess_klt45.svg' }[piece.type]
                                                        : { p: 'c/c7/Chess_pdt45.svg', n: 'e/ed/Chess_ndt45.svg', b: '9/98/Chess_bdt45.svg', r: 'f/ff/Chess_rdt45.svg', q: '4/47/Chess_qdt45.svg', k: 'f/f0/Chess_kdt45.svg' }[piece.type]}`}
                                                    alt={`${piece.color} ${piece.type}`}
                                                    className="w-full h-full drop-shadow-md select-none pointer-events-none z-0"
                                                    draggable={false}
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}

                        {/* Promotion Overlay */}
                        {pendingPromotion && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20 backdrop-blur-sm">
                                <div className="bg-card p-4 rounded-xl flex gap-2 shadow-2xl border border-border">
                                    {['q', 'r', 'b', 'n'].map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => executeMove({ from: pendingPromotion.from, to: pendingPromotion.to, promotion: p })}
                                            className="w-16 h-16 bg-muted hover:bg-accent rounded-md flex items-center justify-center transition-colors"
                                        >
                                            <img
                                                src={`https://upload.wikimedia.org/wikipedia/commons/${game.turn() === 'w'
                                                    ? { n: '7/70/Chess_nlt45.svg', b: 'b/b1/Chess_blt45.svg', r: '7/72/Chess_rlt45.svg', q: '1/15/Chess_qlt45.svg' }[p as any]
                                                    : { n: 'e/ed/Chess_ndt45.svg', b: '9/98/Chess_bdt45.svg', r: 'f/ff/Chess_rdt45.svg', q: '4/47/Chess_qdt45.svg' }[p as any]}`}
                                                alt={p} className="w-12 h-12"
                                            />
                                        </button>
                                    ))}
                                    <button onClick={() => setPendingPromotion(null)} className="absolute -top-3 -right-3 bg-danger text-danger-foreground rounded-full p-1 shadow-md">
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Game Over Overlay */}
                        {isGameOver && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 backdrop-blur-sm">
                                <div className="bg-card text-card-foreground p-6 rounded-xl shadow-2xl flex flex-col items-center border border-border">
                                    <h2 className="text-2xl font-bold mb-2">Game Over</h2>
                                    <p className="text-muted-foreground mb-6">{gameStatus}</p>
                                    <button onClick={resetGame} className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors flex items-center gap-2">
                                        <Plus size={18} /> Rematch
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Player Bottom Bar */}
                    <div className="w-full max-w-[min(100vw-1rem,700px)] flex justify-between items-center bg-card text-card-foreground p-3 rounded-b-lg border border-border border-t-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=You`} alt="You" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm leading-tight">GuestPlayer</h3>
                                <span className="text-xs text-muted-foreground">Rating: 1200</span>
                            </div>
                        </div>
                        <div className={`px-4 py-2 rounded-md font-mono text-xl font-bold ${game.turn() === 'w' && !isGameOver ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                            {formatTime(timers.w)}
                        </div>
                    </div>
                </div>

                {/* --- RIGHT: SIDEBAR --- */}
                <div className="w-full lg:w-[350px] xl:w-[400px] h-[450px] lg:h-auto min-h-[550px] bg-card text-card-foreground border border-border rounded-lg flex flex-col shadow-lg overflow-hidden shrink-0 mt-4 lg:mt-0 relative">

                    {/* Tabs */}
                    <div className="flex border-b border-border bg-muted/30">
                        <button onClick={() => setActiveTab("moves")} className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'moves' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}>Moves</button>
                        <button onClick={() => setActiveTab("chat")} className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'chat' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}>Chat</button>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-hidden relative">

                        {/* Moves Tab */}
                        {activeTab === "moves" && (
                            <div className="h-full overflow-y-auto p-0 font-mono text-sm bg-background/50">
                                {movePairs.length === 0 ? (
                                    <div className="h-full flex items-center justify-center text-muted-foreground text-sm p-4 text-center">
                                        Waiting for the first move...
                                    </div>
                                ) : (
                                    <div className="flex flex-col w-full pb-4">
                                        {movePairs.map((pair, index) => {
                                            const whiteIndex = index * 2 + 1;
                                            const blackIndex = index * 2 + 2;
                                            return (
                                                <div key={index} className="flex flex-row hover:bg-muted/50 transition-colors even:bg-muted/20">
                                                    <div className="w-12 py-2 text-center text-muted-foreground border-r border-border/50 bg-card/50">
                                                        {index + 1}.
                                                    </div>
                                                    <div onClick={() => { setCurrentHistoryIndex(whiteIndex); setBoardFen(historyFens[whiteIndex]); }}
                                                        className={`flex-1 py-2 px-4 font-semibold cursor-pointer ${currentHistoryIndex === whiteIndex ? 'bg-primary/20 text-primary' : 'text-foreground hover:bg-accent/50'}`}>
                                                        {pair.white.san}
                                                    </div>
                                                    <div onClick={() => { if (pair.black) { setCurrentHistoryIndex(blackIndex); setBoardFen(historyFens[blackIndex]); } }}
                                                        className={`flex-1 py-2 px-4 font-semibold cursor-pointer ${currentHistoryIndex === blackIndex ? 'bg-primary/20 text-primary' : 'text-foreground hover:bg-accent/50'}`}>
                                                        {pair.black ? pair.black.san : ""}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Chat Tab */}
                        {activeTab === "chat" && (
                            <div className="h-full flex flex-col bg-background/50">
                                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                                    {chatMessages.map(msg => (
                                        <div key={msg.id} className={`flex flex-col max-w-[85%] ${msg.sender === 'system' ? 'mx-auto items-center' : msg.sender === 'me' ? 'self-end items-end' : 'self-start items-start'}`}>
                                            {msg.sender === 'system' ? (
                                                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">{msg.content}</span>
                                            ) : (
                                                <div className={`p-2.5 rounded-2xl ${msg.sender === 'me' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted text-foreground rounded-tl-sm'}`}>
                                                    {msg.type === 'text' && <p className="text-sm">{msg.content}</p>}
                                                    {msg.type === 'emoji' && <p className="text-2xl">{msg.content}</p>}
                                                    {msg.type === 'gif' && <img src={msg.content} alt="gif" className="rounded-md max-w-full w-32 object-cover" />}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    <div ref={chatEndRef} />
                                </div>

                                {/* Chat Input Area */}
                                <div className="p-3 border-t border-border bg-card relative">
                                    {showGifPicker && (
                                        <div className="absolute bottom-full left-0 mb-2 w-full bg-popover border border-border p-2 rounded-lg shadow-xl flex gap-2 overflow-x-auto z-10">
                                            {MOCK_GIFS.map((g, i) => (
                                                <img key={i} src={g} alt="gif" className="h-16 w-24 object-cover rounded cursor-pointer hover:opacity-80" onClick={() => sendChat("gif", g)} />
                                            ))}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => sendChat("emoji", "👍")} className="text-muted-foreground hover:text-primary transition-colors"><Smile size={20} /></button>
                                        <button onClick={() => setShowGifPicker(!showGifPicker)} className="text-muted-foreground hover:text-primary transition-colors"><ImageIcon size={20} /></button>
                                        <input
                                            type="text" value={chatInput} onChange={e => setChatInput(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && sendChat("text", chatInput)}
                                            placeholder="Message..."
                                            className="flex-1 bg-muted border-none rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                                        />
                                        <button onClick={() => sendChat("text", chatInput)} className="text-primary hover:text-primary/80 transition-colors"><Send size={20} /></button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Navigation & Actions Toolbar */}
                    <div className="p-3 border-t border-border bg-card">
                        <div className="flex items-center justify-between mb-3 bg-muted/50 rounded-lg p-1">
                            <button onClick={() => navigateHistory("start")} disabled={currentHistoryIndex === 0} className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"><ChevronsLeft size={20} /></button>
                            <button onClick={() => navigateHistory("prev")} disabled={currentHistoryIndex === 0} className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"><ChevronLeft size={20} /></button>
                            <button onClick={() => navigateHistory("next")} disabled={currentHistoryIndex === historyFens.length - 1} className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"><ChevronRight size={20} /></button>
                            <button onClick={() => navigateHistory("end")} disabled={currentHistoryIndex === historyFens.length - 1} className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"><ChevronsRight size={20} /></button>
                            <div className="w-px h-6 bg-border mx-1" />
                            <button onClick={() => setShowSettings(true)} className="p-2 text-muted-foreground hover:text-foreground transition-colors"><Settings size={20} /></button>
                            <button className="p-2 text-muted-foreground hover:text-foreground transition-colors"><MoreHorizontal size={20} /></button>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => { setIsGameOver(true); setGameStatus("Draw by agreement"); }} className="flex-1 py-2.5 flex items-center justify-center gap-2 bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground font-semibold rounded-md transition-colors text-sm">
                                <Handshake size={16} /> Draw
                            </button>
                            <button onClick={() => { setIsGameOver(true); setGameStatus("You resigned"); }} className="flex-1 py-2.5 flex items-center justify-center gap-2 bg-danger text-danger-foreground hover:bg-danger/90 font-semibold rounded-md transition-colors text-sm">
                                <Flag size={16} /> Resign
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            {/* --- SETTINGS DIALOG --- */}
            {showSettings && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-popover text-popover-foreground w-full max-w-md rounded-xl shadow-2xl border border-border overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-border bg-card">
                            <h2 className="text-lg font-bold flex items-center gap-2"><Settings size={20} /> Settings</h2>
                            <button onClick={() => setShowSettings(false)} className="text-muted-foreground hover:text-foreground bg-muted p-1 rounded-md"><X size={18} /></button>
                        </div>
                        <div className="p-6 flex flex-col gap-6">

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Volume2 size={20} className="text-primary" />
                                    <div>
                                        <p className="font-semibold text-sm">Sound Effects</p>
                                        <p className="text-xs text-muted-foreground">Play sounds for moves & captures</p>
                                    </div>
                                </div>
                                <button onClick={() => setSettings(s => ({ ...s, sound: !s.sound }))} className={`w-11 h-6 rounded-full flex items-center p-1 transition-colors ${settings.sound ? 'bg-primary' : 'bg-muted border border-border'}`}>
                                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.sound ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Eye size={20} className="text-primary" />
                                    <div>
                                        <p className="font-semibold text-sm">Show Coordinates</p>
                                        <p className="text-xs text-muted-foreground">Display rank and file labels</p>
                                    </div>
                                </div>
                                <button onClick={() => setSettings(s => ({ ...s, showCoords: !s.showCoords }))} className={`w-11 h-6 rounded-full flex items-center p-1 transition-colors ${settings.showCoords ? 'bg-primary' : 'bg-muted border border-border'}`}>
                                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.showCoords ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Monitor size={20} className="text-primary" />
                                    <div>
                                        <p className="font-semibold text-sm">Auto-Queen Promotion</p>
                                        <p className="text-xs text-muted-foreground">Skip dialog and promote to Queen</p>
                                    </div>
                                </div>
                                <button onClick={() => setSettings(s => ({ ...s, autoQueen: !s.autoQueen }))} className={`w-11 h-6 rounded-full flex items-center p-1 transition-colors ${settings.autoQueen ? 'bg-primary' : 'bg-muted border border-border'}`}>
                                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.autoQueen ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}