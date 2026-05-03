// ============================================================
// Game Module Registry
// Each game registers itself here. Adding a new game =
// creating a module + registering it in this file.
// ============================================================

import type { ComponentType } from 'react';

export interface GameDifficulty {
  id: string;
  label: string;
  description: string;
}

export interface GameConfig {
  id: string;
  name: string;
  description: string;
  icon: string; // URL to icon image
  difficulties: GameDifficulty[];
  defaultHandCount: number;
  defaultTimerSeconds: number | null; // null = no timer
  defaultDifficulty: string;
  defaultFeedbackMode: 'immediate' | 'end';
}

export interface GameModule {
  config: GameConfig;
  SetupComponent: ComponentType<{ onStart: (settings: GameSettings) => void }>;
  PlayComponent: ComponentType<{ settings: GameSettings; onComplete: (results: GameResults) => void; onQuit: () => void }>;
  ResultsComponent: ComponentType<{ results: GameResults; onPlayAgain: () => void; onBackToMenu: () => void }>;
}

export interface GameSettings {
  gameId: string;
  difficulty: string;
  handCount: number;
  timerSeconds: number | null;
  feedbackMode: 'immediate' | 'end';
  displayMode: 'text' | 'graphic';
  // Game-specific settings
  extra: Record<string, unknown>;
}

export interface GameResults {
  sessionId: string;
  gameId: string;
  settings: GameSettings;
  hands: HandResultData[];
  totalCorrect: number;
  totalHands: number;
  accuracy: number;
  totalTime: number;
  averageTime: number;
  extraData: Record<string, unknown>;
}

export interface HandResultData {
  handIndex: number;
  handData: unknown;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeTaken: number;
  explanation?: string;
}

// Game registry
const games = new Map<string, GameModule>();

export function registerGame(module: GameModule): void {
  games.set(module.config.id, module);
}

export function getGame(id: string): GameModule | undefined {
  return games.get(id);
}

export function getAllGames(): GameModule[] {
  return Array.from(games.values());
}
