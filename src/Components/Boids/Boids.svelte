<script lang="ts">
	import { initialise, step, type BoidData, type ConstantSettings, type ConfigSettings, type ConfigOf } from "./Control";
  import type { Vec } from './Vector'
	import Boid from "./Boid.svelte";
	import { onMount } from "svelte";
	import { extractValues } from "./utilities";

  export let
    constants: Omit<ConstantSettings, 'dims'|'target'>,
    config: ConfigOf<ConfigSettings>;

  let dims: Vec = [0, 0]
  let target: Vec = [0, 0]
  let boids: BoidData[] = []

  /** We wrap the initialisation function to only update on changes to N */
  function init_boids(N: number, constants: Omit<ConstantSettings, 'N'|'dims'|'target'>): BoidData[] {
    return initialise({dims, target, N, ...constants})
  }

  $: boids = init_boids(constants.N, constants)
  config.playback.val.reset = () => boids = init_boids(constants.N, constants)

  /** An animation loop for all boids in the svg */
  async function boids_loop() {
    let frames = (await config.playback.val.tick)() / 10
    boids = step(boids, frames, {dims, target, ...constants, ...extractValues(config)})
    requestAnimationFrame(boids_loop)
  }
  onMount(boids_loop)
</script>

<div
  bind:clientWidth={dims[0]} bind:clientHeight={dims[1]}
  on:mousemove={ev => {target = [ev.clientX, ev.clientY]}}
>
<svg viewBox={`0 0 ${dims[0]} ${dims[1]}`}>
  {#each boids as {s, v}}
    <Boid {s} {v}
      colour={constants.colour} view_radius={constants.view_radius}
    />
  {/each}
</svg>
</div>

<style>
  svg {
    width: 100vw;
    height: 100vh;
  }
</style>

