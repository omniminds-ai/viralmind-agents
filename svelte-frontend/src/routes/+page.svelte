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
  import solIcon from '$lib/assets/solIcon.png';
  import demoVideo from '$lib/assets/demo.mp4';

  const faqs = [
    {
      q: "What is VM-1?",
      a: "VM-1 is our first computer-use model that can control computers just like humans do, without requiring APIs or special integrations."
    },
    {
      q: "How do I earn $VIRAL?",
      a: "You can earn $VIRAL by participating in training races, providing quality demonstrations, and winning tournaments."
    },
    {
      q: "What's the difference between Tournaments and Training?",
      a: "In tournaments, you command the AI agent step-by-step for the entire pot. In training, you demonstrate actions and earn rewards based on quality."
    },
    {
      q: "Do I need to stake tokens?",
      a: "Not always! Free races only require holding $VIRAL. Staked races offer higher rewards but require token staking."
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
<div class="min-h-screen bg-black text-white pb-24">
  <div class="min-h-screen flex flex-col justify-center items-center relative overflow-hidden">
    <!-- Video Background with Mask -->
    <div class="absolute inset-0 z-0">
      <div class="absolute inset-0 flex items-start justify-center overflow-hidden">
        <div class="relative w-full h-full">
          <!-- Video container with gradient -->
          <div class="absolute w-[100%]">
            <video
              autoplay
              loop
              muted
              playsinline
              class="w-full opacity-25"
            >
              <source src={demoVideo} type="video/mp4" />
            </video>
            <!-- Gradient overlay contained within video bounds -->
            <div class="absolute inset-0" 
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

    <div class="w-full max-w-4xl mx-auto text-center px-4 relative z-10">
      <h2 class="text-lg mt-8 my-2 drop-shadow-lg">Pure Computer Control × Crypto Intelligence</h2>
      <h1 class="text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg">
        The Next Meta<br />
        in Agentic AI<br />
        <span class="text-gray-400 text-3xl mt-2">is coming</span>
      </h1>

      <!-- VM-1 Logo -->
      <div class="mt-12 mb-24 relative">
        <!-- VM-1 Text with enhanced shadows -->
        <div class="relative my-24">
          <div class="text-8xl md:text-9xl font-bold opacity-20 blur-sm bg-gradient-to-b from-purple-400 to-purple-900 text-transparent bg-clip-text relative z-10 drop-shadow-xl">
            VM-1
          </div>
          <div class="absolute inset-0 flex items-center justify-center flex-col z-20">
            <div class="text-8xl md:text-9xl font-bold bg-gradient-to-b from-purple-500 to-purple-900 text-transparent bg-clip-text drop-shadow-xl">
              VM-1
            </div>
            <div class="text-gray-400 mt-4 text-xl drop-shadow-lg">Our First Computer-Use Model</div>
          </div>
        </div>
        
        <!-- Developer CTAs -->
        <div class="relative mt-16 z-20">
          <p class="text-gray-400 mb-4 drop-shadow-lg">Ready to Build Something Insane?</p>
          <div class="flex justify-center">
            <a 
              href="https://t.me/viralmind" 
              target="_blank"
              class="shadow-lg px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <MessageCircle class="w-5 h-5" />
              Join Our Telegram for Updates
            </a>
          </div>
        </div>
      </div>

      <!-- Card Sections -->
      <div class="mt-12 space-y-8">
        <!-- Training Gym Card -->
        <div class="bg-stone-900/25 rounded-3xl p-12 shadow-2xl backdrop-blur-md">
          <h3 class="text-2xl md:text-3xl font-semibold mb-2 bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text drop-shadow-lg">
            Earn $VIRAL. Shape The Future.
          </h3>
          <p class="text-gray-400 mb-8">Train Agents through Demonstration</p>
          
          <!-- Race Types -->
          <div class="grid md:grid-cols-2 gap-6 mb-8 text-left">
            <div class="rounded-xl bg-black/30 p-6">
              <div class="flex items-center gap-2 mb-2">
                <MousePointerClick class="w-5 h-5 text-purple-400" />
                <h4 class="font-semibold text-purple-400">Free Races</h4>
              </div>
              <p class="text-sm text-gray-400">Hold $VIRAL and join races to earn from treasury-funded pools. No risk, pure reward.</p>
            </div>
            <div class="rounded-xl bg-black/30 p-6">
              <div class="flex items-center gap-2 mb-2">
                <Coins class="w-5 h-5 text-purple-400" />
                <h4 class="font-semibold text-purple-400">Staked Races</h4>
              </div>
              <p class="text-sm text-gray-400">Stake $VIRAL to join high-reward races. Win big from redistributed stakes.</p>
            </div>
          </div>

          <div class="text-center">
            <button class="px-8 py-3 bg-purple-600 rounded-full font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 mx-auto">
              <Dumbbell class="w-5 h-5" />
              Enter Training Gym →
            </button>
          </div>
        </div>

        <!-- Tournament Card -->
        <div class="bg-stone-900/25 rounded-3xl p-12 shadow-2xl backdrop-blur-md">
          <h3 class="text-2xl md:text-3xl font-semibold mb-2 bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text drop-shadow-lg">
            Command & Conquer
          </h3>
          <p class="text-gray-400 mb-8">Direct the AI Agent, Win the Entire Pot</p>
          
          <div class="grid grid-cols-3 gap-4 max-w-lg mx-auto text-center mb-8">
            <div class="space-y-2">
              <div class="flex justify-center mb-2">
                <MousePointerClick class="w-6 h-6 text-purple-500" />
              </div>
              <div class="text-2xl font-bold">500</div>
              <div class="text-sm text-gray-400">demonstrations</div>
            </div>
            
            <div class="space-y-2">
              <div class="flex justify-center mb-2">
                <Trophy class="w-6 h-6 text-purple-500" />
              </div>
              <div class="text-2xl font-bold">129</div>
              <div class="text-sm text-gray-400">trainers</div>
            </div>
            
            <div class="space-y-2">
              <div class="flex justify-center mb-2">
                <Coins class="w-6 h-6 text-purple-500" />
              </div>
              <div class="text-2xl font-bold">$5,435</div>
              <div class="text-sm text-gray-400">paid out</div>
            </div>
          </div>

          <div class="text-center space-y-4">
            <button class="px-8 py-3 bg-purple-600 rounded-full font-semibold hover:bg-purple-700 transition-colors">
              Join Tournament →
            </button>
            <div>
              <button class="text-gray-400 hover:text-white transition-colors flex items-center gap-2 mx-auto">
                <History class="w-4 h-4" />
                See Past Tournaments
              </button>
            </div>
          </div>
        </div>

        <!-- Token Section -->
        <div class="bg-stone-900/25 rounded-3xl p-12 shadow-2xl backdrop-blur-md">
          <h3 class="text-2xl md:text-3xl font-semibold mb-8 bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text drop-shadow-lg">
            $VIRAL Token
          </h3>
          
          <div class="grid md:grid-cols-2 gap-8">
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

          <div class="mt-8 p-6 bg-black/30 rounded-xl">
            <p class="text-gray-400">Contract Address:</p>
            <code class="text-purple-400 text-sm">HW7D5MyYG4Dz2C98axfjVBeLWpsEnofrqy6ZUwqwpump</code>
          </div>
        </div>

        <!-- FAQ Section -->
        <div class="bg-stone-900/25 rounded-3xl p-12 shadow-2xl backdrop-blur-md" id="faq">
          <h3 class="text-2xl md:text-3xl font-semibold mb-8 bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text drop-shadow-lg">
            Frequently Asked Questions
          </h3>

          {#each faqs as faq, i}
            <div class="mb-4">
              <button
                class="w-full flex items-center justify-between p-4 bg-black/30 rounded-xl hover:bg-black/40 transition-colors"
                on:click={() => toggleFaq(i)}
              >
                <span class="font-semibold">{faq.q}</span>
                {#if faqOpen[i]}
                  <ChevronUp class="w-5 h-5" />
                {:else}
                  <ChevronDown class="w-5 h-5" />
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
    <div class="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-black z-[1]"></div>
    <div 
      class="absolute inset-0 transition-transform duration-1000 ease-out z-[2]"
      style="background: radial-gradient(600px circle at {mousePosition.x}% {mousePosition.y}%, rgb(147, 51, 234, 0.15), transparent 40%); 
             transform: translate({(mousePosition.x - 50) * -0.05}px, {(mousePosition.y - 50) * -0.05}px)"
    ></div>
    <div class="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black z-[3]"></div>
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