import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';
import { useApi } from './useApi.js';

type Suggestion = { _id?: string; title: string; focus?: string; minutes?: number; reason: string };
const load = (path: string) => getJson<{ suggestions: Suggestion[] }>(path);
// Seeded demo user; replace with the signed-in user once auth exists.
const userEmail = 'mona@example.com';

export default function Workouts() {
  const state = useApi(`/api/workouts/suggestions/${encodeURIComponent(userEmail)}`, load);
  return (
    <CapabilityCard title="Workout suggestions" description="Recommend workouts from activity patterns." state={state} isEmpty={(d) => d.suggestions.length === 0} emptyText="No workout suggestions yet.">
      {(d) => (
        <ul className="list-group">
          {d.suggestions.map((s, i) => <li className="list-group-item" key={s._id ?? i}><strong>{s.title}</strong> - {s.reason}</li>)}
        </ul>
      )}
    </CapabilityCard>
  );
}
