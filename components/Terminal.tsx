"use client";

import { useEffect, useRef, useCallback } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import {
    GameState,
    BUILDING,
    createInitialState,
    bfsPath,
    currentPhase,
    Phase,
} from '@/lib/gameState';

import {tick_ms, FG, doTick} from "@/lib/gameEngine";
import { runCommand } from "@/lib/commands";
import { boot } from "@/lib/narrative";


const esc = (code: string) => `\x1b[${code}m`;
const red = esc("31");
const yellow = esc("33");
const reset = esc("0");



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