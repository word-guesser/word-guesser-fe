import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface GuessingPhaseProps {
    isWhiteHat: boolean;
    onSubmitGuess: (guess: string) => void;
}

export default function GuessingPhase({ isWhiteHat, onSubmitGuess }: GuessingPhaseProps) {
    const [guess, setGuess] = useState('');

    function handleSubmit() {
        if (!guess.trim()) return;
        onSubmitGuess(guess.trim());
    }

    if (!isWhiteHat) {
        return (
            <div className="flex flex-col items-center gap-4 py-8">
                <span className="text-5xl animate-bounce">🤍</span>
                <p className="font-semibold text-lg text-center">Mũ Trắng đang đoán từ...</p>
                <p className="text-sm text-muted-foreground text-center max-w-xs">
                    Hãy chờ xem Mũ Trắng có đoán đúng từ của Dân không!
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-5">
            <div className="rounded-xl border border-slate-500/30 bg-slate-500/10 px-5 py-4 text-center">
                <p className="text-slate-300 font-bold text-lg">Bạn là Mũ Trắng!</p>
                <p className="text-sm text-muted-foreground mt-1">
                    Đây là cơ hội duy nhất của bạn.<br />
                    Đoán từ mà vai <span className="text-blue-400 font-semibold">Dân</span> đang giữ.
                </p>
            </div>

            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 flex flex-col gap-4">
                <p className="text-sm text-amber-300 font-medium text-center">
                    💡 Hãy nhớ lại những gợi ý của Dân để đoán đúng!
                </p>
                <Input
                    autoFocus
                    placeholder="Nhập từ bạn đoán..."
                    value={guess}
                    onChange={e => setGuess(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    className="text-lg font-semibold text-center tracking-wide bg-card/60"
                />
                <Button
                    onClick={handleSubmit}
                    disabled={!guess.trim()}
                    size="lg"
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold"
                >
                    Xác nhận đoán 🎯
                </Button>
            </div>
        </div>
    );
}
