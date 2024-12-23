<script lang="ts">
    import logo from '$lib/assets/logoTransparent.png';
    import { 
      Dumbbell, 
      ChevronLeft,
      BellRing,
      Trophy,
      History
    } from 'lucide-svelte';
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
        <!-- Left side with back button and title -->
        <div class="flex items-center space-x-6">
          <a 
            href="/" 
            class="flex items-center gap-2 text-gray-300 hover:text-white transition-colors group"
          >
            <ChevronLeft class="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            <img 
              src={logo} 
              alt="ViralMind" 
              class="h-6 w-6 transition-transform" 
              class:scale-0={mounted}
              style="position: absolute; left: 24px; opacity: 0;"
            />
          </a>
          
          <div class="flex items-center gap-3 pl-6 border-l border-white/10">
            <div class="p-1.5 bg-purple-600/20 rounded-lg">
              <Dumbbell class="w-5 h-5 text-purple-400" />
            </div>
            <span class="font-medium">Training Gym</span>
          </div>
        </div>
  
        <!-- Center navigation -->
        <nav class="hidden md:flex items-center space-x-8 absolute left-1/2 -translate-x-1/2">
          <a 
            href="/gym/free-races" 
            class="text-sm text-gray-300 hover:text-white transition-colors flex items-center gap-2"
          >
            <Trophy class="w-4 h-4" />
            Free Races
          </a>
          <a 
            href="/gym/staked-races" 
            class="text-sm text-gray-300 hover:text-white transition-colors flex items-center gap-2"
          >
            <Dumbbell class="w-4 h-4" />
            Staked Races
          </a>
          <a 
            href="/gym/history" 
            class="text-sm text-gray-300 hover:text-white transition-colors flex items-center gap-2"
          >
            <History class="w-4 h-4" />
            History
          </a>
        </nav>
  
        <!-- Right side notification button -->
        <div class="flex items-center">
          <button 
            class="p-2 text-gray-300 hover:text-white transition-colors rounded-full hover:bg-white/5"
            title="Notifications"
          >
            <BellRing class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Spacer to prevent content from going under fixed navbar -->
  <div class="h-16"></div>
  
  <style>
    /* Add a subtle text shadow to all text elements */
    :global(.text-white),
    :global(.text-gray-300),
    :global(.text-purple-400) {
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    }
  </style>