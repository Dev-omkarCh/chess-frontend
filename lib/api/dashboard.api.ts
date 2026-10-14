import type { AxiosResponse } from 'axios';
import { api, ApiError } from './client';
import type { TimeControl } from '@/lib/dashboard.config';
import type {
    ActiveGame, AppNotification, ChallengePayload, ChallengeResult, DailyPuzzle,
    Friend, InviteLink, LeaderboardData, OpeningOfWeek, PlayerStats, RecentGame, Tournament,
} from '@/types/dashboard';

/**
 * Expected backend response shape for every endpoint:
 *   { "success": true, "data": <payload> }
 * Errors: { "success": false, "message": "...", "code": "OPTIONAL_CODE" }
 */
interface Envelope<T> { success: boolean; data: T; message?: string }
const unwrap = <T>(res: AxiosResponse<Envelope<T>>): T => res.data.data;

const V1 = '/api/v1';

/**
 * The contract the dashboard depends on. The real implementation uses axios;
 * `lib/mocks/dashboard.mock.ts` implements the same interface with fake data.
 */
export interface DashboardApi {
    // --- Implemented ---
    getPlayerStats(signal?: AbortSignal): Promise<PlayerStats>;
    getActiveGame(signal?: AbortSignal): Promise<ActiveGame | null>;
    getRecentGames(limit: number, signal?: AbortSignal): Promise<RecentGame[]>;
    getFriendsOnline(signal?: AbortSignal): Promise<Friend[]>;
    getNotifications(signal?: AbortSignal): Promise<AppNotification[]>;
    markNotificationsRead(): Promise<void>;
    getOnlineCount(signal?: AbortSignal): Promise<number>;
    createChallenge(payload: ChallengePayload): Promise<ChallengeResult>;
    createInviteLink(payload: { timeControl: TimeControl }): Promise<InviteLink>;

    // --- Coming soon (only called once the feature flag is turned on) ---
    getDailyPuzzle(signal?: AbortSignal): Promise<DailyPuzzle>;
    getOpeningOfTheWeek(signal?: AbortSignal): Promise<OpeningOfWeek>;
    getLeaderboard(limit: number, signal?: AbortSignal): Promise<LeaderboardData>;
    getNextTournament(signal?: AbortSignal): Promise<Tournament>;
    registerForTournament(id: string): Promise<void>;
}

export const dashboardApi: DashboardApi = {
    /* ---------- Player stats (rating, win rate, streak, games today) ---------- */
    getPlayerStats: signal =>
        api.get<Envelope<PlayerStats>>(`${V1}/users/me/stats`, { signal }).then(unwrap),

    /* ---------- Active game ("Continue playing") ---------- */
    getActiveGame: signal =>
        api.get<Envelope<ActiveGame | null>>(`${V1}/games/active`, { signal })
            .then(unwrap)
            .catch(err => {
                // A 404 simply means "no active game".
                if (err instanceof ApiError && err.status === 404) return null;
                throw err;
            }),

    /* ---------- Recent games ---------- */
    getRecentGames: (limit, signal) =>
        api.get<Envelope<RecentGame[]>>(`${V1}/games/recent`, { params: { limit }, signal }).then(unwrap),

    /* ---------- Friends online ---------- */
    getFriendsOnline: signal =>
        api.get<Envelope<Friend[]>>(`${V1}/friends/online`, { signal }).then(unwrap),

    /* ---------- Notifications ---------- */
    getNotifications: signal =>
        api.get<Envelope<AppNotification[]>>(`${V1}/notifications`, { params: { limit: 10 }, signal }).then(unwrap),

    markNotificationsRead: () =>
        api.patch(`${V1}/notifications/read`, { all: true }).then(() => undefined),

    /* ---------- Players online (hero line) ---------- */
    getOnlineCount: signal =>
        api.get<Envelope<{ count: number }>>(`${V1}/players/online-count`, { signal })
            .then(unwrap)
            .then(d => d.count),

    /* ---------- Play a friend ---------- */
    createChallenge: payload =>
        api.post<Envelope<ChallengeResult>>(`${V1}/challenges`, payload).then(unwrap),

    createInviteLink: payload =>
        api.post<Envelope<InviteLink>>(`${V1}/challenges/invite-links`, payload).then(unwrap),

    /* ---------- Daily puzzle (coming soon) ---------- */
    getDailyPuzzle: signal =>
        api.get<Envelope<DailyPuzzle>>(`${V1}/puzzles/daily`, { signal }).then(unwrap),

    /* ---------- Opening of the week / Learn (coming soon) ---------- */
    getOpeningOfTheWeek: signal =>
        api.get<Envelope<OpeningOfWeek>>(`${V1}/learn/opening-of-the-week`, { signal }).then(unwrap),

    /* ---------- Leaderboard (coming soon) ---------- */
    getLeaderboard: (limit, signal) =>
        api.get<Envelope<LeaderboardData>>(`${V1}/leaderboard`, { params: { limit }, signal }).then(unwrap),

    /* ---------- Tournaments (coming soon) ---------- */
    getNextTournament: signal =>
        api.get<Envelope<Tournament>>(`${V1}/tournaments/next`, { signal }).then(unwrap),

    registerForTournament: id =>
        api.post(`${V1}/tournaments/${encodeURIComponent(id)}/register`).then(() => undefined),
};