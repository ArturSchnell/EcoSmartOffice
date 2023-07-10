<script lang="ts">
    import { existingRooms, lines } from '../stores';
    import Line from './Line.svelte';
    import Room from './Room.svelte';
</script>

<g>
    {#each $existingRooms as room}
        <Room bind:room="{room}" />
    {/each}
</g>
<g>
    {#each $lines as line}
        <Line line="{line}" />
    {/each}
</g>
