
/**
 * Utility for frontend data caching to reduce API calls
 */

type CacheEntry<T> = {
  data: T;
  timestamp: number;
  ttl: number;
};

export class DataCache {
  private static instance: DataCache;
  private cache: Map<string, CacheEntry<any>> = new Map();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes in milliseconds

  private constructor() {}

  /**
   * Get the singleton instance of the cache
   */
  public static getInstance(): DataCache {
    if (!DataCache.instance) {
      DataCache.instance = new DataCache();
    }
    return DataCache.instance;
  }

  /**
   * Set cache entry with custom TTL
   */
  public set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });

    // Cleanup: remove expired entries if cache gets too large
    if (this.cache.size > 100) {
      this.pruneExpired();
    }
  }

  /**
   * Get data from cache if not expired
   */
  public get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    // Check if the entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Remove data from cache
   */
  public remove(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear the entire cache
   */
  public clear(): void {
    this.cache.clear();
  }

  /**
   * Remove all expired entries
   */
  private pruneExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

/**
 * Hook for using cached data in components
 */
export const useDataCache = () => {
  const cache = DataCache.getInstance();
  
  return {
    /**
     * Get data from cache with fallback fetch function
     */
    getCachedData: async <T>(
      key: string, 
      fetchFn: () => Promise<T>, 
      ttl?: number
    ): Promise<T> => {
      // Check cache first
      const cachedData = cache.get<T>(key);
      if (cachedData !== null) {
        return cachedData;
      }
      
      // If not in cache, fetch it
      const data = await fetchFn();
      cache.set(key, data, ttl);
      return data;
    },
    
    /**
     * Manually set cache value
     */
    setCacheValue: <T>(key: string, value: T, ttl?: number): void => {
      cache.set(key, value, ttl);
    },
    
    /**
     * Invalidate a cache entry
     */
    invalidateCache: (key: string): void => {
      cache.remove(key);
    },
    
    /**
     * Clear all cache entries
     */
    clearCache: (): void => {
      cache.clear();
    }
  };
};
