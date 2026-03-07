"use client"
import React, { useState } from 'react';
import { 
  User, Edit3, Trophy, Swords, Puzzle, 
  History, CheckCircle2, Globe, Calendar, 
  ShieldCheck, TrendingUp, MapPin, Camera,
  Settings, Award, Medal
} from 'lucide-react';
/* Note: In a real project, import these from your shadcn components folder:
  import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
*/

export default function ProfilePage2() {
  const [activeTab, setActiveTab] = useState('games');

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      
      {/* Main Layout Container */}
      <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row min-h-screen">
        
        {/* --- LEFT SIDE: THE PREMIUM SIDEBAR (Desktop) --- */}
        <aside className="w-full lg:w-[380px] lg:border-r border-border bg-card/30 backdrop-blur-xl lg:sticky lg:top-0 lg:h-screen overflow-y-auto no-scrollbar">
          
          {/* Cover Photo Area */}
          <div className="h-32 bg-gradient-to-br from-primary/40 to-primary/5 relative" />
          
          <div className="px-8 -mt-16 pb-12 space-y-8">
            {/* Avatar & Basic Info */}
            <div className="space-y-4">
              <div className="relative inline-block group">
                <div className="h-32 w-32 rounded-[2.5rem] bg-card border-4 border-background shadow-2xl flex items-center justify-center text-4xl font-black text-primary transition-transform group-hover:scale-[1.02]">
                  G
                </div>
                <button className="absolute bottom-1 right-1 p-2.5 bg-primary text-primary-foreground rounded-2xl shadow-lg hover:scale-110 transition-all border-4 border-background">
                  <Camera size={18} />
                </button>
              </div>
              
              <div>
                <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                  Grandmaster_OKLCH <CheckCircle2 size={20} className="text-primary fill-primary/10" />
                </h1>
                <p className="text-muted-foreground font-medium">Alex River</p>
              </div>
              
              <p className="text-sm leading-relaxed text-muted-foreground">
                Obsessed with the Sicilian Defense. Designing pixels by day, taking kings by night. ♟️
              </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-3xl bg-primary/5 border border-primary/10">
                <p className="text-xs font-bold text-primary/60 uppercase mb-1">Blitz</p>
                <p className="text-xl font-black italic">1850</p>
              </div>
              <div className="p-4 rounded-3xl bg-accent/50 border border-border">
                <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Win %</p>
                <p className="text-xl font-black italic">64.2</p>
              </div>
            </div>

            {/* List Details */}
            <div className="space-y-4 pt-4 border-t border-border">
              <SidebarLink icon={<MapPin size={18}/>} label="Stockholm, Sweden" />
              <SidebarLink icon={<Calendar size={18}/>} label="Joined March 2026" />
              <SidebarLink icon={<ShieldCheck size={18}/>} label="Verified Instructor" />
            </div>

            {/* Shadcn Dialog Trigger for Edit */}
            <button className="w-full py-4 bg-foreground text-background rounded-3xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-xl shadow-foreground/10">
              <Edit3 size={18} /> Edit Profile
            </button>
          </div>
        </aside>

        {/* --- RIGHT SIDE: THE CONTENT FEED --- */}
        <main className="flex-1 p-6 lg:p-12 lg:pl-20">
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
            <div className="flex bg-muted/50 p-1.5 rounded-2xl border border-border w-fit">
              {['games', 'friends', 'puzzles'].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-8 py-2.5 rounded-xl text-sm font-bold capitalize transition-all ${activeTab === tab ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            <div className="flex gap-3">
               <div className="flex -space-x-3">
                  {[1,2,3].map(i => <div key={i} className="h-10 w-10 rounded-full bg-accent border-2 border-background flex items-center justify-center text-xs font-bold">F{i}</div>)}
               </div>
               <button className="h-10 px-4 rounded-xl border border-border text-sm font-bold hover:bg-accent">View All Friends</button>
            </div>
          </header>

          <div className="space-y-6 max-w-4xl">
            {activeTab === 'games' && (
              <>
                <h3 className="text-xl font-black tracking-tight">Recent Activity</h3>
                <GameRow opponent="Magnus_Lover" result="Win" date="2h ago" elo="+12" />
                <GameRow opponent="CheckmatePro" result="Loss" date="5h ago" elo="-8" />
                <GameRow opponent="KasparovFan" result="Draw" date="Yesterday" elo="0" />
                <button className="w-full py-4 rounded-3xl border border-dashed border-border text-muted-foreground font-bold hover:border-primary/50 hover:text-primary transition-all">
                  Load More Matches
                </button>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function SidebarLink({ icon, label }: { icon: any, label: string }) {
  return (
    <div className="flex items-center gap-3 text-muted-foreground group cursor-default">
      <span className="text-primary/70 group-hover:text-primary transition-colors">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

function GameRow({ opponent, result, date, elo }: any) {
  return (
    <div className="group flex items-center justify-between p-6 bg-card border border-border rounded-[2rem] hover:border-primary/40 transition-all hover:translate-x-1">
      <div className="flex items-center gap-6">
        <div className={`h-14 w-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner ${result === 'Win' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
          {result[0]}
        </div>
        <div>
          <p className="font-black text-lg">vs {opponent}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold uppercase tracking-wider">
             <Medal size={12} className="text-primary" /> {date} • Standard Blitz
          </div>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className={`text-xl font-black italic ${elo.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>{elo}</p>
          <p className="text-[10px] uppercase font-black text-muted-foreground tracking-tighter">Points</p>
        </div>
      </div>
    </div>
  );
}