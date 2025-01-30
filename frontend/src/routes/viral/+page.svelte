<script lang="ts">
  import { Coins, Trophy, Activity, Dumbbell, ArrowRight, Sparkles } from 'lucide-svelte';
  import { onMount } from 'svelte';
  import ContractInfo from '$lib/components/ContractInfo.svelte';
  import Card from '$lib/components/Card.svelte';
  import ButtonCta from '$lib/components/ButtonCTA.svelte';
  import ViralMetrics from '$lib/components/ViralMetrics.svelte';

  const TOKEN_DATA = {
    contractAddress: 'HW7D5MyYG4Dz2C98axfjVBeLWpsEnofrqy6ZUwqwpump',
    dexscreenerUrl: 'https://dexscreener.com/solana/HW7D5MyYG4Dz2C98axfjVBeLWpsEnofrqy6ZUwqwpump'
  };
</script>

<!-- Quick Buy Banner -->
<div class="border-b border-purple-900/20 bg-gradient-to-r from-purple-600/10 to-blue-600/10">
  <div class="mx-auto max-w-6xl px-4 py-3 text-center">
    <div class="flex items-center justify-center gap-2 text-sm">
      <Sparkles class="h-4 w-4 text-purple-400" />
      <span class="text-gray-300">$VIRAL is Now Trading</span>
      <a
        href={TOKEN_DATA.dexscreenerUrl}
        target="_blank"
        class="text-purple-400 underline transition-colors hover:text-purple-300"
      >
        View Price & Trade →
      </a>
    </div>
  </div>
</div>

<div class="min-h-screen bg-black pb-24 text-white">
  <div class="mx-auto max-w-6xl px-4 pt-24">
    <!-- Hero Section -->
    <div class="mb-16 text-center">
      <h1
        class="mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-5xl font-bold text-transparent md:text-6xl"
      >
        $VIRAL Token
      </h1>
      <p class="mx-auto mb-8 max-w-2xl text-xl text-gray-400">
        The utility token powering tournaments, VM-1 training, and governance.
      </p>
      <div class="flex justify-center gap-4">
        <ButtonCta href={TOKEN_DATA.dexscreenerUrl} target="_blank">
          <Coins class="h-5 w-5" />
          Trade $VIRAL
        </ButtonCta>
        <a
          href={TOKEN_DATA.dexscreenerUrl}
          target="_blank"
          class="inline-flex items-center gap-2 rounded-full border border-white bg-black/30 px-8 py-3 font-semibold transition-colors hover:bg-black/50"
        >
          <Activity class="h-5 w-5" />
          Live Chart
        </a>
      </div>
    </div>

    <ViralMetrics />

    <!-- Token Utility Section -->
    <div class="my-16 grid gap-8 md:grid-cols-2">
      <!-- Training -->
      <Card>
        <h3 class="mb-6 flex items-center gap-2 text-xl font-bold">
          <Dumbbell class="h-6 w-6 text-purple-400" />
          Training & Rewards
        </h3>
        <ul class="space-y-4 text-gray-300">
          <li class="flex gap-2">
            <ArrowRight class="h-5 w-5 flex-shrink-0 text-purple-400" />
            <span>Hold $VIRAL to participate in free training races</span>
          </li>
          <li class="flex gap-2">
            <ArrowRight class="h-5 w-5 flex-shrink-0 text-purple-400" />
            <span>Stake tokens for access to high-reward races</span>
          </li>
          <li class="flex gap-2">
            <ArrowRight class="h-5 w-5 flex-shrink-0 text-purple-400" />
            <span>Earn rewards for quality demonstrations</span>
          </li>
        </ul>
      </Card>

      <!-- Tournaments -->
      <Card>
        <h3 class="mb-6 flex items-center gap-2 text-xl font-bold">
          <Trophy class="h-6 w-6 text-purple-400" />
          Tournaments & Inference
        </h3>
        <ul class="space-y-4 text-gray-300">
          <li class="flex gap-2">
            <ArrowRight class="h-5 w-5 flex-shrink-0 text-purple-400" />
            <span>Enter tournaments with prize pools</span>
          </li>
          <li class="flex gap-2">
            <ArrowRight class="h-5 w-5 flex-shrink-0 text-purple-400" />
            <span>Vote on future VM-1 development</span>
          </li>
          <li class="flex gap-2">
            <ArrowRight class="h-5 w-5 flex-shrink-0 text-purple-400" />
            <span>Access VM-1 inference for your AI applications</span>
          </li>
        </ul>
      </Card>
    </div>

    <Card class="text-center">
      <ContractInfo />
    </Card>
  </div>

  <!-- Background effects -->
  <div class="fixed inset-0 -z-10 bg-gradient-to-b from-purple-900/20 to-black"></div>
  <div
    class="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"
  ></div>
</div>
