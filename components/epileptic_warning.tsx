"use client";

import { useEffect, useState, useRef } from "react";

interface Props {
    onAccept: () => void;
}

export default function EpilepticWarning({onAccept}: Props) {
    const [visible, setVisible] = useState(true);
    const [glitching, setGlitching] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animRef = useRef<number>(0);

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
            setTimeout(() => setGlitching(false), 150 + Math.random() * 200);
        }, 800 + Math.random() * 1200);

        return() => {
            cancelAnimationFrame(animRef.current);
            clearInterval(glitchInterval);
        }
    }, []);

    const handleAccept = () => {
        setVisible(false);
        setTimeout(onAccept, 400);
    };

    if (!visible) return null;

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
            fontFamily: "Courier New, monospace",
        }}>
            <canvas ref={canvasRef} style={{ position: "absolute", inset:0, pointerEvents: "none", zIndex: 1, mixBlendMode: "overlay",}}/>
            <div style={{position: "absolute", inset: 0, background: "repeating-linear-gradient(to bottom, transparent 0px, transparent 3px, rgba(0,0,0,0.4) 3px, rgba(0,0,0,0.4) 4px)", pointerEvents: "none", zIndex:2,}}/>
            <div style={
                {
                    position: "absolute", inset: 0, background: "radial-background(ellipse at center, transparent 40%, rgba(0,0,0,0.9) 100%)",
                    pointerEvents: "none", zIndex: 3,
                }
            }/>
            <div style={{position: "relative", zIndex: 10, maxWidth: 560, padding: "2.5rem",border:"1px solid #ff2222",
                boxShadow: "0 0 30px #ff000044, inset 0 0 30px #ff000011", transform: glitching ? `translate(${(Math.random() - 0.5) * 12}px, ${(Math.random() - 0.5) * 6}px) skewX(${(Math.random() - 0.5) * 3}deg)` : "none",
                transition: glitching ? "none" : " transform 0.05s", 
            }}>
                {glitching && (
                    <>
                        <div style={{position: "absolute", inset: "2.5rem", color: "#ff000088", fontSize: "0.85rem", lineHeight: 1.8, transform: "translate(-4px, 2px)", pointerEvents: "none", userSelect: "none", letterSpacing: "0.1em",}}>
                            ❗❗ PHOTOSENSITIVITY WARNING ❗❗
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}