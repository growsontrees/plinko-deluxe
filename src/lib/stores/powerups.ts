import { LOCAL_STORAGE_KEY, POWER_UP_MILESTONES } from '$lib/constants/game';
import type { MilestoneProgress, MilestoneRequirement, PowerUpState, PowerUpType } from '$lib/types';
import { persisted } from 'svelte-persisted-store';
import { derived, writable } from 'svelte/store';

const defaultProgress: MilestoneProgress = {
  totalDrops: 0,
  totalProfit: 0,
  jackpotHits: 0,
  edgeBinHits: 0,
};

export const milestoneProgress = persisted<MilestoneProgress>(
  LOCAL_STORAGE_KEY.MILESTONE_PROGRESS,
  defaultProgress,
);

export const activePowerUps = persisted<Set<PowerUpType>>(
  LOCAL_STORAGE_KEY.ACTIVE_POWERUPS,
  new Set(),
  {
    serializer: {
      parse: (text: string) => {
        try {
          const parsed = JSON.parse(text);
          return Array.isArray(parsed) ? new Set(parsed as PowerUpType[]) : new Set<PowerUpType>();
        } catch {
          return new Set<PowerUpType>();
        }
      },
      stringify: (value: Set<PowerUpType>) => JSON.stringify([...value]),
    },
  },
);

export const powerUpStates = derived<typeof milestoneProgress, PowerUpState[]>(
  milestoneProgress,
  ($progress) => {
    const entries: PowerUpState[] = (Object.keys(POWER_UP_MILESTONES) as PowerUpType[]).map(
      (type) => {
        const req = POWER_UP_MILESTONES[type] as MilestoneRequirement;
        let current = 0;
        switch (req.type) {
          case 'drops':
            current = $progress.totalDrops;
            break;
          case 'profit':
            current = $progress.totalProfit;
            break;
          case 'jackpot_hits':
            current = $progress.jackpotHits;
            break;
          case 'edge_bins':
            current = $progress.edgeBinHits;
            break;
        }
        return {
          type,
          unlocked: current >= req.threshold,
          active: false, // Will be overridden by activePowerUps
          unlockRequirement: { ...req },
        };
      },
    );
    return entries;
  },
);

/**
 * Get current progress value for a given power-up type.
 */
export function getProgressForPowerUp(
  progress: MilestoneProgress,
  type: PowerUpType,
): { current: number; threshold: number } {
  const req = POWER_UP_MILESTONES[type] as MilestoneRequirement;
  let current = 0;
  switch (req.type) {
    case 'drops':
      current = progress.totalDrops;
      break;
    case 'profit':
      current = progress.totalProfit;
      break;
    case 'jackpot_hits':
      current = progress.jackpotHits;
      break;
    case 'edge_bins':
      current = progress.edgeBinHits;
      break;
  }
  return { current, threshold: req.threshold };
}

/** Track newly unlocked power-ups */
export const newlyUnlockedPowerUp = writable<PowerUpType | null>(null);
