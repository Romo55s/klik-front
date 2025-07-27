import { useState, useEffect, useCallback } from 'react';
import { rateLimiter, RATE_LIMITS, createUserKey } from '../utils/rateLimiter';
import type { RateLimitType } from '../utils/rateLimiter';

interface RateLimitState {
  remaining: number;
  resetTime: number;
  isLimited: boolean;
}

export function useRateLimit(limitType: RateLimitType, userId?: string) {
  const [state, setState] = useState<RateLimitState>(() => {
    const config = { ...RATE_LIMITS[limitType] };
    const userKey = createUserKey(config.key, userId);
    const { remaining, resetTime } = rateLimiter.getRemaining({ ...config, key: userKey });
    return {
      remaining,
      resetTime,
      isLimited: remaining === 0
    };
  });

  const updateState = useCallback(() => {
    const config = { ...RATE_LIMITS[limitType] };
    const userKey = createUserKey(config.key, userId);
    const { remaining, resetTime } = rateLimiter.getRemaining({ ...config, key: userKey });
    setState({
      remaining,
      resetTime,
      isLimited: remaining === 0
    });
  }, [limitType, userId]);

  // Update state when userId changes
  useEffect(() => {
    updateState();
  }, [updateState]);

  // Check remaining time every second when limited
  useEffect(() => {
    if (!state.isLimited) return;

    const interval = setInterval(() => {
      const now = Date.now();
      if (now >= state.resetTime) {
        updateState();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [state.isLimited, state.resetTime, updateState]);

  const checkLimit = useCallback(() => {
    const config = { ...RATE_LIMITS[limitType] };
    const userKey = createUserKey(config.key, userId);
    const isAllowed = rateLimiter.isAllowed({ ...config, key: userKey });
    
    if (!isAllowed) {
      updateState();
    }
    
    return isAllowed;
  }, [limitType, userId, updateState]);

  const getTimeRemaining = useCallback(() => {
    const now = Date.now();
    const timeRemaining = Math.max(0, state.resetTime - now);
    return Math.ceil(timeRemaining / 1000);
  }, [state.resetTime]);

  return {
    ...state,
    checkLimit,
    getTimeRemaining,
    updateState
  };
} 