import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import type { ClueRecord, RoomPlayer } from '../../types';

interface ClueListProps {
    clues: ClueRecord[];
    players: RoomPlayer[];
    currentUserId?: string;
}

export default function ClueList({ clues, players, currentUserId }: ClueListProps) {
    const getPlayer = (id: string) => players.find(p => p.id === id);

    if (clues.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground gap-2">
                <span className="text-3xl">💬</span>
                <span className="text-sm">Chưa có gợi ý nào</span>
            </div>
        );
    }

    return (
        <ScrollArea className="h-64 pr-3">
            <div className="flex flex-col gap-3">
                {clues.map((clue, i) => {
                    const player = getPlayer(clue.playerId);
                    const isMe = clue.playerId === currentUserId;
                    return (
                        <div key={i} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                            <Avatar className="size-8 shrink-0 mt-0.5">
                                <AvatarImage src={player?.avatar ?? undefined} />
                                <AvatarFallback className="text-xs">
                                    {(clue.displayName || player?.displayName || '?').charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className={`flex flex-col gap-1 max-w-[75%] ${isMe ? 'items-end' : ''}`}>
                                <span className="text-[11px] text-muted-foreground font-medium">
                                    {isMe ? 'Bạn' : (clue.displayName || player?.displayName)}
                                </span>
                                <div className={`rounded-2xl px-4 py-2 text-sm ${isMe
                                    ? 'bg-violet-600 text-white rounded-tr-sm'
                                    : 'bg-card border border-border rounded-tl-sm'
                                    }`}>
                                    {clue.content}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </ScrollArea>
    );
}
