import { getStore } from '@netlify/blobs';
import type { Context } from '@netlify/functions';
import { isScorePlausible, sanitizeName, validateName, validateScore } from './utils/validation';

interface LeaderboardEntry {
  name: string;
  score: number;
  date: string;
  totalDrops: number;
}

export default async function handler(request: Request, context: Context) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  let body: { name?: unknown; score?: unknown; totalDrops?: unknown };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  // Validate
  const nameResult = validateName(body.name);
  if (!nameResult.valid) {
    return new Response(JSON.stringify({ error: nameResult.error }), { status: 400 });
  }

  const scoreResult = validateScore(body.score);
  if (!scoreResult.valid) {
    return new Response(JSON.stringify({ error: scoreResult.error }), { status: 400 });
  }

  const score = body.score as number;
  const totalDrops = typeof body.totalDrops === 'number' ? body.totalDrops : 0;

  if (!isScorePlausible(score, totalDrops)) {
    return new Response(JSON.stringify({ error: 'Score is not plausible' }), { status: 400 });
  }

  const name = sanitizeName(body.name as string);

  // Rate limiting via Netlify Blobs
  const ip = context.ip || 'unknown';
  const rateLimitStore = getStore('plinko-rate-limits');
  const rateLimitKey = `rate:${ip}`;

  try {
    const lastSubmit = await rateLimitStore.get(rateLimitKey, { type: 'text' });
    if (lastSubmit) {
      const elapsed = Date.now() - parseInt(lastSubmit, 10);
      if (elapsed < 60000) {
        return new Response(
          JSON.stringify({ error: 'Rate limited. Try again in 60 seconds.' }),
          { status: 429 },
        );
      }
    }
  } catch {
    // Rate limit check failed, proceed anyway
  }

  // Save with optimistic locking (retry up to 3 times)
  const store = getStore('plinko-leaderboard');
  let retries = 3;

  while (retries > 0) {
    try {
      const raw = await store.get('leaderboard', { type: 'json' });
      const entries: LeaderboardEntry[] = Array.isArray(raw) ? raw : [];

      // Upsert: update if name exists, insert otherwise
      const existingIdx = entries.findIndex(
        (e) => e.name.toLowerCase() === name.toLowerCase(),
      );
      const newEntry: LeaderboardEntry = {
        name,
        score,
        date: new Date().toISOString(),
        totalDrops,
      };

      if (existingIdx >= 0) {
        if (entries[existingIdx].score < score) {
          entries[existingIdx] = newEntry;
        }
      } else {
        entries.push(newEntry);
      }

      const sorted = entries.sort((a, b) => b.score - a.score).slice(0, 50);
      await store.setJSON('leaderboard', sorted);

      // Update rate limit
      await rateLimitStore.set(rateLimitKey, Date.now().toString());

      const rank = sorted.findIndex((e) => e.name.toLowerCase() === name.toLowerCase()) + 1;

      return new Response(JSON.stringify({ rank, entries: sorted.length }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch {
      retries--;
      if (retries > 0) {
        await new Promise((r) => setTimeout(r, 200));
      }
    }
  }

  return new Response(JSON.stringify({ error: 'Failed to save score' }), { status: 500 });
}
