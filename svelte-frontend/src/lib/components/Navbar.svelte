<script lang="ts">
  import logo from '$lib/assets/stoneLogo.png';
  import { Dumbbell } from 'lucide-svelte';
  const currentTournament = 'viral_lua';
</script>

<div class="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-lg border-b border-white/10">
  <div class="max-w-7xl mx-auto px-6">
    <div class="flex items-center justify-between h-16">
      <!-- Left side nav items -->
      <div class="flex items-center space-x-8">
        <a href="/" class="flex items-center">
          <img class="h-10 w-10" src={logo} alt="ViralMind" />
        </a>
        
        <nav class="hidden md:flex items-center space-x-6">
          <a 
            href="/#faq" 
            class="text-sm text-gray-300 hover:text-white transition-colors"
          >
            FAQ
          </a>
          <a 
            href="/viral-token" 
            class="text-sm text-gray-300 hover:text-white transition-colors"
          >
            $VIRAL
          </a>
          <a 
            href="https://viralmind.gitbook.io/viralmind.ai" 
            target="_blank"
            class="text-sm text-gray-300 hover:text-white transition-colors"
          >
            Docs
          </a>
          <a 
            href={`/tournaments`}
            class="text-sm text-gray-300 hover:text-white transition-colors"
          >
            Tournaments
          </a>
        </nav>
      </div>

      <!-- Right side CTA -->
      <div class="flex items-center">
        <a
          href="/training-gym"
          class="flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-white/80 rounded-full text-sm font-medium transition-colors"
        >
          <Dumbbell class="w-4 h-4" />
          Earn $VIRAL in the Training Gym
        </a>
      </div>
    </div>
  </div>
</div>

<!-- Spacer to prevent content from going under fixed navbar -->
<div class="h-16"></div>