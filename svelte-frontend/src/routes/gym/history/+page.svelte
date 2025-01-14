<script lang="ts">
  import { onMount } from 'svelte';
  import { Shapes, Zap, Brain, Coins, BicepsFlexed, Download, BrainCircuit } from 'lucide-svelte';
  import ButtonCTA from '$lib/components/ButtonCTA.svelte';
  import TrainDialog from '$lib/components/gym/TrainDialog.svelte';
  import SkillNetwork from '$lib/components/gym/SkillNetwork.svelte';
  import RaceHistoryGrid from '$lib/components/gym/RaceHistoryGrid.svelte';

  let mousePosition = { x: 0, y: 0 };
  let showTrainDialog = false;
  let showActionsMenu = false;

  let races = [
    {
      id: 1,
      name: "System Root Protocol",
      actionTokens: 124,
      grade: "A",
      earnings: 150,
      selected: false,
      timestamp: "2024-01-15T14:30:00Z",
      skills: ["Terminal Navigation", "Package Management", "System Configuration"]
    },
    {
      id: 2, 
      name: "Interface Synapse",
      actionTokens: 128,
      grade: "B+",
      earnings: 120,
      selected: false,
      timestamp: "2024-01-14T16:45:00Z",
      skills: ["Desktop Navigation", "Application Control", "Window Management"]
    },
    {
      id: 3,
      name: "Creative Cortex",
      actionTokens: 132,
      grade: "A+",
      earnings: 200,
      selected: false,
      timestamp: "2024-01-13T09:15:00Z",
      skills: ["Digital Art", "Visual Design", "Tool Control"]
    },
    {
      id: 4,
      name: "Code Neural Stream",
      actionTokens: 128,
      grade: "A",
      earnings: 180,
      selected: false,
      timestamp: "2024-01-12T11:20:00Z",
      skills: ["IDE Navigation", "Code Completion", "Git Operations"]
    },
    {
      id: 5,
      name: "Swarm Builder",
      actionTokens: 130,
      grade: "A-",
      earnings: 175,
      selected: false,
      timestamp: "2024-01-11T13:40:00Z",
      skills: ["Minecraft Construction", "Resource Gathering", "3D Navigation"]
    },
    {
      id: 6,
      name: "Data Nexus",
      actionTokens: 126,
      grade: "A",
      earnings: 160,
      selected: false,
      timestamp: "2024-01-10T15:55:00Z",
      skills: ["Spreadsheet Mastery", "Data Entry", "Formula Construction"]
    },
    {
      id: 7,
      name: "Media Synthesis",
      actionTokens: 135,
      grade: "A+",
      earnings: 220,
      selected: false,
      timestamp: "2024-01-09T10:25:00Z",
      skills: ["Video Timeline Control", "Effect Application", "Output Management"]
    }
  ];

  let exportFormat = "openai";
  let selectedCount = 0;
  let selectedSkills: Set<string> = new Set();
  let allSelected = false;

  $: {
    selectedCount = races.filter(r => r.selected).length;
    selectedSkills = new Set();
    races.filter(r => r.selected).forEach(race => {
      race.skills.forEach(skill => selectedSkills.add(skill));
    });
    // Update allSelected based on whether all races are selected
    allSelected = races.length > 0 && races.every(r => r.selected);
  }

  function handleMouseMove(event: MouseEvent) {
    mousePosition.x = (event.clientX / window.innerWidth) * 100;
    mousePosition.y = (event.clientY / window.innerHeight) * 100;
  }

  function handleSelectionChanged(selectedRows: any[]) {
    races = races.map(race => ({
      ...race,
      selected: selectedRows.some(row => row.id === race.id)
    }));
  }

  function handleExport() {
    // TODO: Implement actual export functionality
    console.log(`Exporting ${selectedCount} races in ${exportFormat} format`);
  }

  function handleTrain() {
    // TODO: Implement training functionality
    console.log('Training initiated');
  }

  function handleTrade() {
    // TODO: Implement trade functionality
    console.log('Trade marketplace coming soon');
  }

  onMount(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  });
</script>

<div class="min-h-screen bg-black pb-24 text-white">
  <div class="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
    <!-- Content Container -->
    <div class="relative z-10 mx-auto w-full max-w-6xl px-4">
      <!-- Title Section -->
      <div class="my-12 text-center">
        <h1 class="mb-6 text-5xl font-bold drop-shadow-lg md:text-7xl">Training History</h1>
        <p class="mx-auto max-w-2xl text-xl text-gray-400 md:text-2xl">
          Your race history and training data marketplace.
        </p>
      </div>

      <!-- Info Section -->
      <div class="mt-8 mb-2 grid gap-2 text-sm text-gray-400 md:grid-cols-2">
        <div class="rounded-xl bg-stone-900/25 p-4 backdrop-blur-sm">
          <div class="flex items-center gap-2 text-purple-400">
            <BrainCircuit class="h-4 w-4" />
            <span class="font-semibold">Neural Upload</span>
          </div>
          <p class="mt-2">
            Upload human behaviors into agents directly through powerful neural fine-tuning or flexible skill databases. Instant datasets for LoRA, RAG, etc
          </p>
        </div>
        <div class="rounded-xl bg-stone-900/25 p-4 backdrop-blur-sm">
          <div class="flex items-center gap-2 text-green-400">
            <Coins class="h-4 w-4" />
            <span class="font-semibold">Data Marketplace</span>
          </div>
          <p class="mt-2">
            Trade valuable training data in the decentralized marketplace. Share agentic knowledge and earn rewards from the AI training community.
          </p>
        </div>
      </div>

      <!-- Action Menu Bar -->
      <div class="mb-2 flex items-center justify-between rounded-xl bg-stone-900/25 px-4 py-3 backdrop-blur-sm">
        <div class="flex items-center gap-4">
          
          <span class="text-sm text-gray-400">
            Build your own agent:
          </span>

          <select 
            bind:value={exportFormat}
            class="rounded-lg bg-stone-800/50 px-3 py-1.5 text-sm text-white focus:outline-none"
          >
            <option value="openai">GPT-4o Fine-tuning</option>
            <option value="anthropic">Anthropic Format</option>
            <option value="raw">Raw Data</option>
          </select>
          
          <button 
            on:click={handleExport}
            class="flex items-center gap-2 rounded-lg bg-stone-800/50 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-stone-700/50 disabled:opacity-50"
            disabled={selectedCount === 0}
          >
            <Download class="h-4 w-4" />
            Export dataset
          </button>
        </div>

        <div class="flex items-center gap-2">
          <button 
            on:click={() => showTrainDialog = true}
            class="flex items-center gap-2 rounded-lg bg-stone-800/50 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-stone-700/50"
          >
            <BrainCircuit class="h-4 w-4" />
            Train
            <span class="rounded bg-yellow-500 px-1.5 py-0.5 text-xs text-black">Soon</span>
          </button>

          <button 
            on:click={handleTrade}
            class="flex items-center gap-2 rounded-lg bg-stone-800/50 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-stone-700/50"
          >
            <Coins class="h-4 w-4" />
            Trade
            <span class="rounded bg-yellow-500 px-1.5 py-0.5 text-xs text-black">Soon</span>
          </button>
        </div>
      </div>

      <RaceHistoryGrid 
        {races}
        onSelectionChanged={handleSelectionChanged}
      />

      <!-- Neural Network Visualization -->
      <div class="my-6">
        <div class="flex items-center gap-2 mb-4">
          <BrainCircuit class="h-5 w-5 text-purple-400" />
          <span class="text-lg font-semibold">Neural Skill Network</span>
          <span class="ml-2 text-sm text-gray-400">
            Visualization of known skill signals in the selected data  
          </span>
        </div>
        <SkillNetwork skills={Array.from(selectedSkills)} />
      </div>
    </div>
  </div>

  <!-- Background effects -->
  <div class="absolute inset-0 z-[1] bg-gradient-to-b from-purple-900/20 to-black"></div>
  <div
    class="absolute inset-0 z-[2] transition-transform duration-1000 ease-out"
    style="background: radial-gradient(600px circle at {mousePosition.x}% {mousePosition.y}%, rgb(147, 51, 234, 0.1), transparent 100%); 
            transform: translate({(mousePosition.x - 50) * -0.05}px, {(mousePosition.y - 50) * -0.05}px)"
  ></div>
  <div class="absolute inset-0 z-[3] bg-gradient-to-b from-black via-transparent to-black"></div>
</div>

<TrainDialog 
  bind:show={showTrainDialog}
  {selectedCount}
  onClose={() => showTrainDialog = false}
/>
