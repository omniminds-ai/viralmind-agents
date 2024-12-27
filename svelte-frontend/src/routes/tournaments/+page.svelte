<script lang="ts">
  import { Trophy, Clock, Users, Coins, ChevronRight, MessageCircle } from 'lucide-svelte';
  import type { PageData } from './$types';

  export let data: PageData;

  // Convert prize to USD display format
  const formatUSD = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Convert SOL amount to display format
  const formatSOL = (amount: number) => {
    return amount.toFixed(2);
  };
</script>

<div class="min-h-screen bg-black pb-32 pt-24 text-white">
  <div class="mx-auto max-w-5xl px-4">
    <!-- Concluded Tournament Header -->
    <div class="my-32 text-center">
      <h1 class="mb-4 text-4xl font-bold md:text-5xl">Tournament Concluded</h1>
      <p class="mb-8 text-gray-400">
        Our latest tournament has concluded. Join our Telegram for updates on the next one!
      </p>

      <a
        href="https://t.me/viralmind"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-3 font-semibold transition-opacity hover:opacity-90"
      >
        <MessageCircle class="mr-2 h-5 w-5" />
        Join Telegram for Updates
      </a>
    </div>

    <!-- Past Tournaments -->
    <div class="space-y-6">
      <h2 class="mb-8 text-2xl font-bold">Past Tournaments</h2>

      {#each data.concludedChallenges as challenge}
        <div class="rounded-2xl bg-stone-900/50 p-6 transition-colors hover:bg-stone-900">
          <a href={`/tournaments/${challenge.name}`}>
            <div class="flex items-start gap-4">
              <!-- Agent PFP -->
              {#if challenge.pfp}
                <img src={challenge.pfp} alt="Agent" class="h-12 w-12 rounded-full bg-black/30" />
              {/if}

              <div class="flex-1">
                <h3 class="mb-2 font-bold">{challenge.title}</h3>
                <p class="mb-4 text-gray-400">{challenge.label}</p>

                <div class="flex flex-wrap items-center gap-4 text-sm">
                  <div class="flex items-center gap-2">
                    <Trophy class="h-4 w-4 text-purple-400" />
                    <span class="text-gray-400">{formatSOL(challenge.prize)} SOL</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <Coins class="h-4 w-4 text-purple-400" />
                    <span class="text-gray-400">{formatUSD(challenge.usdPrize)} Prize Pool</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <Users class="h-4 w-4 text-purple-400" />
                    <span class="text-gray-400">Level: {challenge.level}</span>
                  </div>
                </div>
              </div>

              <span class="text-purple-400 transition-colors hover:text-purple-300">
                <ChevronRight class="h-5 w-5" />
              </span>
            </div>
          </a>
        </div>
      {/each}
    </div>
  </div>
</div>
