<script lang="ts">
  import { Twitter, MessageCircle, BarChart } from 'lucide-svelte';
</script>

<!-- Spacer to prevent content from going under fixed navbar -->
<div class="h-16"></div>

<footer class="fixed bottom-0 left-0 right-0 z-40">
  <!-- Gradient shadow above footer -->
  <div
    class="pointer-events-none absolute -top-24 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent opacity-50"
  ></div>

  <div class="relative border-t border-white/5 bg-black/60 backdrop-blur-md">
    <div class="mx-auto max-w-7xl px-6 py-4">
      <div class="flex flex-wrap items-center justify-center gap-6 text-gray-400">
        <!-- Social Links -->
        <a
          href="https://twitter.com/ViralMindAI"
          target="_blank"
          class="flex items-center gap-2 transition-colors hover:text-white"
        >
          <Twitter class="h-5 w-5" />
        </a>

        <a
          href="https://t.me/viralmind"
          target="_blank"
          class="flex items-center gap-2 transition-colors hover:text-white"
        >
          <MessageCircle class="h-5 w-5" />
        </a>

        <a
          href="https://dexscreener.com/solana/HW7D5MyYG4Dz2C98axfjVBeLWpsEnofrqy6ZUwqwpump"
          target="_blank"
          class="flex items-center gap-2 transition-colors hover:text-white"
        >
          <BarChart class="h-5 w-5" />
        </a>

        <!-- Contract Address -->
        <div class="flex items-center justify-center gap-2 rounded-full bg-black/20 px-4 py-1">
          <span class="text-xs font-semibold uppercase">contract: </span><code
            class="w-1/3 truncate font-mono text-sm md:w-full"
            >HW7D5MyYG4Dz2C98axfjVBeLWpsEnofrqy6ZUwqwpump</code
          >
          <button
            class="text-xs hover:text-white"
            onclick={() =>
              navigator.clipboard.writeText('HW7D5MyYG4Dz2C98axfjVBeLWpsEnofrqy6ZUwqwpump')}
          >
            Copy
          </button>
        </div>
      </div>
    </div>
  </div>
</footer>
