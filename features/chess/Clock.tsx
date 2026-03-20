// ─────────────────────────────────────────────────────────────────────────────
// Clock

import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
export function Clock({ seconds, active }: { seconds: number; active: boolean }) {
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