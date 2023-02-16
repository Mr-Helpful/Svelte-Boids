<script context="module" lang="ts">
	import { check_object, enter_pressed } from "./utilities";

  export type IconButtonType = {name: string, src: string, onclick: () => void, style?: string}
  export function isIconButton(value: any): value is IconButtonType {
    const spec = {name: 'string', src: 'string', onclick: 'function'}
    return check_object(value, spec)
  }
</script>

<script lang="ts">
  export let name: string, src: string, onclick: () => void, style: string = '';
</script>

<img {style} {src} alt={name} on:click={onclick} on:keypress={enter_pressed(onclick)} />

<style>
  /******************/
  /* Button styling */
  /******************/
  img {
    display: block;
    padding: 5px;

    border-radius: 3px;
    border: 1px solid #6B6A78;
    background-color: #EEC6AD;
  }

  img {
    height: 25px;
  }

  img:hover {
    background-color: #EAB899;
  }
</style>