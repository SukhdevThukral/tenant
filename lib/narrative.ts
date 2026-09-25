import { Phase } from "./gameState";
import { BUILDING } from "./gameState";

export const boot : {
    text: string; delay: number 
} [] = [
    {text : "BLACKWOOD PROPERTY MANAGEMENT LTD.", delay:0},
    {text : "Building Management System v2.2.1 [i386]", delay:60},
    {text : "", delay:120},
    {text : "Loading subsystems...", delay:200},
    {text : "   sensor array                11 zones        [OK]", delay:100},
    {text : "   camera feeds                11 / 11         [OK]", delay:80},
    {text : "   electromagnetic locks                       [OK]", delay:80},
    {text : "   motion grid                                 [OK]", delay:80},
    {text : "   emergency protocol          ARMED           [OK]", delay:120},
    {text : "", delay:160},
    {text : "   Shift log started      03:47:01", delay:0},
    {text : "   Operator: MAINT-7      Station: Basement", delay:60},
    {text : "", delay:200},
    {text : "   ————————————————————————————————————————————————————————————————", delay:0},
    {text : "", delay:80},
    {text : "   [03:47:04]    Passive sweep complete. Clear.", delay:100},
    {text : "   [03:47:11]    Roof sensor: single read.", delay:900},
    {text : "                 Source unknown. Logging.", delay:200},
    {text : "                Flagged wildlife. Auto-reset.", delay:600},
    {text : "", delay:800},
    {text : "   [03:47:29]    Roof sensor: reading again.", delay:0},
    {text : "                 Weight estimate: 190kg+.", delay:300},
    {text : "                 No wildlife on record that heavy..", delay:400},
    {text : "", delay:600},
    {text : "   ————————————————————————————————————————————————————————————————", delay:0},
    {text : "", delay:300},
    {text : `   Type HELP for command list.`, delay:0},
    {text : "", delay:200},
];


export const ambient: Record<Phase, string[]> = {
    boot: [],
    normal: [
        "   [passive] All zones clear.",
        "   [passive] Motion grid nominal.",
        "   [passive] No anomalies detected.",
        "   [passive] Stairwell 5F - brief read. Reset.",
        "   [passive] Something tripped the roof sensor again.",
    ],
    awareness: [
        "   [04:02] Upper floor sensors logging intermittent reads.",
        "   [04:06] Hallway 4F camera - one frame from corruption.",
        "   [04:09] Stairwell 3F motion. Duration too long for a draft",
        "   [04:12] It hasnt gone back up.",
        "   [04:17] ITS MOVING TOWARD YOU",
        "   [04:18] ITS MOVING TOWARD YOU",
    ],
    hunt: [
        "   !! Active motion - multiple zones",
        "   !! Verify door status now",
        "   !! Camera feeds degrading",
        "   !! Proximity threshold exceeded",
        "   !! The motion pattern has changed - it is moving faster",
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

    if (cameraJustDied && dist <= 3) {
        return [
            `   !! CAM-${toZone.toUpperCase()} SIGNAL TERMINATED`,
            `       ${loc} `,
            `       Last frame showed movement before cut`
        ];
    }

    if (!cameraAlive) {
        return [`   [sensor] Motion in ${loc} - CAMERA OFFLINE`];
    }

    if (dist <= 2) {
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

export const breachLines : { text: string; delay: number}[] = [
    { text: "", delay:0},
    { text: "    [sensor] BASEMENT - MOTION DETECTED", delay:0},
    { text: "", delay:600},
    { text: "    CAM BASEMENT - offline", delay:800},
    { text: "", delay:400},
    { text: "    !! BREACH", delay:600},
    { text: "", delay:1200},
];

export const lose_lines = [
    "",
    "   MOTION  BASEMENT - confirmed",
    "   CAM-BASEMENT - offline",
    "",
    "   ———————————————————————————————————————————————",
    "",
    "   Shift log terminated   04:17",
    "   Cause unknown.",
    "",
    "   Morning crew found the door open.",
    "   Terminal was still running.",
    "   Cursor still blinking.",
    "",
    "   ———————————————————————————————————————————————",
    "",
];

export const win_lines = [
    "",
    "   ———————————————————————————————————————————————",
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
    "   ———————————————————————————————————————————————",
    "",
];