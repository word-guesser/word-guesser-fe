import { useState } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import Timer from './Timer';
import ClueList from './ClueList';
import type { ClueRecord, RoomPlayer } from '../../types';

interface HintPhaseProps {
    isMyTurn: boolean;
    currentTurnPlayerName?: string;
    clues: ClueRecord[];
    players: RoomPlayer[];
    currentUserId?: string;
    onSubmit: (content: string) => void;
    myWord: string | null;
    myRole: string | null;
}

export default function HintPhase({
    isMyTurn,
    currentTurnPlayerName,
    clues,
    players,
    currentUserId,
    onSubmit,
    myWord,
    myRole,
}: HintPhaseProps) {
    const [content, setContent] = useState('');

    function handleSubmit() {
        if (!content.trim()) return;
        onSubmit(content.trim());
        setContent('');
    }

    // Reset submitted state when turn changes
    const hasMyClue = clues.some(c => c.playerId === currentUserId);

    return (
        <div className="flex flex-col gap-4">
            {/* Word reminder */}
            {myWord && (
                <div className="rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-3 flex items-center gap-3">
                    <span className="text-xl">🔐</span>
                    <div>
                        <p className="text-[11px] text-violet-400 font-medium uppercase tracking-widest">Từ của bạn</p>
                        <p className="font-bold text-lg tracking-wide">{myWord}</p>
                    </div>
                </div>
            )}
            {myRole === 'WHITE_HAT' && (
                <div className="rounded-xl border border-slate-500/30 bg-slate-500/10 px-4 py-3 flex items-center gap-3">
                    <span className="text-xl">🤍</span>
                    <div>
                        <p className="text-[11px] text-slate-400 font-medium">Bạn là Mũ Trắng</p>
                        <p className="text-sm text-muted-foreground">Hãy lắng nghe gợi ý và đoán từ của Dân.</p>
                    </div>
                </div>
            )}

            {/* Timer & turn indicator */}
            {isMyTurn && !hasMyClue && (
                <div className="rounded-xl border border-violet-500/40 bg-violet-500/5 p-4 flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <span className="size-2 bg-violet-400 rounded-full animate-pulse" />
                        <span className="text-sm font-semibold text-violet-300">Đến lượt bạn!</span>
                    </div>
                    <Timer key={clues.length} seconds={60} onExpire={() => { if (content.trim()) handleSubmit(); }} />
                </div>
            )}
            {!isMyTurn && (
                <div className="rounded-xl border border-border bg-card/30 px-4 py-3 text-sm text-muted-foreground flex items-center gap-2">
                    <span className="size-2 bg-green-400 rounded-full animate-pulse" />
                    <span><span className="font-medium text-foreground">{currentTurnPlayerName}</span> đang gợi ý...</span>
                </div>
            )}

            {/* Clue history */}
            <div className="rounded-xl border border-border bg-card/30 p-4">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mb-3">Gợi ý đã đưa ra</p>
                <ClueList clues={clues} players={players} currentUserId={currentUserId} />
            </div>

            {/* Input */}
            {isMyTurn && !hasMyClue && (
                <div className="flex flex-col gap-2">
                    <Textarea
                        placeholder="Nhập gợi ý của bạn... (không nói thẳng từ!)"
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                        rows={2}
                        className="resize-none bg-card/60 border-border focus:border-violet-500/50"
                    />
                    <Button
                        onClick={handleSubmit}
                        disabled={!content.trim()}
                        className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold"
                    >
                        Gửi gợi ý 💬
                    </Button>
                </div>
            )}
            {hasMyClue && (
                <p className="text-center text-sm text-muted-foreground py-2">✅ Bạn đã gửi gợi ý. Chờ người khác...</p>
            )}
        </div>
    );
}
