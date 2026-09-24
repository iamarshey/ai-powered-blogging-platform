const cacheStore = new Map<string, { value: any; expiresAt: number }>();

export async function getOrSetCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 3600
): Promise<T> {
  const cached = cacheStore.get(key);
  const now = Date.now();

  if (cached && cached.expiresAt > now) {
    return cached.value as T;
  }

  const freshValue = await fetcher();
  cacheStore.set(key, {
    value: freshValue,
    expiresAt: now + ttlSeconds * 1000,
  });

  return freshValue;
}

export function invalidateCachePattern(pattern: string) {
  for (const key of cacheStore.keys()) {
    if (key.includes(pattern)) {
      cacheStore.delete(key);
    }
  }
}
