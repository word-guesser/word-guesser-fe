// Mirrors backend GAME_CONFIG - keep in sync with src/constants.ts
export const GAME_CONFIG = {
  MIN_PLAYERS: 4,
  MAX_PLAYERS: 8,
  WHITE_HAT_MIN_PLAYERS: 6,
  HINT_TIME_SECONDS: 60,
  VOTE_TIME_SECONDS: 60,
} as const;

export const ROLE_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  CIVILIAN:  { label: 'Dân',      emoji: '👤', color: 'text-blue-400'  },
  BLACK_HAT: { label: 'Mũ Đen',  emoji: '🖤', color: 'text-red-400'   },
  WHITE_HAT: { label: 'Mũ Trắng', emoji: '🤍', color: 'text-slate-300' },
};
