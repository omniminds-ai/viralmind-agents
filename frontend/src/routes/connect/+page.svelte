<script lang="ts">
  import { onMount } from 'svelte';
  import { walletStore } from '$lib/walletStore';
  import { Coins } from 'lucide-svelte';
  
  let token = '';
  let connecting = false;
  
  onMount(() => {
    // Get token from URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    token = urlParams.get('token') || '';
  });

  async function connectWallet() {
    try {
      connecting = true;

      // Use the wallet store to connect
      if (!$walletStore.wallets.length) {
        alert('No Solana wallets found. Please install Phantom wallet.');
        return;
      }

      // Select and connect to Phantom wallet
      const phantomWallet = $walletStore.wallets.find(w => w.adapter.name === 'Phantom');
      if (!phantomWallet) {
        alert('Phantom wallet not found. Please install Phantom wallet.');
        return;
      }

      $walletStore.select(phantomWallet.adapter.name);
      await $walletStore.connect();

      if (!$walletStore.publicKey) {
        throw new Error('Failed to connect wallet');
      }

      // Send address to backend
      await fetch('/api/forge/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token,
          address: $walletStore.publicKey.toString()
        })
      });

      // Close window after successful connection
      window.close();
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      alert('Failed to connect wallet: ' + message);
    } finally {
      connecting = false;
    }
  }
</script>

<div class="flex flex-col items-center justify-center min-h-screen bg-black">
  <div class="p-8 rounded-2xl border border-white/20 bg-black/90 backdrop-blur-xl shadow-2xl max-w-md w-full mx-4">
    <div class="text-center mb-8">
      <div class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20">
        <Coins class="h-8 w-8 text-gray-400" />
      </div>
      <h1 class="text-2xl font-bold mb-2 text-white">Connect Your Wallet</h1>
      <p class="text-gray-400">Connect your Phantom wallet to continue using ViralMind Desktop</p>
    </div>

    {#if !token}
      <div class="text-red-400 text-center mb-4 p-4 rounded-lg bg-red-500/10">
        Error: No connection token provided
      </div>
    {:else}
      <button
        on:click={connectWallet}
        disabled={connecting}
        class="w-full px-6 py-3 text-white font-medium bg-gradient-to-r from-purple-500 to-blue-500 rounded-full hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {#if connecting}
          <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          Connecting...
        {:else}
          Connect Phantom Wallet
        {/if}
      </button>

      <a
        href="https://phantom.app/download"
        target="_blank"
        rel="noopener noreferrer"
        class="mt-4 text-center block text-sm text-gray-400 hover:text-white transition-colors"
      >
        Don't have Phantom wallet? Click here to install
      </a>
    {/if}
  </div>
</div>
