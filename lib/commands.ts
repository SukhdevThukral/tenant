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

function cmdCameraView(zoneId: string, state: GameState): CmdResult {
    const zone = BUILDING[zoneId];
    if (!zone) return {lines: [`    No camera for zone: ${zoneId}`]};

    if (state.deadCameras.has(zoneId)) {
        return {
            lines: [
                `   CAM-${zoneId.toUpperCase()} ─────────────────────────────`,
                "   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░",
                "   ░░░░░░  NO SIGNAL TO BE FOUND ░░░░░░",
                "   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░",
                "   ░░░ ERROR   ░░░░░░░░░░░░░░░░░░░░░░░░",
                "   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░",
                "",
            ],
        };
    }

    if (state.entityZone === zoneId) {
        return {
            lines: [
                `   CAM-${zoneId.toUpperCase()} / ${zone.name}  ─────────────────────────────`,
                "   __________________________________",
                "  |                                  |",
                "  |                                  |",
                "  |   something is in frame          |",
                "  |                                  |",
                "  |          it is not moving        |",
                "  |                                  |",
                "  |                                  |",
                "   ----------------------------------",
                "   !! MOTION CONFIRMED",
                "",
            ],
        };
    }

    return {
        lines: [
            `   CAM-${zoneId.toUpperCase()} / ${zone.name}  ─────────────────────────────`,
            "   __________________________________",
            "  |                                  |",
            "  |            [clear]               |",
            "  |                                  |",
            "   ----------------------------------",
            "",
        ],
    };
}

function cmdMap(state: GameState): CmdResult {
    const e = (id: string): string => {
        if (state.entityZone === id) return " E ";
        if (state.playerZone === id) return "[Y]";
        if (state.lockedDoors.has(id)) return "███";
        if (state.deadCameras.has(id)) return "░░░";
        return "    ";
    };

    return {
        lines: [
            "   E=entity Y=you ███=locked ░░░=dead cam",
            "   _______________________________________",
            `   F5 [${e("roof")}ROOF        ]-[${e("stairwelll_5")}STAIR-5F]`,
            `                               |`,
            `   F4          [${e("hallway_4")}HALL-4F]-[${e("office_4a")}OFFICE-4A]`,
            `                               |`,
            `   F3          [${e("stairwell_3")}STAIR-3F]`,
            `                               |`,
            `   F2  [${e("storage_2a")}STORAGE-2A]-[${e("hallway_2")}HALL-2F]`,
            `                               |`,
            `   F1          [${e("stairwell_1")}STAIR-1F]-[${e("lobby")}LOBBY   ]`,
            `                                            |`,
            `   B0                          [${e("basement_stair")}BSTAIR   ]`,
            `                                            |`,
            `   B1                          [${e("basement")}BASEMENT]  <-  you`,
            "",
        ],
    };
}