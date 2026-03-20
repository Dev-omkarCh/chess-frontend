// ─────────────────────────────────────────────────────────────────────────────
// Move navigation bar
// ─────────────────────────────────────────────────────────────────────────────

import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export function MoveNav({
    onFirst, onBack, onForward, onLast, onReturnLive,
    canBack, canForward, isViewing,
}: {
    onFirst: () => void; onBack: () => void; onForward: () => void;
    onLast: () => void; onReturnLive: () => void;
    canBack: boolean; canForward: boolean; isViewing: boolean;
}) {
    return (
        <div className="flex items-center gap-1">
            <button onClick={onFirst} disabled={!canBack}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                ⏮
            </button>
            <button onClick={onBack} disabled={!canBack}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                <FaChevronLeft className="text-xs" />
            </button>
            <button onClick={onForward} disabled={!canForward}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                <FaChevronRight className="text-xs" />
            </button>
            <button onClick={onLast} disabled={!canForward}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                ⏭
            </button>
            {isViewing && (
                <button onClick={onReturnLive}
                    className="ml-1 px-2.5 h-8 rounded-lg text-xs font-bold bg-blue-500/10 text-blue-500 border border-blue-500/25 hover:bg-blue-500/20 transition-all">
                    Live ↩
                </button>
            )}
        </div>
    );
}