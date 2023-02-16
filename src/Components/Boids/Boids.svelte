<script lang="ts">
	// import { onMount } from "svelte";
	import { step, type BoidData, type ConstantSettings, type ConfigSettings, type ControlSettings, type ConfigOf } from "./Control";
  import * as V from './Vector'
	import Boid from "./Boid.svelte";
	import { onMount } from "svelte";
	import { extractValues } from "../utilities";

  type BoidSettings = Omit<ControlSettings, 'dims'|'target'> & {
    playback: {tick: Promise<() => number>, reset: () => void}
  };

  export let
    constants: Omit<ConstantSettings, 'dims'|'target'>,
    config: ConfigOf<ConfigSettings>;

  let dims: V.Vec = [0, 0]
  let target: V.Vec = [0, 0]
  let boids: BoidData[] = []
  function init_boids(N: number, dims: V.Vec): BoidData[] {
    let {min_vel: s, max_vel: e} = constants
    return new Array(N).fill(0).map(_ => ({
      s: V.random([0, 0], dims),
      v: V.lim(V.random([-e, -e], [e, e]), s, e),
      a: [0, 0]
    }))
  }

  $: boids = init_boids(constants.N, dims)
  config.playback.val.reset = () => boids = init_boids(constants.N, dims)

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

