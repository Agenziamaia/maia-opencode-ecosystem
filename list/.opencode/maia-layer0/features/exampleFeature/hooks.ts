import { useState, useEffect, useCallback } from 'react';

interface DataItem {
  id: string;
  name: string;
  value: number;
}

export function useExampleFeature() {
  const [data, setData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/example');
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const result = (await response.json()) as DataItem[];
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
