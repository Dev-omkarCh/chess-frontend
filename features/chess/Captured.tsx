// ─────────────────────────────────────────────────────────────────────────────
// Captured pieces display
// ─────────────────────────────────────────────────────────────────────────────

import { Color, PieceSymbol } from "chess.js";
import { PIECE_VAL } from "./types";
import { cn } from "@/lib/utils";
import { getPiece } from "@/lib/pieces-registry";

interface CapturedProps {
    pieces: PieceSymbol[];
    color: Color
};
export const Captured = ({ pieces, color }: CapturedProps) => {
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
};