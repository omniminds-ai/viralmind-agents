<script lang="ts">
  import { Trophy, Users, Coins, ChevronRight, MessageCircle, Dumbbell } from 'lucide-svelte';
  import type { PageData } from './$types';
  import TournamentActiveCard from '$lib/components/tournaments/TournamentActiveCard.svelte';
  import ButtonCTA from '$lib/components/ButtonCTA.svelte';

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

<div class="min-h-screen bg-black pb-32 pt-6 text-white md:pt-12">
  <div class="mx-auto max-w-5xl px-4">
    {#if data.activeChallenge}
      <div class="my-16 text-center">
        <h1
          class="mb-4 bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-4xl font-bold text-transparent md:text-5xl"
        >
          Tournament {data.activeChallenge.status === 'upcoming' ? 'Starting Soon!' : 'Live Now!'}
        </h1>

        <div class="flex flex-col items-center gap-4">
          <!-- Challenge Image -->
          <div class="h-24 w-24 overflow-hidden rounded-lg">
            <img
              src={data.activeChallenge.image}
              alt="Challenge"
              class="h-full w-full object-cover"
            />
          </div>

          <!-- Challenge Info -->
          <div class="flex-1 space-y-3">
            <h5 class="text-center text-lg font-semibold text-white md:text-left">
              {data.activeChallenge.title}
            </h5>

            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center gap-2">
                <Dumbbell class="h-4 w-4 text-purple-400" />
                <span class="text-gray-300">
                  <span class="hidden md:inline">Level:</span>
                  {data.activeChallenge.level}
                </span>
              </div>

              <div class="flex items-center gap-2">
                <MessageCircle class="h-4 w-4 text-purple-400" />
                <span class="text-gray-300">
                  <span class="hidden md:inline">Messages:</span>
                  <!--{challenge.breakAttempts}-->
                </span>
              </div>

              <div class="flex items-center gap-2">
                <Coins class="h-4 w-4 text-purple-400" />
                <span class="text-gray-300">
                  <span class="hidden md:inline">Entry:</span>
                  {data.activeChallenge.entryFee} SOL
                </span>
              </div>

              <div class="flex items-center gap-2">
                <Trophy class="h-4 w-4 text-purple-400" />
                <span class="text-gray-300">
                  <span class="hidden md:inline">Prize:</span>
                  {data.activeChallenge.prize} SOL
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-4 flex justify-center">
          <ButtonCTA href={`/tournaments/${data.activeChallenge.name}`}>
            <Trophy class="h-5 w-5 group-hover:animate-bounce" />
            Join Tournament
            <span class="text-white transition-transform duration-200 group-hover:translate-x-1"
              >→</span
            >
          </ButtonCTA>
        </div>
      </div>
    {:else}
      <!-- Concluded Tournament Header -->
      <div class="my-16 text-center">
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
    {/if}

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
                    <span class="text-gray-400">{formatSOL(challenge.prize || 0)} SOL</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <Coins class="h-4 w-4 text-purple-400" />
                    <span class="text-gray-400"
                      >{formatUSD(challenge.usdPrize || 0)} Prize Pool</span
                    >
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
