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

<div class="group relative min-w-[300px] h-[360px] rounded-3xl bg-gradient-to-br {race.bgGradient} p-8 backdrop-blur-sm {race.hoverGradient} transition-all overflow-hidden">
  <div class="absolute right-0 top-0 -translate-y-1/4 translate-x-1/4 opacity-5">
    <svelte:component this={race.icon} class="h-48 w-48 {race.iconColor}" />
  </div>
  <div class="relative h-full flex flex-col justify-end gap-4">
    <div class="rounded-xl bg-opacity-20 p-4" style="background-color: {race.iconColor.replace('text-', 'rgb(var(--')}).replace('-400', '))')}">
      <svelte:component this={race.icon} class="h-10 w-10 {race.iconColor}" />
    </div>
      <div class="text-left">
        <h3 class="mb-2 text-2xl font-bold tracking-tight">{race.title}</h3>
        <p class="text-gray-300 font-light">{race.description}</p>
      </div>
      <div class="flex flex-col gap-2">
    <a href={race.href || '/gym/race'} class="group relative inline-flex items-center justify-between rounded-lg bg-white/10 px-5 py-2.5 font-medium text-white transition-all hover:bg-white/15" target={race.href?.startsWith('http') ? '_blank' : undefined}>
          <span class="flex items-center gap-2">
            {race.buttonText}
            <ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
          <div class="flex items-center ml-2 gap-2 text-sm text-purple-400/80">
            {#if race.stakeRequired}
              <span class="flex items-center gap-1">
                <TicketSlash class="h-3 w-3" />
                {race.stakeRequired}
              </span>
            {/if}
            {#if race.reward}
              <span class="flex items-center gap-1">
                <Trophy class="h-3 w-3" />
                {race.reward}
              </span>
            {/if}
          </div>
        </a>
      </div>
  </div>
</div>
