// ─────────────────────────────────────────────────────────────────────────────
// Sidebar
// ─────────────────────────────────────────────────────────────────────────────

import { Friend, UserProfile } from "@/types/social";
import { ChevronRight, Link, Users } from "lucide-react";
import FriendRow from "./FriendRow";
import { cn, eloLabel } from "@/lib/utils";
import EloBadge from "./EloBadge";
import Avatar from "./Avatar";

function Sidebar({
    friends, me, onGameRequest,
}: {
    friends: Friend[]; me: UserProfile; onGameRequest: (id: string) => void;
}) {
    const online = friends.filter(f => f.isOnline);
    const offline = friends.filter(f => !f.isOnline);

    return (
        <aside className="flex flex-col h-full bg-card border-r border-border">

            {/* Sidebar header */}
            <div className="px-4 pt-5 pb-3 shrink-0">
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Users size={15} className="text-primary" />
                    </div>
                    <span className="font-bold text-[15px] text-foreground">Friends</span>
                    <span className="ml-auto text-xs text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded-lg border border-border">
                        {friends.length}
                    </span>
                </div>
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto min-h-0 pb-2">

                {/* ONLINE section */}
                {online.length > 0 && (
                    <div className="mb-2">
                        <div className="flex items-center gap-2 px-5 py-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">
                                Online — {online.length}
                            </span>
                        </div>
                        {online.map(f => (
                            <FriendRow key={f._id} friend={f} onGameRequest={onGameRequest} />
                        ))}
                    </div>
                )}

                {/* OFFLINE section */}
                {offline.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 px-5 py-2 mt-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                            <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">
                                Offline — {offline.length}
                            </span>
                        </div>
                        {offline.map(f => (
                            <FriendRow key={f._id} friend={f} onGameRequest={onGameRequest} />
                        ))}
                    </div>
                )}

                {friends.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-40 gap-3 px-4 text-center">
                        <Users size={28} className="text-muted-foreground/20" />
                        <p className="text-sm text-muted-foreground">No friends yet</p>
                    </div>
                )}
            </div>

            {/* My Profile — Discord-style footer strip */}
            {/* <Link
                href="/profile"
                className={cn(
                    "shrink-0 flex items-center gap-3 px-4 py-3.5",
                    "border-t border-border bg-card hover:bg-accent",
                    "transition-all duration-200 group active:scale-[0.99]",
                )}
            >
                <Avatar letter={me.avatarLetter} color={me.avatarColor} size="sm" online={me.isOnline} pulse />
                <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-foreground truncate leading-tight">{me.username}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <EloBadge elo={me.elo} />
                        <span className={cn("text-[11px] font-medium", eloLabel(me.elo).color)}>
                            {eloLabel(me.elo).label}
                        </span>
                    </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <ChevronRight size={15} className="text-muted-foreground" />
                </div>
            </Link> */}
        </aside>
    );
}

export default Sidebar;