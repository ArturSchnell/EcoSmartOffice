<script>
    import { existingRooms, selectedRoomIndex } from '../stores';
</script>

<div class="h-100">
    <div id="accordion">
        <div class="section"><i class="fa-solid fa-vector-square"></i> Räume:</div>
        {#if $existingRooms.length}
            {#each $existingRooms as existingRoom}
                <div class="card" class:highlight="{existingRoom.roomId === $selectedRoomIndex}">
                    <a
                        class="collapsed btn"
                        class:bold="{existingRoom.roomId === $selectedRoomIndex}"
                        data-bs-toggle="collapse"
                        href="#collapseRoom{existingRoom.roomId}"
                    >
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <div
                            class="card-header"
                            on:click="{() => {
                                if ($selectedRoomIndex === existingRoom.roomId) {
                                    $selectedRoomIndex = 0;
                                    return;
                                }
                                $selectedRoomIndex = existingRoom.roomId;
                            }}"
                        >
                            {#if existingRoom.isEditing}
                                <!-- svelte-ignore a11y-autofocus -->
                                <input
                                    type="text"
                                    autofocus
                                    bind:value="{existingRoom.roomName}"
                                    on:focusout="{() => {
                                        existingRoom.isEditing = false;
                                    }}"
                                    on:keydown="{(e) => {
                                        if (e.key === 'Enter') {
                                            existingRoom.isEditing = false;
                                        }
                                    }}"
                                />
                            {:else}
                                <span>
                                    {existingRoom.roomName}
                                </span>
                                <span>
                                    <i
                                        on:click="{() => {
                                            existingRoom.isEditing = true;
                                        }}"
                                        class="fa-solid fa-pen"></i>
                                </span>
                            {/if}
                        </div>
                    </a>
                    <div id="collapseRoom{existingRoom.roomId}" class="collapse" data-bs-parent="#accordion">
                        <div class="card-body">
                            Fläche: {existingRoom.area.toLocaleString('de-DE', {
                                maximumFractionDigits: 2,
                                minimumFractionDigits: 2,
                            })} m²
                        </div>
                    </div>
                </div>
            {/each}
        {/if}
    </div>
</div>

<style>
    div {
        width: 100%;
        background-color: #fff;
        border: none;
    }

    .highlight div:first-child {
        background-color: #f3f3f3;
    }
    div.card {
        --bs-card-spacer-y: 0;
        --bs-card-spacer-x: 0;
        --bs-card-title-spacer-y: 0;
        --bs-card-border-radius: 0;
        --bs-card-cap-padding-y: 0;
        --bs-card-cap-padding-x: 0;
        --bs-card-inner-border-radius: 0;
        border-bottom: 1px solid #e3e3e3;
    }
    .bold {
        font-weight: bold;
    }
    a.btn {
        --bs-btn-padding-x: 0;
        --bs-btn-padding-y: 0;
    }

    div.section {
        background-color: #3c3c3b;
        border: 1px solid #3c3c3b;
        color: #fff;
        height: 40px;
        line-height: 40px;
    }

    div.section:first {
        margin: none;
    }

    div#accordion2 {
        margin-top: 100px;
    }

    input {
        outline: none;
        display: block;
        width: 100%;
        text-align: center;
        box-sizing: border-box;
        background: transparent;
        border: 1px solid rgba(255, 255, 255, 0.5);
    }

    .card:hover {
        cursor: pointer;
    }

    div > span > i {
        display: none;
    }

    div:hover > span > i {
        display: inline;
    }

    .btn {
        --bs-btn-border-width: 0px;
    }
</style>
