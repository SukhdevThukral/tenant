"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import {
    GameState,
    createInitialState,
    currentPhase,
    Phase,
    distanceTo,
} from '@/lib/gameState';
import JumpscareOverlay from "./JumpscareOverlay";
import {tick_ms, FG, doTick} from "@/lib/gameEngine";

import { runCommand } from "@/lib/commands";
import { boot,breachLines, lose_lines } from "@/lib/narrative";

const esc = (code: string) => `\x1b[${code}m`;
const red = esc("31");
const yellow = esc("33");
const reset = esc("0");
const bold = esc("1");
const audio = new Audio("/ambient_music.mp3")
audio.loop = true;
audio.volume = 0.25;

function triggerGlitch(el: HTMLElement | null, type: "soft" | "mid" | "hard") {
    if (!el) return;

    el.classList.remove("glitch-soft", "glitch-mid", "glitch-hard");

    void el.offsetWidth;

    el.classList.add(`glitch-${type}`);

    const dur = type === "hard" ? 700 : type === "mid" ? 500 : 4000;
    setTimeout(() => el.classList.remove(`glitch-${type}`), dur);
}

function setHuntMode(el: HTMLElement | null, on: boolean) {
    if (!el) return;
    if (on) el.classList.add("hunt");
    else el.classList.remove("hunt");
}

export default function TerminalComponent() {
    const containerRef = useRef<HTMLDivElement>(null);
    const crtRef = useRef<HTMLDivElement>(null);
    const termRef = useRef<Terminal | null>(null);
    const fitRef = useRef<FitAddon | null>(null);
    const stateRef = useRef<GameState>(createInitialState());
    const inputRef = useRef<string>("");
    const tickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const ambientIdxRef = useRef<Record<Phase, number>>({
        boot: 0, normal: 0, awareness: 0, hunt: 0, ending: 0,
    });
    const bootDoneRef = useRef(false);
    const jumpscareShownRef = useRef(false);

    const [showJumpscare, setShowJumpscare] = useState(false);

    const wl = (text = "") => termRef.current?.writeln(text);
    const w = (text = "") => termRef.current?.write(text);

    const applyTheme = useCallback((phase: Phase | "win") => {
        const fg = FG[phase] ?? FG.normal;
        if (termRef.current) {
            termRef.current.options.theme = {
                ...termRef.current.options.theme,
                foreground: fg,
                cursor: fg,
            };
        }

        setHuntMode(crtRef.current, phase === "hunt" || phase === "ending");
    }, []);

    const showPrompt = useCallback(() => {
        const phase = currentPhase(stateRef.current);
        if (phase === "hunt" || phase === "ending") {
            w(`${red}${bold}!!${reset} `);
            audio.volume = 0.7;
        } else if (phase === "awareness") {
            w(`${yellow}?>${reset} `);
            audio.volume = 0.45
        } else {
            w(`> `);
            audio.volume = 0.25
        }
    }, []);

    const interruptPrint = useCallback((lines: string[]) => {
        const buf = inputRef.current;
        w("\r\x1b[K");
        lines.forEach((l) => wl(l));
        showPrompt();
        w(buf);
    }, [showPrompt]);

    const scheduleTick = useCallback(() => {
        if (tickTimerRef.current) clearTimeout(tickTimerRef.current);
        const phase = currentPhase(stateRef.current);
        tickTimerRef.current = setTimeout(runTick, tick_ms[phase] ?? 7000);
    }, []);

    const runTick = useCallback(() => {
        const state = stateRef.current;
        if (!bootDoneRef.current || state.gameOver || state.gameWon) return;
        
        const {newState, linesToPrint, outcome} = doTick(state, ambientIdxRef.current);
        stateRef.current = newState;

        const phase = currentPhase(newState);

        if(linesToPrint.some(l => l.includes("SIGNAL TERMINATED") || l.includes("OFFLINE"))) {
            triggerGlitch(crtRef.current, "hard");
        } else if (phase === "hunt") {
            triggerGlitch(crtRef.current, "mid");
        } else if (phase === "awareness") {
            triggerGlitch(crtRef.current, "soft");
        }

        applyTheme(phase);

        const dist = distanceTo(newState.entityZone, newState.playerZone);
        if (dist === 1 && !jumpscareShownRef.current && !newState.gameOver && !newState.gameWon) {
            jumpscareShownRef.current = true;
            const fakeLines = [
                { text: "", delay:0},
                { text: "   [03:58] !! MOTION - BASEMENT", delay: 0},
                { text: "   [03:58] Pulling archived camera log...", delay: 600},
                { text: "   [03:59] LOADING FEED ........", delay: 800},
                { text: "", delay:400},
            ];
            w("\r\x1b[K");
            let ms = 0;
            for (const {text, delay} of fakeLines) {
                ms += delay;
                setTimeout(() => wl(text), ms);
            }
            setTimeout(() => setShowJumpscare(true), ms + 200);
        }

        if(outcome === "win") {
            if(linesToPrint.length) interruptPrint(linesToPrint);
            applyTheme("win");
            return;
        }

        if (outcome === "lose") {
            w("\r\x1b[K");
            let ms = 0;
            for (const {text, delay} of breachLines){
                ms += delay;
                setTimeout(() => wl(text), ms);
            }
            ms += 800;
            for (const line of lose_lines) {
                ms += 120;
                setTimeout(() => wl(line), ms);
            }
            return;
        }

        if (linesToPrint.length) interruptPrint(linesToPrint);
        scheduleTick();
    }, [interruptPrint, applyTheme, scheduleTick]);

    const handleEnter = useCallback(() => {
        const input = inputRef.current;
        inputRef.current = "";
        wl("");

        const state = stateRef.current;
        if (state.gameOver || state.gameWon) {
            wl("  Session Terminated.");
            showPrompt();
            return;
        }

        const {lines, stateChanges} = runCommand(input, state);
        if(stateChanges) stateRef.current = { ...stateRef.current, ...stateChanges};
        lines.forEach((l) => wl(l));
        showPrompt();
    }, [showPrompt]);

    const runBoot = useCallback(async () => {
        const term = termRef.current;
        if (!term) return;

        let ms = 0;
        for (const {text, delay} of boot) {
            ms += delay;
            await new Promise<void>((r) => setTimeout(r, ms));
            term.writeln(text);
        }

        bootDoneRef.current = true;
        stateRef.current = {...stateRef.current, phase: "normal"};
        showPrompt();
        scheduleTick();
        audio.play()
    }, [showPrompt, scheduleTick]);

    const handleJumpscareEnd = useCallback(() => {
        setShowJumpscare(false);
        setTimeout(() => {
            interruptPrint(["", "   !! FEED LOST - SIGNAL CORRUPTED", ""]);
            scheduleTick();
        }, 300);
    }, [interruptPrint, scheduleTick]);

    useEffect(() => {
        const term = new Terminal({
            cursorBlink: true,
            fontSize: 14,
            fontFamily: "Courier New, monospace",
            theme: {
                background: "#000000",
                foreground: FG.normal,
                cursor: FG.normal,
                selectionBackground: "#4dff9133",
            },
            cols: 80,
            rows: 30,
            scrollback: 600,
            convertEol: true,
        });

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        if (!containerRef.current) return;
        term.open(containerRef.current!);
        requestAnimationFrame(() => fitAddon.fit());
        termRef.current = term;

        term.onKey(({key, domEvent}) => {
            if (!bootDoneRef.current) return;
            const state = stateRef.current;
            if (state.gameOver || state.gameWon) return;

            const printable = !domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey;
            if (domEvent.key === "Enter") {
                handleEnter();
            } else if (domEvent.key === "Backspace") {
                if (inputRef.current.length > 0) {
                    inputRef.current = inputRef.current.slice(0, -1);
                    term.write("\b \b");
                }
            } else if (printable && key.length === 1) {
                inputRef.current += key;
                term.write(key);
            }
        });

        const handleResize = () => requestAnimationFrame(() => fitAddon.fit());
        window.addEventListener("resize", handleResize);
        requestAnimationFrame(() => runBoot());

        return () => {
            window.removeEventListener("resize", handleResize);
            if (tickTimerRef.current) clearTimeout(tickTimerRef.current);
            term.dispose();
        };
    }, [handleEnter, runBoot]);

    return (
        <>
            <div ref={crtRef} className="crt">
                <div ref={containerRef} style={{width: "100%", height: "100%"}}/>
            </div>
            {showJumpscare && <JumpscareOverlay onEnd={handleJumpscareEnd}/>}
        </>
    );
}