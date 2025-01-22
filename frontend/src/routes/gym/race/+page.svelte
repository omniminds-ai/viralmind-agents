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
  let currentQuest = '';
  let currentHint = '';
  let maxReward = 0;

  function handleError(message: string) {
    error = message;
    isLoading = false;
    trainingEvents.addEvent({
      type: 'system',
      message: `Error: ${message}`,
      timestamp: Date.now()
    });
  }

  async function requestHint() {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('s');
    if (!sessionId || !raceSession?.vm_credentials) return;

    try {
      const res = await fetch(`/api/races/session/${sessionId}/hint`, {
        method: 'POST'
      });

      if (!res.ok) {
        console.error('Failed to get hint');
        return;
      }

      const data = await res.json();
      
      // Update quest if completed
      if (data.isCompleted && data.newQuest) {
        currentQuest = data.newQuest;
        maxReward = data.maxReward;
      }

      // Update hint
      currentHint = data.hint;

      // Add events to training log
      data.events?.forEach((event: any) => {
        trainingEvents.addEvent({
          type: event.type,
          message: event.message,
          timestamp: event.timestamp,
          frame: event.frame,
          metadata: event.metadata
        });
      });
    } catch (err) {
      console.error('Error requesting hint:', err);
    }
  }

  async function generateInitialQuest(sessionId: string) {
    try {
      const res = await fetch(`/api/races/session/${sessionId}/quest`, {
        method: 'POST'
      });

      if (!res.ok) {
        console.error('Failed to generate initial quest');
        return;
      }

      const data = await res.json();
      currentQuest = data.quest;
      currentHint = data.hint;
      maxReward = data.maxReward;

      // Add events to training log
      data.events?.forEach((event: any) => {
        trainingEvents.addEvent({
          type: event.type,
          message: event.message,
          timestamp: event.timestamp,
          frame: event.frame,
          metadata: event.metadata
        });
      });
    } catch (err) {
      console.error('Error generating initial quest:', err);
    }
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

    if (sessionId) {
      try {
        // Get existing session
        const res = await fetch(`/api/races/session/${sessionId}`);
        if (!res.ok) {
          const data = await res.json();
          handleError(data.error || 'Failed to load session');
          return;
        }

        const data = await res.json();
        raceSession = data;
        startTime = new Date(data.created_at).getTime();

        // Generate initial quest
        await generateInitialQuest(sessionId);

        isLoading = false;
      } catch (err) {
        handleError(err instanceof Error ? err.message : 'Failed to load session');
      }
    } else {
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

        // Generate initial quest
        await generateInitialQuest(data.sessionId);

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

    // Set up interval for hint requests
    const hintInterval = setInterval(requestHint, 5000);

    return () => {
      if (handleBeforeUnload) window.removeEventListener('beforeunload', handleBeforeUnload);
      clearInterval(hintInterval);
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
      <div class="overflow-hidden rounded-sm bg-black/50 shadow-lg" style="width: 1280px; height: 800px;">
        <div class="relative h-full w-full">
          {#if raceSession?.vm_credentials?.guacToken}
            <iframe
              src={`/guacamole/#/client/${raceSession.vm_credentials.guacClientId}?token=${raceSession.vm_credentials.guacToken}`}
              title="Guacamole Remote Desktop"
              class="absolute inset-0 h-full w-full border-0"
              allow="clipboard-read; clipboard-write"
            ></iframe>
          {/if}

          <!-- Quest Overlay -->
          {#if currentQuest}
            <div class="absolute bottom-4 left-4 right-4 flex flex-col gap-2 rounded-lg bg-black/80 p-4 text-white">
              <div class="flex items-center justify-between">
                <div class="font-medium">Current Quest:</div>
                <div class="text-yellow-400">{maxReward} $VIRAL</div>
              </div>
              <div class="text-lg">{currentQuest}</div>
              <div class="flex items-center justify-between">
                {#if currentHint}
                  <div class="text-sm text-blue-400">{currentHint}</div>
                {/if}
                <button
                  class="ml-auto rounded bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700"
                  on:click={requestHint}
                >
                  Request Hint
                </button>
              </div>
            </div>
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
