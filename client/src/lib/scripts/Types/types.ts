import type { Color } from "sveltestrap/src/shared";
import type { RoomC } from "../Blueprint/Room.svelte";
import type { TableC } from "../Blueprint/Table.svelte";
import type { Line, Point } from "../Blueprint/surfaces";

export type TableState = 'Green' | 'Available' | 'Occupied';

export type edge = [number, number];

export type httpMethods = 'post' | 'get' | 'put' | 'delete' | 'patch';

export type FloorDetails = {
    floor: Number;
    structure: {
        edges: Object;
        rooms: Object;
        nodes: Object
    };
};

export class UserInfo {
    userid: string
    name: string;
    forename: string;
    lastname: string;
}

export type User = {
    firstname?: string;
    lastname?: string;
    profile?: Blob;
};

export type node = {
    point: Point,
    adj: node[]
}

export type intersectionObject = {
    line: Line,
    point: Point
}

export type relevantIntersectionObject = {
    start?: intersectionObject,
    end?: intersectionObject,
};

export type DateObject = {
    dateString: string;
    dayOfWeek: string;
    date: string;
};

export type ReserveTableDetails = {
    tableId: number;
    reservedForDate?: string;
    floor: number;
    permanent?: {
        weekdays: number[];
    };
};

export type FloorInfos = {
    nodes: node[];
    edges: edge[];
    rooms: RoomC[];
    mappedTable: [TableC, UserInfo];
};

export type ToastObject = {
    isOpen: boolean,
    body: string,
    color: Color
}

export enum BlueprintMode {
    Draw = 'draw',
    Delete = 'delete',
}