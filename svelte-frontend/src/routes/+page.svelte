<script lang="ts">
  import { onMount } from 'svelte';
  import {
    MousePointerClick,
    Trophy,
    Coins,
    Command,
    History,
    Dumbbell,
    HelpCircle,
    MessageCircle,
    ChevronDown,
    ChevronUp
  } from 'lucide-svelte';
  import demoVideo from '$lib/assets/demo.mp4';

  const faqs = [
    {
      q: 'What is VM-1?',
      a: 'VM-1 is our first computer-use model that can control computers just like humans do, without requiring APIs or special integrations.'
    },
    {
      q: 'How do I earn $VIRAL?',
      a: 'You can earn $VIRAL by participating in training races, providing quality demonstrations, and winning tournaments.'
    },
    {
      q: "What's the difference between Tournaments and Training?",
      a: 'In tournaments, you command the AI agent step-by-step for the entire pot. In training, you demonstrate actions and earn rewards based on quality.'
    },
    {
      q: 'Do I need to stake tokens?',
      a: 'Not always! Free races only require holding $VIRAL. Staked races offer higher rewards but require token staking.'
    }
  ];

  let faqOpen = Array(faqs.length).fill(false);
  let mousePosition = { x: 0, y: 0 };

  function handleMouseMove(event: MouseEvent) {
    mousePosition.x = (event.clientX / window.innerWidth) * 100;
    mousePosition.y = (event.clientY / window.innerHeight) * 100;
  }

  function toggleFaq(index: number) {
    faqOpen[index] = !faqOpen[index];
    faqOpen = [...faqOpen]; // Trigger reactivity
  }

  onMount(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  });
</script>

<!-- Main Hero Section -->
<div class="min-h-screen bg-black pb-24 text-white">
  <div class="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
    <!-- Video Background with Mask -->
    <div class="absolute inset-0 z-0">
      <div class="absolute inset-0 flex items-start justify-center overflow-hidden">
        <div class="relative h-full w-full">
          <!-- Video container with gradient -->
          <div class="absolute w-[100%]">
            <video autoplay loop muted playsinline class="w-full opacity-25">
              <source src={demoVideo} type="video/mp4" />
            </video>
            <!-- Gradient overlay contained within video bounds -->
            <div
              class="absolute inset-0"
              style="background: linear-gradient(to bottom, 
                                                 rgba(0,0,0,0) 0%, 
                                                 rgba(0,0,0,0.5) 40%, 
                                                 rgba(0,0,0,0.9) 70%, 
                                                 rgba(0,0,0,1) 90%);"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <div class="relative z-10 mx-auto w-full max-w-4xl px-4 text-center">
      <h2 class="my-2 mt-8 text-lg drop-shadow-lg">Pure Computer Control × Crypto Intelligence</h2>
      <h1 class="mb-4 text-5xl font-bold drop-shadow-lg md:text-6xl">
        The Next Meta<br />
        in Agentic AI<br />
        <span class="mt-2 text-3xl text-gray-400">is coming</span>
      </h1>

      <!-- VM-1 Logo -->
      <div class="relative mb-24 mt-12">
        <!-- VM-1 Text with enhanced shadows -->
        <div class="relative my-24">
          <div
            class="relative z-10 bg-gradient-to-b from-purple-400 to-purple-900 bg-clip-text text-8xl font-bold text-transparent opacity-20 blur-sm drop-shadow-xl md:text-9xl"
          >
            VM-1
          </div>
          <div class="absolute inset-0 z-20 flex flex-col items-center justify-center">
            <div
              class="bg-gradient-to-b from-purple-500 to-purple-900 bg-clip-text text-8xl font-bold text-transparent drop-shadow-xl md:text-9xl"
            >
              VM-1
            </div>
            <div class="mt-4 text-xl text-gray-400 drop-shadow-lg">
              Our First Computer-Use Model
            </div>
          </div>
        </div>

        <!-- Developer CTAs -->
        <div class="relative z-20 mt-16">
          <p class="mb-4 text-gray-400 drop-shadow-lg">Ready to Build Something Insane?</p>
          <div class="flex justify-center">
            <a
              href="https://t.me/viralmind"
              target="_blank"
              class="flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-3 font-semibold shadow-lg transition-opacity hover:opacity-90"
            >
              <MessageCircle class="h-5 w-5" />
              Join Our Telegram for Updates
            </a>
          </div>
        </div>
      </div>

      <!-- Card Sections -->
      <div class="mt-12 space-y-8">
        <!-- Training Gym Card -->
        <div class="rounded-3xl bg-stone-900/25 p-12 shadow-2xl backdrop-blur-md">
          <h3
            class="mb-2 bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-2xl font-semibold text-transparent drop-shadow-lg md:text-3xl"
          >
            Earn $VIRAL. Shape The Future.
          </h3>
          <p class="mb-8 text-gray-400">Train Agents through Demonstration</p>

          <!-- Race Types -->
          <div class="mb-8 grid gap-6 text-left md:grid-cols-2">
            <div class="rounded-xl bg-black/30 p-6">
              <div class="mb-2 flex items-center gap-2">
                <MousePointerClick class="h-5 w-5 text-purple-400" />
                <h4 class="font-semibold text-purple-400">Free Races</h4>
              </div>
              <p class="text-sm text-gray-400">
                Hold $VIRAL and join races to earn from treasury-funded pools. No risk, pure reward.
              </p>
            </div>
            <div class="rounded-xl bg-black/30 p-6">
              <div class="mb-2 flex items-center gap-2">
                <Coins class="h-5 w-5 text-purple-400" />
                <h4 class="font-semibold text-purple-400">Staked Races</h4>
              </div>
              <p class="text-sm text-gray-400">
                Stake $VIRAL to join high-reward races. Win big from redistributed stakes.
              </p>
            </div>
          </div>

          <div class="text-center">
            <button
              class="mx-auto flex items-center justify-center gap-2 rounded-full bg-purple-600 px-8 py-3 font-semibold transition-colors hover:bg-purple-700"
            >
              <Dumbbell class="h-5 w-5" />
              Enter Training Gym →
            </button>
          </div>
        </div>

        <!-- Tournament Card -->
        <div class="rounded-3xl bg-stone-900/25 p-12 shadow-2xl backdrop-blur-md">
          <h3
            class="mb-2 bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-2xl font-semibold text-transparent drop-shadow-lg md:text-3xl"
          >
            Command & Conquer
          </h3>
          <p class="mb-8 text-gray-400">Direct the AI Agent, Win the Entire Pot</p>

          <div class="mx-auto mb-8 grid max-w-lg grid-cols-3 gap-4 text-center">
            <div class="space-y-2">
              <div class="mb-2 flex justify-center">
                <MousePointerClick class="h-6 w-6 text-purple-500" />
              </div>
              <div class="text-2xl font-bold">500</div>
              <div class="text-sm text-gray-400">demonstrations</div>
            </div>

            <div class="space-y-2">
              <div class="mb-2 flex justify-center">
                <Trophy class="h-6 w-6 text-purple-500" />
              </div>
              <div class="text-2xl font-bold">129</div>
              <div class="text-sm text-gray-400">trainers</div>
            </div>

            <div class="space-y-2">
              <div class="mb-2 flex justify-center">
                <Coins class="h-6 w-6 text-purple-500" />
              </div>
              <div class="text-2xl font-bold">$5,435</div>
              <div class="text-sm text-gray-400">paid out</div>
            </div>
          </div>

          <div class="space-y-4 text-center">
            <button
              class="rounded-full bg-purple-600 px-8 py-3 font-semibold transition-colors hover:bg-purple-700"
            >
              Join Tournament →
            </button>
            <div>
              <button
                class="mx-auto flex items-center gap-2 text-gray-400 transition-colors hover:text-white"
              >
                <History class="h-4 w-4" />
                See Past Tournaments
              </button>
            </div>
          </div>
        </div>

        <!-- Token Section -->
        <div class="rounded-3xl bg-stone-900/25 p-12 shadow-2xl backdrop-blur-md">
          <h3
            class="mb-8 bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-2xl font-semibold text-transparent drop-shadow-lg md:text-3xl"
          >
            $VIRAL Token
          </h3>

          <div class="grid gap-8 md:grid-cols-2">
            <div class="space-y-4">
              <h4 class="text-xl font-semibold text-purple-400">For Developers</h4>
              <ul class="space-y-2 text-gray-400">
                <li>• Deploy AI agents</li>
                <li>• Access VM-1 inference</li>
                <li>• Participate in governance</li>
              </ul>
            </div>

            <div class="space-y-4">
              <h4 class="text-xl font-semibold text-purple-400">For Trainers</h4>
              <ul class="space-y-2 text-gray-400">
                <li>• Enter training races</li>
                <li>• Earn from demonstrations</li>
                <li>• Stake for higher rewards</li>
              </ul>
            </div>
          </div>

          <div class="mt-8 rounded-xl bg-black/30 p-6">
            <p class="text-gray-400">Contract Address:</p>
            <code class="text-sm text-purple-400">HW7D5MyYG4Dz2C98axfjVBeLWpsEnofrqy6ZUwqwpump</code
            >
          </div>
        </div>

        <!-- FAQ Section -->
        <div class="rounded-3xl bg-stone-900/25 p-12 shadow-2xl backdrop-blur-md" id="faq">
          <h3
            class="mb-8 bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-2xl font-semibold text-transparent drop-shadow-lg md:text-3xl"
          >
            Frequently Asked Questions
          </h3>

          {#each faqs as faq, i}
            <div class="mb-4">
              <button
                class="flex w-full items-center justify-between rounded-xl bg-black/30 p-4 transition-colors hover:bg-black/40"
                on:click={() => toggleFaq(i)}
              >
                <span class="font-semibold">{faq.q}</span>
                {#if faqOpen[i]}
                  <ChevronUp class="h-5 w-5" />
                {:else}
                  <ChevronDown class="h-5 w-5" />
                {/if}
              </button>

              {#if faqOpen[i]}
                <div class="p-4 text-gray-400">
                  {faq.a}
                </div>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    </div>

    <!-- Background effects -->
    <div class="absolute inset-0 z-[1] bg-gradient-to-b from-purple-900/20 to-black"></div>
    <div
      class="absolute inset-0 z-[2] transition-transform duration-1000 ease-out"
      style="background: radial-gradient(600px circle at {mousePosition.x}% {mousePosition.y}%, rgb(147, 51, 234, 0.15), transparent 40%); 
             transform: translate({(mousePosition.x - 50) * -0.05}px, {(mousePosition.y - 50) *
        -0.05}px)"
    ></div>
    <div class="absolute inset-0 z-[3] bg-gradient-to-b from-black via-transparent to-black"></div>
  </div>
</div>

<style>
  :global(body) {
    background-color: black;
  }

  /* Add a subtle text shadow to all text elements */
  :global(.text-white),
  :global(.text-gray-400),
  :global(.text-purple-400) {
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }
</style>
