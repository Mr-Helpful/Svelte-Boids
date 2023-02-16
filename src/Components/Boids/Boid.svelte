<script lang="ts">
  import * as V from "./Vector";

  export let s: V.Vec, v: V.Vec, colour: string, view_radius: number, show_radius: boolean = false;

  function get_matrix([sx, sy]: V.Vec, v: V.Vec): string {
    const [vx, vy] = V.one(v);
    const rot = `${vx}, ${vy}, ${-vy}, ${vx}`;
	  return `matrix(${rot}, ${sx}, ${sy})`;
  }
</script>

<g transform={get_matrix(s, v)}>
  <polygon points=5,0,-3,-4,0,0,-3,4 stroke={colour} fill="none"></polygon>
  {#if show_radius}
    <circle cx={0} cy={0} r={view_radius} stroke={colour} fill="none"></circle>
  {/if}
</g>