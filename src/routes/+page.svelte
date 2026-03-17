<script lang="ts">
  import logo from '$lib/assets/logo.svg';
  import AudioControls from '$lib/components/AudioControls.svelte';
  import Balance from '$lib/components/Balance.svelte';
  import CelebrationOverlay from '$lib/components/CelebrationOverlay.svelte';
  import { LeaderboardWindow } from '$lib/components/LeaderboardWindow';
  import LiveStatsWindow from '$lib/components/LiveStatsWindow/LiveStatsWindow.svelte';
  import Plinko from '$lib/components/Plinko';
  import SettingsWindow from '$lib/components/SettingsWindow';
  import Sidebar from '$lib/components/Sidebar';
  import AudioManager from '$lib/audio/AudioManager';
  import { celebrationEvent, plinkoEngine, winRecords } from '$lib/stores/game';
  import { milestoneProgress, newlyUnlockedPowerUp, powerUpStates } from '$lib/stores/powerups';
  import { isMusicOn, isSfxOn } from '$lib/stores/settings';
  import { isLeaderboardOpen, isLiveStatsOpen } from '$lib/stores/layout';
  import { setBalanceFromLocalStorage, writeBalanceToLocalStorage } from '$lib/utils/game';
  import GitHubLogo from 'phosphor-svelte/lib/GithubLogo';
  import { binPayouts } from '$lib/constants/game';
  import { onMount } from 'svelte';

  let audioManager: AudioManager | null = null;

  onMount(() => {
    if (window.innerWidth >= 1024) {
      $isLeaderboardOpen = true;
      $isLiveStatsOpen = true;
    }
  });

  $effect(() => {
    setBalanceFromLocalStorage();
  });

  // Initialize audio
  $effect(() => {
    audioManager = AudioManager.getInstance();
    audioManager.setSfxEnabled($isSfxOn);
  });

  $effect(() => {
    audioManager?.setSfxEnabled($isSfxOn);
  });

  $effect(() => {
    audioManager?.setMusicEnabled($isMusicOn);
  });

  // Wire engine events to audio (F2: cleanup on re-run)
  $effect(() => {
    const engine = $plinkoEngine;
    if (!engine || !audioManager) return;

    const am = audioManager;

    const onBounce = (data: Record<string, unknown>) => {
      am.playPinBounce(data.rowIndex as number, data.totalRows as number);
    };

    const onBinned = (data: Record<string, unknown>) => {
      const multiplier = data.multiplier as number;
      const rowCount = data.rowCount as number;
      const riskLevel = data.riskLevel as string;
      const payouts = binPayouts[rowCount as keyof typeof binPayouts]?.[riskLevel as keyof (typeof binPayouts)[8]];
      const maxMult = payouts ? Math.max(...payouts) : 1;
      const ratio = multiplier / maxMult;

      if (ratio >= 0.8) am.playSfx('jackpot');
      else if (ratio >= 0.3) am.playSfx('big_win');
      else am.playSfx('bin_land');
    };

    engine.on('ball-bounced', onBounce);
    engine.on('ball-binned', onBinned);

    return () => {
      engine.off('ball-bounced', onBounce);
      engine.off('ball-binned', onBinned);
    };
  });

  // Track milestone progress from win records (F1: use $effect for auto-cleanup)
  $effect(() => {
    const records = $winRecords;
    if (records.length === 0) return;
    const latest = records[records.length - 1];

    milestoneProgress.update((p) => {
      const newProgress = { ...p };
      newProgress.totalDrops = records.length;
      newProgress.totalProfit = records.reduce((sum, r) => sum + r.profit, 0);

      if (latest.payout.multiplier >= 41) {
        newProgress.jackpotHits = (newProgress.jackpotHits || 0) + 1;
      }

      const totalBins = latest.rowCount + 1;
      if (latest.binIndex === 0 || latest.binIndex === totalBins - 1) {
        newProgress.edgeBinHits = (newProgress.edgeBinHits || 0) + 1;
      }

      return newProgress;
    });
  });

  // Detect newly unlocked power-ups (F1: use $effect for auto-cleanup)
  let previousUnlockState: Record<string, boolean> = $state({});
  $effect(() => {
    const states = $powerUpStates;
    for (const state of states) {
      if (state.unlocked && previousUnlockState[state.type] === false) {
        newlyUnlockedPowerUp.set(state.type);
        celebrationEvent.set({
          multiplier: 0,
          payoutValue: 0,
          binIndex: 0,
          tier: 'unlock',
          rowCount: 16,
        });
        audioManager?.playSfx('unlock');
      }
      previousUnlockState[state.type] = state.unlocked;
    }
  });
</script>

<svelte:window onbeforeunload={writeBalanceToLocalStorage} />

<CelebrationOverlay />

<div class="relative flex min-h-dvh w-full flex-col bg-pir-dark">
  <nav class="sticky top-0 z-10 w-full bg-pir-panel px-5 shadow-lg shadow-black/20">
    <div class="mx-auto flex h-14 max-w-7xl items-center justify-between">
      <div class="flex items-center gap-2">
        <img src={logo} alt="logo" class="h-6 sm:h-7" />
        <span class="hidden text-sm font-bold text-pir-gold sm:inline">PLINKO DELUXE</span>
      </div>
      <div class="mx-auto">
        <Balance />
      </div>
    </div>
  </nav>

  <div class="flex-1 px-5">
    <div class="mx-auto mt-5 max-w-xl min-w-[300px] drop-shadow-xl md:mt-10 lg:max-w-7xl">
      <div class="flex flex-col-reverse overflow-hidden rounded-lg lg:w-full lg:flex-row">
        <Sidebar />
        <div class="flex-1">
          <Plinko />
        </div>
      </div>
    </div>
  </div>

  <SettingsWindow />
  <LiveStatsWindow />
  <LeaderboardWindow />
  <AudioControls />

  <footer class="px-5 pt-16 pb-4">
    <div class="mx-auto max-w-[40rem]">
      <div aria-hidden="true" class="h-[1px] bg-slate-700"></div>
      <div class="flex items-center justify-between p-2">
        <p class="text-sm text-slate-500">
          Plinko Deluxe © {new Date().getFullYear()}
        </p>
        <a
          href="https://github.com/growsontrees/plinko-deluxe"
          target="_blank"
          rel="noreferrer"
          class="flex items-center gap-1 p-1 text-sm text-slate-500 transition hover:text-cyan-500"
        >
          <GitHubLogo class="size-4" weight="bold" />
          <span>Source Code</span>
        </a>
      </div>
    </div>
  </footer>
</div>

<style lang="postcss">
  @reference "../app.css";

  :global(body) {
    @apply bg-pir-dark;
  }
</style>
