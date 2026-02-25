import { useEffect, useState } from 'react';
import type { Winner } from '../../types';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';

interface GameOverCardProps {
    winner: Winner;
    message: string;
    whiteHatGuess?: string;
    correctWord?: string;
}

const WINNER_CONFIG: Record<Winner, { emoji: string; gradient: string; glow: string }> = {
    WHITE_HAT: { emoji: '🤍', gradient: 'from-slate-400 to-slate-600', glow: 'bg-slate-400/20' },
    BLACK_HAT: { emoji: '🖤', gradient: 'from-red-700 to-red-900', glow: 'bg-red-600/20' },
    CIVILIAN: { emoji: '👥', gradient: 'from-blue-500 to-indigo-600', glow: 'bg-blue-500/20' },
};

export default function GameOverCard({ winner, message, whiteHatGuess, correctWord }: GameOverCardProps) {
    const [visible, setVisible] = useState(false);
    const navigate = useNavigate();
    const cfg = WINNER_CONFIG[winner];

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 50);
        return () => clearTimeout(t);
    }, []);

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-500 ${visible ? 'bg-black/80 backdrop-blur-sm' : 'bg-black/0'
            }`}>
            <div className={`relative w-full max-w-md rounded-3xl border border-white/10 bg-card p-8 flex flex-col items-center gap-5 shadow-2xl transition-all duration-500 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                }`}>
                {/* Glow bg */}
                <div className={`absolute inset-0 rounded-3xl blur-3xl opacity-30 -z-10 ${cfg.glow}`} />

                {/* Confetti emoji */}
                <div className="text-7xl animate-bounce">{cfg.emoji}</div>

                <div className="text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-2">Kết quả</p>
                    <h2 className={`text-3xl font-extrabold bg-gradient-to-r ${cfg.gradient} bg-clip-text text-transparent`}>
                        {message}
                    </h2>
                </div>

                {(whiteHatGuess || correctWord) && (
                    <div className="w-full grid grid-cols-2 gap-3 text-center">
                        {whiteHatGuess && (
                            <div className="rounded-xl border border-border bg-background/60 p-3">
                                <p className="text-xs text-muted-foreground mb-1">Mũ Trắng đoán</p>
                                <p className="font-bold text-lg">{whiteHatGuess}</p>
                            </div>
                        )}
                        {correctWord && (
                            <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-3">
                                <p className="text-xs text-blue-400 mb-1">Từ đúng (Dân)</p>
                                <p className="font-bold text-lg text-blue-300">{correctWord}</p>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex gap-3 w-full mt-2">
                    <Button
                        onClick={() => navigate('/')}
                        className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold"
                    >
                        🏠 Về Lobby
                    </Button>
                </div>
            </div>
        </div>
    );
}
