// ─────────────────────────────────────────────────────────────────────────────
// Player strip (shown above/below board)
// ─────────────────────────────────────────────────────────────────────────────

import { cn } from "@/lib/utils";
import { Color, PieceSymbol } from "chess.js";
import { Captured } from "./Captured";
import { Clock } from "./Clock";
import { useEffect, useRef, useState } from "react";

interface PlayerStripProps {
    name: string; subtitle: string; color: Color;
    seconds: number; active: boolean;
    capturedPieces: PieceSymbol[]; isGameOver: boolean;
    endGame: (msg: string) => void;
    activeTimer?: "w" | "b" | null;
    isOver?: boolean;
};
export const PlayerStrip = ({
    name, subtitle, color, seconds, active,
    capturedPieces, isGameOver, endGame,
    activeTimer, isOver
}: PlayerStripProps) => {

    const [wTime, setWTime] = useState(600);
    const [bTime, setBTime] = useState(600);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Timer
    useEffect(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (!activeTimer || isOver) return;
        timerRef.current = setInterval(() => {
            if (activeTimer === "w") {
                setWTime(t => {
                    if (t <= 1) {
                        clearInterval(timerRef.current!);
                        endGame("Black wins on time! ⏱");
                        return 0;
                    }
                    return t - 1;
                });
            } else {
                setBTime(t => {
                    if (t <= 1) {
                        clearInterval(timerRef.current!);
                        endGame("White wins on time! ⏱");
                        return 0;
                    }
                    return t - 1;
                });
            }
        }, 1000);
        return () => clearInterval(timerRef.current!);
    }, [activeTimer, isOver]);

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
};