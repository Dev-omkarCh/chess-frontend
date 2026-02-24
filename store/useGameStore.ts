import { create } from 'zustand';

interface GameState {
  user: { name: string; coins: number; isPremium: boolean } | null;
  activeQueue: 'random' | 'bot' | 'friend' | null;
  setQueue: (type: 'random' | 'bot' | 'friend' | null) => void;
}

export const useGameStore = create<GameState>((set) => ({
  user: { name: "Grandmaster", coins: 450, isPremium: true },
  activeQueue: null,
  setQueue: (type) => set({ activeQueue: type }),
}));