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
  import NotificationSignup from '$lib/components/gym/NotificationSignup.svelte';

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
  }

  interface Category {
    id: string;
    title: string;
    icon: any;
    races: Race[];
  }

  const categories: Category[] = [
    {
      id: 'creative',
      title: 'Creative Chaos',
      icon: Sparkles,
      races: [
        {
          id: 'paint-pro',
          title: 'Paint Master',
          description: 'Advanced artistic challenges with high stakes',
          icon: Palette,
          iconColor: 'text-pink-400',
          bgGradient: 'from-pink-900/30 to-purple-900/30',
          hoverGradient: 'hover:from-pink-900/40 hover:to-purple-900/40',
          prompt: 'Create a detailed digital artwork',
          reward: 500,
          stakeRequired: 100,
          buttonText: 'Join Race'
        },
        {
          id: 'office-pro',
          title: 'Office Pro',
          description: 'Complex spreadsheet and document challenges',
          icon: FileSpreadsheet,
          iconColor: 'text-blue-400',
          bgGradient: 'from-blue-900/30 to-purple-900/30',
          hoverGradient: 'hover:from-blue-900/40 hover:to-purple-900/40',
          prompt: 'Build an advanced financial model',
          reward: 750,
          stakeRequired: 150,
          buttonText: 'Join Race'
        },
        {
          id: 'video-pro',
          title: 'Video Producer',
          description: 'Professional video editing challenges',
          icon: Video,
          iconColor: 'text-red-400',
          bgGradient: 'from-red-900/30 to-purple-900/30',
          hoverGradient: 'hover:from-red-900/40 hover:to-purple-900/40',
          prompt: 'Create a professional video edit',
          reward: 1000,
          stakeRequired: 200,
          buttonText: 'Join Race'
        }
      ]
    },
    {
      id: 'mouse',
      title: 'Mouse Skills',
      icon: MousePointer,
      races: [
        {
          id: 'miniwob-pro',
          title: 'Click Master',
          description: 'Advanced interface navigation challenges',
          icon: MousePointer,
          iconColor: 'text-purple-400',
          bgGradient: 'from-stone-900/30 to-purple-900/30',
          hoverGradient: 'hover:from-stone-900/40 hover:to-purple-900/40',
          prompt: 'Complete complex clicking sequences',
          reward: 600,
          stakeRequired: 120,
          buttonText: 'Join Race'
        },
        {
          id: 'precision-pro',
          title: 'Precision Elite',
          description: 'Ultimate pixel-perfect accuracy tests',
          icon: Crosshair,
          iconColor: 'text-yellow-400',
          bgGradient: 'from-yellow-900/30 to-purple-900/30',
          hoverGradient: 'hover:from-yellow-900/40 hover:to-purple-900/40',
          prompt: 'Hit microscopic targets perfectly',
          reward: 700,
          stakeRequired: 140,
          buttonText: 'Join Race'
        }
      ]
    },
    {
      id: 'slacker',
      title: 'Slacker Skills',
      icon: Coffee,
      races: [
        {
          id: 'trader-pro',
          title: 'Pro Trader',
          description: 'High-stakes market trading simulation',
          icon: TrendingUp,
          iconColor: 'text-emerald-400',
          bgGradient: 'from-emerald-900/30 to-purple-900/30',
          hoverGradient: 'hover:from-emerald-900/40 hover:to-purple-900/40',
          prompt: 'Execute complex trading strategies',
          reward: 1500,
          stakeRequired: 300,
          buttonText: 'Join Race'
        },
        {
          id: 'hedgefund-pro',
          title: 'Hedge Fund Elite',
          description: 'Manage multiple high-stakes portfolios',
          icon: LineChart,
          iconColor: 'text-teal-400',
          bgGradient: 'from-teal-900/30 to-purple-900/30',
          hoverGradient: 'hover:from-teal-900/40 hover:to-purple-900/40',
          prompt: 'Optimize complex investment strategies',
          reward: 2000,
          stakeRequired: 400,
          buttonText: 'Join Race'
        }
      ]
    }
  ];

const wildcardRace: Race = {
    id: 'wildcard-pro',
    title: 'Elite Wildcard Challenge',
    description: 'High-stakes random challenges with bigger rewards',
    icon: Brain,
    iconColor: 'text-purple-400',
    bgGradient: 'from-purple-900/40 via-purple-800/30 to-stone-900/40',
    hoverGradient: 'hover:from-purple-900/50 hover:via-purple-800/40 hover:to-stone-900/50',
    prompt: 'Advanced random task generated by AI',
    reward: 1500,
    stakeRequired: 300,
    buttonText: 'Join Race'
  };

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
      <h1 class="my-6 text-5xl font-bold drop-shadow-lg md:text-7xl">Staked Races</h1>

      <!-- Subtitle -->
      <p class="mb-12 max-w-2xl text-xl text-gray-400 md:text-2xl">
        High-stakes challenges with bigger rewards
      </p>

      <!-- Featured Wildcard Section -->
      <FeaturedRace race={wildcardRace} />

      <!-- Categories -->
      {#each categories as category}
        <CategorySection {category} />
      {/each}

      <!-- Notification Sign Up -->
      <NotificationSignup />
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
