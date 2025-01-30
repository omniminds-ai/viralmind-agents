<script lang="ts">
  import { Coins, Activity, BarChart3 } from 'lucide-svelte';
  import { onMount } from 'svelte';
  import solIcon from '$lib/assets/solIcon.png';
  import Card from '$lib/components/Card.svelte';

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

<!-- Token Metrics Grid -->
<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
