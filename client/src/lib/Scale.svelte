<script lang="ts">
  import { zoomScale } from './scripts/stores';
  let meter: number;
  $: meter = 1 / $zoomScale;
</script>

<div>{meter.toFixed(2)}m</div>

<style>
  div {
    position: absolute;
    bottom: 20px;
    text-align: center;
    box-sizing: border-box;
    left: 47px;
    width: 30px;
    width: 55px;
    height: 10px;
    border: 3px solid #000;
    border-top: none;
    line-height: 0;
  }
</style>
