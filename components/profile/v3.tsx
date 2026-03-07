"use client"
import React, { useState } from 'react';
import {
  Trophy, Swords, Puzzle, History, CheckCircle2,
  MapPin, Calendar, Camera, ArrowUpRight,
  Target, Zap, Flame, Star
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";

export default function ModernProfile() {
  const [activeTab, setActiveTab] = useState('matches');

  return (
    <div className="min-h-screen bg-background text-foreground p-4 lg:p-8 selection:bg-primary/30">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* --- TOP SECTION: HERO BENTO --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Main Identity Card (7 Cols) */}
          <div className="lg:col-span-7 bg-card border border-border rounded-[3rem] p-8 lg:p-12 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32 transition-colors group-hover:bg-primary/20" />

            <div className="relative flex flex-col md:flex-row items-center md:items-end gap-8">
              <div className="relative">
                <div className="h-40 w-40 rounded-[2.5rem] bg-background border-2 border-border flex items-center justify-center text-6xl font-black text-primary shadow-inner">
                  G
                </div>
                <button className="absolute -bottom-2 -right-2 p-3 bg-foreground text-background rounded-2xl shadow-xl hover:scale-110 transition-all">
                  <Camera size={20} />
                </button>
              </div>

              <div className="flex-1 text-center md:text-left space-y-2">
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <h1 className="text-4xl font-black tracking-tighter">Grandmaster_OKLCH</h1>
                  <CheckCircle2 className="text-primary fill-primary/10" size={28} />
                </div>
                <p className="text-muted-foreground font-medium flex items-center justify-center md:justify-start gap-4">
                  <span>Alex River</span>
                  <span className="h-1 w-1 rounded-full bg-border" />
                  <span className="flex items-center gap-1"><MapPin size={14} /> Stockholm</span>
                </p>
                <div className="pt-4 flex flex-wrap justify-center md:justify-start gap-2">
                  <Badge label="Pro Member" />
                  <Badge label="Top 1%" />
                  <Badge label="Tactician" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Bento (5 Cols) */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-6">
            <div className="bg-primary text-primary-foreground rounded-[2.5rem] p-8 flex flex-col justify-between shadow-lg shadow-primary/20">
              <Trophy size={32} strokeWidth={2.5} />
              <div>
                <p className="text-5xl font-black italic tracking-tighter">1850</p>
                <p className="text-sm font-bold opacity-80 uppercase tracking-widest">Blitz Rating</p>
              </div>
            </div>
            <div className="bg-card border border-border rounded-[2.5rem] p-8 flex flex-col justify-between hover:border-primary/50 transition-colors">
              <Zap className="text-yellow-500" size={32} />
              <div>
                <p className="text-4xl font-black tracking-tighter">64.2%</p>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Win Rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* --- MIDDLE SECTION: DATA BENTO --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SmallStat icon={<Flame className="text-orange-500" />} label="Daily Streak" value="14 Days" />
          <SmallStat icon={<Target className="text-primary" />} label="Accuracy" value="91.4%" />
          <SmallStat icon={<Star className="text-blue-500" />} label="Best Win" value="2140" />
          <SmallStat icon={<Calendar className="text-muted-foreground" />} label="Member Since" value="Mar '26" />
        </div>

        {/* --- BOTTOM SECTION: CONTENT AREA --- */}
        <div className="bg-card border border-border rounded-[3rem] overflow-hidden">
          <div className="flex border-b border-border bg-muted/30 p-2">
            {['matches', 'friends', 'achievements'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 text-sm font-black uppercase tracking-widest transition-all rounded-2xl ${activeTab === tab ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-8">
            {activeTab === 'matches' && (
              <div className="space-y-4 max-w-4xl mx-auto">
                <ModernGameRow opponent="Magnus_Lover" result="Win" elo="+12" time="2h ago" />
                <ModernGameRow opponent="CheckmatePro" result="Loss" elo="-8" time="5h ago" />
                <ModernGameRow opponent="KasparovFan" result="Draw" elo="0" time="1d ago" />
              </div>
            )}
          </div>
        </div>

        {/* Floating Action Button (Edit Profile) */}
        <div className="fixed bottom-8 right-8 lg:bottom-12 lg:right-12">
          <EditProfileDialog />
        </div>
      </div>
    </div>
  );
}

// --- REFINED SUB-COMPONENTS ---

function Badge({ label }: { label: string }) {
  return (
    <span className="px-3 py-1 rounded-full bg-accent border border-border text-[10px] font-black uppercase tracking-tighter text-muted-foreground">
      {label}
    </span>
  );
}

function SmallStat({ icon, label, value }: any) {
  return (
    <div className="bg-card border border-border p-6 rounded-3xl flex items-center gap-4 hover:-translate-y-1 transition-all">
      <div className="h-12 w-12 rounded-2xl bg-background flex items-center justify-center border border-border">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
        <p className="text-xl font-black tracking-tight">{value}</p>
      </div>
    </div>
  );
}

function ModernGameRow({ opponent, result, elo, time }: any) {
  return (
    <div className="group flex items-center justify-between p-6 bg-background/50 border border-border rounded-4xl hover:bg-accent/50 transition-all">
      <div className="flex items-center gap-6">
        <div className={`h-12 w-12 rounded-full flex items-center justify-center font-black ${result === 'Win' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
          {result[0]}
        </div>
        <div>
          <h4 className="font-bold text-lg">vs {opponent}</h4>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">{time} • Blitz</p>
        </div>
      </div>
      <div className="flex items-center gap-8">
        <div className="text-right">
          <p className={`text-xl font-black ${elo.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>{elo}</p>
          <p className="text-[10px] font-bold text-muted-foreground uppercase">Points</p>
        </div>
        <ArrowUpRight size={20} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}

function EditProfileDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex items-center gap-3 bg-foreground text-background px-8 py-4 rounded-4xl font-black uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all">
          <Zap size={20} className="fill-current" />
          Customize
        </button>
      </DialogTrigger>
    </Dialog>);
}