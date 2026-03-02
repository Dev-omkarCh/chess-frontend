"use client"
import React, { useState } from 'react';
import { 
  User, Edit3, Trophy, Swords, 
  Puzzle, Users, History, Settings, 
  CheckCircle2, Globe, Calendar, Camera
} from 'lucide-react';
import { EditProfileDialog } from '@/components/profile/EditDailog';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('games');
  const [isEditing, setIsEditing] = useState(false);

  // Mock Data
  const [profile, setProfile] = useState({
    username: "Grandmaster_OKLCH",
    fullName: "Alex River",
    bio: "Chess enthusiast & UI Designer. Chasing the 2000 ELO dream.",
    location: "Stockholm, SE",
    joined: "March 2024",
    elo: 1850,
    winRate: "64%"
  });

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 lg:pb-10 transition-colors duration-500">
      
      {/* --- PROFILE HEADER / COVER --- */}
      <div className="h-48 lg:h-64 bg-linear-to-r from-primary/20 via-primary/5 to-background border-b border-border relative">
        <div className="max-w-5xl mx-auto h-full relative">
          {/* Avatar Positioned Overlap */}
          <div className="absolute -bottom-16 left-8 flex flex-col lg:flex-row lg:items-end gap-6">
            <div className="relative group">
              <div className="h-32 w-32 lg:h-40 lg:w-40 rounded-3xl bg-card border-4 border-background flex items-center justify-center text-5xl font-black text-primary shadow-2xl">
                {profile.username[0]}
              </div>
              <button className="absolute bottom-2 right-2 p-2 bg-primary text-primary-foreground rounded-xl shadow-lg hover:scale-110 transition-transform">
                <Camera size={18} />
              </button>
            </div>
            
            <div className="mb-4 space-y-1">
              <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                {profile.username}
                <CheckCircle2 size={24} className="text-primary" />
              </h1>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Globe size={14}/> {profile.location}</span>
                <span className="flex items-center gap-1"><Calendar size={14}/> Joined {profile.joined}</span>
              </div>
            </div>
          </div>

          <div className="absolute bottom-4 right-8 flex gap-3">
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-xl font-bold hover:bg-accent transition-all"
            >
              <Edit3 size={18} /> {isEditing ? "Save Profile" : "Edit Profile"}
            </button>
          </div>
        </div>
      </div>

      {/* --- STATS BAR --- */}
      <div className="max-w-5xl mx-auto mt-24 lg:mt-20 px-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Blitz Rating" value={profile.elo} icon={<Trophy className="text-primary"/>} />
        <StatCard label="Win Rate" value={profile.winRate} icon={<Swords className="text-emerald-500"/>} />
        <StatCard label="Puzzles" value="1,240" icon={<Puzzle className="text-purple-500"/>} />
        <StatCard label="Global Rank" value="#4,102" icon={<User className="text-blue-500"/>} />
      </div>

      {/* --- TABS NAVIGATION --- */}
      <div className="max-w-5xl mx-auto mt-12 px-8">
        <div className="flex border-b border-border gap-8 overflow-x-auto no-scrollbar">
          <TabButton active={activeTab === 'games'} onClick={() => setActiveTab('games')} label="Recent Games" icon={<History size={18}/>} />
          <TabButton active={activeTab === 'friends'} onClick={() => setActiveTab('friends')} label="Friends" icon={<Users size={18}/>} />
          <TabButton active={activeTab === 'puzzles'} onClick={() => setActiveTab('puzzles')} label="Solved Puzzles" icon={<Puzzle size={18}/>} />
        </div>

        {/* --- DYNAMIC CONTENT AREA --- */}
        <div className="py-8">
          {activeTab === 'games' && (
            <div className="space-y-4">
              <GameRow opponent="Magnus_Lover" result="Win" date="2h ago" elo="+12" />
              <GameRow opponent="CheckmatePro" result="Loss" date="5h ago" elo="-8" />
              <GameRow opponent="KasparovFan" result="Draw" date="Yesterday" elo="0" />
            </div>
          )}

          {activeTab === 'friends' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FriendCard name="Grandmaster_B" status="Online" elo={2100} />
              <FriendCard name="ChessQueen7" status="In Game" elo={1750} />
              <FriendCard name="TheRook" status="Offline" elo={1400} />
            </div>
          )}

          {activeTab === 'puzzles' && (
            <div className="bg-card border border-border rounded-3xl p-12 text-center space-y-4">
              <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
                <Puzzle size={32} />
              </div>
              <h3 className="text-xl font-bold">Puzzle History</h3>
              <p className="text-muted-foreground max-w-xs mx-auto text-sm">You haven't solved any puzzles today. Practice makes perfect!</p>
              <button className="bg-primary text-primary-foreground px-6 py-2 rounded-xl font-bold">Solve Now</button>
            </div>
          )}
        </div>

        {/* --- EDIT PROFILE DIALOG --- */}
        {isEditing && <EditProfileDialog isOpen={isEditing} onOpenChange={setIsEditing} />}
      </div>
    </div>
  );
}

// --- HELPER COMPONENTS ---

function StatCard({ label, value, icon }: any) {
  return (
    <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</span>
        {icon}
      </div>
      <div className="text-2xl font-black">{value}</div>
    </div>
  );
}

function TabButton({ active, onClick, label, icon }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 pb-4 px-2 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${active ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
    >
      {icon} {label}
    </button>
  );
}

function GameRow({ opponent, result, date, elo }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-card border border-border rounded-2xl hover:border-primary/50 transition-colors">
      <div className="flex items-center gap-4">
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center font-bold ${result === 'Win' ? 'bg-emerald-500/10 text-emerald-500' : result === 'Loss' ? 'bg-red-500/10 text-red-500' : 'bg-muted text-muted-foreground'}`}>
          {result[0]}
        </div>
        <div>
          <p className="font-bold text-sm lg:text-base">vs {opponent}</p>
          <p className="text-xs text-muted-foreground">{date}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-black ${elo.startsWith('+') ? 'text-emerald-500' : elo.startsWith('-') ? 'text-red-500' : ''}`}>{elo}</p>
        <p className="text-[10px] uppercase font-bold text-muted-foreground">Rating Change</p>
      </div>
    </div>
  );
}

function FriendCard({ name, status, elo }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-card border border-border rounded-2xl">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center font-bold text-lg">{name[0]}</div>
        <div>
          <p className="font-bold text-sm">{name}</p>
          <p className={`text-[10px] font-bold uppercase ${status === 'Online' ? 'text-emerald-500' : status === 'In Game' ? 'text-primary' : 'text-muted-foreground'}`}>
            ● {status}
          </p>
        </div>
      </div>
      <div className="bg-background px-3 py-1 rounded-lg border border-border text-xs font-bold">
        {elo}
      </div>
    </div>
  );
}