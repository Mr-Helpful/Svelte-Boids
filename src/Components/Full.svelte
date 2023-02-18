<script lang="ts">
	import Boids from "./Boids/Boids.svelte";
  import Config from "./Config/Config.svelte";

  // TODO: try to provide config for as many of these as possible
  // perhaps if its a bit visually cluttered, hide them in an `advanced` section
  const constants = {
    min_vel: 30,
    max_vel: 50,
    max_acc: 30,
    view_radius: 20,
    view_angles: -1,
    avoid_radius: 20,
    words_weight: 20,
    colour: "#ccc",
    N: 100
  }

  type Box = [number, number]

  let config = {
    avoid_weight: {name: 'Avoid', range: [0, 5] as Box, val: 1.0},
    align_weight: {name: 'Align', range: [0, 5] as Box, val: 1.0},
    center_weight: {name: 'Center', range: [0, 1] as Box, val: 0.1},
    mouse_weight: {name: 'Mouse', range: [0, 1] as Box, val: 0.3},
    edges_weight: {name: 'Edges', range: [0, 50] as Box, val: 20.0},
    use_edges: {name: 'Edges', val: true},
    use_mouse: {name: 'Mouse', val: false},
    use_words: {name: 'Words', val: false},
    word_input: {name: 'Words to draw', val: ''},
    playback: {name: 'Playback', fps: 60, val: {
      tick: Promise.resolve(() => 0),
      reset(){ console.log('Playback reset!') },
      playing: true,
    }}
  }
</script>

<Config bind:config />
<Boids {constants} {config} />