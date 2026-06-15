import { useEffect, useState } from 'react';
import './Timer.css'

interface TimerProps {
    timeEnd: number | null;
}

function Timer({ timeEnd }: TimerProps) {
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    useEffect(() => {
        if (!timeEnd) return;

        const update = () => {
            const left = Math.max(0, Math.ceil((timeEnd - Date.now()) / 1000));
            setTimeLeft(left);
        };

        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [timeEnd]);

    if (timeLeft === null) return null;

    return (
        <div className={`timer ${timeLeft <= 10 ? 'timer-urgent' : ''}`}>
            ⏱ {timeLeft}s
        </div>
    );
}

export default Timer;