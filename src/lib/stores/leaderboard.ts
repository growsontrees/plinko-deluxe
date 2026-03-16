import { LOCAL_STORAGE_KEY } from '$lib/constants/game';
import { balance } from '$lib/stores/game';
import { milestoneProgress } from '$lib/stores/powerups';
import type { LeaderboardEntry } from '$lib/types';
import { persisted } from 'svelte-persisted-store';
import { get, writable } from 'svelte/store';

export const leaderboardEntries = writable<LeaderboardEntry[]>([]);
export const leaderboardLoading = writable<boolean>(false);
export const leaderboardError = writable<string | null>(null);

export const playerName = persisted<string>(LOCAL_STORAGE_KEY.PLAYER_NAME, '');
export const peakBalance = persisted<number>(LOCAL_STORAGE_KEY.PEAK_BALANCE, 0);
export const leaderboardOptIn = persisted<boolean>(LOCAL_STORAGE_KEY.LEADERBOARD_OPT_IN, false);

// Track peak balance automatically
balance.subscribe((currentBalance) => {
  peakBalance.update((peak) => (currentBalance > peak ? currentBalance : peak));
});

async function fetchWithRetry(url: string, options: RequestInit, retries = 2): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (err) {
    clearTimeout(timeoutId);
    if (retries > 0) {
      const delay = (3 - retries) * 1000;
      await new Promise((r) => setTimeout(r, delay));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw err;
  }
}

export async function fetchLeaderboard(): Promise<void> {
  leaderboardLoading.set(true);
  leaderboardError.set(null);

  try {
    const response = await fetchWithRetry('/.netlify/functions/get-leaderboard', { method: 'GET' });
    if (!response.ok) throw new Error('Failed to fetch');
    const data = (await response.json()) as LeaderboardEntry[];
    leaderboardEntries.set(data);
  } catch {
    leaderboardError.set('Leaderboard unavailable — playing offline');
  } finally {
    leaderboardLoading.set(false);
  }
}

export async function submitScore(): Promise<void> {
  leaderboardLoading.set(true);
  leaderboardError.set(null);

  try {
    const name = get(playerName);
    const score = get(peakBalance);
    const totalDrops = get(milestoneProgress).totalDrops;

    const response = await fetchWithRetry('/.netlify/functions/submit-score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, score, totalDrops }),
    });

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      throw new Error(data.error ?? 'Submission failed');
    }

    await fetchLeaderboard();
  } catch (err) {
    leaderboardError.set(err instanceof Error ? err.message : 'Submission failed');
  } finally {
    leaderboardLoading.set(false);
  }
}
