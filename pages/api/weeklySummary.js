/**
 * Serverless endpoint: weekly leaderboard summary.
 * GET /api/weeklySummary?weeks=4
 * Returns aggregated leaderboard for last N weeks.
 */

import { getAllUsers, getAllWeights } from '../../lib/firebaseClient';
import { buildLeaderboardEntries } from '../../components/Leaderboard';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const weeks = parseInt(req.query.weeks, 10) || 4;
    const [users, weights] = await Promise.all([getAllUsers(), getAllWeights()]);
    const weightsByUser = {};
    weights.forEach((r) => {
      if (!weightsByUser[r.userId]) weightsByUser[r.userId] = [];
      weightsByUser[r.userId].push(r);
    });
    const filter = weeks > 0 ? weeks : null;
    const entries = buildLeaderboardEntries(users, weightsByUser, filter);
    return res.status(200).json({ entries });
  } catch (err) {
    console.error('weeklySummary:', err);
    return res.status(500).json({ error: 'Failed to compute leaderboard' });
  }
}
