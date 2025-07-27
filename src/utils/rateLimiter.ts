interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  key: string;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();

  /**
   * Check if a request is allowed based on rate limiting rules
   */
  isAllowed(config: RateLimitConfig): boolean {
    const key = config.key;
    const now = Date.now();
    const entry = this.limits.get(key);

    if (!entry) {
      // First request for this key
      this.limits.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      });
      return true;
    }

    // Check if window has expired
    if (now > entry.resetTime) {
      // Reset the counter
      this.limits.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      });
      return true;
    }

    // Check if limit exceeded
    if (entry.count >= config.maxRequests) {
      return false;
    }

    // Increment counter
    entry.count++;
    this.limits.set(key, entry);
    return true;
  }

  /**
   * Get remaining requests for a specific key
   */
  getRemaining(config: RateLimitConfig): { remaining: number; resetTime: number } {
    const key = config.key;
    const entry = this.limits.get(key);
    const now = Date.now();

    if (!entry) {
      return {
        remaining: config.maxRequests,
        resetTime: now + config.windowMs
      };
    }

    if (now > entry.resetTime) {
      return {
        remaining: config.maxRequests,
        resetTime: now + config.windowMs
      };
    }

    return {
      remaining: Math.max(0, config.maxRequests - entry.count),
      resetTime: entry.resetTime
    };
  }

  /**
   * Clear all rate limit data (useful for testing or logout)
   */
  clear(): void {
    this.limits.clear();
  }

  /**
   * Clear specific rate limit key
   */
  clearKey(key: string): void {
    this.limits.delete(key);
  }
}

// Create a singleton instance
export const rateLimiter = new RateLimiter();

// Rate limit configurations
export const RATE_LIMITS = {
  QR_SCAN: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
    key: 'qr_scan'
  },
  API_CALLS: {
    maxRequests: 100,
    windowMs: 60 * 60 * 1000, // 1 hour
    key: 'api_calls'
  },
  PROFILE_UPDATES: {
    maxRequests: 5,
    windowMs: 60 * 1000, // 1 minute
    key: 'profile_updates'
  },
  LINK_MANAGEMENT: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
    key: 'link_management'
  }
} as const;

export type RateLimitType = keyof typeof RATE_LIMITS;

// Helper function to create user-specific rate limit keys
export function createUserKey(baseKey: string, userId?: string): string {
  return userId ? `${baseKey}_${userId}` : baseKey;
}

// Rate limit decorator for functions
export function withRateLimit<T extends any[], R>(
  config: RateLimitConfig,
  fn: (...args: T) => Promise<R>
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    if (!rateLimiter.isAllowed(config)) {
      const remaining = rateLimiter.getRemaining(config);
      throw new Error(
        `Rate limit exceeded. Try again in ${Math.ceil((remaining.resetTime - Date.now()) / 1000)} seconds.`
      );
    }
    return fn(...args);
  };
} 