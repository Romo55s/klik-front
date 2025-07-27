import axios from 'axios';
import type { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { rateLimiter, RATE_LIMITS, createUserKey } from './rateLimiter';
import type { RateLimitType } from './rateLimiter';

// Extend axios config to include rate limiting
declare module 'axios' {
  interface AxiosRequestConfig {
    rateLimitType?: RateLimitType;
    userId?: string;
  }
}

/**
 * Create an axios instance with rate limiting
 */
export function createRateLimitedAxios(baseURL: string, token?: string): AxiosInstance {
  const instance = axios.create({
    baseURL,
    headers: {
      'Authorization': token ? `Bearer ${token}` : undefined,
      'Content-Type': 'application/json'
    }
  });

  // Request interceptor to check rate limits
  instance.interceptors.request.use(
    (config) => {
      const rateLimitType = config.rateLimitType;
      const userId = config.userId;

      if (rateLimitType) {
        const limitConfig = { ...RATE_LIMITS[rateLimitType] };
        const userKey = createUserKey(limitConfig.key, userId);

        if (!rateLimiter.isAllowed({ ...limitConfig, key: userKey })) {
          const { remaining, resetTime } = rateLimiter.getRemaining(limitConfig);
          const timeRemaining = Math.ceil((resetTime - Date.now()) / 1000);
          
          const error = new Error(`Rate limit exceeded. Try again in ${timeRemaining} seconds.`) as AxiosError;
          error.response = {
            status: 429,
            statusText: 'Too Many Requests',
            data: { message: `Rate limit exceeded. Try again in ${timeRemaining} seconds.` },
            headers: {},
            config: config as any
          };
          
          return Promise.reject(error);
        }
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle rate limit errors from server
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    (error: AxiosError) => {
      if (error.response?.status === 429) {
        // Server returned rate limit error
        const retryAfter = error.response.headers['retry-after'];
        const message = retryAfter 
          ? `Rate limit exceeded. Try again in ${retryAfter} seconds.`
          : 'Rate limit exceeded. Please try again later.';
        
        error.message = message;
      }
      return Promise.reject(error);
    }
  );

  return instance;
}

/**
 * Helper function to add rate limiting to existing axios calls
 */
export function withRateLimit<T extends any[], R>(
  rateLimitType: RateLimitType,
  userId: string | undefined,
  fn: (...args: T) => Promise<R>
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    const limitConfig = { ...RATE_LIMITS[rateLimitType] };
    const userKey = createUserKey(limitConfig.key, userId);

    if (!rateLimiter.isAllowed({ ...limitConfig, key: userKey })) {
      const { remaining, resetTime } = rateLimiter.getRemaining(limitConfig);
      const timeRemaining = Math.ceil((resetTime - Date.now()) / 1000);
      throw new Error(`Rate limit exceeded. Try again in ${timeRemaining} seconds.`);
    }

    return fn(...args);
  };
} 