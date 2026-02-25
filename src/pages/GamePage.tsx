import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '../lib/api';
import { connectSocket, EVENTS } from '../lib/socket';
import { useAuth } from '../context/AuthContext';
import type {
    Room, GameState, RoundStartedPayload, ClueSubmittedPayload,
    PlayerEliminatedPayload, GameOverPayload, RoundResultPayload,
} from '../types';

import PlayerList from '../components/game/PlayerList';
import RoleReveal from '../components/game/RoleReveal';
import HintPhase from '../components/game/HintPhase';
import VotingPhase from '../components/game/VotingPhase';
import GuessingPhase from '../components/game/GuessingPhase';
import GameOverCard from '../components/game/GameOverCard';
import { Badge } from '../components/ui/badge';
import { Spinner } from '../components/ui/spinner';
import { ROLE_LABELS } from '../lib/gameConfig';

const INITIAL_STATE: GameState = {
    phase: 'HINTING',
    round: 1,
    role: null,
    word: null,
    clues: [],
    currentTurnPlayerId: null,
    votes: {},
    voteCount: 0,
    eliminatedPlayers: [],
    lastEliminated: null,
    gameOver: false,
    winner: null,
    winnerMessage: null,
};

export default function GamePage() {
    const { roomId } = useParams<{ roomId: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [room, setRoom] = useState<Room | null>(null);
    const [game, setGame] = useState<GameState>(INITIAL_STATE);
    const [loading, setLoading] = useState(true);
    const [showRoleReveal, setShowRoleReveal] = useState(false);
    const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
    const socketRef = useRef(connectSocket());

    // Derive my player record
    const currentTurnPlayer = room?.players.find(p => p.id === game.currentTurnPlayerId);
    const isMyTurn = myPlayerId !== null && game.currentTurnPlayerId === myPlayerId;
    const isWhiteHat = game.role === 'WHITE_HAT';

    // ── Socket setup ──────────────────────────────────────────────────
    useEffect(() => {
        if (!roomId) return;
        const socket = socketRef.current;

        async function init() {
            try {
                const data = await api.rooms.get(roomId!);
                setRoom(data.room);

                const me = data.room.players.find(p => p.userId === user?.id);
                if (me) setMyPlayerId(me.id);

                socket.emit(EVENTS.JOIN_ROOM, roomId);
            } catch {
                toast.error('Không thể tải phòng. Quay về lobby.');
                navigate('/', { replace: true });
            } finally {
                setLoading(false);
            }
        }

        // ─ Handlers ─────────────────────────────────────────────────────

        const onRoomUpdated = (data: { room: Room }) => setRoom(data.room);

        const onRoundStarted = (payload: RoundStartedPayload) => {
            setGame(g => ({
                ...INITIAL_STATE,
                round: payload.round,
                role: payload.role,
                word: payload.word,
                eliminatedPlayers: g.eliminatedPlayers, // carry over eliminations
            }));
            setShowRoleReveal(true);
        };

        const onYourTurn = () => {
            // Timer resets are handled by HintPhase via key prop
        };

        const onClueSubmitted = (payload: ClueSubmittedPayload) => {
            if (payload.type === 'TURN_CHANGED') {
                setGame(g => ({ ...g, currentTurnPlayerId: payload.currentPlayerId ?? null }));
                return;
            }
            if (payload.content) {
                setGame(g => ({
                    ...g,
                    clues: [...g.clues, {
                        playerId: payload.playerId,
                        displayName: payload.displayName,
                        content: payload.content!,
                    }],
                }));
            }
        };

        const onVotingStarted = () => {
            setGame(g => ({ ...g, phase: 'VOTING', currentTurnPlayerId: null }));
            toast.info('🗳️ Giai đoạn bỏ phiếu bắt đầu!');
        };

        const onVoteUpdate = (data: { voterId: string; voteCount: number }) => {
            setGame(g => ({ ...g, voteCount: data.voteCount }));
        };

        const onPlayerEliminated = (payload: PlayerEliminatedPayload) => {
            setGame(g => ({
                ...g,
                eliminatedPlayers: [...g.eliminatedPlayers, payload.playerId],
                lastEliminated: { playerId: payload.playerId, role: payload.role, displayName: payload.displayName },
            }));
            const roleInfo = payload.role ? ROLE_LABELS[payload.role] : null;
            toast.warning(`❌ ${payload.displayName} đã bị loại${roleInfo ? ` (${roleInfo.emoji} ${roleInfo.label})` : ''}!`);
        };

        const onGuessingStarted = () => {
            setGame(g => ({ ...g, phase: 'GUESSING' }));
        };

        const onRoundResult = (payload: RoundResultPayload) => {
            toast.info(`📋 ${payload.message}`);
        };

        const onGameOver = (payload: GameOverPayload) => {
            setGame(g => ({
                ...g,
                gameOver: true,
                winner: payload.winner,
                winnerMessage: payload.message,
                whiteHatGuess: payload.whiteHatGuess,
                correctWord: payload.correctWord,
            }));
        };

        const onError = (data: { message: string }) => toast.error(data.message);

        socket.on(EVENTS.ROOM_UPDATED, onRoomUpdated);
        socket.on(EVENTS.ROUND_STARTED, onRoundStarted);
        socket.on(EVENTS.YOUR_TURN, onYourTurn);
        socket.on(EVENTS.CLUE_SUBMITTED, onClueSubmitted);
        socket.on(EVENTS.VOTING_STARTED, onVotingStarted);
        socket.on(EVENTS.VOTE_UPDATE, onVoteUpdate);
        socket.on(EVENTS.PLAYER_ELIMINATED, onPlayerEliminated);
        socket.on(EVENTS.GUESSING_STARTED, onGuessingStarted);
        socket.on(EVENTS.ROUND_RESULT, onRoundResult);
        socket.on(EVENTS.GAME_OVER, onGameOver);
        socket.on(EVENTS.ERROR, onError);

        init();

        return () => {
            socket.off(EVENTS.ROOM_UPDATED, onRoomUpdated);
            socket.off(EVENTS.ROUND_STARTED, onRoundStarted);
            socket.off(EVENTS.YOUR_TURN, onYourTurn);
            socket.off(EVENTS.CLUE_SUBMITTED, onClueSubmitted);
            socket.off(EVENTS.VOTING_STARTED, onVotingStarted);
            socket.off(EVENTS.VOTE_UPDATE, onVoteUpdate);
            socket.off(EVENTS.PLAYER_ELIMINATED, onPlayerEliminated);
            socket.off(EVENTS.GUESSING_STARTED, onGuessingStarted);
            socket.off(EVENTS.ROUND_RESULT, onRoundResult);
            socket.off(EVENTS.GAME_OVER, onGameOver);
            socket.off(EVENTS.ERROR, onError);
        };
    }, [roomId, user?.id, navigate]);

    // ── Action handlers ───────────────────────────────────────────────
    const handleSubmitClue = useCallback((content: string) => {
        socketRef.current.emit(EVENTS.SUBMIT_CLUE, { content });
    }, []);

    const handleVote = useCallback((targetPlayerId: string) => {
        socketRef.current.emit(EVENTS.SUBMIT_VOTE, { targetPlayerId });
    }, []);

    const handleSubmitGuess = useCallback((guess: string) => {
        socketRef.current.emit(EVENTS.SUBMIT_GUESS, { guess });
    }, []);

    // ── Render ────────────────────────────────────────────────────────
    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <Spinner className="size-10" />
        </div>
    );

    const roleInfo = game.role ? ROLE_LABELS[game.role] : null;
    const activePlayers = room?.players.filter(p => p.isActive) ?? [];

    return (
        <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
            {/* Ambient bg */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-56 bg-violet-600/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl" />
            </div>

            {/* Header */}
            <header className="relative z-10 flex items-center justify-between px-4 py-3 border-b border-border/60 bg-background/80 backdrop-blur-md shrink-0">
                <div className="flex items-center gap-3">
                    <span className="text-xl">🎭</span>
                    <div className="flex flex-col">
                        <span className="font-bold text-sm leading-tight">Round {game.round}</span>
                        <span className="text-xs text-muted-foreground capitalize">{
                            game.phase === 'HINTING' ? 'Gợi ý' :
                                game.phase === 'VOTING' ? 'Bỏ phiếu' :
                                    game.phase === 'GUESSING' ? 'Đoán từ' : 'Kết quả'
                        }</span>
                    </div>
                </div>

                {roleInfo && (
                    <Badge
                        variant="outline"
                        className={`gap-1.5 text-sm px-3 py-1 ${roleInfo.color} border-current/30`}
                    >
                        {roleInfo.emoji} {roleInfo.label}
                    </Badge>
                )}
            </header>

            <main className="relative z-10 flex-1 overflow-y-auto">
                <div className="max-w-2xl mx-auto p-4 flex flex-col gap-4 pb-8">
                    {/* Player grid */}
                    {room && (
                        <section className="rounded-2xl border border-border bg-card/40 backdrop-blur-sm p-4">
                            <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-3">
                                Người chơi · {activePlayers.filter(p => !game.eliminatedPlayers.includes(p.id)).length} còn lại
                            </p>
                            <PlayerList
                                players={activePlayers}
                                currentUserId={user?.id}
                                currentTurnPlayerId={game.currentTurnPlayerId}
                                eliminatedPlayers={game.eliminatedPlayers}
                                showRoles={game.gameOver}
                            />
                        </section>
                    )}

                    {/* Game phase panel */}
                    <section className="rounded-2xl border border-border bg-card/40 backdrop-blur-sm p-4">
                        {game.phase === 'HINTING' && (
                            <HintPhase
                                isMyTurn={isMyTurn}
                                currentTurnPlayerName={currentTurnPlayer?.displayName?.split(' ').pop()}
                                clues={game.clues}
                                players={room?.players ?? []}
                                currentUserId={myPlayerId ?? undefined}
                                onSubmit={handleSubmitClue}
                                myWord={game.word}
                                myRole={game.role}
                            />
                        )}
                        {game.phase === 'VOTING' && (
                            <VotingPhase
                                players={room?.players ?? []}
                                eliminatedPlayers={game.eliminatedPlayers}
                                currentUserId={user?.id}
                                myPlayerId={myPlayerId ?? undefined}
                                voteCount={game.voteCount}
                                onVote={handleVote}
                            />
                        )}
                        {game.phase === 'GUESSING' && (
                            <GuessingPhase
                                isWhiteHat={isWhiteHat}
                                onSubmitGuess={handleSubmitGuess}
                            />
                        )}
                    </section>
                </div>
            </main>

            {/* Role Reveal modal */}
            {showRoleReveal && game.role && (
                <RoleReveal
                    role={game.role}
                    word={game.word}
                    onClose={() => setShowRoleReveal(false)}
                />
            )}

            {/* Game over overlay */}
            {game.gameOver && game.winner && (
                <GameOverCard
                    winner={game.winner}
                    message={game.winnerMessage ?? ''}
                    whiteHatGuess={game.whiteHatGuess}
                    correctWord={game.correctWord}
                />
            )}
        </div>
    );
}
