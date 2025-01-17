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
          id: 'paint',
          title: 'Paint Buddy',
          description: 'Let our AI guide your artistic adventures',
          icon: Palette,
          iconColor: 'text-pink-400',
          bgGradient: 'from-pink-900/30 to-purple-900/30',
          hoverGradient: 'hover:from-pink-900/40 hover:to-purple-900/40',
          prompt: 'Draw a cute cartoon character in MS Paint',
          reward: 50,
          buttonText: 'Join Race'
        },
        {
          id: 'office',
          title: 'Office Helper',
          description: 'Follow along with Excel and document tasks',
          icon: FileSpreadsheet,
          iconColor: 'text-blue-400',
          bgGradient: 'from-blue-900/30 to-purple-900/30',
          hoverGradient: 'hover:from-blue-900/40 hover:to-purple-900/40',
          prompt: 'Create a budget spreadsheet in Excel',
          reward: 75,
          buttonText: 'Join Race'
        },
        {
          id: 'video',
          title: 'Video Buddy',
          description: 'Create videos together with our AI',
          icon: Video,
          iconColor: 'text-red-400',
          bgGradient: 'from-red-900/30 to-purple-900/30',
          hoverGradient: 'hover:from-red-900/40 hover:to-purple-900/40',
          prompt: 'Edit a short video clip with transitions',
          reward: 100,
          buttonText: 'Join Race'
        },
        {
          id: 'web',
          title: 'Web Helper',
          description: 'Team up with AI for web tasks',
          icon: Globe2,
          iconColor: 'text-green-400',
          bgGradient: 'from-green-900/30 to-purple-900/30',
          hoverGradient: 'hover:from-green-900/40 hover:to-purple-900/40',
          prompt: 'Style a simple webpage with CSS',
          reward: 80,
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
          id: 'miniwob',
          title: 'Click Along',
          description: 'Follow our AI through fun interface tasks',
          icon: MousePointer,
          iconColor: 'text-purple-400',
          bgGradient: 'from-stone-900/30 to-purple-900/30',
          hoverGradient: 'hover:from-stone-900/40 hover:to-purple-900/40',
          prompt: 'Complete a series of clicking challenges',
          reward: 60,
          buttonText: 'Join Race'
        },
        {
          id: 'precision',
          title: 'Precision Master',
          description: 'Test your accuracy with pixel-perfect challenges',
          icon: Crosshair,
          iconColor: 'text-yellow-400',
          bgGradient: 'from-yellow-900/30 to-purple-900/30',
          hoverGradient: 'hover:from-yellow-900/40 hover:to-purple-900/40',
          prompt: 'Click tiny targets with perfect accuracy',
          reward: 70,
          buttonText: 'Join Race'
        },
        {
          id: 'speed',
          title: 'Speed Demon',
          description: 'Race against time with rapid-fire clicking',
          icon: Zap,
          iconColor: 'text-orange-400',
          bgGradient: 'from-orange-900/30 to-purple-900/30',
          hoverGradient: 'hover:from-orange-900/40 hover:to-purple-900/40',
          prompt: 'Click targets as fast as possible',
          reward: 65,
          buttonText: 'Join Race'
        },
        {
          id: 'drag',
          title: 'Drag Master',
          description: 'Perfect your drag and drop skills',
          icon: Move,
          iconColor: 'text-cyan-400',
          bgGradient: 'from-cyan-900/30 to-purple-900/30',
          hoverGradient: 'hover:from-cyan-900/40 hover:to-purple-900/40',
          prompt: 'Drag and drop with precision',
          reward: 75,
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
          id: 'webgames',
          title: 'Web Gamer',
          description: 'Master browser games without getting caught',
          icon: Gamepad,
          iconColor: 'text-indigo-400',
          bgGradient: 'from-indigo-900/30 to-purple-900/30',
          hoverGradient: 'hover:from-indigo-900/40 hover:to-purple-900/40',
          prompt: 'Play games while looking productive',
          reward: 90,
          buttonText: 'Join Race'
        },
        {
          id: 'gambler',
          title: 'The Gambler',
          description: 'Risk it all for higher rewards',
          icon: Dice5,
          iconColor: 'text-rose-400',
          bgGradient: 'from-rose-900/30 to-purple-900/30',
          hoverGradient: 'hover:from-rose-900/40 hover:to-purple-900/40',
          prompt: 'Double or nothing challenges',
          reward: 200,
          buttonText: 'Join Race'
        },
        {
          id: 'trader',
          title: 'Day Trader',
          description: 'Trade stocks while pretending to work',
          icon: TrendingUp,
          iconColor: 'text-emerald-400',
          bgGradient: 'from-emerald-900/30 to-purple-900/30',
          hoverGradient: 'hover:from-emerald-900/40 hover:to-purple-900/40',
          prompt: 'Make profitable trades without getting caught',
          reward: 150,
          buttonText: 'Join Race'
        },
        {
          id: 'hedgefund',
          title: 'Hedge Fund Manager',
          description: 'Analyze charts and make big moves',
          icon: LineChart,
          iconColor: 'text-teal-400',
          bgGradient: 'from-teal-900/30 to-purple-900/30',
          hoverGradient: 'hover:from-teal-900/40 hover:to-purple-900/40',
          prompt: 'Manage multiple trading windows efficiently',
          reward: 175,
          buttonText: 'Join Race'
        }
      ]
    },
    // {
    //   id: 'gaming',
    //   title: 'Gaming',
    //   icon: Gamepad2,
    //   races: [
    //     {
    //       id: 'desktop',
    //       title: 'Desktop Gaming',
    //       description: 'Coming soon: Play games with our desktop app',
    //       icon: Monitor,
    //       iconColor: 'text-purple-400',
    //       bgGradient: 'from-purple-900/30 to-stone-900/30',
    //       hoverGradient: 'hover:from-purple-900/40 hover:to-stone-900/40',
    //       buttonText: 'Coming Soon'
    //     }
    //   ]
    // }
  ];

const wildcardRace: Race = {
    id: 'wildcard',
    title: 'AI Wildcard Challenge',
    description: 'Our AI guides you through random desktop tasks',
    icon: Brain,
    iconColor: 'text-purple-400',
    bgGradient: 'from-purple-900/40 via-purple-800/30 to-stone-900/40',
    hoverGradient: 'hover:from-purple-900/50 hover:via-purple-800/40 hover:to-stone-900/50',
    prompt: 'Random task generated by AI',
    reward: 150,
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
      <h1 class="my-6 text-5xl font-bold drop-shadow-lg md:text-7xl">Free Races</h1>

      <!-- Subtitle -->
      <p class="mb-12 max-w-2xl text-xl text-gray-400 md:text-2xl">
        Join our AI assistants in fun desktop challenges
      </p>

      <!-- Featured Wildcard Section -->
      <FeaturedRace race={wildcardRace} />

      <!-- Categories -->
      {#each categories as category}
        <CategorySection {category} />
      {/each}

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
