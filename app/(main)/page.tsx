"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Bot, BarChart3, 
  Sparkles, Trophy, Zap, ChevronRight 
} from 'lucide-react';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <main className="max-w-7xl mx-auto px-6 py-10 md:py-20">
        
        {/* --- Hero Section --- */}
        <section className="grid lg:grid-cols-12 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-7 space-y-8"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-border px-4 py-1.5 rounded-full text-primary text-xs font-bold uppercase tracking-wider">
              <Sparkles size={14} />
              <span>AI Analysis Engine v2.0 Live</span>
            </div>

            <h1 className="text-5xl md:text-8xl font-black leading-[0.9] tracking-tight">
              PLAY FAST. <br />
              <span className="text-primary">THINK DEEP.</span>
            </h1>

            <p className="text-muted-foreground text-lg md:text-xl max-w-lg leading-relaxed">
              The world's most advanced chess platform with integrated neural assistance. 
              Join 2M+ players globally.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-primary hover:scale-105 text-white px-10 py-5 rounded-2xl font-black transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/20">
                PLAY NOW
                <Zap className="fill-current" size={20} />
              </button>
              <button className="bg-card hover:bg-card-hover border border-border px-10 py-5 rounded-2xl font-bold transition-all">
                Learn Basics
              </button>
            </div>
          </motion.div>

          {/* --- Responsive Feature Grid --- */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FeatureCard 
              icon={<Users className="text-blue-500" />} 
              title="Social Play" 
              desc="Add friends & create clubs." 
            />
            <FeatureCard 
              icon={<Bot className="text-purple-500" />} 
              title="Tactical Bots" 
              desc="Adaptive AI personalities." 
            />
            <FeatureCard 
              icon={<BarChart3 className="text-emerald-500" />} 
              title="Analytics" 
              desc="Precision PGN review." 
            />
            <FeatureCard 
              icon={<Trophy className="text-amber-500" />} 
              title="Leagues" 
              desc="Compete for real prizes." 
            />
          </div>
        </section>

        {/* --- AI & Subscription Section --- */}
        <section className="mt-32 relative group">
          <div className="absolute inset-0 bg-emerald-500/20 blur-[120px] rounded-full opacity-50 dark:opacity-20 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10 rounded-[2.5rem] bg-slate-50 dark:bg-white/3 border border-slate-200 dark:border-white/10 p-8 md:p-16 overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-6">
                <h2 className="text-4xl font-bold tracking-tight">
                  Stop Guessing. <br />
                  <span className="text-muted-foreground">Start Mastering.</span>
                </h2>
                <p className="text-muted-foreground dark:text-slate-400">
                  Our subscription gives you access to real-time AI move-probability 
                  and a personal coach that talks you through your mistakes as you make them.
                </p>
                <div className="space-y-4">
                  {['Unlimited AI Hints', 'Ad-Free Experience', 'Premium Badges', 'Daily Puzzles'].map((item) => (
                    <div key={item} className="flex items-center gap-3 font-medium">
                      <div className="bg-primary rounded-full p-1">
                        <ChevronRight size={14} className="text-white dark:text-black" />
                      </div>
                      {item}
                    </div>
                  ))}
                </div>
                <button className="w-full sm:w-auto mt-4 bg-primary text-primary-foreground px-8 py-4 rounded-xl font-bold hover:bg-primary/80 transition-all">
                  Get Premium — $9.99/mo
                </button>
              </div>

              {/* Mockup AI Chat UI */}
              <div className="bg-background/40 border border-border rounded-3xl p-6 shadow-2xl">
                <div className="flex items-center gap-3 border-b border-border/5 pb-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                    <Bot size={20} className="text-white dark:text-black" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">AI Assistant</h4>
                    <span className="text-xs text-primary animate-pulse font-medium">Analyzing...</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-popover border border-border p-3 rounded-2xl rounded-tl-none mr-8">
                    <p className="text-sm italic">"Notice the tension in the center. Moving your Bishop to g5 would pin the Knight and increase pressure."</p>
                  </div>
                  <div className="bg-primary/20 border border-border p-3 rounded-2xl rounded-br-none ml-8 text-right">
                    <p className="text-sm font-semibold text-primary">Apply Bg5 move?</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <motion.div 
    whileHover={{ y: -8, scale: 1.02 }}
    className="p-8 bg-card hover:bg-card-hover border border-border rounded-3xl hover:border-primary/50 transition-all cursor-pointer shadow-sm hover:shadow-xl"
  >
    <div className="mb-6 p-3 bg-card w-fit rounded-2xl">
      {icon}
    </div>
    <h3 className="font-bold text-xl mb-2">{title}</h3>
    <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
  </motion.div>
);

export default HomePage;