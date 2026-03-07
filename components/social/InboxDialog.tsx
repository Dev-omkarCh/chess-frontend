"use client"
import React, { useState } from 'react';
import { 
  MessageSquare, Trash2, Pin, CheckCheck, 
  Gamepad2, ShieldCheck, User, Search, 
  MoreVertical, X, Filter, ChevronRight,
  Inbox
} from 'lucide-react';

import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type MessageType = 'system' | 'game' | 'user';

interface Message {
  id: string;
  type: MessageType;
  sender: string;
  preview: string;
  time: string;
  isRead: boolean;
  isPinned: boolean;
}

interface InboxDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function InboxDialog({ isOpen, onOpenChange }: InboxDialogProps) {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', type: 'system', sender: 'Security Team', preview: 'Your login from Tokyo was verified.', time: '10m', isRead: false, isPinned: true },
    { id: '2', type: 'game', sender: 'Tournament Bot', preview: 'Round 4 starts in 5 minutes! Prepare your board.', time: '1h', isRead: false, isPinned: false },
    { id: '3', type: 'user', sender: 'Magnus_Burner', preview: 'GG! That knight fork was insane. Rematch?', time: '2h', isRead: true, isPinned: false },
    { id: '4', type: 'user', sender: 'Hikaru_Fan', preview: 'Are you joining the blitz arena tonight?', time: 'Yesterday', isRead: true, isPinned: false },
  ]);

  const [activeTab, setActiveTab] = useState<string>('all');

  // --- ACTIONS ---
  const toggleRead = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: true } : m));
  };

  const togglePin = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, isPinned: !m.isPinned } : m));
  };

  const deleteMessage = (id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  const deleteAll = () => {
    if (confirm("Delete all messages in this category?")) {
      setMessages(prev => prev.filter(m => activeTab !== 'all' ? m.type !== activeTab : false));
    }
  };

  const filteredMessages = messages
    .filter(m => activeTab === 'all' || m.type === activeTab)
    .sort((a, b) => (a.isPinned === b.isPinned ? 0 : a.isPinned ? -1 : 1));

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="h-full w-full sm:h-[85vh] sm:max-w-[900px] rounded-none sm:rounded-[32px] p-0 border-none sm:border border-border/40 bg-card text-card-foreground shadow-2xl overflow-hidden flex flex-col focus:outline-none z-105">
        
        {/* --- 72px HEADER STRUCTURE --- */}
        <header className="h-[72px] px-6 flex items-center justify-between bg-muted/5 border-b border-border/40 shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-xl text-primary hidden sm:block">
              <MessageSquare size={20} />
            </div>
            <DialogTitle className="text-[20px] font-semibold tracking-tight">Inbox</DialogTitle>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input 
                placeholder="Search mail..." 
                className="bg-muted/50 border-none rounded-full py-2 pl-10 pr-4 text-sm w-[200px] focus:w-[280px] transition-all outline-none"
              />
            </div>
            <button 
              onClick={deleteAll}
              className="p-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-all"
              title="Delete All"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* --- SIDEBAR NAVIGATION (Gemini Style) --- */}
          <nav className="w-[70px] sm:w-[200px] border-r border-border/40 flex flex-col py-4 gap-2 bg-muted/5">
            <NavBtn active={activeTab === 'all'} onClick={() => setActiveTab('all')} icon={<Inbox size={18}/>} label="All" />
            <NavBtn active={activeTab === 'user'} onClick={() => setActiveTab('user')} icon={<User size={18}/>} label="Messages" />
            <NavBtn active={activeTab === 'game'} onClick={() => setActiveTab('game')} icon={<Gamepad2 size={18}/>} label="Game" />
            <NavBtn active={activeTab === 'system'} onClick={() => setActiveTab('system')} icon={<ShieldCheck size={18}/>} label="System" />
          </nav>

          {/* --- MESSAGE LIST --- */}
          <main className="flex-1 overflow-y-auto no-scrollbar bg-background/50">
            <div className="p-2">
              {filteredMessages.map((msg) => (
                <div 
                  key={msg.id}
                  onDoubleClick={() => toggleRead(msg.id)}
                  className={`
                    group flex items-center gap-4 p-4 rounded-[24px] mb-1 transition-all cursor-pointer relative
                    ${msg.isRead ? 'opacity-80' : 'bg-card shadow-sm border border-border/20'}
                    hover:bg-muted/50 hover:shadow-md
                  `}
                >
                  {/* Type Icon */}
                  <div className={`
                    h-12 w-12 rounded-2xl flex items-center justify-center shrink-0
                    ${msg.type === 'system' ? 'bg-amber-500/10 text-amber-500' : 
                      msg.type === 'game' ? 'bg-indigo-500/10 text-indigo-500' : 
                      'bg-primary/10 text-primary'}
                  `}>
                    {msg.type === 'system' ? <ShieldCheck size={20}/> : msg.type === 'game' ? <Gamepad2 size={20}/> : <User size={20}/>}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      {msg.isPinned && <Pin size={12} className="text-primary fill-primary" />}
                      <span className={`text-[15px] truncate ${!msg.isRead ? 'font-bold text-foreground' : 'font-medium text-muted-foreground'}`}>
                        {msg.sender}
                      </span>
                      <span className="text-[11px] text-muted-foreground ml-auto whitespace-nowrap">{msg.time}</span>
                    </div>
                    <p className={`text-[13px] truncate ${!msg.isRead ? 'text-foreground/90' : 'text-muted-foreground'}`}>
                      {msg.preview}
                    </p>
                  </div>

                  {/* Hover Actions (Gemini Floating Style) */}
                  <div className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-background/80 backdrop-blur-md p-1.5 rounded-full shadow-lg border border-border/40">
                    <ActionBtn onClick={() => toggleRead(msg.id)} icon={<CheckCheck size={16}/>} label="Mark Read" />
                    <ActionBtn onClick={() => togglePin(msg.id)} icon={<Pin size={16} className={msg.isPinned ? 'fill-primary text-primary' : ''}/>} label="Pin" />
                    <ActionBtn onClick={() => deleteMessage(msg.id)} icon={<Trash2 size={16}/>} label="Delete" variant="danger" />
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// --- INTERNAL ATOMS ---

function NavBtn({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`
        flex items-center gap-4 px-4 py-3 mx-2 rounded-full transition-all
        ${active ? 'bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-muted'}
      `}
    >
      {icon}
      <span className="hidden sm:inline text-sm">{label}</span>
    </button>
  );
}

function ActionBtn({ onClick, icon, label, variant = 'default' }: any) {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button 
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className={`p-2 rounded-full transition-colors ${variant === 'danger' ? 'hover:bg-destructive/10 hover:text-destructive' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
          >
            {icon}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-[10px] py-1 px-2 rounded-md bg-foreground text-background">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}