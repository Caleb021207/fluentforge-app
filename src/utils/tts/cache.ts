
import { TTL_DURATION } from './constants';
import type { TTSCacheEntry } from './types';

// TTS cache implementation using Map
class TTSCache {
  private cache: Map<string, TTSCacheEntry>;

  constructor() {
    this.cache = new Map<string, TTSCacheEntry>();
    this.startCleanupInterval();
  }

  /**
   * Store audio in cache with timestamp
   */
  set(key: string, audio: string): void {
    if (!key || !audio) return;
    
    this.cache.set(key, {
      audio,
      timestamp: Date.now()
    });
  }

  /**
   * Get audio from cache if not expired
   */
  get(key: string): string | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) return undefined;
    
    const isExpired = Date.now() - entry.timestamp > TTL_DURATION;
    
    if (isExpired) {
      this.cache.delete(key);
      return undefined;
    }
    
    return entry.audio;
  }

  /**
   * Check if key exists in cache
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    
    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > TTL_DURATION) {
        this.cache.delete(key);
      }
    });
  }

  /**
   * Start interval for automatic cleanup
   */
  private startCleanupInterval(): void {
    setInterval(() => {
      this.cleanup();
    }, 10 * 60 * 1000); // 10 minutes
  }
}

// Export singleton instance
export const ttsCache = new TTSCache();
