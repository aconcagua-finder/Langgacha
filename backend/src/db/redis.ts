import { Redis } from "ioredis";

type StoredValue = {
  value: string;
  expiresAt: number;
};

const TTL_SECONDS = 60 * 30;
const inMemory = new Map<string, StoredValue>();

const getRedis = (): Redis | null => {
  const url = process.env.REDIS_URL;
  if (!url) return null;
  try {
    return new Redis(url, {
      maxRetriesPerRequest: 1,
      enableReadyCheck: true,
      lazyConnect: false,
    });
  } catch {
    return null;
  }
};

const redis = getRedis();
let warnedFallback = false;

const warnFallbackOnce = (reason: string) => {
  if (warnedFallback) return;
  warnedFallback = true;
  // eslint-disable-next-line no-console
  console.warn(`[battleStore] Redis unavailable, using in-memory fallback (${reason}).`);
};

export const battleStore = {
  ttlSeconds: TTL_SECONDS,

  async set(key: string, rawJson: string): Promise<void> {
    if (redis) {
      try {
        await redis.set(key, rawJson, "EX", TTL_SECONDS);
        return;
      } catch {
        warnFallbackOnce("set failed");
        // fall through to in-memory
      }
    }

    inMemory.set(key, { value: rawJson, expiresAt: Date.now() + TTL_SECONDS * 1000 });
  },

  async get(key: string): Promise<string | null> {
    if (redis) {
      try {
        return await redis.get(key);
      } catch {
        warnFallbackOnce("get failed");
        // fall through to in-memory
      }
    }

    const entry = inMemory.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      inMemory.delete(key);
      return null;
    }
    return entry.value;
  },

  async del(key: string): Promise<void> {
    if (redis) {
      try {
        await redis.del(key);
      } catch {
        // ignore
      }
    }
    inMemory.delete(key);
  },
};
