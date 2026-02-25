import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Crown } from 'lucide-react';
import type { RoomPlayer, PlayerRole } from '../../types';
import { ROLE_LABELS } from '../../lib/gameConfig';

interface PlayerListProps {
    players: RoomPlayer[];
    currentUserId?: string;
    currentTurnPlayerId?: string | null;
    eliminatedPlayers?: string[];
    showRoles?: boolean;
}

export default function PlayerList({
    players,
    currentUserId,
    currentTurnPlayerId,
    eliminatedPlayers = [],
    showRoles = false,
}: PlayerListProps) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {players.map(player => {
                const isEliminated = eliminatedPlayers.includes(player.id);
                const isTurn = player.id === currentTurnPlayerId;
                const isMe = player.userId === currentUserId;
                const roleInfo = player.role ? ROLE_LABELS[player.role as PlayerRole] : null;

                return (
                    <div
                        key={player.id}
                        className={`relative flex flex-col items-center gap-2 rounded-2xl border p-3 transition-all duration-300 ${isEliminated
                            ? 'opacity-40 border-border bg-card/20 grayscale'
                            : isTurn
                                ? 'border-violet-500 bg-violet-500/10 shadow-lg shadow-violet-500/20 scale-[1.03]'
                                : isMe
                                    ? 'border-indigo-500/50 bg-indigo-500/10'
                                    : 'border-border bg-card/40'
                            }`}
                    >
                        {/* Turn indicator */}
                        {isTurn && !isEliminated && (
                            <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs bg-violet-600 text-white px-2 py-0.5 rounded-full font-medium animate-pulse">
                                Đang gợi ý
                            </span>
                        )}

                        <div className="relative">
                            <Avatar className={`size-10 ${isTurn ? 'ring-2 ring-violet-500 ring-offset-2 ring-offset-background' : ''}`}>
                                <AvatarImage src={player.avatar ?? undefined} />
                                <AvatarFallback className="text-sm">
                                    {player.displayName.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            {player.isHost && (
                                <Crown className="size-3.5 text-yellow-400 absolute -top-1 -right-1" />
                            )}
                            {isEliminated && (
                                <span className="absolute inset-0 flex items-center justify-center text-lg">❌</span>
                            )}
                        </div>

                        <span className="text-xs font-semibold truncate w-full text-center">
                            {player.displayName.split(' ').pop()}
                            {isMe && <span className="text-violet-400"> (Bạn)</span>}
                        </span>

                        {showRoles && roleInfo && (
                            <Badge variant="outline" className={`text-[10px] gap-1 ${roleInfo.color}`}>
                                {roleInfo.emoji} {roleInfo.label}
                            </Badge>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
