<script lang="ts">
  import { BarChart3, ArrowUpDown } from 'lucide-svelte';
  import { onMount } from 'svelte';

  const TOKEN_DATA = {
    contractAddress: 'G6iRK8kN67HJFrPA1CDA5KZaPJMiBu3bqdd9vdKBpump',
    dexscreenerUrl: 'https://dexscreener.com/solana/G6iRK8kN67HJFrPA1CDA5KZaPJMiBu3bqdd9vdKBpump'
  };

  let omniPrice = 0;
  let solPrice = 0;
  let omniPerSol = 0;

  async function fetchPrices() {
    try {
      const response = await fetch(
        'https://api.jup.ag/price/v2?ids=G6iRK8kN67HJFrPA1CDA5KZaPJMiBu3bqdd9vdKBpump,So11111111111111111111111111111111111111112'
      );
      const json = await response.json();

      omniPrice = parseFloat(json.data[TOKEN_DATA.contractAddress].price);
      solPrice = parseFloat(json.data.So11111111111111111111111111111111111111112.price);
      omniPerSol = solPrice / omniPrice;
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
<div class="grid gap-8 md:grid-cols-2">
  <!-- SOL Price -->
  <div class="flex flex-col justify-between rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-purple-50/30 p-8 shadow-lg transition-transform hover:scale-[1.02]">
    <div class="mb-6 flex items-center gap-3">
      <div class="rounded-xl bg-purple-100/50 p-3">
        <ArrowUpDown class="h-7 w-7 text-purple-500" />
      </div>
      <h3 class="text-xl font-bold text-gray-900"><a href="{TOKEN_DATA.dexscreenerUrl}"><pre>$OMNIS</pre></a> per SOL</h3>
    </div>
    <div>
      <div class="mb-2 text-4xl font-bold text-gray-900">
        {omniPerSol.toLocaleString(undefined, { maximumFractionDigits: 0 })}
      </div>
      <div class="text-base text-gray-600">
        1 SOL = ${solPrice.toFixed(2)}
      </div>
    </div>
  </div>

  <!-- Market Cap -->
  <div class="flex flex-col justify-between rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-purple-50/30 p-8 shadow-lg transition-transform hover:scale-[1.02]">
    <div class="mb-6 flex items-center gap-3">
      <div class="rounded-xl bg-purple-100/50 p-3">
        <BarChart3 class="h-7 w-7 text-purple-500" />
      </div>
      <h3 class="text-xl font-bold text-gray-900">Market Cap</h3>
    </div>
    <div>
      <div class="mb-2 text-4xl font-bold text-gray-900">
        ${(omniPrice * 1_000_000_000).toLocaleString(undefined, { maximumFractionDigits: 0 })}
      </div>
      <div class="text-base text-gray-600">Fully Diluted</div>
    </div>
  </div>
</div>
