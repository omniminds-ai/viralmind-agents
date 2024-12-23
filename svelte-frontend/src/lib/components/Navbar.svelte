<!-- Navbar.svelte -->
<script lang="ts">
  import logo from '$lib/assets/logoTransparent.png';
  import { 
    Dumbbell,
    Trophy,
    HelpCircle,
    Book,
    Coins,
    Menu,
    X
  } from 'lucide-svelte';
  import { onMount } from 'svelte';
  
  let isScrolled = false;
  let isMobileMenuOpen = false;

  onMount(() => {
    const handleScroll = () => {
      isScrolled = window.scrollY > 20;
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  });
</script>

<div 
  class="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
>
  <!-- Blurred background that shows on scroll -->
  <div 
    class="absolute inset-0 backdrop-blur-lg bg-black/50 border-b border-white/10 transition-opacity duration-300"
    class:opacity-0={!isScrolled}
    class:opacity-100={isScrolled}
  ></div>

  <div class="max-w-7xl mx-auto px-6 relative z-10">
    <div class="flex items-center justify-between h-16">
      <!-- Left side with logo -->
      <div class="flex items-center space-x-8">
        <a href="/" class="flex items-center group">
          <img 
            src={logo} 
            alt="ViralMind" 
            class="h-8 w-8 group-hover:scale-105 transition-transform"
          />
        </a>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center space-x-8">
          <a 
            href="/tournaments"
            class="text-sm text-gray-300 hover:text-white transition-colors flex items-center gap-2 group"
          >
            <Trophy class="w-4 h-4 group-hover:scale-110 transition-transform" />
            Tournaments
          </a>
          <a 
            href="/#faq" 
            class="text-sm text-gray-300 hover:text-white transition-colors flex items-center gap-2 group"
          >
            <HelpCircle class="w-4 h-4 group-hover:scale-110 transition-transform" />
            FAQ
          </a>
          <a 
            href="https://viralmind.gitbook.io/viralmind.ai" 
            target="_blank"
            class="text-sm text-gray-300 hover:text-white transition-colors flex items-center gap-2 group"
          >
            <Book class="w-4 h-4 group-hover:scale-110 transition-transform" />
            Docs
          </a>
          <a 
            href="/viral" 
            class="text-sm text-gray-300 hover:text-white transition-colors flex items-center gap-2 group"
          >
            <Coins class="w-4 h-4 group-hover:scale-110 transition-transform" />
            $VIRAL
          </a>
        </nav>
      </div>

      <!-- Right side -->
      <div class="flex items-center space-x-4">
        <!-- Training Gym CTA -->
        <a
          href="/gym"
          class="hidden md:flex items-center gap-3 py-1 pl-4 pr-5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black rounded-full text-sm font-medium transition-all group shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 hover:scale-[1.02]"
        >
          <div class="p-1 bg-black/10 rounded-full">
            <Dumbbell class="w-4 h-4 group-hover:scale-110 transition-transform" />
          </div>
          <div class="flex items-center gap-1">
            <span>Earn</span>
            <span class="font-bold">$VIRAL</span>
            <span class="opacity-80 font-medium">by Training →</span>
          </div>
        </a>

        <!-- Mobile menu button -->
        <button 
          class="md:hidden p-2 text-gray-300 hover:text-white transition-colors rounded-full hover:bg-white/5"
          on:click={() => isMobileMenuOpen = !isMobileMenuOpen}
        >
          {#if isMobileMenuOpen}
            <X class="w-6 h-6" />
          {:else}
            <Menu class="w-6 h-6" />
          {/if}
        </button>
      </div>
    </div>

    <!-- Mobile Navigation Menu -->
    {#if isMobileMenuOpen}
      <div class="md:hidden absolute top-16 left-0 right-0 bg-black/95 backdrop-blur-lg border-b border-white/10">
        <nav class="px-6 py-4 space-y-4">
          <a 
            href="/tournaments"
            class="flex items-center gap-3 text-gray-300 hover:text-white py-2 transition-colors"
          >
            <Trophy class="w-5 h-5" />
            Tournaments
          </a>
          <a 
            href="/#faq"
            class="flex items-center gap-3 text-gray-300 hover:text-white py-2 transition-colors"
          >
            <HelpCircle class="w-5 h-5" />
            FAQ
          </a>
          <a 
            href="https://viralmind.gitbook.io/viralmind.ai"
            target="_blank"
            class="flex items-center gap-3 text-gray-300 hover:text-white py-2 transition-colors"
          >
            <Book class="w-5 h-5" />
            Docs
          </a>
          <a 
            href="/viral-token"
            class="flex items-center gap-3 text-gray-300 hover:text-white py-2 transition-colors"
          >
            <Coins class="w-5 h-5" />
            $VIRAL
          </a>
          <a 
            href="/gym"
            class="flex items-center gap-3 text-gray-300 hover:text-white py-2 transition-colors"
          >
            <Dumbbell class="w-5 h-5" />
            Training Gym
          </a>
        </nav>
      </div>
    {/if}
  </div>
</div>

<!-- Spacer to prevent content from going under fixed navbar -->
<div class="h-16"></div>

<style>
  /* Add a subtle text shadow to all text elements */
  :global(.text-white),
  :global(.text-gray-300) {
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }
</style>