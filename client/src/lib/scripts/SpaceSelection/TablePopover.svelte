<script lang="ts">
    import { Popover } from 'sveltestrap';
    import { tables } from '../stores';
</script>

{#if $tables}
    {#each $tables as table}
        {#if (table.userId !== undefined && !table.isLoaded && !table.user) || (table.isLoaded && table.user)}
            <Popover trigger="hover" placement="right" target="{`table-trigger-${table.tableId}`}">
                {#if !table.isLoaded}
                    <p class="card-text placeholder-glow">
                        <span class="placeholder col-7"></span>
                        <span class="placeholder col-4"></span>
                        <span class="placeholder col-4"></span>
                        <span class="placeholder col-6"></span>
                    </p>
                {:else}
                    <img
                        src="{window.URL.createObjectURL(table.user.profile)}"
                        alt="Profilbild"
                        height="48"
                        width="48"
                    /><span>
                        {table.user.firstname}
                        {table.user.lastname}
                    </span>
                {/if}
            </Popover>
        {/if}
    {/each}
{/if}

<style>
    p {
        width: 120px;
    }

    img {
        border-radius: 4px;
    }

    img + span {
        margin-left: 10px;
    }
</style>
