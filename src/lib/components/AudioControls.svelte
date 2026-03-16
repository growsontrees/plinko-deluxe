<script lang="ts">
  import { isMusicOn, isSfxOn } from '$lib/stores/settings';
  import SpeakerHigh from 'phosphor-svelte/lib/SpeakerHigh';
  import SpeakerSlash from 'phosphor-svelte/lib/SpeakerSlash';

  let isMuted = $derived(!$isSfxOn && !$isMusicOn);

  function toggleAudio() {
    if (isMuted) {
      $isSfxOn = true;
      $isMusicOn = true;
    } else {
      $isSfxOn = false;
      $isMusicOn = false;
    }
  }
</script>

<button
  onclick={toggleAudio}
  class="fixed right-4 bottom-4 z-30 rounded-full bg-pir-panel p-2.5 text-slate-300 shadow-lg transition hover:bg-pir-panel-light hover:text-white"
  aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
>
  {#if isMuted}
    <SpeakerSlash class="size-5" weight="fill" />
  {:else}
    <SpeakerHigh class="size-5" weight="fill" />
  {/if}
</button>
