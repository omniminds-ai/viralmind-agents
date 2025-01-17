<script lang="ts">
  import { Trophy, Users, Clock } from 'lucide-svelte';
  import { marked } from 'marked';

  export let challenge: any;
  export let prize: number;
  export let breakAttempts: number;
  export let startTimeLeft: string = '';

  const formatSOL = (amount: number) => amount.toFixed(3);
  
  $: parsedWinCondition = challenge.win_condition ? marked(challenge.win_condition) : '';
  $: parsedLabel = challenge.label ? marked(challenge.label) : '';
</script>

<div class="space-y-6">
  <!-- Title and Stats -->
  <div class="flex items-start gap-4">
    <img src={challenge.pfp} alt={challenge.name} class="h-16 w-16 rounded-full" />
    <div class="flex-1">
      <h1 class="mb-1 text-2xl font-bold">{challenge.title}</h1>
      <div class="text-gray-400 prose prose-invert prose-sm max-w-none">
        {@html parsedLabel}
      </div>
      <div class="mt-4 flex flex-wrap gap-6">
        <div class="flex items-center gap-2">
          <Trophy class="h-5 w-5 text-purple-400" />
          <span>{formatSOL(prize)} SOL</span>
        </div>
        <div class="flex items-center gap-2">
          <Users class="h-5 w-5 text-purple-400" />
          <span>{breakAttempts} prompts</span>
        </div>
        {#if startTimeLeft}
          <div class="flex items-center gap-2">
            <Clock class="h-5 w-5 text-purple-400" />
            <span>Starts in {startTimeLeft}</span>
          </div>
        {/if}
      </div>
    </div>
  </div>

  <!-- Rules -->
  {#if challenge.win_condition}
    <div class="rounded-2xl bg-stone-900/50 p-6">
      <h2 class="mb-3 text-lg font-semibold">How to Win</h2>
      <div class="text-gray-400 prose prose-invert prose-sm max-w-none">
        {@html parsedWinCondition}
      </div>
    </div>
  {/if}

  <!-- Leaderboard -->
  {#if challenge.scores?.length > 0}
    <div class="rounded-2xl bg-stone-900/50 p-6">
      <h2 class="mb-4 flex items-center gap-2 text-lg font-semibold">
        <Trophy class="h-5 w-5" />
        Leaderboard
      </h2>
      <div class="space-y-2">
        {#each challenge.scores.slice(0, 5) as score, i}
          <div class="flex items-center justify-between rounded-xl bg-black/30 p-3">
            <div class="flex items-center gap-3">
              <span class="text-lg font-bold text-purple-400">#{i + 1}</span>
              <span class="font-mono">{score.account.slice(0, 4)}...{score.account.slice(-4)}</span>
            </div>
            <span class="font-semibold">{Math.floor(score.score).toLocaleString()} pts</span>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>
