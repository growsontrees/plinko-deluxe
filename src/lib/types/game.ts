import type { RowCount } from '$lib/constants/game';
export type { RowCount } from '$lib/constants/game';

export enum BetMode {
  MANUAL = 'MANUAL',
  AUTO = 'AUTO',
}

/**
 * Game's risk level, which controls the volatility of payout.
 */
export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

/**
 * A record of the bet amount associated to every existing ball in the game
 * that is still in motion.
 *
 * When a ball enters a bin, its record is removed.
 */
export type BetAmountOfExistingBalls = {
  [ballId: number]: number;
};

export type WinRecord = {
  id: string;
  betAmount: number;
  rowCount: RowCount;
  binIndex: number;
  payout: {
    multiplier: number;
    value: number;
  };
  profit: number;
};

export type CelebrationTier = 'jackpot' | 'big_win' | 'win' | 'near_miss' | 'unlock' | 'none';

export type CelebrationEvent = {
  multiplier: number;
  payoutValue: number;
  binIndex: number;
  tier: CelebrationTier;
  rowCount: RowCount;
};

export type PowerUpType = 'WALL_GUIDE' | 'MAGNET' | 'GOLDEN_PEG' | 'MULTI_BALL';

export type MilestoneRequirement = {
  type: 'drops' | 'profit' | 'jackpot_hits' | 'edge_bins';
  threshold: number;
  description: string;
};

export type PowerUpState = {
  type: PowerUpType;
  unlocked: boolean;
  active: boolean;
  unlockRequirement: MilestoneRequirement;
};

export type MilestoneProgress = {
  totalDrops: number;
  totalProfit: number;
  jackpotHits: number;
  edgeBinHits: number;
};

export type LeaderboardEntry = {
  name: string;
  score: number;
  date: string;
  totalDrops: number;
  rank: number;
};
