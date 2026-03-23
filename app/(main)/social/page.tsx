"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import {
    Swords, UserPlus, UserMinus, Eye, Bell, Inbox,
    Search, Trophy, Users, CheckCheck, Clock, X,
    Info, Gamepad2, ChevronRight, MessageSquare,
    ShieldAlert, Gift, Star, Loader2, Hash,
    Sparkles, Shield, Crown, Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import apiClient from "@/api/axois";
import { useSocket } from "@/context/SocketProvider";
import { Socket } from "socket.io-client";
import { useDebounce } from "@/lib/useDebounce";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface UserProfile {
    _id: string;
    username: string;
    fullName: string;
    elo: number;
    avatarLetter: string;
    avatarColor: string;
    isOnline: boolean;
}

interface Friend extends UserProfile {
    friendSince: string;
}

type NotificationType =
    | "friend_request" | "game_invite" | "game_result"
    | "system" | "achievement";

interface Notification {
    _id: string;
    type: NotificationType;
    title: string;
    body: string;
    isRead: boolean;
    createdAt: string;
    fromUser?: Pick<UserProfile, "_id" | "username" | "avatarLetter" | "avatarColor">;
}

interface InboxMessage {
    _id: string;
    subject: string;
    body: string;
    isRead: boolean;
    createdAt: string;
    category: "system" | "announcement" | "support";
}

type FriendStatus = "friend" | "not_friend" | "request_sent" | "request_received";

interface SearchResult extends UserProfile {
    friendStatus: FriendStatus;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock data
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_ME: UserProfile = {
    _id: "me_001", username: "chessMaster99", fullName: "Arjun Sharma",
    elo: 1847, avatarLetter: "A", avatarColor: "bg-primary", isOnline: true,
};

const MOCK_FRIENDS: Friend[] = [
    { _id: "f1", username: "QueenGambit_X", fullName: "Priya Nair", elo: 2104, avatarLetter: "P", avatarColor: "bg-violet-500", isOnline: true, friendSince: "2024-01-15" },
    { _id: "f2", username: "KnightRider_22", fullName: "Dev Kapoor", elo: 1923, avatarLetter: "D", avatarColor: "bg-emerald-500", isOnline: true, friendSince: "2024-03-02" },
    { _id: "f3", username: "SilentBishop", fullName: "Meera Joshi", elo: 1755, avatarLetter: "M", avatarColor: "bg-amber-500", isOnline: false, friendSince: "2024-05-20" },
    { _id: "f4", username: "PawnStorm99", fullName: "Rahul Gupta", elo: 1680, avatarLetter: "R", avatarColor: "bg-rose-500", isOnline: false, friendSince: "2024-06-11" },
    { _id: "f5", username: "EndgameElite", fullName: "Sana Sheikh", elo: 2011, avatarLetter: "S", avatarColor: "bg-sky-500", isOnline: true, friendSince: "2024-07-03" },
    { _id: "f6", username: "TacticsWizard", fullName: "Kiran Mehta", elo: 1899, avatarLetter: "K", avatarColor: "bg-teal-500", isOnline: false, friendSince: "2024-08-14" },
    { _id: "f7", username: "BlitzKing_11", fullName: "Omar Farooq", elo: 2200, avatarLetter: "O", avatarColor: "bg-orange-500", isOnline: true, friendSince: "2024-09-01" },
];

const MOCK_NOTIFICATIONS: Notification[] = [
    { _id: "n1", type: "friend_request", title: "New Friend Request", body: "GrandMasterAli wants to be your friend.", isRead: false, createdAt: "2025-01-20T10:30:00Z", fromUser: { _id: "u99", username: "GrandMasterAli", avatarLetter: "G", avatarColor: "bg-indigo-500" } },
    { _id: "n2", type: "game_invite", title: "Game Invite", body: "QueenGambit_X challenged you to a 5-min Blitz!", isRead: false, createdAt: "2025-01-20T09:15:00Z", fromUser: { _id: "f1", username: "QueenGambit_X", avatarLetter: "P", avatarColor: "bg-violet-500" } },
    { _id: "n3", type: "game_result", title: "Game Result", body: "You won vs KnightRider_22. +18 ELO", isRead: true, createdAt: "2025-01-19T22:00:00Z" },
    { _id: "n4", type: "achievement", title: "Achievement Unlocked 🏆", body: "You reached 1800 ELO! Milestone: Expert.", isRead: true, createdAt: "2025-01-19T18:45:00Z" },
    { _id: "n5", type: "system", title: "System Notice", body: "Scheduled maintenance on Jan 22, 02:00 UTC.", isRead: true, createdAt: "2025-01-18T12:00:00Z" },
];

const MOCK_INBOX: InboxMessage[] = [
    { _id: "m1", subject: "Welcome to betterChess!", body: "Thank you for joining betterChess. Explore ranked matches and use our AI analysis to sharpen your game.", isRead: false, createdAt: "2025-01-01T08:00:00Z", category: "system" },
    { _id: "m2", subject: "New Feature: AI Game Review", body: "We've upgraded the AI Analysis Engine. Post-game reviews now include cross-game pattern recognition powered by Gemini.", isRead: true, createdAt: "2025-01-15T10:00:00Z", category: "announcement" },
    { _id: "m3", subject: "Support ticket resolved", body: "Ticket #4821 regarding ELO recalculation has been resolved. Your rating has been adjusted.", isRead: true, createdAt: "2025-01-18T16:30:00Z", category: "support" },
];

const ALL_SEARCH_POOL: SearchResult[] = [
    // already friends
    { _id: "s0", username: "QueenGambit_X", fullName: "Priya Nair", elo: 2104, avatarLetter: "P", avatarColor: "bg-violet-500", isOnline: true, friendStatus: "friend" },
    { _id: "s0b", username: "BlitzKing_11", fullName: "Omar Farooq", elo: 2200, avatarLetter: "O", avatarColor: "bg-orange-500", isOnline: true, friendStatus: "friend" },
    // incoming request
    { _id: "s1", username: "GrandMasterAli", fullName: "Ali Hassan", elo: 2340, avatarLetter: "A", avatarColor: "bg-indigo-500", isOnline: true, friendStatus: "request_received" },
    { _id: "s1b", username: "NimzoIndian", fullName: "Leila Ahmadi", elo: 2189, avatarLetter: "L", avatarColor: "bg-cyan-500", isOnline: false, friendStatus: "request_received" },
    // outgoing request
    { _id: "s3", username: "CenterControl", fullName: "Carlos Rivera", elo: 1762, avatarLetter: "C", avatarColor: "bg-lime-500", isOnline: true, friendStatus: "request_sent" },
    { _id: "s3b", username: "PinAndWin", fullName: "Fatima Al-Sayed", elo: 1840, avatarLetter: "F", avatarColor: "bg-rose-600", isOnline: false, friendStatus: "request_sent" },
    // not friends
    { _id: "s2", username: "RookSacrifice", fullName: "Yuki Tanaka", elo: 1988, avatarLetter: "Y", avatarColor: "bg-pink-500", isOnline: false, friendStatus: "not_friend" },
    { _id: "s4", username: "ForkingNights", fullName: "Amara Diallo", elo: 2050, avatarLetter: "A", avatarColor: "bg-fuchsia-500", isOnline: false, friendStatus: "not_friend" },
    { _id: "s5", username: "KingHunt3r", fullName: "Dimitri Volkov", elo: 2290, avatarLetter: "D", avatarColor: "bg-blue-600", isOnline: true, friendStatus: "not_friend" },
    { _id: "s6", username: "PawnBreaker", fullName: "Sofia Chen", elo: 1530, avatarLetter: "S", avatarColor: "bg-teal-500", isOnline: true, friendStatus: "not_friend" },
    { _id: "s7", username: "ZugzwangZara", fullName: "Zara Okonkwo", elo: 1875, avatarLetter: "Z", avatarColor: "bg-amber-600", isOnline: false, friendStatus: "not_friend" },
    { _id: "s8", username: "OpeningTheory", fullName: "Magnus Eriksson", elo: 2455, avatarLetter: "M", avatarColor: "bg-emerald-600", isOnline: true, friendStatus: "not_friend" },
    { _id: "s9", username: "SicilianDragon88", fullName: "Pradeep Nair", elo: 1699, avatarLetter: "P", avatarColor: "bg-sky-600", isOnline: false, friendStatus: "not_friend" },
    { _id: "s10", username: "FianchettoFinn", fullName: "Finn Johansson", elo: 1920, avatarLetter: "F", avatarColor: "bg-purple-600", isOnline: true, friendStatus: "not_friend" },
    { _id: "s11", username: "DoubledPawns", fullName: "Nadia Petrova", elo: 1455, avatarLetter: "N", avatarColor: "bg-red-500", isOnline: false, friendStatus: "not_friend" },
    { _id: "s12", username: "ChessNinja47", fullName: "Hiroshi Tanaka", elo: 2110, avatarLetter: "H", avatarColor: "bg-yellow-600", isOnline: true, friendStatus: "not_friend" },
];

// Shown by default before user types (top 6 suggested)
const MOCK_SEARCH_RESULTS: SearchResult[] = ALL_SEARCH_POOL.slice(0, 6);

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function eloLabel(elo: number): { label: string; color: string } {
    if (elo >= 2200) return { label: "Master", color: "text-yellow-400" };
    if (elo >= 2000) return { label: "Expert", color: "text-violet-400" };
    if (elo >= 1800) return { label: "Advanced", color: "text-primary" };
    if (elo >= 1600) return { label: "Intermediate", color: "text-sky-400" };
    return { label: "Beginner", color: "text-muted-foreground" };
}

function relativeTime(isoDate: string): string {
    const d = Date.now() - new Date(isoDate).getTime();
    const m = Math.floor(d / 60_000);
    const h = Math.floor(d / 3_600_000);
    const dy = Math.floor(d / 86_400_000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    return `${dy}d ago`;
}

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
const INBOX_ICON: Record<InboxMessage["category"], React.ReactNode> = {
    system: <ShieldAlert size={15} />,
    announcement: <Gift size={15} />,
    support: <MessageSquare size={15} />,
};
const INBOX_COLOR: Record<InboxMessage["category"], string> = {
    system: "bg-primary/15 text-primary border-primary/20",
    announcement: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    support: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
};

// ─────────────────────────────────────────────────────────────────────────────
// Avatar
// ─────────────────────────────────────────────────────────────────────────────

function Avatar({
    letter, color, size = "md", online, pulse = false,
}: {
    letter: string; color: string;
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    online?: boolean; pulse?: boolean;
}) {
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
        <div className="relative flex-shrink-0">
            <div className={cn(
                "rounded-full flex items-center justify-center font-black text-white select-none ring-2 ring-background shadow-lg",
                dims[size], color,
            )}>
                {letter}
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

// ─────────────────────────────────────────────────────────────────────────────
// Icon button with tooltip
// ─────────────────────────────────────────────────────────────────────────────

function IconBtn({
    icon, label, onClick, badge, variant = "default", danger = false,
}: {
    icon: React.ReactNode; label: string; onClick?: () => void;
    badge?: number; variant?: "default" | "ghost"; danger?: boolean;
}) {
    const [hovered, setHovered] = useState(false);
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

// ─────────────────────────────────────────────────────────────────────────────
// Elo badge
// ─────────────────────────────────────────────────────────────────────────────

function EloBadge({ elo }: { elo: number }) {
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-[11px] font-mono font-bold">
            <Trophy size={9} strokeWidth={2.5} />
            {elo}
        </span>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Notification Dialog
// ─────────────────────────────────────────────────────────────────────────────

function NotificationDialog({
    open, onClose, notifications, onMarkAllRead,
}: {
    open: boolean; onClose: () => void;
    notifications: Notification[];
    onMarkAllRead: () => void;
}) {
    const unread = notifications.filter(n => !n.isRead).length;
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
                                !n.isRead && "bg-primary/[0.04]",
                            )}
                            style={{ animationDelay: `${idx * 40}ms` }}
                        >
                            {/* Icon / avatar */}
                            {n.fromUser ? (
                                <Avatar letter={n.fromUser.avatarLetter} color={n.fromUser.avatarColor} size="sm" />
                            ) : (
                                <div className={cn(
                                    "w-9 h-9 rounded-xl flex items-center justify-center border flex-shrink-0",
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
                                        <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5 shadow-sm shadow-primary/50" />
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

// ─────────────────────────────────────────────────────────────────────────────
// Inbox Dialog
// ─────────────────────────────────────────────────────────────────────────────

type InboxTab = "inbox" | "system";

function InboxDialog({
    open, onClose, messages,
}: {
    open: boolean; onClose: () => void; messages: InboxMessage[];
}) {
    const [tab, setTab] = useState<InboxTab>("inbox");
    const [expanded, setExpanded] = useState<string | null>(null);

    const inboxMsgs = messages.filter(m => m.category !== "system");
    const systemMsgs = messages.filter(m => m.category === "system");
    const displayed = tab === "inbox" ? inboxMsgs : systemMsgs;

    const tabs: { id: InboxTab; label: string; unread: number }[] = [
        { id: "inbox", label: "Messages", unread: inboxMsgs.filter(m => !m.isRead).length },
        { id: "system", label: "System", unread: systemMsgs.filter(m => !m.isRead).length },
    ];

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[520px] bg-card border-border p-0 gap-0 overflow-hidden rounded-2xl shadow-2xl">
                {/* Header */}
                <div className="px-6 pt-4 border-b border-border bg-card/80 backdrop-blur-sm">
                    <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2.5 mb-4">
                        <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center">
                            <Inbox size={15} className="text-primary" />
                        </div>
                        Inbox
                    </DialogTitle>
                    {/* Tabs */}
                    <div className="flex gap-0">
                        {tabs.map(t => (
                            <button
                                key={t.id}
                                onClick={() => { setTab(t.id); setExpanded(null); }}
                                className={cn(
                                    "relative flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-all border-b-2 -mb-px",
                                    tab === t.id
                                        ? "border-primary text-foreground"
                                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                                )}
                            >
                                {t.label}
                                {t.unread > 0 && (
                                    <span className="min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-black px-1">
                                        {t.unread}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-y-auto max-h-[440px] divide-y divide-border">
                    {displayed.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                                <Inbox size={24} className="text-muted-foreground/40" />
                            </div>
                            <p className="text-sm text-muted-foreground">Nothing here yet</p>
                        </div>
                    ) : displayed.map(m => (
                        <div key={m._id} className={cn(!m.isRead && "bg-primary/[0.035]")}>
                            <button
                                onClick={() => setExpanded(p => p === m._id ? null : m._id)}
                                className="w-full flex items-start gap-4 px-6 py-4 text-left hover:bg-accent/40 transition-colors"
                            >
                                <div className={cn(
                                    "w-9 h-9 rounded-xl flex items-center justify-center border flex-shrink-0 mt-0.5",
                                    INBOX_COLOR[m.category]
                                )}>
                                    {INBOX_ICON[m.category]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-3">
                                        <p className={cn(
                                            "text-[15px] font-semibold truncate",
                                            !m.isRead ? "text-foreground" : "text-muted-foreground"
                                        )}>
                                            {m.subject}
                                        </p>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            {!m.isRead && <span className="w-2 h-2 rounded-full bg-primary shadow-sm shadow-primary/50" />}
                                            <span className="text-xs text-muted-foreground/50">{relativeTime(m.createdAt)}</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1 leading-relaxed">{m.body}</p>
                                </div>
                                <ChevronRight
                                    size={15}
                                    className={cn(
                                        "text-muted-foreground/30 flex-shrink-0 mt-1 transition-transform duration-200",
                                        expanded === m._id && "rotate-90"
                                    )}
                                />
                            </button>
                            {/* Expanded body */}
                            {expanded === m._id && (
                                <div className="px-6 pb-4 -mt-1">
                                    <div className="ml-13 pl-0 sm:ml-[52px] p-4 rounded-xl bg-muted border border-border">
                                        <p className="text-sm text-muted-foreground leading-relaxed">{m.body}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Friend row (sidebar)
// ─────────────────────────────────────────────────────────────────────────────

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
                <div className="absolute -left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            )}

            <Avatar letter={friend.avatarLetter} color={friend.avatarColor} size="sm" online={friend.isOnline} />

            <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold text-foreground truncate leading-tight">{friend.username}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                    <Trophy size={10} className="text-primary flex-shrink-0" />
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

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar
// ─────────────────────────────────────────────────────────────────────────────

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
            <div className="px-4 pt-5 pb-3 flex-shrink-0">
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
                            <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground/60">
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
                            <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground/60">
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
            <Link
                href="/profile"
                className={cn(
                    "flex-shrink-0 flex items-center gap-3 px-4 py-3.5",
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
            </Link>
        </aside>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Search result card
// ─────────────────────────────────────────────────────────────────────────────

function SearchCard({
    user, friends, onToggleFriend,
}: {
    user: SearchResult;
    friends: any[];
    /**
     * TODO API routes per status:
     * not_friend       → POST   /api/friends/request { to: user._id }
     * request_sent     → DELETE /api/friends/request { to: user._id }
     * friend           → DELETE /api/friends/remove  { friendId: user._id }
     * request_received → POST   /api/friends/accept  { fromUserId: user._id }
     */
    onToggleFriend: (user: SearchResult, friendStatus: string) => void;
}) {
    const { label, color } = eloLabel(user.elo);

    const friend = friends.find(f => f._id === user._id);
    const friendStatus = friend ? friend?.status === "pending" ? "request_sent" : friend?.status === "accepted" ? "friend" : "request_received" : "not_friend";

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
    const avatarColor = getRandomColor();

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

            <Avatar letter={user.username[0]} color={avatarColor} size="md" online={isOnline} />

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

            <div className="flex items-center gap-2 flex-shrink-0">
                <button
                    onClick={() => onToggleFriend(user, friendStatus)}
                    disabled={friendStatus === "request_sent" || friendStatus === "request_received"}
                    className={cn(
                        "flex items-center gap-2 h-9 px-4 rounded-xl text-[13px] font-semibold",
                        "transition-all duration-200 active:scale-95",
                        btn.cls,
                    )}
                >
                    {btn.icon}
                    <span className="hidden sm:inline">{btn.label}</span>
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

// ─────────────────────────────────────────────────────────────────────────────
// Main content
// ─────────────────────────────────────────────────────────────────────────────

interface UserProfile {
    _id: string;
    username: string;
    fullName: string;
    elo: number;
    avatarLetter: string;
    avatarColor: string;
    isOnline: boolean;
}

function MainContent({
    notifications: initNotifs,
    inboxMessages,
    friends
}: {
    notifications: Notification[];
    inboxMessages: InboxMessage[];
    friends: any[];
}) {
    const [notifOpen, setNotifOpen] = useState(false);
    const [inboxOpen, setInboxOpen] = useState(false);
    const [notifs, setNotifs] = useState(initNotifs);
    const [messages] = useState(inboxMessages);
    const [query, setQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [friendStatuses, setFriendStatuses] = useState<Record<string, FriendStatus>>(
        () => Object.fromEntries(MOCK_SEARCH_RESULTS.map(u => [u._id, u.friendStatus]))
    );
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

    const unreadNotif = notifs.filter(n => !n.isRead).length;
    const unreadInbox = messages.filter(m => !m.isRead).length;

    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500); // Using your hook

    // Search with debounce — searches ALL_SEARCH_POOL
    // const handleSearch = useCallback((value: string) => {
    //     setQuery(value);
    //     if (value.trim().length < 2) {
    //         // Show suggested players when empty
    //         setSearchResults(
    //             MOCK_SEARCH_RESULTS.map(u => ({ ...u, friendStatus: friendStatuses[u._id] ?? u.friendStatus }))
    //         );
    //         setHasSearched(false);
    //         setIsSearching(false);
    //         return;
    //     }
    //     setIsSearching(true);
    //     debounceRef.current = setTimeout(async () => {
    //         try {
    //             /**
    //              * TODO: Replace with real API call:
    //              * const res = await fetch(`/api/users/search?q=${encodeURIComponent(value)}`, { credentials: "include" });
    //              * const data: SearchResult[] = await res.json();
    //              * setSearchResults(data);
    //              */
    //             await new Promise(r => setTimeout(r, 280));
    //             const q = value.toLowerCase();
    //             const filtered = ALL_SEARCH_POOL.filter(u =>
    //                 u.username.toLowerCase().includes(q) ||
    //                 u.fullName.toLowerCase().includes(q)
    //             );
    //             setSearchResults(filtered.map(u => ({ ...u, friendStatus: friendStatuses[u._id] ?? u.friendStatus })));
    //             setHasSearched(true);
    //         } finally {
    //             setIsSearching(false);
    //         }
    //     }, 280);
    // }, [friendStatuses]);

    const handleToggleFriend = useCallback((user: any, friendStatus: string) => {
        const current = friendStatus;

        console.log(current);
        const next: FriendStatus =
            current === "friend" ? "not_friend" :
                current === "not_friend" ? "request_sent" :
                    current === "request_received" ? "friend" :
                        "not_friend";
        setFriendStatuses(p => ({ ...p, [user._id]: next }));
        setSearchResults(p => p.map(u => u._id === user._id ? { ...u, friendStatus: next } : u));
        console.log(searchResults);
    }, [searchResults]);

    const handleMarkAllRead = useCallback(() => {
        /** TODO: PATCH /api/notifications/mark-all-read */
        setNotifs(p => p.map(n => ({ ...n, isRead: true })));
    }, []);

    const handleClear = () => {
        setQuery("");
        setHasSearched(false);
        setIsSearching(false);
        // Restore suggested list
        setSearchResults(
            MOCK_SEARCH_RESULTS.map(u => ({ ...u, friendStatus: friendStatuses[u._id] ?? u.friendStatus }))
        );
        inputRef.current?.focus();
    };

    const fetchPlayers = async (query: string) => {
        try {
            const response = await apiClient.get(`/v1/users/search?query=${query}`);
            const players = response.data?.data;
            setSearchResults(players);

            console.log("players : ", players);
        } catch (error) {
            console.log("Error Fetching Friends", error);
        }
    };

    useEffect(() => {
        if (debouncedSearch) {
            fetchPlayers(debouncedSearch);
        }
    }, [debouncedSearch]);

    return (
        <div className="flex flex-col h-full bg-background">

            {/* ── Top bar ── */}
            <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-10">
                <div>
                    <h1 className="text-[17px] font-black text-foreground tracking-tight flex items-center gap-2">
                        <Hash size={17} className="text-primary" />
                        Social Zone
                    </h1>
                    <p className="text-xs text-muted-foreground mt-0.5 ml-6">
                        Find players · Connect · Challenge
                    </p>
                </div>

                {/* Action icons */}
                <div className="flex items-center gap-1.5">
                    <IconBtn
                        icon={<Bell size={18} />}
                        label="Notifications"
                        badge={unreadNotif}
                        onClick={() => setNotifOpen(true)}
                    />
                    <IconBtn
                        icon={<Inbox size={18} />}
                        label="Inbox"
                        badge={unreadInbox}
                        onClick={() => setInboxOpen(true)}
                    />
                </div>
            </div>

            {/* ── Scrollable body ── */}
            <div className="flex-1 overflow-y-auto min-h-0">
                <div className="max-w-3xl mx-auto px-5 sm:px-8 py-8 space-y-8">

                    {/* Search */}
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.14em] text-muted-foreground/70 mb-3 flex items-center gap-2">
                            <Search size={11} />
                            Find Players
                        </p>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                                {isSearching
                                    ? <Loader2 size={16} className="text-muted-foreground animate-spin" />
                                    : <Search size={16} className="text-muted-foreground" />
                                }
                            </div>
                            <input
                                ref={inputRef}
                                type="text"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder="Search by username or name…"
                                className={cn(
                                    "w-full h-12 pl-11 pr-11 rounded-2xl text-[15px]",
                                    "bg-card border border-border",
                                    "text-foreground placeholder:text-muted-foreground/50",
                                    "focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 focus:bg-card",
                                    "transition-all duration-200",
                                    "shadow-sm",
                                )}
                            />
                            {query && (
                                <button
                                    onClick={handleClear}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-all active:scale-90"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Search results — shown after typing */}
                    {hasSearched && (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-muted-foreground/70 flex items-center gap-2">
                                    <Sparkles size={11} />
                                    Results
                                </p>
                                <span className="text-xs text-muted-foreground">
                                    {searchResults.length} {searchResults.length === 1 ? "player" : "players"} found
                                </span>
                            </div>

                            {searchResults.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 gap-4 rounded-2xl bg-card border border-border">
                                    <Search size={32} className="text-muted-foreground/20" />
                                    <div className="text-center">
                                        <p className="text-[15px] font-semibold text-foreground">No players found</p>
                                        <p className="text-sm text-muted-foreground mt-1">Try a different username or name</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {searchResults.map((user, i) => (
                                        <div key={user._id} style={{ animationDelay: `${i * 55}ms` }} className="bc-slide-up">
                                            <SearchCard
                                                user={{ ...user, friendStatus: friendStatuses[user._id] ?? user.friendStatus }}
                                                friends={friends}
                                                onToggleFriend={handleToggleFriend}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Suggested players — shown before user types */}
                    {!hasSearched && (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-muted-foreground/70 flex items-center gap-2">
                                    <Sparkles size={11} />
                                    Suggested Players
                                </p>
                                <span className="text-xs text-muted-foreground/60">
                                    {searchResults.filter(u => u.isOnline).length} online
                                </span>
                            </div>
                            <div className="flex flex-col gap-3">
                                {searchResults.map((user, i) => (
                                    <div key={user._id} style={{ animationDelay: `${i * 45}ms` }} className="bc-slide-up">
                                        <SearchCard
                                            friends={friends}
                                            user={{ ...user, friendStatus: friendStatuses[user._id] ?? user.friendStatus }}
                                            onToggleFriend={handleToggleFriend}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Dialogs */}
            <NotificationDialog
                open={notifOpen}
                onClose={() => setNotifOpen(false)}
                notifications={notifs}
                onMarkAllRead={handleMarkAllRead}
            />
            <InboxDialog
                open={inboxOpen}
                onClose={() => setInboxOpen(false)}
                messages={messages}
            />
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE ROOT
// Pattern mirrors the dashboard page.tsx exactly:
//   - fixed overlay + absolute sidebar with translate-x transition
//   - z-[100] for the drawer (same as dashboard z-100)
//   - backdrop uses bg-background/80 backdrop-blur-sm
//   - sidebar width w-72 matching desktop sidebar
// ─────────────────────────────────────────────────────────────────────────────

interface Friend {
    _id: string;
    username: string;
    fullName: string;
    elo: number;
    avatarLetter: string;
    avatarColor: string;
    isOnline: boolean;
    friendSince: string;
}


export default function SocialPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // In production: const { user: me } = useAppSelector(state => state.auth)
    const me = MOCK_ME;
    const [friends, setFriends] = useState<any[]>([]);
    const { socket } = useSocket();

    const handleGameRequest = useCallback((friendId: string) => {
        /** TODO: POST /api/game-requests { to: friendId } then show toast */
        console.info("[TODO] Game request →", friendId);
    }, []);

    const fetchFriends = async () => {
        try {
            const response = await apiClient.get("/v1/friends");
            const friends = response.data.data;
            setFriends(friends);
        } catch (error) {
            console.log("Error Fetching Friends", error);
        }
    };

    const getOnlineFriends = (socket: Socket) => {
        socket.emit('social:get-online-friends');
        socket.on('social:online-friends-list', (data) => {
            console.log("Online Friends : ", data);
        });
    }


    // Close on Escape key — same UX as pressing the X button
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsSidebarOpen(false);
        };

        if (socket) {
            getOnlineFriends(socket);
        }

        fetchFriends();
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [socket]);

    return (
        <>
            <style>{`
        @keyframes bc-slide-up {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .bc-slide-up { animation: bc-slide-up 0.35s cubic-bezier(0.22, 1, 0.36, 1) both; }

        /* Thin smooth scrollbar */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 8px; }
      `}</style>

            <div className="flex min-h-screen bg-background text-foreground transition-colors duration-500 overflow-hidden">

                {/* ─────────────────────────────────────────────────────────────────
          MOBILE SIDEBAR OVERLAY  (< lg)
          Mirrors the dashboard pattern exactly:
            fixed inset-0  → full-screen container
            z-[100]        → above everything
            opacity/visible transitions → backdrop fade
            translate-x    → sidebar slide
        ───────────────────────────────────────────────────────────────── */}
                <div className={cn(
                    "fixed inset-0 z-[100] lg:hidden transition-opacity duration-300",
                    isSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible",
                )}>
                    {/* Backdrop — click to close */}
                    <div
                        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                        onClick={() => setIsSidebarOpen(false)}
                    />

                    {/* Sidebar panel */}
                    <aside className={cn(
                        "absolute left-0 top-0 h-full w-72 flex flex-col",
                        "bg-card border-r border-border shadow-2xl",
                        "transition-transform duration-300",
                        isSidebarOpen ? "translate-x-0" : "-translate-x-full",
                    )}>
                        {/* Drawer header with close button */}
                        <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
                            <div className="flex items-center gap-2.5 font-bold text-primary text-base">
                                <Swords size={20} />
                                <span>betterChess</span>
                            </div>
                            <button
                                onClick={() => setIsSidebarOpen(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-150 active:scale-90"
                                aria-label="Close sidebar"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Reuse Sidebar component — fills remaining height */}
                        <div className="flex-1 overflow-hidden min-h-0">
                            <Sidebar friends={friends} me={me} onGameRequest={handleGameRequest} />
                        </div>
                    </aside>
                </div>

                {/* ─────────────────────────────────────────────────────────────────
          DESKTOP SIDEBAR  (≥ lg, always visible)
        ───────────────────────────────────────────────────────────────── */}
                <aside className="hidden lg:flex flex-col w-72 xl:w-80 flex-shrink-0 bg-card border-r border-border">
                    <Sidebar friends={friends} me={me} onGameRequest={handleGameRequest} />
                </aside>

                {/* ─────────────────────────────────────────────────────────────────
          MAIN CONTENT
        ───────────────────────────────────────────────────────────────── */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                    {/* Mobile top bar — hamburger to open sidebar */}
                    <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-card/80 backdrop-blur-sm flex-shrink-0">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-accent transition-all text-muted-foreground hover:text-foreground active:scale-95"
                            aria-label="Open friends sidebar"
                        >
                            <Menu size={20} />
                        </button>
                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <Users size={15} className="text-primary" />
                            Friends
                            <span className="px-1.5 py-0.5 rounded-lg bg-primary/10 text-primary text-[11px] font-mono font-bold border border-primary/20">
                                {friends.filter(f => f.isOnline).length}/{friends.length}
                            </span>
                        </div>
                    </div>

                    <MainContent
                        notifications={MOCK_NOTIFICATIONS}
                        inboxMessages={MOCK_INBOX}
                        friends={friends}
                    />
                </div>
            </div>
        </>
    );
}