// Shared types mirroring the backend contracts

export type PlayerRole = 'CIVILIAN' | 'BLACK_HAT' | 'WHITE_HAT';
export type RoomStatus = 'WAITING' | 'IN_PROGRESS' | 'FINISHED';
export type RoundPhase = 'HINTING' | 'VOTING' | 'GUESSING' | 'RESULT';
export type Winner = 'CIVILIAN' | 'BLACK_HAT' | 'WHITE_HAT';

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatar?: string | null;
}

export interface RoomPlayer {
  id: string; // Player record id
  userId: string;
  displayName: string;
  avatar?: string | null;
  isActive: boolean;
  isHost: boolean;
  role?: PlayerRole | null;
}

export interface Room {
  id: string;
  code: string;
  hostId: string;
  status: RoomStatus;
  maxPlayers: number;
  players: RoomPlayer[];
}

export interface ClueRecord {
  playerId: string;
  displayName: string;
  content: string;
  createdAt?: string;
}

// Local game state (derived from socket events)
export interface GameState {
  phase: RoundPhase;
  round: number;
  role: PlayerRole | null;
  word: string | null; // null for WHITE_HAT
  clues: ClueRecord[];
  currentTurnPlayerId: string | null;
  votes: Record<string, string>; // voterId -> targetId
  voteCount: number;
  eliminatedPlayers: string[];
  lastEliminated: { playerId: string; role: PlayerRole | null; displayName: string } | null;
  gameOver: boolean;
  winner: Winner | null;
  winnerMessage: string | null;
  whiteHatGuess?: string;
  correctWord?: string;
}

// Socket event payloads (from server)
export interface RoundStartedPayload {
  round: number;
  role: PlayerRole;
  word: string | null;
  message: string;
}

export interface ClueSubmittedPayload {
  playerId: string;
  displayName: string;
  content?: string;
  type?: 'TURN_CHANGED';
  currentPlayerId?: string;
}

export interface PlayerEliminatedPayload {
  playerId: string;
  displayName: string;
  role: PlayerRole | null;
}

export interface GameOverPayload {
  winner: Winner;
  message: string;
  whiteHatGuess?: string;
  correctWord?: string;
  correct?: boolean;
}

export interface RoundResultPayload {
  message: string;
  eliminatedPlayerId?: string | null;
  whiteHatGuess?: string;
  correctWord?: string;
}
