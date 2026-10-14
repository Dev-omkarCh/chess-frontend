import { ApiError } from '@/lib/api/client';
import type { DashboardApi } from '@/lib/api/dashboard.api';
import type {
    ActiveGame, AppNotification, DailyPuzzle, Friend, LeaderboardData, OpeningOfWeek,
    PlayerStats, RecentGame, Tournament,
} from '@/types/dashboard';

/* =========================================================================
   STATIC PREVIEWS
   Shown (dimmed, behind a "Coming soon" badge) while a feature is disabled
   in `dashboard.config.ts`. Never fetched from the API.
   ========================================================================= */

export const PREVIEW: {
    puzzle: DailyPuzzle; opening: OpeningOfWeek; leaderboard: LeaderboardData; tournament: Tournament;
} = {
    puzzle: {
        // White to move: Ra8# (back-rank mate)
        fen: '6k1/5ppp/8/8/8/8/5PPP/R5K1', title: 'Mate in 1', toMove: 'White to move',
        highlight: ['a1', 'a8'], solvedStreak: 6,
    },
    opening: {
        name: 'Italian Game', moves: '1.e4 e5 2.Nf3 Nc6 3.Bc4',
        fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R',
        description: 'A classic way to fight for the center and develop fast.',
    },
    leaderboard: {
        top: [
            { rank: 1, name: 'MagnusFan_01', rating: 2412 },
            { rank: 2, name: 'e4_always', rating: 2377 },
            { rank: 3, name: 'QueenSac', rating: 2351 },
            { rank: 4, name: 'Endgame_Ed', rating: 2298 },
            { rank: 5, name: 'Fianchetto', rating: 2260 },
        ],
        userRank: 412,
    },
    tournament: { id: 'preview', name: 'Weekly Blitz Arena', startsAt: '2030-01-01T00:00:00.000Z' },
};

/* =========================================================================
   MOCK PLAYERS
   ========================================================================= */

interface MockDataset {
    stats: PlayerStats;
    activeGame: ActiveGame | null;
    recentGames: RecentGame[];
    friends: Friend[];
    notifications: AppNotification[];
    onlineCount: number;
}

const ago = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();

/** A brand-new account: no games, no friends, no notifications. */
function buildEmptyPlayer(): MockDataset {
    return {
        stats: { rating: 1200, totalGames: 0, winRate: 0, streak: 0, gamesToday: 0, dailyGoal: 5, ratingHistory: [] },
        activeGame: null,
        recentGames: [],
        friends: [],
        notifications: [],
        onlineCount: 1240,
    };
}

/** An active player with data in every section. */
function buildFullPlayer(): MockDataset {
    return {
        stats: {
            rating: 1224, totalGames: 87, winRate: 58, streak: 3, gamesToday: 4, dailyGoal: 5,
            ratingHistory: [1172, 1181, 1175, 1190, 1184, 1196, 1203, 1198, 1211, 1224],
        },
        activeGame: {
            id: 'demo-1', opponent: 'KnightRider99', opponentRating: 1265, timeControl: '10+0', timeLeftSeconds: 252,
            fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R',
        },
        recentGames: [
            { id: 'g1', opponent: 'Grandmaster_X', opponentRating: 2150, result: 'win', eloChange: 14, opening: "Queen's Gambit", timeControl: '10+0', playedAt: ago(10), fen: 'r1bq1rk1/ppp2ppp/2n2n2/3pp3/1b1PP3/2NB1N2/PPP2PPP/R1BQ1RK1' },
            { id: 'g2', opponent: 'ChessNewbie', opponentRating: 1340, result: 'loss', eloChange: -11, opening: 'Sicilian Defense', timeControl: '5+0', playedAt: ago(130), fen: '8/5pk1/6p1/8/3Q4/6P1/5PK1/8' },
            { id: 'g3', opponent: 'TacticalBot', opponentRating: 1600, result: 'draw', eloChange: 0, opening: 'Ruy Lopez', timeControl: '3+0', playedAt: ago(60 * 26), fen: '4r1k1/5ppp/8/8/8/8/5PPP/3R2K1' },
            { id: 'g4', opponent: 'rook_and_roll', opponentRating: 1188, result: 'win', eloChange: 9, opening: 'London System', timeControl: '1+0', playedAt: ago(60 * 30), fen: 'r4rk1/pp3ppp/2p5/8/4P3/2N5/PPP2PPP/R4RK1' },
        ],
        friends: [
            { id: 'f1', name: 'Aarav', rating: 1310, status: 'online' },
            { id: 'f2', name: 'Meera_K', rating: 1455, status: 'online' },
            { id: 'f3', name: 'Zugzwang', rating: 1102, status: 'in-game' },
        ],
        notifications: [
            { id: 'n1', text: 'Aarav challenged you to a 5+0 game', createdAt: ago(2), unread: true },
            { id: 'n2', text: 'Meera_K accepted your friend request', createdAt: ago(60), unread: true },
            { id: 'n3', text: 'You reached a 3-game win streak', createdAt: ago(60 * 24), unread: false },
        ],
        onlineCount: 1240,
    };
}

/* =========================================================================
   MOCK API (same interface as the real axios service)
   ========================================================================= */

export type MockMode = 'full' | 'empty' | 'error';

function wait(signal?: AbortSignal, ms = 450 + Math.random() * 450) {
    return new Promise<void>((resolve, reject) => {
        const timer = setTimeout(resolve, ms);
        signal?.addEventListener('abort', () => {
            clearTimeout(timer);
            reject(new DOMException('Aborted', 'AbortError'));
        }, { once: true });
    });
}

export function createMockApi(mode: MockMode): DashboardApi {
    const data = mode === 'full' ? buildFullPlayer() : buildEmptyPlayer();

    async function serve<T>(value: T, signal?: AbortSignal): Promise<T> {
        await wait(signal);
        if (mode === 'error') throw new ApiError('Simulated server error (dev switcher: "Server error").', 500);
        return value;
    }

    return {
        getPlayerStats: s => serve(data.stats, s),
        getActiveGame: s => serve(data.activeGame, s),
        getRecentGames: (limit, s) => serve(data.recentGames.slice(0, limit), s),
        getFriendsOnline: s => serve(data.friends, s),
        getNotifications: s => serve(data.notifications, s),
        markNotificationsRead: () => serve(undefined),
        getOnlineCount: s => serve(data.onlineCount, s),
        createChallenge: () => serve({ challengeId: 'mock-challenge', status: 'pending' as const }),
        createInviteLink: () => serve({ url: 'https://betterchess.example/invite/mock123' }),

        getDailyPuzzle: s => serve(PREVIEW.puzzle, s),
        getOpeningOfTheWeek: s => serve(PREVIEW.opening, s),
        getLeaderboard: (_limit, s) => serve(mode === 'full' ? PREVIEW.leaderboard : { ...PREVIEW.leaderboard, userRank: null }, s),
        getNextTournament: s => serve({ ...PREVIEW.tournament, startsAt: new Date(Date.now() + 8_049_000).toISOString() }, s),
        registerForTournament: () => serve(undefined),
    };
}