import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/ui/spinner';
import { api } from '../lib/api';
import { Button } from '../components/ui/button';

export default function LoginPage() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && user) navigate('/', { replace: true });
    }, [user, loading, navigate]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <Spinner className="size-10" />
        </div>
    );

    return (
        <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
            {/* Ambient background glows */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 flex flex-col items-center gap-8 p-8 max-w-sm w-full">
                {/* Logo */}
                <div className="flex flex-col items-center gap-3">
                    <div className="size-20 rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-violet-500/30">
                        <span className="text-4xl">🎭</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Word Guesser</h1>
                    <p className="text-muted-foreground text-center text-sm leading-relaxed">
                        Trò chơi đoán từ multiplayer.<br />
                        Ai là Mũ Đen? Ai là Mũ Trắng?
                    </p>
                </div>

                {/* Login card */}
                <div className="w-full rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-6 shadow-xl flex flex-col gap-4">
                    <h2 className="text-center text-sm text-muted-foreground font-medium">Đăng nhập để bắt đầu</h2>
                    <Button
                        asChild
                        size="lg"
                        className="w-full gap-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-violet-500/25 transition-all duration-300"
                    >
                        <a href={api.auth.googleUrl()}>
                            <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Đăng nhập với Google
                        </a>
                    </Button>
                </div>

                {/* Role legend */}
                <div className="w-full grid grid-cols-3 gap-2 text-center">
                    {[
                        { emoji: '👤', label: 'Dân', color: 'text-blue-400', desc: 'Biết từ A' },
                        { emoji: '🖤', label: 'Mũ Đen', color: 'text-red-400', desc: 'Biết từ B' },
                        { emoji: '🤍', label: 'Mũ Trắng', color: 'text-slate-300', desc: 'Không biết gì' },
                    ].map(r => (
                        <div key={r.label} className="rounded-xl border border-border bg-card/40 p-3 flex flex-col gap-1">
                            <span className="text-2xl">{r.emoji}</span>
                            <span className={`text-xs font-semibold ${r.color}`}>{r.label}</span>
                            <span className="text-[10px] text-muted-foreground">{r.desc}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
