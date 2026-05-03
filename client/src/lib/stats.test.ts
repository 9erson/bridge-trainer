import { describe, it, expect } from "vitest";
import { computeSessionStats, computeAggregatedStats } from "./stats";
import type { GameSession } from "./db";

function makeSession(overrides: Partial<GameSession> = {}): GameSession {
  return {
    id: "s1",
    gameType: "point-counting",
    startedAt: new Date("2025-01-15T10:00:00Z").getTime(),
    completedAt: new Date("2025-01-15T10:05:00Z").getTime(),
    isComplete: true,
    settings: "{}",
    totalHands: 5,
    correctCount: 4,
    totalTime: 25000,
    averageTime: 5000,
    accuracy: 0.8,
    extraData: "{}",
    ...overrides,
  };
}

describe("computeSessionStats", () => {
  it("returns zeroed stats for an empty array", () => {
    const result = computeSessionStats([]);

    expect(result).toEqual({
      totalSessions: 0,
      avgAccuracy: 0,
      avgTime: 0,
      bestAccuracy: 0,
      recentTrend: [],
    });
  });

  it("computes correct stats for a single complete session", () => {
    const session = makeSession();
    const result = computeSessionStats([session]);

    expect(result.totalSessions).toBe(1);
    expect(result.avgAccuracy).toBe(0.8);
    expect(result.avgTime).toBe(5000);
    expect(result.bestAccuracy).toBe(0.8);
    expect(result.recentTrend).toHaveLength(1);
    expect(result.recentTrend[0].accuracy).toBe(80);
  });

  it("filters out incomplete sessions", () => {
    const complete = makeSession({ id: "complete", accuracy: 0.9 });
    const incomplete = makeSession({
      id: "incomplete",
      isComplete: false,
      accuracy: 0.5,
    });

    const result = computeSessionStats([complete, incomplete]);

    expect(result.totalSessions).toBe(1);
    expect(result.avgAccuracy).toBe(0.9);
  });

  it("caps trend at 20 entries (most recent first)", () => {
    const sessions = Array.from({ length: 30 }, (_, i) =>
      makeSession({
        id: `s${i}`,
        startedAt: new Date(
          `2025-01-${String(i + 1).padStart(2, "0")}T10:00:00Z`
        ).getTime(),
        accuracy: 0.5 + i * 0.01,
      })
    );

    const result = computeSessionStats(sessions);

    expect(result.totalSessions).toBe(30);
    expect(result.recentTrend).toHaveLength(20);
  });

  it("computes weighted averages across multiple complete sessions", () => {
    const s1 = makeSession({
      id: "s1",
      accuracy: 0.6,
      averageTime: 3000,
    });
    const s2 = makeSession({
      id: "s2",
      accuracy: 0.8,
      averageTime: 7000,
    });

    const result = computeSessionStats([s1, s2]);

    expect(result.totalSessions).toBe(2);
    expect(result.avgAccuracy).toBeCloseTo(0.7);
    expect(result.avgTime).toBe(5000);
    expect(result.bestAccuracy).toBe(0.8);
  });
});

describe("computeAggregatedStats", () => {
  it("returns zeroed stats for empty sessions", () => {
    const result = computeAggregatedStats([], []);

    expect(result).toEqual({
      totalSessions: 0,
      avgAccuracy: 0,
      avgTime: 0,
      bestAccuracy: 0,
      recentTrend: [],
    });
  });

  it("matches computeSessionStats for a single game type", () => {
    const sessions = [
      makeSession({
        id: "s1",
        gameType: "point-counting",
        accuracy: 0.7,
        averageTime: 4000,
      }),
      makeSession({
        id: "s2",
        gameType: "point-counting",
        accuracy: 0.9,
        averageTime: 6000,
      }),
    ];

    const aggregated = computeAggregatedStats(sessions, ["point-counting"]);
    const direct = computeSessionStats(sessions);

    expect(aggregated.totalSessions).toBe(direct.totalSessions);
    expect(aggregated.avgAccuracy).toBeCloseTo(direct.avgAccuracy);
    expect(aggregated.avgTime).toBe(direct.avgTime);
    expect(aggregated.bestAccuracy).toBe(direct.bestAccuracy);
  });

  it("merges multiple game types with weighted averages", () => {
    const sessions = [
      // 2 point-counting sessions: avg accuracy 0.75, avg time 4000
      makeSession({
        id: "pc1",
        gameType: "point-counting",
        accuracy: 0.7,
        averageTime: 3000,
      }),
      makeSession({
        id: "pc2",
        gameType: "point-counting",
        accuracy: 0.8,
        averageTime: 5000,
      }),
      // 1 opening-bid session: accuracy 1.0, time 6000
      makeSession({
        id: "ob1",
        gameType: "opening-bid",
        accuracy: 1.0,
        averageTime: 6000,
      }),
    ];

    const result = computeAggregatedStats(sessions, [
      "point-counting",
      "opening-bid",
    ]);

    expect(result.totalSessions).toBe(3);
    // weighted: (0.7 + 0.8 + 1.0) / 3 ≈ 0.8333
    expect(result.avgAccuracy).toBeCloseTo((0.7 + 0.8 + 1.0) / 3);
    // weighted: (3000 + 5000 + 6000) / 3 ≈ 4666.67
    expect(result.avgTime).toBeCloseTo((3000 + 5000 + 6000) / 3);
    expect(result.bestAccuracy).toBe(1.0);
  });

  it("merges and caps trend at 20 across game types", () => {
    const sessions = Array.from({ length: 15 }, (_, i) =>
      makeSession({
        id: `pc${i}`,
        gameType: "point-counting",
        startedAt: new Date(
          `2025-01-${String(i + 1).padStart(2, "0")}T10:00:00Z`
        ).getTime(),
        accuracy: 0.5,
      })
    ).concat(
      Array.from({ length: 15 }, (_, i) =>
        makeSession({
          id: `ob${i}`,
          gameType: "opening-bid",
          startedAt: new Date(
            `2025-02-${String(i + 1).padStart(2, "0")}T10:00:00Z`
          ).getTime(),
          accuracy: 0.6,
        })
      )
    );

    const result = computeAggregatedStats(sessions, [
      "point-counting",
      "opening-bid",
    ]);

    expect(result.totalSessions).toBe(30);
    expect(result.recentTrend).toHaveLength(20);
  });
});
