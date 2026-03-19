// ─────────────────────────────────────────────────────────────────────────────
// Chat panel
// ─────────────────────────────────────────────────────────────────────────────

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { BsChatDots } from "react-icons/bs";
import { FaPaperPlane, FaSmile } from "react-icons/fa";
import { IoClose, IoSearchOutline } from "react-icons/io5";

interface ChatMessage {
    id: string; sender: "me" | "opponent";
    type: "text" | "emoji" | "gif"; content: string; timestamp: Date;
};

const MOCK_GIFS = [
    { id: "g1", url: "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif", title: "chess" },
    { id: "g2", url: "https://media.giphy.com/media/3oEjI789af0AVurF60/giphy.gif", title: "thinking" },
    { id: "g3", url: "https://media.giphy.com/media/l46Cy1rHbQ92uuLXa/giphy.gif", title: "gg" },
    { id: "g4", url: "https://media.giphy.com/media/fUqfaPVjiAQcfticZH/giphy.gif", title: "winning" },
    { id: "g5", url: "https://media.giphy.com/media/26BRBKqUiq586bRVm/giphy.gif", title: "nice" },
    { id: "g6", url: "https://media.giphy.com/media/3ornk57KwDXf81rjWM/giphy.gif", title: "wow" },
];

const QUICK_EMOJIS = ["👍", "😂", "😮", "😢", "😡", "🎉", "🤝", "👏", "🔥", "❓", "⚡", "♟️", "🤔", "😤", "🙏", "💀"];

export function ChatPanel({
    messages, onSend, onClose,
}: {
    messages: ChatMessage[];
    onSend: (type: "text" | "emoji" | "gif", content: string) => void;
    onClose: () => void;
}) {
    const [input, setInput] = useState("");
    const [tab, setTab] = useState<"chat" | "emoji" | "gif">("chat");
    const [gifSearch, setGifSearch] = useState("");
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const send = () => {
        if (!input.trim()) return;
        onSend("text", input.trim());
        setInput("");
    };

    const filteredGifs = MOCK_GIFS.filter(g => !gifSearch || g.title.includes(gifSearch.toLowerCase()));

    return (
        <div className="flex flex-col h-full bg-card border-l border-border">
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border shrink-0">
                <BsChatDots className="text-primary text-base" />
                <span className="font-bold text-sm flex-1">Chat</span>
                <div className="flex gap-1 bg-muted rounded-lg p-1">
                    {(["chat", "emoji", "gif"] as const).map(t => (
                        <button key={t} onClick={() => setTab(t)}
                            className={cn(
                                "text-xs px-2.5 py-1 rounded-md font-semibold transition-all",
                                tab === t ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                            )}>
                            {t === "chat" ? "Chat" : t === "emoji" ? "😊" : "GIF"}
                        </button>
                    ))}
                </div>
                <button onClick={onClose} className="ml-1 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-accent">
                    <IoClose className="text-base" />
                </button>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-8">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-2xl">♟️</div>
                        <p className="text-sm text-muted-foreground">No messages yet.<br />Say hello! 👋</p>
                    </div>
                ) : messages.map(msg => (
                    <div key={msg.id} className={cn("flex gap-2 items-end", msg.sender === "me" ? "flex-row-reverse" : "flex-row")}>
                        <div className={cn(
                            "w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-black border-2",
                            msg.sender === "me"
                                ? "bg-neutral-50 text-neutral-900 border-neutral-200"
                                : "bg-neutral-900 text-white border-neutral-700"
                        )}>
                            {msg.sender === "me" ? "♔" : "♚"}
                        </div>
                        <div className={cn(
                            "max-w-[75%] rounded-2xl px-3 py-2",
                            msg.sender === "me"
                                ? "bg-primary text-primary-foreground rounded-br-sm"
                                : "bg-muted text-foreground rounded-bl-sm"
                        )}>
                            {msg.type === "gif"
                                ? <img src={msg.content} alt="gif" className="rounded-xl max-w-full max-h-28 object-cover" />
                                : <span className={cn("text-sm leading-relaxed", msg.type === "emoji" && "text-2xl")}>{msg.content}</span>
                            }
                            <p className={cn("text-[10px] mt-1 opacity-60", msg.sender === "me" ? "text-right" : "")}>
                                {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                        </div>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            {/* Emoji picker */}
            {tab === "emoji" && (
                <div className="border-t border-border p-3 bg-muted/30 shrink-0">
                    <div className="grid grid-cols-8 gap-1.5">
                        {QUICK_EMOJIS.map(e => (
                            <button key={e} onClick={() => { onSend("emoji", e); setTab("chat"); }}
                                className="text-xl hover:scale-125 transition-transform p-1 rounded-lg hover:bg-accent">
                                {e}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* GIF picker */}
            {tab === "gif" && (
                <div className="border-t border-border shrink-0 bg-muted/30">
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
                        <IoSearchOutline className="text-muted-foreground shrink-0" />
                        <input value={gifSearch} onChange={e => setGifSearch(e.target.value)}
                            placeholder="Search GIFs…"
                            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 p-2 max-h-36 overflow-y-auto">
                        {filteredGifs.map(g => (
                            <button key={g.id} onClick={() => { onSend("gif", g.url); setTab("chat"); }}
                                className="rounded-xl overflow-hidden border border-border hover:border-primary hover:scale-105 transition-all">
                                <img src={g.url} alt={g.title} className="w-full h-16 object-cover" />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Text input */}
            {tab === "chat" && (
                <div className="border-t border-border flex items-center gap-2 px-3 py-2.5 shrink-0 bg-card">
                    <button onClick={() => setTab("emoji")}
                        className="text-muted-foreground hover:text-primary transition-colors shrink-0">
                        <FaSmile className="text-lg" />
                    </button>
                    <button onClick={() => setTab("gif")}
                        className="text-muted-foreground hover:text-primary transition-colors text-xs font-black shrink-0">
                        GIF
                    </button>
                    <input value={input} onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && send()}
                        placeholder="Message…"
                        className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground min-w-0" />
                    <button onClick={send} disabled={!input.trim()}
                        className="text-primary hover:scale-110 transition-transform disabled:opacity-30 disabled:scale-100 flex-shrink-0">
                        <FaPaperPlane className="text-sm" />
                    </button>
                </div>
            )}
        </div>
    );
}