import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';
import { useApi } from './useApi.js';

type Team = { _id?: string; name: string; mascot?: string; members: string[] };
const load = (path: string) => getJson<{ teams: Team[] }>(path);

export default function Teams() {
  const state = useApi('/api/teams', load);
  return (
    <CapabilityCard title="Teams" description="Manage teams and members." state={state} isEmpty={(d) => d.teams.length === 0} emptyText="No teams created yet.">
      {(d) => (
        <ul className="list-group">
          {d.teams.map((t, i) => <li className="list-group-item" key={t._id ?? i}><strong>{t.name}</strong>{t.mascot ? ` (${t.mascot})` : ''} - {t.members.length} member(s)</li>)}
        </ul>
      )}
    </CapabilityCard>
  );
}
