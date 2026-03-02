"use client"
import React, { useState } from 'react';
import { 
  Menu, Bell, Mail, HelpCircle, Settings, 
  LogOut, ChevronRight, Sparkles, X, Info, 
  Users, Swords, Trophy, MoreVertical
} from 'lucide-react';

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import UserAccountDropdown from './UserAccountDropdown';
import { ThemeToggle } from '../ThemeToggle';

interface SocialNavbarProps {
  onMenuClick : () => void,
  onOpenNotification : () => void,
  onOpenInbox : () => void
}

export default function SocialNavbar({ onMenuClick, onOpenNotification, onOpenInbox }: SocialNavbarProps) {
  return (
    <TooltipProvider>
      <nav className="h-[72px] px-4 md:px-6 flex items-center justify-between bg-background sticky top-0 z-50 border-b border-border/10">
        
        {/* --- LEFT: LOGO & BREADCRUMBS --- */}
        <div className="flex items-center gap-1 md:gap-4">
          
          <div className="flex items-center gap-4 ml-1">

            <button 
              className="p-2.5 hover:bg-muted rounded-full text-muted-foreground transition-all lg:hidden"
              onClick={onMenuClick}
            >
              <Menu size={24} className="text-muted-foreground" />
            </button>
            
            {/* Breadcrumbs: Hidden on Mobile/Tablet, only visible on Large Screens */}
            <div className="hidden lg:flex items-center gap-2 bg-muted/40 px-4 py-2 rounded-full border border-border/20">
              <span className="text-sm text-muted-foreground font-medium">Network</span>
              <ChevronRight size={16} className="text-muted-foreground/40" />
              <span className="text-sm text-foreground font-semibold">Social Hub</span>
            </div>
          </div>
        </div>

        {/* --- RIGHT: ACTIONS --- */}
        <div className="flex items-center gap-1 md:gap-2">
          
          {/* Action Icons: Some hidden on mobile, accessible via 'More' if needed */}
          <div className="flex items-center gap-1 mr-1">
            <div className="hidden sm:flex items-center gap-1">
              <NavIconBtn icon={<Mail size={22} />} label="Messages" hasDot onOpen={onOpenInbox} />
              <NavIconBtn icon={<Bell size={22} />} label="Notifications" hasDot onOpen={onOpenNotification} />
            </div>

            <ModuleHelpDialog />

            {/* Mobile-only "More" menu for Mail/Notifications if you prefer to hide them */}
            <div className="sm:hidden">
               <MobileMoreActions onOpenNotification={onOpenNotification} onOpenMessages={onOpenInbox} />
            </div>
          </div>

          <UserAccountDropdown />
        </div>
      </nav>
    </TooltipProvider>
  );
}

// --- NEW COMPONENT: MOBILE MORE ACTIONS ---
function MobileMoreActions({ onOpenNotification, onOpenMessages }: { onOpenNotification : () => void, onOpenMessages: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-3 hover:bg-muted rounded-full text-muted-foreground transition-all">
          <MoreVertical size={22} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 rounded-2xl bg-card border-border mt-2">
        <DropdownMenuItem>
          <button className="gap-3 py-3 flex items-center" onClick={onOpenMessages}>
            <Mail size={18} /> Messages
          </button>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <button className="gap-3 py-3 flex items-center" onClick={onOpenNotification}>
            <Bell size={18} /> Notifications
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// --- MODULE HELP DIALOG ---
function ModuleHelpDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="relative p-3 hover:bg-muted rounded-full transition-all text-muted-foreground hover:text-foreground">
          <HelpCircle size={22} />
        </button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-[640px] rounded-[24px] md:rounded-[32px] p-0 border-none bg-card shadow-2xl overflow-hidden z-102">
        <div className="p-6 md:p-8">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-6 md:pb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                <Info size={22} />
              </div>
              <DialogTitle className="text-xl md:text-2xl font-medium tracking-tight">About Social Hub</DialogTitle>
            </div>
          </DialogHeader>

          <div className="space-y-6 md:space-y-8">
            <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
              The Social Hub is your central command for managing connections and tracking your standing within the Nexus network.
            </p>

            <div className="grid gap-5 md:gap-6">
              <HelpFeature 
                icon={<Users size={20} className="text-emerald-500 md:w-6 md:h-6" />} 
                title="Squad Management" 
                desc="Track your friends' live status and challenge them instantly."
              />
              <HelpFeature 
                icon={<Swords size={20} className="text-blue-500 md:w-6 md:h-6" />} 
                title="Discovery Engine" 
                desc="Find players that match your ELO range and playstyle."
              />
            </div>
          </div>

          <div className="mt-8 md:mt-10 pt-6 border-t border-border flex justify-end">
            <DialogClose asChild>
              <button className="w-full sm:w-auto px-8 py-2.5 bg-primary text-foreground rounded-full text-sm font-medium hover:bg-primary/70 transition-all">
                Got it
              </button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// --- UI ATOMS ---
function HelpFeature({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex gap-4">
      <div className="mt-0.5">{icon}</div>
      <div>
        <h4 className="font-semibold text-foreground text-sm md:text-base mb-0.5">{title}</h4>
        <p className="text-xs md:text-sm text-muted-foreground leading-normal">{desc}</p>
      </div>
    </div>
  );
}

function NavIconBtn({ icon, label, hasDot, onOpen }: { icon: React.ReactNode, label: string, hasDot?: boolean, onOpen : () => void }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button 
          className="relative p-3 hover:bg-muted rounded-full transition-all text-muted-foreground hover:text-foreground"
          onClick={onOpen}
        >
          {icon}
          {hasDot && (
            <span className="absolute top-3 right-3 h-2.5 w-2.5 bg-[#d93025] rounded-full border-[3px] border-background" />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="hidden sm:block bg-[#444746] text-white text-xs py-1.5 px-3 rounded-md border-none">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}