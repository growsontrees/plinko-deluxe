export function validateName(name: unknown): { valid: boolean; error?: string } {
  if (typeof name !== 'string') {
    return { valid: false, error: 'Name must be a string' };
  }
  const trimmed = name.trim();
  if (trimmed.length < 3) {
    return { valid: false, error: 'Name must be at least 3 characters' };
  }
  if (trimmed.length > 20) {
    return { valid: false, error: 'Name must be at most 20 characters' };
  }
  if (/<[^>]*>/.test(trimmed)) {
    return { valid: false, error: 'Name cannot contain HTML' };
  }
  return { valid: true };
}

export function sanitizeName(name: string): string {
  return name
    .trim()
    .replace(/<[^>]*>/g, '')
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .slice(0, 20);
}

export function validateScore(score: unknown): { valid: boolean; error?: string } {
  if (typeof score !== 'number' || isNaN(score)) {
    return { valid: false, error: 'Score must be a number' };
  }
  if (score <= 0) {
    return { valid: false, error: 'Score must be positive' };
  }
  if (score > 10000000) {
    return { valid: false, error: 'Score exceeds maximum' };
  }
  return { valid: true };
}

export function isScorePlausible(score: number, totalDrops: number): boolean {
  return score <= 1000 * (100 + totalDrops);
}
