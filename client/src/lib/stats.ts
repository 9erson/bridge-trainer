import type { GameSession } from "./db";

export interface SessionStats {
  totalSessions: number;
  avgAccuracy: number;
  avgTime: number;
  bestAccuracy: number;
  recentTrend: { date: string; accuracy: number }[];
}

export function computeSessionStats(sessions: GameSession[]): SessionStats {
  const completed = sessions.filter(s => s.isComplete);

  if (completed.length === 0) {
    return {
      totalSessions: 0,
      avgAccuracy: 0,
      avgTime: 0,
      bestAccuracy: 0,
      recentTrend: [],
    };
  }

  const totalSessions = completed.length;
  const avgAccuracy =
    completed.reduce((sum, s) => sum + s.accuracy, 0) / totalSessions;
  const avgTime =
    completed.reduce((sum, s) => sum + s.averageTime, 0) / totalSessions;
  const bestAccuracy = Math.max(...completed.map(s => s.accuracy));

  const recentTrend = completed
    .slice(0, 20)
    .reverse()
    .map(s => ({
      date: new Date(s.startedAt).toLocaleDateString(),
      accuracy: Math.round(s.accuracy * 100),
    }));

  return { totalSessions, avgAccuracy, avgTime, bestAccuracy, recentTrend };
}

export function computeAggregatedStats(
  sessions: GameSession[],
  gameTypes: string[]
): SessionStats {
  if (sessions.length === 0 || gameTypes.length === 0) {
    return {
      totalSessions: 0,
      avgAccuracy: 0,
      avgTime: 0,
      bestAccuracy: 0,
      recentTrend: [],
    };
  }

  const allCompleted = sessions.filter(s => s.isComplete);

  if (allCompleted.length === 0) {
    return {
      totalSessions: 0,
      avgAccuracy: 0,
      avgTime: 0,
      bestAccuracy: 0,
      recentTrend: [],
    };
  }

  // Group by game type and compute per-group stats
  let totalSessions = 0;
  let totalAccuracy = 0;
  let totalTime = 0;
  let bestAccuracy = 0;
  const allTrend: { date: string; accuracy: number }[] = [];

  for (const gt of gameTypes) {
    const group = allCompleted.filter(s => s.gameType === gt);
    if (group.length === 0) continue;

    const groupStats = computeSessionStats(group);
    totalSessions += groupStats.totalSessions;
    totalAccuracy += groupStats.avgAccuracy * groupStats.totalSessions;
    totalTime += groupStats.avgTime * groupStats.totalSessions;
    bestAccuracy = Math.max(bestAccuracy, groupStats.bestAccuracy);
    allTrend.push(...groupStats.recentTrend);
  }

  return {
    totalSessions,
    avgAccuracy: totalSessions > 0 ? totalAccuracy / totalSessions : 0,
    avgTime: totalSessions > 0 ? totalTime / totalSessions : 0,
    bestAccuracy,
    recentTrend: allTrend
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-20),
  };
}
