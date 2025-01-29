<script lang="ts">
  import { Trophy, Users, Coins, ChevronRight, MessageCircle, Dumbbell } from 'lucide-svelte';
  import type { PageData } from './$types';
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
      <!-- Tournament Section -->
      <div class="mx-auto max-w-6xl px-4 py-24">
        <div class="rounded-3xl bg-gradient-to-r from-purple-900/30 to-blue-900/30 p-12">
          <div class="text-center">
            <h2 class="mb-8 text-4xl font-bold md:text-5xl">Gaming Tournaments</h2>
            <p class="mx-auto mb-12 max-w-2xl text-xl text-gray-300">
              Watch humans compete against AI in exciting live-streamed matches
            </p>

            <!-- Tournament Stats -->
            <div class="mx-auto mb-12 grid max-w-3xl grid-cols-3 gap-8">
              <div class="space-y-2">
                <div class="mb-2 flex justify-center">
                  <MessageCircle class="h-8 w-8 text-purple-400" />
                </div>
                <div class="text-2xl font-bold md:text-3xl">{data?.breakAttempts || 0}</div>
                <div class="text-sm text-gray-400">Total Prompts</div>
              </div>

              <div class="space-y-2">
                <div class="mb-2 flex justify-center">
                  <Trophy class="h-8 w-8 text-purple-400" />
                </div>
                <div class="text-2xl font-bold md:text-3xl">
                  ${data?.treasury?.toFixed(2) || '0.00'}
                </div>
                <div class="text-sm text-gray-400">Prize Pool</div>
              </div>

              <div class="space-y-2">
                <div class="mb-2 flex justify-center">
                  <Coins class="h-8 w-8 text-purple-400" />
                </div>
                <div class="text-2xl font-bold md:text-3xl">
                  ${data?.total_payout?.toFixed(2) || '0.00'}
                </div>
                <div class="text-sm text-gray-400">Total Paid Out</div>
              </div>
            </div>

            <div class="mb-12 rounded-xl bg-black/40 p-8">
              <h3 class="mb-4 text-2xl font-bold text-purple-400">Next Tournament Loading...</h3>
              <p class="mb-6 text-gray-400">Don't miss out on the next chance to win big!</p>
              <ButtonCTA class="mx-auto w-1/4" href="https://t.me/viralmind">
                <MessageCircle class="h-5 w-5" />
                Get Notified
              </ButtonCTA>
            </div>

            <!-- Previous Tournament -->
            {#if data?.concludedChallenges?.[0]}
              <div class="space-y-4">
                <h3 class="text-xl font-bold text-purple-400">
                  {data?.activeChallenge ? 'Previous' : 'Latest'} Tournament
                </h3>

                <div class="mx-auto max-w-3xl rounded-xl bg-black/30 p-6">
                  <div class="mb-4">
                    <h4 class="text-lg font-bold">{data.concludedChallenges[0].title}</h4>
                    <p class="mt-1 text-sm text-gray-400">
                      {data.concludedChallenges[0].label}
                    </p>
                  </div>

                  <div class="mb-6 grid gap-4 md:grid-cols-2">
                    <div class="flex items-center gap-3">
                      <Trophy class="h-5 w-5 text-purple-400" />
                      <div>
                        <div class="text-sm text-gray-400">Winner</div>
                        <div class="font-mono">
                          {data.concludedChallenges[0].winning_address?.slice(0, 5)}...
                          {data.concludedChallenges[0].winning_address?.slice(-4)}
                        </div>
                      </div>
                    </div>

                    <div class="flex items-center gap-3">
                      <Coins class="h-5 w-5 text-purple-400" />
                      <div>
                        <div class="text-sm text-gray-400">Prize</div>
                        <div class="flex items-center gap-2">
                          <span>{data.concludedChallenges[0].prize?.toFixed(2) || '0.00'} SOL</span>
                          <span class="text-gray-400">
                            (${data.concludedChallenges[0].usdPrize?.toFixed(2) || '0.00'})
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="rounded-lg bg-black/30 p-4">
                    <div class="text-xs text-gray-400">Transaction Hash</div>
                    <div class="mt-1 break-all font-mono text-sm">
                      {data.concludedChallenges[0].winning_txn}
                    </div>
                  </div>

                  <div class="mt-4 flex items-center justify-between text-sm">
                    <span class="text-gray-400">
                      Concluded {new Date(data.concludedChallenges[0].expiry).toLocaleDateString(
                        'en-US',
                        {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }
                      )}
                    </span>
                    <a
                      href={`https://solscan.io/tx/${data.concludedChallenges[0].winning_txn}`}
                      target="_blank"
                      class="text-purple-400 hover:text-purple-300"
                    >
                      View on Solscan →
                    </a>
                  </div>
                </div>
              </div>
            {/if}
          </div>
        </div>
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
