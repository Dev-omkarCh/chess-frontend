// ─────────────────────────────────────────────────────────────────────────────
// Friend row (sidebar)
// ─────────────────────────────────────────────────────────────────────────────

import { cn, eloLabel } from "@/lib/utils";
import { Friend } from "@/types/social";
import { useState } from "react";
import Avatar from "./Avatar";
import { CheckCheck, Eye, Link, Swords, Trophy } from "lucide-react";

function FriendRow({
    friend, onGameRequest,
}: {
    friend: Friend;
    onGameRequest: (id: string) => void;
}) {
    const [actionsVisible, setActionsVisible] = useState(false);
    const [gameReqSent, setGameReqSent] = useState(false);
    const { label, color } = eloLabel(friend.elo);

    function handleGameReq() {
        setGameReqSent(true);
        onGameRequest(friend._id);
        setTimeout(() => setGameReqSent(false), 2000);
    }

    return (
        <div
            onMouseEnter={() => setActionsVisible(true)}
            onMouseLeave={() => setActionsVisible(false)}
            className={cn(
                "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl mx-2 cursor-pointer",
                "transition-all duration-200 hover:bg-accent",
                "active:scale-[0.98]",
            )}
        >
            {/* Active indicator pill (Discord style) */}
            {friend.isOnline && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            )}

            <Avatar letter={friend.avatarLetter} color={friend.avatarColor} size="sm" online={friend.isOnline} />

            <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold text-foreground truncate leading-tight">{friend.username}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                    <Trophy size={10} className="text-primary shrink-0" />
                    <span className="text-xs text-muted-foreground font-mono">{friend.elo}</span>
                    <span className="text-muted-foreground/30 text-xs">·</span>
                    <span className={cn("text-xs font-medium", color)}>{label}</span>
                </div>
            </div>

            {/* Hover action buttons */}
            <div className={cn(
                "flex items-center gap-1 transition-all duration-200",
                actionsVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2 pointer-events-none"
            )}>
                <button
                    onClick={handleGameReq}
                    title={gameReqSent ? "Sent!" : "Send Game Request"}
                    className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 active:scale-90",
                        gameReqSent
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-primary/10 text-primary hover:bg-primary/20"
                    )}
                >
                    {gameReqSent ? <CheckCheck size={14} /> : <Swords size={14} />}
                </button>
                <Link href={`/profile/${friend._id}`}>
                    <button
                        title="View Profile"
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-accent text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-all duration-200 active:scale-90"
                    >
                        <Eye size={14} />
                    </button>
                </Link>
            </div>
        </div>
    );
}

export default FriendRow;