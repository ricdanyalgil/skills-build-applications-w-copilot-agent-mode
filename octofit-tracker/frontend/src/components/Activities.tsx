import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';
import { useApi } from './useApi.js';

type Activity = { _id?: string; type: string; minutes: number; points: number; occurredAt?: string };
const load = (path: string) => getJson<{ activities: Activity[] }>(path);

export default function Activities() {
  const state = useApi('/api/activities', load);
  return (
    <CapabilityCard title="Activities" description="Track student activity minutes and points." state={state} isEmpty={(d) => d.activities.length === 0} emptyText="No activities logged yet (empty state).">
      {(d) => (
        <table className="table table-striped">
          <thead><tr><th scope="col">Type</th><th scope="col">Minutes</th><th scope="col">Points</th></tr></thead>
          <tbody>{d.activities.map((a, i) => <tr key={a._id ?? i}><td>{a.type}</td><td>{a.minutes}</td><td>{a.points}</td></tr>)}</tbody>
        </table>
      )}
    </CapabilityCard>
  );
}
