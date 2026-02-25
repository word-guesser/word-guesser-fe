import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import Timer from './Timer';
import type { RoomPlayer } from '../../types';

interface VotingPhaseProps {
    players: RoomPlayer[];
    eliminatedPlayers: string[];
    currentUserId?: string;
    myPlayerId?: string;
    voteCount: number;
    onVote: (targetPlayerId: string) => void;
}

export default function VotingPhase({
    players,
    eliminatedPlayers,
    currentUserId,
    myPlayerId,
    voteCount,
    onVote,
}: VotingPhaseProps) {
    const [voted, setVoted] = useState<string | null>(null);

    const activePlayers = players.filter(
        p => p.isActive && !eliminatedPlayers.includes(p.id)
    );
    const totalActive = activePlayers.length;

    function handleVote(playerId: string) {
        if (voted) return;
        setVoted(playerId);
        onVote(playerId);
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 flex items-center gap-3">
                <span className="text-xl">🗳️</span>
                <div>
                    <p className="text-sm font-semibold text-amber-300">Giai đoạn bỏ phiếu</p>
                    <p className="text-xs text-muted-foreground">Vote người bạn nghĩ là Mũ Đen hoặc Mũ Trắng</p>
                </div>
                <div className="ml-auto text-xs text-muted-foreground font-medium">
                    {voteCount}/{totalActive} phiếu
                </div>
            </div>

            <div className="rounded-xl border border-border bg-card/30 p-3">
                <Timer seconds={60} />
            </div>

            {!voted ? (
                <div className="grid grid-cols-2 gap-3">
                    {activePlayers
                        .filter(p => p.id !== myPlayerId) // can't vote yourself
                        .map(player => (
                            <button
                                key={player.id}
                                onClick={() => handleVote(player.id)}
                                className="flex items-center gap-3 rounded-2xl border border-border bg-card/40 hover:border-red-500/50 hover:bg-red-500/10 p-4 transition-all duration-200 text-left group"
                            >
                                <Avatar className="size-10">
                                    <AvatarImage src={player.avatar ?? undefined} />
                                    <AvatarFallback>{player.displayName.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm truncate">
                                        {player.displayName.split(' ').pop()}
                                    </p>
                                    {player.userId === currentUserId && (
                                        <p className="text-[10px] text-violet-400">Bạn</p>
                                    )}
                                </div>
                                <span className="text-xl opacity-0 group-hover:opacity-100 transition-opacity">☠️</span>
                            </button>
                        ))}
                </div>
            ) : (
                <div className="rounded-2xl border border-border bg-card/30 p-6 flex flex-col items-center gap-3 text-center">
                    <span className="text-4xl">✅</span>
                    <p className="font-semibold">Bạn đã bỏ phiếu!</p>
                    <p className="text-sm text-muted-foreground">Đang chờ người khác...</p>
                    <div className="w-full bg-muted rounded-full h-2 mt-2">
                        <div
                            className="bg-amber-400 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(voteCount / totalActive) * 100}%` }}
                        />
                    </div>
                    <p className="text-xs text-muted-foreground">{voteCount} / {totalActive} người đã vote</p>
                </div>
            )}
        </div>
    );
}
