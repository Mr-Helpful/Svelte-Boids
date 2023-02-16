<script context="module" lang="ts">
	import { check_complete } from "./utilities";

  export type IconSwitchType = {name: string, src: string, val: boolean, style?: string}
  export function isIconSwitch(value: any): value is IconSwitchType {
    const spec = {name: 'string', src: 'string', val: 'boolean'}
    return check_complete(value, spec)
  }
</script>

<script lang="ts">
  export let name: string, src: string, val: boolean, style: string = '';
</script>

<label {style}>
  <input type="checkbox" bind:checked={val}>
  <img src={src} alt="{name}: {val?'on':'off'}" title={name} />
</label>

<style>
  /******************/
  /* Switch styling */
  /******************/
  label {
    display: block;
    padding: 5px;

    border-radius: 3px;
    border: 1px solid #6B6A78;
    background-color: #EEC6AD;
  }

  label,img {
    width: 25px;
    height: 25px;
  }

  input {
    display: none;
  }

  label:hover {
    background-color: #EAB899;
  }

  label:has(input:checked) {
    background-color: #ede99a;
  }
</style>