import { getStore } from '@netlify/blobs';
import type { Context } from '@netlify/functions';

interface LeaderboardEntry {
  name: string;
  score: number;
  date: string;
  totalDrops: number;
}

export default async function handler(_request: Request, _context: Context) {
  try {
    const store = getStore('plinko-leaderboard');
    const raw = await store.get('leaderboard', { type: 'json' });

    const entries: LeaderboardEntry[] = Array.isArray(raw) ? raw : [];
    const sorted = entries
      .sort((a, b) => b.score - a.score)
      .slice(0, 50)
      .map((entry, i) => ({ ...entry, rank: i + 1 }));

    return new Response(JSON.stringify(sorted), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=10',
      },
    });
  } catch {
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
