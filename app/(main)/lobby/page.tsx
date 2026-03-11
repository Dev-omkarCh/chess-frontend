"use client";

import React, { useState } from "react";
import {
    Play,
    Trophy,
    Users,
    Clock,
    Search,
    Settings,
    Plus,
    Crown,
    ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useGameSettings } from "@/hooks/useGameSettings";
import BoardSettingsDialog from "@/components/lobby/SettingsDialog";
import { useRouter } from "next/navigation";

const ChessLobby = () => {
    const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
    const handleOpenSettings = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsSettingsOpen(!isSettingsOpen);
    }

    const { settings, setSettings, saveSettings } = useGameSettings();
    const router = useRouter();

    return (
        // Background Chess Pattern: and transition for theme switch
        <div className="min-h-screen bg-background text-foreground p-4 md:p-8 transition-colors duration-300 relative overflow-hidden">
            {/* <Navbar /> */}
            {/* Main Content: Lifted above the background pattern */}
            <div className="relative z-10">
                {/* Header - Optimized for your provided variables */}
                <header className="flex flex-col gap-6 mb-12 border-b border-border pb-8">
                    <div className="flex justify-between items-center gap-4">
                        {/* App Name - 72px (text-6xl) using foreground variable */}
                        <h1 className="text-6xl font-bold tracking-tighter text-foreground">
                            better<span className="text-primary">Chess</span>
                        </h1>

                        <div className="flex items-center gap-3">
                            <Button variant="outline" size="icon" className="border-border bg-card text-card-foreground">
                                <Settings className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Search/Filter Bar */}
                    <div className="flex items-center gap-3 w-full max-w-xl">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Find a player or game..."
                                className="pl-10 bg-popover border-border focus:ring-primary/50 text-popover-foreground placeholder:text-muted-foreground"
                            />
                        </div>
                    </div>
                </header>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Play Options Section (Center) */}
                    <main className="lg:col-span-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Quick Play Card - Interactive Hover */}
                            <Card className="bg-card hover:bg-card-hover text-card-foreground border-border transition-all cursor-pointer group relative overflow-hidden shadow-sm">
                                <div className="absolute -top-10 -right-10 p-4 opacity-[0.07] group-hover:opacity-[0.12] transition-opacity">
                                    <Crown size={180} className="text-primary" />
                                </div>
                                {/* <div className="absolute w-full h-full z-0 opacity-30 group-hover:opacity-30 transition-opacity transform group-hover:scale-110 duration-500">
                                    <Image
                                        src="/assets/image.png"
                                        alt="Chess Board"
                                        className="object-cover"
                                        fill
                                        priority // Loads this immediately since it's a key UI element
                                    />
                                </div> */}

                                <button className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors z-20" onClick={handleOpenSettings}>
                                    <Settings className="h-5 w-5 text-muted-foreground" />
                                </button>

                                <CardHeader className="relative z-10">
                                    <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                                        <Play className="h-6 w-6 text-primary fill-primary" />
                                        Rapid (10 min)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="relative z-10">
                                    <p className="text-sm text-white/50 mb-6 max-w-sm">Jump into a classic rapid game against a player close to your rating.</p>
                                    <Button className="w-full bg-primary text-white/80 hover:opacity-90 flex items-center gap-2 group" onClick={() => router.push("/chessv6")}>
                                        Play Now
                                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Create Custom Card */}
                            <Card className="bg-card hover:bg-card-hover border-border transition-all cursor-pointer border-dashed border-2 text-card-foreground">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                                        <Plus className="h-6 w-6 text-muted-foreground" />
                                        Custom Game
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground mb-6">Set your own time control, choose color, or invite a specific friend.</p>
                                    <Button variant="secondary" className="w-full bg-muted text-muted-foreground hover:bg-accent hover:text-foreground">
                                        Create Table
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Active Lobby List */}
                        <div className="rounded-xl border border-border bg-card overflow-hidden text-card-foreground shadow-sm">
                            <div className="p-5 border-b border-border flex justify-between items-center bg-card-hover">
                                <h3 className="font-semibold text-lg">Open Challenges</h3>
                                <div className="flex items-center gap-3">
                                    <Badge variant="secondary" className="bg-primary/10 text-primary px-3 py-1">
                                        24 Online
                                    </Badge>
                                </div>
                            </div>
                            <div className="divide-y divide-border">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="p-5 flex items-center justify-between hover:bg-card-hover transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center font-bold text-primary text-lg border border-border">
                                                GM
                                            </div>
                                            <div>
                                                <div className="font-semibold text-foreground">GrandMaster_{i}00</div>
                                                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                                    <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> 10 min</span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1.5"><Trophy className="h-3.5 w-3.5" /> 1850 Rating</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button size="sm" className="bg-primary text-primary-foreground hover:opacity-90 px-5">Accept</Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </main>

                    {/* Sidebar (Leaderboard & Stats) */}
                    <aside className="lg:col-span-4 space-y-8">
                        <Card className="bg-card border-border border-none shadow-xl">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg font-semibold flex items-center gap-3 text-card-foreground">
                                    <Users className="h-5 w-5 text-primary" />
                                    Live Connections
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-card-hover/50">
                                    <div className="flex items-center gap-3">
                                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
                                        <span className="text-sm font-medium">Magnus_C</span>
                                    </div>
                                    <span className="text-xs text-primary font-mono">15m rapid</span>
                                </div>
                                <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-card-hover/50">
                                    <div className="flex items-center gap-3">
                                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
                                        <span className="text-sm font-medium">PlayerThree</span>
                                    </div>
                                    <Badge className="bg-danger text-danger-foreground text-[10px] px-2 py-0.5">In Game</Badge>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg opacity-60">
                                    <span className="h-2.5 w-2.5 rounded-full bg-muted border border-border" />
                                    <span className="text-sm text-muted-foreground italic">Hikaru is offline</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-card border border-primary/20 shadow-inner">
                            <CardContent className="p-6">
                                <div className="text-center">
                                    <Trophy className="h-10 w-10 text-primary mx-auto mb-3" />
                                    <div className="text-3xl font-bold text-card-foreground">1420</div>
                                    <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">Current Rapid Elo</div>
                                    <div className="mt-5 h-2 w-full bg-muted rounded-full overflow-hidden border border-border">
                                        <div className="h-full bg-primary w-[72%]" />
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">Next Milestone: 1500 (Expert)</p>
                                </div>
                            </CardContent>
                        </Card>
                    </aside>
                </div>
            </div>

            {/* Settings Dailog */}
            <BoardSettingsDialog open={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </div>
    );
};

export default ChessLobby;