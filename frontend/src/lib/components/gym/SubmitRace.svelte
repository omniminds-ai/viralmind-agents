<script lang="ts">
  import { ArrowRight, Sparkles } from 'lucide-svelte';
  let raceIdea = '';
  let isSubmitting = false;
  let submitStatus: 'idle' | 'success' | 'error' = 'idle';

  async function handleSubmit() {
    if (!raceIdea.trim()) return;
    
    isSubmitting = true;
    submitStatus = 'idle';
    
    try {
      const response = await fetch('/api/races/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raceIdea })
      });
      
      if (!response.ok) throw new Error('Submission failed');
      
      submitStatus = 'success';
      raceIdea = ''; // Clear the input
    } catch (error) {
      console.error('Error submitting feedback:', error);
      submitStatus = 'error';
    } finally {
      isSubmitting = false;
    }
  }
</script>

<div class="mx-auto max-w-2xl rounded-3xl bg-stone-900/25 p-8 backdrop-blur-sm md:p-12">
  <div class="mb-6 text-center">
    <div class="flex items-center justify-center gap-3 mb-3">
      <Sparkles class="h-6 w-6 text-purple-400" />
      <h3 class="text-xl font-semibold">Submit Your Race Idea</h3>
    </div>
    <p class="text-gray-400">If we accept your idea, we'll create a race that trains AI to accomplish your task!</p>
  </div>

  <form on:submit|preventDefault={handleSubmit} class="flex flex-col gap-4">
    <textarea
      bind:value={raceIdea}
      disabled={isSubmitting}
      placeholder="Describe your dream AI assistant... What would you train it to do?"
      class="w-full h-32 rounded-lg bg-white/10 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
    ></textarea>
    
    {#if submitStatus === 'success'}
      <p class="text-green-400 text-sm text-center">Thanks for your submission!</p>
    {/if}
    
    {#if submitStatus === 'error'}
      <p class="text-red-400 text-sm text-center">Something went wrong. Please try again.</p>
    {/if}
    
    <button
      type="submit"
      disabled={isSubmitting || !raceIdea.trim()}
      class="group inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-6 py-3 font-medium text-white transition-all hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {#if isSubmitting}
        Submitting...
      {:else}
        Submit Race Idea
        <ArrowRight class="h-5 w-5 transition-transform group-hover:translate-x-1" />
      {/if}
    </button>
  </form>
</div>