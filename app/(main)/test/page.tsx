"use client"
import React, { useState } from 'react';
import { 
  Play, Users, Bot, Settings, Trophy, 
  History, Swords, ChevronDown, User, 
  LogOut, Mail, BarChart3, Menu
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function ChessDashboard() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Mock User Data
  const user = {
    username: "Grandmaster_OKLCH",
    email: "pro_player@nexus.ai",
    elo: 1850,
    avatar: "G"
  };

  return (
    <div className="flex h-screen bg-background text-foreground transition-colors duration-500">
      
      {/* --- SIDEBAR --- */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-card border-r border-border flex flex-col transition-all duration-300`}>
        <div className="p-6 flex items-center gap-3 font-bold text-primary text-xl">
          <Swords size={28} />
          {isSidebarOpen && <span>BetterChess</span>}
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <SidebarItem icon={<Play size={20}/>} label="Play" active isOpen={isSidebarOpen} />
          <SidebarItem icon={<Trophy size={20}/>} label="Tournaments" isOpen={isSidebarOpen} />
          <SidebarItem icon={<History size={20}/>} label="Archive" isOpen={isSidebarOpen} />
          <SidebarItem icon={<BarChart3 size={20}/>} label="Stats" isOpen={isSidebarOpen} />
          <SidebarItem icon={<Users size={20}/>} label="Social" isOpen={isSidebarOpen} />
        </nav>

        <div className="p-4 border-t border-border">
          <SidebarItem icon={<Settings size={20}/>} label="Settings" isOpen={isSidebarOpen} />
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* --- TOP NAV BAR --- */}
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md flex items-center justify-between px-8 relative z-50">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-accent rounded-lg transition-colors">
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
              <Trophy size={16} className="text-primary" />
              <span className="text-sm font-bold text-primary">{user.elo} ELO</span>
            </div>

            <ThemeToggle />

            {/* Profile Dropdown Trigger */}
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1 pl-3 rounded-full hover:bg-accent border border-transparent hover:border-border transition-all"
              >
                <span className="text-sm font-medium">{user.username}</span>
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-lg shadow-primary/20">
                  {user.avatar}
                </div>
                <ChevronDown size={16} className={`transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Actual Dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-2xl shadow-2xl p-2 animate-in fade-in slide-in-from-top-2">
                  <div className="p-3 border-b border-border mb-2">
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Account</p>
                    <p className="text-sm font-semibold truncate">{user.email}</p>
                  </div>
                  <DropdownItem icon={<User size={16}/>} label="My Profile" />
                  <DropdownItem icon={<BarChart3 size={16}/>} label="Performance" />
                  <div className="h-px bg-border my-2" />
                  <DropdownItem icon={<LogOut size={16}/>} label="Sign Out" variant="danger" />
                </div>
              )}
            </div>
          </div>
        </header>

        {/* --- DASHBOARD BODY --- */}
        <main className="flex-1 overflow-y-auto p-8 bg-gradient-to-b from-background to-primary/5">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex flex-col gap-2">
              <h1 className="text-4xl font-black tracking-tight">Ready for a match?</h1>
              <p className="text-muted-foreground">Select your game mode and start climbing the leaderboard.</p>
            </div>

            {/* Game Mode Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <GameCard 
                icon={<Play className="text-emerald-500" size={32}/>} 
                title="Quick Play" 
                desc="Jump into a 5+0 Blitz match" 
                primary
              />
              <GameCard 
                icon={<Users className="text-blue-500" size={32}/>} 
                title="With Friend" 
                desc="Invite a friend to a private game" 
              />
              <GameCard 
                icon={<Bot className="text-purple-500" size={32}/>} 
                title="VS Engine" 
                desc="Practice against Stockfish 16" 
              />
            </div>

            {/* Placeholder for Recent Games / Daily Puzzle */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
              <div className="bg-card border border-border rounded-3xl p-6 h-64 flex items-center justify-center text-muted-foreground italic">
                Recent Games Feed
              </div>
              <div className="bg-card border border-border rounded-3xl p-6 h-64 flex items-center justify-center text-muted-foreground italic">
                Daily Chess Puzzle
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// --- HELPER COMPONENTS ---

function SidebarItem({ icon, label, active = false, isOpen }: { icon: any, label: string, active?: boolean, isOpen: boolean }) {
  return (
    <button className={`
      w-full flex items-center gap-4 p-3 rounded-xl transition-all group
      ${active ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'hover:bg-accent text-muted-foreground hover:text-foreground'}
    `}>
      <span className={active ? '' : 'text-primary'}>{icon}</span>
      {isOpen && <span className="font-semibold">{label}</span>}
    </button>
  );
}

function DropdownItem({ icon, label, variant = 'default' }: { icon: any, label: string, variant?: 'default' | 'danger' }) {
  return (
    <button className={`
      w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-colors
      ${variant === 'danger' ? 'text-red-500 hover:bg-red-500/10' : 'hover:bg-accent'}
    `}>
      {icon}
      {label}
    </button>
  );
}

function GameCard({ icon, title, desc, primary = false }: { icon: any, title: string, desc: string, primary?: boolean }) {
  return (
    <button className={`
      group p-8 rounded-[2rem] border transition-all text-left space-y-4
      ${primary ? 'bg-card border-primary shadow-xl scale-105 ring-1 ring-primary/50' : 'bg-card border-border hover:border-primary/50 hover:shadow-lg'}
    `}>
      <div className="bg-background w-16 h-16 rounded-2xl flex items-center justify-center border border-border group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div>
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
      </div>
    </button>
  );
}