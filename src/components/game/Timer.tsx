import { useEffect, useRef, useState } from 'react';
import { Progress } from '../ui/progress';

interface TimerProps {
    seconds: number;
    onExpire?: () => void;
    running?: boolean;
}

export default function Timer({ seconds, onExpire, running = true }: TimerProps) {
    const [remaining, setRemaining] = useState(seconds);
    const called = useRef(false);

    useEffect(() => {
        setRemaining(seconds);
        called.current = false;
    }, [seconds]);

    useEffect(() => {
        if (!running) return;
        if (remaining <= 0) {
            if (!called.current) { called.current = true; onExpire?.(); }
            return;
        }
        const t = setTimeout(() => setRemaining(r => r - 1), 1000);
        return () => clearTimeout(t);
    }, [remaining, running, onExpire]);

    const pct = (remaining / seconds) * 100;
    const urgent = remaining <= 10;

    return (
        <div className="flex items-center gap-3">
            <span className={`text-2xl font-mono font-bold tabular-nums min-w-[2.5rem] text-right transition-colors ${urgent ? 'text-red-400 animate-pulse' : 'text-foreground'
                }`}>
                {remaining}s
            </span>
            <Progress
                value={pct}
                className={`h-2 flex-1 transition-all ${urgent ? '[&>div]:bg-red-400' : '[&>div]:bg-violet-500'}`}
            />
        </div>
    );
}
