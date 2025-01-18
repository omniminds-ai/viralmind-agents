<script lang="ts">
  import { onMount } from 'svelte';
  import { 
    Trophy, Timer, MessagesSquare, ArrowRight, BellRing, 
    Palette, Video, Layout, FileSpreadsheet, Globe2, 
    MousePointer, Sparkles, Brain, DollarSign,
    Coffee, Gamepad, Dice5, Monitor, Gamepad2,
    Crosshair, Zap, Move, TrendingUp, LineChart
  } from 'lucide-svelte';
  import FeaturedRace from '$lib/components/gym/FeaturedRace.svelte';
  import CategorySection from '$lib/components/gym/CategorySection.svelte';
  import SubmitRace from '$lib/components/gym/SubmitRace.svelte';
  import FeaturedCarousel from '$lib/components/gym/FeaturedCarousel.svelte';

  interface Race {
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
    category: string;
    isStaked: boolean;
    href?: string;
  }

  // Icon mapping for each race ID
  const iconMap: Record<string, any> = {
    'paint': Palette,
    'office': FileSpreadsheet,
    'video': Video,
    'web': Globe2,
    'miniwob': MousePointer,
    'precision': Crosshair,
    'speed': Zap,
    'drag': Move,
    'webgames': Gamepad,
    'gambler': Dice5,
    'trader': TrendingUp,
    'hedgefund': LineChart,
    'desktop': Monitor,
    'wildcard': Brain,
    'paint-pro': Palette,
    'office-pro': FileSpreadsheet,
    'video-pro': Video,
    'web-pro': Globe2,
    'miniwob-pro': MousePointer,
    'precision-pro': Crosshair,
    'speed-pro': Zap,
    'drag-pro': Move,
    'webgames-pro': Gamepad,
    'gambler-pro': Dice5,
    'trader-pro': TrendingUp,
    'hedgefund-pro': LineChart,
    'desktop-pro': Monitor,
    'wildcard-pro': Brain
  };

  let featuredRaces: Race[] = [];
  
  async function fetchRaces() {
    try {
      const response = await fetch('/api/races');
      const races: Race[] = await response.json();
      
      // Get a mix of free and staked races for featuring
      featuredRaces = races
        .filter(race => race.id === 'wildcard' || (race.reward && race.reward >= 100)) // Only high reward races
        .map(race => ({
          ...race,
          icon: iconMap[race.id] || Brain
        }))
        .slice(0, 3); // Show top 3 races
    } catch (error) {
      console.error('Error fetching races:', error);
    }
  }

  let mousePosition = { x: 0, y: 0 };

  function handleMouseMove(event: MouseEvent) {
    mousePosition.x = (event.clientX / window.innerWidth) * 100;
    mousePosition.y = (event.clientY / window.innerHeight) * 100;
  }

  onMount(() => {
    window.addEventListener('mousemove', handleMouseMove);
    fetchRaces();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  });
</script>

<div class="min-h-screen bg-black pb-24 text-white">
  <div class="relative flex min-h-screen flex-col items-start justify-center overflow-hidden">
    <!-- Content Container -->
    <div class="relative z-10 mx-auto w-full max-w-[1400px] px-8">
      <!-- Main Title -->
      <h1 class="my-6 text-5xl font-bold drop-shadow-lg md:text-7xl">Training Gym</h1>

      <!-- Subtitle -->
      <p class="mb-12 max-w-2xl text-xl text-gray-400 md:text-2xl">
        Train with AI assistants and earn rewards
      </p>

      <!-- Featured Carousel -->
      <FeaturedCarousel />
      
      <!-- Featured Races -->
      <div class="mb-16">
        <h2 class="mb-8 text-3xl font-bold text-purple-400">Featured Races</h2>
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {#each featuredRaces as race}
            <FeaturedRace {race} />
          {/each}
        </div>
      </div>

      <!-- Race Categories -->
      <div class="mb-16">
        <h2 class="mb-8 text-3xl font-bold text-purple-400">Race Categories</h2>
        <div class="grid gap-6 md:grid-cols-2">
          <a href="/gym/free-races" class="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900/30 to-stone-900/30 p-8 hover:from-purple-900/40 hover:to-stone-900/40">
            <div class="flex items-center gap-4">
              <div class="rounded-xl bg-purple-400/20 p-4">
                <Trophy class="h-8 w-8 text-purple-400" />
              </div>
              <div>
                <h3 class="text-2xl font-bold">Free Races</h3>
                <p class="text-gray-300">Train AI and earn rewards</p>
              </div>
            </div>
          </a>
          <a href="/gym/staked-races" class="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900/30 to-stone-900/30 p-8 hover:from-purple-900/40 hover:to-stone-900/40">
            <div class="flex items-center gap-4">
              <div class="rounded-xl bg-purple-400/20 p-4">
                <DollarSign class="h-8 w-8 text-purple-400" />
              </div>
              <div>
                <h3 class="text-2xl font-bold">Staked Races</h3>
                <p class="text-gray-300">High stakes, high rewards</p>
              </div>
            </div>
          </a>
        </div>
      </div>

      <!-- Notification Sign Up -->
      <SubmitRace />
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
