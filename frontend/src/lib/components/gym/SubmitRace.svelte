<script lang="ts">
  import { ArrowRight, Sparkles } from 'lucide-svelte';
  let raceIdea = '';
</script>

<div class="mx-auto max-w-2xl rounded-3xl bg-stone-900/25 p-8 backdrop-blur-sm md:p-12">
  <div class="mb-6 text-center">
    <div class="flex items-center justify-center gap-3 mb-3">
      <Sparkles class="h-6 w-6 text-purple-400" />
      <h3 class="text-xl font-semibold">Submit Your Race Idea</h3>
    </div>
    <p class="text-gray-400">If we accept your idea, we'll create a race that trains AI to accomplish your task!</p>
  </div>

  <div class="flex flex-col gap-4">
    <textarea
      bind:value={raceIdea}
      placeholder="Describe your dream AI assistant... What would you train it to do?"
      class="w-full h-32 rounded-lg bg-white/10 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
    ></textarea>
    <button class="group inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-6 py-3 font-medium text-white transition-all hover:bg-purple-500">
      Submit Race Idea
      <ArrowRight class="h-5 w-5 transition-transform group-hover:translate-x-1" />
    </button>
  </div>
</div>
