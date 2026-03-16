<script lang="ts">
  import { celebrationEvent } from '$lib/stores/game';
  import { hasPreferReducedMotion } from '$lib/utils/settings';

  let visible = $state(false);
  let tier = $state<string>('none');
  let multiplierText = $state('');
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let reducedMotion = false;

  if (typeof window !== 'undefined') {
    reducedMotion = hasPreferReducedMotion();
  }

  const durations: Record<string, number> = {
    jackpot: 2500,
    big_win: 1500,
    win: 500,
    near_miss: 300,
    unlock: 2000,
  };

  $effect(() => {
    const event = $celebrationEvent;
    if (!event || event.tier === 'none') return;

    tier = event.tier;
    multiplierText = `${event.multiplier}×`;

    if (tier === 'unlock') {
      multiplierText = 'NEW POWER-UP UNLOCKED!';
    }

    visible = true;

    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      visible = false;
      celebrationEvent.set(null);
    }, durations[tier] ?? 1000);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  });
</script>

{#if visible}
  <div
    class="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
    role="status"
    aria-live="polite"
  >
    {#if tier === 'jackpot'}
      <div class="celebration-jackpot">
        {#if !reducedMotion}
          <!-- Confetti particles -->
          {#each Array(30) as _, i}
            <div
              class="confetti-particle"
              style:--delay={`${Math.random() * 0.5}s`}
              style:--x={`${(Math.random() - 0.5) * 100}vw`}
              style:--rotation={`${Math.random() * 720}deg`}
              style:--color={['#E31837', '#FFD700', '#22C55E', '#3B82F6', '#EC4899'][i % 5]}
            ></div>
          {/each}
        {/if}
        <div class="jackpot-text animate-jackpot-pulse">
          <span class="text-6xl font-black text-pir-gold drop-shadow-[0_0_30px_rgba(255,215,0,0.8)] md:text-8xl">
            {multiplierText}
          </span>
          <span class="mt-2 text-2xl font-bold text-white md:text-3xl">JACKPOT!</span>
        </div>
        {#if !reducedMotion}
          <div class="absolute inset-0 animate-flash-gold"></div>
        {/if}
      </div>

    {:else if tier === 'big_win'}
      <div class="celebration-big-win">
        {#if !reducedMotion}
          {#each Array(15) as _, i}
            <div
              class="confetti-particle"
              style:--delay={`${Math.random() * 0.3}s`}
              style:--x={`${(Math.random() - 0.5) * 60}vw`}
              style:--rotation={`${Math.random() * 360}deg`}
              style:--color={['#E31837', '#FFD700', '#22C55E'][i % 3]}
            ></div>
          {/each}
        {/if}
        <div class="text-center">
          <span class="text-5xl font-black text-pir-gold drop-shadow-[0_0_20px_rgba(255,215,0,0.6)] md:text-7xl">
            {multiplierText}
          </span>
          <span class="mt-1 block text-xl font-bold text-white">BIG WIN!</span>
        </div>
      </div>

    {:else if tier === 'win'}
      <div class="text-center">
        <span class="text-3xl font-bold text-pir-gold drop-shadow-[0_0_10px_rgba(255,215,0,0.5)] md:text-5xl">
          {multiplierText}
        </span>
      </div>

    {:else if tier === 'near_miss'}
      <div class="absolute inset-0 animate-flash-red"></div>

    {:else if tier === 'unlock'}
      <div class="celebration-unlock">
        <div class="text-center">
          <span class="text-3xl font-black text-pir-gold drop-shadow-[0_0_30px_rgba(255,215,0,0.8)] md:text-5xl">
            {multiplierText}
          </span>
        </div>
        {#if !reducedMotion}
          <div class="absolute inset-0 animate-flash-gold"></div>
        {/if}
      </div>
    {/if}
  </div>
{/if}

<style>
  .confetti-particle {
    position: absolute;
    width: 10px;
    height: 10px;
    background: var(--color, #FFD700);
    top: -10px;
    left: 50%;
    border-radius: 2px;
    animation: confetti-fall 1.5s ease-out var(--delay, 0s) forwards;
  }

  @keyframes confetti-fall {
    0% {
      transform: translateX(0) translateY(0) rotate(0deg);
      opacity: 1;
    }
    100% {
      transform: translateX(var(--x, 0)) translateY(100vh) rotate(var(--rotation, 360deg));
      opacity: 0;
    }
  }

  .animate-jackpot-pulse {
    display: flex;
    flex-direction: column;
    align-items: center;
    animation: jackpot-pulse 0.5s ease-in-out 3;
  }

  @keyframes jackpot-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.15); }
  }

  .animate-flash-gold {
    background: radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%);
    animation: flash 0.5s ease-out forwards;
  }

  .animate-flash-red {
    background: radial-gradient(circle, rgba(227, 24, 55, 0.3) 0%, transparent 70%);
    animation: flash 0.3s ease-out forwards;
  }

  @keyframes flash {
    0% { opacity: 1; }
    100% { opacity: 0; }
  }

  @media (prefers-reduced-motion: reduce) {
    .confetti-particle {
      animation: none;
      display: none;
    }
    .animate-jackpot-pulse {
      animation: none;
    }
  }
</style>
