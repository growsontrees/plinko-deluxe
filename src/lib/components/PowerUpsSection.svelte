<script lang="ts">
  import { POWER_UP_MILESTONES } from '$lib/constants/game';
  import { activePowerUps, getProgressForPowerUp, milestoneProgress, powerUpStates } from '$lib/stores/powerups';
  import type { PowerUpType } from '$lib/types';
  import { Switch } from '$lib/components/ui';
  import { Label } from 'bits-ui';
  import CaretDown from 'phosphor-svelte/lib/CaretDown';
  import Lock from 'phosphor-svelte/lib/Lock';
  import Lightning from 'phosphor-svelte/lib/Lightning';
  import { twMerge } from 'tailwind-merge';

  let expanded = $state(true);

  const powerUpNames: Record<PowerUpType, string> = {
    WALL_GUIDE: 'Wall Guide',
    MULTI_BALL: 'Multi-Ball',
    MAGNET: 'Magnet',
    GOLDEN_PEG: 'Golden Pegs',
  };

  const powerUpDescriptions: Record<PowerUpType, string> = {
    WALL_GUIDE: 'Gentle nudge toward edges in top rows',
    MULTI_BALL: 'Drop 3 balls for the price of 1',
    MAGNET: 'Pulls balls toward edge bins',
    GOLDEN_PEG: 'Random golden pins give 2× bonus',
  };

  function togglePowerUp(type: PowerUpType) {
    activePowerUps.update((current) => {
      const next = new Set(current);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }
</script>

<div class="rounded-md bg-pir-panel">
  <button
    onclick={() => (expanded = !expanded)}
    class="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-pir-gold"
  >
    <Lightning weight="fill" class="size-4" />
    <span>Power-Ups</span>
    <CaretDown
      class={twMerge('ml-auto size-4 transition-transform', expanded && 'rotate-180')}
      weight="bold"
    />
  </button>

  {#if expanded}
    <div class="flex flex-col gap-3 px-3 pb-3">
      {#each $powerUpStates as state}
        {@const progress = getProgressForPowerUp($milestoneProgress, state.type)}
        {@const isActive = $activePowerUps.has(state.type)}
        <div class="flex items-center gap-3">
          <div class="flex-1">
            <div class="flex items-center gap-1.5">
              {#if !state.unlocked}
                <Lock class="size-3.5 text-slate-500" weight="fill" />
              {/if}
              <span class={twMerge('text-xs font-medium', state.unlocked ? 'text-white' : 'text-slate-500')}>
                {powerUpNames[state.type]}
              </span>
            </div>
            {#if !state.unlocked}
              <div class="mt-1">
                <div class="h-1.5 w-full rounded-full bg-slate-700">
                  <div
                    class="h-1.5 rounded-full bg-pir-gold transition-all"
                    style:width={`${Math.min((progress.current / progress.threshold) * 100, 100)}%`}
                  ></div>
                </div>
                <p class="mt-0.5 text-[10px] text-slate-500">
                  {Math.round(progress.current)}/{progress.threshold} — {POWER_UP_MILESTONES[state.type].description}
                </p>
              </div>
            {:else}
              <p class="text-[10px] text-slate-400">{powerUpDescriptions[state.type]}</p>
            {/if}
          </div>
          <Switch
            id={`powerup-${state.type}`}
            checked={isActive}
            disabled={!state.unlocked}
            onCheckedChange={() => togglePowerUp(state.type)}
          />
        </div>
      {/each}
    </div>
  {/if}
</div>
