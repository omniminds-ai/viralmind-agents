<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { Tournament } from '$lib/types';
  import ChatSidebar from '$lib/components/tournaments/ChatSidebar.svelte';
  import TournamentInfo from '$lib/components/tournaments/TournamentInfo.svelte';
  import ServerIpReveal from '$lib/components/ServerIpReveal.svelte';
  import { page } from '$app/state';

  let loading = true;
  let error: string | null = null;
  let data: Tournament | null = null;
  let messages: any[] = [];
  let streamContainer: HTMLDivElement;
  let timeLeft = '';
  let startTimeLeft = '';
  let challenge: any = null;
  let has_locked_server = false;
  let latestScreenshot: any = null;
  $: tournamentStarted = challenge?.status === 'active';

  async function loadTournamentData() {
    const name = page.params.name;
    const initial = page.url.searchParams.get('initial') === 'true';
    const price = page.url.searchParams.get('price') || '0';

    try {
      loading = true;
      error = null;
      const response = await fetch(
        `/api/v1/challenges/get-challenge?name=${encodeURIComponent(name)}&initial=${initial}&price=${price}`
      );

      if (!response.ok) {
        throw new Error('Failed to load tournament');
      }

      data = await response.json();
      messages = data?.chatHistory || [];
      challenge = data?.challenge;
      has_locked_server = challenge?.name === 'viral_steve';
      latestScreenshot = data?.latestScreenshot;
      updateTimeRemaining();
    } catch (e) {
      console.error('Error loading tournament:', e);
      error = e instanceof Error ? e.message : 'Failed to load tournament';
    } finally {
      loading = false;
    }
  }

  const updateTimeRemaining = () => {
    if (!challenge?.start_date || !challenge?.expiry) {
      console.log('Missing dates:', {
        start_date: challenge?.start_date,
        expiry: challenge?.expiry
      });
      return;
    }

    const now = Date.now();
    const start = new Date(challenge.start_date).getTime();
    const expiry = new Date(challenge.expiry).getTime();

    console.log('Debug times:', {
      now,
      start,
      expiry,
      isStarted: now >= start,
      timeToExpiry: expiry - now,
      status: challenge.status
    });

    // Calculate time until expiry for active tournaments
    const expiryDiff = expiry - now;
    if (expiryDiff <= 0) {
      timeLeft = 'Expired';
    } else if (challenge.status === 'active' && now <= expiry) {
      const days = Math.floor(expiryDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((expiryDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((expiryDiff % (1000 * 60 * 60)) / (1000 * 60));
      timeLeft = `${days}d ${hours}h ${minutes}m`;
    }

    // Calculate time until start for upcoming tournaments
    const startDiff = start - now;
    if (startDiff > 0) {
      const days = Math.floor(startDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((startDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((startDiff % (1000 * 60 * 60)) / (1000 * 60));
      startTimeLeft = `${days}d ${hours}h ${minutes}m`;
    }
  };

  const sendMessage = (message: string) => {
    messages = [
      ...messages,
      {
        _id: crypto.randomUUID(),
        role: 'user',
        content: message,
        date: new Date().toISOString()
      }
    ];
  };

  let interval: ReturnType<typeof setInterval>;
  onMount(async () => {
    await loadTournamentData();
    interval = setInterval(updateTimeRemaining, 60000);
  });

  onDestroy(() => {
    clearInterval(interval);
  });
</script>

<div class="min-h-screen bg-black text-white">
  {#if loading}
    <div class="flex min-h-screen items-center justify-center">
      <div class="text-xl text-gray-400">Loading tournament...</div>
    </div>
  {:else if error}
    <div class="flex min-h-screen items-center justify-center">
      <div class="text-xl text-red-400">{error}</div>
    </div>
  {:else if data}
    <div class="lg:pr-[400px]">
      <!-- 400px to account for sidebar -->
      <div class="mx-auto max-w-[1280px] px-4 py-6">
        <!-- Tournament Status Banners -->
        {#if challenge.status === 'concluded'}
          <div class="mb-6 rounded-2xl bg-stone-900/50 p-8 text-center backdrop-blur-sm">
            <h2 class="mb-2 text-2xl font-bold">Tournament Concluded</h2>
            <p class="text-gray-400">Stay tuned for the next tournament! 🎮</p>
          </div>
        {:else if !tournamentStarted}
          <div class="mb-6 rounded-2xl bg-stone-900/50 p-8 text-center backdrop-blur-sm">
            <h2 class="mb-2 text-2xl font-bold">Tournament Starting Soon</h2>
            <p class="mt-4 text-2xl font-bold text-purple-400">{startTimeLeft}</p>
            <p class="mt-2 text-gray-400">Get ready to compete! 🎮</p>
          </div>
        {/if}

        <!-- Stream Window -->
        <div
          bind:this={streamContainer}
          class="relative mx-auto mb-6 aspect-video w-full max-w-[1280px] overflow-hidden rounded-2xl border border-white/10 bg-stone-900"
        >
          {#if challenge.stream_src}
            <iframe
              src={challenge.stream_src}
              title="Tournament Stream"
              class="absolute left-0 top-0 h-full w-full"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
          {:else if latestScreenshot}
            <img
              src={'https://viralmind.ai' + latestScreenshot.url}
              alt="Latest Tournament Screen"
              class="absolute left-0 top-0 h-full w-full object-cover"
            />
          {:else}
            <div
              class="absolute left-0 top-0 flex h-full w-full items-center justify-center text-gray-500"
            >
              Loading stream...
            </div>
          {/if}
        </div>

        <!-- Tournament Info -->
        <TournamentInfo
          {challenge}
          prize={data.prize}
          breakAttempts={data.break_attempts}
          startTimeLeft={!tournamentStarted ? startTimeLeft : ''}
        />

        {#if has_locked_server}
          <div class="mt-8">
            <ServerIpReveal
              {tournamentStarted}
              startTimeLeft={!tournamentStarted ? startTimeLeft : ''}
              name={challenge.name}
            />
          </div>
        {/if}
      </div>
    </div>

    <!-- Chat Sidebar -->
    <ChatSidebar
      {messages}
      messagePrice={data.message_price}
      usdMessagePrice={data.usdMessagePrice}
      timeLeft={tournamentStarted ? timeLeft : startTimeLeft}
      actionsPerMessage={challenge.max_actions || 3}
      onSendMessage={sendMessage}
      agentPfp={challenge.pfp}
      status={challenge.status}
      tournamentPDA={challenge.tournamentPDA}
      programId={challenge.idl.address}
      challengeName={challenge._id}
    />
  {/if}
</div>

<svelte:head>
  <title>{challenge?.name ? `${challenge.name} Tournament` : 'Tournament'} - ViralMind</title>
</svelte:head>
