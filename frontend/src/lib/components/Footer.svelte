<script lang="ts">
  import { Twitter, MessageCircle, BarChart, Github } from 'lucide-svelte';
  const contractAddress= "G6iRK8kN67HJFrPA1CDA5KZaPJMiBu3bqdd9vdKBpump"
  const targetEpoch = 1747746000000; // target timestamp in milliseconds
  let countdown = $state("0d 0h 0m 0s");
  function updateCountdown() {
    const now = Date.now();
    let remaining = targetEpoch - now;

    if (remaining <= 0) {
      clearInterval(timer);
      return;
    }

    const seconds = Math.floor((remaining / 1000) % 60);
    const minutes = Math.floor((remaining / (1000 * 60)) % 60);
    const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24);
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));

    countdown =`${days}d ${hours}h ${minutes}m ${seconds}s`;
  }

  // Initial call to avoid delay
  // updateCountdown();

  // Update every second
  // const timer = setInterval(updateCountdown, 1000);

</script>

<!-- Spacer to prevent content from going under fixed navbar -->
<div class="h-16"></div>

<footer class="fixed bottom-0 left-0 right-0 z-40">
  <div class="relative border-t border-gray-200 bg-white/90 backdrop-blur-sm">
    <div class="mx-auto max-w-7xl px-6 py-4">
      <div class="flex flex-wrap items-center justify-center gap-6 text-gray-500">
        <!-- Social Links -->
<!--        <a-->
<!--          href="https://twitter.com/ViralMindAI"-->
<!--          target="_blank"-->
<!--          class="flex items-center gap-2 transition-colors hover:text-gray-900"-->
<!--        >-->
<!--          <Twitter class="h-5 w-5" />-->
<!--        </a>-->

<!--        <a-->
<!--          href="https://github.com/viralmind-ai/viralmind-agents"-->
<!--          target="_blank"-->
<!--          class="flex items-center gap-2 transition-colors hover:text-gray-900"-->
<!--        >-->
<!--          <Github class="h-5 w-5" />-->
<!--        </a>-->

<!--        <a-->
<!--          href="https://t.me/viralmind"-->
<!--          target="_blank"-->
<!--          class="flex items-center gap-2 transition-colors hover:text-gray-900"-->
<!--        >-->
<!--          <MessageCircle class="h-5 w-5" />-->
<!--        </a>-->

<!--        <a-->
<!--          href="https://dexscreener.com/solana/HW7D5MyYG4Dz2C98axfjVBeLWpsEnofrqy6ZUwqwpump"-->
<!--          target="_blank"-->
<!--          class="flex items-center gap-2 transition-colors hover:text-gray-900"-->
<!--        >-->
<!--          <BarChart class="h-5 w-5" />-->
<!--        </a>-->

        <!-- Contract Address -->
        <div
          class="flex w-full items-start justify-start gap-2 rounded-full border-2 bg-gray-200/75 px-4 py-1 md:w-1/2 lg:w-1/2 xl:w-1/3">
          <span class="text-xs font-semibold uppercase w-1/2">Contract:</span>
          <code class="truncate font-mono text-sm align-middle">
            {contractAddress}
          </code>
          <button
            class="text-xs hover:text-gray-900"
            onclick={() =>
              navigator.clipboard.writeText(contractAddress)}>
            Copy
          </button>
        </div>
      </div>
    </div>
  </div>
</footer>
