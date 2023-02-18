<script lang="ts">
	import { initialise, step, type BoidData, type ConstantSettings, type ConfigSettings, type ConfigOf } from "./Control";
  import type { Vec } from './Vector'
	import Boid from "./Boid.svelte";
	import { onMount } from "svelte";
	import { extractValues } from "./utilities";
	import { getPoints } from "./Word";

  type ConstantProps = Omit<ConstantSettings, 'dims'|'target'|'word_points'>
  type ConfigProps = ConfigOf<ConfigSettings>

  export let
    constants: ConstantProps,
    config: ConfigProps;

  let dims: Vec = [0, 0]
  let target: Vec = [0, 0]

  let boids: BoidData[] = []
  let point_cache: Vec[] = []
  let cnv: HTMLCanvasElement

  /** We wrap the initialisation function to only update on changes to N */
  function init_boids(N: number, constants: Omit<ConstantProps, 'N'>): BoidData[] {
    return initialise({dims, N, ...constants})
  }
  $: boids = init_boids(constants.N, constants)
  config.playback.val.reset = () => boids = init_boids(constants.N, constants)

  /** Converts a short phrase or sequence of words to stippling points */
  function update_words_points(N: number) {
    if (config.use_words.val){
      if(point_cache.length == 0) {
        point_cache = getPoints(cnv.getContext('2d') as CanvasRenderingContext2D, config.word_input.val, N)
      }
    } else {
      point_cache = []
    }
    return point_cache
  }

  /** An animation loop for all boids in the svg */
  async function boids_loop() {
    let frames = (await config.playback.val.tick)() / 10
    const word_points = update_words_points(constants.N)
    boids = step(boids, frames, {dims, target, word_points, ...constants, ...extractValues(config)})
    requestAnimationFrame(boids_loop)
  }
  onMount(boids_loop)
</script>

<div
  bind:clientWidth={dims[0]} bind:clientHeight={dims[1]}
  on:mousemove={ev => {target = [ev.clientX, ev.clientY]}}
>
<canvas bind:this={cnv} style="display:none" width={dims[0]} height={dims[1]}/>
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

