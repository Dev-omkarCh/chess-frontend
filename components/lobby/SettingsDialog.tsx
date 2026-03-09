"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getPieceSet } from "@/lib/pieces-registry";

// --- DATA ---

type BoardTheme = {
    id: string;
    label: string;
    light: string;
    dark: string;
};

type PieceSet = {
    id: string;
    label: string;
    preview: string; // emoji stand-in; swap for <Image> if you have real assets
    available: boolean;
};

type Preset = {
    id: string;
    label: string;
    board: string;
    pieces: string;
};

const BOARD_THEMES: BoardTheme[] = [
    { id: "green", label: "Green", light: "#EEEED2", dark: "#769656" },
    { id: "wood", label: "Wood", light: "#F0D9B5", dark: "#B58863" },
    { id: "blue", label: "Blue", light: "#DEE3E6", dark: "#8CA2AD" },
    { id: "tan", label: "Tan", light: "#F0D9B5", dark: "#B58863" },
    { id: "classic", label: "Classic", light: "#F5F5DC", dark: "#8B6914" },
    { id: "slate", label: "Slate", light: "#C9D8D8", dark: "#6B8E8E" },
    { id: "marble", label: "Marble", light: "#E8E8E8", dark: "#9E9E9E" },
    { id: "walnut", label: "Walnut", light: "#D4A96A", dark: "#7B4D2E" },
    { id: "linen", label: "Linen", light: "#F0EAD6", dark: "#A0785A" },
    { id: "orange", label: "Orange", light: "#F4A261", dark: "#E76F51" },
    { id: "emerald", label: "Emerald", light: "#A8D5A2", dark: "#2D6A4F" },
    { id: "steel", label: "Steel", light: "#D0D0D0", dark: "#707070" },
    { id: "purple", label: "Purple", light: "#D8C7F0", dark: "#7B5EA7" },
    { id: "gray", label: "Gray", light: "#CCCCCC", dark: "#888888" },
    { id: "coral", label: "Coral", light: "#FFB5B5", dark: "#C0392B" },
    { id: "sand", label: "Sand", light: "#F5DEB3", dark: "#C8A45A" },
    { id: "midnight", label: "Midnight", light: "#B0C4DE", dark: "#1C3A5E" },
    { id: "forest", label: "Forest", light: "#C8DEB0", dark: "#2D5016" },
    { id: "wine", label: "Wine", light: "#D4A0A0", dark: "#722F37" },
    { id: "bluewhite", label: "Blue-White", light: "#FFFFFF", dark: "#4169E1" },
    { id: "pink", label: "Pink", light: "#FFB6C1", dark: "#FF69B4" },
    { id: "crimson", label: "Crimson", light: "#F5A0A0", dark: "#8B0000" },
    { id: "birch", label: "Birch", light: "#E8D8C0", dark: "#C8A870" },
    { id: "silver", label: "Silver", light: "#E8E8E8", dark: "#A8A8A8" },
    { id: "charcoal", label: "Charcoal", light: "#C0C0C0", dark: "#404040" },
];

const PIECE_SETS: PieceSet[] = [
    { id: "standard", label: "Standard", preview: "♛", available: true },
    { id: "neo", label: "Neo", preview: "♛", available: true },
    { id: "space", label: "Space", preview: "♛", available: true },
    { id: "wood", label: "Wood", preview: "♛", available: false },
    { id: "glass", label: "Glass", preview: "♛", available: false },
    { id: "marble", label: "Marble", preview: "♛", available: false },
    { id: "modern", label: "Modern", preview: "♛", available: false },
    { id: "classic", label: "Classic", preview: "♛", available: true },
    { id: "metal", label: "Metal", preview: "♛", available: false },
    { id: "fantasy", label: "Fantasy", preview: "♛", available: false },
    { id: "minimal", label: "Minimal", preview: "♛", available: false },
];

const PRESETS: Preset[] = [
    { id: "classic", label: "Classic", board: "green", pieces: "neo" },
    { id: "tournament", label: "Tournament", board: "wood", pieces: "standard" },
    { id: "cool", label: "Cool", board: "blue", pieces: "space" },
    { id: "luxury", label: "Luxury", board: "midnight", pieces: "classic" },
];

// --- MINI CHESS BOARD PREVIEW ---
// Shows a 3×3 slice of the board (ranks 6-8, files a-c) with a few pieces


function ChessBoardPreview({ boardId, pieceSet }: { boardId: string, pieceSet: string }) {
    const theme = BOARD_THEMES.find((t) => t.id === boardId) ?? BOARD_THEMES[1];

    const piece = getPieceSet(pieceSet);

    const PREVIEW_SQUARES: (string | null)[][] = [
        // rank 8 (top row): bishop, queen, pawn
        [piece.bishop.black, piece.queen.black, piece.pawn.black],
        // rank 7 (middle): empty
        [null, null, null],
        // rank 6 (bottom): knight, queen (white), rook
        [piece.bishop.white, piece.queen.white, piece.pawn.white],
    ];

    return (
        <div
            className="rounded-md overflow-hidden border border-border shadow-lg"
            style={{ width: 200, height: 200 }}
        >
            {/* Rank numbers + squares */}
            <div className="grid grid-rows-3 relative" style={{ width: 200, height: 200 }}>
                {PREVIEW_SQUARES.map((row, ri) => (
                    <div key={ri} className="flex grid-rows-2">
                        {/* Rank label */}
                        {/* <div
                            className="flex bg-transparent items-center justify-center text-xs font-semibold select-none absolute left-0 top-0"
                            style={{
                                width: 18,
                                height: "100%",
                                color: ri % 2 === 0 ? theme.dark : theme.light,
                                background: ri % 2 === 0 ? theme.light : theme.dark,
                            }}
                        >
                            {8 - ri}
                        </div> */}
                        {/* 3 squares */}
                        {row.map((piece, ci) => {
                            const isLight = (ri + ci) % 2 === 0;
                            const bg = isLight ? theme.light : theme.dark;
                            const isWhitePiece = ri === 2; // bottom row = white pieces
                            return (
                                <div
                                    key={ci}
                                    className="flex items-center justify-center select-none"
                                    style={{
                                        flex: 1,
                                        background: bg,
                                        fontSize: 32,
                                        color: isWhitePiece ? "#F5D78B" : "#3a3a3a",
                                        textShadow: isWhitePiece
                                            ? "0 1px 2px rgba(0,0,0,0.6)"
                                            : "0 1px 2px rgba(255,255,255,0.15)",
                                    }}
                                >
                                    {
                                        piece && (
                                            <img
                                                src={piece}
                                                alt="piece"
                                                className="object-contain h-16 w-16"
                                            />
                                        )
                                    }
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div >
    );
}

// --- BOARD SWATCH ---
function BoardSwatch({
    theme,
    selected,
    onClick,
}: {
    theme: BoardTheme;
    selected: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "relative rounded overflow-hidden transition-all duration-150",
                "hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                selected && "ring-2 ring-primary ring-offset-1 ring-offset-card"
            )}
            style={{ width: 56, height: 56 }}
            title={theme.label}
        >
            {/* 2×2 mini board */}
            <div className="grid grid-cols-2 w-full h-full">
                <div style={{ background: theme.light }} />
                <div style={{ background: theme.dark }} />
                <div style={{ background: theme.dark }} />
                <div style={{ background: theme.light }} />
            </div>
            {selected && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <div className="rounded-full bg-primary w-6 h-6 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={3} />
                    </div>
                </div>
            )}
        </button>
    );
}

// --- TABS ---
type Tab = "Boards" | "Pieces" | "Presets";

// --- MAIN DIALOG ---
export default function BoardSettingsDialog({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose?: () => void;
}) {
    const [activeTab, setActiveTab] = useState<Tab>("Boards");
    const [selectedBoard, setSelectedBoard] = useState("wood");
    const [selectedPieces, setSelectedPieces] = useState("standard");
    const [selectedBg, setSelectedBg] = useState("dark");
    const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
    const [showCoords, setShowCoords] = useState(true);
    const [coordPos, setCoordPos] = useState<"inside" | "outside">("inside");

    // Pending state (user hasn't saved yet)
    const [pendingBoard, setPendingBoard] = useState(selectedBoard);
    const [pendingPieces, setPendingPieces] = useState(selectedPieces);
    const [pendingBg, setPendingBg] = useState(selectedBg);

    const handleSave = () => {
        setSelectedBoard(pendingBoard);
        setSelectedPieces(pendingPieces);
        setSelectedBg(pendingBg);
        onClose?.();
    };

    const handleCancel = () => {
        setPendingBoard(selectedBoard);
        setPendingPieces(selectedPieces);
        setPendingBg(selectedBg);
        onClose?.();
    };

    const applyPreset = (preset: Preset) => {
        setSelectedPreset(preset.id);
        setPendingBoard(preset.board);
        setPendingPieces(preset.pieces);
    };

    const TABS: Tab[] = ["Boards", "Pieces", "Presets"];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div
                className="bg-card text-card-foreground rounded-xl shadow-2xl border border-border w-full max-w-2xl"
                style={{ maxHeight: "90vh", overflowY: "auto" }}
            >
                {/* Header */}
                <div className="flex items-start justify-between p-6 pb-2">
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Board &amp; Pieces</h2>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Customize the look and feel of your chess set.
                        </p>
                    </div>
                    <button
                        onClick={handleCancel}
                        className="text-muted-foreground hover:text-foreground transition-colors rounded-md p-1 hover:bg-accent"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="px-6 mt-3 border-b border-border">
                    <div className="flex gap-0">
                        {TABS.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "px-4 py-2.5 text-sm font-medium transition-all duration-150 border-b-2 -mb-px",
                                    activeTab === tab
                                        ? "border-primary text-foreground"
                                        : "border-transparent text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 flex gap-6 md:flex-row flex-col-reverse">
                    {/* Left: options panel */}
                    <div className="flex-1 min-w-0">
                        {activeTab === "Boards" && (
                            <div
                                className="grid gap-2 overflow-y-auto pr-1"
                                style={{
                                    gridTemplateColumns: "repeat(auto-fill, minmax(56px, 1fr))",
                                    maxHeight: 320,
                                }}
                            >
                                {BOARD_THEMES.map((theme) => (
                                    <BoardSwatch
                                        key={theme.id}
                                        theme={theme}
                                        selected={pendingBoard === theme.id}
                                        onClick={() => setPendingBoard(theme.id)}
                                    />
                                ))}
                            </div>
                        )}

                        {activeTab === "Pieces" && (
                            <div className="grid grid-cols-4 gap-2 overflow-y-auto" style={{ maxHeight: 320 }}>
                                {PIECE_SETS.map((ps) => (
                                    <button
                                        key={ps.id}
                                        disabled={!ps.available}
                                        onClick={() => setPendingPieces(ps.id)}
                                        className={cn(
                                            "rounded-lg border border-border p-3 flex flex-col items-center gap-1 transition-all",
                                            "hover:bg-accent hover:border-primary/50 focus:outline-none relative",
                                            pendingPieces === ps.id && "border-primary bg-accent ring-1 ring-primary",
                                            !ps.available && "opacity-50 cursor-not-allowed"
                                        )}
                                    >
                                        <span className="text-3xl">{ps.preview}</span>
                                        <span className="text-xs text-muted-foreground">{ps.label}</span>
                                        {pendingPieces === ps.id && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                <div className="rounded-full bg-primary w-6 h-6 flex items-center justify-center">
                                                    <Check className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={3} />
                                                </div>
                                            </div>
                                        )}
                                    </button>

                                ))}
                            </div>
                        )}

                        {activeTab === "Presets" && (
                            <div className="grid grid-cols-2 gap-3" style={{ maxHeight: 320, overflowY: "auto" }}>
                                {PRESETS.map((preset) => {
                                    const boardTheme =
                                        BOARD_THEMES.find((t) => t.id === preset.board) ?? BOARD_THEMES[1];
                                    return (
                                        <button
                                            key={preset.id}
                                            onClick={() => applyPreset(preset)}
                                            className={cn(
                                                "rounded-lg border p-3 flex flex-col items-center gap-2 transition-all focus:outline-none hover:bg-accent",
                                                selectedPreset === preset.id
                                                    ? "border-primary ring-1 ring-primary bg-accent"
                                                    : "border-border"
                                            )}
                                        >
                                            {/* mini board preview */}
                                            <div
                                                className="rounded overflow-hidden"
                                                style={{ width: 48, height: 48 }}
                                            >
                                                <div className="grid grid-cols-2 w-full h-full relative">
                                                    <div style={{ background: boardTheme.light }} />
                                                    <div style={{ background: boardTheme.dark }} />
                                                    <div style={{ background: boardTheme.dark }} />
                                                    <div style={{ background: boardTheme.light }} />
                                                    {selectedPreset === preset.id && (
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                            <div className="rounded-full bg-primary w-6 h-6 flex items-center justify-center">
                                                                <Check className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={3} />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <span className="text-xs font-medium text-card-foreground">
                                                {preset.label}
                                            </span>

                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="flex gap-3 mt-5">
                            <button
                                onClick={handleCancel}
                                className="flex-1 rounded-lg border border-border bg-muted text-muted-foreground px-4 py-2.5 text-sm font-medium hover:bg-accent hover:text-foreground transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 rounded-lg bg-primary text-primary-foreground px-4 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
                            >
                                Save
                            </button>
                        </div>
                    </div>

                    {/* Right: live preview */}
                    <div className="shrink-0 flex flex-col items-center gap-3">
                        <ChessBoardPreview boardId={pendingBoard} pieceSet={pendingPieces} />
                        <p className="text-xs text-muted-foreground capitalize">
                            {BOARD_THEMES.find((t) => t.id === pendingBoard)?.label ?? "Board"} theme
                        </p>
                    </div>
                </div>

                {/* Footer: Show coordinates toggle */}
                <div className="px-6 pb-6 border-t border-border pt-4 space-y-3">
                    {/* Toggle row */}
                    <div className="flex items-center gap-3">
                        {/* Toggle switch */}
                        <button
                            role="switch"
                            aria-checked={showCoords}
                            onClick={() => setShowCoords((v) => !v)}
                            className={cn(
                                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                                showCoords ? "bg-primary" : "bg-muted"
                            )}
                        >
                            <span
                                className={cn(
                                    "inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
                                    showCoords ? "translate-x-6" : "translate-x-1"
                                )}
                            />
                        </button>
                        <span className="text-sm font-medium text-foreground">
                            Show board coordinates
                        </span>
                    </div>

                    {/* Radio buttons */}
                    {showCoords && (
                        <div className="ml-14 flex flex-col gap-2">
                            {(["inside", "outside"] as const).map((pos) => (
                                <label key={pos} className="flex items-center gap-2 cursor-pointer">
                                    <button
                                        role="radio"
                                        aria-checked={coordPos === pos}
                                        onClick={() => setCoordPos(pos)}
                                        className={cn(
                                            "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                                            coordPos === pos
                                                ? "border-primary"
                                                : "border-muted-foreground"
                                        )}
                                    >
                                        {coordPos === pos && (
                                            <span className="w-2 h-2 rounded-full bg-primary block" />
                                        )}
                                    </button>
                                    <span className="text-sm text-foreground capitalize">{pos}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}