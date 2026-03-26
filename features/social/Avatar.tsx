// ─────────────────────────────────────────────────────────────────────────────
// Avatar
// ─────────────────────────────────────────────────────────────────────────────

"use client";
import { cn } from "@/lib/utils";

interface AvatarProps {
    letter: string;
    color: string;
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    online?: boolean;
    pulse?: boolean;
    avatar?: string;
}

function Avatar({ letter, color, size = "md", online, pulse = false, avatar }: AvatarProps) {
    const dims: Record<string, string> = {
        xs: "w-7 h-7 text-xs",
        sm: "w-9 h-9 text-sm",
        md: "w-11 h-11 text-base",
        lg: "w-14 h-14 text-lg",
        xl: "w-16 h-16 text-xl",
    };
    const dotDims: Record<string, string> = {
        xs: "w-2 h-2", sm: "w-2.5 h-2.5", md: "w-3 h-3", lg: "w-3.5 h-3.5", xl: "w-4 h-4",
    };
    return (
        <div className="relative shrink-0" suppressHydrationWarning>
            <div className={cn(
                "rounded-full flex items-center justify-center font-black text-white select-none ring-2 ring-background shadow-lg capitalize",
                dims[size], color,
            )}>
                {avatar ? (<img src={avatar} alt="avatar" className={cn(dims[size], "rounded-full object-cover")} />) : letter}
            </div>
            {online !== undefined && (
                <span className={cn(
                    "absolute bottom-0 right-0 rounded-full border-[2.5px] border-background",
                    dotDims[size],
                    online ? "bg-emerald-400" : "bg-muted-foreground/50",
                    online && pulse && "animate-pulse",
                )} />
            )}
        </div>
    );
}

export default Avatar;