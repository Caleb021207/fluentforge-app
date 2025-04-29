
import { TTL_DURATION, CACHE_CLEANUP_INTERVAL } from './constants';
import type { TTSCacheEntry } from './types';

/**
 * TTS Cache implementation for efficient audio caching
 */
class TTSCache {
  private cache = new Map<string, TTSCacheEntry>();

  constructor() {
    if (typeof window !== 'undefined') {
      setInterval(() => this.cleanup(), CACHE_CLEANUP_INTERVAL);
    }
  }

  /**
   * Get cached audio content if it exists
   */
  get(key: string): string | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    // Check if the entry has expired
    if (Date.now() - entry.timestamp > TTL_DURATION) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.audioContent;
  }

  /**
   * Store audio content in the cache
   */
  set(key: string, audioContent: string): void {
    this.cache.set(key, {
      audioContent,
      timestamp: Date.now()
    });
  }

  /**
   * Create a cache key based on text, language, and target flag
   */
  createKey(text: string, language: string, isTargetLanguage: boolean): string {
    return `${language}_${isTargetLanguage ? 'target' : 'native'}_${text.substring(0, 50)}`;
  }

  /**
   * Cleanup expired cache entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > TTL_DURATION) {
        this.cache.delete(key);
      }
    }
  }
}

// Create a single instance of the cache
export const ttsCache = new TTSCache();
