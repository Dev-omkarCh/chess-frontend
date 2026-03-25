"use client"
import React, { useEffect, useState } from 'react';
import {
  Bell, Trash2, X, Swords, Settings2,
  Clock, Calendar, ChevronDown, Inbox,
  MoreHorizontal, Check, ShieldAlert
} from 'lucide-react';

import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import axios from 'axios';

export default function GeminiNotificationDialog({ isOpen, onOpenChange }: { isOpen?: boolean, onOpenChange?: (open: boolean) => void }) {
  const [selected, setSelected] = useState<string[]>([]);

  const notifications = [
    { id: '1', type: 'challenge', user: 'Magnus_Burner', time: '2m ago', desc: '5+0 Blitz Challenge', status: 'unread' },
    { id: '2', type: 'request', user: 'Hikaru_Fan', time: '1h ago', desc: 'Sent a friend request', status: 'unread' },
    { id: '3', type: 'system', user: 'Nexus Bot', time: '5h ago', desc: 'Your ELO has been updated to 2850', status: 'read' },
  ];

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="h-full w-full sm:h-[auto] sm:max-w-[640px] rounded-none sm:rounded-[28px] p-5 border-none sm:border border-border/40 bg-card text-card-foreground shadow-2xl overflow-hidden flex flex-col focus:outline-none z-105">

        <Tabs defaultValue="inbox" className="w-full flex flex-col h-full">

          {/* --- 72px RESPONSIVE HEADER --- */}
          <div className="h-[72px] px-4 md:px-6 flex items-center justify-between bg-muted/5 border-b border-border/40 shrink-0">
            <div className="flex items-center gap-3">
              {/* Mobile Close Button (Visible on <sm) */}
              <DialogTrigger asChild className="sm:hidden">
                <button className="p-2 hover:bg-muted rounded-full">
                  <X size={20} />
                </button>
              </DialogTrigger>

              {selected.length > 0 ? (
                <button
                  onClick={() => setSelected([])}
                  className="hidden sm:block p-2 hover:bg-muted rounded-full text-foreground transition-colors"
                >
                  <X size={20} />
                </button>
              ) : (
                <div className="hidden sm:flex p-2 bg-primary/10 rounded-xl text-primary">
                  <Inbox size={20} />
                </div>
              )}

              <DialogTitle className="text-[17px] md:text-[18px] font-medium tracking-tight truncate">
                {selected.length > 0 ? `${selected.length} Selected` : 'Notifications'}
              </DialogTitle>
            </div>

            <div className="flex items-center gap-2">
              {selected.length > 0 ? (
                <button className="flex items-center gap-2 text-destructive hover:bg-destructive/10 px-3 md:px-4 py-2 rounded-full text-sm font-semibold transition-all">
                  <Trash2 size={18} />
                  <span className="hidden xs:inline">Remove</span>
                </button>
              ) : (
                <div className="flex items-center bg-muted/50 sm:bg-muted/40 rounded-full p-1">
                  <TabsList className="bg-transparent h-7 md:h-8 p-0 gap-1">
                    <TabsTrigger value="inbox" className="rounded-full px-3 md:px-4 h-full text-[11px] md:text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">Inbox</TabsTrigger>
                    <TabsTrigger value="settings" className="rounded-full px-3 md:px-4 h-full text-[11px] md:text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">Settings</TabsTrigger>
                  </TabsList>
                </div>
              )}
            </div>
          </div>

          {/* --- CONTENT AREA (Responsive Scroll) --- */}
          <div className="flex-1 overflow-hidden">
            <TabsContent value="inbox" className="m-0 h-full overflow-y-auto no-scrollbar pb-20 sm:pb-4">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`
                    group flex items-start gap-3 md:gap-5 p-4 md:p-5 mx-2 my-1 rounded-[16px] md:rounded-[20px] transition-all cursor-pointer relative
                    ${selected.includes(n.id) ? 'bg-primary/5' : 'hover:bg-muted/40'}
                  `}
                  onClick={() => toggleSelect(n.id)}
                >
                  {/* Unread Indicator Bar */}
                  {n.status === 'unread' && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/5 bg-primary rounded-r-full" />
                  )}

                  <div className="pt-0.5">
                    <Checkbox
                      checked={selected.includes(n.id)}
                      className="h-5 w-5 rounded-md border-muted-foreground/30 data-[state=checked]:bg-primary"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="text-[14px] md:text-[15px] font-semibold text-foreground truncate pr-2">{n.user}</span>
                      <span className="text-[10px] md:text-[11px] font-medium text-muted-foreground shrink-0">{n.time}</span>
                    </div>
                    <p className="text-[13px] md:text-[14px] text-muted-foreground leading-relaxed mb-3 line-clamp-2 md:line-clamp-none">
                      {n.desc}
                    </p>

                    {n.type === 'challenge' && (
                      <div className="flex gap-2 w-full xs:w-auto">
                        <button className="flex-1 xs:flex-none px-5 md:px-8 py-2 bg-primary text-primary-foreground rounded-full text-[11px] md:text-xs font-bold hover:opacity-90 transition-all">
                          Accept
                        </button>
                        <button className="flex-1 xs:flex-none px-5 md:px-8 py-2 bg-muted text-muted-foreground rounded-full text-[11px] md:text-xs font-bold hover:bg-border/60 transition-all">
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="settings" className="m-0 p-4 md:p-8 space-y-6 md:space-y-10 h-full overflow-y-auto no-scrollbar">
              <div className="space-y-4 md:space-y-6">
                <h4 className="text-[11px] md:text-[13px] font-bold text-primary uppercase tracking-widest ml-1">Notifications Settings</h4>

                <div className="space-y-1 md:space-y-2">
                  <GeminiSettingsRow
                    title="Auto-delete read alerts"
                    desc="Removed automatically after reading."
                    action={<GeminiSelect options={['7 days', '30 days', 'Never']} />}
                  />
                  <GeminiSettingsRow
                    title="Storage Limit"
                    desc="Maximum items saved in feed."
                    action={<GeminiSelect options={['50 items', '100 items']} />}
                  />
                </div>
              </div>

              <div className="p-4 md:p-5 rounded-[20px] md:rounded-[24px] bg-primary/[0.03] border border-primary/10 flex gap-3 md:gap-4">
                <ShieldAlert className="text-primary shrink-0" size={18} />
                <p className="text-[12px] md:text-[13px] text-muted-foreground leading-relaxed">
                  Security updates and tournament invites are managed by system and cannot be auto-deleted.
                </p>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// --- GEMINI UI COMPONENTS ---

function GeminiSettingsRow({ title, desc, action }: any) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-muted/20 rounded-[20px] transition-colors">
      <div className="max-w-[70%]">
        <p className="text-[15px] font-medium text-foreground">{title}</p>
        <p className="text-[12px] text-muted-foreground mt-1 leading-normal">{desc}</p>
      </div>
      {action}
    </div>
  );
}

function GeminiSelect({ options }: { options: string[] }) {
  return (
    <div className="relative">
      <select className="appearance-none bg-muted/60 hover:bg-muted px-5 py-2.5 pr-10 rounded-full text-[13px] font-semibold text-foreground cursor-pointer outline-none border border-transparent transition-all">
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
    </div>
  );
}