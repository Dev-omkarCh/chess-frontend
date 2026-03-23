// ─────────────────────────────────────────────────────────────────────────────
// Notification Dialog
// ─────────────────────────────────────────────────────────────────────────────

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn, relativeTime } from "@/lib/utils";
import { Bell, CheckCheck, Clock, Gamepad2, Info, Star, Swords, Trophy, UserPlus } from "lucide-react";
import Avatar from "./Avatar";
import { Button } from "@/components/ui/button";
import { Notification, NotificationType } from "@/types/social";
import apiClient from "@/api/axois";
import { useCallback, useEffect, useState } from "react";

const NOTIF_ICON: Record<NotificationType, React.ReactNode> = {
    friend_request: <UserPlus size={15} />,
    game_invite: <Swords size={15} />,
    game_result: <Trophy size={15} />,
    system: <Info size={15} />,
    achievement: <Star size={15} />,
};
const NOTIF_COLOR: Record<NotificationType, string> = {
    friend_request: "bg-primary/15 text-primary border-primary/20",
    game_invite: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    game_result: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    system: "bg-muted text-muted-foreground border-border",
    achievement: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
};

function NotificationDialog({
    open, onClose, notifications, onMarkAllRead,
}: {
    open: boolean; onClose: () => void;
    notifications: Notification[];
    onMarkAllRead: () => void;
}) {
    const [notifs, setNotifs] = useState<any[]>([]);
    const unread = notifications.filter(n => !n.isRead).length;


    const fetchNotifications = useCallback(async () => {
        try {
            const response = await apiClient.get('/v1/friends/requests/pending');
            const data = await response.data.data;
            console.log("Notifications: ", data);
            setNotifs(data);
        } catch (error) {
            console.error("Error fetching notifications: ", error);
        }
    }, [apiClient]);

    useEffect(() => {
        fetchNotifications();
    }, []);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[480px] bg-card border-border p-0 gap-0 overflow-hidden rounded-2xl shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/80 backdrop-blur-sm">
                    <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center">
                            <Bell size={15} className="text-primary" />
                        </div>
                        Notifications
                        {notifs.length > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[11px] font-black">
                                {notifs.length} new
                            </span>
                        )}
                    </DialogTitle>
                    {unread > 0 && (
                        <button
                            onClick={onMarkAllRead}
                            className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-semibold transition-colors px-2.5 py-1.5 rounded-lg hover:bg-primary/10"
                        >
                            <CheckCheck size={13} />
                            Mark all read
                        </button>
                    )}
                </div>

                <div className="overflow-y-auto max-h-[480px] divide-y divide-border">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                                <Bell size={24} className="text-muted-foreground/40" />
                            </div>
                            <p className="text-sm text-muted-foreground">All caught up!</p>
                        </div>
                    ) : notifications.map((n, idx) => (
                        <div
                            key={n._id}
                            className={cn(
                                "flex items-start gap-4 px-6 py-4 transition-all duration-200",
                                "hover:bg-accent/40",
                                !n.isRead && "bg-primary/4",
                            )}
                            style={{ animationDelay: `${idx * 40}ms` }}
                        >
                            {/* Icon / avatar */}
                            {n.fromUser ? (
                                <Avatar letter={n.fromUser.avatarLetter} color={n.fromUser.avatarColor} size="sm" />
                            ) : (
                                <div className={cn(
                                    "w-9 h-9 rounded-xl flex items-center justify-center border shrink-0",
                                    NOTIF_COLOR[n.type]
                                )}>
                                    {NOTIF_ICON[n.type]}
                                </div>
                            )}

                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-0.5">
                                    <p className={cn(
                                        "text-[15px] font-semibold leading-tight",
                                        !n.isRead ? "text-foreground" : "text-muted-foreground"
                                    )}>
                                        {n.title}
                                    </p>
                                    {!n.isRead && (
                                        <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5 shadow-sm shadow-primary/50" />
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed">{n.body}</p>
                                <div className="flex items-center gap-1.5 mt-2">
                                    <Clock size={11} className="text-muted-foreground/40" />
                                    <span className="text-xs text-muted-foreground/50">{relativeTime(n.createdAt)}</span>
                                </div>

                                {/* Action buttons */}
                                {n.type === "friend_request" && !n.isRead && (
                                    <div className="flex gap-2 mt-3">
                                        {/* TODO: POST /api/friends/accept { fromUserId: n.fromUser?._id } */}
                                        <Button size="sm" className="h-8 px-4 text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 rounded-xl shadow-md shadow-primary/20 active:scale-95 transition-all">
                                            Accept
                                        </Button>
                                        {/* TODO: DELETE /api/friends/request { fromUserId: n.fromUser?._id } */}
                                        <Button size="sm" variant="outline" className="h-8 px-4 text-xs font-semibold border-border hover:bg-accent rounded-xl active:scale-95 transition-all">
                                            Decline
                                        </Button>
                                    </div>
                                )}
                                {n.type === "game_invite" && !n.isRead && (
                                    <div className="flex gap-2 mt-3">
                                        {/* TODO: POST /api/game-requests/accept { notifId: n._id } */}
                                        <Button size="sm" className="h-8 px-4 text-xs font-semibold bg-amber-500 text-white hover:bg-amber-400 rounded-xl gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all">
                                            <Gamepad2 size={12} /> Join Game
                                        </Button>
                                        <Button size="sm" variant="outline" className="h-8 px-4 text-xs font-semibold border-border hover:bg-accent rounded-xl active:scale-95 transition-all">
                                            Dismiss
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default NotificationDialog;