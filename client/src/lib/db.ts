// ============================================================
// IndexedDB storage layer using idb
// Stores sessions, individual hand results, and settings
// ============================================================

import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

export interface HandResult {
  id: string;
  sessionId: string;
  handIndex: number;
  handData: string; // JSON serialized BridgeHand
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeTaken: number; // ms
  timestamp: number;
}

export interface GameSession {
  id: string;
  gameType: string;
  startedAt: number;
  completedAt: number | null;
  isComplete: boolean;
  settings: string; // JSON serialized settings
  totalHands: number;
  correctCount: number;
  totalTime: number; // ms
  averageTime: number; // ms per hand
  accuracy: number; // 0-1
  extraData: string; // JSON for game-specific data (e.g., avg HCP)
}

interface BridgeTrainerDB extends DBSchema {
  sessions: {
    key: string;
    value: GameSession;
    indexes: {
      'by-game-type': string;
      'by-started-at': number;
    };
  };
  hands: {
    key: string;
    value: HandResult;
    indexes: {
      'by-session': string;
      'by-timestamp': number;
    };
  };
}

let dbInstance: IDBPDatabase<BridgeTrainerDB> | null = null;

async function getDB(): Promise<IDBPDatabase<BridgeTrainerDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<BridgeTrainerDB>('bridge-trainer', 1, {
    upgrade(db) {
      const sessionStore = db.createObjectStore('sessions', { keyPath: 'id' });
      sessionStore.createIndex('by-game-type', 'gameType');
      sessionStore.createIndex('by-started-at', 'startedAt');

      const handStore = db.createObjectStore('hands', { keyPath: 'id' });
      handStore.createIndex('by-session', 'sessionId');
      handStore.createIndex('by-timestamp', 'timestamp');
    },
  });

  return dbInstance;
}

// Session operations
export async function saveSession(session: GameSession): Promise<void> {
  const db = await getDB();
  await db.put('sessions', session);
}

export async function getSession(id: string): Promise<GameSession | undefined> {
  const db = await getDB();
  return db.get('sessions', id);
}

export async function getSessionsByGameType(gameType: string): Promise<GameSession[]> {
  const db = await getDB();
  const sessions = await db.getAllFromIndex('sessions', 'by-game-type', gameType);
  return sessions.sort((a, b) => b.startedAt - a.startedAt);
}

export async function getAllSessions(): Promise<GameSession[]> {
  const db = await getDB();
  const sessions = await db.getAll('sessions');
  return sessions.sort((a, b) => b.startedAt - a.startedAt);
}

export async function deleteSession(id: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['sessions', 'hands'], 'readwrite');
  await tx.objectStore('sessions').delete(id);
  // Delete associated hands
  const handIndex = tx.objectStore('hands').index('by-session');
  let cursor = await handIndex.openCursor(id);
  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }
  await tx.done;
}

// Hand result operations
export async function saveHandResult(result: HandResult): Promise<void> {
  const db = await getDB();
  await db.put('hands', result);
}

export async function getHandsBySession(sessionId: string): Promise<HandResult[]> {
  const db = await getDB();
  const hands = await db.getAllFromIndex('hands', 'by-session', sessionId);
  return hands.sort((a, b) => a.handIndex - b.handIndex);
}

// Stats helpers
export async function getCompletedSessionStats(gameType: string): Promise<{
  totalSessions: number;
  avgAccuracy: number;
  avgTime: number;
  bestAccuracy: number;
  recentTrend: { date: string; accuracy: number }[];
}> {
  const sessions = (await getSessionsByGameType(gameType)).filter((s) => s.isComplete);

  if (sessions.length === 0) {
    return { totalSessions: 0, avgAccuracy: 0, avgTime: 0, bestAccuracy: 0, recentTrend: [] };
  }

  const totalSessions = sessions.length;
  const avgAccuracy = sessions.reduce((sum, s) => sum + s.accuracy, 0) / totalSessions;
  const avgTime = sessions.reduce((sum, s) => sum + s.averageTime, 0) / totalSessions;
  const bestAccuracy = Math.max(...sessions.map((s) => s.accuracy));

  // Last 20 sessions for trend
  const recentTrend = sessions.slice(0, 20).reverse().map((s) => ({
    date: new Date(s.startedAt).toLocaleDateString(),
    accuracy: Math.round(s.accuracy * 100),
  }));

  return { totalSessions, avgAccuracy, avgTime, bestAccuracy, recentTrend };
}
