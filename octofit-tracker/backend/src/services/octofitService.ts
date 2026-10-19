import { Types } from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

function httpError(status: number, message: string) {
  return Object.assign(new Error(message), { status });
}

function asRecord(input: unknown): Record<string, unknown> {
  return input && typeof input === 'object' ? (input as Record<string, unknown>) : {};
}

function requireObjectId(value: unknown, field: string) {
  if (typeof value !== 'string' || !Types.ObjectId.isValid(value)) throw httpError(400, `${field} must be a valid id`);
  return new Types.ObjectId(value);
}

// One point per active minute.
const pointsFor = (minutes: number) => Math.round(minutes);

export async function listActivities() {
  return Activity.find().sort({ occurredAt: -1 }).lean();
}

export async function createActivity(input: unknown) {
  const { userId, teamId, type, minutes } = asRecord(input);
  if (typeof type !== 'string' || !type.trim()) throw httpError(400, 'type is required');
  if (typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes <= 0) throw httpError(400, 'minutes must be a positive number');
  const user = requireObjectId(userId, 'userId');
  const team = requireObjectId(teamId, 'teamId');
  const [userExists, teamExists] = await Promise.all([User.exists({ _id: user }), Team.exists({ _id: team })]);
  if (!userExists) throw httpError(404, 'User not found');
  if (!teamExists) throw httpError(404, 'Team not found');
  const activity = await Activity.create({ user, team, type: type.trim(), minutes, points: pointsFor(minutes), occurredAt: new Date() });
  return activity.toObject();
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  const { name, mascot, members = [] } = asRecord(input);
  if (typeof name !== 'string' || !name.trim()) throw httpError(400, 'name is required');
  if (typeof mascot !== 'string' || !mascot.trim()) throw httpError(400, 'mascot is required');
  if (!Array.isArray(members)) throw httpError(400, 'members must be an array');
  const memberIds = members.map((member) => requireObjectId(member, 'members'));
  const team = await Team.create({ name: name.trim(), mascot: mascot.trim(), members: memberIds });
  return team.toObject();
}

export async function getLeaderboard() {
  const totals = await Activity.aggregate<{ _id: Types.ObjectId; totalPoints: number }>([
    { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    { $sort: { totalPoints: -1 } },
  ]);
  const teams = await Team.find({ _id: { $in: totals.map((t) => t._id) } }).lean();
  const names = new Map(teams.map((team) => [team._id.toString(), team.name]));
  return totals.map((entry, index) => ({
    teamId: entry._id.toString(),
    teamName: names.get(entry._id.toString()) ?? 'Unknown team',
    totalPoints: entry.totalPoints,
    rank: index + 1,
  }));
}

const focusByActivity: Record<string, string> = { run: 'endurance', cycle: 'endurance', swim: 'endurance', walk: 'endurance', strength: 'strength', yoga: 'mobility' };

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail.toLowerCase() }).lean();
  if (!user) throw httpError(404, 'User not found');
  const recent = await Activity.find({ user: user._id }).sort({ occurredAt: -1 }).limit(10).lean();
  const minutesByType = new Map<string, number>();
  for (const activity of recent) minutesByType.set(activity.type, (minutesByType.get(activity.type) ?? 0) + activity.minutes);
  const topType = [...minutesByType.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  const focus = (topType && focusByActivity[topType]) ?? user.fitnessGoal;
  const reason = topType
    ? `Matches your recent ${topType} activity and ${focus} focus`
    : `Matches your ${focus} fitness goal`;
  const workouts = await Workout.find().lean();
  workouts.sort((a, b) => Number(b.focus === focus) - Number(a.focus === focus));
  return workouts.map((workout) => ({ ...workout, reason: workout.focus === focus ? reason : `Adds variety with ${workout.focus} training` }));
}
