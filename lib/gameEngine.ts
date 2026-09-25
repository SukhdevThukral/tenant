import { GameState, BUILDING, bfsPath, distanceTo, currentPhase, Phase } from "./gameState";
import { entityMoveLOG, ambient, win_lines, lose_lines } from "./narrative";

export const tick_ms: Record<Phase, number> = {
    boot: 99999,
    normal: 7000,
    awareness: 4500,
    hunt: 2800,
    ending: 0,
};

export const FG: Record<string, string> = {
    normal: "#4dff91",
    awareness: "#ffb347",
    hunt: "#ff4444",
    ending: "#ff4444",
    win: "#7ecfed"
}

export type tickResult = {
    newState: GameState;
    linesToPrint: string[];
    outcome?: "win" | "lose";
};

export function doTick(
    state: GameState,
    ambientIdx: Record<Phase, number>
) : tickResult {
    const path = bfsPath(state.entityZone, state.playerZone);

    if (path.length === 0) {
        return {
            newState: { ...state, gameOver: true},
            linesToPrint: ["", "    !! BREACH - BASEMENT !!", "", ...lose_lines],
            outcome: "lose",
        };
    }

    const nextZone = path[0];

    if(state.lockedDoors.has(nextZone)) {
        const alts = BUILDING[state.entityZone].adjacentTo.filter(
            (z) => !state.lockedDoors.has(z)
        );

        if(alts.length === 0) {
            return {
                newState: {...state, currentTick: state.currentTick + 1},
                linesToPrint: ["", "    Entity contained. All exits sealed.", "", ...win_lines],
                outcome: "win",
            };
        }

        const nonBackTrack = alts.filter(z=> z !== state.prevEntityZone);
        const alt = nonBackTrack.length > 0 ? nonBackTrack[0] : alts[0];

        const newState = {...state, entityZone: alt, prevEntityZone: state.entityZone, currentTick: state.currentTick+1};
        const dist = distanceTo(alt, state.playerZone);
        const lines = entityMoveLOG(alt, dist, !state.deadCameras.has(alt), false);
        return { newState, linesToPrint: lines};
    }

    const newDead = new Set(state.deadCameras);
    let camKilled = false;
    if (!newDead.has(nextZone) && Math.random() < 0.55) {
        newDead.add(nextZone);
        camKilled = true;
    }

    const newState: GameState = {
        ...state, entityZone: nextZone,
        deadCameras: newDead,
        currentTick: state.currentTick + 1,
        prevEntityZone: state.entityZone,
    };

    const blockedPath = bfsPath(newState.entityZone, newState.playerZone);
    const canReach = blockedPath.some((z) => !newState.lockedDoors.has(z));
    if (blockedPath.length > 0 && !canReach) {
        return {
            newState: {...newState, gameWon: true},
            linesToPrint: ["","    All paths blocked.", "", ...win_lines],
            outcome: "win",
        };
    }

    const dist = distanceTo(nextZone, state.playerZone);
    const camAlive = !newDead.has(nextZone);
    const lines = entityMoveLOG(nextZone, dist, camAlive, camKilled);

    const phase = currentPhase(newState);
    const ambLines = ambient[phase];
    if (newState.currentTick % 3 === 0 && ambLines.length) {
        const idx = ambientIdx[phase];
        lines.push(ambLines[idx % ambLines.length]);
        ambientIdx[phase] = idx + 1;
    }

    return {newState, linesToPrint: lines}
}