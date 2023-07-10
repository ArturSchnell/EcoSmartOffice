<script lang="ts">
    import { lines, bluePrintMode, zoomScale } from '../stores';
    import type { Line } from './surfaces';
    import { DFS } from './DFS';
    import { mapLinesToRooms } from './Room.svelte';
    import { BlueprintMode } from '../Types/types';
    export let line: Line;

    /**
     * Removes a line from the system and updates the rooms
     * @returns {void}
     */
    const removeLine = (): void => {
        DFS.correctRemovedPaths(line);
        $lines = $lines.filter((l) => l !== line);
        mapLinesToRooms(DFS.run());
    };
</script>

{#if $bluePrintMode === BlueprintMode.Delete}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <line
        class="rm"
        x1="{line.start.point.x}"
        y1="{line.start.point.y}"
        x2="{line.end.point.x}"
        y2="{line.end.point.y}"
        on:click="{removeLine}"
    >
    </line>{/if}
<line x1="{line.start.point.x}" y1="{line.start.point.y}" x2="{line.end.point.x}" y2="{line.end.point.y}"></line>
<circle cx="{line.start.point.x}" cy="{line.start.point.y}" r="{line.start.r}"></circle>
<circle cx="{line.end.point.x}" cy="{line.end.point.y}" r="{line.end.r}"></circle>
<text x="{line.text.position.x + 5 * $zoomScale}" y="{line.text.position.y}" font-size="{(11 / $zoomScale) * 1.5}px"
    >{line.text.content}</text
>

<style>
    line {
        stroke: #3c3c3b;
    }
    line.rm {
        stroke: transparent;
        stroke-width: 20px;
    }
    line.rm:hover {
        cursor: url('../../../assets/eraser-solid.svg'), auto;
    }
    line.rm:hover + line {
        stroke: red;
        user-select: none;
        pointer-events: none;
        stroke-width: 4px;
    }

    text {
        user-select: none;
        pointer-events: none;
    }
    :global(circle),
    :global(text:not(.me)),
    :global(line) {
        display: none;
    }

    :global(svg.admin circle),
    :global(svg.admin text),
    :global(svg.admin line) {
        display: block;
    }
</style>
