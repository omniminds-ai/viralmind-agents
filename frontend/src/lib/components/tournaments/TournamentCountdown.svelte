<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Trophy } from 'lucide-svelte';

  export let start_date: string;
  export let title: string = '';
  export let prize: number = 0;
  export let name: string = '';

  let timeLeft = '';
  let interval: ReturnType<typeof setInterval>;

  function calculateTimeLeft() {
    const start = new Date(start_date).getTime();
    const now = new Date().getTime();
    const distance = start - now;

    if (distance < 0) {
      timeLeft = 'Tournament Started!';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    timeLeft = `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }

  onMount(() => {
    calculateTimeLeft();
    interval = setInterval(calculateTimeLeft, 1000);
  });

  onDestroy(() => {
    if (interval) clearInterval(interval);
  });
</script>

{#if name}
  <a href="/tournaments/{name}" class="block">
    <div class="cursor-pointer rounded-3xl bg-gradient-to-r from-purple-900/50 to-blue-900/50 p-8 text-center">
      <div class="space-y-6">
        <div class="flex items-center justify-center gap-2">
          <Trophy class="h-6 w-6 text-purple-400" />
          <h3 class="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-2xl font-bold text-transparent">
            Next Tournament
          </h3>
        </div>
        
        {#if title}
          <h4 class="text-xl font-semibold text-white">{title}</h4>
        {/if}

        <div class="text-4xl font-bold text-purple-400">
          {timeLeft}
        </div>

        {#if prize > 0}
          <div class="text-lg text-gray-300">
            Prize Pool: {prize.toFixed(2)} SOL
          </div>
        {/if}
      </div>
    </div>
  </a>
{:else}
  <div class="rounded-3xl bg-gradient-to-r from-purple-900/50 to-blue-900/50 p-8 text-center">
    <div class="space-y-6">
      <div class="flex items-center justify-center gap-2">
        <Trophy class="h-6 w-6 text-purple-400" />
        <h3 class="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-2xl font-bold text-transparent">
          Next Tournament
        </h3>
      </div>
      
      {#if title}
        <h4 class="text-xl font-semibold text-white">{title}</h4>
      {/if}

      <div class="text-4xl font-bold text-purple-400">
        {timeLeft}
      </div>

      {#if prize > 0}
        <div class="text-lg text-gray-300">
          Prize Pool: {prize.toFixed(2)} SOL
        </div>
      {/if}
    </div>
  </div>
{/if}
