import { useEffect, useState } from 'react';

/** One in-flight/finished request per file, shared by every component that asks for it. */
const requests = new Map<string, Promise<unknown[]>>();

async function fetchCSV<T>(path: string): Promise<T[]> {
  // the parser is loaded on demand so it stays out of the entry bundle
  const [{ default: Papa }, response] = await Promise.all([import('papaparse'), fetch(path)]);
  if (!response.ok) throw new Error(`${path}: ${response.status}`);
  const { data } = Papa.parse<T>(await response.text(), { header: true, dynamicTyping: true, skipEmptyLines: true });
  return data;
}

/** Starts (or reuses) the request for a CSV file. Safe to call early, e.g. before the page renders. */
export function loadCSV<T>(path: string): Promise<T[]> {
  let request = requests.get(path);
  if (!request) {
    request = fetchCSV<T>(path);
    requests.set(path, request);
    request.catch(() => requests.delete(path)); // let a later call retry
  }
  return request as Promise<T[]>;
}

export function useCSVData<T>(path: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadCSV<T>(path)
      .then((rows) => {
        if (cancelled) return;
        setData(rows);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError('Failed to fetch data');
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [path]);

  return { data, loading, error };
}
