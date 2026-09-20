import { Phase } from "./gameState";
import { BUILDING } from "./gameState";

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

export function entityMoveLOG(
    toZone: string,
    dist: number,
    cameraAlive: boolean,
    cameraJustDied: boolean
) : string[] {
    const zone = BUILDING[toZone];
    const loc = zone?.name ?? toZone;

    if (cameraJustDied && dist <= 4) {
        return [
            `   !! CAM-${toZone.toUpperCase()} SIGNAL LOST`,
            `       ${loc} - feed terminated`,
        ];
    }

    if (!cameraAlive) {
        return [`   [sensor] Motion in ${loc} - camera offline`];
    }

    if (dist <= 1) {
        return [
            `   !! MOTION ${loc.toUpperCase()}`,
            `   This zone.`,
        ];
    }

    if (dist <= 3) {
        return [`   !! MOTION ${loc} (${dist} zone${dist===1 ? "" : "s"})`];
    }

    if (dist <= 6){
        return [`   [motion] ${loc} / Floor ${zone?.floor ?? "?"}`];
    }

    return [`   [passive] Read in ${loc}.`];
}

export const lose_lines = [
    "",
    "   MOTION  BASEMENT - confirmed",
    "   CAM-BASEMENT - offline",
    "",
    "   ___________________________________________",
    "",
    "   Shift log terminated   04:17",
    "   Cause unknown.",
    "",
    "   Morning crew found the door open.",
    "   Terminal was still running.",
    "   Cursor still blinking.",
    "",
    "   ___________________________________________",
    "",
];

export const win_lines = [
    "",
    "   ___________________________________________",
    "",
    "   06:00 - Day shift arrived.",
    "",
    "   Terminal had been running for hours.",
    "   All basement locks: engaged.",
    "   No breach recorded.",
    "",
    "   Roof access door: found open.",
    "   Building otherwise secure.",
    "",
    "   Incident logged as mechanical fault.",
    "   Case closed.",
    "",
    "   ___________________________________________",
    "",
];