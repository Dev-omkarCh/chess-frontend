"use client"
import React, { useEffect, useState } from 'react';
import {
  User, Edit3, Trophy, Swords,
  Puzzle, Users, History, CheckCircle2,
  Globe, Calendar, Camera, ShieldCheck,
  TrendingUp, MapPin
} from 'lucide-react';
import { EditProfileDialog } from '@/components/profile/EditDailog';
import { useParams } from 'next/navigation';
import { Friend } from '@/types/social';
import axios from 'axios';
import apiClient from '@/api/axois';
import LoadingSpinner from '@/components/LoadingSpinner';

interface UserProfile {
  _id: string,
  username: string,
  fullName: string,
  email: string,
  avatar: string,
  elo: number,
  lastLogin: string,
  isVerified: boolean,
  isOnline: boolean,
  bio: string,
  gender: "male" | "female" | "other",
  role: string,
  streaks: number,
  aiCredits: number,
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('games');
  const [isEditing, setIsEditing] = useState(false);
  const { id } = useParams();

  const [friends, setFriends] = useState<Friend[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const getUserProfile = async () => {
    try {
      const response = await apiClient.get(`/v1/users/${id}`);
      const user = response.data.data as UserProfile;
      console.log("[User Profile] Response: ", user);
      setUserProfile(user);
    } catch (error) {
      console.log("[User Profile] Error Fetching User Profile: ", error);
    }
  }

  const getFriends = async () => {
    try {
      const response = await axios.get(`/api/v1/friends/`);
      const user = response.data.data as Friend[];
      console.log("[Get Friends] Response: ", user);
      setFriends(user);
    } catch (error) {
      console.log("[User Profile] Error Fetching User Profile: ", error);
    }
  }

  useEffect(() => {
    getUserProfile();
    getFriends();
  }, []);

  if (!userProfile) {
    return (
      <div className='min-h-screen w-screen flex justify-center items-center'><LoadingSpinner size={10} /></div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">

      {/* --- MOBILE ONLY HEADER (Stacks on top) --- */}
      <div className="lg:hidden w-full h-48 bg-linear-to-b from-primary/20 to-background border-b border-border flex flex-col items-center justify-center p-6 text-center">
        <div className="h-24 w-24 rounded-2xl bg-card border-2 border-primary/20 flex items-center justify-center text-3xl font-black text-primary shadow-xl mb-3">
          {userProfile?.avatar ? <img src={userProfile.avatar} alt={userProfile.username} className='w-full h-full object-cover' /> : userProfile?.username?.charAt(0)}
        </div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          {userProfile.username} <CheckCircle2 size={16} className="text-primary" />
        </h1>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* --- LEFT SIDE: STICKY PROFILE CARD (Desktop) --- */}
          <aside className="lg:w-1/3 xl:w-1/4">
            <div className="lg:sticky lg:top-24 space-y-6">
              <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden">
                {/* Subtle Background Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />

                <div className="relative flex flex-col items-center text-center space-y-4">
                  <div className="hidden lg:flex h-32 w-32 rounded-4xl bg-background border border-border items-center justify-center text-5xl font-black text-primary shadow-inner">
                    {userProfile.username}
                  </div>

                  <div className="space-y-1">
                    <h2 className="text-2xl font-black tracking-tight hidden lg:block">{userProfile.username}</h2>
                    <p className="text-muted-foreground text-sm font-medium">{userProfile.fullName}</p>
                  </div>

                  <p className="text-sm leading-relaxed text-muted-foreground/90 italic">
                    "{userProfile.bio}"
                  </p>

                  <div className="w-full pt-4 space-y-3">
                    <ProfileDetail icon={<MapPin size={16} />} text={userProfile.lastLogin} />
                    <ProfileDetail icon={<Calendar size={16} />} text={`Joined ${userProfile.lastLogin}`} />
                    <ProfileDetail icon={<ShieldCheck size={16} />} text="Verified Master" />
                  </div>

                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="w-full mt-4 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-2xl font-bold hover:brightness-110 transition-all shadow-lg shadow-primary/20"
                  >
                    <Edit3 size={18} /> Edit Profile
                  </button>
                </div>
              </div>

              {/* Quick Stats Card */}
              <div className="bg-primary/5 border border-primary/10 rounded-4xl p-6 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-primary/70 px-2">Performance</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 px-2">
                    <p className="text-2xl font-black">{userProfile.elo}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Blitz ELO</p>
                  </div>
                  <div className="space-y-1 px-2">
                    <p className="text-2xl font-black">{userProfile.lastLogin}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Win Ratio</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* --- RIGHT SIDE: CONTENT FEED (Scrollable) --- */}
          <main className="flex-1 space-y-8">
            {/* Desktop-only Tab Switcher */}
            <div className="flex bg-card/50 p-1.5 rounded-2xl border border-border w-fit">
              <button
                onClick={() => setActiveTab('games')}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'games' ? 'bg-card text-primary shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Match History
              </button>
              <button
                onClick={() => setActiveTab('friends')}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'friends' ? 'bg-card text-primary shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Friends
              </button>
              <button
                onClick={() => setActiveTab('puzzles')}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'puzzles' ? 'bg-card text-primary shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Puzzles
              </button>
            </div>

            {/* Content Display */}
            <div className="animate-in fade-in duration-500">
              {activeTab === 'games' && (
                <div className="grid gap-4">
                  <h3 className="text-lg font-bold flex items-center gap-2 mb-2">
                    <History size={20} className="text-primary" /> Recent Matches
                  </h3>
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
                <div className="bg-card border border-border rounded-[2.5rem] p-12 text-center space-y-4">
                  <div className="h-20 w-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto rotate-12">
                    <Puzzle size={40} />
                  </div>
                  <h3 className="text-2xl font-black">Puzzle Master</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">You've solved 1,240 puzzles with a 92% accuracy rate. Keep it up!</p>
                  <button className="bg-primary/10 text-primary border border-primary/20 px-8 py-3 rounded-xl font-bold hover:bg-primary hover:text-primary-foreground transition-all">
                    View Puzzle Stats
                  </button>
                </div>
              )}
            </div>
          </main>

          <EditProfileDialog isOpen={isEditing} onOpenChange={setIsEditing} />

        </div>
      </div>
    </div>
  );
}

// --- REUSABLE COMPONENTS ---

function ProfileDetail({ icon, text }: { icon: any, text: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-muted-foreground/80 hover:text-foreground transition-colors group">
      <span className="text-primary/60 group-hover:text-primary transition-colors">{icon}</span>
      <span className="font-medium">{text}</span>
    </div>
  );
}

function GameRow({ opponent, result, date, elo }: any) {
  return (
    <div className="flex items-center justify-between p-5 bg-card border border-border rounded-3xl hover:border-primary/40 transition-all hover:translate-x-1">
      <div className="flex items-center gap-4">
        <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-black ${result === 'Win' ? 'bg-emerald-500/10 text-emerald-500' : result === 'Loss' ? 'bg-red-500/10 text-red-500' : 'bg-muted text-muted-foreground'}`}>
          {result[0]}
        </div>
        <div>
          <p className="font-bold">vs {opponent}</p>
          <p className="text-xs text-muted-foreground">{date}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className={`font-black ${elo.startsWith('+') ? 'text-emerald-500' : elo.startsWith('-') ? 'text-red-500' : ''}`}>{elo}</p>
          <p className="text-[10px] uppercase font-bold text-muted-foreground">ELO</p>
        </div>
        <button className="p-2 hover:bg-accent rounded-lg text-muted-foreground transition-colors">
          <TrendingUp size={16} />
        </button>
      </div>
    </div>
  );
}

function FriendCard({ name, status, elo }: any) {
  return (
    <div className="flex items-center justify-between p-5 bg-card border border-border rounded-3xl group hover:border-primary/30 transition-all">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center font-bold text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
          {name[0]}
        </div>
        <div>
          <p className="font-bold text-sm">{name}</p>
          <div className="flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${status === 'Online' ? 'bg-emerald-500 animate-pulse' : 'bg-muted'}`} />
            <p className="text-[10px] font-bold uppercase text-muted-foreground">{status}</p>
          </div>
        </div>
      </div>
      <div className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-lg italic">
        {elo}
      </div>
    </div>
  );
}