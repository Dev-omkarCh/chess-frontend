/**
 * Dashboard feature flags.
 *
 * Everything set to `false` is shown as "Coming soon": sidebar items are
 * disabled, cards are dimmed with a badge, and no API request is made for it.
 * When you finish building a feature, flip its flag to `true`. That's it.
 */
export type FeatureKey =
    | 'quickPlay' | 'playFriend' | 'social' | 'notifications'
    | 'playComputer' | 'customGame'
    | 'puzzles' | 'learn' | 'analysis' | 'archive' | 'stats'
    | 'leaderboard' | 'settings' | 'tournaments';

export const FEATURES: Record<FeatureKey, boolean> = {
    // Implemented
    quickPlay: true,
    playFriend: true,
    social: true,
    notifications: true,

    // Coming soon
    playComputer: false,
    customGame: false,
    puzzles: false,
    learn: false,
    analysis: false,
    archive: false,
    stats: false,
    leaderboard: false,
    settings: false,
    tournaments: false,
};

/** Supported time controls: 1, 3, 5 and 10 minutes (no increment). */
export const TIME_CONTROLS = [
    { value: '1+0', label: 'Bullet' },
    { value: '3+0', label: 'Blitz' },
    { value: '5+0', label: 'Blitz' },
    { value: '10+0', label: 'Rapid' },
] as const;

export type TimeControl = (typeof TIME_CONTROLS)[number]['value'];
export type TimeCategory = (typeof TIME_CONTROLS)[number]['label'];

export const DEFAULT_TIME_CONTROL: TimeControl = '5+0';
export const RECENT_GAMES_LIMIT = 4;
export const LEADERBOARD_LIMIT = 5;