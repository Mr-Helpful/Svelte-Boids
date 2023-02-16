<script context="module" lang="ts">
	import { check_object } from "./utilities";

  export type TextInputType = {name: string, val: string, style?: string};
  export function isTextInput(value: any): value is TextInputType {
    const spec = {name: 'string', val: 'string'};
    return check_object(value, spec)
  }
</script>

<script lang="ts">
  export let name: string, val: string, style: string = '';
</script>

<div {style}>
  <input type="text" bind:value={val} placeholder={name}/>
</div>

<style>
  div {
    display: block;
    padding: 2.5px;
    width: auto;

    border-radius: 3px;
    border: 1px solid #6B6A78;
    background-color: #EEC6AD;
  }

  input {
    width: calc(100% - 8px);
    font-size: 1rem;
  }
</style>

