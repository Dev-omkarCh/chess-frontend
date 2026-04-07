// ─────────────────────────────────────────────────────────────────────────────
// Setup Screen
// ─────────────────────────────────────────────────────────────────────────────

"use client";
import { useState } from "react";
import { BsArrowLeft } from "react-icons/bs";
import { GiChessBishop, GiChessKing } from "react-icons/gi";
import { HiLightningBolt } from "react-icons/hi";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { useMatchMaking } from "@/hooks/useMatchMaking";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import { MatchPreferences } from "@/types/game";

interface TimeControl {
    label: string;
    seconds: number;
    desc: string;
    icon: React.ReactNode;
}

const TIME_CONTROLS: TimeControl[] = [
    { label: "1+0", seconds: 60, desc: "Bullet", icon: <HiLightningBolt className="text-yellow-400 text-xl" /> },
    { label: "3+0", seconds: 180, desc: "Blitz", icon: <HiLightningBolt className="text-orange-400 text-xl" /> },
    { label: "5+0", seconds: 300, desc: "Rapid", icon: <GiChessBishop className="text-emerald-400 text-xl" /> },
    { label: "10+0", seconds: 600, desc: "Classical", icon: <GiChessKing className="text-blue-400 text-xl" /> },
];

export const SetupScreen = () => {
    const [selectedTime, setSelectedTime] = useState(3);
    const [chatEnabled, setChatEnabled] = useState(true);

    const { isSearching, joinQueue, leaveQueue } = useMatchMaking();
    const router = useRouter();
    const startGame = () => {
        router.replace("/matchmaking");
        const preferences: MatchPreferences = {
            timeControl: TIME_CONTROLS[selectedTime].label,
            isChatEnabled: chatEnabled,
            type: "ranked",
            color: "random"
        }
        joinQueue(preferences);
    }

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-start gap-5">
            <Navbar />
            <div className="w-full max-w-lg">
                <button onClick={() => router.push("/dashboard")}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-10 transition-colors group font-medium">
                    <BsArrowLeft className="group-hover:-translate-x-0.5 transition-transform" />
                    Back to Lobby
                </button>

                <div className="flex items-center gap-4 mb-10">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <GiChessKing className="text-4xl text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight leading-none">New Game</h1>
                        <p className="text-muted-foreground mt-1">Configure your match settings</p>
                    </div>
                </div>

                {/* Time controls */}
                <div className="mb-8">
                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Time Control</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {TIME_CONTROLS.map((tc, i) => (
                            <button key={i} onClick={() => setSelectedTime(i)}
                                className={cn(
                                    "flex flex-col items-center gap-3 py-5 px-3 rounded-2xl border-2 transition-all font-semibold",
                                    selectedTime === i
                                        ? "border-primary bg-primary/8 shadow-xl shadow-primary/15 scale-[1.03]"
                                        : "border-border bg-card hover:border-primary/40 hover:bg-accent hover:scale-[1.01]"
                                )}>
                                <span className="text-3xl">{tc.icon}</span>
                                <div className="text-center">
                                    <p className={cn("font-black text-base leading-none", selectedTime === i ? "text-foreground" : "text-muted-foreground")}>{tc.label}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{tc.desc}</p>
                                </div>
                                {selectedTime === i && (
                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Chat toggle */}
                <div className="mb-8 bg-card border border-border rounded-2xl px-5 py-4 flex items-center justify-between">
                    <div>
                        <p className="font-bold text-base">In-game Chat</p>
                        <p className="text-sm text-muted-foreground mt-0.5">Send messages, emojis &amp; GIFs during the game</p>
                    </div>
                    <Switch checked={chatEnabled} onCheckedChange={setChatEnabled}
                        className="data-[state=checked]:bg-primary ml-4 bg-primary/50" />
                </div>

                {/* Summary */}
                <div className="mb-6 rounded-2xl bg-muted/50 border border-border px-5 py-4 flex items-center gap-4">
                    <span className="text-2xl">{TIME_CONTROLS[selectedTime].icon}</span>
                    <div className="text-sm text-muted-foreground">
                        <span className="font-bold text-foreground text-base">{TIME_CONTROLS[selectedTime].label} {TIME_CONTROLS[selectedTime].desc}</span>
                        <span className="mx-2">·</span>
                        Chat {chatEnabled ? <span className="text-primary font-semibold">enabled</span> : <span className="font-semibold">disabled</span>}
                    </div>
                </div>

                <button
                    onClick={() => startGame()}
                    className="w-full py-4 rounded-2xl text-lg font-black tracking-wide bg-primary text-primary-foreground hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl shadow-primary/25">
                    Start Game →
                </button>
            </div>
        </div>
    );
};

export default SetupScreen;