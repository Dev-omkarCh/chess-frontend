"use client"
import React from 'react';
import { 
  Search, Plus, ChevronLeft, Trophy, Swords, Sparkles, X 
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (val: boolean) => void;
}

export default function Sidebar({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }: SidebarProps) {
  return (
    <TooltipProvider>
      {/* MOBILE OVERLAY (Only visible when mobile menu is open) */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] lg:hidden" 
          onClick={() => setIsMobileOpen(false)} 
        />
      )}

      <aside className={`
        /* Layout Strategy */
        fixed inset-y-0 left-0 z-[101] flex flex-col bg-background border-r border-border/40 transition-all duration-300
        
        /* Mobile: Hidden by default, slide in when opened */
        ${isMobileOpen ? 'translate-x-0 w-[300px]' : '-translate-x-full'}
        
        /* Desktop: Fixed in place, part of the layout flow */
        lg:relative lg:translate-x-0 
        ${isCollapsed ? 'lg:w-[80px]' : 'lg:w-[320px]'}
      `}>
        
        {/* HEADER (72px) */}
        <div className="h-[72px] px-6 flex items-center justify-between shrink-0">
          {(!isCollapsed || isMobileOpen) && (
            <div className="flex items-center gap-3 animate-in fade-in">
              <Sparkles size={24} className="text-[#4285F4]" />
              <span className="text-[20px] font-medium">Better Chess</span>
            </div>
          )}
          
          <button 
            onClick={() => isMobileOpen ? setIsMobileOpen(false) : setIsCollapsed(!isCollapsed)}
            className="p-2.5 hover:bg-muted rounded-full text-muted-foreground transition-all"
          >
            {isMobileOpen ? <X size={22} /> : <ChevronLeft className={`hidden lg:block transition-transform duration-500 ${isCollapsed ? 'rotate-180' : ''}`} size={22} />}
          </button>
        </div>

        {/* CONTENT - SEARCH */}
        {(!isCollapsed || isMobileOpen) && (
          <div className="px-5 py-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <input type="text" placeholder="Search friends" className="w-full h-[48px] pl-12 pr-4 rounded-2xl bg-muted/50 border-none outline-none text-[15px] focus:ring-2 focus:ring-[#4285F4]/20 transition-all" />
            </div>
          </div>
        )}

        {/* FRIENDS LIST */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-3 space-y-1">
          <FriendItem name="Magnus_Burner" status="online" elo={2850} isCollapsed={isCollapsed && !isMobileOpen} />
          <FriendItem name="Hikaru_Fan" status="online" elo={2450} isCollapsed={isCollapsed && !isMobileOpen} />
          <FriendItem name="GothamChess" status="offline" elo={2320} isCollapsed={isCollapsed && !isMobileOpen} />
        </div>

        {/* FOOTER STATS */}
        <div className="p-4 mt-auto">
          {(!isCollapsed || isMobileOpen) ? (
             <div className="bg-muted/30 rounded-[24px] p-5 border border-border/20">
               <p className="text-sm font-bold">Pro Tier</p>
               <div className="h-1.5 w-full bg-border/40 rounded-full mt-2 overflow-hidden">
                 <div className="h-full bg-primary w-[85%] rounded-full" />
               </div>
             </div>
          ) : (
            <div className="flex justify-center py-4"><Trophy size={22} className="text-muted-foreground" /></div>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}

function FriendItem({ name, status, elo, isCollapsed }: any) {
  const isOnline = status === 'online';
  return (
    <div className={`flex items-center gap-4 p-3 mx-2 rounded-[20px] transition-all cursor-pointer ${isOnline ? 'hover:bg-muted/60' : 'opacity-40 grayscale'} ${isCollapsed ? 'justify-center mx-0' : ''}`}>
      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center font-bold relative shrink-0">
        {name[0]}
        {isOnline && <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 border-[3px] border-background" />}
      </div>
      {!isCollapsed && (
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between"><span className="text-[15px] font-medium truncate">{name}</span><span className="text-[12px] opacity-60">{elo}</span></div>
        </div>
      )}
    </div>
  );
}