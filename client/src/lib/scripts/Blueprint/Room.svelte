<script context="module" lang="ts">
    const oneSquareMetre: number = 2500; // 50px = 1m

    export class RoomC {
        static incRoomNumber: number = 1;
        roomId: number;
        roomNumber: number;
        isEditing: boolean;
        isEditingHeight: boolean;
        roomName: string;
        lines: Line[] = new Array();
        points: Point[] = new Array();
        createdAt: Date;
        roomNameTextelement: SVGTextElement;
        roomsInside: RoomC[] = new Array();
        isDirectChild: boolean = false;
        area: number;
        height: number;
        tables: TableC[];

        /**
         * Constructs a new instance of the RoomC class
         * @param roomNumbe the room number (default: RoomC.incRoomNumber)
         * @param roomName the room name (default: null)
         * @param roomId the room ID (default: createUniqueIdentifier())
         * @param lines array of lines in the room (default: [])
         * @param points array of points defining the room polygon (default: [])
         * @param createdAt the creation date of the room (default: new Date())
         * @param roomsInside array of rooms inside the current room (default: [])
         * @param isDirectChild flag indicating if the room is a direct child of another room (default: false)
         * @param area the area of the room (default: 0)
         * @param tables array of tables in the room (default: [])
         * @param roomNameTextelement the text element for the room name (default: null).
         */
        constructor(
            roomNumber = RoomC.incRoomNumber,
            roomName = null,
            roomId = createUniqueIdentifier(),
            lines = [],
            points = [],
            createdAt = new Date(),
            roomsInside = [],
            isDirectChild = false,
            area = 0,
            tables = [],
            roomNameTextelement = null
        ) {
            this.roomId = roomId;
            this.roomNumber = roomNumber;
            this.roomName = roomName;
            this.lines = lines;
            this.points = points;
            this.createdAt = createdAt;
            this.roomsInside = roomsInside;
            this.isDirectChild = isDirectChild;
            this.area = area;
            this.roomNameTextelement = roomNameTextelement;
            this.tables = tables;
        }

        /**
         * Resets the room number counter to 1
         * @returns {void}
         */
        static resetRoomNumber(): void {
            RoomC.incRoomNumber = 1;
        }

        /**
         * Adds a line to the current room
         * @param {Line} line the line to add
         * @returns {void}
         */
        addLine(line: Line): void {
            this.lines.push(line);
        }

        /**
         * Adds points to the current room
         * @param {Point[]} points array of points to add
         * @returns {void}
         */
        addPoints(points: Point[]): void {
            this.points = points;
        }

        /**
         * Creates the room details by setting the room name based on the room number
         * @returns {void}
         */
        createRoomDetails(): void {
            this.roomName = `Raum ${this.roomNumber}`;
        }

        /**
         * Sets the room number of the current room
         * @param {number} number the room number to set
         * @returns {void}
         */
        setRoomNumber(number: number): void {
            this.roomNumber = number;
            RoomC.incRoomNumber = Math.max(RoomC.incRoomNumber, number++);
        }

        /**
         * Sets the name of the current room
         * @param {string} name the name to set for the room
         * @returns {void}
         */
        setRoomName(name: string): void {
            this.roomName = name;
        }

        /**
         * Sets the creation date of the current room
         * @param {Date} date the date to set as the creation date
         * @returns {void}
         */
        setCreatedAt(date: Date): void {
            this.createdAt = new Date(date);
        }

        /**
         * Increments the room number counter and sets the new room number for the current room
         * @returns {void}
         */
        incRoomNr(): void {
            RoomC.incRoomNumber++;
            this.setRoomNumber(RoomC.incRoomNumber);
        }

        /**
         * Sets the tables of the current room
         * @param {TableC[]} tables array of tables to set for the room
         * @returns {void}
         */
        setTables(tables: TableC[]): void {
            this.tables = tables;
        }

        /**
         * Sets the square meter area of the current room
         * @param {number} area the square meter area to set for the room
         * @returns {void}
         */
        setSquareMetre(area: number): void {
            this.area = area;
        }

        /**
         * Sets the children rooms of the current room
         * @param {RoomC[]} roomsInside array of child rooms to set for the current room
         * @returns {void}
         */
        setChildren(roomsInside: RoomC[]): void {
            this.roomsInside = roomsInside;
        }

        /**
         * Sets the area of the current room
         * @param {number} area the area to set for the room
         * @returns {void}
         */
        setArea(area: number): void {
            this.area = area;
        }

        /**
         * Sets the room ID of the current room
         * @param {number} roomId the ID to set for the room
         * @returns {void}
         */
        setRoomId(roomId: number): void {
            this.roomId = roomId;
        }

        /**
         * Calculates the square meter area of the current room based on its polygon points
         * The calculated area is assigned to the 'area' property of the current room
         * @returns {void}
         */
        calculateSquareMetre(): void {
            let area = 0;
            const polygonLength = this.points.length;
            for (let i = 0; i < polygonLength; i++) {
                let currPoint = i % polygonLength;
                let nextPoint = (i + 1) % polygonLength;
                area +=
                    (this.points[currPoint].x - this.points[nextPoint].x) *
                    (this.points[currPoint].y + this.points[nextPoint].y);
            }
            this.area = area / 2 / oneSquareMetre;
        }
    }

    /**
     * Finds a room inside a given array of rooms that contains the to-be-inserted room
     * @param {RoomC[]} rooms array of rooms to search within
     * @param {RoomC} toBeInsertedRoom the room to be inserted
     * @param {RoomC} fRoom the found room inside the array
     * @returns {RoomC | undefined} the room inside the array that contains the to-be-inserted room, or undefined if not found
     */
    const findRoomInside = (rooms: RoomC[], toBeInsertedRoom: RoomC, fRoom: RoomC | undefined): RoomC | undefined => {
        for (let i = 0; i < rooms.length; i++) {
            const room = rooms[i];

            if (toBeInsertedRoom != rooms[i] && isPolygonInPolygon(toBeInsertedRoom.points, room.points)) {
                fRoom = room;
                fRoom = findRoomInside(toBeInsertedRoom.roomsInside, toBeInsertedRoom, fRoom);
            }
        }
        return fRoom;
    };

    /**
     * Calculates the square meter area of a room based on its polygon points
     * @param {RoomC} room the room for which to calculate the area
     * @returns {number} the calculated square meter area of the room
     */
    const calculateSquareMetre = (room: RoomC): number => {
        let area = 0;
        const polygonLength = room.points.length;
        for (let i = 0; i < polygonLength; i++) {
            const currPoint = i % polygonLength;
            const nextPoint = (i + 1) % polygonLength;
            area +=
                (room.points[currPoint].x - room.points[nextPoint].x) *
                (room.points[currPoint].y + room.points[nextPoint].y);
        }
        return area / 2 / oneSquareMetre;
    };

    /**
     * Maps lines to rooms based on the given polygons
     * @param {Array<Point[]>} polygons array of polygons represented by an array of points
     * @returns {void}
     */
    export const mapLinesToRooms = (polygons: Array<Point[]>): void => {
        let rooms: RoomC[] = new Array();
        polygons.forEach((polygon) => {
            const room = new RoomC();
            for (let i = 0; i < polygon.length; i++) {
                let currPoint = i % polygon.length;
                let nextPoint = (i + 1) % polygon.length;
                get(lines).forEach((line) => {
                    if (isLineInSelectedPolygon(line, polygon[currPoint], polygon[nextPoint])) {
                        room.addLine(line);
                    }
                });
            }
            room.addPoints(polygon);
            rooms.push(room);
        });
        replaceRooms(rooms);
    };

    /**
     * Replaces existing rooms with new rooms, preserving relevant properties and establishing parent-child relationships
     * @param {RoomC[]} rooms array of new rooms
     * @returns {void}
     */
    const replaceRooms = (rooms: RoomC[]): void => {
        const tempRooms: RoomC[] = new Array();
        rooms.forEach((room) => {
            const foundRoom = get(existingRooms).find((exRoom) => checkIfObjectsExist(exRoom, room));
            room.createRoomDetails();
            room.setArea(calculateSquareMetre(room));
            if (foundRoom) {
                room.setRoomName(foundRoom.roomName);
                room.setRoomNumber(foundRoom.roomNumber);
                room.setCreatedAt(foundRoom.createdAt);
                room.setTables(foundRoom.tables);
                room.setRoomId(foundRoom.roomId);
            } else {
                room.incRoomNr();
            }
            tempRooms.push(room);
            addRoom(room, tempRooms);
        });

        tempRooms.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        existingRooms.set([...tempRooms]);
    };

    /**
     * Adds a new room to the existing rooms and establishes parent-child relationships if applicable
     * @param {RoomC} newRoom the new room to add
     * @param {RoomC[]} existingRooms array of existing rooms
     * @returns {void}
     */
    const addRoom = (newRoom: RoomC, existingRooms: RoomC[]): void => {
        // Add the new room to existingRooms
        // Check if the new room has direct children or is a direct child of another room
        for (const room of existingRooms) {
            if (room !== newRoom) {
                if (isDirectChild(newRoom, room, existingRooms)) {
                    // newRoom is a direct child of room
                    if (!room.roomsInside.includes(newRoom)) {
                        room.setArea(room.area - calculateSquareMetre(newRoom));
                        room.roomsInside.push(newRoom);
                    }
                } else if (isDirectChild(room, newRoom, existingRooms)) {
                    // room is a direct child of newRoom
                    if (!newRoom.roomsInside.includes(room)) {
                        newRoom.setArea(newRoom.area - calculateSquareMetre(room));
                        newRoom.roomsInside.push(room);
                    }
                }
            }
        }
    };

    /**
     * Checks if roomA is a direct child of roomB without any other rooms between them.
     * @param {RoomC} roomA first room to check
     * @param {RoomC} roomB second room to check
     * @param {RoomC[]} existingRooms array of existing rooms
     * @returns {boolean} true if roomA is a direct child of roomB, false otherwise
     */
    function isDirectChild(roomA: RoomC, roomB: RoomC, existingRooms: RoomC[]): boolean {
        // Check if roomA is a direct child of roomB
        if (isPolygonInPolygon(roomA.points, roomB.points)) {
            // Check if there are any other rooms between room1 and room2
            for (const room of existingRooms) {
                if (room !== roomA && room !== roomB) {
                    if (
                        isPolygonInPolygon(roomA.points, room.points) &&
                        isPolygonInPolygon(room.points, roomB.points)
                    ) {
                        // there is another room between them
                        return false;
                    }
                }
            }
            // roomA is a direct child of roomB
            return true;
        }
        // roomA is not inside roomB
        return false;
    }

    /**
     * Checks if a line is part of the selected polygon
     * @param {Line} line the line to check
     * @param {Point} currPoint the current point of the polygon
     * @param {Point} nextPoint the next point of the polygon
     * @returns {boolean} true if the line is part of the selected polygon, otherwise false
     */
    const isLineInSelectedPolygon = (line: Line, currPoint: Point, nextPoint: Point): boolean => {
        return (
            (JSON.stringify(line.start.point) == JSON.stringify(currPoint) &&
                JSON.stringify(line.end.point) == JSON.stringify(nextPoint)) ||
            (JSON.stringify(line.end.point) == JSON.stringify(currPoint) &&
                JSON.stringify(line.start.point) == JSON.stringify(nextPoint))
        );
    };

    /**
     * Sets the selected room index
     * @param {number} index the index of the selected room
     * @returns {void}
     */
    export function setSelectedRoomIndex(index: number): void {
        selectedRoomIndex.set(index);
    }

    /**
     * Checks if all key points of the first room exist in the second room
     * @param {RoomC} exRoom existing room object
     * @param {RoomC} room room object
     * @returns {boolean} true if all vertices match, otherwise false
     */
    export function checkIfObjectsExist(exRoom: RoomC, room: RoomC): boolean {
        if (room.points.length < exRoom.points.length) {
            return false;
        }

        const areAllKeyPointsPresent = exRoom.points.every((point1) =>
            room.points.some((point2) => point1.x === point2.x && point1.y === point2.y)
        );
        if (areAllKeyPointsPresent) {
            return true;
        }

        return false;
    }

    /**
     * Checks if a table can be placed inside a room without collision.
     * @param {TableC} table the table to check.
     * @returns {void}
     */
    export const checkAndHandleTableInRooms = (table: TableC): void => {
        let room: RoomC;
        room = getRoomOfTable(table);

        removeTableFromRooms(table);

        if (room && !hasTableCollision(table, room)) {
            setTableInRoom(table, room);

            setTableColor(table, '#000');
            return;
        }

        setTableColor(table, 'red');
    };

    /**
     * Sets the color of a table
     * @param {TableC} table table object
     * @param {string} color color value
     * @returns {void}
     */
    const setTableColor = (table: TableC, color: string) => {
        table.rect.rectSVG.setAttribute('style', `stroke: ${color}`);
    };

    /**
     * Checks if a table has collision with other tables in a room
     * @param {TableC} table table object to check
     * @param {RoomC} room room object containing the tables
     * @returns {boolean} true if there is a collision, false otherwise
     */
    const hasTableCollision = (table: TableC, room: RoomC): boolean => {
        const rotatedTable1Points = getRotatedRectPoints(table.rect);

        for (const table2 of room.tables) {
            if (table === table2) {
                continue;
            }

            const rotatedTable2Points = getRotatedRectPoints(table2.rect);

            if (doPolygonsIntersect(rotatedTable1Points, rotatedTable2Points)) {
                return true;
            }
        }

        return false;
    };

    /**
     * Sets a table in a room if it doesn't already exist in the room
     * @param {TableC} table Table object to set
     * @param {RoomC} room Room object to set the table in
     * @return {void}
     */
    const setTableInRoom = (table: TableC, room: RoomC): void => {
        if (!room.tables.some((t) => t.tableId === table.tableId)) {
            room.tables = [...room.tables, table];
        }
    };

    /**
     * Removes a table from all existing rooms
     * @param table the table to remove
     * @returns {void}
     */
    const removeTableFromRooms = (table: TableC): void => {
        get(existingRooms).forEach((room) => {
            const index = room.tables.findIndex((t) => t.tableId === table.tableId);
            if (index !== -1) {
                room.tables.splice(index, 1);
            }
        });
    };

    /**
     * Retrieves the room that contains a given table
     * @param {TableC} table the table to find the room for
     * @returns {RoomC | undefined} the room that contains the table, or undefined if not found
     */
    export function getRoomOfTable(table: TableC): RoomC | undefined {
        let area: number = Infinity;
        let hasCollisionWithInnerWalls: boolean = false;
        let foundRoom: RoomC;

        const rotatedRectPoints = getRotatedRectPoints(table.rect);
        get(existingRooms).some((room: RoomC) => {
            const isInRoom = isPolygonInPolygon(rotatedRectPoints, room.points);
            room.roomsInside.some((roomInside: RoomC) => {
                const roomsInsidePointsLength = roomInside.points.length;
                for (let i = 0; i < roomsInsidePointsLength; i++) {
                    let currPoint = i % roomsInsidePointsLength;
                    let nextPoint = (i + 1) % roomsInsidePointsLength;
                    if (
                        isLineRectangleCollision(
                            rotatedRectPoints,
                            roomInside.points[currPoint],
                            roomInside.points[nextPoint]
                        )
                    ) {
                        hasCollisionWithInnerWalls = true;
                        foundRoom = undefined;
                        return true;
                    }
                }
            });

            if (isInRoom && !hasCollisionWithInnerWalls && room.area < area) {
                area = room.area;
                foundRoom = room;
            }
        });

        return foundRoom;
    }
</script>

<script lang="ts">
    import { afterUpdate } from 'svelte';
    import { existingRooms, lines, selectedRoomIndex } from '../stores';
    import type { Point, Line } from './surfaces';
    import { createUniqueIdentifier } from './utils';
    import {
        doPolygonsIntersect,
        getRotatedRectPoints,
        isLineRectangleCollision,
        isPolygonInPolygon,
    } from './intersections';
    import { get } from 'svelte/store';
    import type { TableC } from './Table.svelte';
    export let room: RoomC;
    let path: string;

    /**
     * Callback function executed after an update
     * Constructs an SVG path string representing the combined path of the main room and additional rooms inside it
     * @returns {void}
     */
    afterUpdate((): void => {
        const reversedRoomsInside = [...room.roomsInside].reverse();
        path = ` M ${room.points.map(({ x, y }) => `${x},${y}`).join(' ')} z `;

        room.roomsInside.forEach((r) => {
            if (!r.points.some(({ x, y }) => room.points.some(({ x: px, y: py }) => x === px && y === py))) {
                path += ` M ${r.points.map(({ x, y }) => `${x},${y}`).join(' ')} z `;
            }
        });
    });
</script>

<path d="{path}" fill-rule="evenodd" class="polygon" class:highlight="{room.roomId === $selectedRoomIndex}"></path>

<style>
    path {
        fill-rule: evenodd;
    }

    :global(.admin g path) {
        fill: transparent;
        stroke: none;
    }

    :global(.admin g path.highlight) {
        fill: rgba(239, 125, 0, 0.5);
    }

    :global(g path) {
        fill: #fff;
        stroke: #000;
        stroke-width: 2;
    }
</style>
