<script>
    import Blueprint from '../lib/scripts/Blueprint/Blueprint.svelte';
    import BlueprintSidebar from '../lib/scripts/Blueprint/BlueprintSidebar.svelte';
    import Floor from '../lib/Floor.svelte';

    import { isAdmin, bluePrintMode, showAdminPanel, floorsAmount, existingRooms } from '../lib/scripts/stores';
    import { Input } from 'sveltestrap';
    import TablePopover from '../lib/scripts/SpaceSelection/TablePopover.svelte';
    import { createTable } from '../lib/scripts/Blueprint/Table.svelte';
    import Toast from '../lib/scripts/Blueprint/Toast.svelte';
    import Save from '../lib/scripts/Save.svelte';
    import { BlueprintMode } from '../lib/scripts/Types/types';
</script>

<div class="d-flex flex-column h-100 container-fluid">
    <div class="d-flex flex-column flex-grow-1 flex-grow-1">
        <nav class="navibar">
            <div class="panel">
                <!-- svelte-ignore a11y-invalid-attribute -->
                <a class="navbar-brand rel" href="#">
                    <img src="../src/assets/jambit-logo.svg" alt="Logo" />
                </a>
            </div>
            <div class="d-flex container-fluid justify-content-between">
                <div class="d-flex">
                    <Floor />
                    {#if $isAdmin && $showAdminPanel}
                        <div style="margin-left:10px">
                            <button type="button" on:click="{createTable}" class="btn btn-primary">
                                Tisch hinzufügen
                            </button>
                        </div>
                    {/if}
                </div>
                {#if $isAdmin}
                    <div style="margin:0 10px; align-self:center" class="d-none d-md-block">
                        {#if $showAdminPanel}
                            <span class="icon-container" style="margin:0 10px">
                                <button
                                    on:click="{() => {
                                        $bluePrintMode = BlueprintMode.Draw;
                                    }}"
                                    disabled="{$bluePrintMode === BlueprintMode.Draw}"
                                >
                                    <i class="fa-solid fa-draw-polygon fa-xl"></i>
                                </button>
                            </span>
                            <span class="icon-container" style="margin:0 10px">
                                <button
                                    on:click="{() => {
                                        $bluePrintMode = BlueprintMode.Delete;
                                    }}"
                                    disabled="{$bluePrintMode === BlueprintMode.Delete}"
                                >
                                    <i class="fa-solid fa-eraser fa-xl"></i>
                                </button>
                            </span>
                            <Save />
                        {/if}
                        <div class="switch">
                            <Input
                                bind:checked="{$showAdminPanel}"
                                type="switch"
                                label="{$showAdminPanel ? 'Blaupause deaktivieren' : 'Blaupause aktivieren'}"
                            />
                        </div>
                    </div>
                {/if}
            </div>
        </nav>

        <div class="row h-100">
            {#if ($floorsAmount < 1 && $existingRooms.length) || $showAdminPanel}
                <div class="col col-lg-2">
                    <svelte:component this="{$showAdminPanel ? BlueprintSidebar : null}" />
                </div>
            {/if}
            <div class="h-100 flex-grow-1 col-sm">
                <div class="h-100">
                    <Blueprint />
                    <Toast />
                    <svelte:component this="{!$showAdminPanel ? TablePopover : null}" />
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .icon-container {
        width: 32px;
        height: 32px;
    }

    .icon-container button,
    .icon-container button:disabled:hover {
        display: inline;
        padding: 0;
        background-color: transparent;
        border: none;
        color: #3c3c3b;
    }

    .icon-container button:disabled,
    .icon-container button:disabled:hover {
        color: #ef7d00;
    }

    .icon-container button:active,
    .icon-container button:focus {
        background-color: transparent;
        color: #ef7d00;
    }
    .icon-container button:hover {
        color: #ef7d00;
    }

    .col.col-lg-2 {
        padding: 0;
    }

    div.container-fluid,
    .col-sm,
    div.row {
        padding: 0;
        --bs-gutter-x: 0;
        --bs-gutter-y: 0;
    }

    .row {
        margin: 0;
    }

    .navibar {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    .panel ~ div {
        flex-direction: row-reverse;
    }

    .navbar-brand img {
        height: 3.5rem;
        position: relative;
    }

    button {
        background-color: #3c3c3b;
        border-color: #3c3c3b;
    }

    button:focus {
        background-color: #ef7d00;
        border-color: #ef7d00;
    }

    .switch {
        display: inline-block;
        margin: 0 0 0 20px;
        text-align: justify;
    }
    .switch :global(.form-check.form-switch) {
        display: inline-block;
        width: 230px;
    }

    .panel {
        position: relative;
        margin: 0 5px 0 5px;
    }
    .panel img {
        width: 100%;
        max-width: 200px;
    }
    @media only screen and (min-width: 600px) {
        .panel ~ div {
            flex-direction: initial;
        }
        .panel img {
            width: initial;
        }
        .panel {
            margin: 0 25px 0 25px;
        }
    }

    .switch :global(.form-check-input),
    .switch :global(.form-check-input:focus),
    .switch :global(.form-check-input:active) {
        box-shadow: none;
    }

    .switch :global(.form-check-input:checked) {
        background-color: #ef7d00;
        border-color: #ef7d00;
    }
</style>
