<script lang="ts">
    import { 
      Coins,
      Trophy,
      Users,
      Activity,
      BarChart3,
      Lock,
      MousePointerClick,
      Dumbbell,
      ArrowRight,
      Copy,
      ExternalLink,
      Sparkles
    } from 'lucide-svelte';
    import { onMount } from 'svelte';
    import solIcon from '$lib/assets/solIcon.png';
  
    const TOKEN_DATA = {
      contractAddress: 'HW7D5MyYG4Dz2C98axfjVBeLWpsEnofrqy6ZUwqwpump',
      dexscreenerUrl: 'https://dexscreener.com/solana/HW7D5MyYG4Dz2C98axfjVBeLWpsEnofrqy6ZUwqwpump'
    };
  
    let viralPrice = 0;
    let solPrice = 0;
    let viralPerSol = 0;
  
    async function fetchPrices() {
      try {
        const response = await fetch('https://api.jup.ag/price/v2?ids=HW7D5MyYG4Dz2C98axfjVBeLWpsEnofrqy6ZUwqwpump,So11111111111111111111111111111111111111112');
        const json = await response.json();
        
        viralPrice = parseFloat(json.data[TOKEN_DATA.contractAddress].price);
        solPrice = parseFloat(json.data.So11111111111111111111111111111111111111112.price);
        viralPerSol = solPrice / viralPrice;
      } catch (error) {
        console.error('Error fetching prices:', error);
      }
    }
  
    function copyAddress() {
      navigator.clipboard.writeText(TOKEN_DATA.contractAddress);
    }
  
    // Fetch prices on mount and every 30 seconds
    onMount(() => {
      fetchPrices();
      const interval = setInterval(fetchPrices, 30000);
      return () => clearInterval(interval);
    });
  </script>
  
  <!-- Quick Buy Banner -->
  <div class="bg-gradient-to-r from-purple-600/10 to-blue-600/10 border-b border-purple-900/20">
    <div class="max-w-6xl mx-auto px-4 py-3 text-center">
      <div class="flex items-center justify-center gap-2 text-sm">
        <Sparkles class="w-4 h-4 text-purple-400" />
        <span class="text-gray-300">$VIRAL is Now Trading</span>
        <a 
          href={TOKEN_DATA.dexscreenerUrl}
          target="_blank"
          class="text-purple-400 hover:text-purple-300 transition-colors underline"
        >
          View Price & Trade →
        </a>
      </div>
    </div>
  </div>
  
  <div class="min-h-screen bg-black text-white pb-24">
    <div class="max-w-6xl mx-auto px-4 pt-24">
      <!-- Hero Section -->
      <div class="text-center mb-16">
        <h1 class="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text">
          $VIRAL Token
        </h1>
        <p class="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
          The utility token powering tournaments, VM-1 training, and governance
        </p>
        <div class="flex justify-center gap-4">
          <a 
            href={TOKEN_DATA.dexscreenerUrl}
            target="_blank"
            class="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full font-semibold hover:opacity-90 transition-opacity inline-flex items-center gap-2"
          >
            <Coins class="w-5 h-5" />
            Trade $VIRAL
          </a>
          <a 
            href={TOKEN_DATA.dexscreenerUrl}
            target="_blank"
            class="px-8 py-3 bg-black/30 border border-purple-900/20 rounded-full font-semibold hover:bg-black/50 transition-colors inline-flex items-center gap-2"
          >
            <Activity class="w-5 h-5" />
            Live Chart
          </a>
        </div>
      </div>
  
      <!-- Token Metrics Grid -->
      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <!-- SOL Price -->
        <div class="bg-stone-900/25 rounded-xl p-6 backdrop-blur-md border border-purple-900/20">
            <div class="flex items-center gap-2 mb-4">
            <img src={solIcon} alt="SOL" class="w-6 h-6" />
            <h3 class="font-semibold">VIRAL per SOL</h3>
            </div>
            <div class="text-2xl font-bold mb-1">
            {viralPerSol.toLocaleString(undefined, {maximumFractionDigits: 0})}
            </div>
            <div class="text-sm text-gray-400">
            1 SOL = ${solPrice.toFixed(2)}
            </div>
        </div>
        
        <!-- Market Cap card (assuming a total supply of 1B VIRAL): -->
        <div class="bg-stone-900/25 rounded-xl p-6 backdrop-blur-md border border-purple-900/20">
            <div class="flex items-center gap-2 mb-4">
            <BarChart3 class="w-6 h-6 text-purple-400" />
            <h3 class="font-semibold">Market Cap</h3>
            </div>
            <div class="text-2xl font-bold mb-1">
            ${(viralPrice * 1_000_000_000).toLocaleString(undefined, {maximumFractionDigits: 0})}
            </div>
            <div class="text-sm text-gray-400">
            Fully Diluted
            </div>
        </div>
  
        <!-- Volume -->
        <div class="bg-stone-900/25 rounded-xl p-6 backdrop-blur-md border border-purple-900/20">
          <div class="flex items-center gap-2 mb-4">
            <Activity class="w-6 h-6 text-purple-400" />
            <h3 class="font-semibold">24h Volume</h3>
          </div>
          <div class="text-2xl font-bold mb-1">
            <a 
              href={TOKEN_DATA.dexscreenerUrl}
              target="_blank" 
              class="hover:text-purple-400 transition-colors"
            >
              View Live →
            </a>
          </div>
          <div class="text-sm text-gray-400">
            Real-time trading data
          </div>
        </div>
  
        <!-- Trading -->
        <div class="bg-stone-900/25 rounded-xl p-6 backdrop-blur-md border border-purple-900/20">
          <div class="flex items-center gap-2 mb-4">
            <Coins class="w-6 h-6 text-purple-400" />
            <h3 class="font-semibold">Buy $VIRAL</h3>
          </div>
          <div class="text-2xl font-bold mb-1">
            <a 
              href={TOKEN_DATA.dexscreenerUrl}
              target="_blank"
              class="hover:text-purple-400 transition-colors"
            >
              Trade Now →
            </a>
          </div>
          <div class="text-sm text-gray-400">
            Multiple DEXs Available
          </div>
        </div>
      </div>
  
      <!-- Token Utility Section -->
      <div class="grid md:grid-cols-2 gap-8 mb-16">
        <!-- Training -->
        <div class="bg-stone-900/25 rounded-xl p-8 backdrop-blur-md border border-purple-900/20">
          <h3 class="text-xl font-bold mb-6 flex items-center gap-2">
            <Dumbbell class="w-6 h-6 text-purple-400" />
            Training & Rewards
          </h3>
          <ul class="space-y-4 text-gray-300">
            <li class="flex gap-2">
              <ArrowRight class="w-5 h-5 text-purple-400 flex-shrink-0" />
              <span>Hold $VIRAL to participate in free training races</span>
            </li>
            <li class="flex gap-2">
              <ArrowRight class="w-5 h-5 text-purple-400 flex-shrink-0" />
              <span>Stake tokens for access to high-reward races</span>
            </li>
            <li class="flex gap-2">
              <ArrowRight class="w-5 h-5 text-purple-400 flex-shrink-0" />
              <span>Earn rewards for quality demonstrations</span>
            </li>
          </ul>
        </div>
  
        <!-- Tournaments -->
        <div class="bg-stone-900/25 rounded-xl p-8 backdrop-blur-md border border-purple-900/20">
          <h3 class="text-xl font-bold mb-6 flex items-center gap-2">
            <Trophy class="w-6 h-6 text-purple-400" />
            Tournaments & Inference
          </h3>
          <ul class="space-y-4 text-gray-300">
            <li class="flex gap-2">
              <ArrowRight class="w-5 h-5 text-purple-400 flex-shrink-0" />
              <span>Enter tournaments with prize pools</span>
            </li>
            <li class="flex gap-2">
              <ArrowRight class="w-5 h-5 text-purple-400 flex-shrink-0" />
              <span>Vote on future VM-1 development</span>
            </li>
            <li class="flex gap-2">
              <ArrowRight class="w-5 h-5 text-purple-400 flex-shrink-0" />
              <span>Access VM-1 inference for your AI applications</span>
            </li>
          </ul>
        </div>
      </div>
  
      <!-- Contract Info -->
      <div class="bg-stone-900/25 rounded-xl p-8 backdrop-blur-md text-center max-w-2xl mx-auto mb-16">
        <h3 class="font-semibold mb-4">Contract Address</h3>
        <div class="flex flex-col gap-4">
          <div class="flex items-center justify-center gap-2 bg-black/30 rounded-lg p-4">
            <code class="text-purple-400 font-mono">{TOKEN_DATA.contractAddress}</code>
            <button 
              class="p-2 hover:bg-purple-500/10 rounded-lg transition-colors"
              on:click={copyAddress}
            >
              <Copy class="w-4 h-4 text-purple-400" />
            </button>
          </div>
          <div class="flex justify-center gap-4">
            <a 
              href={`https://solscan.io/token/${TOKEN_DATA.contractAddress}`}
              target="_blank"
              class="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              View on Solscan
              <ExternalLink class="w-4 h-4" />
            </a>
            <a 
              href={TOKEN_DATA.dexscreenerUrl}
              target="_blank"
              class="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Price & Trading
              <ExternalLink class="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  
    <!-- Background effects -->
    <div class="fixed inset-0 bg-gradient-to-b from-purple-900/20 to-black -z-10"></div>
    <div class="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent -z-10"></div>
  </div>