"use client"
import React, { useState } from 'react';
import {
    Search, UserPlus, Link, Bell, Mail, Swords, Check, Globe,
    ChevronRight, Home, Zap, Trophy, Settings, LogOut,
    UserCheck, UserX, Clock, ArrowUpRight, MoreHorizontal
} from 'lucide-react';

import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from '@/components/social/Navbar';
import SocialSidebar from '@/components/social/Sidebar';
import Sidebar from '@/components/social/Sidebar';
import NotificationDialog from '@/components/social/NotificationDailog';
import InboxDialog from '@/components/social/InboxDialog';

export default function StandardSocialHub() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isInboxOpen, setIsInboxOpen] = useState(false);

    return (
        <div className="flex h-screen w-full bg-background overflow-hidden">
            {/* SIDEBAR: Controls its own desktop width and mobile overlay state */}
            <Sidebar
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
                isMobileOpen={isMobileOpen}
                setIsMobileOpen={setIsMobileOpen}
            />

            {/* MAIN CONTENT AREA */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                {/* Pass the mobile toggle to the Navbar's menu button */}
                <Navbar 
                    onMenuClick={() => setIsMobileOpen(true)}
                    onOpenNotification={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    onOpenInbox={() => setIsInboxOpen(!isInboxOpen)}
                />

                <main className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent p-6 lg:p-10">
                    <div className="max-w-5xl mx-auto space-y-8">

                        <div className="space-y-4">
                            <h1 className="text-3xl font-black tracking-tight">Social Hub</h1>
                            <div className="relative max-w-xl group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search rivals by username..."
                                    className="w-full h-12 pl-12 pr-4 rounded-2xl bg-card border border-border focus:border-primary/50 outline-none transition-all text-sm font-medium"
                                />
                            </div>
                        </div>

                        <Tabs defaultValue="discovery">
                            <TabsList className="bg-muted/50 border border-border h-11 p-1 rounded-xl">
                                <TabsTrigger value="discovery" className="rounded-lg px-6 font-bold text-xs data-[state=active]:bg-card">Discovery</TabsTrigger>
                                <TabsTrigger value="requests" className="rounded-lg px-6 font-bold text-xs data-[state=active]:bg-card">Pending</TabsTrigger>
                            </TabsList>

                            <TabsContent value="discovery" className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <PlayerCard name="AlphaZero_Fan" elo={2100} />
                                <PlayerCard name="Checkmate_99" elo={1450} />
                                <PlayerCard name="SicilianExpert" elo={1850} />
                            </TabsContent>
                        </Tabs>
                    </div>
                </main>
            </div>

            {/* Notification Dailog */}
            <NotificationDialog isOpen={isNotificationsOpen} onOpenChange={setIsNotificationsOpen} />

            {/* Inbox Dailog */}
            <InboxDialog isOpen={isInboxOpen} onOpenChange={setIsInboxOpen} />
        </div>
    );
}

// --- COMPONENTS ---

function NavOption({ label, icon, active }: any) {
    return (
        <button className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${active ? 'bg-primary/10 text-primary' : 'hover:bg-accent text-muted-foreground'}`}>
            {icon} {label}
        </button>
    );
}

function FriendRow({ name, status, elo }: any) {
    const color = status === 'online' ? 'bg-primary' : status === 'in-game' ? 'bg-blue-500' : 'bg-muted-foreground/30';
    return (
        <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 cursor-pointer group">
            <div className="flex items-center gap-3">
                <div className="relative h-9 w-9 rounded-lg bg-muted flex items-center justify-center font-bold text-xs">{name[0]}</div>
                <div className="flex flex-col">
                    <span className="text-sm font-bold group-hover:text-primary transition-colors">{name}</span>
                    <div className="flex items-center gap-1.5">
                        <div className={`h-1.5 w-1.5 rounded-full ${color}`} />
                        <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">{status}</span>
                    </div>
                </div>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground">{elo}</span>
        </div>
    );
}

function PlayerCard({ name, elo }: any) {
    return (
        <div className="p-5 bg-card border border-border rounded-2xl hover:border-primary/40 transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center font-bold">{name[0]}</div>
                <button className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-black transition-all">
                    <UserPlus size={16} />
                </button>
            </div>
            <h3 className="font-bold">{name}</h3>
            <div className="flex items-center justify-between mt-3">
                <span className="text-xs font-black text-primary italic">{elo} ELO</span>
                <button className="text-[10px] font-black uppercase text-muted-foreground hover:text-foreground flex items-center gap-1">
                    Profile <ArrowUpRight size={12} />
                </button>
            </div>
        </div>
    );
}

// function NotificationDialog({ }) {

//     if()
//     return (
//         <Dialog>
//             <DialogTrigger asChild>
//                 <button className="h-10 w-10 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-accent transition-all relative">
//                     <Bell size={18} />
//                     <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-primary rounded-full ring-2 ring-background" />
//                 </button>
//             </DialogTrigger>
//             <DialogContent className="sm:max-w-md bg-card border-border rounded-2xl p-0 overflow-hidden shadow-2xl">
//                 <DialogHeader className="p-6 border-b border-border bg-muted/20">
//                     <DialogTitle className="text-lg font-black tracking-tight">Notifications</DialogTitle>
//                 </DialogHeader>
//                 <div className="max-h-[400px] overflow-y-auto">
//                     {/* CHALLENGE DUMMY */}
//                     <div className="p-4 border-b border-border flex items-center justify-between hover:bg-white/[0.02] transition-colors">
//                         <div className="flex items-center gap-3">
//                             <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary"><Swords size={18} /></div>
//                             <div>
//                                 <p className="text-sm font-bold">Vishy_Fan <span className="font-medium text-muted-foreground">challenged you</span></p>
//                                 <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Blitz 5+0 • Casual</p>
//                             </div>
//                         </div>
//                         <div className="flex gap-2">
//                             <button className="h-8 px-3 rounded-lg bg-primary text-black text-[10px] font-black hover:brightness-110 transition-all">ACCEPT</button>
//                             <button className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center hover:bg-red-500/20 hover:text-red-500 transition-all"><UserX size={14} /></button>
//                         </div>
//                     </div>

//                     {/* SYSTEM DUMMY */}
//                     <div className="p-4 border-b border-border flex items-start gap-3 bg-primary/[0.02]">
//                         <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500"><Trophy size={18} /></div>
//                         <div className="flex-1">
//                             <p className="text-sm font-bold">New Tournament: Neon Nights</p>
//                             <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">Registration is now open for the Weekend Blitz. $500 Prize Pool!</p>
//                             <p className="text-[10px] font-bold text-primary mt-2 flex items-center gap-1"><Clock size={10} /> Starts in 4h</p>
//                         </div>
//                     </div>
//                 </div>
//             </DialogContent>
//         </Dialog>
//     );
// }


// function InboxDialog() {
//     return (
//         <Dialog>
//             <DialogTrigger asChild>
//                 <button className="h-10 w-10 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-accent transition-all">
//                     <Mail size={18} />
//                 </button>
//             </DialogTrigger>
//             <DialogContent className="sm:max-w-md bg-card border-border rounded-2xl">
//                 <DialogHeader><DialogTitle className="text-lg font-black">Inbox</DialogTitle></DialogHeader>
//                 <div className="py-12 text-center space-y-3">
//                     <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mx-auto opacity-30"><Mail size={24} /></div>
//                     <p className="text-sm text-muted-foreground">No new messages yet.</p>
//                 </div>
//             </DialogContent>
//         </Dialog>
//     );
// }

function UserDropdown() {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-emerald-400 p-0.5">
                    <div className="h-full w-full rounded-[9px] bg-background flex items-center justify-center text-[10px] font-black">GA</div>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-card border-border rounded-xl mt-2">
                <DropdownMenuItem className="p-3 gap-3 rounded-lg cursor-pointer"><UserCheck size={16} /> Profile</DropdownMenuItem>
                <DropdownMenuItem className="p-3 gap-3 rounded-lg cursor-pointer"><Settings size={16} /> Settings</DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem className="p-3 gap-3 rounded-lg cursor-pointer text-red-500"><LogOut size={16} /> Logout</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
