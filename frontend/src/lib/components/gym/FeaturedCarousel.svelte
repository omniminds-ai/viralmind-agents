<script lang="ts">
  import { ArrowRight, ArrowLeft, Brain, Book, ChevronRight, ChevronLast, ChevronLeft } from 'lucide-svelte';
  import { onMount } from 'svelte';

  const slides = [
    {
      id: 'train-agent',
      title: 'Train Your Own Agent',
      description: "Convert your gameplay into state-of-the-art LAMs: 4-step guide to building better agents",
      icon: Book,
      iconColor: 'text-emerald-400',
      iconBgColor: 'bg-emerald-600/30',
      bgGradient: 'from-emerald-900/40 via-emerald-800/30 to-stone-900/40',
      hoverGradient: 'hover:from-emerald-900/50 hover:via-emerald-800/40 hover:to-stone-900/50',
      buttonText: 'Read Guide',
      href: 'https://viralmind.gitbook.io/viralmind.ai/train-your-own-agentic-lams'
    },
    {
      id: 'vm1',
      title: 'Introducing VM-1',
      description: "Your demonstrations are training the ChatGPT of gaming and work automation. Ask it to do your homework, play games with you, or assist with Blender - VM-1 will be your ultimate desktop companion.",
      icon: Brain,
      iconColor: 'text-purple-400',
      iconBgColor: 'bg-purple-600/30',
      bgGradient: 'from-purple-900/40 via-purple-800/30 to-stone-900/40',
      hoverGradient: 'hover:from-purple-900/50 hover:via-purple-800/40 hover:to-stone-900/50',
      buttonText: 'Learn More',
      href: 'https://viralmind.gitbook.io/viralmind.ai/vm-1-the-future-of-large-action-models'
    }
  ];

  let currentSlide = 0;

  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
  }

  function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
  }

  let autoplayInterval: NodeJS.Timeout;
  let isPaused = false;

  onMount(() => {
    startAutoplay();
    return () => clearInterval(autoplayInterval);
  });

  function startAutoplay() {
    clearInterval(autoplayInterval);
    if (!isPaused) {
      autoplayInterval = setInterval(nextSlide, 8000);
    }
  }

  function pauseAutoplay() {
    isPaused = true;
    clearInterval(autoplayInterval);
  }

  function resumeAutoplay() {
    isPaused = false;
    startAutoplay();
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="mb-16 relative group" on:mouseenter={pauseAutoplay} on:mouseleave={resumeAutoplay}>
  <div class="relative h-[480px]">
    {#each slides as slide, i}
      <div 
        class="absolute w-full h-full rounded-3xl bg-gradient-to-br {slide.bgGradient} p-12 backdrop-blur-sm {slide.hoverGradient} transition-all duration-700 ease-in-out overflow-hidden flex items-center"
        style="opacity: {i === currentSlide ? 1 : 0}; transform: scale({i === currentSlide ? 1 : 0.98}) translateX({(i - currentSlide) * 100}%); pointer-events: {i === currentSlide ? 'auto' : 'none'}"
      >
        <div class="absolute right-0 top-0 -translate-y-1/4 translate-x-1/4 opacity-10">
          <svelte:component this={slide.icon} class="h-80 w-80 {slide.iconColor}" />
        </div>
        <div class="relative flex flex-col items-start gap-8 w-full">
          <div class="rounded-2xl {slide.iconBgColor} p-6">
            <svelte:component this={slide.icon} class="h-16 w-16 {slide.iconColor}" />
          </div>
          <div>
            <h3 class="mb-4 text-6xl font-bold tracking-tight">{slide.title}</h3>
            <p class="text-2xl text-gray-300 font-light">{slide.description}</p>
          </div>
          <a 
            href={slide.href} 
            class="group relative inline-flex items-center gap-2 rounded-lg bg-white/10 px-6 py-3 font-medium text-white transition-all hover:bg-white/15 w-full max-w-xl"
            target={slide.href.startsWith('http') ? '_blank' : undefined}
          >
            <span class="flex items-center gap-2">
              {slide.buttonText}
              <ArrowRight class="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </span>
          </a>
        </div>
      </div>
    {/each}

    <!-- Navigation Buttons -->
    <button 
      class="absolute left-4 top-1/2 -translate-y-1 -translate-x-1/4 opacity-0 group-hover:opacity-30 transition-opacity duration-300 text-white hover:text-white"
      on:click={prevSlide}
    >
      <ChevronLeft class="h-12 w-12" />
    </button>
    <button 
      class="absolute right-4 top-1/2 -translate-y-1 translate-x-1/4 opacity-0 group-hover:opacity-30 transition-opacity duration-300 text-white hover:text-white"
      on:click={nextSlide}
    >
      <ChevronRight class="h-12 w-12" />
    </button>

    <!-- Dots -->
    <div class="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
      {#each slides as _, i}
        <button 
          class="h-1.5 transition-all duration-300 rounded-full {i === currentSlide ? 'w-6 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/75'}"
          on:click={() => currentSlide = i}
        />
      {/each}
    </div>
  </div>
</div>
