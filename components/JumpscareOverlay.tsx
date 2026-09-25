"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
    onEnd: () => void;
}

export default function JumpscareOverlay({onEnd}: Props) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [glitchClass, setGlitchClass] = useState("");
    const [phase, setPhase] = useState<"entering" | "playing" | "done">("entering");
    const glitchTimerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

    useEffect(() => {
        const scheduleGlitches = () => {
            const timings = [
                { delay: 0, type: "glitch-hard", dur: 600},
                {delay: 900, type: "glitch-js-mid", dur: 400},
                {delay: 1800, type: "glitch-hard", dur: 700},
                {delay: 2600, type: "glitch-js-mid", dur: 300},
                {delay: 3400, type: "glitch-hard", dur: 500},
                {delay: 4200, type: "glitch-js-mid", dur:400},
                {delay: 5000, type: "glitch-hard", dur: 800},
                {delay: 5900, type: "glitch-js-mid", dur: 300},
                {delay: 6700, type: "glitch-hard", dur: 600},
                {delay: 7500,  type: "glitch-js-mid", dur: 350},
                {delay: 8300, type: "glitch-hard", dur: 700},
            ];

            timings.forEach(({delay, type, dur}) => {
                const t1 = setTimeout(() => setGlitchClass(type), delay);
                const t2 = setTimeout(() => setGlitchClass(""), delay + dur);
                glitchTimerRef.current.push(t1, t2);
            });
        };

        scheduleGlitches();

        const t = setTimeout(() => {
            setPhase("playing");
            videoRef.current?.play().catch(() => {});
        }, 80);
        glitchTimerRef.current.push(t);

        return () => {
            glitchTimerRef.current.forEach(clearTimeout);
        };
    }, []);

    const handleVideoEnd = () => {
        setPhase("done");
        glitchTimerRef.current.forEach(clearTimeout);
        setGlitchClass("glitch-hard");
        setTimeout(() => {
            setGlitchClass("");
            onEnd();
        }, 500);
    };

    return (
        <div style={{position: "fixed", inset: 0, zIndex: 8000, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", animation: phase === "entering" ? "jumpIn 0.08s ease-out forwards" : "none",}}>
            <NoiseCanvas/>

            <div style={{position: "relative", zIndex: 10, width: "min(520px, 90vw)", background: "#0a0a0a", border: "1px solid #ff4444", boxShadow: "0 0 0 1px #ff000033, 0 12px 60px #ff000066", animation: phase === "entering" ? "popIn 0.12s cubic-bezier(0.35,1.55,0.65,1) forwards":"none",
                transform: glitchClass === "glitch-hard" ? `translate(${(Math.random() > 0.5 ? 1 : -1) * (Math.random() * 8 + 2)}px, ${(Math.random() - 0.5)*4}px) skewX(${(Math.random() - 0.5) * 2}deg)` : glitchClass === "glitch-js-mid" ? `translate(${(Math.random() - 0.5) * 6}px, 0)` : "none",
            }}>

                <div style={{background: "#1a0000", borderBottom: "1px solid #ff4444", padding: "6px 10px", display: "flex", alignItems: "center", gap: 8, fontFamily: "Courier New, monospace",}}>
                    <div style={{width: 10, height: 10, borderRadius: "50%", background: "#ff3333"}}/>
                    <div style={{width: 10, height: 10, borderRadius: "50%", background: "#333"}}/>
                    <div style={{width: 10, height: 10, borderRadius: "50%", background: "#333"}}/>
                    <span style={{color: "#ff4444", fontSize: 11, marginLeft: 6, letterSpacing: "0.1em"}}>CAM-BASEMENT / ARCHIVE FEED</span>
                </div>

                <div style={{position: "relative", background: "#000", aspectRatio:"16/9", overflow: "hidden"}}>
                    <video ref={videoRef} src="/download.mp4" style={{
                        width: "100%", height: "100%", objectFit: "cover", display: "block", filter: glitchClass === "glitch-hard" ? "brightness(1.6) contrast(1.4) hue-rotate(-20deg)" : glitchClass === "glitch-js-mid" ? "brightness(1.2) contrast(1)" : "none", transition: "none",
                    }} muted={false} playsInline onEnded={handleVideoEnd}/>

                    <div style={{position: "absolute", inset: 0, background: "repeating-linear-gradient(to bottom, transparent 0px, transparent 2px, rgba(0,0,0,0.35) 2px, rgba(0,0,0,0.36) 3px)", zIndex:2, pointerEvents: "none"}}/>
                    <div style={{position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.8) 100%)", zIndex:3, pointerEvents: "none"}}/>
                    
                    {glitchClass && (
                        <div style={{position: "absolute", inset:0, zIndex: 4, pointerEvents: "none", mixBlendMode: "screen",
                            background: glitchClass === "glitch-hard" ? "linear-gradient(90deg, #ff000022  0%, transparent 50%, #00ffff22 100%)" : "transparent",
                        }}/>
                    )}
                </div>

                <div style={{padding: "5px 10px", borderTop: "1px solid #330000", display: "flex", gap: 16, fontFamily: "Courier New, monospace",}}>
                    <span style={{color: "#ff4444", fontSize: 11, animation: "blink 1s infinite"}}> ● REC</span>
                    <span style={{color: "#555", fontSize: 11}}>04:17:33</span>
                    <span style={{color: "#ff3333", fontSize: 11, marginLeft: "auto"}}> !! SIGNAL DEGRADED</span> 
                </div>
            </div>

            <style>{`
                @keyframes jumpIn {
                    from {opacity: 0;}
                    to {opacity: 1;}
                }
                @keyframes popIn {
                    from {transform: scale(0.55); opacity: 0;}
                    to {transform: scale(1); opacity: 1;}
                }
                @keyframes blink {
                    0%, 100% {opacity: 1} 50% {opacity:0.15}
                }
            `}
            </style>
        </div>
    );
}

function NoiseCanvas() {
    const ref = useRef<HTMLCanvasElement>(null);
    const animRef = useRef<number>(0);


    useEffect(() => {
        const canvas = ref.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d")!;

        const draw = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            const d = ctx.createImageData(canvas.width, canvas.height);
            for (let i = 0; i < d.data.length; i+= 4) {
                const v = Math.random() *255;
                d.data[i] = v; d.data[i+1] = v; d.data[i+2] = v;
                d.data[i+3] = Math.random() * 55 + 5;
            }
            ctx.putImageData(d, 0, 0);
            animRef.current = requestAnimationFrame(draw);
        };
        draw();
        return () => cancelAnimationFrame(animRef.current);
    }, []);

    return <canvas ref={ref} style={{
        position: "absolute", inset: 0, zIndex: 5, pointerEvents: "none", opacity: 0.6, mixBlendMode: "overlay",
    }}/>;
}