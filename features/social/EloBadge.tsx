// ─────────────────────────────────────────────────────────────────────────────
// Elo badge
// ─────────────────────────────────────────────────────────────────────────────

import { Trophy } from "lucide-react";

interface EloBadgeProps {
    elo: number;
}

function EloBadge({ elo }: EloBadgeProps) {
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-[11px] font-mono font-bold">
            <Trophy size={9} strokeWidth={2.5} />
            {elo}
        </span>
    );
}

export default EloBadge;