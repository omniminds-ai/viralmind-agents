<script lang="ts">
  import { walletStore } from '../walletStore';
  import WalletMultiButton from './solana/WalletMultiButton.svelte';
  import { Connection, PublicKey } from '@solana/web3.js';
  import {
    CheckCircle2,
    XCircle,
    Wallet,
    User,
    Server,
    Coins,
    Fish,
    Icon,
    Clock
  } from 'lucide-svelte';
  import { whale } from '@lucide/lab';

  export let tournamentStarted = false;
  export let startTimeLeft = '';
  export let name = '';

  let minecraftUsername = '';
  let isRevealed = false;
  let tokenBalance: number | null = null;
  let serverIp = '';
  const IP_REQUIRED_BALANCE = 25_000;
  const BYPASS_REQUIRED_BALANCE = 1_000_000;
  const VIRAL_TOKEN = new PublicKey('HW7D5MyYG4Dz2C98axfjVBeLWpsEnofrqy6ZUwqwpump');
  const connection = new Connection(
    'https://snowy-delicate-sponge.solana-mainnet.quiknode.pro/99269d0ad3e8500a9423bbeea089c8caf45a98aa',
    'confirmed'
  );

  async function getTokenBalanceWeb3(connection: Connection, tokenAccount: PublicKey) {
    const info = await connection.getTokenAccountBalance(tokenAccount);
    if (info.value.uiAmount == null) throw new Error('No balance found');
    return info.value.uiAmount;
  }

  async function getTokenBalance() {
    if (!$walletStore.publicKey) return;
    try {
      const filters = [
        { dataSize: 165 },
        {
          memcmp: {
            offset: 32,
            bytes: $walletStore.publicKey.toBase58()
          }
        },
        {
          memcmp: {
            offset: 0,
            bytes: VIRAL_TOKEN.toBase58()
          }
        }
      ];
      const accounts = await connection.getProgramAccounts(
        new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
        { filters }
      );

      if (accounts.length > 0) {
        tokenBalance = await getTokenBalanceWeb3(connection, accounts[0].pubkey);
      } else {
        tokenBalance = 0;
      }
    } catch (error) {
      console.error('Error fetching token balance:', error);
      tokenBalance = 0;
    }
  }

  $: if ($walletStore.connected) {
    getTokenBalance();
  }

  $: hasIpBalance = tokenBalance !== null && tokenBalance >= IP_REQUIRED_BALANCE;
  $: hasBypassBalance = tokenBalance !== null && tokenBalance >= BYPASS_REQUIRED_BALANCE;
  $: canReveal =
    tournamentStarted && $walletStore.connected && minecraftUsername.length > 0 && hasIpBalance;

  async function handleReveal() {
    try {
      if (!$walletStore.signMessage) {
        console.error('Wallet does not support message signing');
        return;
      }

      const message = new TextEncoder().encode(minecraftUsername);
      const signature = await $walletStore.signMessage(message);
      const signatureBase64 = btoa(String.fromCharCode(...signature));

      const response = await fetch('/api/v1/minecraft/reveal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          address: $walletStore.publicKey?.toBase58(),
          username: minecraftUsername,
          signature: signatureBase64,
          challengeName: name
        })
      });

      if (!response.ok) {
        throw new Error('Failed to reveal server IP');
      }

      const resp = await response.json();
      const result = result.success ? resp.data : resp;

      if (result.success && result.game_ip) {
        serverIp = result.game_ip;
        isRevealed = true;
      } else {
        throw new Error('Failed to get server IP');
      }
    } catch (error) {
      console.error('Error revealing server IP:', error);
      // Keep isRevealed false on error
    }
  }
</script>

<div
  class="mx-auto space-y-8 rounded-2xl border border-white/20 bg-black/90 p-8 shadow-2xl backdrop-blur-xl">
  <div class="space-y-2">
    <h3 class="text-2xl font-bold tracking-tight text-white">Join the Server</h3>
    <p class="text-gray-400">Complete the steps below to join the Minecraft server</p>
    {#if !tournamentStarted}
      <div class="mt-2 flex items-center gap-2 text-purple-400">
        <Clock class="h-4 w-4" />
        <span>Server access available when tournament starts in {startTimeLeft}</span>
      </div>
    {/if}
  </div>

  <div class="space-y-6">
    <!-- Step 1: Wallet Connection -->
    <div class="relative space-y-3 pl-8">
      <div class="absolute left-0 top-1">
        {#if $walletStore.connected}
          <CheckCircle2 class="h-5 w-5 text-green-500" />
        {:else}
          <div class="h-5 w-5 rounded-full border-2 border-gray-600" />
        {/if}
      </div>
      <div>
        <div class="flex items-center gap-2 text-white">
          <Wallet class="h-4 w-4" />
          <span class="font-medium">Connect Wallet</span>
        </div>
        <WalletMultiButton />
      </div>
    </div>

    <!-- Step 2: Token Balance -->
    <div class="relative space-y-3 pl-8">
      <div class="absolute left-0 top-1">
        {#if hasIpBalance}
          <CheckCircle2 class="h-5 w-5 text-green-500" />
        {:else}
          <div class="h-5 w-5 rounded-full border-2 border-gray-600" />
        {/if}
      </div>
      <div>
        <div class="flex items-center gap-2 text-white">
          <Coins class="h-4 w-4" />
          <span class="font-medium">$VIRAL Balance Check</span>
        </div>
        <p class="mt-1 text-sm text-gray-400">
          Only holding $VIRAL tokens is required - no purchase necessary
        </p>
        <div class="mt-2 space-y-4">
          <!-- Tier 1: IP Access -->
          <div class="rounded-xl border border-white/10 bg-white/5 p-4">
            <div class="mb-3 flex items-center gap-2">
              <Fish class="h-4 w-4 text-purple-400" />
              <span class="font-medium text-white">Tier 1: Server IP Access</span>
            </div>
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-gray-400">Required Balance:</span>
                <span class="font-medium text-white">
                  {IP_REQUIRED_BALANCE.toLocaleString(undefined, { maximumFractionDigits: 0 })} $VIRAL
                </span>
              </div>
              <div class="text-sm text-gray-500">
                Coordinates randomly offset up to 10,000 blocks, F3 shows obfuscated coordinates
              </div>
            </div>
            {#if tokenBalance !== null}
              <div class="relative mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  class="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                  style="width: {Math.min((tokenBalance / IP_REQUIRED_BALANCE) * 100, 100)}%">
                </div>
              </div>
            {/if}
          </div>

          <!-- Tier 2: Coordinate Bypass -->
          <div class="rounded-xl border border-white/10 bg-white/5 p-4">
            <div class="mb-3 flex items-center gap-2">
              <Icon iconNode={whale} class="h-4 w-4 text-purple-400" />
              <span class="font-medium text-white">Tier 2: Coordinate Bypass</span>
            </div>
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-gray-400">Required Balance:</span>
                <span class="font-medium text-white">
                  {BYPASS_REQUIRED_BALANCE.toLocaleString(undefined, { maximumFractionDigits: 0 })} $VIRAL
                </span>
              </div>
              <div class="text-sm text-gray-500">Permission: coordinateoffset.bypass</div>
              <div class="text-sm text-gray-500">
                No coordinate offset, F3 shows your true coordinates
              </div>
            </div>
            {#if tokenBalance !== null}
              <div class="relative mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  class="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                  style="width: {Math.min((tokenBalance / BYPASS_REQUIRED_BALANCE) * 100, 100)}%">
                </div>
              </div>
            {/if}
          </div>

          <div class="flex items-center justify-between px-4">
            <span class="text-gray-400">Your Balance:</span>
            <span class="font-medium text-white">
              {tokenBalance?.toLocaleString(undefined, { maximumFractionDigits: 0 }) ?? '...'} $VIRAL
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 3: Minecraft Username -->
    <div class="relative space-y-3 pl-8">
      <div class="absolute left-0 top-1">
        {#if minecraftUsername.length > 0}
          <CheckCircle2 class="h-5 w-5 text-green-500" />
        {:else}
          <div class="h-5 w-5 rounded-full border-2 border-gray-600" />
        {/if}
      </div>
      <div>
        <div class="flex items-center gap-2 text-white">
          <User class="h-4 w-4" />
          <span class="font-medium">Enter Minecraft Username</span>
        </div>
        <input
          type="text"
          bind:value={minecraftUsername}
          disabled={isRevealed}
          class="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white placeholder:text-gray-500 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Your Minecraft username" />
      </div>
    </div>

    {#if !isRevealed}
      <!-- Reveal Button -->
      <button
        on:click={handleReveal}
        disabled={!canReveal}
        class="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-3 font-medium text-white transition-all duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
        <Server class="h-4 w-4" />
        {#if !tournamentStarted}
          Server IP Available When Tournament Starts
        {:else}
          Reveal Server IP
        {/if}
      </button>
    {:else}
      <!-- Server Info with Tiers -->
      <div class="space-y-4">
        <div
          class="rounded-xl border border-white/10 bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-6">
          <div class="flex items-center justify-center gap-3">
            <Server class="h-5 w-5 text-purple-400" />
            <p class="text-white">
              Join <span class="font-mono font-medium text-purple-400">{serverIp}</span>
              as
              <span class="font-medium text-purple-400">{minecraftUsername}</span>
            </p>
          </div>
        </div>

        {#if hasBypassBalance}
          <div
            class="rounded-xl border border-white/10 bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-6">
            <div class="flex items-center justify-center gap-3">
              <Icon icon={whale} class="h-5 w-5 text-purple-400" />
              <p class="text-white">
                Coordinate Bypass <span class="font-medium text-purple-400">Unlocked!</span>
              </p>
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>
