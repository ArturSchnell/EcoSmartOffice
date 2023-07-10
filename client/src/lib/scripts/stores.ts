import { writable } from 'svelte/store';
import type { Line } from './Blueprint/surfaces';
import type { RoomC } from './Blueprint/Room.svelte';
import type { TableC } from './Blueprint/Table.svelte';
import { BlueprintMode, type ToastObject } from './Types/types';

export const selectedFloor = writable<number>(1);
export const bluePrintMode = writable<BlueprintMode>(BlueprintMode.Draw);
export const zoomScale = writable<number>(1);
export const svgEl = writable<SVGSVGElement>();
export const svgGroup = writable<SVGGElement>();
export const svgPolygons = writable<SVGGElement>();
export const nodeStart = writable<number>(0);
export const isDragging = writable<boolean>(false);
export const tokenMSAL = writable<string>(null);
export const isLoggedIn = writable<boolean>(false)
export const showAdminPanel = writable<boolean>(false);
export const isAdmin = writable<boolean>(true);
export const isBlueprintModeSelected = writable<boolean>(false);
export const areRoomsLoaded = writable<boolean>(false);
export const floorsAmount = writable<number>(0);
export const floorsLoaded = writable<boolean>(false);
export const lines = writable<Line[]>([]);
export const existingRooms = writable<RoomC[]>([]);
export const dateString = writable<string>();
export const tables = writable<TableC[]>([]);
export const selectedRoomIndex = writable<number>(0);
export const selectedTable = writable<TableC>();
export const toastObject = writable<ToastObject>({ isOpen: false, body: '', color: 'success', });
export const origin = writable({ x: 0, y: 0, })