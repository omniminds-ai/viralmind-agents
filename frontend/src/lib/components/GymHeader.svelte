<script lang="ts">
  import logo from '$lib/assets/logoTransparent.png';
  import { Dumbbell, ChevronLeft, BellRing, Trophy, History } from 'lucide-svelte';
  import WalletMultiButton from '$lib/components/solana/WalletMultiButton.svelte';
  import { onMount } from 'svelte';

  let isScrolled = false;
  let mounted = false;

  onMount(() => {
    const handleScroll = () => {
      isScrolled = window.scrollY > 20;
    };

    window.addEventListener('scroll', handleScroll);
    mounted = true;

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  });
</script>

<div class="fixed left-0 right-0 top-0 z-50 transition-all duration-300 border-b border-purple-500/30 shadow-[-4px_0_20px_rgba(149,117,205,0.1)]">
  <!-- Blurred background that shows on scroll -->
  <div
    class="absolute inset-0 border-b border-white/10 bg-black/50 backdrop-blur-lg transition-opacity duration-300"
    class:opacity-0={!isScrolled}
    class:opacity-100={isScrolled}
  ></div>

  <div class="relative z-10 mx-auto max-w-7xl px-6">
    <div class="flex h-16 items-center justify-between">
      <!-- Left side with back button and title -->
      <div class="flex items-center space-x-6">
        <a
          href="/"
          class="group flex items-center gap-2 text-gray-300 transition-colors hover:text-white"
        >
          <ChevronLeft class="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
          <img
            src={logo}
            alt="ViralMind"
            class="h-6 w-6 transition-transform"
            class:scale-0={mounted}
            style="position: absolute; left: 24px; opacity: 0;"
          />
        </a>

        <a href="/gym" class="flex items-center gap-3 border-l border-white/10 pl-6">
          <div class="rounded-lg bg-purple-600/20 p-1.5">
            <Dumbbell class="h-5 w-5 text-purple-400" />
          </div>
          <span class="font-medium text-white">Training Gym</span>
        </a>
      </div>

      <!-- Center navigation -->
      <nav class="absolute left-1/2 hidden -translate-x-1/2 items-center space-x-8 md:flex">
        <a
          href="/gym/free-races"
          class="flex items-center gap-2 text-sm text-gray-300 transition-colors hover:text-white"
        >
          <Trophy class="h-4 w-4" />
          Free Races
        </a>
        <a
          href="/gym/staked-races"
          class="flex items-center gap-2 text-sm text-gray-300 transition-colors hover:text-white"
        >
          <Dumbbell class="h-4 w-4" />
          Staked Races
        </a>
        <a
          href="/gym/history"
          class="flex items-center gap-2 text-sm text-gray-300 transition-colors hover:text-white"
        >
          <History class="h-4 w-4" />
          History
        </a>
      </nav>

      <!-- Right side notification button -->
      <div class="flex items-center">
        <!-- <a
          class="rounded-full p-2 text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
          title="Notifications"
          href="https://t.me/viralmind"
          target="_blank"
        >
          <BellRing class="h-5 w-5" />
        </a> -->
        <WalletMultiButton />
      </div>
    </div>
  </div>
</div>

<!-- Spacer to prevent content from going under fixed navbar -->
<div class="h-16"></div>

