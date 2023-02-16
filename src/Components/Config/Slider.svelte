<script context="module" lang="ts">
	import { check_object } from "./utilities";

  export type SliderType = {name: string, range: [number, number], steps?: number, val: number, style?: string};
  export function isSlider(value: any): value is SliderType {
    const spec = {name: 'string', range: ['number', 'number'], val: 'number'}
    return check_object(value, spec) && value.range[0] < value.range[1]
  }
</script>

<script lang='ts'>
  export let
    name: string,
    range: [number, number],
    steps: number = 100,
    val: number,
    style: string = ''
</script>

<label {style}>
  <div>{name}</div>
  <input type="range" max={steps} on:change={ev => {
    const frac = parseInt(ev.currentTarget.value) / steps
    val = range[0] * (1 - frac) + range[1] * frac
  }}
  value={Math.round((val - range[0])/(range[1] - range[0]) * steps)}
  >
</label>

<style>
  label {
    display: grid;
    padding: 2.5px;
    width: auto;

    border-radius: 3px;
    /* border: 1px solid #6B6A78; */
    /* background-color: #EEC6AD; */

    place-items: stretch;
    grid-template-columns: 1fr 2fr;
  }
</style>