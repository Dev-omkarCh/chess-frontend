// ─────────────────────────────────────────────────────────────────────────────
// Player strip (shown above/below board)
// ─────────────────────────────────────────────────────────────────────────────

import { cn } from "@/lib/utils";
import { Color, PieceSymbol } from "chess.js";
import { Clock } from "./Clock";
import { Captured } from "./Captured";

export function PlayerStrip({
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
                    "w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-xl font-black border-2 shadow-sm",
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