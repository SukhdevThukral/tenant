"use client";

import { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import {
    GameState,
    BUILDING,
    createInitialState,
    bfsPath,
    distanceTo,
    currentPhase,
    Phase,
} from '@/lib/gameState'

const tick_ms: Record<Phase, number> = {
    boot: 99999,
    normal: 7000,
    awareness: 4500,
    hunt: 2800,
    ending: 0,
};

const FG: Record<string, string> = {
    normal: "#4dff91",
    awareness: "#ffb347",
    hunt: "#ff4444",
    ending: "#ff4444",
    win: "#7ecfed"
}

const esc = (code: string) => `\x1b[${code}m`;
const red = esc("31");
const yellow = esc("33");
const dim = esc("2");
const reset = esc("0");


const boot : {
    text: string; delay: number 
} [] = [
    {text : "BLACKWOOD PROPERTY MANAGEMENT LTD.", delay:0},
    {text : "Building Management System v2.2.1 [i386]", delay:60},
    {text : "", delay:120},
    {text : "Loading subsystems.......", delay:200},
    {text : " sensor array          11 zones        [OK]", delay:100},
    {text : " camera feeds          11 / 11         [OK]", delay:80},
    {text : " electromagnetic locks                 [OK]", delay:80},
    {text : " motion grid                           [OK]", delay:80},
    {text : " emergency protocol    ARMED           [OK]", delay:120},
    {text : "", delay:160},
    {text : "Shift log started    03:47:01", delay:0},
    {text : "Operator: MAINT-7      Station: Basement", delay:60},
    {text : "", delay:200},
    {text : "_______________________________________________", delay:0},
    {text : "", delay:80},
    {text : " [03:47:04]    Passive sweep complete. Clear.", delay:100},
    {text : " [03:47:11]    Roof sensor: single read.", delay:900},
    {text : "               Source unknown. Logging.", delay:200},
    {text : "               Flagged wildlife. Auto-reset.", delay:600},
    {text : "", delay:400},
    {text : "_______________________________________________", delay:0},
    {text : "", delay:300},
    {text : `   Type HELP for command list.`, delay:0},
    {text : "", delay:200},
];


const ambient: Record<Phase, string[]> = {
    boot: [],
    normal: [
        "   [passive] All zones clear.",
        "   [passive] Motion grid nominal.",
        "   [passive] Camera sweep: no anomalies.",
        "   [passive] Stairwell 5F - brief read. Reset.",
        "   [passive] Lock integrity: all nominal.",
    ],
    awareness: [
        "   [04:02] Upper floor sensors logging intermittent reads.",
        "   [04:06] Hallway 4F camera - single from corruption.",
        "   [04:09] Motion on stairwell 3F. Duration: 0.4",
        "   [04:12] Camera feed stable. Motion log still open.",
        "   [04:17] Something moved on floor 4. Pattern abnormal.",
    ],
    hunt: [
        "   !! Active motion - multiple zones",
        "   !! Verify door status now",
        "   !! Camera feeds degrading",
        "   !! Proximity threshold exceeded",
    ], ending: [],
};


export default function TerminalComponent() {
    const containerRef = useRef<HTMLDivElement>(null);
    const termRef = useRef<Terminal | null>(null);

    useEffect(() => {
        const term = new Terminal({
            cursorBlink: true,
            fontSize: 14,
            fontFamily: "Courier New, monospace",
            theme: {
                background: "#000000",
                foreground: "#ff3333",
                cursor: "#ff3333",
            },
            cols: 80,
            rows: 24,
        });

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        term.open(containerRef.current!);
        fitAddon.fit();
        termRef.current = term;

        term.writeln("BLACKWOOD BUILDING MANAGEMENT SYSTEM v2.2.1");
        term.writeln("_____________________________________________")
        term.writeln("");
        term.writeln("All systems nominal.");
        term.writeln("Graveyard shift log started - 00:00:01");
        term.writeln("");
        term.write("> ");

        term.onKey(({key, domEvent}) => {
            const printable = !domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey;
            if (domEvent.key === "Enter") {
                term.writeln("");
                term.write("> ");
            } else if (domEvent.key === "Backspace") {
                term.write("\b \b");
            } else if (printable) {
                term.write(key);
            }
        });

        const handleResize = () => fitAddon.fit();
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            term.dispose();
        };
    }, []);

    return (
        <div ref={containerRef} style={{width: "100vw", height: "100vh", padding: "1rem"}}/>
    );
}