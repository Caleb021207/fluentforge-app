
import { TTL_DURATION, CACHE_CLEANUP_INTERVAL } from './constants';
import type { TTSCacheEntry } from './types';

/**
 * Optimized TTS Cache implementation with memory efficiency
 */
class TTSCache {
  private cache = new Map<string, TTSCacheEntry>();
  private cleanupTimer: number | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      // Only start cleanup timer if it doesn't exist
      if (!this.cleanupTimer) {
        this.cleanupTimer = window.setInterval(() => this.cleanup(), CACHE_CLEANUP_INTERVAL);
      }
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
    // Don't cache extremely large strings to avoid memory issues
    if (audioContent.length > 1000000) {
      console.warn('Audio content too large for caching');
      return;
    }
    
    this.cache.set(key, {
      audioContent,
      timestamp: Date.now()
    });
  }

  /**
   * Create a cache key based on text, language, and target flag
   */
  createKey(text: string, language: string, isTargetLanguage: boolean): string {
    // Use hash function for long texts to avoid very long keys
    const textPart = text.length > 50 
      ? `${text.substring(0, 50)}_${this.hashString(text)}`
      : text;
      
    return `${language}_${isTargetLanguage ? 'target' : 'native'}_${textPart}`;
  }

  /**
   * Simple hash function for strings
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return hash.toString(36); // Convert to base36 for shorter string
  }

  /**
   * Cleanup expired cache entries
   */
  private cleanup(): void {
    const now = Date.now();
    let deletedCount = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > TTL_DURATION) {
        this.cache.delete(key);
        deletedCount++;
      }
    }
    
    // Log cleanup only if something was actually deleted
    if (deletedCount > 0) {
      console.log(`TTS cache cleanup: removed ${deletedCount} entries, remaining: ${this.cache.size}`);
    }
    
    // If cache grows too big, remove oldest entries regardless of TTL
    if (this.cache.size > 100) {
      const entries = [...this.cache.entries()];
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      // Remove oldest 30% of entries
      const removeCount = Math.floor(entries.length * 0.3);
      for (let i = 0; i < removeCount; i++) {
        this.cache.delete(entries[i][0]);
      }
      
      console.log(`TTS cache size limit reached: removed ${removeCount} oldest entries`);
    }
  }
}

// Create a single instance of the cache
export const ttsCache = new TTSCache();
