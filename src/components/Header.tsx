'use client';

import { useEffect, useState, useRef } from 'react';

export function Header() {
    const [text, setText] = useState("OPENCHAOS.DEV");
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const TARGET_TEXT = "OPENCHAOS.DEV";
    const CYCLES_PER_LETTER = 3;
    const SHUFFLE_TIME = 30;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const CHARS = "!@#$%^&*():{};|,.<>/?ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    const scramble = () => {
        let pos = 0;

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        intervalRef.current = setInterval(() => {
            const scrambled = TARGET_TEXT.split("").map((char, index) => {
                if (index < pos) {
                    return TARGET_TEXT[index];
                }
                return CHARS[Math.floor(Math.random() * CHARS.length)];
            }).join("");

            setText(scrambled);
            pos += 1 / CYCLES_PER_LETTER;

            if (pos > TARGET_TEXT.length) {
                if (intervalRef.current) clearInterval(intervalRef.current);
            }
        }, SHUFFLE_TIME);
    };

    useEffect(() => {
        scramble();
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    return (
        <h1
            className="text-4xl sm:text-5xl font-bold tracking-tight cursor-default font-mono"
            onMouseEnter={scramble}
        >
            {text}
        </h1>
    );
}
