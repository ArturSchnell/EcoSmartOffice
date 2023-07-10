<script lang="ts">
    import { svgEl, origin } from '../stores';

    let groupWrapper: SVGGElement;
    let positionClicked = { x: 0, y: 0 };

    /**
     * Moves the map by dragging it based on the mouse or touch event
     * @param {MouseEvent & TouchEvent} e the MouseEvent or TouchEvent object
     * @returns {void}
     */
    const moveMap = (e: MouseEvent & TouchEvent): void => {
        const dragged = { x: 0, y: 0 };
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;

        dragged.x = clientX - positionClicked.x;
        dragged.y = clientY - positionClicked.y;

        origin.set({ x: dragged.x, y: dragged.y });
        $svgEl.style.backgroundPositionX = `${dragged.x}px`;
        $svgEl.style.backgroundPositionY = `${dragged.y}px`;
    };

    /**
     * Starts the movement of the map by enabling the drag functionality based on the mouse or touch event
     * @param {MouseEvent & TouchEvent} e the MouseEvent or TouchEvent object
     * @returns {void}
     */
    export const startMoveMap = (e: MouseEvent & TouchEvent): void => {
        const x = e.x || e.touches[0].clientX;
        const y = e.y || e.touches[0].clientY;
        positionClicked.x = x - $origin.x;
        positionClicked.y = y - $origin.y;

        $svgEl.addEventListener('mousemove', moveMap);
        $svgEl.addEventListener('touchmove', moveMap);
        $svgEl.addEventListener('mouseleave', removeMouseMoveListener);
        $svgEl.addEventListener('touchleave', removeMouseMoveListener);
        $svgEl.addEventListener('mouseup', removeMouseMoveListener);
        $svgEl.addEventListener('mouseup', removeMouseMoveListener);
    };

    /**
     * Removes the event listeners for mousemove and touchmove to stop the map movement
     * @returns {void}
     */
    const removeMouseMoveListener = (): void => {
        $svgEl.removeEventListener('mousemove', moveMap);
        $svgEl.removeEventListener('touchmove', moveMap);
    };
</script>

<g bind:this="{groupWrapper}" style="{`transform: translate(${$origin.x}px, ${$origin.y}px)`}">
    <slot />
</g>
