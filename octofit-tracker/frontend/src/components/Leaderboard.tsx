import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';
import { useApi } from './useApi.js';

type Entry = { teamName: string; totalPoints: number; rank: number };
const load = (path: string) => getJson<{ leaderboard: Entry[] }>(path);

export default function Leaderboard() {
  const state = useApi('/api/leaderboard', load);
  return (
    <CapabilityCard title="Leaderboard" description="Compare team point totals." state={state} isEmpty={(d) => d.leaderboard.length === 0} emptyText="No leaderboard scores yet.">
      {(d) => (
        <table className="table">
          <thead><tr><th scope="col">Rank</th><th scope="col">Team</th><th scope="col">Points</th></tr></thead>
          <tbody>{d.leaderboard.map((e) => <tr key={e.teamName}><td>{e.rank}</td><td>{e.teamName}</td><td>{e.totalPoints}</td></tr>)}</tbody>
        </table>
      )}
    </CapabilityCard>
  );
}
