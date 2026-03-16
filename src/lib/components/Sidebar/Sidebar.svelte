<script lang="ts">
  import { Select } from '$lib/components/ui';
  import PowerUpsSection from '$lib/components/PowerUpsSection.svelte';
  import { autoBetIntervalMs, rowCountOptions } from '$lib/constants/game';
  import {
    balance,
    betAmount,
    betAmountOfExistingBalls,
    plinkoEngine,
    riskLevel,
    rowCount,
  } from '$lib/stores/game';
  import { isGameSettingsOpen, isLeaderboardOpen, isLiveStatsOpen } from '$lib/stores/layout';
  import { BetMode, RiskLevel } from '$lib/types';
  import { flyAndScale } from '$lib/utils/transitions';
  import { Popover, Tooltip } from 'bits-ui';
  import ChartLine from 'phosphor-svelte/lib/ChartLine';
  import GearSix from 'phosphor-svelte/lib/GearSix';
  import Infinity from 'phosphor-svelte/lib/Infinity';
  import Question from 'phosphor-svelte/lib/Question';
  import Trophy from 'phosphor-svelte/lib/Trophy';
  import type { FormEventHandler } from 'svelte/elements';
  import { twMerge } from 'tailwind-merge';

  let betMode: BetMode = $state(BetMode.MANUAL);
  let autoBetInput = $state(0);
  let autoBetsLeft: number | null = $state(null);
  let autoBetInterval: ReturnType<typeof setInterval> | null = $state(null);

  let isBetAmountNegative = $derived($betAmount < 0);
  let isBetExceedBalance = $derived($betAmount > $balance);
  let isAutoBetInputNegative = $derived(autoBetInput < 0);

  let isDropBallDisabled = $derived(
    $plinkoEngine === null || isBetAmountNegative || isBetExceedBalance || isAutoBetInputNegative,
  );

  let hasOutstandingBalls = $derived(Object.keys($betAmountOfExistingBalls).length > 0);

  const handleBetAmountFocusOut: FormEventHandler<HTMLInputElement> = (e) => {
    const parsedValue = parseFloat(e.currentTarget.value.trim());
    if (isNaN(parsedValue)) {
      $betAmount = -1;
      $betAmount = 0;
    } else {
      $betAmount = parsedValue;
    }
  };

  function resetAutoBetInterval() {
    if (autoBetInterval !== null) {
      clearInterval(autoBetInterval);
      autoBetInterval = null;
    }
  }

  function autoBetDropBall() {
    if (isBetExceedBalance) {
      resetAutoBetInterval();
      return;
    }

    if (autoBetsLeft === null) {
      $plinkoEngine?.dropBall();
      return;
    }

    if (autoBetsLeft > 0) {
      $plinkoEngine?.dropBall();
      autoBetsLeft -= 1;
    }
    if (autoBetsLeft === 0 && autoBetInterval !== null) {
      resetAutoBetInterval();
      return;
    }
  }

  const handleAutoBetInputFocusOut: FormEventHandler<HTMLInputElement> = (e) => {
    const parsedValue = parseInt(e.currentTarget.value.trim());
    if (isNaN(parsedValue)) {
      autoBetInput = -1;
      autoBetInput = 0;
    } else {
      autoBetInput = parsedValue;
    }
  };

  function handleBetClick() {
    if (betMode === BetMode.MANUAL) {
      $plinkoEngine?.dropBall();
    } else if (autoBetInterval === null) {
      autoBetsLeft = autoBetInput === 0 ? null : autoBetInput;
      autoBetInterval = setInterval(autoBetDropBall, autoBetIntervalMs);
    } else if (autoBetInterval !== null) {
      resetAutoBetInterval();
    }
  }

  const betModes = [
    { value: BetMode.MANUAL, label: 'Manual' },
    { value: BetMode.AUTO, label: 'Auto' },
  ];
  const riskLevels = [
    { value: RiskLevel.LOW, label: 'Low' },
    { value: RiskLevel.MEDIUM, label: 'Medium' },
    { value: RiskLevel.HIGH, label: 'High' },
  ];
  const rowCounts = rowCountOptions.map((value) => ({ value, label: value.toString() }));
</script>

<div class="flex flex-col gap-4 bg-pir-panel p-3 lg:max-w-80">
  <div class="flex gap-1 rounded-full bg-slate-900 p-1">
    {#each betModes as { value, label }}
      <button
        disabled={autoBetInterval !== null}
        onclick={() => (betMode = value)}
        class={twMerge(
          'flex-1 rounded-full py-2 text-sm font-medium text-white transition hover:not-disabled:bg-slate-600 active:not-disabled:bg-slate-500 disabled:cursor-not-allowed disabled:opacity-50',
          betMode === value && 'bg-slate-600',
        )}
      >
        {label}
      </button>
    {/each}
  </div>

  <button
    onclick={handleBetClick}
    disabled={isDropBallDisabled}
    class={twMerge(
      'touch-manipulation rounded-md bg-pir-red py-3 font-semibold text-white transition-colors hover:bg-red-600 active:bg-red-800 disabled:bg-neutral-600 disabled:text-neutral-400',
      autoBetInterval !== null && 'bg-pir-gold text-gray-900 hover:bg-yellow-400 active:bg-yellow-600',
    )}
  >
    {#if betMode === BetMode.MANUAL}
      Drop Ball
    {:else if autoBetInterval === null}
      Start Autobet
    {:else}
      Stop Autobet
    {/if}
  </button>

  {#if betMode === BetMode.AUTO}
    <div>
      <div class="flex items-center gap-1">
        <label for="autoBetInput" class="text-sm font-medium text-slate-300">Number of Bets</label>
        <Popover.Root>
          <Popover.Trigger class="p-1">
            <Question class="text-slate-300" weight="bold" />
          </Popover.Trigger>
          <Popover.Content
            class="z-30 max-w-lg rounded-md bg-white p-3 text-sm font-medium text-gray-950 drop-shadow-xl"
          >
            <p>Enter '0' for unlimited bets.</p>
            <Popover.Arrow />
          </Popover.Content>
        </Popover.Root>
      </div>
      <div class="relative">
        <input
          id="autoBetInput"
          value={autoBetInterval === null ? autoBetInput : autoBetsLeft ?? 0}
          disabled={autoBetInterval !== null}
          onfocusout={handleAutoBetInputFocusOut}
          type="number"
          min="0"
          inputmode="numeric"
          class={twMerge(
            'w-full rounded-md border-2 border-slate-600 bg-slate-900 py-2 pr-8 pl-3 text-sm text-white transition-colors hover:cursor-pointer hover:not-disabled:border-slate-500 focus:border-pir-gold focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
            isAutoBetInputNegative && 'border-red-500 hover:border-red-400 focus:border-red-400',
          )}
        />
        {#if autoBetInput === 0}
          <Infinity class="absolute top-3 right-3 size-4 text-slate-400" weight="bold" />
        {/if}
      </div>
      {#if isAutoBetInputNegative}
        <p class="text-xs leading-5 text-red-400">This must be greater than or equal to 0.</p>
      {/if}
    </div>
  {/if}

  <div class="relative">
    <label for="betAmount" class="text-sm font-medium text-slate-300">Bet Amount</label>
    <div class="flex">
      <div class="relative flex-1">
        <input
          id="betAmount"
          value={$betAmount}
          onfocusout={handleBetAmountFocusOut}
          disabled={autoBetInterval !== null}
          type="number"
          min="0"
          step="0.01"
          inputmode="decimal"
          class={twMerge(
            'w-full rounded-l-md border-2 border-slate-600 bg-slate-900 py-2 pr-2 pl-7 text-sm text-white transition-colors hover:cursor-pointer hover:not-disabled:border-slate-500 focus:border-pir-gold focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
            (isBetAmountNegative || isBetExceedBalance) &&
              'border-red-500 hover:not-disabled:border-red-400 focus:border-red-400',
          )}
        />
        <div class="absolute top-2 left-3 text-slate-500 select-none" aria-hidden="true">$</div>
      </div>
      <button
        disabled={autoBetInterval !== null}
        onclick={() => {
          $betAmount = parseFloat(($betAmount / 2).toFixed(2));
        }}
        class="touch-manipulation bg-slate-600 px-4 font-bold text-white diagonal-fractions transition-colors hover:not-disabled:bg-slate-500 active:not-disabled:bg-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        1/2
      </button>
      <button
        disabled={autoBetInterval !== null}
        onclick={() => {
          $betAmount = parseFloat(($betAmount * 2).toFixed(2));
        }}
        class="relative touch-manipulation rounded-r-md bg-slate-600 px-4 text-sm font-bold text-white transition-colors after:absolute after:left-0 after:inline-block after:h-1/2 after:w-[2px] after:bg-slate-800 after:content-[''] hover:not-disabled:bg-slate-500 active:not-disabled:bg-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        2×
      </button>
    </div>
    {#if isBetAmountNegative}
      <p class="absolute text-xs leading-5 text-red-400">
        This must be greater than or equal to 0.
      </p>
    {:else if isBetExceedBalance}
      <p class="absolute text-xs leading-5 text-red-400">Can't bet more than your balance!</p>
    {/if}
  </div>

  <div>
    <label for="riskLevel" class="text-sm font-medium text-slate-300">Risk</label>
    <Select
      id="riskLevel"
      bind:value={$riskLevel}
      items={riskLevels}
      disabled={hasOutstandingBalls || autoBetInterval !== null}
    />
  </div>

  <div>
    <label for="rowCount" class="text-sm font-medium text-slate-300">Rows</label>
    <Select
      id="rowCount"
      bind:value={$rowCount}
      items={rowCounts}
      disabled={hasOutstandingBalls || autoBetInterval !== null}
    />
  </div>

  <!-- Power-Ups Section -->
  <div class="border-t border-slate-600 pt-3">
    <PowerUpsSection />
  </div>

  <div class="mt-auto pt-3">
    <div class="flex items-center gap-4 border-t border-slate-600 pt-3">
      <Tooltip.Provider delayDuration={0} disableCloseOnTriggerClick>
        <!-- Settings Button -->
        <Tooltip.Root>
          <Tooltip.Trigger
            onclick={() => ($isGameSettingsOpen = !$isGameSettingsOpen)}
            class={twMerge(
              'rounded-full p-2 text-slate-300 transition hover:bg-slate-600 active:bg-slate-500',
              $isGameSettingsOpen && 'text-pir-gold',
            )}
          >
            <GearSix class="size-6" weight="fill" />
          </Tooltip.Trigger>
          <Tooltip.Content
            forceMount
            sideOffset={4}
            class="z-30 max-w-lg rounded-md bg-white p-3 text-sm font-medium text-gray-950 drop-shadow-xl"
          >
            {#snippet child({ wrapperProps, props, open })}
              {#if open}
                <div {...wrapperProps}>
                  <div {...props} transition:flyAndScale>
                    <Tooltip.Arrow class="text-white" />
                    <p>{$isGameSettingsOpen ? 'Close' : 'Open'} Game Settings</p>
                  </div>
                </div>
              {/if}
            {/snippet}
          </Tooltip.Content>
        </Tooltip.Root>

        <!-- Live Stats Button -->
        <Tooltip.Root>
          <Tooltip.Trigger
            onclick={() => ($isLiveStatsOpen = !$isLiveStatsOpen)}
            class={twMerge(
              'rounded-full p-2 text-slate-300 transition hover:bg-slate-600 active:bg-slate-500',
              $isLiveStatsOpen && 'text-pir-gold',
            )}
          >
            <ChartLine class="size-6" weight="bold" />
          </Tooltip.Trigger>
          <Tooltip.Content
            forceMount
            sideOffset={4}
            class="z-30 max-w-lg rounded-md bg-white p-3 text-sm font-medium text-gray-950 drop-shadow-xl"
          >
            {#snippet child({ wrapperProps, props, open })}
              {#if open}
                <div {...wrapperProps}>
                  <div {...props} transition:flyAndScale>
                    <Tooltip.Arrow class="text-white" />
                    <p>{$isLiveStatsOpen ? 'Close' : 'Open'} Live Stats</p>
                  </div>
                </div>
              {/if}
            {/snippet}
          </Tooltip.Content>
        </Tooltip.Root>

        <!-- Leaderboard Button -->
        <Tooltip.Root>
          <Tooltip.Trigger
            onclick={() => ($isLeaderboardOpen = !$isLeaderboardOpen)}
            class={twMerge(
              'rounded-full p-2 text-slate-300 transition hover:bg-slate-600 active:bg-slate-500',
              $isLeaderboardOpen && 'text-pir-gold',
            )}
          >
            <Trophy class="size-6" weight="fill" />
          </Tooltip.Trigger>
          <Tooltip.Content
            forceMount
            sideOffset={4}
            class="z-30 max-w-lg rounded-md bg-white p-3 text-sm font-medium text-gray-950 drop-shadow-xl"
          >
            {#snippet child({ wrapperProps, props, open })}
              {#if open}
                <div {...wrapperProps}>
                  <div {...props} transition:flyAndScale>
                    <Tooltip.Arrow class="text-white" />
                    <p>{$isLeaderboardOpen ? 'Close' : 'Open'} Leaderboard</p>
                  </div>
                </div>
              {/if}
            {/snippet}
          </Tooltip.Content>
        </Tooltip.Root>
      </Tooltip.Provider>
    </div>
  </div>
</div>
