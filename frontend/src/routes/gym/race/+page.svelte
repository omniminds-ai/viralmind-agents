<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import TrainingLog from '$lib/components/gym/TrainingLog.svelte';
  import Timeline from '$lib/components/gym/Timeline.svelte';
  import { walletStore } from '$lib/walletStore';
  import { trainingEvents } from '$lib/stores/training';
  import type { RaceSession } from '$lib/types';

  let isLoading = true;
  let hasShownWalletMessage = false;
  let startTime: number;
  let raceSession: RaceSession | null = null;
  let error: string | null = null;

  function handleError(message: string) {
    error = message;
    isLoading = false;
    trainingEvents.addEvent({
      type: 'system',
      message: `Error: ${message}`,
      timestamp: Date.now()
    });
  }

  async function initializeRace() {
    // Wait a bit for wallet to initialize
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const { connected, publicKey } = $walletStore;
    if (!connected || !publicKey) {
      handleError('Please connect your wallet to participate in races');
      hasShownWalletMessage = true;
      return;
    }

    console.log('using address', publicKey.toBase58());

    const urlParams = new URLSearchParams(window.location.search);
    const raceId = urlParams.get('id');
    const sessionId = urlParams.get('s');

    if (!raceId) {
      handleError('No race ID provided');
      return;
    }

    // If no session ID, start a new race session
    if (!sessionId) {
      try {
        trainingEvents.addEvent({
          type: 'system',
          message: `Starting race ${raceId}...`,
          timestamp: Date.now()
        });

        const res = await fetch(`/api/races/${raceId}/start`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            address: publicKey.toBase58()
          })
        });

        if (!res.ok) {
          const data = await res.json();
          const errorMsg = data.error || 'Failed to start race';
          handleError(errorMsg);
          throw new Error(errorMsg);
        }

        const data = await res.json();
        
        // Set up Guacamole auth token
        if (data.vm_credentials?.guacToken) {
          localStorage.setItem('GUAC_AUTH', JSON.stringify({
            authToken: data.vm_credentials.guacToken,
            dataSource: 'mysql'
          }));
        }

        // Store session data
        const sessionData = {
          status: 'active',
          vm_credentials: {
            ...data.vm_credentials
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        raceSession = sessionData;
        startTime = Date.now();

        trainingEvents.addEvent({
          type: 'system',
          message: `Race started successfully`,
          timestamp: Date.now()
        });

        // Update URL with session ID
        urlParams.set('s', data.sessionId);
        window.history.replaceState({}, '', `${window.location.pathname}?${urlParams.toString()}`);
        
        if (sessionData.status !== 'active') {
          handleError('Session is not active');
          return;
        }

        isLoading = false;
      } catch (err) {
        handleError(err instanceof Error ? err.message : 'Failed to load session');
      }
    }
  }

  let handleBeforeUnload: ((e: BeforeUnloadEvent) => void) | undefined;

  function stopRace() {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('s');
    if (sessionId) {
      fetch(`/api/races/session/${sessionId}/stop`, {
        method: 'POST'
      }).catch(console.error);
    }
    if (handleBeforeUnload) window.removeEventListener('beforeunload', handleBeforeUnload);
    window.location.href = '/gym';
  }

  onMount(() => {
    // Add beforeunload handler
    handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Initialize the race
    initializeRace();

    return () => {
      if (handleBeforeUnload) window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  });

  onDestroy(() => {
    trainingEvents.addEvent({
      type: 'system',
      message: 'Race session ended',
      timestamp: Date.now()
    });
    if (handleBeforeUnload) window.removeEventListener('beforeunload', handleBeforeUnload);
  });
</script>

<div class="flex h-[calc(100vh-theme(spacing.16)-theme(spacing.20))] bg-black">
  <!-- Main Content -->
  <div class="flex flex-1 flex-col">
    <!-- Guacamole Stream -->
    <div class="flex flex-1 items-center justify-center p-6">
      <div class="overflow-hidden rounded-xl bg-black/50 shadow-lg" style="width: 1280px; height: 800px;">
        <div class="relative h-full w-full">
          {#if raceSession?.vm_credentials?.guacToken}
            <iframe
              src={`/guacamole/#/client/${raceSession.vm_credentials.guacClientId}?token=${raceSession.vm_credentials.guacToken}`}
              title="Guacamole Remote Desktop"
              class="absolute inset-0 h-full w-full border-0"
              allow="clipboard-read; clipboard-write"
            ></iframe>
          {/if}
        </div>
      </div>
    </div>

    {#if !isLoading}
      <Timeline {startTime} />
    {/if}

    <div class="space-y-4 p-4">
      <button
        class="w-full rounded-xl bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-700"
        on:click={stopRace}
      >
        Stop Race
      </button>
    </div>
  </div>

  <!-- Right Sidebar (Training Log) -->
  <TrainingLog {startTime} race={raceSession} />
</div>
