"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import {
    Swords, UserPlus, UserMinus, Eye, Bell, Inbox,
    Search, Trophy, Users, CheckCheck, Clock, X,
    ChevronRight, Loader2, Hash,
    Sparkles, Menu,
    BrushCleaning,
} from "lucide-react";
import { cn, eloLabel } from "@/lib/utils";
import apiClient from "@/api/axois";
import { useSocket } from "@/context/SocketProvider";
import { Socket } from "socket.io-client";
import { useDebounce } from "@/lib/useDebounce";
import Avatar from "@/features/social/Avatar";
import IconBtn from "@/features/social/IconBtn";
import EloBadge from "@/features/social/EloBadge";
import NotificationDialog from "@/features/social/NotificationDialog";
import InboxDialog from "@/components/social/InboxDialog";
import { Friend, FriendOnlineStatus, INotification, SearchResult } from "@/types/social";
import Sidebar from "@/features/social/Sidebar";
import SearchCard from "@/features/social/SearchCard";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setFriendOnline, setFriends } from "@/redux/socialSlice";
import { RootState } from "@/lib/store";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────


interface InboxMessage {
    _id: string;
    subject: string;
    body: string;
    isRead: boolean;
    createdAt: string;
    category: "system" | "announcement" | "support";
}

type FriendStatus = "friend" | "not_friend" | "request_sent" | "request_received";

const MOCK_INBOX: InboxMessage[] = [
    { _id: "m1", subject: "Welcome to betterChess!", body: "Thank you for joining betterChess. Explore ranked matches and use our AI analysis to sharpen your game.", isRead: false, createdAt: "2025-01-01T08:00:00Z", category: "system" },
    { _id: "m2", subject: "New Feature: AI Game Review", body: "We've upgraded the AI Analysis Engine. Post-game reviews now include cross-game pattern recognition powered by Gemini.", isRead: true, createdAt: "2025-01-15T10:00:00Z", category: "announcement" },
    { _id: "m3", subject: "Support ticket resolved", body: "Ticket #4821 regarding ELO recalculation has been resolved. Your rating has been adjusted.", isRead: true, createdAt: "2025-01-18T16:30:00Z", category: "support" },
];


// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────


// ─────────────────────────────────────────────────────────────────────────────
// Main content
// ─────────────────────────────────────────────────────────────────────────────

function MainContent({
    inboxMessages,
    friends,
    addNewFriend
}: {
    inboxMessages: InboxMessage[];
    friends: any[];
    addNewFriend: (friend: Friend) => void
}) {
    const [notifOpen, setNotifOpen] = useState(false);
    const [inboxOpen, setInboxOpen] = useState(false);
    const [notifications, setNotifications] = useState<INotification[]>([]);
    const [messages] = useState(inboxMessages);
    const [query, setQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [friendStatuses, setFriendStatuses] = useState<any>({});
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
    const [unReadNotifications, setUnReadNotifications] = useState<number>(0);

    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500); // Using your hook

    const sendFriendRequest = async (recipientId: string) => {
        try {
            await apiClient.post("/v1/friends/request", {
                recipientId
            });
            toast.success("Friend Request Send");
        } catch (error) {
            console.log("Error Sending Friend Request", error);
        }

    };

    const accpetFriendRequest = async (senderId: string) => {
        try {
            await apiClient.post(`/v1/friends/request/${senderId}`, {
                senderId
            });
            toast.success("Friend Request Accepted");
        } catch (error) {
            console.log("Error Accepting Friend Request", error);
        }
    };

    const removeFriend = async (friendId: string) => {
        try {
            await apiClient.post("/v1/friends/remove", {
                friendId
            });
            toast.success("Friend Removed");
        }
        catch (error) {
            console.log("Error Removing Friend", error);
        }
    };


    const handleToggleFriend = useCallback((user: SearchResult) => {
        const friendshipStatus = user.status || "not_friend";

        console.log(friendshipStatus);
        const next: FriendStatus =
            friendshipStatus === "friend" ? "not_friend" :
                friendshipStatus === "not_friend" ? "request_sent" :
                    friendshipStatus === "request_received" ? "friend" :
                        "not_friend";
        setSearchResults((p: any) => p.map((u: any) => u._id === user._id ? { ...u, status: next } : u));

        if (friendshipStatus === "request_received") {
            accpetFriendRequest(user._id);
        }
        else if (friendshipStatus === "not_friend") {
            sendFriendRequest(user._id);
        }
        else if (friendshipStatus === "friend") {
            removeFriend(user._id);
        }
    }, [searchResults]);

    const handleMarkAllRead = useCallback(() => {
        /** TODO: PATCH /api/notifications/mark-all-read */
        setNotifications(p => p.map(n => ({ ...n, isRead: true })));
    }, []);

    const handleClear = () => {
        setQuery("");
        setHasSearched(false);
        setIsSearching(false);
        // Restore suggested list
        setSearchResults([]);
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

    const fetchNotifications = useCallback(async () => {
        try {
            const response = await apiClient.get('/v1/friends/requests/pending');
            const data = await response.data.data as INotification[];

            console.log("Fetched Notifications : ", data);
            setNotifications(data);

            setUnReadNotifications(data.filter(n => !n.isRead).length);

        } catch (error) {
            console.error("Error fetching notifications: ", error);
        }
    }, [apiClient]);

    useEffect(() => {
        fetchNotifications();
    }, []);

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
                        badge={unReadNotifications}
                        label="Notifications"
                        onClick={() => setNotifOpen(true)}
                    />
                    <IconBtn
                        icon={<Inbox size={18} />}
                        badge={10}
                        label="Inbox"
                        onClick={() => setInboxOpen(true)}
                    />
                    <IconBtn
                        icon={<BrushCleaning size={18} />}
                        label="Clear"
                        onClick={() => {
                            const clearFriendship = async () => {
                                try {
                                    await apiClient.get("/v1/friends/clear");
                                    toast.success("Clear Friendship Schema");
                                } catch (error) {
                                    console.log("Error while clearing Friendship Schema : ", error);
                                }
                            }
                            clearFriendship();
                        }}
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
                                                user={user}
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
                                            user={user}
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
                notifications={notifications}
                onMarkAllRead={handleMarkAllRead}
                addNewFriend={addNewFriend}
            />
            <InboxDialog
                open={inboxOpen}
                onClose={() => setInboxOpen(false)}
                messages={messages}
            />
        </div>
    );
}

export default function SocialPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const { user: me } = useAppSelector((state: RootState) => state.auth);
    const { friends } = useAppSelector((state: RootState) => state.social);
    const { socket } = useSocket();
    const dispatch = useAppDispatch();

    const handleGameRequest = useCallback((friendId: string) => {
        console.info("[TODO] Game request →", friendId);
    }, []);

    const fetchFriends = async (socket: Socket) => {
        try {
            const response = await apiClient.get("/v1/friends");
            const friends = response.data.data as Friend[];
            dispatch(setFriends(friends));
            const friendIds = friends.map((f: Friend) => f._id);
            socket.emit('social:get-online-friends', { friendIds });
        } catch (error) {
            console.log("Error Fetching Friends", error);
        }
    };

    const getOnlineFriends = (socket: Socket) => {
        socket.on('social:online-friends-list', (data: FriendOnlineStatus[]) => {
            dispatch(setFriendOnline(data));
        });
    }

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsSidebarOpen(false);
        };

        if (socket) {
            fetchFriends(socket);
            getOnlineFriends(socket);
        }

        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [socket, dispatch]);

    const addNewFriend = (friend: Friend) => {
        // setFriends(p => [...p, friend]);
    }

    if (!me) return null;

    return (
        <>
            <div className="flex min-h-screen bg-background text-foreground transition-colors duration-500 overflow-hidden">
                <div className={cn(
                    "fixed inset-0 z-100 lg:hidden transition-opacity duration-300",
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
                        <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
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

                <aside className="hidden lg:flex flex-col w-72 xl:w-80 shrink-0 bg-card border-r border-border">
                    <Sidebar friends={friends} me={me} onGameRequest={handleGameRequest} />
                </aside>

                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                    {/* Mobile top bar — hamburger to open sidebar */}
                    <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-card/80 backdrop-blur-sm shrink-0">
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
                        inboxMessages={MOCK_INBOX}
                        friends={friends}
                        addNewFriend={addNewFriend}
                    />
                </div>
            </div>
        </>
    );
}