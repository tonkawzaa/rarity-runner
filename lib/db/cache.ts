/**
 * LRU Cache Utility
 * Cross-request caching for performance optimization
 * Based on Vercel React Best Practices (server-cache-lru)
 */

import { LRUCache } from 'lru-cache';

// 30 minute cache TTL as per user requirement
const DEFAULT_TTL = 30 * 60 * 1000;

/**
 * Cache for Strava connections - keyed by user_id
 * Uses 30-minute TTL
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const stravaConnectionCache = new LRUCache<string, any>({
  max: 200,
  ttl: DEFAULT_TTL,
});

/**
 * Cache for leaderboard data - keyed by period:limit
 * Uses 5-minute TTL (more dynamic data)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const leaderboardCache = new LRUCache<string, any[]>({
  max: 10,
  ttl: 5 * 60 * 1000,
});

/**
 * Cache for user stats - keyed by user_id
 * Uses 30-minute TTL
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const userStatsCache = new LRUCache<string, any>({
  max: 200,
  ttl: DEFAULT_TTL,
});

/**
 * Helper to generate cache keys
 */
export function getCacheKey(...parts: (string | number | undefined)[]): string {
  return parts.filter(Boolean).join(':');
}

/**
 * Invalidate all caches for a specific user
 */
export function invalidateUserCache(userId: string): void {
  stravaConnectionCache.delete(userId);
  userStatsCache.delete(userId);
}

