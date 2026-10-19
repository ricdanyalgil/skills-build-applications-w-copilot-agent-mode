import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

export type ApiState<T> = { status: 'loading' } | { status: 'error'; message: string } | { status: 'ready'; data: T };

// Shared loader so each capability handles loading, empty, and error states the same way.
export function useApi<T>(path: string, load: (path: string) => Promise<T> = getJson<T>): ApiState<T> {
  const [state, setState] = useState<ApiState<T>>({ status: 'loading' });
  useEffect(() => {
    let active = true;
    setState({ status: 'loading' });
    load(path)
      .then((data) => active && setState({ status: 'ready', data }))
      .catch((error: Error) => active && setState({ status: 'error', message: error.message }));
    return () => { active = false; };
  }, [path, load]);
  return state;
}
