import { GameState, BUILDING, bfsPath, distanceTo, currentPhase } from "./gameState";

export type CmdResult = {
    lines: string[];
    stateChanges?:Partial<GameState>;
};

export function runCommand(input: string, state: GameState): CmdResult {
    const raw = input.trim().toLowerCase();
    const [cmd, ...args] = raw.split(/\s+/);

    switch(cmd) {
        case "status":
        case "stat":
            return cmdStatus(state);
        case "scan":
        case "motion":
            return cmdScan(state);
        case "cameras":
        case "cam":
            if (!args[0] || args[0] === "list") return cmdCameraList(state);
            return cmdCameraView(args.join("_"), state);
        case "map":
            return cmdMap(state);
        case "doors":
            return cmdDoors(state);
        case "lock":
            if (!args[0]) return {lines : ["Usage: lock <zone_id>"]};
            return cmdLock(args.join("_"), state);
        case "unlock":
            if (!args[0]) return {lines: ["Usage: unlock <zone_id>"]};
            return cmdUnlock(args.join("_"), state);
        case "help":
        case "?":
            return cmdHelp();
        case "ping":
            return { lines: ["pong"]};
        case "":
            return{lines: []};
        default:
            return {lines: [`Unknown command: '${input}'. Type HELP for list`]};
    }
}


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

function cmdDoors(state: GameState): CmdResult {
    const lines = ["    DOOR STATUS", " ________________________________"];
    for (const zone of Object.values(BUILDING)) {
        const locked = state.lockedDoors.has(zone.id);
        lines.push(`    ${locked ? "[LOCKED]" : "[open]  "} ${zone.id.padEnd(20)} ${zone.name}`);
    }
    lines.push("", "    lock <zone_id> / unlock <zone_id>");
    return { lines };
}

function cmdLock(zoneId: string, state: GameState): CmdResult {
    const zone = BUILDING[zoneId];
    if (!zone)  return {lines: [`   Zone not found: ${zoneId}. Try DOORS for list.`]};
    if (state.lockedDoors.has(zoneId)) return { lines: [`   ${zone.name} - already locked.`]};
    if (zoneId === state.playerZone) return { lines: [` Cant lock your own position.`]};

    const newLocked = new Set(state.lockedDoors);
    newLocked.add(zoneId);

    const blocking = bfsPath(state.entityZone, state.playerZone).includes(zoneId);

    return {
        lines : [
            `   LOCK ${zone.name}  - engaged`,
            ...(blocking ? [`   This is on its current path`] : []),
        ],
        stateChanges: {lockedDoors: newLocked},
    };
}

function cmdUnlock(zoneId: string, state: GameState): CmdResult {
    const zone = BUILDING[zoneId];
    if (!zone) return {lines: [`    Zone not found: ${zoneId}.`]};
    if (!state.lockedDoors.has(zoneId)) return {lines: [`    ${zone.name} - not found`]};
    
    const newLocked = new Set(state.lockedDoors);
    newLocked.delete(zoneId);

    return {
        lines: [`   UNLOCK  ${zone.name}  - released`],
        stateChanges: {lockedDoors: newLocked},
    };
}

function cmdHelp(): CmdResult {
    return {
        lines: [
            "   COMMANDS",
            "   __________________________________________________________",
            "   status                          System Overview",
            "   scan                            Motion sweep, all zones",
            "   cameras                         Camera feed list",
            "   cam <zone_id>                   View a specific feed",
            "   map                             Building layout",
            "   doors                           Door lock status",
            "   lock <zone_id>                  Engage lock",
            "   unlock <zone_id>                Release lock",
            "",
            "   Zone IDs:",
            "   roof stairwell_5  hallway_4  office_4a",
            "   stairell_3  hallway_2  storage_2a  stairwell_1",
            "   lobby   basement_stair  basement",
            "",
        ],
    };
}