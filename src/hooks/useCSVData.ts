import { useState, useEffect } from 'react';
import Papa from 'papaparse';

export function useCSVData<T>(path: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(path);
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            setData(results.data as T[]);
            setLoading(false);
          },
          error: (err: Error) => {
            setError(err.message);
            setLoading(false);
          },
        });
      } catch {
        setError('Failed to fetch data');
        setLoading(false);
      }
    };

    fetchData();
  }, [path]);

  return { data, loading, error };
}