<script lang="ts">
  import { Trophy, Clock, Users, Coins, ChevronRight, MessageCircle  } from 'lucide-svelte';
  import latestFrame from '$lib/assets/tournaments/viral_lua/latest.jpg';
  
  // dynamically load PFPs if they exist
  const getPfpUrl = (id: string) => {
    try {
      return new URL(`/src/lib/assets/agents/${id}/pfp.jpg`, import.meta.url).href;
    } catch {
      return ''; // Return empty or a default PFP if not found
    }
  };

  const activeTournament = null; /* {
    id: 'viral_lua',
    title: 'Learn Lua Tournament',
    description: 'Command VM-1 to learn and practice Lua programming basics',
    prizePool: 5000,
    participants: 12,
    timeLeft: '2d 4h', 
    status: 'active'
  };*/

  const pastTournaments = [
    {
      id: 'social_master',
      agent: 'lua',
      title: 'Social Media Master',
      description: 'Manage social media accounts and engage with content',
      prizePool: 3500,
      participants: 24,
      winner: '0x1234...5678',
      completedDate: '2024-02-15'
    },
    {
      id: 'trade_dex',
      agent: 'lua',
      title: 'DEX Trading Pro',
      description: 'Execute trading strategies across multiple DEXs',
      prizePool: 4200,
      participants: 18,
      winner: '0x8765...4321',
      completedDate: '2024-02-01'
    }
  ];
</script>

<div class="min-h-screen bg-black pb-32 pt-24 text-white">
  <div class="mx-auto max-w-5xl px-4">
    <!-- Active Tournament -->
    {#if activeTournament}
        <!-- Header -->
        <div class="mb-16 text-center">
        <h1 class="mb-4 text-4xl font-bold md:text-5xl">Active Tournament</h1>
        <p class="text-gray-400">Command VM-1 step by step, win the entire pot</p>
        </div>

      <div class="mb-20 rounded-3xl bg-stone-900 p-8 shadow-xl md:p-12">
        <!-- Live Frame Display -->
        <div class="mb-8 overflow-hidden rounded-xl border border-white/10">
          <img
            src={latestFrame} 
            alt="Live Tournament Screen"
            class="w-full"
          />
          <!-- Optional: Live indicator -->
          <div
            class="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/75 px-3 py-1"
          >
            <div class="h-2 w-2 animate-pulse rounded-full bg-red-500"></div>
            <span class="text-sm font-medium">LIVE</span>
          </div>
        </div>

        <div class="grid gap-8 md:grid-cols-2">
          <div>
            <h2 class="mb-4 text-2xl font-bold md:text-3xl">{activeTournament.title}</h2>
            <p class="mb-6 text-gray-400">{activeTournament.description}</p>

            <div class="mb-8 grid grid-cols-3 gap-4">
              <div class="rounded-xl bg-black/30 p-4 text-center">
                <Coins class="mx-auto mb-2 h-5 w-5 text-purple-400" />
                <div class="font-bold">${activeTournament.prizePool}</div>
                <div class="text-xs text-gray-400">Prize Pool</div>
              </div>

              <div class="rounded-xl bg-black/30 p-4 text-center">
                <Users class="mx-auto mb-2 h-5 w-5 text-purple-400" />
                <div class="font-bold">{activeTournament.participants}</div>
                <div class="text-xs text-gray-400">Participants</div>
              </div>

              <div class="rounded-xl bg-black/30 p-4 text-center">
                <Clock class="mx-auto mb-2 h-5 w-5 text-purple-400" />
                <div class="font-bold">{activeTournament.timeLeft}</div>
                <div class="text-xs text-gray-400">Time Left</div>
              </div>
            </div>

            <a
              href={`/tournament/${activeTournament.id}`}
              class="inline-flex w-full items-center justify-center rounded-full bg-purple-600 px-8 py-3 font-semibold transition-colors hover:bg-purple-700"
            >
              Enter Tournament →
            </a>
          </div>

          <div class="rounded-2xl bg-black/30 p-6">
            <h3 class="mb-4 font-semibold">Recent Commands</h3>
            <div class="space-y-2 text-sm text-gray-400">
              <div class="rounded-lg bg-black/30 p-2">"Open the Lua interpreter"</div>
              <div class="rounded-lg bg-black/30 p-2">"Type 'print(\"Hello World\")'"</div>
              <div class="rounded-lg bg-black/30 p-2">"Press Enter to run the code"</div>
            </div>
          </div>
        </div>
      </div>
    {:else}
    <!-- Concluded Tournament Header -->
    <div class="text-center my-32">
        <h1 class="text-4xl md:text-5xl font-bold mb-4">Tournament Concluded</h1>
        <p class="text-gray-400 mb-8">Our latest tournament has concluded. Join our Telegram for updates on the next one!</p>
        
        <a 
          href="https://t.me/viralmind" 
          target="_blank"
          class="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full font-semibold hover:opacity-90 transition-opacity"
        >
          <MessageCircle class="w-5 h-5 mr-2" />
          Join Telegram for Updates
        </a>
      </div>
    {/if}

    <!-- Past Tournaments -->
    <div class="space-y-6">
      <h2 class="mb-8 text-2xl font-bold">Past Tournaments</h2>

      {#each pastTournaments as tournament}
        <div class="rounded-2xl bg-stone-900/50 p-6 transition-colors hover:bg-stone-900">
          <div class="flex items-start gap-4">
            <!-- Agent PFP -->
            {#if getPfpUrl(tournament.agent)}
            <img 
                src={getPfpUrl(tournament.agent)} 
                alt="Agent" 
                class="w-12 h-12 rounded-full bg-black/30"
            />
            {/if}

            <div class="flex-1">
              <h3 class="mb-2 font-bold">{tournament.title}</h3>
              <!-- Last frame from tournament -->
              <!-- <div class="mb-4 overflow-hidden rounded-lg border border-white/10">
                <img
                  src="/tournaments/{tournament.id}/latest.jpg"
                  alt="Tournament Result"
                  class="w-full"
                />
              </div> -->

              <div class="flex items-center gap-4 text-sm">
                <div class="flex items-center gap-2">
                  <Trophy class="h-4 w-4 text-purple-400" />
                  <span class="text-gray-400">Winner: {tournament.winner}</span>
                </div>
                <div class="flex items-center gap-2">
                  <Coins class="h-4 w-4 text-purple-400" />
                  <span class="text-gray-400">${tournament.prizePool} Prize Pool</span>
                </div>
              </div>
            </div>

            <a
              href={`/tournament/${tournament.id}`}
              class="text-purple-400 transition-colors hover:text-purple-300"
            >
              <ChevronRight class="h-5 w-5" />
            </a>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>
