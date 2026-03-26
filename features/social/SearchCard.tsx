// ─────────────────────────────────────────────────────────────────────────────
// Search result card
// ─────────────────────────────────────────────────────────────────────────────

import { cn, eloLabel } from "@/lib/utils";
import { FriendStatus, SearchResult } from "@/types/social";
import { CheckCheck, Clock, Eye, UserMinus, UserPlus } from "lucide-react";
import Avatar from "./Avatar";
import EloBadge from "./EloBadge";
import Link from "next/link";

interface SearchCardProps {
    user: SearchResult;
    friends: any[];
    onToggleFriend: (user: SearchResult) => void;
}

function SearchCard({ user, friends, onToggleFriend }: SearchCardProps) {

    const { label, color } = eloLabel(user.elo);

    // const friend = friends.find(f => f._id === user._id);
    const friendStatus: FriendStatus = user.status || "not_friend";

    const btnConfig: Record<FriendStatus, { label: string; icon: React.ReactNode; cls: string }> = {
        not_friend: { label: "Add Friend", icon: <UserPlus size={14} />, cls: "bg-primary text-primary-foreground hover:opacity-90 shadow-md shadow-primary/20" },
        request_sent: { label: "Pending", icon: <Clock size={14} />, cls: "bg-muted text-muted-foreground cursor-not-allowed" },
        friend: { label: "Remove", icon: <UserMinus size={14} />, cls: "border border-danger/40 text-danger-foreground hover:bg-danger hover:text-white hover:border-danger" },
        request_received: { label: "Accept", icon: <CheckCheck size={14} />, cls: "bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-500/20" },
    };
    const btn = btnConfig[friendStatus];

    const isOnline = friends.some(f => f._id === user._id && f.isOnline);

    const getRandomColor = () => {
        const colors = ["bg-red-500", "bg-green-500", "bg-blue-500", "bg-yellow-500", "bg-purple-500", "bg-pink-500", "bg-orange-500", "bg-indigo-500", "bg-teal-500", "bg-cyan-500"];
        const index = Math.floor(Math.random() * colors.length);
        return colors[index];
    };

    return (
        <div className={cn(
            "group relative flex items-center gap-4 p-4 rounded-2xl",
            "bg-card border border-border",
            "hover:border-primary/25 hover:bg-accent/30",
            "transition-all duration-250 hover:shadow-lg hover:shadow-primary/5",
            "hover:-translate-y-0.5 active:translate-y-0",
        )}>
            {/* Subtle left accent on hover */}
            <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-r-full bg-primary scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-center" />

            <Avatar letter={user.username[0]} color={""} size="md" online={isOnline} avatar={user.avatar} />

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-[15px] font-bold text-foreground leading-none">{user.username}</p>
                    {isOnline && (
                        <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/15">
                            Online
                        </span>
                    )}
                </div>
                <p className="text-sm text-muted-foreground">{user.fullName}</p>
                <div className="flex items-center gap-2 mt-2">
                    <EloBadge elo={user.elo} />
                    <span className={cn("text-xs font-semibold", color)}>{label}</span>
                </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
                <button
                    onClick={() => onToggleFriend(user)}
                    disabled={friendStatus === "request_sent"}
                    className={cn(
                        "flex items-center gap-2 h-9 px-4 rounded-xl text-[13px] font-semibold",
                        "transition-all duration-200 active:scale-95",
                        btn?.cls,
                    )}
                >
                    {btn?.icon}
                    <span className="hidden sm:inline">{btn?.label}</span>
                </button>
                <Link href={`/profile/${user._id}`}>
                    <button className={cn(
                        "flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-[13px] font-semibold",
                        "border border-border text-muted-foreground",
                        "hover:bg-accent hover:text-foreground hover:border-primary/25",
                        "transition-all duration-200 active:scale-95",
                    )}>
                        <Eye size={14} />
                        <span className="hidden sm:inline">Profile</span>
                    </button>
                </Link>
            </div>
        </div>
    );
}

export default SearchCard;