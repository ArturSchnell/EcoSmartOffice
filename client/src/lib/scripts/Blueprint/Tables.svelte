<script lang="ts">
    import { tables } from '../stores';
    import Table from './Table.svelte';
</script>

<g>
    {#each $tables as table}
        <Table bind:table="{table}" />
    {/each}
</g>
