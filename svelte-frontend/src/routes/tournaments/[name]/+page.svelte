
<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import type { PageData } from './$types';
    import ChatSidebar from '$lib/components/tournaments/ChatSidebar.svelte';
    import TournamentInfo from '$lib/components/tournaments/TournamentInfo.svelte';
    
    export let data: PageData;
    
    let messages = data.chatHistory || [];
    let streamContainer: HTMLDivElement;
    let timeLeft = '';
    
    $: challenge = data.challenge;
    $: latestScreenshot = data.latestScreenshot;
    
    const updateTimeRemaining = () => {
      const now = new Date();
      const expiry = new Date(challenge.expiry);
      const diff = expiry.getTime() - now.getTime();
      
      if (diff <= 0) {
        timeLeft = 'Expired';
        return;
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      timeLeft = `${hours}h ${minutes}m`;
    };
    
    const sendMessage = (message: string) => {
      messages = [...messages, {
        _id: crypto.randomUUID(),
        role: 'user',
        content: message,
        date: new Date().toISOString()
      }];
    };
    
    let interval: number;
    onMount(() => {
      updateTimeRemaining();
      interval = setInterval(updateTimeRemaining, 60000);
    });
    
    onDestroy(() => {
      clearInterval(interval);
    });
  </script>
  
  <div class="min-h-screen bg-black text-white">
    <div class="lg:pr-[400px]"> <!-- 400px to account for sidebar -->
      <div class="mx-auto max-w-[1280px] px-4 py-6">
        <!-- Tournament Concluded Banner -->
        {#if challenge.status === 'concluded'}
          <div class="mb-6 text-center bg-stone-900/50 backdrop-blur-sm rounded-2xl p-8">
            <h2 class="text-2xl font-bold mb-2">Tournament Concluded</h2>
            <p class="text-gray-400">Stay tuned for the next tournament! 🎮</p>
          </div>
        {/if}
  
        <!-- Stream Window -->
        <div 
          bind:this={streamContainer}
          class="relative bg-stone-900 rounded-2xl overflow-hidden border border-white/10 mb-6 w-full aspect-video max-w-[1280px] mx-auto"
        >
          {#if latestScreenshot}
            <img 
              src={'https://viralmind.ai' + latestScreenshot.url} 
              alt="Latest Tournament Screen"
              class="absolute top-0 left-0 w-full h-full object-cover"
            />
          {:else}
            <div class="absolute top-0 left-0 w-full h-full flex items-center justify-center text-gray-500">
              Loading stream...
            </div>
          {/if}
        </div>
  
        <!-- Tournament Info -->
        <TournamentInfo 
          {challenge}
          prize={data.prize}
          breakAttempts={data.break_attempts}
        />
      </div>
    </div>
  
    <!-- Chat Sidebar -->
    <ChatSidebar
      {messages}
      messagePrice={data.message_price}
      usdMessagePrice={data.usdMessagePrice}
      {timeLeft}
      actionsPerMessage={challenge.chatLimit || 3}
      onSendMessage={sendMessage}
      agentPfp={challenge.pfp}
    />
  </div>