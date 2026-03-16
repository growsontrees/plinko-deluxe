<script lang="ts">
  import DraggableWindow from '$lib/components/ui/DraggableWindow.svelte';
  import {
    fetchLeaderboard,
    leaderboardEntries,
    leaderboardError,
    leaderboardLoading,
    leaderboardOptIn,
    peakBalance,
    playerName,
    submitScore,
  } from '$lib/stores/leaderboard';
  import { isLeaderboardOpen } from '$lib/stores/layout';
  import { flyAndScale } from '$lib/utils/transitions';
  import { Tooltip } from 'bits-ui';
  import ArrowClockwise from 'phosphor-svelte/lib/ArrowClockwise';
  import Trophy from 'phosphor-svelte/lib/Trophy';
  import CircleNotch from 'phosphor-svelte/lib/CircleNotch';

  let nameInput = $state($playerName);
  let nameError = $state('');

  $effect(() => {
    if ($isLeaderboardOpen) {
      fetchLeaderboard();
    }
  });

  function handleOptIn() {
    const trimmed = nameInput.trim();
    if (trimmed.length < 3 || trimmed.length > 20) {
      nameError = 'Name must be 3-20 characters';
      return;
    }
    if (/<[^>]*>/.test(trimmed)) {
      nameError = 'Name cannot contain HTML';
      return;
    }
    nameError = '';
    $playerName = trimmed;
    $leaderboardOptIn = true;
    submitScore();
  }

  function handleUpdateScore() {
    submitScore();
  }

  function formatScore(score: number): string {
    return '$' + score.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
</script>

{#if $isLeaderboardOpen}
  <DraggableWindow
    onClose={() => ($isLeaderboardOpen = false)}
    class="fixed top-8 right-8 w-[22rem]"
  >
    {#snippet title()}
      <Trophy weight="fill" class="text-xl text-pir-gold" />
      <p class="text-sm font-medium text-white">Leaderboard</p>
    {/snippet}

    {#snippet titleBarActions()}
      <Tooltip.Provider delayDuration={0} disableCloseOnTriggerClick>
        <Tooltip.Root>
          <Tooltip.Trigger
            onclick={() => fetchLeaderboard()}
            class="bg-slate-800 px-5 py-3 text-slate-300 transition hover:bg-slate-700 active:bg-slate-600"
          >
            <ArrowClockwise weight="bold" />
          </Tooltip.Trigger>
          <Tooltip.Content
            forceMount
            sideOffset={4}
            class="z-50 max-w-lg rounded-md bg-white p-3 text-sm font-medium text-gray-950 drop-shadow-xl"
          >
            {#snippet child({ wrapperProps, props, open })}
              {#if open}
                <div {...wrapperProps}>
                  <div {...props} transition:flyAndScale>
                    <Tooltip.Arrow class="text-white" />
                    <p>Refresh Leaderboard</p>
                  </div>
                </div>
              {/if}
            {/snippet}
          </Tooltip.Content>
        </Tooltip.Root>
      </Tooltip.Provider>
    {/snippet}

    <div class="flex max-h-[28rem] flex-col gap-3">
      {#if !$leaderboardOptIn}
        <!-- Opt-in section -->
        <div class="rounded-md bg-pir-panel p-3">
          <p class="text-sm font-medium text-white">Join the leaderboard?</p>
          <p class="mt-1 text-xs text-slate-400">
            Your highest balance will be automatically submitted.
          </p>
          <input
            bind:value={nameInput}
            placeholder="Enter your name"
            class="mt-2 w-full rounded-md border-2 border-slate-600 bg-slate-900 px-3 py-1.5 text-sm text-white placeholder:text-slate-500 focus:border-pir-gold focus:outline-hidden"
            aria-label="Player name"
          />
          {#if nameError}
            <p class="mt-1 text-xs text-red-400">{nameError}</p>
          {/if}
          <button
            onclick={handleOptIn}
            class="mt-2 w-full rounded-md bg-pir-gold px-3 py-1.5 text-sm font-semibold text-gray-900 transition hover:bg-yellow-400"
          >
            Join
          </button>
        </div>
      {:else}
        <!-- Opted-in section -->
        <div class="rounded-md bg-pir-panel p-3">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-400">Playing as: <strong class="text-white">{$playerName}</strong></span>
            <button
              onclick={() => ($leaderboardOptIn = false)}
              class="text-xs text-slate-500 hover:text-slate-300"
            >
              Leave
            </button>
          </div>
          <p class="mt-1 text-sm text-pir-gold font-semibold">Your Score: {formatScore($peakBalance)}</p>
          <button
            onclick={handleUpdateScore}
            disabled={$leaderboardLoading}
            class="mt-2 w-full rounded-md bg-pir-gold px-3 py-1.5 text-sm font-semibold text-gray-900 transition hover:bg-yellow-400 disabled:opacity-50"
          >
            Update Score
          </button>
        </div>
      {/if}

      {#if $leaderboardError}
        <div class="rounded-md bg-red-900/30 p-2 text-xs text-red-400">
          {$leaderboardError}
          <button onclick={() => fetchLeaderboard()} class="ml-1 underline">Retry</button>
        </div>
      {/if}

      {#if $leaderboardLoading}
        <div class="flex justify-center py-4">
          <CircleNotch class="size-6 animate-spin text-pir-gold" weight="bold" />
        </div>
      {:else}
        <div class="overflow-y-auto">
          <table class="w-full text-xs">
            <thead>
              <tr class="text-left text-slate-400">
                <th class="px-2 py-1">#</th>
                <th class="px-2 py-1">Name</th>
                <th class="px-2 py-1 text-right">Score</th>
              </tr>
            </thead>
            <tbody>
              {#each $leaderboardEntries as entry, i}
                <tr class="border-t border-slate-700/50 text-white {$playerName === entry.name ? 'bg-pir-gold/10' : ''}">
                  <td class="px-2 py-1.5 text-slate-400">{i + 1}</td>
                  <td class="px-2 py-1.5 font-medium">{entry.name}</td>
                  <td class="px-2 py-1.5 text-right tabular-nums text-pir-gold">{formatScore(entry.score)}</td>
                </tr>
              {/each}
              {#if $leaderboardEntries.length === 0 && !$leaderboardLoading}
                <tr>
                  <td colspan="3" class="px-2 py-4 text-center text-slate-500">No scores yet. Be the first!</td>
                </tr>
              {/if}
            </tbody>
          </table>
        </div>
      {/if}
    </div>
  </DraggableWindow>
{/if}
