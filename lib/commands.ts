import { stat } from "fs";
import { GameState, BUILDING, bfsPath, distanceTo, currentPhase } from "./gameState";

export type CmdResult = {
    lines: string[];
    stateChanges?:Partial<GameState>;
};


function cmdStatus(state: GameState): CmdResult {
    const phase = currentPhase(state);
    const dist = distanceTo(state.entityZone, state.playerZone);
    const cams = Object.keys(BUILDING).length - state.deadCameras.size;

    const total = Object.keys(BUILDING).length;

    const threat = 
        phase === "normal"     ? "low"  :
        phase === "awareness"  ? "elevated":
        phase === "hunt"       ? "!! HIGHH" : "!! CRITICAL";

    return {
        lines: [
            "   _____________________________",
            `   Threat level     ${threat}`,
            `   Your location    ${BUILDING[state.playerZone]?.name ?? state.playerZone}`,
            `   Cameras online   ${cams} / ${total}`,
            `   Locked zones     ${state.lockedDoors.size}`,
            `   Tick             ${state.currentTick}`,
            ...(dist <= 2 
                ? ["", `    !! Entity ${dist} zone${dist === 1 ? "" : "s"} from your position !! `]
                : []
            ),
            "   _____________________________"
        ],
    };
}

function cmdScan(state: GameState): CmdResult {
    const lines = ["    MOTION SWEEP", "    _____________________________"];
    for (const zone of Object.values(BUILDING)) {
        const hasEntity = state.entityZone === zone.id;
        const camDead = state.deadCameras.has(zone.id);
        const marker = hasEntity ? "!! ACTIVE" : camDead ? "-- OFFLINE" : " clear";
        lines.push(`    [${marker}] ${zone.name}`);
    }
    lines.push("");
    return { lines };
}

function cmdCameraList(state: GameState): CmdResult {
    const lines = ["    CAMERA INDEX", "    _____________________________"];
    for (const zone of Object.values(BUILDING)) {
        const dead = state.deadCameras.has(zone.id);
        const entity = state.entityZone === zone.id && !dead;
        const status = dead ? "OFFLINE" : "live    ";
        const flag = entity ? "    ◄ motion" : dead ? " [static]" : "";
        lines.push(`    CAM-${zone.id.padEnd(18)} [${status}]${flag}`);
    }
    lines.push("", "    cam <zone_id>   to view feed");
    return {lines};
}