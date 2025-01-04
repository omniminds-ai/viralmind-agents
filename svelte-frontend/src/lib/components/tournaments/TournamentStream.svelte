<script lang="ts">
  import { Trophy, Users, Circle, Dumbbell } from 'lucide-svelte';
  import solIcon from '$lib/assets/solIcon.png';
  import type { Challenge } from '$lib/types';

  export let challenge: Challenge;
  export let prize: number;
  export let breakAttempts: number;
  export let streamUrl: string;

  const formatSOL = (amount: number) => amount.toFixed(3);
</script>

<div class="rounded-3xl bg-gradient-to-r from-purple-900/50 to-blue-900/50 p-6">
  <!-- Live indicator and title -->
  <div class="mb-4 flex items-center justify-between">
    <div class="flex items-center gap-2">
      <div class="h-12 w-12 overflow-hidden rounded-lg">
        <img src={challenge.image} alt="Challenge" class="h-full w-full object-cover" />
      </div>
      <h3 class="text-xl font-bold text-white">{challenge.title}</h3>
    </div>
    <div class="flex items-center gap-2">
      <Circle class="h-3 w-3 animate-pulse fill-red-500 text-red-500" />
      <span class="text-sm font-semibold text-red-400">LIVE</span>
    </div>
  </div>

  <!-- Stream container with 16:9 aspect ratio -->
  <div class="relative mb-4 w-full overflow-hidden rounded-xl bg-black pt-[56.25%]">
    <iframe
      title="Tournament Stream"
      src={streamUrl}
      class="absolute inset-0 h-full w-full"
      frameborder="0"
      allowfullscreen
    ></iframe>
  </div>

  <!-- Tournament Stats -->
  <div class="grid grid-cols-3 gap-4 text-center">
    <div class="space-y-2">
      <div class="mb-2 flex justify-center">
        <Trophy class="h-6 w-6 text-purple-400" />
      </div>
      <div class="flex items-center justify-center gap-2">
        <img src={solIcon} alt="SOL" class="h-4 w-4" />
        <span class="text-lg font-bold">{formatSOL(prize)}</span>
      </div>
      <div class="text-sm text-gray-400">prize pool</div>
    </div>

    <div class="space-y-2">
      <div class="mb-2 flex justify-center">
        <Users class="h-6 w-6 text-purple-400" />
      </div>
      <div class="text-lg font-bold">{breakAttempts}</div>
      <div class="text-sm text-gray-400">attempts</div>
    </div>

    {#if challenge.scores && challenge.scores.length > 0}
      <div class="space-y-2">
        <div class="mb-2 flex justify-center">
          <Trophy class="h-6 w-6 text-purple-400" />
        </div>
        <div class="text-lg font-bold">
          {Math.floor(challenge.scores[0].score).toLocaleString()}
        </div>
        <div class="text-sm text-gray-400">high score</div>
      </div>
    {:else}
      <div class="space-y-2">
        <div class="mb-2 flex justify-center">
          <Dumbbell class="h-6 w-6 text-purple-400" />
        </div>
        <div class="text-lg font-bold">{challenge.level}</div>
        <div class="text-sm text-gray-400">level</div>
      </div>
    {/if}
  </div>
</div>
