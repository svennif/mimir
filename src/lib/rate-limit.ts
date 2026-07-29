const attempts = new Map<string, { count: number, resetAt: number }>();

export function checkRateLimit(key: string, max = 5, windowMs = 60_000): boolean {
  const now = Date.now();
  const rec = attempts.get(key);

  if (!rec || now > rec.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (rec.count >= max) return false;
  rec.count++;
  return true;
}