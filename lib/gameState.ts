export type Phase = "boot" | "normal" | "awareness" | "hunt" | "ending";

export interface SensorZone {
    id: string;
    name: string;
    floor: number;
    locked: boolean;
    motionDetected: boolean;
    cameraOnline : boolean;
    adjacentTo: string[];
}

export interface GameState {
    phase: Phase;
    currentTick: number;
    entityZone: string;
    playerZone: string;
    lockedDoors: Set<string>;
    deadCameras: Set<string>;
    inputBuffer: string;
    gameOver: boolean;
}

export const BUILDING: Record<string, SensorZone> = {
    roof: {id: "roof", name: "Rooftop", floor: 5, locked: false, motionDetected: false, cameraOnline: true, adjacentTo: ["stairwell_5"] },
    stairwell_5: {id: "stairwell_5", name: "Stairwell 5F", floor: 5, locked: false, motionDetected: false, cameraOnline: true, adjacentTo: ["roof", "hallway_4"] },
    hallway_4: {id: "hallway_4", name: "Hallway 4F", floor: 4, locked: false, motionDetected: false, cameraOnline: true, adjacentTo: ["stairwell_5", "room_4a", "stairwell_3"] },
    room_4a: {id: "room_4a", name: "Room 4A", floor: 4, locked: false, motionDetected: false, cameraOnline: true, adjacentTo: ["hallway_4"] },
    stairwell_3: {id: "stairwell_3", name: "Stairwell 3F", floor: 3, locked: false, motionDetected: false, cameraOnline: true, adjacentTo: ["hallway_4", "hallway_2"] },
    hallway_2: {id: "hallway_2", name: "Hallway 2F", floor: 2, locked: false, motionDetected: false, cameraOnline: true, adjacentTo: ["stairwell_3", "room_2a", "stairwell_1"] },
    room_2a: {id: "room_2a", name: "Room 2A", floor: 2, locked: false, motionDetected: false, cameraOnline: true, adjacentTo: ["hallway_2"] },
    stairwell_1: {id: "stairwell_1", name: "Stairwell 1F", floor: 1, locked: false, motionDetected: false, cameraOnline: true, adjacentTo: ["hallway_2", "lobby"] },
    lobby: {id: "lobby", name: "Lobby", floor: 1, locked: false, motionDetected: false, cameraOnline: true, adjacentTo: ["stairwell_1", "basement"] },
    basement: {id: "basement", name: "basement", floor: 0, locked: false, motionDetected: false, cameraOnline: true, adjacentTo: ["lobby"] },
}

export const PLAYER_ZONE = "basement";
export const entity_start = "roof";

export function createInitialState(): GameState {
    return {
        phase : "boot",
        currentTick: 0,
        entityZone: entity_start,
        playerZone: PLAYER_ZONE,
        lockedDoors: new Set(),
        deadCameras: new Set(),
        inputBuffer: "",
        gameOver: false,
    };
}

// BFS shrotest path from A to B thru the building graph

export function bfsPath(from: string, to: string): string[] {
    if (from === to) return [];
    const queue: string[][] = [[from]];
    const visited = new Set([from]);
    while (queue.length) {
        const path = queue.shift()!;
        const node = path[path.length - 1];
        for (const next of BUILDING[node]?.adjacentTo ?? []) {
            if (next === to) return [...path.slice(1), next];
            if (!visited.has(next)){
                visited.add(next);
                queue.push([...path, next]);
            }
        }
    }
    return[];
}

export function distanceTo(from:string, to:string): number {
    return bfsPath(from, to).length;
}

export function currentPhase(state: GameState): Phase {
    const d = distanceTo(state.entityZone, state.playerZone);
    if (d === 0) return "ending";
    if (d <= 2) return "hunt";
    if (d <= 5) return "awareness";
    return "normal";
}