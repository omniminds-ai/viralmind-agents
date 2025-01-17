<script lang="ts">
  import { ArrowRight, TicketSlash, Trophy } from 'lucide-svelte';

  export let race: {
    id: string;
    title: string;
    description: string;
    icon: any;
    iconColor: string;
    bgGradient: string;
    hoverGradient: string;
    prompt?: string;
    reward?: number;
    buttonText: string;
    stakeRequired?: number;
    href?: string;
  };
</script>

<div class="mb-16">
  <div class="relative rounded-3xl bg-gradient-to-br {race.bgGradient} p-12 backdrop-blur-sm {race.hoverGradient} transition-all overflow-hidden">
    <div class="absolute right-0 top-0 -translate-y-1/4 translate-x-1/4 opacity-10">
      <svelte:component this={race.icon} class="h-80 w-80 {race.iconColor}" />
    </div>
    <div class="relative flex flex-col items-start gap-8">
      <div class="rounded-2xl bg-purple-600/30 p-6">
        <svelte:component this={race.icon} class="h-16 w-16 {race.iconColor}" />
      </div>
      <div>
        <h3 class="mb-4 text-6xl font-bold tracking-tight">{race.title}</h3>
        <p class="text-2xl text-gray-300 font-light">{race.description}</p>
      </div>
      <a href={race.href || '/gym/race'} class="group relative inline-flex items-center justify-between rounded-lg bg-white/10 px-6 py-3 font-medium text-white transition-all hover:bg-white/15 w-full max-w-xl" target={race.href?.startsWith('http') ? '_blank' : undefined}>
        <span class="flex items-center gap-2">
          {race.buttonText}
          <ArrowRight class="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </span>
        <div class="flex items-center gap-4 text-lg text-purple-400/80">
          {#if race.stakeRequired}
            <span class="flex items-center gap-2">
              <TicketSlash class="h-4 w-4" />
              {race.stakeRequired}
            </span>
          {/if}
          {#if race.reward}
            <span class="flex items-center gap-2">
              <Trophy class="h-4 w-4" />
              {race.reward}
            </span>
          {/if}
        </div>
      </a>
    </div>
  </div>
</div>
