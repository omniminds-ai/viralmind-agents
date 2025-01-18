<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { io, Socket } from 'socket.io-client';
  import TrainingLog from '$lib/components/gym/TrainingLog.svelte';
  import Timeline from '$lib/components/gym/Timeline.svelte';
  import { walletStore } from '$lib/walletStore';
  import QuestOverlay from '$lib/components/gym/QuestOverlay.svelte';
  import { Trophy, Users, Clock } from 'lucide-svelte';
  import { trainingEvents } from '$lib/stores/training';
  import loadingLoop from '$lib/assets/loading_loop.mp4';
  import loadingDone from '$lib/assets/loading_done.mp4';
  import loadingFail from '$lib/assets/loading_fail.mp4';

  interface RaceSession {
    status: string;
    vm_credentials: {
      username: string;
      password: string;
    };
    created_at: string;
    updated_at: string;
  }

  let currentImage: string | null = null;
  let isLoading = true;
  let isConnected = false;
  let showLoadingDone = false;
  let showLoadingFail = false;
  let hasShownWalletMessage = false;
  let socket: Socket;
  let width = 1280;
  let height = 800;
  let startTime: number;
  let currentFrame = 0;
  let raceSession: RaceSession | null = null;
  let error: string | null = null;
  let timeRemaining = '-:--';
  let participants = '--';
  let rewardPool = '-- --';

  function handleError(message: string) {
    error = message;
    isLoading = false;
    showLoadingFail = true;
    trainingEvents.addEvent({
      type: 'system',
      message: `Error: ${message}`,
      timestamp: Date.now(),
      frame: 0
    });
  }

  async function loadSession(sessionId: string): Promise<RaceSession> {
    try {
      trainingEvents.addEvent({
        type: 'system',
        message: `Loading session ${sessionId}...`,
        timestamp: Date.now(),
        frame: 0
      });

      const res = await fetch(`/api/races/session/${sessionId}`);
      if (!res.ok) {
        const data = await res.json();
        const errorMsg = data.error || 'Failed to load session';
        handleError(errorMsg);
        throw new Error(errorMsg);
      }
      const session = await res.json();
      raceSession = session;

      trainingEvents.addEvent({
        type: 'system',
        message: `Session loaded successfully`,
        timestamp: Date.now(),
        frame: 0
      });

      return session;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load session';
      handleError(errorMsg);
      throw err;
    }
  }

  function setupSocket(sessionData: RaceSession, sessionId: string) {
    socket = io('http://localhost:8001', {
      query: {
        sessionId
      }
    });

    socket.on('connect_error', (err) => {
      handleError(`Failed to connect to VNC: ${err.message}`);
      console.error('Socket connection error:', err);
    });

    socket.on('error', (err) => {
      handleError(`Socket error: ${err.message}`);
      console.error('Socket error:', err);
    });

    socket.on('connect', () => {
      isConnected = true;
      isLoading = false;
      showLoadingDone = true;
      startTime = Date.now();
      trainingEvents.addEvent({
        type: 'system',
        message: 'Connected to VNC server',
        timestamp: Date.now(),
        frame: 0
      });
    });

    socket.on('frame', (data) => {
      currentImage = `data:image/jpeg;base64,${data.buffer}`;
      width = data.width;
      height = data.height;
      currentFrame = data.frame;

      if (canvas) {
        canvas.width = width;
        canvas.height = height;
        ctx = canvas.getContext('2d');
      }

      // Reset showLoadingDone after first frame is recv
      setTimeout(() => {
        showLoadingDone = false;
      }, 100);
    });

    socket.on('training_event', (data) => {
      trainingEvents.addEvent({
        ...data,
        timestamp: Date.now() - startTime,
        frame: currentFrame
      });
    });

    socket.on('quest_update', (data) => {
      currentQuest = data.quest;
      currentHint = data.hint;
      currentReward = data.maxReward;
      isHintActive = true;
    });

    socket.on('hint_update', (data) => {
      currentHint = data.hint;
      isHintActive = true;
    });
  }

  // Quest state
  let currentQuest = '';
  let currentHint = '';
  let currentReward = 0;
  let isHintActive = true;

  function refreshHint() {
    isHintActive = false;
    setTimeout(() => socket?.emit('request_hint'), 1000);
  }

  interface DragPoint {
    x: number;
    y: number;
    timestamp: number;
    velocity?: {
      x: number;
      y: number;
      magnitude: number;
    };
    acceleration?: {
      x: number;
      y: number;
      magnitude: number;
    };
  }

  // Track drag state
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragStartClientX = 0;
  let dragStartClientY = 0;
  let dragThreshold = 10;
  let dragPoints: DragPoint[] = [];
  let dragButton = 0; // 0 = left, 1 = right, 2 = middle
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D | null = null;
  let fadeTimeout: NodeJS.Timeout;

  // Convert client coordinates to VNC coordinates
  function getVNCCoordinates(e: MouseEvent & { currentTarget: HTMLImageElement }) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) * (width / rect.width));
    const y = Math.floor((e.clientY - rect.top) * (height / rect.height));
    return { x, y };
  }

  function clearCanvas() {
    if (ctx) {
      ctx.clearRect(0, 0, width, height);
    }
  }

  function drawDragLine() {
    if (!ctx || dragPoints.length < 2) return;

    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    ctx.moveTo(dragPoints[0].x, dragPoints[0].y);

    for (let i = 1; i < dragPoints.length; i++) {
      ctx.lineTo(dragPoints[i].x, dragPoints[i].y);
    }

    ctx.strokeStyle = 'rgba(147, 51, 234, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function startFadeOut() {
    if (!ctx) return;

    let opacity = 0.5;
    const fade = () => {
      if (!ctx || opacity <= 0) {
        clearCanvas();
        return;
      }

      ctx.clearRect(0, 0, width, height);
      ctx.beginPath();
      ctx.moveTo(dragPoints[0].x, dragPoints[0].y);

      for (let i = 1; i < dragPoints.length; i++) {
        ctx.lineTo(dragPoints[i].x, dragPoints[i].y);
      }

      ctx.strokeStyle = `rgba(147, 51, 234, ${opacity})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      opacity -= 0.05;
      fadeTimeout = setTimeout(fade, 20);
    };

    fade();
  }

  function calculateMotion(points: DragPoint[]): DragPoint[] {
    if (points.length < 2) return points;

    const result: DragPoint[] = [];

    // First point has no velocity or acceleration
    result.push({
      ...points[0],
      velocity: undefined,
      acceleration: undefined
    });

    // Calculate velocities first
    for (let i = 1; i < points.length; i++) {
      const point = points[i];
      const prev = points[i - 1];
      const dt = (point.timestamp - prev.timestamp) / 1000; // Convert to seconds

      if (dt === 0) {
        result.push({
          ...point,
          velocity: undefined,
          acceleration: undefined
        });
        continue;
      }

      // Calculate velocity
      const dx = point.x - prev.x;
      const dy = point.y - prev.y;
      const velocity = {
        x: dx / dt,
        y: dy / dt,
        magnitude: Math.sqrt((dx / dt) ** 2 + (dy / dt) ** 2)
      };

      // Calculate acceleration if we have enough points and previous velocity exists
      let acceleration = undefined;
      const prevPoint = result[i - 1];
      if (
        i > 1 &&
        prevPoint.velocity &&
        prevPoint.velocity.x !== undefined &&
        prevPoint.velocity.y !== undefined
      ) {
        const dvx = velocity.x - prevPoint.velocity.x;
        const dvy = velocity.y - prevPoint.velocity.y;
        acceleration = {
          x: dvx / dt,
          y: dvy / dt,
          magnitude: Math.sqrt((dvx / dt) ** 2 + (dvy / dt) ** 2)
        };
      }

      result.push({
        ...point,
        velocity,
        acceleration
      });
    }

    return result;
  }

  // Handle mouse events
  function handleMouseMove(e: MouseEvent & { currentTarget: HTMLImageElement }) {
    e.preventDefault();

    const coords = getVNCCoordinates(e);
    const now = Date.now();

    if (dragStartClientX && dragStartClientY) {
      const dx = e.clientX - dragStartClientX;
      const dy = e.clientY - dragStartClientY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance >= dragThreshold) {
        if (!isDragging) {
          isDragging = true;
          dragPoints = [
            {
              ...{ x: dragStartX, y: dragStartY },
              timestamp: now - startTime
            }
          ];
        }
      }
    }

    if (isDragging) {
      dragPoints.push({
        ...coords,
        timestamp: now - startTime
      });
      drawDragLine();
    } else {
      socket?.emit('vnc_mouse', { ...coords, button: 0, frame: currentFrame });
    }
  }

  function handleMouseDown(e: MouseEvent & { currentTarget: HTMLImageElement }) {
    e.preventDefault();

    const coords = getVNCCoordinates(e);
    const now = Date.now();

    dragStartX = coords.x;
    dragStartY = coords.y;
    dragStartClientX = e.clientX;
    dragStartClientY = e.clientY;
    dragButton = e.button;
    dragPoints = [
      {
        ...coords,
        timestamp: now - startTime
      }
    ];
  }

  function handleMouseUp(e: MouseEvent & { currentTarget: HTMLImageElement }) {
    e.preventDefault();

    const coords = getVNCCoordinates(e);
    const now = Date.now();

    dragPoints.push({
      ...coords,
      timestamp: now - startTime
    });

    if (isDragging) {
      const trajectoryWithMotion = calculateMotion(dragPoints);
      const dragAction =
        dragButton === 0
          ? 'left_click_drag'
          : dragButton === 2
            ? 'right_click_drag'
            : 'middle_click_drag';
      socket?.emit('vnc_mouse', {
        action: dragAction,
        trajectory: trajectoryWithMotion,
        frame: currentFrame
      });
      startFadeOut();
      refreshHint(); // only refresh hint on user input
    } else {
      // This was a click, not a drag - send both mouse down event
      socket?.emit('vnc_mouse', { ...coords, button: dragButton + 1, frame: currentFrame });
      refreshHint(); // only refresh hint on user input
    }

    isDragging = false;
    dragStartX = 0;
    dragStartY = 0;
    dragStartClientX = 0;
    dragStartClientY = 0;
    dragPoints = [];
  }

  function handleWheel(e: WheelEvent) {
    e.preventDefault();

    const action = e.deltaY > 0 ? 'scroll_down' : 'scroll_up';
    socket?.emit('vnc_mouse', { action, frame: currentFrame });
    refreshHint(); // only refresh hint on user input
  }

  async function initializeRace() {
    // Wait a bit for wallet to initialize
    await new Promise(resolve => setTimeout(resolve, 1000));

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
          timestamp: Date.now(),
          frame: 0
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

        trainingEvents.addEvent({
          type: 'system',
          message: `Race started successfully`,
          timestamp: Date.now(),
          frame: 0
        });

        // Update URL with session ID
        urlParams.set('s', data.sessionId);
        window.history.replaceState({}, '', `${window.location.pathname}?${urlParams.toString()}`);

        // Load the new session
        const sessionData = await loadSession(data.sessionId);
        if (sessionData.status !== 'active') {
          handleError('Session is not active');
          return;
        }
        setupSocket(sessionData, data.sessionId);
      } catch (err) {
        handleError(err instanceof Error ? err.message : 'Failed to load session');
      }
    }
  }

  let handleBeforeUnload:
    | {
        (e: BeforeUnloadEvent): void;
        (this: Window, ev: BeforeUnloadEvent): any;
        (this: Window, ev: BeforeUnloadEvent): any;
      }
    | undefined;

  function stopRace() {
    if (socket) {
      socket.disconnect();
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
  }

  onMount(() => {
    // Add beforeunload handler
    handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey) {
        e.preventDefault();
      }

      let key = '';
      if (e.key === ' ') key = 'space';
      else if (e.key === '+') key = 'plus';
      else if (e.key === 'Enter') key = 'return';
      else if (e.key === 'Escape') key = 'escape';
      else if (e.key === 'Backspace') key = 'backspace';
      else if (e.key === 'Delete') key = 'delete';
      else if (e.key === 'Tab') key = 'tab';
      else if (e.key.startsWith('Arrow')) key = e.key.slice(5).toLowerCase();
      else if (e.key === 'Home') key = 'home';
      else if (e.key === 'End') key = 'end';
      else if (e.key === 'PageUp') key = 'pageup';
      else if (e.key === 'PageDown') key = 'pagedown';
      else if (e.key.match(/^F\d+$/)) key = e.key.toLowerCase();
      else key = e.key;

      const parts = [];
      if (e.ctrlKey) parts.push('ctrl');
      if (e.altKey) parts.push('alt');
      if (e.shiftKey && (key.length > 1 || key === 'tab')) {
        parts.push('shift');
      }

      if (key.length === 1) {
        parts.push(e.key);
      } else {
        parts.push(key.toLowerCase());
      }

      const keyCombo = parts.join('+');
      socket?.emit('vnc_keypress', { key: keyCombo, frame: currentFrame });
      refreshHint(); // only refresh hint on user input
    };

    window.addEventListener('keydown', handleKeyDown);

    if (canvas) {
      ctx = canvas.getContext('2d');
    }

    // Initialize the race
    initializeRace();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (handleBeforeUnload) window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  });

  onDestroy(() => {
    if (socket) {
      socket.disconnect();
      trainingEvents.addEvent({
        type: 'system',
        message: 'Disconnected from VNC server',
        timestamp: Date.now(),
        frame: currentFrame
      });
    }
    if (fadeTimeout) {
      clearTimeout(fadeTimeout);
    }
  });
</script>

<div class="flex h-[calc(100vh-theme(spacing.16)-theme(spacing.20))] bg-black">
  <!-- Main Content -->
  <div class="flex flex-1 flex-col">
    <!-- VNC Stream -->
    <div class="flex flex-1 items-center justify-center p-6">
      <div
        class="overflow-hidden rounded-xl bg-black/50 shadow-lg"
        style="width: {width}px; height: {height}px;"
      >
        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
        <div class="relative h-full w-full">
          {#if isLoading}
            <video
              src={loadingLoop}
              autoplay
              loop
              muted
              class="absolute inset-0 h-full w-full object-cover"
            />
          {/if}
          {#if showLoadingDone}
            <video
              src={loadingDone}
              autoplay
              muted
              class="absolute inset-0 h-full w-full object-cover"
            />
          {/if}
          {#if showLoadingFail}
            <video
              src={loadingFail}
              autoplay
              muted
              class="absolute inset-0 h-full w-full object-cover"
            />
          {/if}
          {#if currentImage}
            <img
              src={currentImage}
              alt="VNC stream"
              class="absolute inset-0 h-full w-full cursor-crosshair select-none object-cover"
              on:mousemove={handleMouseMove}
              on:mousedown={handleMouseDown}
              on:mouseup={handleMouseUp}
              on:wheel={handleWheel}
              on:contextmenu|preventDefault
              draggable="false"
            />
          {/if}
          <canvas
            bind:this={canvas}
            {width}
            {height}
            class="pointer-events-none absolute inset-0 h-full w-full"
          ></canvas>
          {#if currentQuest}
            <QuestOverlay
              quest={currentQuest}
              hint={currentHint}
              maxReward={currentReward}
              {isHintActive}
            />
          {/if}
        </div>
      </div>
    </div>

    {#if isConnected}
      <Timeline {startTime} />
    {/if}

    <div class="space-y-4 p-4">
      <button
        class="w-full rounded-xl bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-700"
        on:click={stopRace}
      >
        Stop Race
      </button>
      <!-- <div class="grid grid-cols-3 gap-4">
                <div class="bg-purple-950/30 rounded-xl p-4 border border-purple-500/20">
                    <div class="flex items-center gap-2 text-purple-400 mb-2">
                        <Clock size={20} />
                        <span>Time Remaining</span>
                    </div>
                    <span class="text-2xl text-white font-medium">{timeRemaining}</span>
                </div>
                
                <div class="bg-purple-950/30 rounded-xl p-4 border border-purple-500/20">
                    <div class="flex items-center gap-2 text-purple-400 mb-2">
                        <Users size={20} />
                        <span>Participants</span>
                    </div>
                    <span class="text-2xl text-white font-medium">{participants}</span>
                </div>
                
                <div class="bg-purple-950/30 rounded-xl p-4 border border-purple-500/20">
                    <div class="flex items-center gap-2 text-purple-400 mb-2">
                        <Trophy size={20} />
                        <span>Reward Pool</span>
                    </div>
                    <span class="text-2xl text-white font-medium">{rewardPool}</span>
                </div>
            </div> -->
    </div>
  </div>

  <!-- Right Sidebar (Training Log) -->
  <TrainingLog {startTime} />
</div>
