"use client";

import { useEffect, useState } from "react";

interface Props {
    type: "win" | "lose";
    onRestart: () => void;
}

export default function EndScreen({type, onRestart}: Props) {
    const [opacity, setOpacity] = useState(0);
    const [ showRestart, setShowRestart] = useState(false);
    const [blink, setBlink] = useState(true);

    const isWin = type === "win";

    const lines = isWin ? [
        "",
        "    ———————————————————————————————————————————————",
        "",
        "   6:00 —— Day shift arrived.",
        "",
        "   Terminl had been running for hours.",
        "   All basement locks: engaged.",
        "   No breach recorded.",
        "",
        "   Roof access door: found open.",
        "   Building otherwise secure.",
        "",
        "   Incident logged as mechanical fault.",
        "   Case Closed.",
        "",
        "    ———————————————————————————————————————————————",
        "",
    ] : [
        "",
        "    ———————————————————————————————————————————————",
        "",
        "   SHIFT LOG TERMINATED    04:17",
        "   OPERATOR: MAINT-7       NO RESPONSE",
        "",
        "   Morning crew found the door open.",
        "   Terminal was still running.",
        "   Cursor still blinking.",
        "",
        "   Cause of incident: unknown.",
        "   Case: Open.",
        "",
        "    ———————————————————————————————————————————————",
        "",
    ];

    useEffect(() => {
        setTimeout(() => setOpacity(1), 100);
        setTimeout(() => setShowRestart(true), 2000);
    }, []);

    useEffect(() => {
        if (!showRestart) return;
        const t = setInterval(() => setBlink(b => !b), 600);
        return () => clearInterval(t);
    }, [showRestart]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "R" || e.key === "r") onRestart();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler)
    }, [onRestart]);

    const fg = isWin? "#7ecfed" : "#ff4444";
    const border = isWin ? "##7ecfed" : "#ff444444";
    const glow = 
}