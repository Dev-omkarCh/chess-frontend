// ─────────────────────────────────────────────────────────────────────────────
// Lobby Screen
// ─────────────────────────────────────────────────────────────────────────────

import { cn } from "@/lib/utils";
import { GiChessKing } from "react-icons/gi";

interface LobbyScreenProps {
    onNewGame: () => void;
    username: string
};

export const LobbyScreen = ({ onNewGame, username }: LobbyScreenProps) => {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
            <div className="text-center w-full max-w-sm">
                {/* Decorative mini board */}
                <div className="relative inline-block mb-10 mx-auto">
                    <div className="grid grid-cols-4 w-32 h-32 rounded-3xl overflow-hidden shadow-2xl border-4 border-border mx-auto">
                        {Array.from({ length: 16 }).map((_, i) => (
                            <div key={i} className={cn(
                                "w-full h-full",
                                (Math.floor(i / 4) + (i % 4)) % 2 === 0
                                    ? "bg-[oklch(0.91_0.03_95)]"
                                    : "bg-[oklch(0.48_0.10_155)]"
                            )} />
                        ))}
                    </div>
                    <GiChessKing className="absolute inset-0 m-auto text-6xl text-white filter-[drop-shadow(0_4px_12px_rgba(0,0,0,0.6))]" />
                </div>

                <h1 className="text-5xl font-black tracking-tight mb-2">Chess</h1>
                <p className="text-muted-foreground text-base mb-1">
                    Welcome back, <span className="text-foreground font-bold">{username}</span>
                </p>
                <p className="text-sm text-muted-foreground/60 mb-12">Play · Think · Win</p>

                <button
                    onClick={onNewGame}
                    className="w-full py-4 rounded-2xl text-lg font-black bg-primary text-primary-foreground hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl shadow-primary/25 mb-4">
                    ♟ New Game
                </button>
                <p className="text-sm text-muted-foreground/50">More modes coming soon</p>
            </div>
        </div>
    );
};