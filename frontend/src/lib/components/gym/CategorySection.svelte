<script lang="ts">
  import { ArrowRight } from 'lucide-svelte';
  import RaceCard from './RaceCard.svelte';

  export let category: {
    id: string;
    title: string;
    icon: any;
    races: Array<{
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
    }>;
  };
</script>

<div class="mb-16">
  <div class="mb-6 flex items-center justify-between">
    <h2 class="flex items-center gap-3 text-3xl font-bold text-purple-400">
      <svelte:component this={category.icon} class="h-8 w-8" />
      {category.title}
    </h2>
    <button class="text-purple-400 hover:text-purple-300 transition-colors">
      See all
      <ArrowRight class="ml-1 inline-block h-4 w-4" />
    </button>
  </div>
  
  <div class="flex space-x-6 overflow-x-auto pb-4 hide-scrollbar">
    {#each category.races as race}
      <RaceCard {race} />
    {/each}
  </div>
</div>

<style>
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>
