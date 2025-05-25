<script lang="ts">
  import logo_full from '$lib/assets/Logo_Standard_dark.png';
  import logo from '$lib/assets/logo.png';
  import exampleUsage from '$lib/assets/exampleusage.mp4';
  import data from '$lib/assets/databrwozing.mp4';
  import gym from '$lib/assets/gym.png';
  import ButtonCTA from '$lib/components/ButtonCTA.svelte';
  import { onMount } from 'svelte';

  let copied = false;
  function copyToClipboard() {
    navigator.clipboard.writeText('coming soon ---');
    copied = true;
    setTimeout(() => (copied = false), 2000);
  }
  import {
    Sparkles,
    Hammer,
    Dumbbell,
    Check,
    Bot,
    User,
    Search,
    PlayCircle,
    Book,
    Download,
    Github,
    Star,
    Coins,
    Info,
    Copy
  } from 'lucide-svelte';
  import type { SettingsRes } from '$lib/types';
  import VideoPopup from '$lib/components/VideoPopup.svelte';
  import posthog from 'posthog-js';

  // Dataset sample type definition
  type DatasetSample = {
    input: {
      screenshot: string;
      instruction: string;
    };
    action: string;
  };

  // Dataset samples
  let datasetSamples: DatasetSample[] = [];

  let dreamAgentInput = '';
  let placeholderIndex = 0;
  let estimatedAmount = 75000; // Default value
  let pricePerDemo = 5.5; // Default value
  let settings: SettingsRes;
  let showTrainingVideo = false;
  let showForgeVideo = false;
  let showAgentVideo = false;

  const placeholders = [
    'An agent that can book flights and hotels...',
    'An agent that can edit videos in Premiere Pro...',
    'An agent that can manage my email inbox...',
    'An agent that can create presentations...'
  ];

  onMount(() => {
    // Cycle through placeholders
    setInterval(() => {
      placeholderIndex = (placeholderIndex + 1) % placeholders.length;
    }, 3000);

    // Update estimates
    setInterval(() => {
      estimatedAmount = Math.floor(Math.random() * (100000 - 50000) + 50000);
      pricePerDemo = Math.floor(Math.random() * (6 - 5) * 10 + 50) / 10;
    }, 5000);

    // Fetch dataset samples
    fetch('/dataset_preview.json')
      .then(async (res) => {
        if (!res.ok) throw Error(res.status + ': ' + res.statusText);
        const data = await res.json();
        // Add data URI prefix to base64 encoded screenshots
        datasetSamples = data.map((sample: any) => ({
          ...sample,
          input: {
            ...sample.input,
            screenshot: sample.input.screenshot.startsWith('data:')
              ? sample.input.screenshot
              : `data:image/jpeg;base64,${sample.input.screenshot}`
          }
        }));
      })
      .catch((error) => {
        console.error('Failed to fetch dataset samples:', error);
        // Fallback data in case the fetch fails
        datasetSamples = [
          {
            input: {
              screenshot: 'data:image/png;base64,iVBOR...',
              instruction: 'Create a spreadsheet with monthly budget data'
            },
            action: 'click(156, 234)'
          },
          {
            input: {
              screenshot: 'data:image/png;base64,iVBOR...',
              instruction: 'Find and open the settings menu in Photoshop'
            },
            action: "type('Budget 2025')"
          },
          {
            input: {
              screenshot: 'data:image/png;base64,iVBOR...',
              instruction: 'Search for flights from New York to London'
            },
            action: 'doubleClick(450, 120)'
          }
        ];
      });

    // Fetch settings
    // fetch('/api/v1/settings')
    //   .then(async (res) => {
    //     if (!res.ok) throw Error(res.status + ': ' + res.statusText);
    //     const result = await res.json();
    //     settings = result.success ? result.data : result;
    //   })
    //   .catch((error) => {
    //     console.error('Failed to fetch settings:', error);
    //   });
  });

  function handleGenerateGym() {
    window.location.href = `/download`;
  }
</script>

<div class="min-h-screen">
  <!-- Hero Section -->
  <section class="relative bg-white">
    <div class="mx-auto max-w-7xl px-6 py-8 md:px-4 md:py-12">
      <div class="grid items-start gap-4 lg:grid-cols-2">
        <!-- Left Content -->
        <div>
          <img src={logo_full} alt="OmniMinds Logo" class="mb-6 hidden h-16 md:block" />
          <img src={logo} alt="OmniMinds Logo" class="mb-6 block h-16 md:hidden" />
          <h1 class="mb-4 text-5xl font-bold">
            <span
              class="bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
              Computer-Use AI for everyone.
            </span>
          </h1>
          <h2 class="mb-6 text-2xl font-semibold text-gray-800">
            We believe we can create a revolution.
          </h2>
          <p class="mb-6 text-xl text-gray-600">
            <!-- Join us in pioneering the future of AI through crowdsourced computer-use demonstrations. We're accelerating frontier AI with open-source datasets and tools, making powerful computer-use agents accessible to everyone. -->
            Building the foundation for powerful computer-use agents through crowdsourced action datasets,
            open-source tools, and frontier agent models. We want to improve the world by providing amazing
            computer-use agents.
          </p>
          <div class="flex flex-col gap-4">
            <div class="flex flex-col items-center gap-4 sm:flex-row">
              <a
                href="https://t.me/omnimindsai"
                target="_blank"
                class="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-purple-500 px-6 py-3 text-white transition-colors hover:from-purple-700 hover:to-purple-600">

                <svg class="h-12 w-12" viewBox="0 0 24 24" fill="#FFF">
                  <path d="M12 4C10.4178 4 8.87103 4.46919 7.55544 5.34824C6.23985 6.22729 5.21447 7.47672 4.60897 8.93853C4.00347 10.4003 3.84504 12.0089 4.15372 13.5607C4.4624 15.1126 5.22433 16.538 6.34315 17.6569C7.46197 18.7757 8.88743 19.5376 10.4393 19.8463C11.9911 20.155 13.5997 19.9965 15.0615 19.391C16.5233 18.7855 17.7727 17.7602 18.6518 16.4446C19.5308 15.129 20 13.5823 20 12C20 9.87827 19.1571 7.84344 17.6569 6.34315C16.1566 4.84285 14.1217 4 12 4ZM15.93 9.48L14.62 15.67C14.52 16.11 14.26 16.21 13.89 16.01L11.89 14.53L10.89 15.46C10.8429 15.5215 10.7824 15.5715 10.7131 15.6062C10.6438 15.6408 10.5675 15.6592 10.49 15.66L10.63 13.66L14.33 10.31C14.5 10.17 14.33 10.09 14.09 10.23L9.55 13.08L7.55 12.46C7.12 12.33 7.11 12.03 7.64 11.83L15.35 8.83C15.73 8.72 16.05 8.94 15.93 9.48Z"/>
                </svg>

                Join Telegram
              </a>
<!--              <a-->
<!--                href="https://github.com/omni/desktop"-->
<!--                target="_blank"-->
<!--                class="group inline-flex items-center gap-2 px-6 py-3 text-gray-900">-->
<!--                <Star class="h-5 w-5" />-->
<!--                <span class="animated-underline">Star on GitHub</span>-->
<!--              </a>-->
            </div>
          </div>
        </div>

        <!-- Right Content -->
        <div class="relative bottom-0 rounded-xl">
          <video src={exampleUsage} autoplay loop muted playsinline class=" -mr-[25%] w-[125%]">
          </video>
          <div
            class="absolute bottom-0 left-0 -mr-[25%] h-64 w-full bg-gradient-to-t from-white to-transparent md:w-[125%]">
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Download Section -->
  <section class="bg-gray-100 py-20">
    <div class="mx-auto max-w-6xl px-4 text-center">
      <h2 class="mb-4 text-4xl font-bold text-gray-900">AI agents built from your data</h2>
      <p class="mb-8 text-xl text-gray-600">Start earning while contributing skills</p>
      <div class="flex flex-col items-center gap-3">
        <div class="flex justify-center gap-4">
          <ButtonCTA href="/download" class="inline-flex items-center gap-2">
            <Download class="h-5 w-5" />
            Download for Desktop
          </ButtonCTA>
          <a
            href="https://github.com/omniminds-ai"
            target="_blank"
            class="group inline-flex items-center gap-2 px-6 py-3 text-gray-900">
            <Github class="h-5 w-5" />
            <span class="animated-underline">View Source</span>
          </a>
        </div>
      </div>
    </div>
  </section>

  <!-- Features Section -->
  <section class="bg-gray-50">
    <div class="mx-auto flex max-w-6xl flex-col gap-24 px-4 py-12">
      <!-- Training Gym -->
      <div class="mb-20 grid items-center gap-12 lg:grid-cols-2">
        <div class="relative overflow-hidden rounded bg-gray-100 shadow-2xl">
          <img src={gym} alt="Training Gym Demo" class="h-full w-full object-cover" />
        </div>
        <div class="text-left">
          <div
            class="mb-3 inline-block rounded-full bg-purple-100 px-4 py-1 text-sm font-medium text-purple-800">
            Earn $TOKEN by sharing data
          </div>
          <div class="mb-4 flex items-center gap-3">
            <div
              class="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-700/5 to-purple-500/5">
              <Dumbbell class="h-6 w-6 text-purple-700" />
            </div>
            <h2 class="text-3xl font-bold text-gray-900">Training Gym</h2>
          </div>
          <p class="mb-6 text-lg text-gray-600">
            Show AI how to use apps, earn rewards. Get instant $TOKEN payments when you upload
            demonstrations.
          </p>
          <button
            on:click={() => {
              showTrainingVideo = true;
              posthog.capture('watch_training_demo');
            }}
            class="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-gray-900 shadow transition-colors hover:bg-gray-50">
            <PlayCircle class="h-5 w-5" />
            Watch Demo
          </button>
          <VideoPopup videoId="cUjI2f7w4yM" bind:isOpen={showTrainingVideo} />
        </div>
      </div>

      <!-- The Forge -->
      <div class="mb-20 grid items-center gap-12 lg:grid-cols-2">
        <div class="order-2 text-left lg:order-1">
          <div
            class="mb-3 inline-block rounded-full bg-purple-100 px-4 py-1 text-sm font-medium text-purple-800">
            Spend $TOKEN to build powerful AI
          </div>
          <div class="mb-4 flex items-center gap-3">
            <div
              class="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-700/5 to-purple-500/5">
              <Hammer class="h-6 w-6 text-purple-700" />
            </div>
            <h2 class="text-3xl font-bold text-gray-900">The Forge</h2>
          </div>
          <p class="mb-6 text-lg text-gray-600">
            Specify your AI needs, we'll handle the rest. Quality demonstrations at scale train your
            specialized agent.
          </p>
          <button
            on:click={() => {
              showForgeVideo = true;
              posthog.capture('watch_forge_demo');
            }}
            class="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-gray-900 shadow transition-colors hover:bg-gray-50">
            <PlayCircle class="h-5 w-5" />
            Watch Demo
          </button>
          <VideoPopup videoId="5N0zWHcLYho" bind:isOpen={showForgeVideo} />
        </div>
        <div
          class="relative order-1 rounded-xl border border-gray-100 bg-white p-8 shadow-2xl lg:order-2">
          <div class="mb-6">
            <div class="mb-3 flex items-center gap-2">
              <h3 class="text-xl font-semibold text-gray-900">Describe your dream agent</h3>
              <Sparkles class="h-5 w-5 text-yellow-400" />
            </div>
            <div class="relative">
              <input
                type="text"
                disabled
                bind:value={dreamAgentInput}
                placeholder={placeholders[placeholderIndex]}
                class="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-purple-700 focus:ring-purple-700" />
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <Hammer class="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          <div class="mb-6 rounded-lg bg-gray-50 p-4">
            <div class="mb-2 text-sm font-medium text-gray-700">Estimated Requirements</div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <div class="text-2xl font-bold text-purple-900">
                  {estimatedAmount.toLocaleString()}
                </div>
                <div class="text-sm text-gray-600">$TOKEN Required</div>
              </div>
              <div>
                <div class="text-2xl font-bold text-purple-900">
                  {Math.floor(estimatedAmount / pricePerDemo).toLocaleString()}
                </div>
                <div class="text-sm text-gray-600">Demonstrations</div>
              </div>
            </div>
            <div class="mt-2 text-sm text-gray-500">
              At {pricePerDemo} $TOKEN per demonstration
            </div>
          </div>

<!--          <div>-->
<!--            <button-->
<!--              on:click={handleGenerateGym}-->
<!--              class="w-full rounded-lg bg-gradient-to-r from-purple-900 to-purple-500 px-6 py-3 text-white transition-colors hover:from-purple-700 hover:to-purple-600">-->
<!--              Create a Gym in the App-->
<!--            </button>-->
<!--          </div>-->
        </div>
      </div>

      <!-- Agent Chat -->
      <div class="grid items-center gap-12 lg:grid-cols-2">
        <div
          class="relative order-2 aspect-video overflow-hidden rounded-xl border shadow-2xl lg:order-1">
          <div class="absolute inset-0 bg-gray-50 backdrop-blur-sm"></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="w-full max-w-lg space-y-4 p-6">
              <!-- Bot Welcome -->
              <div class="flex items-start gap-2">
                <div class="flex h-6 w-6 items-center justify-center rounded-full bg-purple-700/20">
                  <Bot class="h-4 w-4 text-purple-400" />
                </div>
                <div class="rounded-lg bg-purple-100 px-3 py-2 text-sm text-purple-900">
                  <p>
                    Hi! I'm VM-1, your computer-use assistant. What would you like help with? 🖥️
                  </p>
                </div>
              </div>

              <!-- User Request -->
              <div class="flex flex-row-reverse items-start gap-2">
                <div class="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/20">
                  <User class="h-4 w-4 text-purple-400" />
                </div>
                <div class="rounded-lg bg-purple-100 px-3 py-2 text-sm text-purple-900">
                  <p>Can you help me find a good Italian restaurant nearby that's open late?</p>
                </div>
              </div>

              <!-- Bot Response -->
              <div class="flex items-start gap-2">
                <div class="flex h-6 w-6 items-center justify-center rounded-full bg-purple-700/20">
                  <Bot class="h-4 w-4 text-purple-400" />
                </div>
                <div class="space-y-2">
                  <div class="rounded-lg bg-purple-100 px-3 py-2 text-sm text-purple-900">
                    <p>
                      I'll help you find a great late-night Italian spot! Let me check DoorDash for
                      you.
                    </p>
                  </div>
                  <div
                    class="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-xs text-gray-600">
                    <Search class="h-4 w-4 animate-pulse text-gray-400" />
                    Searching DoorDash...
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="order-1 text-left lg:order-2">
          <div class="mb-3 flex flex-wrap gap-2">
            <div
              class="inline-block rounded-full bg-purple-100 px-4 py-1 text-sm font-medium text-purple-800">
              Coming Soon
            </div>
          </div>
          <div class="mb-4 flex items-center gap-3">
            <div
              class="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-700/5 to-purple-500/5">
              <Bot class="h-6 w-6 text-purple-700" />
            </div>
            <h2 class="text-3xl font-bold text-gray-900">VM-1 Computer Use Agent</h2>
          </div>
          <p class="mb-6 text-lg text-gray-600">
            Complete computer tasks with VM-1, a state-of-the-art computer-use agent trained with
            the data generated by the community.
          </p>

          <button
            on:click={() => {
              showAgentVideo = true;
              posthog.capture('watch_agent_demo');
            }}
            class="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-gray-900 shadow transition-colors hover:bg-gray-50">
            <PlayCircle class="h-5 w-5" />
            Watch Demo
          </button>
          <VideoPopup videoId="VVj7I1SyTI8" bind:isOpen={showAgentVideo} />
        </div>
      </div>

      <!-- The Data -->
      <div class="mb-20 grid items-center gap-12 lg:grid-cols-2">
        <div class="text-left">
          <div class="mb-3 flex flex-wrap gap-2">
            <div
              class="inline-block rounded-full bg-green-100 px-4 py-1 text-sm font-medium text-green-800">
              Open Data
            </div>
            <div
              class="inline-block rounded-full bg-purple-100 px-4 py-1 text-sm font-medium text-purple-800">
              Early Access
            </div>
          </div>
          <div class="mb-4 flex items-center gap-3">
            <div
              class="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-700/5 to-purple-500/5">
              <Book class="h-6 w-6 text-purple-700" />
            </div>
            <h2 class="text-3xl font-bold text-gray-900">Video-Language-Action Dataset</h2>
          </div>
          <p class="mb-6 text-left text-lg text-gray-600">
            The first open dataset of its kind, designed for frontier action models that live on the
            desktop.
          </p>
<!--          <a-->
<!--            href="/datasets"-->
<!--            class="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-gray-900 shadow transition-colors hover:bg-gray-50">-->
<!--            <Book class="h-5 w-5" />-->
<!--            Learn More-->
<!--          </a>-->
        </div>
        <div
          class="relative h-[400px] overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-2xl">
          <div class="mb-3 flex items-center justify-between text-sm font-medium text-gray-700">
            <span>Dataset Preview</span>
            <span class="text-xs text-gray-500">5M+ samples</span>
          </div>
          <!-- Filters row -->
          <div class="mb-3 flex items-center gap-2 text-xs text-gray-600 opacity-50">
            <span class="mr-1">Filters:</span>
            <div class="flex items-center gap-1">
              <div
                class="inline-flex h-4 w-4 items-center justify-center rounded border border-gray-300 bg-purple-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  class="h-3 w-3 text-purple-900">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <span>video</span>
            </div>
            <div class="flex items-center gap-1">
              <div
                class="inline-flex h-4 w-4 items-center justify-center rounded border border-gray-300 bg-purple-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  class="h-3 w-3 text-purple-900">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <span>task</span>
            </div>
            <div class="flex items-center gap-1">
              <div
                class="inline-flex h-4 w-4 items-center justify-center rounded border border-gray-300 bg-purple-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  class="h-3 w-3 text-purple-900">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <span>action</span>
            </div>
            <div class="flex items-center gap-1">
              <div
                class="inline-flex h-4 w-4 items-center justify-center rounded border border-gray-300">
              </div>
              <span>uitree</span>
            </div>
            <div class="flex items-center gap-1">
              <div
                class="inline-flex h-4 w-4 items-center justify-center rounded border border-gray-300">
              </div>
              <span>reward</span>
            </div>
          </div>
          <div class="relative h-[350px] overflow-hidden">
            <!-- White overlay for scroll area -->
            <div
              class="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-white via-transparent to-white opacity-75">
            </div>
            <div class="grid h-full grid-cols-2 gap-2">
              <!-- Left Column - Scrolling Down -->
              <div class="relative overflow-y-hidden pr-1">
                <div class="animate-scroll-down">
                  {#each datasetSamples as sample, i}
                    {#if i % 2 === 0}
                      <div
                        class="mb-2 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 p-3 text-gray-800 shadow-sm">
                        <!-- Image at 50% size -->
                        <div
                          class="bg-gray-10 mx-auto mb-3 aspect-video overflow-hidden rounded border shadow shadow-sm">
                          <img
                            src={sample.input.screenshot}
                            alt="Screenshot"
                            class="h-full w-full object-cover" />
                        </div>

                        <!-- Task section -->
                        <div class="mb-3">
                          <div class="font-mono text-xs font-bold text-gray-400">task</div>
                          <div class="font-mono text-xs">
                            <code class="text-black">{sample.input.instruction}</code>
                          </div>
                        </div>

                        <!-- Action section -->
                        <div>
                          <div class="font-mono text-xs font-bold text-gray-400">action</div>
                          <div class="font-mono text-xs">
                            <code class="text-black">{sample.action}</code>
                          </div>
                        </div>
                      </div>
                    {/if}
                  {/each}
                </div>
              </div>

              <!-- Right Column - Scrolling Up -->
              <div class="relative overflow-y-hidden pl-1">
                <div class="animate-scroll-up">
                  {#each datasetSamples as sample, i}
                    {#if i % 2 === 1}
                      <div
                        class="mb-2 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 p-3 text-gray-800 shadow-sm">
                        <div
                          class="mx-auto mb-3 aspect-video overflow-hidden rounded border bg-gray-100 shadow shadow-sm">
                          <img
                            src={sample.input.screenshot}
                            alt="Screenshot"
                            class="h-full w-full object-cover" />
                        </div>

                        <!-- Task section -->
                        <div class="mb-3">
                          <div class="font-mono text-xs font-bold text-gray-400">task</div>
                          <div class="font-mono text-xs">
                            <code class="text-black">{sample.input.instruction}</code>
                          </div>
                        </div>

                        <!-- Action section -->
                        <div>
                          <div class="font-mono text-xs font-bold text-gray-400">action</div>
                          <div class="font-mono text-xs">
                            <code class="text-black">{sample.action}</code>
                          </div>
                        </div>
                      </div>
                    {/if}
                  {/each}<div class="mt-12 text-center">-->
                  <!--        <h2 class="mb-4 text-3xl font-bold text-gray-900">Ready to get started?</h2>-->
                  <!--        <p class="mx-auto mb-6 max-w-2xl text-lg text-gray-600">-->
                  <!--          Contribute to the future of AI assistance with our desktop app. Download now and join our-->
                  <!--          growing community.-->
                  <!--        </p>-->
                  <!--        <div class="flex justify-center">-->
                  <!--          <ButtonCTA href="/download" class="inline-flex items-center gap-2">-->
                  <!--            <Download class="h-5 w-5" />-->
                  <!--            Download for Desktop-->
                  <!--          </ButtonCTA>-->
                  <!--        </div>-->
                  <!--      </div>-->
                  <!--    </
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <!-- Ready to Get Started -->

        </div>
  </section>

  <!-- FAQ Section -->
<!--  <section class="bg-gray-100 py-20">-->
<!--    <div class="mx-auto max-w-6xl px-4">-->
<!--      <h2 class="mb-12 text-center text-4xl font-bold text-gray-900">Frequently Asked Questions</h2>-->

<!--      {#if settings?.faq}-->
<!--        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">-->
<!--          {#each settings.faq as faq}-->
<!--            <div class="rounded-lg p-6">-->
<!--              <h3 class="mb-3 text-lg font-semibold text-gray-900">{faq.question}</h3>-->
<!--              <p class="text-gray-600">{faq.answer}</p>-->
<!--            </div>-->
<!--          {/each}-->
<!--        </div>-->
<!--      {/if}-->
<!--    </div>-->
<!--  </section>-->
</div>
