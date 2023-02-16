<script context="module" lang="ts">
	import { check_object } from "./utilities";

  export type TextSwitchType = {name: string, val: boolean, style?: string};
  export function isTextSwitch(value: any): value is TextSwitchType {
    const spec = {name: 'string', val: 'boolean'}
    return check_object(value, spec)
  }
</script>

<script lang="ts">
  export let name: string, val: boolean, style: string = '';
</script>

<label {style}>
  <input type="checkbox" bind:checked={val}>
  <div>{name}</div>
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

    user-select: none;
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