import type { TimeControl } from '@/lib/dashboard.config';

export type GameResult = 'win' | 'loss' | 'draw';

export interface PlayerStats {
    rating: number;
    totalGames: number;
    /** 0-100 */
    winRate: number;
    streak: number;
    gamesToday: number;
    dailyGoal: number;
    /** Last N ratings, oldest first. Empty for a new player. */
    ratingHistory: number[];
}

export interface RecentGame {
    id: string;
    opponent: string;
    opponentRating: number;
    result: GameResult;
    eloChange: number;
    opening: string;
    timeControl: TimeControl;
    /** ISO 8601 */
    playedAt: string;
    /** Final position (FEN) */
    fen: string;
}

export interface ActiveGame {
    id: string;
    opponent: string;
    opponentRating: number;
    timeControl: TimeControl;
    timeLeftSeconds: number;
    fen: string;
}

export interface Friend {
    id: string;
    name: string;
    rating: number;
    status: 'online' | 'in-game';
}

export interface AppNotification {
    id: string;
    text: string;
    /** ISO 8601 */
    createdAt: string;
    unread: boolean;
}

export interface ChallengePayload {
    /** Use one of these two. */
    opponentId?: string;
    username?: string;
    timeControl: TimeControl;
}
export interface ChallengeResult { challengeId: string; status: 'pending' }
export interface InviteLink { url: string }

/* --- Coming-soon features (types ready for when you build them) --- */

export interface DailyPuzzle {
    fen: string;
    title: string;
    toMove: string;
    /** Squares to highlight, e.g. ['a1', 'a8'] */
    highlight: string[];
    solvedStreak: number;
}
export interface OpeningOfWeek { name: string; moves: string; fen: string; description: string }
export interface LeaderRow { rank: number; name: string; rating: number }
export interface LeaderboardData {
    top: LeaderRow[];
    /** null = the player is not ranked yet */
    userRank: number | null;
}
export interface Tournament { id: string; name: string; startsAt: string }