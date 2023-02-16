<svelte:head>
  <link href="/fonts/Nunito-Regular.css" rel="stylesheet" />
</svelte:head>

<script context="module" lang="ts">
  import type { TextSwitchType } from "./TextSwitch.svelte";
  import type { IconToggleType } from "./IconToggle.svelte";
  import type { IconSwitchType } from "./IconSwitch.svelte";
  import type { SliderType } from "./Slider.svelte";
  import type { TextInputType } from "./TextInput.svelte";
  import type { IconButtonType } from "./IconButton.svelte";
  import type { PlaybackType } from "./Playback.svelte";

  export type ConfigEntry = TextSwitchType | IconToggleType | IconSwitchType | SliderType | TextInputType | IconButtonType | PlaybackType
</script>

<script lang="ts">
  import TextSwitch, { isTextSwitch } from "./TextSwitch.svelte";
  import IconToggle, { isIconToggle } from "./IconToggle.svelte";
  import IconSwitch, { isIconSwitch } from "./IconSwitch.svelte";
  import Slider, { isSlider } from "./Slider.svelte";
  import TextInput, {isTextInput} from "./TextInput.svelte";
	import IconButton, { isIconButton } from "./IconButton.svelte";
	import Playback, { isPlayback } from "./Playback.svelte";

  export let settings: {[k: string]: ConfigEntry} = {};
</script>

<label class='tabs'>
  <input type='checkbox'>
  <div class='tab open'>&lt</div>
  <div class='tab close'>&gt</div>
</label>
<div class='controls'>
  <div id='title'>Controls</div>
  {#each Object.values(settings) as setting}
    <div class='control'>
    {#if isSlider(setting)}
      <Slider {...setting} bind:val={setting.val} />
    {:else if isTextInput(setting)}
      <TextInput {...setting} bind:val={setting.val} />
    {:else if isTextSwitch(setting)}
      <TextSwitch {...setting} bind:val={setting.val} />
    {:else if isIconButton(setting)}
      <IconButton {...setting} />
    {:else if isIconSwitch(setting)}
      <IconSwitch {...setting} bind:val={setting.val} />
    {:else if isIconToggle(setting)}
      <IconToggle {...setting} bind:val={setting.val} />
    {:else if isPlayback(setting)}
      <Playback {...setting} bind:val={setting.val} />
    {:else}
      <div>Config type for {JSON.stringify(setting)} not known!</div>
    {/if}
    </div>
  {/each}
</div>

<style>
  /***************************/
  /* Formatting the controls */
  /***************************/

  .controls {
    /*we want to force our menu onto the right of the screen*/
    position: fixed;
    right: -201px;
    /*we also want it to fill the screen vertically*/
    height: 100%;
    /*we specify a width as otherwise some text would be lost*/
    width: 200px;
    outline-style: solid;
    outline-width: 1px;
    outline-color: #6B6A78;
    z-index: 10;
    background-color: rgba(237, 232, 234, 0.8);
  }

  .controls * {
    margin: 5px;
    font-family: 'Nunito';
  }

  .controls>#title {
    margin: 0px;
    padding: 5px;
    outline: 1px solid #6B6A78;
    background-color: #E6DDDB;
  }

  /*******************************/
  /* Showing and hiding the menu */
  /*******************************/

  .tabs>input~*,
  .controls {
    transform: translate(0px, 0);
    transition: transform 0.5s ease;
  }

  .tabs>.tab {
    /* we want to force the tabs onto the middle right of the page */
    position: fixed;
    /* we want to force it 1px offscreen to hide the right border */
    right: -1px;
    top: calc(50% - 35px);
    width: 15px;

    border: 1px solid #6B6A78;
    border-radius: 3px 0px 0px 3px;

    text-align: center;
    line-height: 70px;
    background: #EDE8EA;
  }

  .tabs>.close {
    z-index: 100;
    opacity: 0;
  }

  .tabs:hover>* {
    background: #E2DADD;
  }

  .tabs>input {
    display: none;
  }

  .tabs>input:checked~.close {
    opacity: 1;
  }

  .tabs>input:checked~*,
  .tabs:has(input:checked)~.controls {
    transform: translate(-200px, 0);
  }
</style>