// ─────────────────────────────────────────────────────────────────────────────
// Inbox Dialog
// ─────────────────────────────────────────────────────────────────────────────

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn, relativeTime } from "@/lib/utils";
import { InboxMessage } from "@/types/social";
import { ChevronRight, Gift, Inbox, MessageSquare, ShieldAlert } from "lucide-react";
import { useState } from "react";

type InboxTab = "inbox" | "system";

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

interface InboxDialogProps {
    open: boolean;
    onClose: () => void;
    messages: InboxMessage[];
}

function InboxDialog({ open, onClose, messages }: InboxDialogProps) {
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
                                    "w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 mt-0.5",
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
                                        <div className="flex items-center gap-2 shrink-0">
                                            {!m.isRead && <span className="w-2 h-2 rounded-full bg-primary shadow-sm shadow-primary/50" />}
                                            <span className="text-xs text-muted-foreground/50">{relativeTime(m.createdAt)}</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1 leading-relaxed">{m.body}</p>
                                </div>
                                <ChevronRight
                                    size={15}
                                    className={cn(
                                        "text-muted-foreground/30 shrink-0 mt-1 transition-transform duration-200",
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

export default InboxDialog;