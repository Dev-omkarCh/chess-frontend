"use client"
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FEATURES, LEADERBOARD_LIMIT, RECENT_GAMES_LIMIT } from '@/lib/dashboard.config';
import { dashboardApi, type DashboardApi } from '@/lib/api/dashboard.api';
import { getErrorMessage, isAbort } from '@/lib/api/client';
import { createMockApi } from '@/lib/mocks/dashboard.mock';
import type {
    ActiveGame, AppNotification, DailyPuzzle, Friend, LeaderboardData,
    OpeningOfWeek, PlayerStats, RecentGame, Tournament,
} from '@/types/dashboard';

/** Where the dashboard gets its data. The mock sources are for development only. */
export type DataSource = 'api' | 'mock-full' | 'mock-empty' | 'mock-error';

export interface Section<T> {
    status: 'idle' | 'loading' | 'success' | 'error';
    data: T | null;
    error?: string;
}

export interface DashboardState {
    stats: Section<PlayerStats>;
    /** status "success" with data null means "no active game" */
    activeGame: Section<ActiveGame | null>;
    recentGames: Section<RecentGame[]>;
    friends: Section<Friend[]>;
    notifications: Section<AppNotification[]>;
    onlineCount: Section<number>;
    // Coming-soon sections stay "idle" until their feature flag is on.
    puzzle: Section<DailyPuzzle>;
    opening: Section<OpeningOfWeek>;
    leaderboard: Section<LeaderboardData>;
    tournament: Section<Tournament>;
}

function section<T>(enabled: boolean): Section<T> {
    return { status: enabled ? 'loading' : 'idle', data: null };
}

function initialState(): DashboardState {
    return {
        stats: section(true),
        activeGame: section(true),
        recentGames: section(true),
        friends: section(true),
        notifications: section(FEATURES.notifications),
        onlineCount: section(true),
        puzzle: section(FEATURES.puzzles),
        opening: section(FEATURES.learn),
        leaderboard: section(FEATURES.leaderboard),
        tournament: section(FEATURES.tournaments),
    };
}

function getApi(source: DataSource): DashboardApi {
    switch (source) {
        case 'mock-full': return createMockApi('full');
        case 'mock-empty': return createMockApi('empty');
        case 'mock-error': return createMockApi('error');
        default: return dashboardApi;
    }
}

/**
 * Fetches every dashboard section in parallel. Each section has its own
 * loading/error state, so one failing endpoint never blanks the whole page.
 * Requests are cancelled on unmount or when the source changes.
 */
export function useDashboardData(source: DataSource) {

    const [state, setState] = useState<DashboardState>(initialState);
    const [reloadKey, setReloadKey] = useState(0);
    const svc = useMemo(() => getApi(source), [source]);

    const reload = useCallback(() => setReloadKey(k => k + 1), []);

    useEffect(() => {
        const controller = new AbortController();
        const { signal } = controller;
        setState(initialState());

        function track<T>(key: keyof DashboardState, request: Promise<T>) {
            request.then(
                data => {
                    if (signal.aborted) return;
                    setState(prev => ({ ...prev, [key]: { status: 'success', data } }) as DashboardState);
                },
                err => {
                    if (signal.aborted || isAbort(err)) return;
                    setState(prev => ({ ...prev, [key]: { status: 'error', data: null, error: getErrorMessage(err) } }) as DashboardState);
                }
            );
        }

        track('stats', svc.getPlayerStats(signal));
        track('activeGame', svc.getActiveGame(signal));
        track('recentGames', svc.getRecentGames(RECENT_GAMES_LIMIT, signal));
        track('friends', svc.getFriendsOnline(signal));
        track('onlineCount', svc.getOnlineCount(signal));
        if (FEATURES.notifications) track('notifications', svc.getNotifications(signal));
        if (FEATURES.puzzles) track('puzzle', svc.getDailyPuzzle(signal));
        if (FEATURES.learn) track('opening', svc.getOpeningOfTheWeek(signal));
        if (FEATURES.leaderboard) track('leaderboard', svc.getLeaderboard(LEADERBOARD_LIMIT, signal));
        if (FEATURES.tournaments) track('tournament', svc.getNextTournament(signal));

        return () => controller.abort();
    }, [svc, reloadKey]);

    /** Optimistic update: clear the unread dots immediately, roll back if the request fails. */
    const markAllRead = useCallback(async () => {
        const previous = state.notifications.data;
        if (!previous?.some(n => n.unread)) return;
        setState(prev => ({ ...prev, notifications: { status: 'success', data: previous.map(n => ({ ...n, unread: false })) } }));
        try {
            await svc.markNotificationsRead();
        } catch {
            setState(prev => ({ ...prev, notifications: { status: 'success', data: previous } }));
        }
    }, [state.notifications.data, svc]);

    return { state, reload, markAllRead, api: svc };
}