// ─────────────────────────────────────────────────────────────────────────────
// Chess Clock
// ─────────────────────────────────────────────────────────────────────────────

"use client"
import { cn } from "@/lib/utils";

interface ClockProps {
    seconds: number;
    active: boolean;
}

export const Clock = ({ seconds, active }: ClockProps) => {

    const m = Math.floor(seconds / 60)
        .toString()
        .padStart(2, "0"); // Pad minutes with leading zero if needed
    const s = (seconds % 60)
        .toString()
        .padStart(2, "0"); // Pad seconds with leading zero if needed

    const isLow = seconds < 30 && active;
    return (
        <div className={cn(
            "font-mono font-black tabular-nums tracking-widest select-none rounded-lg px-3 py-2 text-xl transition-all duration-300 min-w-20 text-center",
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