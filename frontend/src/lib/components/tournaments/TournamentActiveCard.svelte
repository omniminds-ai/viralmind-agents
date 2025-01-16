<script lang="ts">
  import type { Challenge } from '$lib/types';
  import { Coins, Dumbbell, MessageCircle, Trophy } from 'lucide-svelte';

  import ButtonCTA from '../ButtonCTA.svelte';

  const { challenge }: { challenge: Challenge } = $props();
</script>

<div class="mb-8 rounded-xl bg-gradient-to-r from-purple-900/50 to-blue-900/50 p-6">
  <div class="space-y-4">
    <h4
      class="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-center text-xl font-bold text-transparent"
    >
      Tournament {challenge.status === 'upcoming' ? 'Starting Soon!' : 'Live Now!'}
    </h4>

    <p class="text-gray-300">
      {challenge.status === 'upcoming'
        ? 'Get ready for the next big tournament!'
        : 'Join the action and compete for the prize pool!'}
    </p>

    <div class="flex flex-col items-center gap-4 md:flex-row">
      <!-- Challenge Image -->
      <div class="h-32 w-32 overflow-hidden rounded-lg">
        <img src={challenge.image} alt="Challenge" class="h-full w-full object-cover" />
      </div>

      <!-- Challenge Info -->
      <div class="flex-1 space-y-3">
        <h5 class="text-center text-lg font-semibold text-white md:text-left">
          {challenge.title}
        </h5>

        <div class="grid grid-cols-2 gap-4">
          <div class="flex items-center gap-2">
            <Dumbbell class="h-4 w-4 text-purple-400" />
            <span class="text-gray-300">
              <span class="hidden md:inline">Level:</span>
              {challenge.level}
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
              {challenge.entryFee} SOL
            </span>
          </div>

          <div class="flex items-center gap-2">
            <Trophy class="h-4 w-4 text-purple-400" />
            <span class="text-gray-300">
              <span class="hidden md:inline">Prize:</span>
              {challenge.prize} SOL
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-4 flex justify-center">
      <ButtonCTA href={`/tournaments/${challenge.name}`}>
        <Trophy class="h-5 w-5 group-hover:animate-bounce" />
        Join Tournament
        <span class="text-white transition-transform duration-200 group-hover:translate-x-1">→</span
        >
      </ButtonCTA>
    </div>
  </div>
</div>
