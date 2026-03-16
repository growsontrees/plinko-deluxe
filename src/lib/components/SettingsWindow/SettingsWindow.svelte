<script lang="ts">
  import { DEFAULT_BALANCE } from '$lib/constants/game';
  import { balance } from '$lib/stores/game';
  import { isGameSettingsOpen } from '$lib/stores/layout';
  import { isAnimationOn, isMusicOn, isSfxOn } from '$lib/stores/settings';
  import { hasPreferReducedMotion } from '$lib/utils/settings';
  import { Label } from 'bits-ui';
  import GearSix from 'phosphor-svelte/lib/GearSix';
  import { DraggableWindow, Switch } from '../ui';

  $effect(() => {
    if (hasPreferReducedMotion()) {
      $isAnimationOn = false;
    }
  });
</script>

{#if $isGameSettingsOpen}
  <DraggableWindow
    onClose={() => ($isGameSettingsOpen = false)}
    class="fixed bottom-8 left-8 w-[18rem]"
  >
    {#snippet title()}
      <GearSix weight="fill" class="text-xl text-slate-300" />
      <p class="text-sm font-medium text-white">Game Settings</p>
    {/snippet}

    <div class="flex flex-col gap-5">
      <div class="flex items-center gap-4">
        <Switch id="isAnimationOn" bind:checked={$isAnimationOn} />
        <Label.Root for="isAnimationOn" class="text-sm text-white">Animations</Label.Root>
      </div>

      <div class="flex items-center gap-4">
        <Switch id="isSfxOn" bind:checked={$isSfxOn} />
        <Label.Root for="isSfxOn" class="text-sm text-white">Sound Effects</Label.Root>
      </div>

      <div class="flex items-center gap-4">
        <Switch id="isMusicOn" bind:checked={$isMusicOn} />
        <Label.Root for="isMusicOn" class="text-sm text-white">Background Music</Label.Root>
      </div>

      <button
        onclick={() => ($balance = DEFAULT_BALANCE)}
        class="touch-manipulation self-start rounded-md bg-pir-red px-3 py-2 text-sm text-white transition-colors hover:bg-red-600 active:bg-red-800"
      >
        Reset Balance
      </button>
    </div>
  </DraggableWindow>
{/if}
