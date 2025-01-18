<script lang="ts">
  import { X, Trophy, Gift } from 'lucide-svelte';
  import { raceWarningModal } from '$lib/stores/raceWarningModal';
  import demoVideo from '$lib/assets/gym_demo.mp4';

  function close() {
    raceWarningModal.close();
  }

  function proceed() {
    if ($raceWarningModal.raceId) {
      window.location.href = `/gym/race?id=${$raceWarningModal.raceId}`;
    }
  }
</script>

{#if $raceWarningModal.visible}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/80" on:click={close}></div>
    
    <!-- Modal -->
    <div class="relative z-10 w-full max-w-2xl rounded-2xl bg-gradient-to-b from-purple-900/50 to-black/50 backdrop-blur-md border border-purple-500 p-8 text-white shadow-xl">
      <button 
        class="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors" 
        on:click={close}
      >
        <X class="h-6 w-6" />
      </button>

      <div class="mb-6 flex items-center gap-3 text-purple-300">
        <Trophy class="h-8 w-8" />
        <h2 class="text-2xl font-bold">Ready for Your Quest?</h2>
      </div>

      <!-- Video Preview -->
      <div class="mb-8 rounded-lg overflow-hidden bg-black/30 border border-purple-500/30">
        <video 
          src={demoVideo}
          class="w-full"
          autoplay
          loop
          muted
          playsinline
        />
      </div>
      
      <div class="mb-6 space-y-4 text-gray-200">
        <p class="text-lg">
          You're about to enter an exciting virtual desktop environment where you'll:
        </p>
        <ul class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <li class="flex items-start gap-2">
            <Gift class="h-5 w-5 text-purple-400 mt-1 flex-shrink-0" />
            <span>Complete fun desktop quests with AI guidance</span>
          </li>
          <li class="flex items-start gap-2">
            <Trophy class="h-5 w-5 text-purple-400 mt-1 flex-shrink-0" />
            <span>Earn rewards for completing challenges</span>
          </li>
          <li class="flex items-start gap-2">
            <Gift class="h-5 w-5 text-purple-400 mt-1 flex-shrink-0" />
            <span>Train in a safe virtual environment</span>
          </li>
          <li class="flex items-start gap-2">
            <Trophy class="h-5 w-5 text-purple-400 mt-1 flex-shrink-0" />
            <span>Help improve AI through your quest completion</span>
          </li>
        </ul>
        
        <div class="mt-6 rounded-lg border border-purple-500/30 bg-black/20 p-4 text-sm">
          <p class="font-medium text-purple-200">
            Privacy Notice: This training session will record all activity in the virtual machine, including keystrokes and mouse movements. These recordings are saved for AI training and can be exported from your <a href="/gym/history" class="text-purple-400 hover:text-purple-300 underline">race history</a>. <strong>Please avoid entering any personal information!</strong> 🎮
          </p>
        </div>
      </div>

      <div class="flex justify-end gap-4">
        <button
          class="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          on:click={close}
        >
          Maybe Later
        </button>
        <button
          class="rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 px-6 py-2 font-medium text-white hover:from-purple-500 hover:to-purple-400 transition-all shadow-lg hover:shadow-purple-500/25"
          on:click={proceed}
        >
          Start Quest!
        </button>
      </div>
    </div>
  </div>
{/if}