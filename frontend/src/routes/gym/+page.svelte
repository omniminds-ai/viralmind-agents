<script lang="ts">
  import { onMount } from 'svelte';
  import { 
    Trophy, Timer, MessagesSquare, ArrowRight, BellRing, 
    Brain, DollarSign, Sparkles, Gamepad2, Book,
    Palette, Video, FileSpreadsheet, Globe2, MousePointer,
    Coffee, Dice5, Monitor, Crosshair, Zap, Move, TrendingUp, LineChart
  } from 'lucide-svelte';
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
    stakeRequired?: number;
    href?: string;
  }

  interface Category {
    id: string;
    title: string;
    icon: any;
    races: Race[];
  }

  const categories: Category[] = [
    {
      id: 'free',
      title: 'Free Races',
      icon: Gamepad2,
      races: [
        {
          id: 'creative-races',
          title: 'Creative Challenges',
          description: 'Train AI to assist with art, video editing, and web design',
          icon: Palette,
          iconColor: 'text-pink-400',
          bgGradient: 'from-pink-900/30 to-purple-900/30',
          hoverGradient: 'hover:from-pink-900/40 hover:to-purple-900/40',
          reward: 50,
          buttonText: 'Join Race',
          href: '/gym/free-races'
        },
        {
          id: 'productivity-races',
          title: 'Office Skills',
          description: 'Master spreadsheets, documents, and productivity tools',
          icon: FileSpreadsheet,
          iconColor: 'text-blue-400',
          bgGradient: 'from-blue-900/30 to-purple-900/30',
          hoverGradient: 'hover:from-blue-900/40 hover:to-purple-900/40',
          reward: 75,
          buttonText: 'Join Race',
          href: '/gym/free-races'
        },
        {
          id: 'mouse-races',
          title: 'Mouse Mastery',
          description: 'Perfect your clicking, dragging, and precision skills',
          icon: MousePointer,
          iconColor: 'text-purple-400',
          bgGradient: 'from-purple-900/30 to-stone-900/30',
          hoverGradient: 'hover:from-purple-900/40 hover:to-stone-900/40',
          reward: 60,
          buttonText: 'Join Race',
          href: '/gym/free-races'
        }
      ]
    },
    {
      id: 'staked',
      title: 'Staked Races',
      icon: Sparkles,
      races: [
        {
          id: 'pro-creative',
          title: 'Creative Pro League',
          description: 'High-stakes creative challenges with bigger rewards',
          icon: Palette,
          iconColor: 'text-pink-400',
          bgGradient: 'from-pink-900/30 to-purple-900/30',
          hoverGradient: 'hover:from-pink-900/40 hover:to-purple-900/40',
          reward: 500,
          stakeRequired: 100,
          buttonText: 'Join Race',
          href: '/gym/staked-races'
        },
        {
          id: 'pro-trading',
          title: 'Trading League',
          description: 'Master market analysis and trading strategies',
          icon: TrendingUp,
          iconColor: 'text-emerald-400',
          bgGradient: 'from-emerald-900/30 to-purple-900/30',
          hoverGradient: 'hover:from-emerald-900/40 hover:to-purple-900/40',
          reward: 1500,
          stakeRequired: 300,
          buttonText: 'Join Race',
          href: '/gym/staked-races'
        },
        {
          id: 'pro-mouse',
          title: 'Elite Mouse League',
          description: 'Ultimate precision and speed challenges',
          icon: Crosshair,
          iconColor: 'text-yellow-400',
          bgGradient: 'from-yellow-900/30 to-purple-900/30',
          hoverGradient: 'hover:from-yellow-900/40 hover:to-purple-900/40',
          reward: 700,
          stakeRequired: 140,
          buttonText: 'Join Race',
          href: '/gym/staked-races'
        }
      ]
    }
  ];

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
  <div class="relative flex min-h-screen flex-col items-start justify-center overflow-hidden">
    <!-- Content Container -->
    <div class="relative z-10 mx-auto w-full max-w-[1400px] px-8">
      <!-- Main Title -->
      <h1 class="my-6 text-5xl font-bold drop-shadow-lg md:text-7xl">Training Gym</h1>

      <!-- Subtitle -->
      <p class="mb-12 max-w-2xl text-xl text-gray-400 md:text-2xl">
        Train AI agents through desktop challenges or learn to train your own
      </p>

      <!-- Featured Carousel -->
      <FeaturedCarousel />

      <!-- Categories -->
      {#each categories as category}
        <CategorySection {category} />
      {/each}

      <!-- Submit Race Idea -->
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
