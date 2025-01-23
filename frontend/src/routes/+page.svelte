<script lang="ts">
  import { onMount } from 'svelte';
  import {
    MousePointerClick,
    Trophy,
    Coins,
    History,
    Dumbbell,
    MessageCircle,
    ChevronDown,
    ChevronUp,
    ArrowRight,
    Gamepad2,
    Brain,
    MonitorPlay,
    Clock,
    FileSpreadsheet,
    Video,
    Play,
    Bot,
    User,
    Send,
    FileText,
    MousePointer,
    ScanSearch
  } from 'lucide-svelte';
  import solIcon from '$lib/assets/solIcon.png';
  import demoVideo from '$lib/assets/demo.mp4';
  import gymVideo from '$lib/assets/gym_demo.mp4';
  import demoGif from '$lib/assets/csgo-ai.gif';
  import ButtonCTA from '$lib/components/ButtonCTA.svelte';
  import ContractInfo from '$lib/components/ContractInfo.svelte';
  import TournamentCountdown from '$lib/components/tournaments/TournamentCountdown.svelte';
  import GymCountdown from '$lib/components/gym/GymCountdown.svelte';
  import TournamentStream from '$lib/components/tournaments/TournamentStream.svelte';
  import type { SettingsRes } from '$lib/types';
  import TournamentActiveCard from '$lib/components/tournaments/TournamentActiveCard.svelte';
  import { findFastestRegion } from '$lib/utils';

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

<div class="min-h-screen bg-black text-white">
  
  <!-- Hero Section -->
  <div class="relative min-h-screen">
    <div class="bg-gradient-to-b from-black via-black to-purple-900">
      <div class="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-4">
        <div class="grid md:grid-cols-2 gap-12 items-center">
          <!-- Left Content -->
          <div class="text-left">
            <h1 class="mb-8 text-6xl font-bold md:text-7xl lg:text-8xl leading-tight">
              Play. Earn. Train <span class="text-purple-400">Computer-Use Agents.</span>
            </h1>
            <p class="mb-4 text-xl text-gray-300 md:text-2xl">
              We're leading a computer-use agent revolution.
            </p>
            <p class="mb-12 text-lg text-gray-400">
              Open-source has ZERO desktop computer-use datasets. With AI, data is king, so we built the Training Gym - the ONLY platform that collects high-quality data for training computer-use agents, using diverse AI-generated tasks, and instantly rewards you for participating.
            </p>
            <div class="flex gap-4">
              <ButtonCTA href="/gym">
                Start Training
                <ArrowRight class="h-5 w-5" />
              </ButtonCTA>
              <ButtonCTA href="https://docs.viralmind.ai" variant="secondary">
                View Docs
              </ButtonCTA>
            </div>
          </div>
          
          <!-- Right Content - Abstract Sphere -->
          <div class="relative aspect-square">
            <svg viewBox="0 0 400 400" class="w-full h-full">
              <defs>
                <radialGradient id="sphereGradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stop-color="rgb(147, 51, 234)" stop-opacity="0.6" />
                  <stop offset="100%" stop-color="rgb(147, 51, 234)" stop-opacity="0" />
                </radialGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              <!-- Base Sphere -->
              <circle cx="200" cy="200" r="150" 
                fill="url(#sphereGradient)"
                filter="url(#glow)"
                class="animate-pulse"
              />
              
              <!-- Orbital Rings -->
              <g class="animate-spin" style="transform-origin: center; animation-duration: 20s;">
                <circle cx="200" cy="200" r="180" 
                  fill="none" 
                  stroke="rgba(147, 51, 234, 0.3)" 
                  stroke-width="1"
                  stroke-dasharray="4 4"
                />
              </g>
              
              <g class="animate-spin" style="transform-origin: center; animation-duration: 15s;">
                <circle cx="200" cy="200" r="160" 
                  fill="none" 
                  stroke="rgba(147, 51, 234, 0.4)" 
                  stroke-width="1"
                  stroke-dasharray="4 4"
                />
              </g>
              
              <!-- Floating Particles -->
              <circle cx="320" cy="200" r="4" fill="rgb(147, 51, 234)" class="animate-pulse">
                <animateMotion 
                  dur="8s"
                  repeatCount="indefinite"
                  path="M 0 0 C 50 -50 50 50 0 0"
                />
              </circle>
              
              <circle cx="200" cy="80" r="3" fill="rgb(147, 51, 234)" class="animate-pulse">
                <animateMotion 
                  dur="6s"
                  repeatCount="indefinite"
                  path="M 0 0 C -30 30 30 30 0 0"
                />
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
              <div class="absolute w-48 h-32 rounded-lg overflow-hidden animate-float-1" 
                   style="top: 10%; left: 60%; transform: perspective(1000px) rotateX(10deg) rotateY(-20deg);">
                <video autoplay loop muted playsinline class="w-full h-full object-cover">
                  <source src={demoVideo} type="video/mp4" />
                </video>
                <div class="absolute inset-0 bg-purple-500/20 backdrop-blur-xs"></div>
              </div>
              
              <!-- Video 2 -->
              <div class="absolute w-48 h-32 rounded-lg overflow-hidden animate-float-2"
                  style="top: 40%; right: 65%; transform: perspective(1000px) rotateX(-15deg) rotateY(25deg);">
                <img src={demoGif} alt="Demo" class="w-full h-full object-cover" />
                <div class="absolute inset-0 bg-purple-500/20 backdrop-blur-xs"></div>
              </div>
                
              <!-- Video 3 -->
              <div class="absolute w-48 h-32 rounded-lg overflow-hidden animate-float-3"
                   style="bottom: 15%; left: 55%; transform: perspective(1000px) rotateX(20deg) rotateY(-15deg);">
                <video autoplay loop muted playsinline class="w-full h-full object-cover">
                  <source src={gymVideo} type="video/mp4" />
                </video>
                <div class="absolute inset-0 bg-purple-500/20 backdrop-blur-xs"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  

  <!-- Collective Intelligence Section -->
  <div class="bg-gradient-to-b from-purple-900/20 to-black">
    <div class="mx-auto max-w-6xl px-4 py-24">
      <div class="text-center">
        <h2 class="mb-8 text-4xl font-bold md:text-5xl">Collective Intelligence Platform</h2>
        <p class="mx-auto mb-16 max-w-2xl text-xl text-gray-300">
          Training powerful agents is now efficient and rewarding, powered by the $VIRAL token
          ecosystem
        </p>

        <div class="grid gap-8 md:grid-cols-3">
          <div class="rounded-xl bg-black/30 p-8">
            <div class="mb-4 flex justify-center">
              <Brain class="h-12 w-12 text-purple-400" />
            </div>
            <h3 class="mb-4 text-2xl font-bold">Train</h3>
            <p class="text-gray-400">
              Play games and complete tasks in our Training Gym. Your behavior becomes high-quality
              training data.
            </p>
          </div>

          <div class="rounded-xl bg-black/30 p-8">
            <div class="mb-4 flex justify-center">
              <Coins class="h-12 w-12 text-purple-400" />
            </div>
            <h3 class="mb-4 text-2xl font-bold">Earn</h3>
            <p class="text-gray-400">
              Get rewarded in $VIRAL tokens for quality demonstrations. Build valuable datasets
              others can use.
            </p>
          </div>

          <div class="rounded-xl bg-black/30 p-8">
            <div class="mb-4 flex justify-center">
              <MonitorPlay class="h-12 w-12 text-purple-400" />
            </div>
            <h3 class="mb-4 text-2xl font-bold">Deploy</h3>
            <p class="text-gray-400">
              One-click deploy your trained agents. Earn when others use your agent's capabilities.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>

  
  
<!-- VM-1 Section with Video Background -->
<div class="relative min-h-screen">
  <!-- Video Background -->
  <div class="absolute inset-0 z-0">
    <video autoplay loop muted playsinline class="h-full w-full object-cover opacity-20">
      <source src={demoVideo} type="video/mp4" />
    </video>
    <div class="absolute inset-0 bg-gradient-to-b from-transparent via-black/70 to-purple-900"></div>
  </div>

  <!-- Main Content -->
  <div class="relative z-10 mx-auto flex min-h-screen max-w-6xl px-4">
    <div class="grid md:grid-cols-2 gap-12 items-center">
      <!-- Chat UI -->
      <div class="space-y-3 rounded-xl border border-purple-500/20 bg-white/5 p-6 backdrop-blur-sm shadow-lg">
        <!-- Bot Welcome -->
        <div class="flex items-start gap-2">
          <div class="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/20">
            <Bot class="h-4 w-4 text-purple-600" />
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
            <p>Join my CS:GO match <span class="font-mono text-gray-600">192.168.1.1:27015</span></p>
            <p>Play like Gold Nova 1 so I can practice!</p>
          </div>
        </div>

        <!-- Bot Response -->
        <div class="flex items-start gap-2">
          <div class="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/20">
            <Bot class="h-4 w-4 text-purple-600" />
          </div>
          <div class="space-y-2">
            <div class="rounded-lg bg-purple-100 px-3 py-2 text-sm text-purple-900">
              <p>Let's crush it! 🎯</p>
            </div>
            <div class="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-xs text-gray-600">
              <MonitorPlay class="h-4 w-4 animate-pulse" />
              Launching csgo.exe
            </div>
          </div>
        </div>

        <!-- Game Preview -->
        <div class="relative ml-8 aspect-video overflow-hidden rounded-lg bg-black/5">
          <img src={demoGif} alt="CSGO Gameplay" class="absolute inset-0 h-full w-full object-cover blur-[2px]" />
          <div class="absolute inset-0 flex items-center justify-center bg-black/10">
            <Gamepad2 class="h-8 w-8 animate-pulse text-white" />
          </div>
        </div>
      </div>

      <!-- Right Content -->
      <div>
        <h1 class="mb-8 text-6xl font-bold">
          <span class="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Meet VM-1
          </span>
        </h1>
        <p class="mb-4 text-xl text-gray-300">
          Coming soon: Your AI companion that controls the full desktop - locally or in the cloud. Run on anything from games to productivity apps, and continually learning skills from the Training Gym. Join the telegram to be first in line.
        </p>
        
        <div class="flex gap-4 mt-8">
          <ButtonCTA href="/gym">
            Build Your Agent
            <ArrowRight class="h-5 w-5" />
          </ButtonCTA>
          <ButtonCTA href="/tournaments" variant="secondary">
            <Gamepad2 class="h-5 w-5" />
            Play Against AI
          </ButtonCTA>
        </div>
      </div>
    </div>
  </div>
</div>

  <!-- "Don't Believe Us?" Section -->
  <div class="bg-gradient-to-b from-purple-900/20 to-black">
    <div class="mx-auto max-w-6xl px-4 py-24">
      <h2 class="mb-4 text-center text-4xl font-bold">Don't Believe Us?</h2>
      <p class="mb-16 text-center text-xl text-gray-400">
        Train your own LAM in minutes. Keep the weights.
      </p>

      <div class="grid gap-8 md:grid-cols-2">
        <div class="rounded-xl bg-black/30 p-8">
          <div class="mb-8">
            <span class="text-5xl font-bold text-purple-400">30%</span>
            <p class="mt-2 text-gray-400">
              Success rate on office UI tasks vs 0% with traditional OCR - tested on real
              computer-use benchmarks
            </p>
          </div>
          <div class="mb-8">
            <span class="text-5xl font-bold text-purple-400">50</span>
            <p class="mt-2 text-gray-400">
              Tasks to train a capable agent through our Training Gym
            </p>
          </div>
          <div class="mb-8">
            <span class="text-5xl font-bold text-purple-400">1-Click</span>
            <p class="mt-2 text-gray-400">Deploy your trained agent to any task</p>
          </div>
        </div>

        <div class="space-y-6 rounded-xl bg-black/30 p-8">
          <h3 class="text-2xl font-bold text-purple-400">Build Your Own LAM</h3>
          <ol class="space-y-4 text-gray-300">
            <li class="flex items-start gap-2">
              <span class="mt-1 rounded-full bg-purple-500/20 px-2 text-sm">1</span>
              Play games & complete tasks in our Training Gym
            </li>
            <li class="flex items-start gap-2">
              <span class="mt-1 rounded-full bg-purple-500/20 px-2 text-sm">2</span>
              Your gameplay becomes high-quality training data
            </li>
            <li class="flex items-start gap-2">
              <span class="mt-1 rounded-full bg-purple-500/20 px-2 text-sm">3</span>
              One-click fine-tuning creates your custom LAM
            </li>
            <li class="flex items-start gap-2">
              <span class="mt-1 rounded-full bg-purple-500/20 px-2 text-sm">4</span>
              Deploy & earn $VIRAL as others use your agent
            </li>
          </ol>
          <div class="flex justify-center pt-8">
            <ButtonCTA href="https://viralmind.gitbook.io/viralmind.ai/train-your-own-agentic-lams">
              See the Docs
              <ArrowRight class="h-5 w-5" />
            </ButtonCTA>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- VM-1 Roadmap Section -->
  <div class="mx-auto max-w-6xl px-4 py-24">
    <div class="text-center">
      <!-- Contract Info -->
      <div class="mb-8 rounded-xl bg-stone-900/30 p-6 backdrop-blur-md">
        <h2 class="mb-8 text-4xl font-bold">$VIRAL Ecosystem</h2>
        <ContractInfo />
      </div>
      <p class="mx-auto mb-16 max-w-2xl text-xl text-gray-400">
        Building the future of AI agents through collective intelligence
      </p>

      <div class="grid gap-8 md:grid-cols-2">
        <!-- Key Growth Drivers -->
        <div class="space-y-8">
          <!-- Token Utility Section -->
          <div class="rounded-xl bg-black/30 p-8">
            <h3 class="mb-6 text-2xl font-bold text-purple-400">Data Economy</h3>
            <ul class="space-y-4 text-left text-gray-300">
              <li class="flex items-start gap-3">
                <ArrowRight class="mt-1 h-5 w-5 flex-shrink-0 text-purple-400" />
                <span
                  >Fair compensation for high-quality training data - users earn $VIRAL for
                  contributing validated behavioral demonstrations</span
                >
              </li>
              <li class="flex items-start gap-3">
                <ArrowRight class="mt-1 h-5 w-5 flex-shrink-0 text-purple-400" />
                <span
                  >Cost-effective data collection through token incentives reduces training costs
                  compared to traditional methods</span
                >
              </li>
              <li class="flex items-start gap-3">
                <ArrowRight class="mt-1 h-5 w-5 flex-shrink-0 text-purple-400" />
                <span
                  >Transparent data marketplace where contributors maintain ownership and earn from
                  dataset usage</span
                >
              </li>
            </ul>
          </div>

          <div class="rounded-xl bg-black/30 p-8">
            <h3 class="mb-6 text-2xl font-bold text-purple-400">Frontier Tech Development</h3>
            <ul class="space-y-4 text-left text-gray-300">
              <li class="flex items-start gap-3">
                <ArrowRight class="mt-1 h-5 w-5 flex-shrink-0 text-purple-400" />
                <span
                  >Building next-gen LAMs that understand any UI, game, or application, essential
                  for business automation</span
                >
              </li>
              <li class="flex items-start gap-3">
                <ArrowRight class="mt-1 h-5 w-5 flex-shrink-0 text-purple-400" />
                <span>Advanced research into behavioral learning & real-time action prediction</span
                >
              </li>
              <li class="flex items-start gap-3">
                <ArrowRight class="mt-1 h-5 w-5 flex-shrink-0 text-purple-400" />
                <span
                  >Revolutionary AI companion tech - your agent plays games with you in real-time</span
                >
              </li>
            </ul>
          </div>
        </div>

        <!-- Deployment Vision -->
        <div class="space-y-8">
          <div class="rounded-xl bg-black/30 p-8">
            <h3 class="mb-6 text-2xl font-bold text-purple-400">Technical Architecture</h3>
            <ul class="space-y-4 text-left text-gray-300">
              <li class="flex items-start gap-3">
                <ArrowRight class="mt-1 h-5 w-5 flex-shrink-0 text-purple-400" />
                <span
                  >Behavioral cloning with automated validation ensures high-quality demonstrations</span
                >
              </li>
              <li class="flex items-start gap-3">
                <ArrowRight class="mt-1 h-5 w-5 flex-shrink-0 text-purple-400" />
                <span
                  >One-click deployment handled by our infrastructure - we manage the complexity so
                  you don't have to</span
                >
              </li>
              <li class="flex items-start gap-3">
                <ArrowRight class="mt-1 h-5 w-5 flex-shrink-0 text-purple-400" />
                <span>Native integration with all major agent frameworks & crypto platforms</span>
              </li>
            </ul>
          </div>

          <div class="rounded-xl bg-black/30 p-8">
            <h3 class="mb-6 text-2xl font-bold text-purple-400">Community-Driven Growth</h3>
            <ul class="space-y-4 text-left text-gray-300">
              <li class="flex items-start gap-3">
                <ArrowRight class="mt-1 h-5 w-5 flex-shrink-0 text-purple-400" />
                <span>Massive dataset expansion through gamified Training Gym</span>
              </li>
              <li class="flex items-start gap-3">
                <ArrowRight class="mt-1 h-5 w-5 flex-shrink-0 text-purple-400" />
                <span>Strategic partnerships with gaming studios & crypto projects</span>
              </li>
              <li class="flex items-start gap-3">
                <ArrowRight class="mt-1 h-5 w-5 flex-shrink-0 text-purple-400" />
                <span>Accelerating AI agent ecosystem through $VIRAL incentives</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="mt-12 rounded-xl bg-purple-500/10 p-8">
        <p class="text-xl font-bold text-purple-400">The Future is Here</p>
        <p class="mt-2 text-gray-300">
          Join us in building the next generation of AI agents - capable of using any computer
          interface just like humans do.
        </p>
        <div class="mt-8 flex justify-center gap-4">
          <ButtonCTA href="/gym">
            Start Training
            <ArrowRight class="h-5 w-5" />
          </ButtonCTA>
          <ButtonCTA href="https://t.me/viralmind" variant="secondary">Join Community</ButtonCTA>
        </div>
      </div>
    </div>
  </div>

  <!-- Who We Are Section -->
  <div class="bg-gradient-to-b from-purple-900/20 to-black">
    <div class="mx-auto max-w-6xl px-4 py-24">
      <div class="rounded-3xl bg-black/30 p-12">
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

  <!-- Tournament Section -->
  <div class="mx-auto max-w-6xl px-4 py-24">
    <div class="rounded-3xl bg-gradient-to-r from-purple-900/30 to-blue-900/30 p-12">
      <div class="text-center">
        <h2 class="mb-8 text-4xl font-bold md:text-5xl">Gaming Tournaments</h2>
        <p class="mx-auto mb-12 max-w-2xl text-xl text-gray-300">
          Watch humans compete against AI in exciting live-streamed matches
        </p>

        <!-- Tournament Stats -->
        <div class="mx-auto mb-12 grid max-w-3xl grid-cols-3 gap-8">
          <div class="space-y-2">
            <div class="mb-2 flex justify-center">
              <MessageCircle class="h-8 w-8 text-purple-400" />
            </div>
            <div class="text-2xl font-bold md:text-3xl">{settings?.breakAttempts || 0}</div>
            <div class="text-sm text-gray-400">Total Prompts</div>
          </div>

          <div class="space-y-2">
            <div class="mb-2 flex justify-center">
              <Trophy class="h-8 w-8 text-purple-400" />
            </div>
            <div class="text-2xl font-bold md:text-3xl">
              ${settings?.treasury?.toFixed(2) || '0.00'}
            </div>
            <div class="text-sm text-gray-400">Prize Pool</div>
          </div>

          <div class="space-y-2">
            <div class="mb-2 flex justify-center">
              <Coins class="h-8 w-8 text-purple-400" />
            </div>
            <div class="text-2xl font-bold md:text-3xl">
              ${settings?.total_payout?.toFixed(2) || '0.00'}
            </div>
            <div class="text-sm text-gray-400">Total Paid Out</div>
          </div>
        </div>

        {#if settings?.activeChallenge}
          <!-- Active Tournament Card -->
          <div class="mb-12 rounded-xl bg-black/40 p-8">
            <div class="space-y-6">
              <h3 class="text-2xl font-bold text-purple-400">
                {settings.activeChallenge.title}
              </h3>

              <div class="flex flex-col items-center gap-6 md:flex-row md:justify-center">
                <!-- Challenge Image -->
                <div class="h-40 w-40 overflow-hidden rounded-lg">
                  <img
                    src={settings.activeChallenge.image}
                    alt="Tournament"
                    class="h-full w-full object-cover"
                  />
                </div>

                <!-- Challenge Details -->
                <div class="grid grid-cols-2 gap-6 md:gap-12">
                  <div class="flex items-center gap-3">
                    <Dumbbell class="h-5 w-5 text-purple-400" />
                    <div>
                      <div class="text-sm text-gray-400">Difficulty</div>
                      <div class="font-bold">{settings.activeChallenge.level}</div>
                    </div>
                  </div>

                  <div class="flex items-center gap-3">
                    <MessageCircle class="h-5 w-5 text-purple-400" />
                    <div>
                      <div class="text-sm text-gray-400">Messages</div>
                      <div class="font-bold">{settings.breakAttempts}</div>
                    </div>
                  </div>

                  <div class="flex items-center gap-3">
                    <Coins class="h-5 w-5 text-purple-400" />
                    <div>
                      <div class="text-sm text-gray-400">Entry Fee</div>
                      <div class="font-bold">{settings.activeChallenge.entryFee} SOL</div>
                    </div>
                  </div>

                  <div class="flex items-center gap-3">
                    <Trophy class="h-5 w-5 text-purple-400" />
                    <div>
                      <div class="text-sm text-gray-400">Prize Pool</div>
                      <div class="font-bold">{settings.activeChallenge.prize} SOL</div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex justify-center">
                <ButtonCTA href={`/tournaments/${settings.activeChallenge.name}`}>
                  <Trophy class="h-5 w-5 group-hover:animate-bounce" />
                  Join Tournament
                  <span
                    class="text-white transition-transform duration-200 group-hover:translate-x-1"
                    >→</span
                  >
                </ButtonCTA>
              </div>
            </div>
          </div>
        {:else}
          <!-- Tournament Teaser -->
          <div class="mb-12 rounded-xl bg-black/40 p-8">
            <h3 class="mb-4 text-2xl font-bold text-purple-400">Next Tournament Loading...</h3>
            <p class="mb-6 text-gray-400">Don't miss out on the next chance to win big!</p>
            <ButtonCTA class="mx-auto w-1/3" href="https://t.me/viralmind">
              <MessageCircle class="h-5 w-5" />
              Get Notified
            </ButtonCTA>
          </div>
        {/if}

        <!-- Previous Tournament -->
        {#if settings?.concludedChallenges?.[0]}
          <div class="space-y-4">
            <h3 class="text-xl font-bold text-purple-400">
              {settings?.activeChallenge ? 'Previous' : 'Latest'} Tournament
            </h3>

            <div class="mx-auto max-w-3xl rounded-xl bg-black/30 p-6">
              <div class="mb-4">
                <h4 class="text-lg font-bold">{settings.concludedChallenges[0].title}</h4>
                <p class="mt-1 text-sm text-gray-400">{settings.concludedChallenges[0].label}</p>
              </div>

              <div class="mb-6 grid gap-4 md:grid-cols-2">
                <div class="flex items-center gap-3">
                  <Trophy class="h-5 w-5 text-purple-400" />
                  <div>
                    <div class="text-sm text-gray-400">Winner</div>
                    <div class="font-mono">
                      {settings.concludedChallenges[0].winning_address?.slice(0, 5)}...
                      {settings.concludedChallenges[0].winning_address?.slice(-4)}
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-3">
                  <Coins class="h-5 w-5 text-purple-400" />
                  <div>
                    <div class="text-sm text-gray-400">Prize</div>
                    <div class="flex items-center gap-2">
                      <span>{settings.concludedChallenges[0].prize?.toFixed(2) || '0.00'} SOL</span>
                      <span class="text-gray-400">
                        (${settings.concludedChallenges[0].usdPrize?.toFixed(2) || '0.00'})
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="rounded-lg bg-black/30 p-4">
                <div class="text-xs text-gray-400">Transaction Hash</div>
                <div class="mt-1 break-all font-mono text-sm">
                  {settings.concludedChallenges[0].winning_txn}
                </div>
              </div>

              <div class="mt-4 flex items-center justify-between text-sm">
                <span class="text-gray-400">
                  Concluded {new Date(settings.concludedChallenges[0].expiry).toLocaleDateString(
                    'en-US',
                    {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }
                  )}
                </span>
                <a
                  href={`https://solscan.io/tx/${settings.concludedChallenges[0].winning_txn}`}
                  target="_blank"
                  class="text-purple-400 hover:text-purple-300"
                >
                  View on Solscan →
                </a>
              </div>
            </div>
          </div>
        {/if}

        <!-- View All Link -->
        <div class="mt-8 flex justify-center">
          <a href="/tournaments" class="flex items-center gap-2 text-gray-400 hover:text-white">
            <History class="h-5 w-5" />
            View All Tournaments
          </a>
        </div>
      </div>
    </div>
  </div>

  <!-- CTA Section -->
  <div class="mx-auto max-w-6xl px-4 py-24 text-center">
    <h2 class="mb-8 text-4xl font-bold">Ready to Build Real AI?</h2>
    <p class="mb-12 text-xl text-gray-400">
      Join our community of researchers, developers, and AI enthusiasts
    </p>
    <div class="flex justify-center gap-4">
      <ButtonCTA href="/gym">
        Start Training
        <ArrowRight class="h-5 w-5" />
      </ButtonCTA>
      <ButtonCTA href="https://viralmind.gitbook.io/viralmind.ai">Read Docs</ButtonCTA>
    </div>
  </div>

  <!-- FAQ Section -->
  <div class="mx-auto max-w-6xl px-4 py-24">
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

  <!-- Background effects -->
  <div
    class="absolute inset-0 z-[2] transition-transform duration-1000 ease-out"
    style="background: radial-gradient(600px circle at {mousePosition.x}% {mousePosition.y}%, rgb(147, 51, 234, 0.1), transparent 100%)"
  ></div>
</div>


<style>
  @keyframes float-1 {
    0%, 100% { transform: perspective(1000px) rotateX(10deg) rotateY(-20deg) translateY(0px); }
    50% { transform: perspective(1000px) rotateX(10deg) rotateY(-20deg) translateY(-20px); }
  }
  
  @keyframes float-2 {
    0%, 100% { transform: perspective(1000px) rotateX(-15deg) rotateY(25deg) translateY(0px); }
    50% { transform: perspective(1000px) rotateX(-15deg) rotateY(25deg) translateY(-15px); }
  }
  
  @keyframes float-3 {
    0%, 100% { transform: perspective(1000px) rotateX(20deg) rotateY(-15deg) translateY(0px); }
    50% { transform: perspective(1000px) rotateX(20deg) rotateY(-15deg) translateY(-25px); }
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