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
        "——————————————————————————————————————————————————",
        "",
        "       6:00 —— Day shift arrived.",
        "",
        "       Terminl had been running for hours.",
        "       All basement locks: engaged.",
        "       No breach recorded.",
        "",
        "       Roof access door: found open.",
        "       Building otherwise secure.",
        "",
        "       Incident logged as mechanical fault.",
        "       Case Closed.",
        "",
        "——————————————————————————————————————————————————",
        "",
    ] : [
        "",
        "——————————————————————————————————————————————————",
        "",
        "       SHIFT LOG TERMINATED    04:17",
        "       OPERATOR: MAINT-7       NO RESPONSE",
        "",
        "       Morning crew found the door open.",
        "       Terminal was still running.",
        "       Cursor still blinking.",
        "",
        "       Cause of incident: unknown.",
        "       Case: Open.",
        "",
        "——————————————————————————————————————————————————",
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
    const glow = isWin ? "#7ecfed22" : "#ff000022";
    
    return (
        <div style={{position:"fixed", inset:0, zIndex: 7000, background: "#000", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            fontFamily: "Courier New, monospace", opacity, transition: "opacity 2s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: `inset 0 0 120px ${glow}`,
        }}>
            <div style={{position: "absolute", inset: 0, background: "repeating-linear-gradient(to-bottom, transparent 0px, transparent 2px, rgba(0,0,0,0.2) 2px, rgba(0,0,0,0.2) 4px)", pointerEvents: "none", zIndex: 1}}/>
            <div style={{position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, transparent 50%,  rgba(0,0,0,0.9) 100%)", pointerEvents: "none", zIndex: 2}}/>

            <div style={{position: "relative", zIndex: 10, maxWidth: 560, width: "100%"}}>
                {lines.map((line, i) => (
                    <div key={i} style={{
                        color: fg, fontSize: "0.9rem", lineHeight: 2, letterSpacing: "0.05em", whiteSpace: "pre",
                    }}>
                        {line}
                    </div>
                ))}

                {showRestart && (
                    <div style={{
                        marginTop: "1.5rem",
                        color: fg, fontSize: "0.85rem", letterSpacing: "0.15em", opacity: blink ? 1 : 0,
                        transition: "opacity 0.1s",
                        cursor: "pointer", paddingLeft: "1.5rem"
                    }} onClick={onRestart}>
                        PRESS R TO RESTART
                    </div>
                )}
            </div>
        </div>
    );
}