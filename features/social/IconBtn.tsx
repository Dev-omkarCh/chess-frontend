// ─────────────────────────────────────────────────────────────────────────────
// Icon button with tooltip
// ─────────────────────────────────────────────────────────────────────────────

import { cn } from "@/lib/utils";
import { useState } from "react";

interface IconBtnProps {
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
    badge?: number;
    variant?: "default" | "ghost";
    danger?: boolean;
}

function IconBtn({ icon, label, onClick, badge, variant = "default", danger = false }: IconBtnProps) {
    const [, setHovered] = useState(false);
    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            title={label}
            className={cn(
                "relative group flex items-center justify-center rounded-xl transition-all duration-200 active:scale-95",
                variant === "ghost"
                    ? "w-10 h-10 text-muted-foreground hover:text-foreground hover:bg-accent"
                    : "w-10 h-10 text-muted-foreground hover:text-foreground hover:bg-accent border border-transparent hover:border-border",
                danger && "hover:text-danger-foreground hover:bg-danger/10",
            )}
        >
            {icon}
            {badge !== undefined && badge > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-black px-1 leading-none shadow-lg shadow-primary/30">
                    {badge > 9 ? "9+" : badge}
                </span>
            )}
        </button>
    );
}

export default IconBtn;