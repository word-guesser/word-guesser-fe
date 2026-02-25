import { io, Socket } from 'socket.io-client';

const BASE_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const token = localStorage.getItem('wg_token');
    socket = io(BASE_URL, {
      auth: { token },
      autoConnect: false,
    });
  }
  return socket;
}

export function connectSocket(): Socket {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
}

export function disconnectSocket() {
  if (socket?.connected) {
    socket.disconnect();
  }
  socket = null; // reset so a new token is picked up next connect
}

// Re-export event name constants matching the backend
export const EVENTS = {
  // Client -> Server
  JOIN_ROOM: 'room:join',
  LEAVE_ROOM: 'room:leave',
  START_GAME: 'game:start',
  SUBMIT_CLUE: 'game:submit_clue',
  SUBMIT_VOTE: 'game:submit_vote',
  SUBMIT_GUESS: 'game:submit_guess',
  // Server -> Client
  ROOM_UPDATED: 'room:updated',
  GAME_STARTED: 'game:started',
  ROUND_STARTED: 'round:started',
  YOUR_TURN: 'round:your_turn',
  CLUE_SUBMITTED: 'round:clue_submitted',
  VOTING_STARTED: 'round:voting_started',
  VOTE_UPDATE: 'round:vote_update',
  PLAYER_ELIMINATED: 'round:player_eliminated',
  GUESSING_STARTED: 'round:guessing_started',
  ROUND_RESULT: 'round:result',
  GAME_OVER: 'game:over',
  ERROR: 'error',
} as const;
