
/**
 * Creates a TTSCache for storing audio elements
 */
export function createTTSCache() {
  const cache = new Map<string, string>();
  
  const TTL_DURATION = 5 * 60 * 1000; // 5 minutes
  const expirationTimes = new Map<string, number>();
  
  // Clean up expired cache entries every minute
  const CLEANUP_INTERVAL = 60 * 1000; // 1 minute
  const intervalId = setInterval(() => {
    const now = Date.now();
    for (const [key, expiration] of expirationTimes.entries()) {
      if (now > expiration) {
        cache.delete(key);
        expirationTimes.delete(key);
      }
    }
  }, CLEANUP_INTERVAL);
  
  return {
    get: (text: string, language: string, speechRate: number = 1.0): string | undefined => {
      const key = `${language}:${speechRate}:${text}`;
      return cache.get(key);
    },
    
    set: (text: string, language: string, audioBase64: string, speechRate: number = 1.0): void => {
      const key = `${language}:${speechRate}:${text}`;
      cache.set(key, audioBase64);
      expirationTimes.set(key, Date.now() + TTL_DURATION);
    },
    
    has: (text: string, language: string, speechRate: number = 1.0): boolean => {
      const key = `${language}:${speechRate}:${text}`;
      return cache.has(key);
    },
    
    clear: (): void => {
      cache.clear();
      expirationTimes.clear();
      clearInterval(intervalId);
    }
  };
}

// Create a singleton instance of the TTSCache that can be used throughout the app
export const ttsCache = createTTSCache();
