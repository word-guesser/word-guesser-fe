import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '../lib/api';
import { connectSocket, getSocket, EVENTS } from '../lib/socket';
import { useAuth } from '../context/AuthContext';
import type { Room } from '../types';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Copy, Play, LogOut, Users, Crown, Clock } from 'lucide-react';
import { GAME_CONFIG } from '../lib/gameConfig';

export default function RoomPage() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [room, setRoom] = useState<Room | null>(null);
    const [loading, setLoading] = useState(true);
    const [starting, setStarting] = useState(false);

    const handleRoomUpdate = useCallback((data: { room: Room }) => {
        setRoom(data.room);
        // If game started, navigate to game page
        if (data.room.status === 'IN_PROGRESS') {
            navigate(`/game/${data.room.id}`, { replace: true });
        }
    }, [navigate]);

    useEffect(() => {
        if (!id) return;

        async function init() {
            try {
                const data = await api.rooms.get(id!);
                setRoom(data.room);
                if (data.room.status === 'IN_PROGRESS') {
                    navigate(`/game/${id}`, { replace: true });
                    return;
                }

                // Connect socket and join room channel
                const socket = connectSocket();
                socket.on(EVENTS.ROOM_UPDATED, handleRoomUpdate);
                socket.on(EVENTS.GAME_STARTED, handleRoomUpdate);
                socket.on(EVENTS.ERROR, (e: { message: string }) => toast.error(e.message));
                socket.emit(EVENTS.JOIN_ROOM, id);
            } catch (e) {
                toast.error((e as Error).message);
                navigate('/', { replace: true });
            } finally {
                setLoading(false);
            }
        }

        init();

        return () => {
            const socket = getSocket();
            if (socket) {
                socket.off(EVENTS.ROOM_UPDATED, handleRoomUpdate);
                socket.off(EVENTS.GAME_STARTED, handleRoomUpdate);
                socket.off(EVENTS.ERROR);
            }
        };
    }, [id, navigate, handleRoomUpdate]);

    function handleStart() {
        if (!id) return;
        setStarting(true);
        try {
            getSocket().emit(EVENTS.START_GAME, id);
        } catch (e) {
            toast.error((e as Error).message);
            setStarting(false);
        }
    }

    async function handleLeave() {
        if (!id) return;
        try {
            getSocket().emit(EVENTS.LEAVE_ROOM);
            await api.rooms.leave(id);
            navigate('/', { replace: true });
        } catch {
            navigate('/', { replace: true });
        }
    }

    function copyCode() {
        if (room?.code) {
            navigator.clipboard.writeText(room.code);
            toast.success('Đã sao chép mã phòng!');
        }
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <Spinner className="size-10" />
        </div>
    );
    if (!room) return null;

    const isHost = room.hostId === user?.id;
    const activePlayers = room.players.filter(p => p.isActive);
    const canStart = isHost && activePlayers.length >= GAME_CONFIG.MIN_PLAYERS;

    return (
        <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-48 bg-violet-600/10 rounded-full blur-3xl" />
            </div>

            {/* Header */}
            <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-border/60 bg-background/80 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <span className="text-xl">🎭</span>
                    <span className="font-bold">Phòng chờ</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLeave} className="gap-2 text-muted-foreground hover:text-destructive">
                    <LogOut className="size-4" /> Rời phòng
                </Button>
            </header>

            <main className="relative z-10 flex-1 flex flex-col items-center p-6 gap-6 max-w-2xl mx-auto w-full">
                {/* Room code */}
                <div className="w-full rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-6 flex flex-col items-center gap-3 shadow-xl">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Mã phòng</p>
                    <button
                        onClick={copyCode}
                        className="group flex items-center gap-3 bg-background/60 rounded-xl px-6 py-3 border border-border hover:border-violet-500/50 transition-all"
                    >
                        <span className="font-mono text-4xl font-bold tracking-[0.3em] text-violet-400">{room.code}</span>
                        <Copy className="size-5 text-muted-foreground group-hover:text-violet-400 transition-colors" />
                    </button>
                    <p className="text-xs text-muted-foreground">Nhấn để sao chép • Chia sẻ với bạn bè</p>
                </div>

                {/* Player count + status */}
                <div className="w-full flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="size-4" />
                        <span className="text-sm font-medium">
                            {activePlayers.length} / {room.maxPlayers} người chơi
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="size-4" />
                        <span className="text-sm">Cần ít nhất {GAME_CONFIG.MIN_PLAYERS} người</span>
                    </div>
                </div>

                {/* Player list */}
                <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {activePlayers.map((player) => (
                        <div
                            key={player.id}
                            className={`flex flex-col items-center gap-2 rounded-2xl border p-4 transition-all ${player.userId === user?.id
                                ? 'border-violet-500/50 bg-violet-500/10'
                                : 'border-border bg-card/40'
                                }`}
                        >
                            <div className="relative">
                                <Avatar className="size-12">
                                    <AvatarImage src={player.avatar ?? undefined} />
                                    <AvatarFallback>{player.displayName.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                {player.isHost && (
                                    <Crown className="size-4 text-yellow-400 absolute -top-1 -right-1" />
                                )}
                            </div>
                            <span className="text-xs font-semibold text-center truncate w-full text-center">
                                {player.displayName.split(' ').pop()}
                            </span>
                            {player.userId === user?.id && (
                                <Badge variant="secondary" className="text-[10px] px-2 py-0">Bạn</Badge>
                            )}
                        </div>
                    ))}

                    {/* Empty slots */}
                    {Array.from({ length: room.maxPlayers - activePlayers.length }).map((_, i) => (
                        <div
                            key={`empty-${i}`}
                            className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border/40 p-4 opacity-40"
                        >
                            <div className="size-12 rounded-full bg-muted flex items-center justify-center">
                                <span className="text-muted-foreground text-lg">?</span>
                            </div>
                            <span className="text-xs text-muted-foreground">Trống</span>
                        </div>
                    ))}
                </div>

                {/* Start / Wait */}
                <div className="w-full">
                    {isHost ? (
                        <Button
                            onClick={handleStart}
                            disabled={!canStart || starting}
                            size="lg"
                            className="w-full gap-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-base shadow-lg shadow-violet-500/25 disabled:from-muted disabled:to-muted disabled:text-muted-foreground transition-all"
                        >
                            <Play className="size-5" />
                            {starting ? 'Đang bắt đầu...' : canStart ? 'Bắt đầu trò chơi' : `Chờ thêm ${GAME_CONFIG.MIN_PLAYERS - activePlayers.length} người nữa`}
                        </Button>
                    ) : (
                        <div className="rounded-xl border border-border bg-card/40 p-4 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                            <Spinner className="size-4" />
                            Đang chờ chủ phòng bắt đầu...
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
