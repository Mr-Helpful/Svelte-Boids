<script lang="ts">
  import Time from '../_icons/Time.png';
  import Play from '../_icons/Play.png';
  import Skip from '../_icons/Skip.png';
  import Pause from '../_icons/Pause.png';
	import Config from '../Components/Config/Config.svelte';

  let config = {
    icn_btn: {name: 'Icon Button', src: Skip, onclick: async () => {
      console.log('Ticking playback');
      const dt = (await config.playback.val.tick)()
      console.log(`${dt} ticks since last call`)
    }},
    txt_swch: {name: 'Text Switch', val: false},
    icn_swch: {name: 'Icon Switch', src: Time, val: false},
    icn_tgl: {name: 'Icon Toggle', on: Play, off: Pause, val: false},
    playback: {name: 'Playback', fps: 5, val: {
      tick: Promise.resolve(() => 0), reset(){}, playing: true
    }},
    slider: {name: 'Slider', range: [0, 10] as [number, number], val: 1},
    text_inpt: {name: 'Text Input', val: ''}
  }
</script>

<Config bind:config />