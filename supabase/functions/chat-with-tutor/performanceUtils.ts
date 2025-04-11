
// Performance utilities

// Connection Pool for OpenAI requests
export class ConnectionPool {
  private activeConnections = 0;
  private maxConnections = 50; // Adjust based on load testing
  private waitingQueue: { resolve: (value: boolean) => void; reject: (reason: Error) => void }[] = [];
  
  async acquire(): Promise<boolean> {
    if (this.activeConnections < this.maxConnections) {
      this.activeConnections++;
      return true;
    }
    
    return new Promise((resolve, reject) => {
      this.waitingQueue.push({ resolve, reject });
      setTimeout(() => {
        // If we can't get a connection in 10 seconds, reject
        const index = this.waitingQueue.findIndex(item => item.resolve === resolve);
        if (index >= 0) {
          this.waitingQueue.splice(index, 1);
          reject(new Error("Connection pool timeout"));
        }
      }, 10000);
    });
  }
  
  release(): void {
    if (this.waitingQueue.length > 0) {
      const next = this.waitingQueue.shift();
      if (next) {
        next.resolve(true);
      }
    } else {
      this.activeConnections--;
    }
  }
}

// Request rate limiting
export class RateLimiter {
  private requests: Record<string, number[]> = {};
  private windowMs = 60000; // 1 minute window
  private maxRequests = 30; // 30 requests per minute per user
  
  isRateLimited(userId: string): boolean {
    const now = Date.now();
    if (!this.requests[userId]) {
      this.requests[userId] = [];
    }
    
    // Remove expired timestamps
    this.requests[userId] = this.requests[userId].filter(
      timestamp => now - timestamp < this.windowMs
    );
    
    // Check if maxRequests reached
    if (this.requests[userId].length >= this.maxRequests) {
      return true;
    }
    
    // Add current request timestamp
    this.requests[userId].push(now);
    return false;
  }
}
