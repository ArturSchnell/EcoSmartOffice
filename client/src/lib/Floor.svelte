<script lang="ts">
    import { getFloorDetails, getFloorsAmount } from './scripts/ReqRes/location';
    import {
        isAdmin,
        selectedFloor,
        tokenMSAL,
        floorsAmount,
        showAdminPanel,
        floorsLoaded,
        existingRooms,
        areRoomsLoaded,
        lines,
        tables,
    } from './scripts/stores';
    import { Line, isLineAlreadyExisting } from './scripts/Blueprint/surfaces';
    import { RoomC, mapLinesToRooms } from './scripts/Blueprint/Room.svelte';
    import { TableC } from './scripts/Blueprint/Table.svelte';
    import { setDateDetails } from './scripts/SpaceSelection/SpaceSelectionCalendar.svelte';
    import type { FloorInfos, UserInfo, edge, node } from './scripts/Types/types';
    import { DFS } from './scripts/Blueprint/DFS';

    $: if ($tokenMSAL) {
        getFloorsAmount($tokenMSAL).then((flAmount) => {
            $floorsAmount = flAmount;
            if (localStorage.getItem('selectedLevel')) {
                decideFloor(flAmount);
                return;
            }
            decideFloor(1);
        });
    }

    /**
     * Determines the floor to be selected based on the number of floors available.
     * @param {number} floorsAmount the total number of floors available.
     * @returns {void}
     */
    const decideFloor = (floorsAmount: number): void => {
        const locallySelectedLevel = parseInt(localStorage.getItem('selectedLevel'));
        if (!isNaN(locallySelectedLevel) && locallySelectedLevel <= floorsAmount) {
            setFloor(locallySelectedLevel);
        } else {
            setFloor(floorsAmount);
        }
        setFloorDetails();
    };

    /**
     * Adds a new floor to the floor selection
     * @returns {void}
     */
    const addFloor = (): void => {
        $floorsAmount++;
        $selectedFloor = $floorsAmount;
        clearArea();
    };

    /**
     * Sets the selected floor to the specified floor number
     * @param {number} floor the floor number to set as the selected floor
     * @returns {void}
     */
    const setFloor = (floor: number): void => {
        $selectedFloor = floor;
    };

    /**
     * Switches the selected floor to the specified floor number and updates the floor details
     * @param {number} selectedFloor the floor number to switch to
     * @returns {Promise<void>} promise that resolves once the floor details have been updated
     */
    const switchFloor = async (selectedFloor: number) => {
        if (selectedFloor !== $selectedFloor) {
            setFloor(selectedFloor);
            localStorage.setItem('selectedLevel', `${selectedFloor}`);
            setFloorDetails();
        }
    };

    /**
     * Clears the area by removing all lines, tables, existing rooms, and resetting the DFS algorithm and room numbering
     * @returns {void}
     */
    export function clearArea(): void {
        $lines = [];
        $tables = [];
        $existingRooms = [];
        DFS.reset();
        RoomC.resetRoomNumber();
    }

    let floorD: FloorInfos = {
        nodes: [],
        edges: [],
        rooms: [],
        mappedTable: null,
    };

    /**
     * Sets the floor details by fetching the floor structure from the server and updating the relevant state variables
     * @returns {void}
     */
    export const setFloorDetails = (): void => {
        floorsLoaded.set(false);
        if ($selectedFloor > 0) {
            getFloorDetails($selectedFloor, $tokenMSAL)
                .then((floorDetails) => {
                    floorD.rooms = floorDetails.structure.rooms;
                    floorD.edges = floorDetails.structure.edges;
                    floorD.nodes = floorDetails.structure.nodes;

                    setTableDetails();
                    floorsLoaded.set(true);
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    };

    /**
     * Sets the table details by clearing the area, setting up the Depth-First Search (DFS) algorithm,
     * updating the existing rooms and tables, and mapping lines to rooms
     * @returns {Promise<void>} promise that resolves once the table details are set
     */
    export const setTableDetails = async (): Promise<void> => {
        clearArea();

        DFS.setNodes(floorD.nodes);
        DFS.setEdges(floorD.edges);

        const max: number =
            DFS.getEdges().reduce((acc, [a, b]) => {
                return Math.max(acc, a, b);
            }, 0) + 1;
        DFS.setStartNodeNo(max);
        existingRooms.set(floorD.rooms);

        floorD.rooms.forEach((room: RoomC) => {
            room.tables.forEach((currentTable: TableC, index: number, tables: TableC[]) => {
                const updatedTable = new TableC(
                    currentTable.tableId,
                    currentTable.width,
                    currentTable.height,
                    currentTable.matrix,
                    currentTable.state,
                    currentTable.isLoaded,
                );
                tables[index] = updatedTable;
            });
        });

        areRoomsLoaded.set(true);
        setDateDetails();
        createSurfaces();
        mapLinesToRooms(DFS.run());
    };

    /**
     * Creates surfaces based on the existing rooms by adding lines to the SVG canvas
     * @returns {void}
     */
    function createSurfaces(): void {
        $existingRooms.forEach((room) => {
            room.lines.map((line: Line) => {
                const newLine = new Line(
                    line.start.point.x,
                    line.start.point.y,
                    line.end.point.x,
                    line.end.point.y,
                    false,
                );
                if (!isLineAlreadyExisting(newLine)) {
                    newLine.add();
                }
            });
        });
    }
</script>

<div>
    <div class="btn-group">
        <div class="selectedFloor">
            <i class="fa-solid fa-stairs"></i>
            {$selectedFloor}
        </div>
        <button
            class="btn btn-dark dropdown-toggle"
            data-bs-toggle="dropdown"
            disabled="{$floorsAmount <= 1 && !$showAdminPanel}"
            aria-expanded="false"
        >
            Etage wechseln
        </button>
        <div class="dropdown-menu">
            {#if $floorsAmount}
                {#each Array($floorsAmount) as _, index}
                    <!-- svelte-ignore a11y-invalid-attribute -->
                    <a
                        class="dropdown-item"
                        href="#"
                        on:click="{() => {
                            switchFloor(index + 1);
                        }}">Etage {index + 1}</a
                    >
                {/each}
            {/if}
            {#if $isAdmin}
                {#if $floorsAmount}<div class="dropdown-divider"></div>{/if}
                <!-- svelte-ignore a11y-invalid-attribute -->
                <a class="dropdown-item" href="#" on:click="{addFloor}">Etage hinzufügen</a>
            {/if}
        </div>
    </div>
</div>

<style>
    button {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
        background-color: #3c3c3b;
        border-color: #3c3c3b;
    }

    button:focus {
        background-color: #ef7d00;
        border-color: #ef7d00;
    }
    .selectedFloor {
        border-top-left-radius: 0.375rem;
        border-bottom-left-radius: 0.375rem;
        border: 1px solid #3c3c3b;
        padding: 0.375rem 0.75rem;
        background-color: #3c3c3b;
        border-color: #3c3c3b;
        color: #fff;
        flex: auto;
        height: 100%;
        min-width: 60px;
        align-self: center;
    }
</style>
