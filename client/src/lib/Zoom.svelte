<script lang="ts">
    import { zoomScale } from './scripts/stores';

    /**
     * Handles the zoom-in functionality by increasing the zoom scale if it is below 5
     * @returns {void}
     */
    const handleZoomIn = (): void => {
        if ($zoomScale < 5) {
            $zoomScale += 1;
        }
    };

    /**
     * Handles the zoom-out functionality by decreasing the zoom scale if it is greater than or equal to 1
     * @returns {void}
     */
    const handleZoomOut = (): void => {
        if ($zoomScale >= 1) {
            $zoomScale -= 1;
        }
    };
</script>

<div>
    <button class="btn-block" on:click="{handleZoomIn}" disabled="{$zoomScale >= 5}">
        <i class="fa-solid fa-plus"></i></button
    >
    <button on:click="{handleZoomOut}" disabled="{$zoomScale <= 1}"> <i class="fa-solid fa-minus"></i></button>
</div>

<style>
    div {
        box-sizing: border-box;
        position: absolute;
        right: 25px;
        bottom: 20px;
        width: 32px;
    }
    button {
        margin: 2px;
        height: 32px;
        width: 32px;
        border: 1px solid;
        border-radius: 2px;
    }

    @media only screen and (min-width: 600px) {
        div {
            right: 32px;
            bottom: 32px;
        }
    }
</style>
