import { useEffect, useState } from 'react';
import type { PlayerRole } from '../../types';
import { ROLE_LABELS } from '../../lib/gameConfig';

interface RoleRevealProps {
    role: PlayerRole;
    word: string | null;
    onClose: () => void;
}

export default function RoleReveal({ role, word, onClose }: RoleRevealProps) {
    const [visible, setVisible] = useState(false);
    const info = ROLE_LABELS[role];

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 50);
        return () => clearTimeout(t);
    }, []);

    function close() {
        setVisible(false);
        setTimeout(onClose, 300);
    }

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${visible ? 'bg-black/70 backdrop-blur-sm' : 'bg-black/0'
            }`}>
            <div className={`relative w-full max-w-sm rounded-3xl border border-border bg-card p-8 flex flex-col items-center gap-5 shadow-2xl transition-all duration-300 ${visible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
                }`}>
                {/* Glow */}
                <div className={`absolute inset-0 rounded-3xl blur-2xl opacity-20 -z-10 ${role === 'CIVILIAN' ? 'bg-blue-500' :
                    role === 'BLACK_HAT' ? 'bg-red-500' : 'bg-slate-400'
                    }`} />

                <span className="text-6xl">{info.emoji}</span>

                <div className="text-center flex flex-col gap-1">
                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest">Vai của bạn</p>
                    <h2 className={`text-3xl font-bold ${info.color}`}>{info.label}</h2>
                </div>

                <div className="w-full rounded-2xl border border-border bg-background/60 p-5 text-center">
                    {word ? (
                        <>
                            <p className="text-xs text-muted-foreground font-medium mb-2">Từ bí mật của bạn</p>
                            <p className="text-2xl font-bold tracking-wide text-foreground">{word}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                                {role === 'CIVILIAN' ? 'Gợi ý liên quan nhưng đừng nói thẳng!' : 'Hãy che giấu danh tính của bạn!'}
                            </p>
                        </>
                    ) : (
                        <>
                            <p className="text-xs text-muted-foreground font-medium mb-2">Bạn không có từ</p>
                            <p className="text-sm text-foreground leading-relaxed">
                                Hãy quan sát thật kỹ và đoán từ của Dân dựa vào gợi ý!
                            </p>
                        </>
                    )}
                </div>

                <button
                    onClick={close}
                    className="mt-2 w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold py-3 transition-all"
                >
                    Đã hiểu, bắt đầu thôi! 🚀
                </button>
            </div>
        </div>
    );
}
