<script lang="ts">
  import { ArrowRight, TicketSlash, Trophy, Brain } from 'lucide-svelte';
  import type { Race } from '$lib/types';
  import { colorSchemes } from '$lib/types';

  export let race: Race;
  export let icon: any = Brain;

  let scheme: typeof colorSchemes[keyof typeof colorSchemes];
  $: {
    const schemeKeys = Object.keys(colorSchemes) as (keyof typeof colorSchemes)[];
    const randomScheme = schemeKeys[Math.floor(Math.random() * schemeKeys.length)];
    scheme = colorSchemes[race.colorScheme || randomScheme];
  }
</script>

<div class="mb-16 h-full">
  <div class="relative h-full rounded-3xl {scheme.bg} p-12 backdrop-blur-sm transition-all overflow-hidden flex flex-col {scheme.hover}">
    <div class="absolute right-0 top-0 -translate-y-1/4 translate-x-1/4 opacity-10">
      <svelte:component this={icon} class="h-80 w-80 {scheme.icon}" />
    </div>
    <div class="relative flex flex-col items-start gap-8 flex-1">
      <div class="rounded-2xl bg-opacity-20 p-6" style="background-color: {scheme.iconBg}">
        <svelte:component this={icon} class="h-16 w-16 {scheme.icon}" />
      </div>
      <div>
        <h3 class="mb-4 text-6xl font-bold tracking-tight">{race.title}</h3>
        <p class="text-2xl text-gray-300 font-light">{race.description}</p>
      </div>
      <a href={race.href || `/gym/race?id=${race.id}`} class="group relative inline-flex items-center justify-between rounded-lg bg-white/10 px-6 py-3 font-medium text-white transition-all hover:bg-white/15 w-full max-w-xl" target={race.href?.startsWith('http') ? '_blank' : undefined}>
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
