<script lang="ts">
  import pfp from '$lib/assets/pfp.png';
  import exampleUsage from '$lib/assets/exampleusage.mp4';
  import gym from '$lib/assets/gym.png';
  import { onMount } from 'svelte';
  import { Dumbbell, Hammer, Database, Brain, BarChart, Monitor, GitBranch, Trophy, Sparkles, Download, Bot, User, Scale, ArrowRight, ArrowDown, RotateCcw, Split, MonitorDot, HardDrive, Image, Keyboard, Trees, MousePointer, Gamepad, Joystick, Mouse, ListTree, FileCode, ScrollText, Text, BookText } from 'lucide-svelte';
  import ButtonCTA from '$lib/components/ButtonCTA.svelte';
  import VideoPopup from '$lib/components/VideoPopup.svelte';
  
  let showTrainingVideo = false;
  let showForgeVideo = false;
  
  onMount(() => {
    // Any initialization code here
  });
</script>

<div class="min-h-screen">
  <!-- Hero Section -->
  <section class="bg-white relative">
    <div class="mx-auto max-w-7xl px-4 py-24">
      <div class="text-center mb-8">
        <img 
          src={pfp} 
          alt="Viralmind Desktop"
          class="h-28 w-28 rounded-2xl border shadow-xl mx-auto mb-4" 
        />
        <h1 class="text-5xl font-bold mb-3">
          <span class="bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
            Viralmind Desktop
          </span>
        </h1>
        <div class="inline-flex items-center justify-center rounded-full bg-purple-100 px-4 py-1 text-sm font-medium text-purple-800 mb-4">
          <Monitor class="h-4 w-4 min-w-4 mr-2" />
          All-in-one app for computer-use agents
        </div>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto my-10">
          Your unified platform for contributing to, training, and evaluating computer-use agents, all in one powerful desktop application.
        </p>
        <div class="flex justify-center gap-4">
          <ButtonCTA href="/download" class="inline-flex items-center gap-2">
            <Download class="h-5 w-5" />
            Download Now
          </ButtonCTA>
          <a 
            href="https://github.com/viralmind-ai/desktop" 
            target="_blank"
            class="group inline-flex items-center gap-2 px-6 py-3 text-gray-900"
          >
            <span class="animated-underline">View Source</span>
          </a>
        </div>
      </div>
      
      <div class="mt-16 relative rounded-xl overflow-hidden">
        <video 
          src={exampleUsage} 
          autoplay 
          loop 
          muted 
          playsinline
        />
        <div class="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
      </div>
    </div>
  </section>

  <!-- Training Gym Section -->
  <section id="gym" class="bg-gray-50 py-20">
    <div class="mx-auto max-w-7xl px-4">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <div class="inline-flex h-16 w-16 items-center justify-center rounded-xl bg-purple-100 mb-6">
            <Dumbbell class="h-10 w-10 text-purple-600" />
          </div>
          <h2 class="text-4xl font-bold text-gray-900 mb-4">Training Gym</h2>
          <p class="text-xl text-gray-600 mb-6">
            Record your everyday computer tasks to train AI models and earn $VIRAL tokens. High-quality demonstrations earn more per task, rewarding expert skill.
          </p>
          <ul class="space-y-3 mb-8">
            <li class="flex items-start gap-3">
              <div class="mt-1 h-5 w-5 rounded-full bg-purple-100 flex items-center justify-center">
                <div class="h-2 w-2 rounded-full bg-purple-600"></div>
              </div>
              <span class="text-gray-700">Complete simple tasks like ordering food or browsing websites</span>
            </li>
            <li class="flex items-start gap-3">
              <div class="mt-1 h-5 w-5 rounded-full bg-purple-100 flex items-center justify-center">
                <div class="h-2 w-2 rounded-full bg-purple-600"></div>
              </div>
              <span class="text-gray-700">Earn rewards for each quality demonstration uploaded</span>
            </li>
            <li class="flex items-start gap-3">
              <div class="mt-1 h-5 w-5 rounded-full bg-purple-100 flex items-center justify-center">
                <div class="h-2 w-2 rounded-full bg-purple-600"></div>
              </div>
              <span class="text-gray-700">Help build better AI assistants through your contributions</span>
            </li>
          </ul>
          <div class="flex gap-4">
            <button 
              on:click={() => showTrainingVideo = true}
              class="inline-flex items-center gap-2 rounded-full bg-purple-600 px-6 py-3 text-white shadow hover:bg-purple-700 transition-colors"
            >
              Watch Demo
            </button>
            <a 
              href="/download"
              class="inline-flex items-center gap-2 rounded-full bg-white border border-purple-600 px-6 py-3 text-purple-600 shadow hover:bg-purple-50 transition-colors"
            >
              Get Started
            </a>
          </div>
          <VideoPopup videoId="ipk686YmLh8" bind:isOpen={showTrainingVideo} />
        </div>
        <div class="bg-white rounded shadow-xl overflow-hidden border border-gray-200">
          <div>
            <img src={gym} alt="Training Gym" class="h-full w-full object-cover" />
          </div>
        </div>
      </div>
    </div>
  </section>
  
  <!-- The Forge Section -->
  <section id="forge" class="bg-white py-20">
    <div class="mx-auto max-w-7xl px-4">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div class="order-2 lg:order-1">
          <div class="inline-flex h-16 w-16 items-center justify-center rounded-xl bg-blue-100 mb-6">
            <Hammer class="h-10 w-10 text-blue-600" />
          </div>
          <h2 class="text-4xl font-bold text-gray-900 mb-4">The Forge</h2>
          <p class="text-xl text-gray-600 mb-6">
            Generate training gym tasks by prompting skills and capabilities. Our community provides targeted demonstrations to automate your desired workflow.
          </p>
          <ul class="space-y-3 mb-8">
            <li class="flex items-start gap-3">
              <div class="mt-1 h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center">
                <div class="h-2 w-2 rounded-full bg-blue-600"></div>
              </div>
              <span class="text-gray-700">Define your custom agent's capabilities</span>
            </li>
            <li class="flex items-start gap-3">
              <div class="mt-1 h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center">
                <div class="h-2 w-2 rounded-full bg-blue-600"></div>
              </div>
              <span class="text-gray-700">Collect targeted demonstrations from our community</span>
            </li>
            <li class="flex items-start gap-3">
              <div class="mt-1 h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center">
                <div class="h-2 w-2 rounded-full bg-blue-600"></div>
              </div>
              <span class="text-gray-700">Build specialized AI models with real world data</span>
            </li>
          </ul>
          <button 
            on:click={() => showForgeVideo = true}
            class="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-white shadow hover:bg-blue-700 transition-colors"
          >
            Watch Demo
          </button>
          <VideoPopup videoId="5N0zWHcLYho" bind:isOpen={showForgeVideo} />
        </div>
        <div class="relative order-1 rounded-xl p-8 shadow-xl border border-gray-100 bg-white lg:order-2">
          <div class="mb-6">
            <div class="flex items-center gap-2 mb-3">
              <h3 class="text-xl font-semibold text-gray-900">Describe your dream agent</h3>
              <Sparkles class="h-5 w-5 text-yellow-400" />
            </div>
            <div class="relative">
              <input
                type="text"
                placeholder="An agent that can book flights and hotels..."
                class="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
              />
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <Hammer class="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
          
          <div class="mb-6 rounded-lg bg-gray-50 p-4">
            <div class="mb-2 text-sm font-medium text-gray-700">Estimated Requirements</div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <div class="text-2xl font-bold text-blue-600">75,000</div>
                <div class="text-sm text-gray-600">$VIRAL Required</div>
              </div>
              <div>
                <div class="text-2xl font-bold text-blue-600">13,600</div>
                <div class="text-sm text-gray-600">Demonstrations</div>
              </div>
            </div>
          </div>
          
          <div>
            <button
              class="w-full rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 px-6 py-3 text-white hover:from-purple-700 hover:to-blue-600 transition-colors"
            >
              Generate Training Gym
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
  
  <!-- Quality Data Section -->
  <section class="bg-gray-50 py-20">
    <div class="mx-auto max-w-7xl px-4">
      <div class="text-center mb-16">
        <div class="inline-flex h-16 w-16 items-center justify-center rounded-xl bg-green-100 mb-6">
          <Database class="h-10 w-10 text-green-600" />
        </div>
        <h2 class="text-4xl font-bold text-gray-900 mb-4">Quality Data, By Design</h2>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          Every aspect of our platform is designed to generate high-quality training data. From AI-generated tasks to expert demonstrations.
        </p>
      </div>

      <!-- Horizontal Pipeline Graphic -->
      <div class="mb-20 max-w-4xl mx-auto">
        <!-- Desktop 3-Column Layout -->
        <div class="hidden md:block">
          <div class="flex items-start justify-between mb-10 relative">
            <!-- Card Row -->
            <div class="flex justify-between w-full">
              <!-- Forge Intelligence -->
              <div class="bg-white rounded-xl p-6 shadow-md border border-gray-100 w-[200px] h-[200px] flex flex-col items-center justify-center">
                <div class="flex flex-col items-center text-center">
                  <div class="inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 mb-4">
                    <Bot class="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 class="text-lg font-bold text-gray-900">Forge AI</h3>
                  <p class="text-sm text-gray-600 mt-2">Generates diverse training scenarios</p>
                </div>
              </div>
              
              <!-- Arrow 1 -->
              <div class="flex items-center justify-center w-[100px]">
                <ArrowRight class="h-8 w-8 text-gray-400" />
              </div>
              
              <!-- Human Trainers -->
              <div class="bg-white rounded-xl p-6 shadow-md border border-gray-100 w-[200px] h-[200px] flex flex-col items-center justify-center z-10">
                <div class="flex flex-col items-center text-center">
                  <div class="inline-flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 mb-4">
                    <User class="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 class="text-lg font-bold text-gray-900">Human Trainers</h3>
                  <p class="text-sm text-gray-600 mt-2">Expert recordings, real environments</p>
                </div>
              </div>
              
              <!-- Arrow 2 -->
              <div class="flex items-center justify-center w-[100px]">
                <ArrowRight class="h-8 w-8 text-gray-400" />
              </div>
              
              <!-- AI Judge -->
              <div class="bg-white rounded-xl p-6 shadow-md border border-gray-100 w-[200px] h-[200px] flex flex-col items-center justify-center">
                <div class="flex flex-col items-center text-center">
                  <div class="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
                    <Scale class="h-8 w-8 text-green-600" />
                  </div>
                  <h3 class="text-lg font-bold text-gray-900">AI Judge</h3>
                  <p class="text-sm text-gray-600 mt-2">Quality assessment for dynamic rewards</p>
                </div>
              </div>
            </div>
            
          </div>
          
          <!-- Return Arrow (in its own row) -->
          <div class="flex justify-center mt-6">
            <div class="flex flex-col items-center">
              <Split class="h-8 w-8 text-gray-400 mb-6" />
              <div class="bg-white px-4 py-2 text-sm font-medium text-gray-700 rounded-full shadow-sm border border-gray-200">
                Better quality = more $VIRAL earned
              </div>
            </div>
          </div>
          
        </div>
        
        <!-- Mobile Vertical Layout -->
        <div class="md:hidden flex flex-col items-center">
          <!-- Forge Intelligence -->
          <div class="bg-white rounded-xl p-6 shadow-md border border-gray-100 w-[240px] z-10">
            <div class="flex flex-col items-center text-center">
              <div class="inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 mb-4">
                <Bot class="h-8 w-8 text-blue-600" />
              </div>
              <h3 class="text-lg font-bold text-gray-900">Forge AI</h3>
              <p class="text-sm text-gray-600 mt-2">Generates diverse training scenarios</p>
            </div>
          </div>
          
          <!-- Down arrow 1 -->
          <div class="flex items-center justify-center h-16 my-2">
            <ArrowDown class="h-10 w-10 text-gray-400" />
          </div>
          
          <!-- Human Trainers -->
          <div class="bg-white rounded-xl p-6 shadow-md border border-gray-100 w-[240px] z-10">
            <div class="flex flex-col items-center text-center">
              <div class="inline-flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 mb-4">
                <User class="h-8 w-8 text-purple-600" />
              </div>
              <h3 class="text-lg font-bold text-gray-900">Gym Trainers</h3>
              <p class="text-sm text-gray-600 mt-2">Expert recordings, real environments</p>
            </div>
          </div>
          
          <!-- Down arrow 2 -->
          <div class="flex items-center justify-center h-16 my-2">
            <ArrowDown class="h-10 w-10 text-gray-400" />
          </div>
          
          <!-- AI Judge -->
          <div class="bg-white rounded-xl p-6 shadow-md border border-gray-100 w-[240px] z-10">
            <div class="flex flex-col items-center text-center">
              <div class="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
                <Scale class="h-8 w-8 text-green-600" />
              </div>
              <h3 class="text-lg font-bold text-gray-900">AI Judge</h3>
              <p class="text-sm text-gray-600 mt-2">Quality assessment system</p>
            </div>
          </div>
          
          <!-- Return flow arrow -->
          <div class="flex flex-col items-center w-full mt-8">
            <div class="flex flex-col items-center">
              <Split class="h-10 w-10 text-gray-400 mb-2" />
              <div class="bg-white px-4 py-2 text-sm font-medium text-gray-700 rounded-full shadow-sm border border-gray-200">
                Better quality = more $VIRAL earned
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  
  <!-- Technical Details -->
  <section class="bg-white py-24">
    <div class="max-w-7xl mx-auto px-4">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 class="text-3xl font-bold text-gray-900 mb-6">Powerful, Private Research</h2>
          <p class="text-lg text-gray-600 mb-8">
            Advanced, open-source tools for recording demonstrations and generating data in demand by cutting-edge AI research.
          </p>
          
          <div class="space-y-4">
            <div class="flex items-start gap-4">
              <div class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100">
                <Brain class="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 class="text-lg font-medium text-gray-900">Advanced ML Tools</h3>
                <p class="text-gray-600">Powerful tools for replaying demonstrations and processing them into structured, augmented trajectory data</p>
              </div>
            </div>
            
            <div class="flex items-start gap-4">
              <div class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100">
                <Database class="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 class="text-lg font-medium text-gray-900">Local Storage First</h3>
                <p class="text-gray-600">Keep all your sensitive data on your machine, with complete control over what you share</p>
              </div>
            </div>
            
            <div class="flex items-start gap-4">
              <div class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100">
                <BarChart class="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 class="text-lg font-medium text-gray-900">Multimodal Recording</h3>
                <p class="text-gray-600">Gather rich metadata demanded by cutting-edge AI research: screenshots, keyboard/mouse input, and structured UI data</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="bg-gray-100 rounded-2xl overflow-hidden">
          <div class="aspect-square bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
            <!-- Technical diagram mockup -->
            <div class="max-w-sm mx-auto text-center">
              <div class="grid grid-cols-3 gap-4 mb-4">
                <div class="bg-white rounded-lg p-4 shadow-sm">
                  <MonitorDot class="h-8 w-8 mx-auto text-purple-500 mb-2" />
                  <p class="text-xs font-medium">Recording</p>
                </div>
                <div class="bg-white rounded-lg p-4 shadow-sm">
                  <Database class="h-8 w-8 mx-auto text-purple-500 mb-2" />
                  <p class="text-xs font-medium">Processing</p>
                </div>
                <div class="bg-white rounded-lg p-4 shadow-sm">
                  <Dumbbell class="h-8 w-8 mx-auto text-purple-500 mb-2" />
                  <p class="text-xs font-medium">Training</p>
                </div>
              </div>
              <div class="bg-white rounded-lg p-4 shadow-sm">
                <img 
                  src={pfp} 
                  alt="Viralmind Desktop"
                  class="h-8 w-8 rounded-md border shadow-md mx-auto mb-2" 
                />
                <p class="text-sm font-medium">Viralmind Desktop</p>
              </div>
              <div class="mt-4 bg-purple-100 rounded-lg p-3 shadow-sm">
                <p class="text-xs text-purple-800">Secure Local Database</p>
              </div>
              
              <!-- Data Collection Types -->
              <div class="mt-4 grid grid-cols-3 gap-2">
                <div class="bg-purple-100 rounded-lg p-2 shadow-sm">
                  <Image class="h-4 w-4 mx-auto text-purple-800 mb-1" />
                  <p class="text-xs text-purple-800">screenshots</p>
                </div>
                <div class="bg-purple-100 rounded-lg p-2 shadow-sm">
                  <div class="flex justify-center gap-1 mb-1">
                    <Mouse class="h-4 w-4 text-purple-800" />
                    <Keyboard class="h-4 w-4 text-purple-800" />
                    <Joystick class="h-4 w-4 text-purple-800" />
                  </div>
                  <p class="text-xs text-purple-800">actions</p>
                </div>
                <div class="bg-purple-100 rounded-lg p-2 shadow-sm">
                  <ListTree class="h-4 w-4 mx-auto text-purple-800 mb-1" />
                  <p class="text-xs text-purple-800">axtree</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  
  <!-- Download CTA -->
  <section class="bg-gradient-to-r from-purple-600 to-blue-600 py-20 text-white">
    <div class="max-w-5xl mx-auto px-4 text-center">
      <h2 class="text-3xl font-bold mb-6">Ready to get started?</h2>
      <p class="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
        Download Viralmind Desktop today and join our community in pushing the boundaries of computer-use AI.
      </p>
      <a 
        href="/download"
        class="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-lg font-medium text-purple-600 shadow-lg hover:bg-gray-100 transition-colors"
      >
        <Download class="h-5 w-5" />
        Download Now
      </a>
    </div>
  </section>
</div>
