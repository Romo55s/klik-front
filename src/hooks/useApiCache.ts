import { useState, useCallback, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface UseApiCacheOptions {
  cacheTime?: number; // Cache time in milliseconds (default: 5 minutes)
  staleTime?: number; // Time before data is considered stale (default: 1 minute)
}

export function useApiCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: UseApiCacheOptions = {}
) {
  const { cacheTime = 5 * 60 * 1000, staleTime = 60 * 1000 } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const cacheRef = useRef<Map<string, CacheEntry<T>>>(new Map());

  const getCachedData = useCallback((cacheKey: string): T | null => {
    const entry = cacheRef.current.get(cacheKey);
    if (!entry) return null;

    const now = Date.now();
    
    // Check if cache is expired
    if (now > entry.expiresAt) {
      cacheRef.current.delete(cacheKey);
      return null;
    }

    return entry.data;
  }, []);

  const setCachedData = useCallback((cacheKey: string, data: T) => {
    const now = Date.now();
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt: now + cacheTime,
    };
    cacheRef.current.set(cacheKey, entry);
  }, [cacheTime]);

  const fetchData = useCallback(async (forceRefresh = false) => {
    const cacheKey = key;
    
    // Check cache first (unless forcing refresh)
    if (!forceRefresh) {
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        setData(cachedData);
        return cachedData;
      }
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await fetcher();
      
      // Cache the result
      setCachedData(cacheKey, result);
      setData(result);
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [key, fetcher, getCachedData, setCachedData]);

  const invalidateCache = useCallback(() => {
    cacheRef.current.delete(key);
    setData(null);
  }, [key]);

  const isStale = useCallback(() => {
    const entry = cacheRef.current.get(key);
    if (!entry) return true;
    
    const now = Date.now();
    return now > entry.timestamp + staleTime;
  }, [key, staleTime]);

  return {
    data,
    loading,
    error,
    fetchData,
    invalidateCache,
    isStale,
  };
} 