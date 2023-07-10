<script lang="ts">
    import { existingRooms, isAdmin, selectedFloor, toastObject, tokenMSAL } from './stores';
    import { DFS } from './Blueprint/DFS';
    import { putFloorDetails } from './ReqRes/location';
    import type { FloorDetails } from './Types/types';
    import { setErrorMessage, setSuccessMessage } from './Blueprint/Toast.svelte';

    /**
     * Saves the floor details asynchronously and displays a success or error message.
     *
     * @function saveFloorDetails
     * @async
     * @returns {Promise<void>} promise that resolves when the floor details are successfully saved
     * @throws {Error} error if the API request fails or returns an error
     */
    async function saveFloorDetails(): Promise<void> {
        const floorDetails: FloorDetails = {
            floor: $selectedFloor,
            structure: {
                edges: DFS.getEdges(),
                rooms: $existingRooms,
                nodes: DFS.getNodes(),
            },
        };

        putFloorDetails(floorDetails, $tokenMSAL)
            .then((res) => {
                if (res) {
                    setSuccessMessage('Speichern erfolgreich');
                    return;
                }
                throw Error;
            })
            .catch(() => {
                setErrorMessage('Speichern fehlgeschlagen');
            });
    }
</script>

{#if $isAdmin}
    <span class="icon-container" style="margin:0 10px">
        <button on:click="{saveFloorDetails}" title="Blaupause speichern">
            <i class="fa-solid fa-floppy-disk fa-xl"> </i></button
        >
    </span>
{/if}

<style>
    .icon-container {
        width: 32px;
        height: 32px;
    }

    .icon-container button {
        display: inline;
        padding: 0;
        background-color: transparent;
        border: none;
        color: #3c3c3b;
    }

    .icon-container button:hover {
        color: #ef7d00;
    }
</style>
