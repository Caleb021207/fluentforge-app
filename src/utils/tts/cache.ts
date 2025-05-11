
/**
 * Creates a TTSCache for storing audio elements
 */
export function createTTSCache() {
  const cache = new Map<string, HTMLAudioElement>();
  
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
    get: (text: string, language: string): HTMLAudioElement | undefined => {
      const key = `${language}:${text}`;
      return cache.get(key);
    },
    
    set: (text: string, language: string, audio: HTMLAudioElement): void => {
      const key = `${language}:${text}`;
      cache.set(key, audio);
      expirationTimes.set(key, Date.now() + TTL_DURATION);
    },
    
    has: (text: string, language: string): boolean => {
      const key = `${language}:${text}`;
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
