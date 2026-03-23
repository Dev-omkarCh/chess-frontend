"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import {
    Swords, UserPlus, UserMinus, Eye, Bell, Inbox,
    Search, Trophy, Users, CheckCheck, Clock, X,
    ChevronRight, Loader2, Hash,
    Sparkles, Menu,
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
import { Notification } from "@/types/social";
import FriendRow from "@/features/social/FriendRow";
import Sidebar from "@/features/social/Sidebar";
import SearchCard from "@/features/social/SearchCard";

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
    friends,
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
    const [friendStatuses, setFriendStatuses] = useState<any>({});
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
        setFriendStatuses((p: any) => ({ ...p, [user._id]: next }));
        setSearchResults((p: any) => p.map((u: any) => u._id === user._id ? { ...u, friendStatus: next } : u));
        // setFriends((p: any) => p.map((f: any) => f._id === user._id ? { ...f, status: next } : f));
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

    // const { user: me } = useAppSelector(state => state.auth)
    const me = MOCK_ME;
    const [friends, setFriends] = useState<any[]>([]);
    const { socket } = useSocket();

    const handleGameRequest = useCallback((friendId: string) => {
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
                        notifications={MOCK_NOTIFICATIONS}
                        inboxMessages={MOCK_INBOX}
                        friends={friends}
                    />
                </div>
            </div>
        </>
    );
}