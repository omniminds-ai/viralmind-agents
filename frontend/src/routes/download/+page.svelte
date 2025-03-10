<script lang="ts">
  import { Download, Lock, UserX, Dumbbell, Hammer } from 'lucide-svelte';
  import { onMount } from 'svelte';

  // Define download URLs (placeholders for now)
  const downloads = {
    mac: {
      x64: {
        url: '#',
        version: '0.1.0',
        size: '145 MB',
        md5: 'e8d98c8eaf84d8e49644a4dae1a7a61e'
      },
      arm: {
        url: '#',
        version: '0.1.0',
        size: '142 MB',
        md5: 'a37d72a3bae8ad37e4b37a9c67e39a3f'
      }
    },
    windows: {
      x64: {
        url: '#',
        version: '1.0.0',
        size: '150 MB',
        md5: 'f8d93c8bd36e4d6847e8c5ef9a33e9d5'
      },
      arm: {
        url: '#',
        version: '1.0.0',
        size: '148 MB',
        md5: 'b25e6d781943a35cde57fab4b8a3d3ec'
      }
    },
    linux: {
      x64: {
        url: '#',
        version: '1.0.0',
        size: '140 MB',
        md5: 'c7d92e3a8f4e5d9c861d1e3b8cb47a9a'
      },
      arm: {
        url: '#',
        version: '1.0.0',
        size: '138 MB',
        md5: 'd3a5ef2b97e3dfc38e8a4cf58d6ee659'
      }
    }
  };

  // Auto-detect OS for highlighting the appropriate section
  let detectedOs: 'mac' | 'windows' | 'linux' = 'mac';
  let selectedOs: 'mac' | 'windows' | 'linux' = 'mac';
  let detectedArch: 'x64' | 'arm' = 'x64';

  onMount(() => {
    // Simple OS detection
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('mac')) {
      detectedOs = 'mac';
      selectedOs = 'mac';
    } else if (userAgent.includes('win')) {
      detectedOs = 'windows';
      selectedOs = 'windows';
    } else if (userAgent.includes('linux')) {
      detectedOs = 'linux';
      selectedOs = 'linux';
    }

    // Simple architecture detection (not foolproof)
    if (userAgent.includes('arm') || !navigator.userAgent.match(/OS X 10_([789]|1[01234])/)) {
      detectedArch = 'arm';
    }

    // Scroll to OS section (smooth scroll)
    setTimeout(() => {
      const element = document.getElementById(`os-${selectedOs}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 500);
  });
</script>

<div class="pt-8">
  <div class="mx-auto max-w-6xl px-10 md:px-5">
    <!-- Header -->
    <div class="my-16 text-center">
      <span
        class="mb-4 inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
        v{downloads.mac.x64.version}
      </span>
      <h1 class="mb-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
        Download ViralMind Desktop
      </h1>
      <p class="mx-auto max-w-3xl text-xl text-gray-600">
        Get started with our desktop app for your platform and architecture
      </p>
    </div>

    <!-- OS Selection -->
    <div class="mb-10">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <!-- macOS -->
        <button
          id="os-mac"
          class="relative flex flex-col items-center justify-center overflow-hidden rounded-xl bg-white p-8 transition-all hover:bg-gray-50"
          class:bg-purple-50={selectedOs === 'mac'}
          class:ring-2={selectedOs === 'mac'}
          class:ring-purple-500={selectedOs === 'mac'}
          class:ring-offset-2={selectedOs === 'mac'}
          on:click={() => (selectedOs = 'mac')}>
          {#if detectedOs === 'mac'}
            <span class="mb-2 rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-800">
              Recommended
            </span>
          {/if}
          <i class="si si-apple mb-3 text-4xl text-gray-900"></i>
          <h3 class="text-xl font-semibold">macOS</h3>
        </button>

        <!-- Windows -->
        <button
          id="os-windows"
          class="relative flex flex-col items-center justify-center overflow-hidden rounded-xl bg-white p-8 transition-all hover:bg-gray-50"
          class:bg-purple-50={selectedOs === 'windows'}
          class:ring-2={selectedOs === 'windows'}
          class:ring-purple-500={selectedOs === 'windows'}
          class:ring-offset-2={selectedOs === 'windows'}
          on:click={() => (selectedOs = 'windows')}>
          {#if detectedOs === 'windows'}
            <span class="mb-2 rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-800">
              Recommended
            </span>
          {/if}
          <i class="si si-windows mb-3 text-4xl text-gray-900"></i>
          <h3 class="text-xl font-semibold">Windows</h3>
        </button>

        <!-- Linux -->
        <button
          id="os-linux"
          class="relative flex flex-col items-center justify-center overflow-hidden rounded-xl bg-white p-8 transition-all hover:bg-gray-50"
          class:bg-purple-50={selectedOs === 'linux'}
          class:ring-2={selectedOs === 'linux'}
          class:ring-purple-500={selectedOs === 'linux'}
          class:ring-offset-2={selectedOs === 'linux'}
          on:click={() => (selectedOs = 'linux')}>
          {#if detectedOs === 'linux'}
            <span class="mb-2 rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-800">
              Recommended
            </span>
          {/if}
          <i class="si si-linux mb-3 text-4xl text-gray-900"></i>
          <h3 class="text-xl font-semibold">Linux</h3>
        </button>
      </div>
    </div>

    <!-- Downloads -->
    <div class="mx-auto mb-12 max-w-3xl">
      {#if selectedOs === 'mac'}
        <h3 class="mb-6 text-center text-xl font-semibold text-gray-800">Download for macOS</h3>
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
          <!-- macOS x64 -->
          <div
            class="flex flex-col items-center rounded-xl border border-gray-100 bg-white p-6 shadow-sm {detectedArch ===
            'x64'
              ? 'ring-2 ring-purple-500'
              : ''}">
            <div class="mb-2 w-full text-center">
              <span class="text-lg font-medium">Intel (x64)</span>
              {#if detectedArch === 'x64'}
                <span class="ml-2 rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-800">
                  Recommended
                </span>
              {/if}
            </div>
            <a
              href={downloads.mac.x64.url}
              class="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r {detectedArch ===
              'x64'
                ? 'from-purple-600 to-blue-500'
                : 'from-gray-500 to-gray-600'} mb-3 px-6 py-3 text-center text-white shadow-md transition-all hover:from-purple-500 hover:to-blue-400">
              <Download class="h-5 w-5" />
              <span>Download</span>
            </a>
            <div class="mt-1 text-xs text-gray-500">
              Size: {downloads.mac.x64.size}
            </div>
            <div class="text-xs text-gray-500">
              MD5: {downloads.mac.x64.md5}
            </div>
          </div>

          <!-- macOS ARM -->
          <div
            class="flex flex-col items-center rounded-xl border border-gray-100 bg-white p-6 shadow-sm {detectedArch ===
            'arm'
              ? 'ring-2 ring-purple-500'
              : ''}">
            <div class="mb-2 w-full text-center">
              <span class="text-lg font-medium">Apple Silicon (ARM)</span>
              {#if detectedArch === 'arm'}
                <span class="ml-2 rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-800">
                  Recommended
                </span>
              {/if}
            </div>
            <a
              href={downloads.mac.arm.url}
              class="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r {detectedArch ===
              'arm'
                ? 'from-purple-600 to-blue-500'
                : 'from-gray-500 to-gray-600'} mb-3 px-6 py-3 text-center text-white shadow-md transition-all hover:from-purple-500 hover:to-blue-400">
              <Download class="h-5 w-5" />
              <span>Download</span>
            </a>
            <div class="mt-1 text-xs text-gray-500">
              Size: {downloads.mac.arm.size}
            </div>
            <div class="text-xs text-gray-500">
              MD5: {downloads.mac.arm.md5}
            </div>
          </div>
        </div>
      {:else if selectedOs === 'windows'}
        <h3 class="mb-6 text-center text-xl font-semibold text-gray-800">Download for Windows</h3>
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
          <!-- Windows x64 -->
          <div
            class="flex flex-col items-center rounded-xl border border-gray-100 bg-white p-6 shadow-sm {detectedArch ===
            'x64'
              ? 'ring-2 ring-purple-500'
              : ''}">
            <div class="mb-2 w-full text-center">
              <span class="text-lg font-medium">64-bit (x64)</span>
              {#if detectedArch === 'x64'}
                <span class="ml-2 rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-800">
                  Recommended
                </span>
              {/if}
            </div>
            <a
              href={downloads.windows.x64.url}
              class="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r {detectedArch ===
              'x64'
                ? 'from-purple-600 to-blue-500'
                : 'from-gray-500 to-gray-600'} mb-3 px-6 py-3 text-center text-white shadow-md transition-all hover:from-purple-500 hover:to-blue-400">
              <Download class="h-5 w-5" />
              <span>Download</span>
            </a>
            <div class="mt-1 text-xs text-gray-500">
              Size: {downloads.windows.x64.size}
            </div>
            <div class="text-xs text-gray-500">
              MD5: {downloads.windows.x64.md5}
            </div>
          </div>

          <!-- Windows ARM -->
          <div
            class="flex flex-col items-center rounded-xl border border-gray-100 bg-white p-6 shadow-sm {detectedArch ===
            'arm'
              ? 'ring-2 ring-purple-500'
              : ''}">
            <div class="mb-2 w-full text-center">
              <span class="text-lg font-medium">ARM</span>
              {#if detectedArch === 'arm'}
                <span class="ml-2 rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-800">
                  Recommended
                </span>
              {/if}
            </div>
            <a
              href={downloads.windows.arm.url}
              class="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r {detectedArch ===
              'arm'
                ? 'from-purple-600 to-blue-500'
                : 'from-gray-500 to-gray-600'} mb-3 px-6 py-3 text-center text-white shadow-md transition-all hover:from-purple-500 hover:to-blue-400">
              <Download class="h-5 w-5" />
              <span>Download</span>
            </a>
            <div class="mt-1 text-xs text-gray-500">
              Size: {downloads.windows.arm.size}
            </div>
            <div class="text-xs text-gray-500">
              MD5: {downloads.windows.arm.md5}
            </div>
          </div>
        </div>
      {:else if selectedOs === 'linux'}
        <h3 class="mb-6 text-center text-xl font-semibold text-gray-800">Download for Linux</h3>
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
          <!-- Linux x64 -->
          <div
            class="flex flex-col items-center rounded-xl border border-gray-100 bg-white p-6 shadow-sm {detectedArch ===
            'x64'
              ? 'ring-2 ring-purple-500'
              : ''}">
            <div class="mb-2 w-full text-center">
              <span class="text-lg font-medium">64-bit (x64)</span>
              {#if detectedArch === 'x64'}
                <span class="ml-2 rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-800">
                  Recommended
                </span>
              {/if}
            </div>
            <a
              href={downloads.linux.x64.url}
              class="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r {detectedArch ===
              'x64'
                ? 'from-purple-600 to-blue-500'
                : 'from-gray-500 to-gray-600'} mb-3 px-6 py-3 text-center text-white shadow-md transition-all hover:from-purple-500 hover:to-blue-400">
              <Download class="h-5 w-5" />
              <span>Download</span>
            </a>
            <div class="mt-1 text-xs text-gray-500">
              Size: {downloads.linux.x64.size}
            </div>
            <div class="text-xs text-gray-500">
              MD5: {downloads.linux.x64.md5}
            </div>
          </div>

          <!-- Linux ARM -->
          <div
            class="flex flex-col items-center rounded-xl border border-gray-100 bg-white p-6 shadow-sm {detectedArch ===
            'arm'
              ? 'ring-2 ring-purple-500'
              : ''}">
            <div class="mb-2 w-full text-center">
              <span class="text-lg font-medium">ARM</span>
              {#if detectedArch === 'arm'}
                <span class="ml-2 rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-800">
                  Recommended
                </span>
              {/if}
            </div>
            <a
              href={downloads.linux.arm.url}
              class="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r {detectedArch ===
              'arm'
                ? 'from-purple-600 to-blue-500'
                : 'from-gray-500 to-gray-600'} mb-3 px-6 py-3 text-center text-white shadow-md transition-all hover:from-purple-500 hover:to-blue-400">
              <Download class="h-5 w-5" />
              <span>Download</span>
            </a>
            <div class="mt-1 text-xs text-gray-500">
              Size: {downloads.linux.arm.size}
            </div>
            <div class="text-xs text-gray-500">
              MD5: {downloads.linux.arm.md5}
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>

  <!-- App Features -->
  <div class="mt-20 bg-gray-100 px-4 py-20">
    <h2 class="mb-10 text-center text-3xl font-bold text-gray-900">Features</h2>

    <div class="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2">
      <!-- Training Gym -->
      <div class="rounded-xl bg-white p-6">
        <div class="mb-4 flex items-start">
          <div class="flex-shrink-0 rounded-full bg-green-100 p-3">
            <Dumbbell class="h-6 w-6 text-green-600" />
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-semibold text-gray-900">Training Gym</h3>
            <p class="mt-2 text-gray-600">
              Train AI models by recording your computer interactions and earn rewards.
            </p>
          </div>
        </div>
      </div>

      <!-- The Forge -->
      <div class="rounded-xl bg-white p-6">
        <div class="mb-4 flex items-start">
          <div class="flex-shrink-0 rounded-full bg-yellow-100 p-3">
            <Hammer class="h-6 w-6 text-yellow-600" />
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-semibold text-gray-900">The Forge</h3>
            <p class="mt-2 text-gray-600">
              Create custom training gyms to collect high-quality data for computer-use AI agents.
            </p>
          </div>
        </div>
      </div>

      <!-- Local by Default -->
      <div class="rounded-xl bg-white p-6">
        <div class="mb-4 flex items-start">
          <div class="flex-shrink-0 rounded-full bg-purple-100 p-3">
            <Lock class="h-6 w-6 text-purple-600" />
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-semibold text-gray-900">Privacy by Default</h3>
            <p class="mt-2 text-gray-600">
              All of your data is stored locally on your machine until you press upload.
            </p>
          </div>
        </div>
      </div>

      <!-- No Account Needed -->
      <div class="rounded-xl bg-white p-6">
        <div class="mb-4 flex items-start">
          <div class="flex-shrink-0 rounded-full bg-blue-100 p-3">
            <UserX class="h-6 w-6 text-blue-600" />
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-semibold text-gray-900">No Account Needed</h3>
            <p class="mt-2 text-gray-600">
              No traditional account setup required - just connect your wallet and start using the
              app immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
