"use client";

import { useEffect, useState, useRef } from "react";
import { getAudio } from "@/lib/audio";

interface Props {
    onAccept: () => void;
}

export default function EpilepticWarning({onAccept}: Props) {
    const [glitching, setGlitching] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [opacity, setOpacity] = useState(0);
    const animRef = useRef<number>(0);
    const [flash, setFlash] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setOpacity(1), 100);
        return () => clearTimeout(t);
    }, [])

    useEffect(() => {
        const audio = getAudio();
        if (!audio) return;
        audio.volume = 0;
        audio.play().catch(() => {});

        const fadeIn = setInterval(() => {
            if (audio.volume < 0.24) {
                audio.volume = Math.min(0.26, audio.volume + 0.01);
            } else {
                clearInterval(fadeIn);
            }
        }, 100);

        return () =>  clearInterval(fadeIn);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d")!;

        const draw = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            const imageData = ctx.createImageData(canvas.width, canvas.height);
            const data = imageData.data;
            for (let i = 0; i< data.length; i+=4) {
                const v = Math.random() * 255;
                data[i] = v;
                data[i + 1]=v;
                data[i+2]=v;
                data[i+ 3] = Math.random()*60+10;
            }
            ctx.putImageData(imageData, 0, 0);
            animRef.current = requestAnimationFrame(draw);
        };
        draw();

        const glitchInterval = setInterval(() => {
            setGlitching(true);
            setTimeout(() => setGlitching(false), 80 + Math.random() * 100);
        }, 300 + Math.random() * 400);

        const flashInterval = setInterval(() => {
            setFlash(true);
            setTimeout(() => setFlash(false), 50 + Math.random() *80);
        }, 500 + Math.random() * 700);

        return() => {
            cancelAnimationFrame(animRef.current);
            clearInterval(glitchInterval);
            clearInterval(flashInterval);
        }
    }, []);

    useEffect(() => {
        const t = setTimeout(() => {
            setOpacity(0);
            setTimeout(onAccept, 2000);
        }, 5000);
        return () => clearTimeout(t);
    }, [onAccept]);

    return (
        <div style={{
            position: "fixed",
            inset: 0,
            background: "#000",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            fontFamily: "Courier New, monospace", opacity: opacity, transition: "opacity 2s cubic-bezier(0.4, 0, 0.2, 1)",
        }}>
            <canvas ref={canvasRef} style={{ position: "absolute", inset:0, pointerEvents: "none", zIndex: 1, mixBlendMode: "overlay",}}/>
            <div style={{position: "absolute", inset: 0, background: "repeating-linear-gradient(to bottom, transparent 0px, transparent 3px, rgba(0,0,0,0.4) 3px, rgba(0,0,0,0.4) 4px)", pointerEvents: "none", zIndex:2,}}/>
            <div style={
                {
                    position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.9) 100%)",
                    pointerEvents: "none", zIndex: 3,
                }
            }/>

            {flash && (
                <div style={{ position: "absolute", inset: 0, zIndex: 4, pointerEvents: "none", background: `rgba(255, ${Math.floor(Math.random()*30)}, ${Math.floor(Math.random()*30)}, ${0.1 + Math.random() * 0.25})`,}}/>
            )}

            <div style={{position: "relative", zIndex: 10, maxWidth: 560, padding: "2.5rem",border:"1px solid #ff2222",
                boxShadow: "0 0 30px #ff000044, inset 0 0 30px #ff000011", transform: glitching ? `translate(${(Math.random() - 0.5) * 12}px, ${(Math.random() - 0.5) * 6}px) skewX(${(Math.random() - 0.5) * 3}deg)` : "none",
                transition: glitching ? "none" : " transform 0.05s", 
            }}>
                {glitching && (
                    <>
                        <div style={{position: "absolute", inset: "2.5rem", color: "#ff000088", fontSize: "0.85rem", lineHeight: 1.8, transform: "translate(-4px, 2px)", pointerEvents: "none", userSelect: "none", letterSpacing: "0.1em",}}>
                            ❗❗ PHOTOSENSITIVITY WARNING ❗❗
                        </div>
                        <div style={{
                            position: "absolute", inset: "2.5rem", color: "#00ffff44", fontSize: "0.85rem", lineHeight: 2, transform: "translate(4px, -1px)", pointerEvents: "none", letterSpacing: "0.1em",
                        }}>❗❗ PHOTOSENSITIVITY WARNING ❗❗ </div>
                    </>
                )}

                <p style={{color: "#ff3333", fontSize: "0.75rem", letterSpacing: "0.2em", marginBottom:"1.2rem", textTransform: "uppercase", animation: "warnFlicker 4s infinite"}}>
                    ❗❗ PHOTOSENSITIVITY WARNING ❗❗
                </p>

                <h1 style={{color:  "#ff2222", fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1.5rem", letterSpacing: "0.05em", animation: "shakeTxt 0.2s infinite", textShadow: "4px 0 #ff000066"}}>
                    FLASHING LIGHTS &amp; STROBING EFFECTS
                </h1>

                <p style={{color: "#cc2222", fontSize: "0.8rem", lineHeight: 2,
                    marginBottom: "1rem", letterSpacing: "0.05em",
                }}>
                    WARNING: This experience contains rapidly flashing lights, and patterns that may potentially trigger seizures for with photosensitive epilepsy. Player/Viewer discretion is advised.
                </p>
            </div>

            <style>{`
                @keyframes warnFlicker {
                    0%, 100% {opacity: 1;}
                    50% {opacity: 0.3;}
                    82% {opacity: 0.5;}
                }
                @keyframes shakeTxt {
                    0% {transform: translate(0,0);}
                    25% {transform: translate(-1px, 0)}
                    50% { transform: translate(1px,0);}
                    100% {transform: translate(0,0);}
                }
            `
            }</style>
        </div>
    )
}