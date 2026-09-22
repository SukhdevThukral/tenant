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
        </div>
    )
}