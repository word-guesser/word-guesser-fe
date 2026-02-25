import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { LogOut, Plus, DoorOpen } from 'lucide-react';

export default function LobbyPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [joinCode, setJoinCode] = useState('');
    const [creating, setCreating] = useState(false);
    const [joining, setJoining] = useState(false);

    async function handleCreate() {
        setCreating(true);
        try {
            const { room } = await api.rooms.create();
            navigate(`/room/${room.id}`);
        } catch (e) {
            toast.error((e as Error).message);
        } finally {
            setCreating(false);
        }
    }

    async function handleJoin() {
        if (!joinCode.trim()) { toast.error('Nhập mã phòng trước.'); return; }
        setJoining(true);
        try {
            const { room } = await api.rooms.join(joinCode.trim().toUpperCase());
            navigate(`/room/${room.id}`);
        } catch (e) {
            toast.error((e as Error).message);
        } finally {
            setJoining(false);
        }
    }

    return (
        <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
            {/* Ambient glows */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-violet-600/15 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl" />
            </div>

            {/* Header */}
            <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-border/60 bg-background/80 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">🎭</span>
                    <span className="font-bold text-lg tracking-tight">Word Guesser</span>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2 rounded-full hover:bg-accent transition-colors p-1 pr-3">
                            <Avatar className="size-8">
                                <AvatarImage src={user?.avatar ?? undefined} />
                                <AvatarFallback>{user?.displayName?.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium hidden sm:block">{user?.displayName}</span>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={logout} className="text-destructive gap-2 cursor-pointer">
                            <LogOut className="size-4" /> Đăng xuất
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </header>

            {/* Main */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 gap-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold tracking-tight mb-2">Xin chào, <span className="text-violet-400">{user?.displayName?.split(' ').pop()}</span> 👋</h1>
                    <p className="text-muted-foreground">Tạo phòng mới hoặc tham gia bằng mã phòng</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl">
                    {/* Create Room */}
                    <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-6 flex flex-col gap-4 shadow-xl hover:border-violet-500/50 transition-colors">
                        <div className="size-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                            <Plus className="size-6 text-white" />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg">Tạo phòng</h2>
                            <p className="text-sm text-muted-foreground">Bạn sẽ là chủ phòng. Chờ 4–8 người chơi.</p>
                        </div>
                        <Button
                            onClick={handleCreate}
                            disabled={creating}
                            className="mt-auto bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold"
                        >
                            {creating ? 'Đang tạo...' : 'Tạo phòng mới'}
                        </Button>
                    </div>

                    {/* Join Room */}
                    <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-6 flex flex-col gap-4 shadow-xl hover:border-indigo-500/50 transition-colors">
                        <div className="size-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
                            <DoorOpen className="size-6 text-white" />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg">Tham gia phòng</h2>
                            <p className="text-sm text-muted-foreground">Nhập mã 6 ký tự từ bạn bè.</p>
                        </div>
                        <div className="flex gap-2 mt-auto">
                            <Input
                                placeholder="VD: ABC123"
                                value={joinCode}
                                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                                onKeyDown={e => e.key === 'Enter' && handleJoin()}
                                maxLength={6}
                                className="font-mono text-lg tracking-widest text-center uppercase"
                            />
                            <Button
                                onClick={handleJoin}
                                disabled={joining}
                                variant="secondary"
                                className="shrink-0"
                            >
                                {joining ? '...' : 'Vào'}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* How to play */}
                <div className="w-full max-w-xl">
                    <p className="text-xs text-center text-muted-foreground mb-3 font-medium uppercase tracking-widest">Cách chơi</p>
                    <div className="grid grid-cols-3 gap-3 text-center">
                        {[
                            { n: '1', title: 'Nhận từ bí mật', icon: '🔐', desc: 'Mỗi người nhận 1 từ (hoặc không)' },
                            { n: '2', title: 'Đưa ra gợi ý', icon: '💬', desc: 'Mô tả từ của bạn mà không lộ vai' },
                            { n: '3', title: 'Bỏ phiếu loại', icon: '🗳️', desc: 'Tìm ra kẻ khác biệt và loại họ' },
                        ].map(s => (
                            <div key={s.n} className="rounded-xl border border-border/60 bg-card/30 p-4 flex flex-col gap-2">
                                <span className="text-2xl">{s.icon}</span>
                                <span className="text-xs font-semibold text-foreground">{s.title}</span>
                                <span className="text-[10px] text-muted-foreground leading-relaxed">{s.desc}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
