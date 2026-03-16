<script lang="ts">
  import { plinkoEngine } from '$lib/stores/game';
  import CircleNotch from 'phosphor-svelte/lib/CircleNotch';
  import type { Action } from 'svelte/action';
  import BinsRow from './BinsRow.svelte';
  import LastWins from './LastWins.svelte';
  import PlinkoEngine from './PlinkoEngine';
  import PixiRenderer from './PixiRenderer';

  const { WIDTH, HEIGHT } = PlinkoEngine;

  let renderer: PixiRenderer | null = null;

  const initPlinko: Action<HTMLCanvasElement> = (node) => {
    renderer = new PixiRenderer(WIDTH, HEIGHT);
    renderer
      .init(node)
      .then(() => {
        $plinkoEngine = new PlinkoEngine(renderer!);
        $plinkoEngine.start();
      })
      .catch((err) => {
        console.error('Failed to initialize PixiJS renderer:', err);
      });

    return {
      destroy: () => {
        $plinkoEngine?.stop();
        renderer?.destroy();
        renderer = null;
      },
    };
  };
</script>

<div class="relative" style:background-color="#0a1628">
  <div class="mx-auto flex h-full flex-col px-4 pb-4" style:max-width={`${WIDTH}px`}>
    <div class="relative w-full" style:aspect-ratio={`${WIDTH} / ${HEIGHT}`}>
      {#if $plinkoEngine === null}
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <CircleNotch class="size-20 animate-spin text-slate-600" weight="bold" />
        </div>
      {/if}

      <canvas use:initPlinko width={WIDTH} height={HEIGHT} class="absolute inset-0 h-full w-full">
      </canvas>
    </div>
    <BinsRow />
  </div>
  <div class="absolute top-1/2 right-[5%] -translate-y-1/2">
    <LastWins />
  </div>
</div>
