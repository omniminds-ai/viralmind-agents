<script lang="ts">
  import { onMount } from 'svelte';
  import {
    Palette,
    Video,
    FileSpreadsheet,
    Globe2,
    MousePointer,
    Sparkles,
    Brain,
    Music,
    Coffee,
    Gamepad,
    Dice5,
    Monitor,
    Gamepad2,
    Crosshair,
    Zap,
    Move,
    TrendingUp,
    LineChart,
    Download
  } from 'lucide-svelte';
  import FeaturedRace from '$lib/components/gym/FeaturedRace.svelte';
  import CategorySection from '$lib/components/gym/CategorySection.svelte';
  import SubmitRace from '$lib/components/gym/SubmitRace.svelte';
  import RaceWarningModal from '$lib/components/gym/RaceWarningModal.svelte';
  import type { Race, Category } from '$lib/types';
  import gymImage from '$lib/assets/gym.png';

  // Icon mapping for each race icon
  const iconMap: Record<string, any> = {
    Palette: Palette,
    FileSpreadsheet: FileSpreadsheet,
    Video: Video,
    Globe2: Globe2,
    MousePointer: MousePointer,
    Crosshair: Crosshair,
    Zap: Zap,
    Move: Move,
    Gamepad: Gamepad,
    Dice5: Dice5,
    TrendingUp: TrendingUp,
    LineChart: LineChart,
    Monitor: Monitor,
    Brain: Brain,
    Music: Music
  };

  // Category metadata
  const categoryMeta: Record<string, { title: string; icon: any }> = {
    creative: {
      title: 'Creative Chaos',
      icon: Sparkles
    },
    mouse: {
      title: 'Mouse Skills',
      icon: MousePointer
    },
    slacker: {
      title: 'Slacker Skills',
      icon: Coffee
    },
    gaming: {
      title: 'Gaming',
      icon: Gamepad2
    }
  };

  let categories: Category[] = [];

  async function fetchRaces() {
    try {
      const response = await fetch('/api/v1/races');
      const result = await response.json();
      const races: Race[] = result.success ? result.data : result;

      // Filter out staked races and group by category
      const freeRaces = races.filter((race) => !race.stakeRequired);
      const groupedRaces: Record<string, Race[]> = freeRaces.reduce(
        (acc: Record<string, Race[]>, race) => {
          if (!acc[race.category]) {
            acc[race.category] = [];
          }
          acc[race.category].push(race);
          return acc;
        },
        {} as Record<string, Race[]>
      );

      // Convert grouped races to categories array
      categories = Object.entries(groupedRaces).map(
        ([id, races]): Category => ({
          id,
          title: categoryMeta[id]?.title || id,
          icon: categoryMeta[id]?.icon || Brain,
          races
        })
      );
    } catch (error) {
      console.error('Error fetching races:', error);
    }
  }

  const wildcardRace: Race = {
    id: 'wildcard',
    title: 'AI Wildcard Challenge',
    description: 'Our AI guides you through random desktop tasks',
    colorScheme: 'purple',
    prompt: 'Random task generated by AI',
    reward: 150,
    buttonText: 'Join Race',
    category: 'wildcard',
    stakeRequired: 0
  };

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

<div class="min-h-screen bg-black pb-24 pt-12 text-white">
  <div class="relative flex min-h-screen flex-col items-start justify-center overflow-hidden">
    <!-- Content Container -->
    <div class="relative z-10 mx-auto w-full max-w-[1400px] px-8">
      <!-- Main Title -->
      <h1 class="my-6 text-5xl font-bold drop-shadow-lg md:text-7xl">Training Gym Classic</h1>

      <!-- Subtitle -->
      <p class="mb-6 max-w-2xl text-xl text-gray-400 md:text-2xl">
        Join our AI assistants in fun desktop challenges and earn $VIRAL tokens
      </p>

      <!-- Notice about reduced support -->
      <div class="mb-12 w-full rounded-lg bg-gradient-to-r from-purple-900/50 to-purple-800/50 p-6 border-2 border-purple-500/50 shadow-lg">
        <div class="flex flex-col md:flex-row items-center gap-6">
          <div class="w-full md:w-1/3">
            <img src={gymImage} alt="Training Gym" class="rounded-lg shadow-md border border-purple-400/30 w-full" />
          </div>
          <div class="w-full md:w-2/3">
            <h3 class="text-xl font-bold text-purple-300 mb-3">⚠️ Important Notice</h3>
            <p class="text-gray-200 mb-3 text-lg">
              The web version of the Training Gym will have <span class="font-semibold text-purple-300">reduced support and rewards</span> as we focus on the second stage of development.
            </p>
            <p class="text-gray-200 mb-4 text-lg">
              For the <span class="font-semibold text-purple-300">best experience and full rewards</span>, please download the desktop version.
            </p>
            <div class="flex flex-wrap gap-3">
              <a href="/download" class="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-500 transition-colors inline-flex items-center gap-1">
                <Download class="h-4 w-4 mr-1" />
                <span>Download for Desktop</span>
              </a>
              <a href="/desktop" class="bg-transparent border border-purple-400 text-purple-300 px-4 py-2 rounded-md hover:bg-purple-900/30 transition-colors inline-flex items-center gap-1">
                <span>Learn More</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Categories -->
      {#each categories as category}
        <CategorySection {category} {iconMap} />
      {/each}

      <!-- Notification Sign Up -->
      <SubmitRace />
    </div>

    <!-- Single modal instance for the entire page -->
    <RaceWarningModal />
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
