// ─────────────────────────────────────────────────────────────────────────────
// Notification Dialog
// ─────────────────────────────────────────────────────────────────────────────

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn, relativeTime } from "@/lib/utils";
import { Bell, CheckCheck, Clock, Gamepad2, Info, Swords, UserPlus } from "lucide-react";
import Avatar from "./Avatar";
import { Button } from "@/components/ui/button";
import { Friend, INotification } from "@/types/social";
import apiClient from "@/api/axois";


const NOTIF_ICON: Record<INotification['type'], React.ReactNode> = {
    FRIEND_REQUEST: <UserPlus size={15} />,
    GAME_INVITE: <Swords size={15} />,
    SYSTEM_ALERT: <Info size={15} />,
};

const NOTIF_COLOR: Record<INotification['type'], string> = {
    FRIEND_REQUEST: "bg-primary/15 text-primary border-primary/20",
    GAME_INVITE: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    SYSTEM_ALERT: "bg-muted text-muted-foreground border-border",
};

function NotificationDialog({
    open, onClose, notifications, onMarkAllRead, addNewFriend
}: {
    open: boolean; onClose: () => void;
    notifications: INotification[];
    onMarkAllRead: () => void;
    addNewFriend: (friend: Friend) => void;
}) {
    const unread = notifications.filter(n => !n.isRead).length;

    const acceptFriendRequest = async (id: string) => {
        try {
            const response = await apiClient.patch(`/v1/friends/requests/${id}`, {
                status: "accepted"
            });

            const friend = response.data.data as Friend;
            addNewFriend(friend);
            console.log("Friend request accepted:", friend);
        } catch (error) {
            console.log("Error accepting friend request:", error);
        }

    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[480px] w-[95vw] max-w-[95vw] sm:w-full bg-card border-border p-0 gap-0 overflow-hidden rounded-2xl shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/80 backdrop-blur-sm">
                    <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center">
                            <Bell size={15} className="text-primary" />
                        </div>
                        Notifications
                        {unread > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[11px] font-black">
                                {unread} new
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
                            {/* Icon / avatar logic updated for sender */}
                            {n.sender ? (
                                <Avatar letter={n.sender.username.charAt(0)} color={"bg-blue-500"} size="sm" />
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
                                        {/* Using sender name or a default title based on type */}
                                        {n.sender?.username || (n.type === 'SYSTEM_ALERT' ? 'System Update' : 'Notification')}
                                    </p>
                                    {!n.isRead && (
                                        <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5 shadow-sm shadow-primary/50" />
                                    )}
                                </div>
                                {/* Updated message and timestamp fields */}
                                <p className="text-sm text-muted-foreground leading-relaxed">{n.message}</p>
                                <div className="flex items-center gap-1.5 mt-2">
                                    <Clock size={11} className="text-muted-foreground/40" />
                                    <span className="text-xs text-muted-foreground/50">{relativeTime(n.timestamp)}</span>
                                </div>

                                {/* Action buttons updated for interface types */}
                                {n.type === "FRIEND_REQUEST" && !n.isRead && (
                                    <div className="flex gap-2 mt-3">
                                        <Button
                                            size="sm"
                                            className="h-8 px-4 text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 rounded-xl shadow-md shadow-primary/20 active:scale-95 transition-all"
                                            onClick={() => acceptFriendRequest(n._id)}
                                        >
                                            Accept
                                        </Button>
                                        <Button size="sm" variant="outline" className="h-8 px-4 text-xs font-semibold border-border hover:bg-accent rounded-xl active:scale-95 transition-all">
                                            Decline
                                        </Button>
                                    </div>
                                )}
                                {n.type === "GAME_INVITE" && !n.isRead && (
                                    <div className="flex gap-2 mt-3">
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