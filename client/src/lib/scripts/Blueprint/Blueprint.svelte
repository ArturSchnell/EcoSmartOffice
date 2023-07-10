<script lang="ts">
    import Zoom from '../../Zoom.svelte';
    import { existingRooms, showAdminPanel, floorsAmount, floorsLoaded } from '../stores';
    import SpaceSelectionCalendar from '../SpaceSelection/SpaceSelectionCalendar.svelte';
    import Tables from './Tables.svelte';
    import Rooms from './Rooms.svelte';
    import Draw from './Draw.svelte';
</script>

<div class:spaceWrapper="{!$showAdminPanel}">
    <svelte:component this="{!$showAdminPanel ? SpaceSelectionCalendar : null}" />
    {#if $floorsLoaded && (!$existingRooms.length || !$floorsAmount) && !$showAdminPanel}
        <div class="flex-grow-1 bg" style="display: flex;justify-content: center;align-items: center;widh: 100%">
            <span>Leider noch keine Räume/Tische an Deinem Standort zur Auswahl</span>
        </div>
    {:else}
        <Draw>
            <Rooms />
            <Tables />
        </Draw>
        <Zoom />
    {/if}
</div>

<style>
    div {
        height: 100%;
    }

    .spaceWrapper {
        width: 100%;
        height: calc(100% - 40px);
    }
</style>
