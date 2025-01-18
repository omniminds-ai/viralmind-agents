<script lang="ts">
  import {
    Coins,
    Trophy,
    Activity,
    BarChart3,
    Dumbbell,
    ArrowRight,
    Sparkles
  } from 'lucide-svelte';
  import { onMount } from 'svelte';
  import solIcon from '$lib/assets/solIcon.png';
  import ContractInfo from '$lib/components/ContractInfo.svelte';
  import Card from '$lib/components/Card.svelte';
  import ButtonCta from '$lib/components/ButtonCTA.svelte';

  const TOKEN_DATA = {
    contractAddress: 'HW7D5MyYG4Dz2C98axfjVBeLWpsEnofrqy6ZUwqwpump',
    dexscreenerUrl: 'https://dexscreener.com/solana/HW7D5MyYG4Dz2C98axfjVBeLWpsEnofrqy6ZUwqwpump'
  };

  let viralPrice = 0;
  let solPrice = 0;
  let viralPerSol = 0;

  async function fetchPrices() {
    try {
      const response = await fetch(
        'https://api.jup.ag/price/v2?ids=HW7D5MyYG4Dz2C98axfjVBeLWpsEnofrqy6ZUwqwpump,So11111111111111111111111111111111111111112'
      );
      const json = await response.json();

      viralPrice = parseFloat(json.data[TOKEN_DATA.contractAddress].price);
      solPrice = parseFloat(json.data.So11111111111111111111111111111111111111112.price);
      viralPerSol = solPrice / viralPrice;
    } catch (error) {
      console.error('Error fetching prices:', error);
    }
  }

  // Fetch prices on mount and every 30 seconds
  onMount(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  });
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
        The utility token powering tournaments, VM-1 training, and governance
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

    <!-- Token Metrics Grid -->
    <div class="mb-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <!-- SOL Price -->
      <div class="rounded-xl border border-purple-600/30 bg-stone-900/30 p-6 backdrop-blur-md">
        <div class="mb-4 flex items-center gap-2">
          <img src={solIcon} alt="SOL" class="h-6 w-6" />
          <h3 class="font-semibold">VIRAL per SOL</h3>
        </div>
        <div class="mb-1 text-2xl font-bold">
          {viralPerSol.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </div>
        <div class="text-sm text-gray-400">
          1 SOL = ${solPrice.toFixed(2)}
        </div>
      </div>

      <!-- Market Cap card (assuming a total supply of 1B VIRAL): -->
      <Card>
        <div class="mb-4 flex items-center gap-2">
          <BarChart3 class="h-6 w-6 text-purple-400" />
          <h3 class="font-semibold">Market Cap</h3>
        </div>
        <div class="mb-1 text-2xl font-bold">
          ${(viralPrice * 1_000_000_000).toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </div>
        <div class="text-sm text-gray-400">Fully Diluted</div>
      </Card>
      <!-- Volume -->
      <Card>
        <div class="mb-4 flex items-center gap-2">
          <Activity class="h-6 w-6 text-purple-400" />
          <h3 class="font-semibold">24h Volume</h3>
        </div>
        <div class="mb-1 text-2xl font-bold">
          <a
            href={TOKEN_DATA.dexscreenerUrl}
            target="_blank"
            class="transition-colors hover:text-purple-400"
          >
            View Live →
          </a>
        </div>
        <div class="text-sm text-gray-400">Real-time trading data</div>
      </Card>

      <!-- Trading -->
      <Card>
        <div class="mb-4 flex items-center gap-2">
          <Coins class="h-6 w-6 text-purple-400" />
          <h3 class="font-semibold">Buy $VIRAL</h3>
        </div>
        <div class="mb-1 text-2xl font-bold">
          <a
            href={TOKEN_DATA.dexscreenerUrl}
            target="_blank"
            class="transition-colors hover:text-purple-400"
          >
            Trade Now →
          </a>
        </div>
        <div class="text-sm text-gray-400">Multiple DEXs Available</div>
      </Card>
    </div>

    <!-- Token Utility Section -->
    <div class="mb-16 grid gap-8 md:grid-cols-2">
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
