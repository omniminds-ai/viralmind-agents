<script lang="ts">
  import { Check, Copy, ExternalLink } from 'lucide-svelte';

  const TOKEN_DATA = {
    contractAddress: 'HW7D5MyYG4Dz2C98axfjVBeLWpsEnofrqy6ZUwqwpump',
    dexscreenerUrl: 'https://dexscreener.com/solana/HW7D5MyYG4Dz2C98axfjVBeLWpsEnofrqy6ZUwqwpump'
  };

  let copied = false;
  function copyAddress() {
    navigator.clipboard.writeText(TOKEN_DATA.contractAddress);
    copied = true;
    setTimeout(() => (copied = false), 1000);
  }
</script>

<h3 class="mb-4 font-semibold">Contract Address</h3>
<div class="flex flex-col gap-4">
  <div class="flex items-center justify-center gap-2 rounded-lg bg-black/30 py-4">
    <code class="truncate font-mono text-purple-400">{TOKEN_DATA.contractAddress}</code>
    <button
      class="rounded-lg p-2 transition-colors hover:bg-purple-500/40 hover:text-purple-200"
      on:click={copyAddress}
    >
      {#if copied}
        <Check class="h-4 w-4 text-purple-400" />
      {:else}
        <Copy class="h-4 w-4 text-purple-400" />
      {/if}
    </button>
  </div>
  <div class="flex justify-center gap-4">
    <a
      href={`https://solscan.io/token/${TOKEN_DATA.contractAddress}`}
      target="_blank"
      class="inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
    >
      View on Solscan
      <ExternalLink class="h-4 w-4" />
    </a>
    <a
      href={TOKEN_DATA.dexscreenerUrl}
      target="_blank"
      class="inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
    >
      Price & Trading
      <ExternalLink class="h-4 w-4" />
    </a>
  </div>
</div>
