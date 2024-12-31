<script lang="ts">
  import { walletStore } from '../walletStore';
  import WalletMultiButton from './solana/WalletMultiButton.svelte';
  import { Connection, PublicKey } from "@solana/web3.js";
  import { CheckCircle2, XCircle, Wallet, User, Server, Coins, Fish, Icon, Clock } from 'lucide-svelte';
  import { whale } from '@lucide/lab';

  export let tournamentStarted = false;
  export let startTimeLeft = '';

  let minecraftUsername = '';
  let isRevealed = false;
  let tokenBalance: number | null = null;
  const IP_REQUIRED_BALANCE = 25_000;
  const BYPASS_REQUIRED_BALANCE = 1_000_000;
  const VIRAL_TOKEN = new PublicKey("HW7D5MyYG4Dz2C98axfjVBeLWpsEnofrqy6ZUwqwpump");
  const connection = new Connection("https://snowy-delicate-sponge.solana-mainnet.quiknode.pro/99269d0ad3e8500a9423bbeea089c8caf45a98aa", "confirmed");

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
        new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
        { filters }
      );
      
      if (accounts.length > 0) {
        tokenBalance = await getTokenBalanceWeb3(connection, accounts[0].pubkey);
      } else {
        tokenBalance = 0;
      }
    } catch (error) {
      console.error("Error fetching token balance:", error);
      tokenBalance = 0;
    }
  }

  $: if ($walletStore.connected) {
    getTokenBalance();
  }

  $: hasIpBalance = tokenBalance !== null && tokenBalance >= IP_REQUIRED_BALANCE;
  $: hasBypassBalance = tokenBalance !== null && tokenBalance >= BYPASS_REQUIRED_BALANCE;
  $: canReveal = tournamentStarted && $walletStore.connected && minecraftUsername.length > 0 && hasIpBalance;

  function handleReveal() {
    isRevealed = true;
  }
</script>

<div class="mx-auto p-8 space-y-8 bg-black/90 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl">
  <div class="space-y-2">
    <h3 class="text-2xl font-bold text-white tracking-tight">Join the Server</h3>
    <p class="text-gray-400">Complete the steps below to join the Minecraft server</p>
    {#if !tournamentStarted}
      <div class="mt-2 flex items-center gap-2 text-purple-400">
        <Clock class="w-4 h-4" />
        <span>Server access available when tournament starts in {startTimeLeft}</span>
      </div>
    {/if}
  </div>

  <div class="space-y-6">
    <!-- Step 1: Wallet Connection -->
    <div class="relative pl-8 space-y-3">
      <div class="absolute left-0 top-1">
        {#if $walletStore.connected}
          <CheckCircle2 class="w-5 h-5 text-green-500" />
        {:else}
          <div class="w-5 h-5 rounded-full border-2 border-gray-600" />
        {/if}
      </div>
      <div>
        <div class="flex items-center gap-2 text-white">
          <Wallet class="w-4 h-4" />
          <span class="font-medium">Connect Wallet</span>
        </div>
        <WalletMultiButton />
      </div>
    </div>

    <!-- Step 2: Token Balance -->
    <div class="relative pl-8 space-y-3">
      <div class="absolute left-0 top-1">
        {#if hasIpBalance}
          <CheckCircle2 class="w-5 h-5 text-green-500" />
        {:else}
          <div class="w-5 h-5 rounded-full border-2 border-gray-600" />
        {/if}
      </div>
      <div>
        <div class="flex items-center gap-2 text-white">
          <Coins class="w-4 h-4" />
          <span class="font-medium">$VIRAL Balance Check</span>
        </div>
        <p class="mt-1 text-sm text-gray-400">Only holding $VIRAL tokens is required - no purchase necessary</p>
        <div class="mt-2 space-y-4">
          <!-- Tier 1: IP Access -->
          <div class="p-4 bg-white/5 rounded-xl border border-white/10">
            <div class="flex items-center gap-2 mb-3">
              <Fish class="w-4 h-4 text-purple-400" />
              <span class="text-white font-medium">Tier 1: Server IP Access</span>
            </div>
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-gray-400">Required Balance:</span>
                <span class="text-white font-medium">{IP_REQUIRED_BALANCE.toLocaleString(undefined, { maximumFractionDigits: 0 })} $VIRAL</span>
              </div>
              <div class="text-sm text-gray-500">Coordinates randomly offset up to 10,000 blocks</div>
            </div>
            {#if tokenBalance !== null}
              <div class="relative h-2 mt-3 bg-white/10 rounded-full overflow-hidden">
                <div 
                  class="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                  style="width: {Math.min((tokenBalance / IP_REQUIRED_BALANCE) * 100, 100)}%"
                ></div>
              </div>
            {/if}
          </div>

          <!-- Tier 2: Coordinate Bypass -->
          <div class="p-4 bg-white/5 rounded-xl border border-white/10">
            <div class="flex items-center gap-2 mb-3">
              <Icon iconNode={whale} class="w-4 h-4 text-purple-400" />
              <span class="text-white font-medium">Tier 2: Coordinate Bypass</span>
            </div>
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-gray-400">Required Balance:</span>
                <span class="text-white font-medium">{BYPASS_REQUIRED_BALANCE.toLocaleString(undefined, { maximumFractionDigits: 0 })} $VIRAL</span>
              </div>
              <div class="text-sm text-gray-500">Permission: coordinateoffset.bypass</div>
              <div class="text-sm text-gray-500">No coordinate offset</div>
            </div>
            {#if tokenBalance !== null}
              <div class="relative h-2 mt-3 bg-white/10 rounded-full overflow-hidden">
                <div 
                  class="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                  style="width: {Math.min((tokenBalance / BYPASS_REQUIRED_BALANCE) * 100, 100)}%"
                ></div>
              </div>
            {/if}
          </div>

          <div class="flex items-center justify-between px-4">
            <span class="text-gray-400">Your Balance:</span>
            <span class="text-white font-medium">{tokenBalance?.toLocaleString(undefined, { maximumFractionDigits: 0 }) ?? '...'} $VIRAL</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 3: Minecraft Username -->
    <div class="relative pl-8 space-y-3">
      <div class="absolute left-0 top-1">
        {#if minecraftUsername.length > 0}
          <CheckCircle2 class="w-5 h-5 text-green-500" />
        {:else}
          <div class="w-5 h-5 rounded-full border-2 border-gray-600" />
        {/if}
      </div>
      <div>
        <div class="flex items-center gap-2 text-white">
          <User class="w-4 h-4" />
          <span class="font-medium">Enter Minecraft Username</span>
        </div>
        <input
          type="text"
          bind:value={minecraftUsername}
          disabled={isRevealed}
          class="mt-2 w-full px-4 py-2 bg-white/5 text-white rounded-xl border border-white/10 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-gray-500"
          placeholder="Your Minecraft username"
        />
      </div>
    </div>

    {#if !isRevealed}
      <!-- Reveal Button -->
      <button
        on:click={handleReveal}
        disabled={!canReveal}
        class="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:opacity-90 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <Server class="w-4 h-4" />
        {#if !tournamentStarted}
          Server IP Available When Tournament Starts
        {:else}
          Reveal Server IP
        {/if}
      </button>
    {:else}
      <!-- Server Info with Tiers -->
      <div class="space-y-4">
        <div class="p-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl border border-white/10">
          <div class="flex items-center justify-center gap-3">
            <Server class="w-5 h-5 text-purple-400" />
            <p class="text-white">Join <span class="font-mono font-medium text-purple-400">mc-1.viralmind.ai</span> as <span class="font-medium text-purple-400">{minecraftUsername}</span></p>
          </div>
        </div>
        
        {#if hasBypassBalance}
          <div class="p-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl border border-white/10">
            <div class="flex items-center justify-center gap-3">
              <Icon icon={whale} class="w-5 h-5 text-purple-400" />
              <p class="text-white">Coordinate Bypass <span class="font-medium text-purple-400">Unlocked!</span></p>
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>
