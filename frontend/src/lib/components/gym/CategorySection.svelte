<script lang="ts">
  import { ArrowRight, Brain } from 'lucide-svelte';
  import RaceCard from './RaceCard.svelte';
  import type { Category } from '$lib/types';

  export let category: Category;
  export let iconMap: Record<string, any>;
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
      <RaceCard {race} icon={iconMap[race.icon || 'Brain'] || Brain} />
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
