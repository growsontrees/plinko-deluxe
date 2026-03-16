import PlinkoEngine from '$lib/components/Plinko/PlinkoEngine';
import { binColor, DEFAULT_BALANCE } from '$lib/constants/game';
import {
  RiskLevel,
  type BetAmountOfExistingBalls,
  type CelebrationEvent,
  type RowCount,
  type WinRecord,
} from '$lib/types';
import { interpolateRgbColors } from '$lib/utils/colors';
import { countValueOccurrences } from '$lib/utils/numbers';
import { derived, writable } from 'svelte/store';

export const plinkoEngine = writable<PlinkoEngine | null>(null);

export const betAmount = writable<number>(1);

export const betAmountOfExistingBalls = writable<BetAmountOfExistingBalls>({});

export const rowCount = writable<RowCount>(16);

export const riskLevel = writable<RiskLevel>(RiskLevel.MEDIUM);

export const winRecords = writable<WinRecord[]>([]);

/**
 * History of total profits. Should be updated whenever a new win record is pushed
 * to `winRecords` store.
 */
export const totalProfitHistory = writable<number[]>([0]);

/**
 * Game balance, which is saved to local storage.
 */
export const balance = writable<number>(DEFAULT_BALANCE);

/**
 * Celebration event store — set when a significant win occurs.
 */
export const celebrationEvent = writable<CelebrationEvent | null>(null);

/**
 * RGB colors for every bin. The length of the array is the number of bins.
 */
export const binColors = derived<typeof rowCount, { background: string[]; shadow: string[] }>(
  rowCount,
  ($rowCount) => {
    const binCount = $rowCount + 1;
    const isBinsEven = binCount % 2 === 0;
    const redToGoldLength = Math.ceil(binCount / 2);

    const redToGoldBg = interpolateRgbColors(
      binColor.background.red,
      binColor.background.yellow,
      redToGoldLength,
    ).map(({ r, g, b }) => `rgb(${r}, ${g}, ${b})`);

    const redToGoldShadow = interpolateRgbColors(
      binColor.shadow.red,
      binColor.shadow.yellow,
      redToGoldLength,
    ).map(({ r, g, b }) => `rgb(${r}, ${g}, ${b})`);

    return {
      background: [...redToGoldBg, ...redToGoldBg.toReversed().slice(isBinsEven ? 0 : 1)],
      shadow: [...redToGoldShadow, ...redToGoldShadow.toReversed().slice(isBinsEven ? 0 : 1)],
    };
  },
);

export const binProbabilities = derived<
  [typeof winRecords, typeof rowCount],
  { [binIndex: number]: number }
>([winRecords, rowCount], ([$winRecords, $rowCount]) => {
  const occurrences = countValueOccurrences($winRecords.map(({ binIndex }) => binIndex));
  const probabilities: Record<number, number> = {};
  for (let i = 0; i < $rowCount + 1; ++i) {
    probabilities[i] = occurrences[i] / $winRecords.length || 0;
  }
  return probabilities;
});
