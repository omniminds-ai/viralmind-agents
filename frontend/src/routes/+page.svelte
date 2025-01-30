<script lang="ts">
  import { onMount } from 'svelte';
  import {
    Coins,
    MessageCircle,
    ChevronDown,
    ChevronUp,
    ArrowRight,
    Gamepad2,
    MonitorPlay,
    Bot,
    User,
    Star,
    Sparkles,
    Activity,
    Dumbbell,
    Trophy
  } from 'lucide-svelte';
  import ButtonCTA from '$lib/components/ButtonCTA.svelte';
  import ContractInfo from '$lib/components/ContractInfo.svelte';
  import type { SettingsRes } from '$lib/types';
  import ViralMetrics from '$lib/components/ViralMetrics.svelte';
  import Card from '$lib/components/Card.svelte';

  const TOKEN_DATA = {
    contractAddress: 'HW7D5MyYG4Dz2C98axfjVBeLWpsEnofrqy6ZUwqwpump',
    dexscreenerUrl: 'https://dexscreener.com/solana/HW7D5MyYG4Dz2C98axfjVBeLWpsEnofrqy6ZUwqwpump'
  };

  let settings: SettingsRes;
  let faqOpen = Array(4).fill(false);
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

    // Fetch settings
    fetch('/api/settings')
      .then(async (res) => {
        if (!res.ok) throw Error(res.status + ': ' + res.statusText);
        const data = await res.json();
        settings = data;
        console.log('Settings data:', settings);
        console.log('Active/Upcoming tournament:', settings.activeChallenge);
        console.log('Latest tournament:', settings.concludedChallenges?.[0]);
        faqOpen = Array(settings.faq?.length).fill(false);
      })
      .catch((error) => {
        console.error('Failed to fetch settings:', error);
      });

    return () => window.removeEventListener('mousemove', handleMouseMove);
  });
</script>

<div class="min-h-screen text-white">
  <!-- Hero Section -->
  <div class="relative min-h-screen">
    <div class="from-primary-500 via-primary-500 bg-gradient-to-b to-purple-900">
      <div
        class="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-4"
      >
        <div class="grid items-center gap-12 lg:grid-cols-2">
          <!-- Left Content -->
          <div class="text-left">
            <h1 class="mb-8 text-6xl font-bold leading-tight md:text-7xl lg:text-8xl">
              Play. Earn. Train. <span class="text-purple-400">Computer-Use Agents.</span>
            </h1>
            <p class="mb-4 text-xl text-gray-300 md:text-2xl">
              Turn powerful foundation models into capable computer-use agents.
            </p>
            <p class="mb-12 text-lg text-gray-400">
              Open-source has ZERO desktop computer-use datasets. We're changing that with the
              Training Gym - the ONLY platform that collects high-quality data for fine-tuning
              state-of-the-art models like DeepSeek and Qwen VL into powerful computer-use agents.
              Get instantly rewarded for contributing to the future of AI.
            </p>
            <div class="flex flex-col gap-4 sm:flex-row">
              <ButtonCTA href="/gym">
                Start Training
                <ArrowRight class="h-5 w-5" />
              </ButtonCTA>
              <ButtonCTA href="https://docs.viralmind.ai" variant="secondary">View Docs</ButtonCTA>
            </div>
            <div class="py-4">
              <ButtonCTA
                href="https://github.com/viralmind-ai/viralmind-agents"
                variant="secondary"
              >
                <Star />
                Star on GitHub
              </ButtonCTA>
            </div>
          </div>

          <!-- Right Content - Abstract Sphere -->
          <div class="relative aspect-square">
            <svg viewBox="0 0 400 400" class="h-full w-full">
              <defs>
                <radialGradient id="sphereGradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stop-color="rgb(147, 51, 234)" stop-opacity="0.6" />
                  <stop offset="100%" stop-color="rgb(147, 51, 234)" stop-opacity="0" />
                </radialGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="8" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <!-- Base Sphere -->
              <circle
                cx="200"
                cy="200"
                r="150"
                fill="url(#sphereGradient)"
                filter="url(#glow)"
                class="animate-pulse"
              />

              <!-- Orbital Rings -->
              <g class="animate-spin" style="transform-origin: center; animation-duration: 20s;">
                <circle
                  cx="200"
                  cy="200"
                  r="180"
                  fill="none"
                  stroke="rgba(147, 51, 234, 0.3)"
                  stroke-width="1"
                  stroke-dasharray="4 4"
                />
              </g>

              <g class="animate-spin" style="transform-origin: center; animation-duration: 15s;">
                <circle
                  cx="200"
                  cy="200"
                  r="160"
                  fill="none"
                  stroke="rgba(147, 51, 234, 0.4)"
                  stroke-width="1"
                  stroke-dasharray="4 4"
                />
              </g>

              <!-- Floating Particles -->
              <circle cx="320" cy="200" r="4" fill="rgb(147, 51, 234)" class="animate-pulse">
                <animateMotion dur="8s" repeatCount="indefinite" path="M 0 0 C 50 -50 50 50 0 0" />
              </circle>

              <circle cx="200" cy="80" r="3" fill="rgb(147, 51, 234)" class="animate-pulse">
                <animateMotion dur="6s" repeatCount="indefinite" path="M 0 0 C -30 30 30 30 0 0" />
              </circle>

              <circle cx="80" cy="200" r="5" fill="rgb(147, 51, 234)" class="animate-pulse">
                <animateMotion
                  dur="10s"
                  repeatCount="indefinite"
                  path="M 0 0 C 40 -40 -40 40 0 0"
                />
              </circle>
            </svg>
            <!-- Floating Video Elements -->
            <div class="absolute inset-0">
              <!-- Video 1 -->
              <div
                class="animate-float-1 absolute left-[30%] top-[10%] h-32 w-48 overflow-hidden rounded-lg sm:left-[45%]"
                style="transform: perspective(1000px) rotateX(10deg) rotateY(-20deg);"
              >
                <video autoplay loop muted playsinline class="h-full w-full object-cover">
                  <source src="https://cdn.viralmind.ai/demo.mp4" type="video/mp4" />
                </video>
                <div class="backdrop-blur-xs absolute inset-0 bg-purple-500/20"></div>
              </div>

              <!-- Video 2 -->
              <div
                class="animate-float-2 absolute hidden h-32 w-48 overflow-hidden rounded-lg sm:block"
                style="top: 40%; right: 65%; transform: perspective(1000px) rotateX(-15deg) rotateY(25deg);"
              >
                <img
                  src="https://cdn.viralmind.ai/csgo-ai.gif"
                  alt="Demo"
                  class="h-full w-full object-cover"
                />
                <div class="backdrop-blur-xs absolute inset-0 bg-purple-500/20"></div>
              </div>

              <!-- Video 3 -->
              <div
                class="animate-float-3 absolute bottom-[5%] right-[40%] h-32 w-48 overflow-hidden rounded-lg lg:bottom-[15%] lg:left-[55%]"
                style="transform: perspective(1000px) rotateX(20deg) rotateY(-15deg);"
              >
                <video autoplay loop muted playsinline class="h-full w-full object-cover">
                  <source src="https://cdn.viralmind.ai/gym_demo.mp4" type="video/mp4" />
                </video>
                <div class="backdrop-blur-xs absolute inset-0 bg-purple-500/20"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Collective Intelligence Section -->
  <div class="bg-primary-500">
    <div class="mx-auto max-w-6xl px-4 py-24">
      <div class="text-center">
        <h2 class="mb-8 text-4xl font-bold md:text-5xl">Collective Intelligence Platform</h2>
        <p class="mx-auto mb-16 max-w-2xl text-xl text-gray-300">
          Training powerful agents is now efficient and rewarding, powered by the $VIRAL token
          ecosystem
        </p>
        <div class="grid gap-8 md:grid-cols-3">
          <div class="bg-primary-300 rounded-xl p-8">
            <div class="mb-4 flex justify-center">
              <Gamepad2 class="text-secondary-100 h-12 w-12" />
            </div>
            <h3 class="mb-4 text-2xl font-bold">Play Tasks</h3>
            <p class="text-gray-400">
              Jump into our Training Gym and complete AI-generated computer tasks. From games to
              apps, every click and action contributes to something bigger.
            </p>
          </div>

          <div class="bg-primary-300 rounded-xl p-8">
            <div class="mb-4 flex justify-center">
              <Coins class="text-secondary-100 h-12 w-12" />
            </div>
            <h3 class="mb-4 text-2xl font-bold">Earn Instantly</h3>
            <p class="text-gray-400">
              Your gameplay automatically becomes high-quality training data. We augment UI with
              reasoning, and you get $VIRAL tokens instantly for your contributions.
            </p>
          </div>

          <div class="bg-primary-300 rounded-xl p-8">
            <div class="mb-4 flex justify-center">
              <Bot class="text-secondary-100 h-12 w-12" />
            </div>
            <h3 class="mb-4 text-2xl font-bold">Create Agents</h3>
            <p class="text-gray-400">
              Turn your data into powerful computer-use agents that understand any UI. One-click
              trains DeepSeek into your own LAM that can reason, navigate, and execute tasks just
              like you do.
            </p>
          </div>
        </div>

        <div class="bg-primary-300 mt-8 rounded-xl p-6 backdrop-blur-md">
          <h2 class="mb-8 text-4xl font-bold">$VIRAL Ecosystem</h2>
          <ContractInfo />
        </div>
      </div>
    </div>
  </div>

  <!-- VM-1 Section with Video Background -->
  <div class="via-primary-500/70 bg-gradient-to-t from-transparent to-purple-900">
    <!-- Right Content -->
    <div class="mx-auto flex max-w-6xl flex-col lg:flex-row-reverse">
      <div class="mx-auto w-full p-4 lg:w-1/2">
        <div class="mt-8">
          <h1 class="mb-8 text-6xl font-bold">
            <span
              class="from-secondary-200 to-secondary-600 bg-gradient-to-r bg-clip-text text-transparent"
            >
              Meet VM-1
            </span>
          </h1>
          <p class="mb-4 text-xl text-gray-300">
            Coming soon: Your AI companion that controls the full desktop - locally or in the cloud.
            Run on anything from games to productivity apps, and continually learning skills from
            the Training Gym. Join the telegram to be first in line.
          </p>
        </div>
        <div class="mt-8 flex flex-col gap-4 md:flex-row">
          <ButtonCTA href="/tournaments">
            <Gamepad2 class="h-5 w-5" />
            Play Against AI
          </ButtonCTA>
          <ButtonCTA href="/gym" variant="secondary">
            Build Your Agent
            <ArrowRight class="h-5 w-5" />
          </ButtonCTA>
        </div>
      </div>

      <!-- Main Content -->
      <div class="relative z-10 mx-auto w-full space-x-8 px-4 py-5 lg:w-1/2 lg:flex-row">
        <!-- Chat UI -->
        <div
          class="my-8 w-full space-y-3 rounded-xl border border-purple-500/20 bg-white/5 p-6 shadow-lg backdrop-blur-sm"
        >
          <!-- Bot Welcome -->
          <div class="flex items-start gap-2">
            <div class="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/20">
              <Bot class="text-secondary-100 h-4 w-4" />
            </div>
            <div class="rounded-lg bg-purple-100 px-3 py-2 text-sm text-purple-900">
              <p>Ready to help! What are we playing today? 🎮</p>
            </div>
          </div>

          <!-- User CSGO Request -->
          <div class="flex flex-row-reverse items-start gap-2">
            <div class="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20">
              <User class="h-4 w-4 text-blue-600" />
            </div>
            <div class="rounded-lg bg-blue-100 px-3 py-2 text-sm text-blue-900">
              <p>
                Join my CS:GO match <span class="font-mono text-gray-600">192.168.1.1:27015</span>
              </p>
              <p>Play like Gold Nova 1 so I can practice!</p>
            </div>
          </div>

          <!-- Bot Response -->
          <div class="flex items-start gap-2">
            <div class="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/20">
              <Bot class="text-secondary-100 h-4 w-4" />
            </div>
            <div class="space-y-2">
              <div class="rounded-lg bg-purple-100 px-3 py-2 text-sm text-purple-900">
                <p>Let's crush it! 🎯</p>
              </div>
              <div
                class="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-xs text-gray-600"
              >
                <MonitorPlay class="h-4 w-4 animate-pulse" />
                Launching csgo.exe
              </div>
            </div>
          </div>

          <!-- Game Preview -->
          <div class="relative ml-8 aspect-video overflow-hidden rounded-lg bg-black/5">
            <img
              src="https://cdn.viralmind.ai/csgo-ai.gif"
              alt="CSGO Gameplay"
              class="absolute inset-0 h-full w-full object-cover blur-[2px]"
            />
            <div class="absolute inset-0 flex items-center justify-center bg-black/10">
              <Gamepad2 class="h-8 w-8 animate-pulse text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- "Don't Believe Us?" Section -->
  <div class="to-primary-500 bg-gradient-to-b from-purple-900/20">
    <div class="mx-auto max-w-6xl px-4 pb-32 pt-24">
      <h2 class="mb-4 text-center text-4xl font-bold">Don't Believe Us?</h2>
      <p class="mb-16 text-center text-xl text-gray-400">
        Train your own LAM in minutes. Keep the weights.
      </p>

      <div class="grid gap-8 md:grid-cols-2">
        <div class="bg-primary-300 rounded-xl p-8">
          <div class="mb-8">
            <span class="text-secondary-100 text-5xl font-bold">30%</span>
            <p class="mt-2 text-gray-400">
              Success rate on office UI tasks vs 0% with traditional OCR - tested on real
              computer-use benchmarks
            </p>
          </div>
          <div class="mb-8">
            <span class="text-secondary-100 text-5xl font-bold">50</span>
            <p class="mt-2 text-gray-400">
              Tasks to train a capable agent through our Training Gym
            </p>
          </div>
          <div class="mb-8">
            <span class="text-secondary-100 text-5xl font-bold">1-Click</span>
            <p class="mt-2 text-gray-400">Deploy your trained agent to any task</p>
          </div>
        </div>

        <div class="bg-primary-300 space-y-6 rounded-xl p-8">
          <h3 class="text-secondary-100 text-2xl font-bold">Build Your Own LAM</h3>
          <ol class="space-y-4 text-gray-300">
            <li class="flex items-start gap-2">
              <span class="bg-secondary-400/20 mt-1 rounded-full px-2 text-sm">1</span>
              Play games & complete tasks in our Training Gym
            </li>
            <li class="flex items-start gap-2">
              <span class="bg-secondary-400/20 mt-1 rounded-full px-2 text-sm">2</span>
              Your gameplay becomes high-quality training data
            </li>
            <li class="flex items-start gap-2">
              <span class="bg-secondary-400/20 mt-1 rounded-full px-2 text-sm">3</span>
              One-click fine-tuning creates your custom LAM
            </li>
            <li class="flex items-start gap-2">
              <span class="bg-secondary-400/20 mt-1 rounded-full px-2 text-sm">4</span>
              Deploy & earn $VIRAL as others use your agent
            </li>
          </ol>
          <div class="flex justify-center pt-8">
            <ButtonCTA href="https://viralmind.gitbook.io/viralmind.ai/train-your-own-agentic-lams">
              View the Docs
              <ArrowRight class="h-5 w-5" />
            </ButtonCTA>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div>
    <div class="bg-black pb-24 text-white">
      <div class="mx-auto max-w-6xl px-4 pt-24">
        <!-- Hero Section -->
        <div class="mb-16 text-center">
          <h1
            class="mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-5xl font-bold text-transparent md:text-4xl"
          >
            $VIRAL Token
          </h1>
          <p class="mx-auto mb-8 max-w-2xl text-xl text-gray-400">
            The utility token powering tournaments, VM-1 training, and governance.
          </p>
          <div class="flex justify-center gap-4">
            <ButtonCTA href={TOKEN_DATA.dexscreenerUrl} target="_blank">
              <Coins class="h-5 w-5" />
              Trade $VIRAL
            </ButtonCTA>
            <ButtonCTA href={TOKEN_DATA.dexscreenerUrl} target="_blank" variant="secondary">
              <Activity class="h-5 w-5" />
              Live Chart
            </ButtonCTA>
          </div>
        </div>

        <ViralMetrics />

        <!-- Token Utility Section -->
        <div class="my-16 grid gap-8 md:grid-cols-2">
          <!-- Training -->
          <Card>
            <h3 class="mb-6 flex items-center gap-2 text-xl font-bold">
              <Dumbbell class="h-6 w-6 text-purple-400" />
              Training & Rewards
            </h3>
            <ul class="space-y-4 text-gray-300">
              <li class="flex gap-2">
                <ArrowRight class="h-5 w-5 flex-shrink-0 text-purple-400" />
                <span>Hold $VIRAL to participate in free training races</span>
              </li>
              <li class="flex gap-2">
                <ArrowRight class="h-5 w-5 flex-shrink-0 text-purple-400" />
                <span>Stake tokens for access to high-reward races</span>
              </li>
              <li class="flex gap-2">
                <ArrowRight class="h-5 w-5 flex-shrink-0 text-purple-400" />
                <span>Earn rewards for quality demonstrations</span>
              </li>
            </ul>
          </Card>

          <!-- Tournaments -->
          <Card>
            <h3 class="mb-6 flex items-center gap-2 text-xl font-bold">
              <Trophy class="h-6 w-6 text-purple-400" />
              Tournaments & Inference
            </h3>
            <ul class="space-y-4 text-gray-300">
              <li class="flex gap-2">
                <ArrowRight class="h-5 w-5 flex-shrink-0 text-purple-400" />
                <span>Enter tournaments with prize pools</span>
              </li>
              <li class="flex gap-2">
                <ArrowRight class="h-5 w-5 flex-shrink-0 text-purple-400" />
                <span>Vote on future VM-1 development</span>
              </li>
              <li class="flex gap-2">
                <ArrowRight class="h-5 w-5 flex-shrink-0 text-purple-400" />
                <span>Access VM-1 inference for your AI applications</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  </div>

  <!-- Who We Are Section -->
  <div class="bg-gradient-to-b from-purple-900/20 to-black">
    <div class="mx-auto max-w-6xl px-4 py-24">
      <div class="p-12">
        <h2 class="mb-8 text-center text-4xl font-bold">Who We Are</h2>
        <div class="mx-auto max-w-3xl text-center">
          <p class="mb-8 text-xl text-gray-300">
            We're a team of passionate AI researchers and engineers from MIT, Microsoft, and leading
            AI labs, united by a vision to democratize frontier AI research.
          </p>
          <p class="text-lg text-gray-400">
            Our mission is to bring powerful Large Action Models to the crypto community, creating a
            decentralized ecosystem where anyone can train and deploy truly capable AI agents.
          </p>
        </div>
        <div class="mt-12 flex justify-center">
          <ButtonCTA href="https://t.me/viralmind">
            <MessageCircle class="h-5 w-5" />
            Join Our Community
          </ButtonCTA>
        </div>
      </div>
    </div>
  </div>

  <!-- FAQ Section -->
  <div class="bg-primary-400 px-4 py-24">
    <div class="mx-auto max-w-6xl">
      <div class="rounded-3xl bg-gradient-to-r from-purple-900/30 to-blue-900/30 p-12">
        <div class="text-center">
          <h2 class="mb-8 text-4xl font-bold">Frequently Asked Questions</h2>

          {#if settings?.faq}
            {#each settings.faq as faq, i}
              <div class="mb-4">
                <button
                  class="flex w-full items-center justify-between rounded-xl border border-purple-600/30 bg-black/30 p-4 transition-colors hover:bg-black/40"
                  on:click={() => toggleFaq(i)}
                >
                  <span class="font-semibold">{faq.question}</span>
                  {#if faqOpen[i]}
                    <ChevronUp class="h-5 w-5" />
                  {:else}
                    <ChevronDown class="h-5 w-5" />
                  {/if}
                </button>

                {#if faqOpen[i]}
                  <div class="p-4 text-gray-400">
                    {faq.answer}
                  </div>
                {/if}
              </div>
            {/each}
          {/if}
        </div>
      </div>
    </div>
  </div>

  <!-- Background effects -->
  <div
    class="absolute inset-0 z-[2] transition-transform duration-1000 ease-out"
    style="background: radial-gradient(600px circle at {mousePosition.x}% {mousePosition.y}%, rgb(147, 51, 234, 0.1), transparent 100%)"
  ></div>
</div>

<style>
  @keyframes float-1 {
    0%,
    100% {
      transform: perspective(1000px) rotateX(10deg) rotateY(-20deg) translateY(0px);
    }
    50% {
      transform: perspective(1000px) rotateX(10deg) rotateY(-20deg) translateY(-20px);
    }
  }

  @keyframes float-2 {
    0%,
    100% {
      transform: perspective(1000px) rotateX(-15deg) rotateY(25deg) translateY(0px);
    }
    50% {
      transform: perspective(1000px) rotateX(-15deg) rotateY(25deg) translateY(-15px);
    }
  }

  @keyframes float-3 {
    0%,
    100% {
      transform: perspective(1000px) rotateX(20deg) rotateY(-15deg) translateY(0px);
    }
    50% {
      transform: perspective(1000px) rotateX(20deg) rotateY(-15deg) translateY(-25px);
    }
  }

  .animate-float-1 {
    animation: float-1 6s ease-in-out infinite;
  }

  .animate-float-2 {
    animation: float-2 8s ease-in-out infinite;
  }

  .animate-float-3 {
    animation: float-3 7s ease-in-out infinite;
  }
</style>
