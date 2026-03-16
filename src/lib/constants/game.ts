import { RiskLevel } from '$lib/types';
import { getBinColors } from '$lib/utils/colors';
import { computeBinProbabilities } from '$lib/utils/numbers';

export const DEFAULT_BALANCE = 200;

export const LOCAL_STORAGE_KEY = {
  BALANCE: 'plinko_balance',
  SETTINGS: {
    ANIMATION: 'plinko_settings_animation',
    SFX: 'plinko_settings_sfx',
    MUSIC: 'plinko_settings_music',
  },
  MILESTONE_PROGRESS: 'plinko_milestone_progress',
  ACTIVE_POWERUPS: 'plinko_active_powerups',
  PEAK_BALANCE: 'plinko_peak_balance',
  PLAYER_NAME: 'plinko_player_name',
  LEADERBOARD_OPT_IN: 'plinko_leaderboard_opt_in',
} as const;

export const POWER_UP_MILESTONES = {
  WALL_GUIDE: { type: 'drops' as const, threshold: 100, description: '100 total drops' },
  MULTI_BALL: { type: 'drops' as const, threshold: 300, description: '300 total drops' },
  MAGNET: { type: 'profit' as const, threshold: 1000, description: '$1,000 total profit' },
  GOLDEN_PEG: { type: 'jackpot_hits' as const, threshold: 3, description: '3 jackpot hits (41x+)' },
} as const;

/**
 * Range of row counts the game supports.
 */
export const rowCountOptions = [8, 9, 10, 11, 12, 13, 14, 15, 16] as const;

/**
 * Number of rows of pins the game supports.
 */
export type RowCount = (typeof rowCountOptions)[number];

/**
 * Interval (in milliseconds) for placing auto bets.
 */
export const autoBetIntervalMs = 250;

/**
 * For each row count, the background and shadow colors of each bin.
 */
export const binColorsByRowCount = rowCountOptions.reduce(
  (acc, rowCount) => {
    acc[rowCount] = getBinColors(rowCount);
    return acc;
  },
  {} as Record<RowCount, ReturnType<typeof getBinColors>>,
);

/**
 * For each row count, what's the probabilities of a ball falling into each bin.
 */
export const binProbabilitiesByRowCount: Record<RowCount, number[]> = rowCountOptions.reduce(
  (acc, rowCount) => {
    acc[rowCount] = computeBinProbabilities(rowCount);
    return acc;
  },
  {} as Record<RowCount, number[]>,
);

/**
 * Multipliers of each bin by row count and risk level.
 */
export const binPayouts: Record<RowCount, Record<RiskLevel, number[]>> = {
  8: {
    [RiskLevel.LOW]: [5.6, 2.1, 1.1, 1, 0.5, 1, 1.1, 2.1, 5.6],
    [RiskLevel.MEDIUM]: [13, 3, 1.3, 0.7, 0.4, 0.7, 1.3, 3, 13],
    [RiskLevel.HIGH]: [29, 4, 1.5, 0.3, 0.2, 0.3, 1.5, 4, 29],
  },
  9: {
    [RiskLevel.LOW]: [5.6, 2, 1.6, 1, 0.7, 0.7, 1, 1.6, 2, 5.6],
    [RiskLevel.MEDIUM]: [18, 4, 1.7, 0.9, 0.5, 0.5, 0.9, 1.7, 4, 18],
    [RiskLevel.HIGH]: [43, 7, 2, 0.6, 0.2, 0.2, 0.6, 2, 7, 43],
  },
  10: {
    [RiskLevel.LOW]: [8.9, 3, 1.4, 1.1, 1, 0.5, 1, 1.1, 1.4, 3, 8.9],
    [RiskLevel.MEDIUM]: [22, 5, 2, 1.4, 0.6, 0.4, 0.6, 1.4, 2, 5, 22],
    [RiskLevel.HIGH]: [76, 10, 3, 0.9, 0.3, 0.2, 0.3, 0.9, 3, 10, 76],
  },
  11: {
    [RiskLevel.LOW]: [8.4, 3, 1.9, 1.3, 1, 0.7, 0.7, 1, 1.3, 1.9, 3, 8.4],
    [RiskLevel.MEDIUM]: [24, 6, 3, 1.8, 0.7, 0.5, 0.5, 0.7, 1.8, 3, 6, 24],
    [RiskLevel.HIGH]: [120, 14, 5.2, 1.4, 0.4, 0.2, 0.2, 0.4, 1.4, 5.2, 14, 120],
  },
  12: {
    [RiskLevel.LOW]: [10, 3, 1.6, 1.4, 1.1, 1, 0.5, 1, 1.1, 1.4, 1.6, 3, 10],
    [RiskLevel.MEDIUM]: [33, 11, 4, 2, 1.1, 0.6, 0.3, 0.6, 1.1, 2, 4, 11, 33],
    [RiskLevel.HIGH]: [170, 24, 8.1, 2, 0.7, 0.2, 0.2, 0.2, 0.7, 2, 8.1, 24, 170],
  },
  13: {
    [RiskLevel.LOW]: [8.1, 4, 3, 1.9, 1.2, 0.9, 0.7, 0.7, 0.9, 1.2, 1.9, 3, 4, 8.1],
    [RiskLevel.MEDIUM]: [43, 13, 6, 3, 1.3, 0.7, 0.4, 0.4, 0.7, 1.3, 3, 6, 13, 43],
    [RiskLevel.HIGH]: [260, 37, 11, 4, 1, 0.2, 0.2, 0.2, 0.2, 1, 4, 11, 37, 260],
  },
  14: {
    [RiskLevel.LOW]: [7.1, 4, 1.9, 1.4, 1.3, 1.1, 1, 0.5, 1, 1.1, 1.3, 1.4, 1.9, 4, 7.1],
    [RiskLevel.MEDIUM]: [58, 15, 7, 4, 1.9, 1, 0.5, 0.2, 0.5, 1, 1.9, 4, 7, 15, 58],
    [RiskLevel.HIGH]: [420, 56, 18, 5, 1.9, 0.3, 0.2, 0.2, 0.2, 0.3, 1.9, 5, 18, 56, 420],
  },
  15: {
    [RiskLevel.LOW]: [15, 8, 3, 2, 1.5, 1.1, 1, 0.7, 0.7, 1, 1.1, 1.5, 2, 3, 8, 15],
    [RiskLevel.MEDIUM]: [88, 18, 11, 5, 3, 1.3, 0.5, 0.3, 0.3, 0.5, 1.3, 3, 5, 11, 18, 88],
    [RiskLevel.HIGH]: [620, 83, 27, 8, 3, 0.5, 0.2, 0.2, 0.2, 0.2, 0.5, 3, 8, 27, 83, 620],
  },
  16: {
    [RiskLevel.LOW]: [16, 9, 2, 1.4, 1.4, 1.2, 1.1, 1, 0.5, 1, 1.1, 1.2, 1.4, 1.4, 2, 9, 16],
    [RiskLevel.MEDIUM]: [110, 41, 10, 5, 3, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 3, 5, 10, 41, 110],
    [RiskLevel.HIGH]: [1000, 130, 26, 9, 4, 2, 0.2, 0.2, 0.2, 0.2, 0.2, 2, 4, 9, 26, 130, 1000],
  },
};

export const binColor = {
  background: {
    red: { r: 227, g: 24, b: 55 },   // PIR Red #E31837
    yellow: { r: 255, g: 215, b: 0 }, // PIR Gold #FFD700
  },
  shadow: {
    red: { r: 166, g: 0, b: 4 },
    yellow: { r: 171, g: 145, b: 0 },
  },
} as const;

export const MAX_CONCURRENT_BALLS = 30;
