<script context="module" lang="ts">
  import { check_object, perf_timer, wait } from "./utilities"

  export type PlaybackType = {
    name: string,
    fps: number,
    avg_over?: number,
    val: {
      tick: Promise<() => number>,
      reset: () => void,
      playing?: boolean,
    },
    style?: string
  }
  export function isPlayback(value: any): value is PlaybackType {
    const spec = {name: 'string', fps: 'number', val: {tick: 'object', reset: 'function'}}
    return check_object(value, spec)
  }
</script>

<script lang="ts">
  import Play from "../../icons/Play.png"
  import Step from "../../icons/Skip.png"
  import Time from "../../icons/Time.png"
  import Pause from "../../icons/Pause.png"
  import Reload from "../../icons/Reload.png"
	import IconToggle from "./IconToggle.svelte"
	import IconButton from "./IconButton.svelte"
	import IconSwitch from "./IconSwitch.svelte"

  /*
  Okay, this one'll probably need some explanation:
  We expose a tick promise which can be `await`ed, i.e. `(await tick)()`

  When the step button is clicked, this promise is resolved.
  When the play button is clicked, it's resolved fps times per second.
  When the stop button is clicked, this resolution cycle stops.

  The tick promise returns a function that schedules the next tick and
  returns the difference in ticks between this and the last `await`.
  */

  export let
    name: string,
    fps: number,
    avg_over: number = 10,
    val: PlaybackType['val'],
    style: string = '';

  // there's probably a better way of providing optional binding, but this works
  let playing = val.playing ?? false
  $: val.playing = playing

  let tick_resolve: (f: () => number) => void = f => {}
  /** Extracts the resolver from a promise, allowing it to be called later */
  function split_promise(): Promise<() => number> {
    return new Promise(res => tick_resolve = res)
  }

  // start our tick promise
  val.tick = split_promise()
  
  const timer = perf_timer()
  let tick_avg = 0
  let update_avg = true
  /** Resolves the current waiting tick with a handler that starts a new one */
  function update_tick() {
    tick_resolve(() => {
      val.tick = split_promise()

      const ticks = timer.delta() * (fps / 1000)
      if(update_avg) tick_avg += (ticks - tick_avg)/avg_over
      return ticks
    })
  }

  /* The main loop for the tick handler, updates fps times per second */
  async function loop() {
    do {
      update_tick()
      await wait(1000 / fps)
    } while(playing)
  }
  $: if(playing) {
    timer.reset()
    loop()
  }
</script>

<div {style}>
  <IconToggle name="{name}:Play" on={Play} off={Pause} bind:val={playing} />
  <IconButton name="{name}:Step" src={Step} onclick={() => {tick_resolve(() => {
    val.tick = split_promise()
    return 1
  })}} />
  <IconButton name="{name}:Reload" src={Reload} onclick={val.reset} />
  <IconSwitch name={tick_avg.toString()} src={Time} bind:val={update_avg} />
</div>

<style>
  div {
    display: grid;
    justify-content: space-between;
    grid-template-columns: repeat(4, auto);
  }
</style>
