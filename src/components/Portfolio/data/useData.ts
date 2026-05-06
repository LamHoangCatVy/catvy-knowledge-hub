import { useState, useEffect, useRef } from 'react';

interface UseDataOptions {
  cacheKey?: string;
  ttl?: number; // milliseconds
}

interface UseDataResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useData<T>(path: string, fallback?: T, options: UseDataOptions = {}): UseDataResult<T> {
  const { cacheKey = path, ttl = 3600000 } = options; // default 1h cache
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchData = async () => {
    if (!mountedRef.current) return;

    // Try localStorage cache first
    try {
      const cached = localStorage.getItem(`cv-data-${cacheKey}`);
      if (cached) {
        const { data: cachedData, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < ttl) {
          setData(cachedData);
          setLoading(false);
          return;
        }
      }
    } catch {}

    // Fetch from static data
    try {
      const res = await fetch(path);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const jsonData: T = await res.json();
      if (mountedRef.current) {
        setData(jsonData);
        setLoading(false);

        // Cache to localStorage
        try {
          localStorage.setItem(
            `cv-data-${cacheKey}`,
            JSON.stringify({ data: jsonData, timestamp: Date.now() })
          );
        } catch {}
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        // Use fallback if provided
        if (fallback !== undefined) {
          setData(fallback);
        }
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    return () => {
      mountedRef.current = false;
    };
  }, [path]);

  return { data, loading, error, refetch: fetchData };
}
