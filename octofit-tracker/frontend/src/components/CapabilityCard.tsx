import type { ReactNode } from 'react';
import type { ApiState } from './useApi.js';

type Props<T> = { title: string; description: string; state: ApiState<T>; isEmpty: (data: T) => boolean; emptyText: string; children: (data: T) => ReactNode };

export function CapabilityCard<T>({ title, description, state, isEmpty, emptyText, children }: Props<T>) {
  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>
        {state.status === 'loading' && <p role="status">Loading {title.toLowerCase()}...</p>}
        {state.status === 'error' && <div className="alert alert-danger" role="alert">Unable to load {title.toLowerCase()}: {state.message}</div>}
        {state.status === 'ready' && (isEmpty(state.data) ? <p className="text-muted">{emptyText}</p> : children(state.data))}
      </div>
    </section>
  );
}
