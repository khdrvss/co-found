import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface AnimatedCounterProps {
    value: number;
    duration?: number;
    className?: string;
}

export function AnimatedCounter({ value, duration = 1000, className }: AnimatedCounterProps) {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        let startTime: number | null = null;
        const startValue = displayValue;
        const finalValue = value;

        if (startValue === finalValue) return;

        const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);

            // Easing function: easeOutExpo
            const easeOutExpo = (x: number): number => {
                return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
            };

            const currentProgress = easeOutExpo(progress);
            const currentValue = Math.floor(startValue + (finalValue - startValue) * currentProgress);

            setDisplayValue(currentValue);

            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                setDisplayValue(finalValue);
            }
        };

        window.requestAnimationFrame(step);
    }, [value, duration]);

    return <span className={cn("tabular-nums", className)}>{displayValue}</span>;
}
