<script lang="ts">
  import { onMount } from 'svelte';
  import { Trophy, Timer, MessagesSquare, ArrowRight, BellRing } from 'lucide-svelte';
  import ButtonCTA from '$lib/components/ButtonCTA.svelte';

  let mousePosition = { x: 0, y: 0 };

  function handleMouseMove(event: MouseEvent) {
    mousePosition.x = (event.clientX / window.innerWidth) * 100;
    mousePosition.y = (event.clientY / window.innerHeight) * 100;
  }

  onMount(() => {
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  });
</script>

<div class="min-h-screen bg-black pb-24 text-white">
  <div class="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
    <!-- Content Container -->
    <div class="relative z-10 mx-auto w-full max-w-4xl px-4 text-center">
      <!-- Coming Soon Badge -->
      <div class="mb-8 inline-block rounded-full bg-purple-600/20 px-4 py-2 text-purple-400">
        <div class="flex items-center gap-2">
          <Timer class="h-4 w-4" />
          <span>Coming Soon</span>
        </div>
      </div>

      <!-- Main Title -->
      <h1 class="mb-6 text-5xl font-bold drop-shadow-lg md:text-7xl">Free Races</h1>

      <!-- Subtitle -->
      <p class="mx-auto mb-12 max-w-2xl text-xl text-gray-400 md:text-2xl">
        No staking required, pure reward potential.
      </p>

      <!-- Feature Cards -->
      <div class="mb-12">
        <!-- Free Races -->
        <div class="rounded-2xl bg-stone-900/25 p-8 text-left text-center backdrop-blur-sm">
          <div class="mb-4 flex flex-col items-center gap-3">
            <div class="rounded-xl bg-purple-600/20 p-3">
              <Trophy class="h-6 w-6 text-purple-400" />
            </div>
            <h3 class="text-xl font-semibold">Join races by simply holding $VIRAL.</h3>
          </div>
          <a href="https://viralmind.gitbook.io/viralmind.ai/training-gym/free-races">
            <div
              class="group flex cursor-pointer items-center justify-center text-center text-purple-400"
            >
              <span class="mr-2">Learn more</span>
              <ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </a>
        </div>
      </div>

      <!-- Notification Sign Up -->
      <div class="mx-auto max-w-2xl rounded-3xl bg-stone-900/25 p-8 backdrop-blur-sm md:p-12">
        <div class="mb-6 flex items-center justify-center gap-3">
          <BellRing class="h-6 w-6 text-purple-400" />
          <h3 class="text-xl font-semibold">Get Notified When We Launch</h3>
        </div>

        <div class="flex justify-center">
          <ButtonCTA href="https://t.me/viralmind" target="_blank">
            <MessagesSquare class="h-5 w-5" />
            Join Our Telegram
          </ButtonCTA>
        </div>
      </div>
    </div>
  </div>

  <!-- Background effects -->
  <div class="absolute inset-0 z-[1] bg-gradient-to-b from-purple-900/20 to-black"></div>
  <div
    class="absolute inset-0 z-[2] transition-transform duration-1000 ease-out"
    style="background: radial-gradient(600px circle at {mousePosition.x}% {mousePosition.y}%, rgb(147, 51, 234, 0.1), transparent 100%); 
            transform: translate({(mousePosition.x - 50) * -0.05}px, {(mousePosition.y - 50) *
      -0.05}px)"
  ></div>
  <div class="absolute inset-0 z-[3] bg-gradient-to-b from-black via-transparent to-black"></div>
</div>

<style>
  :global(body) {
    background-color: black;
  }

  /* Add a subtle text shadow to all text elements */
  :global(.text-white),
  :global(.text-gray-400),
  :global(.text-purple-400) {
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }
</style>
