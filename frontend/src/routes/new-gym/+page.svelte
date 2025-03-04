<script lang="ts">
  import { onMount } from 'svelte';
  import { walletStore } from '$lib/walletStore';
  import { 
    Connection, 
    PublicKey, 
    Transaction, 
    SystemProgram, 
    LAMPORTS_PER_SOL
  } from '@solana/web3.js';
  import { page } from '$app/stores';
  import { Brain, CheckCircle, AlertCircle, Loader2, Dumbbell, ArrowRight, Sparkles, Coins } from 'lucide-svelte';
  import Card from '$lib/components/Card.svelte';

  // Form state
  let gymName = '';
  let skills = '';
  let tokenType = 'VIRAL'; // Default to VIRAL
  let tokenAddress = 'HW7D5MyYG4Dz2C98axfjVBeLWpsEnofrqy6ZUwqwpump'; // Default VIRAL token address
  let customTokenAddress = '';
  let loading = false;
  let currentStep = '';
  let error = '';
  let success = false;
  let poolId = '';

  // Token options
  const tokenOptions = [
    { value: 'VIRAL', label: 'VIRAL', address: 'HW7D5MyYG4Dz2C98axfjVBeLWpsEnofrqy6ZUwqwpump', disabled: false },
    { value: 'SOL', label: 'SOL', address: '11111111111111111111111111111111', disabled: true },
    { value: 'CUSTOM', label: 'Custom Token', address: '', disabled: true }
  ];

  // Transaction steps
  const steps = [
    { id: 'preparing', message: 'Preparing gym on server...' },
    { id: 'extracting', message: 'Extracting skills from input...' },
    { id: 'engineering', message: 'Preparing transaction...' },
    { id: 'designing', message: 'Confirming transaction...' },
    { id: 'notifying', message: 'Designing environments...' },
    { id: 'finalizing', message: 'Finalizing gym setup...' }
  ];

  // Connection to Solana
  const connection = new Connection(
    'https://snowy-delicate-sponge.solana-mainnet.quiknode.pro/99269d0ad3e8500a9423bbeea089c8caf45a98aa',
    'confirmed'
  );

  // Handle token type change
  function handleTokenTypeChange() {
    const selectedToken = tokenOptions.find(t => t.value === tokenType);
    if (selectedToken) {
      tokenAddress = selectedToken.address;
    }
  }

  // Get URL parameters
  onMount(() => {
    const urlParams = $page.url.searchParams;
    const nameParam = urlParams.get('name');
    const skillsParam = urlParams.get('skills');
    const tokenTypeParam = urlParams.get('tokenType');
    const tokenAddressParam = urlParams.get('tokenAddress');
    
    if (nameParam) gymName = nameParam;
    if (skillsParam) skills = skillsParam;
    if (tokenTypeParam && tokenOptions.some(t => t.value === tokenTypeParam)) {
      tokenType = tokenTypeParam;
    }
    if (tokenAddressParam) {
      tokenAddress = tokenAddressParam;
      if (tokenType === 'CUSTOM') {
        customTokenAddress = tokenAddressParam;
      }
    }
  });

  async function handleCreateGym() {
    if (!$walletStore.connected || !$walletStore.publicKey) {
      error = 'Please connect your wallet first';
      return;
    }

    if (!gymName.trim()) {
      error = 'Please enter a gym name';
      return;
    }

    if (!skills.trim()) {
      error = 'Please enter at least one skill to train';
      return;
    }

    loading = true;
    error = '';
    success = false;
    
    try {
      // Step 1: Create gym on backend to get deposit address
      currentStep = 'preparing';
      
      // Get token details based on selected type
      let tokenDetails = {
        type: tokenType,
        symbol: tokenType,
        address: tokenAddress
      };
      
      // If custom token is selected, use the custom address
      if (tokenType === 'CUSTOM' && customTokenAddress) {
        tokenDetails.address = customTokenAddress;
      }
      
      const createResponse = await fetch('/api/forge/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: gymName,
          skills: skills,
          token: tokenDetails,
          ownerAddress: $walletStore.publicKey.toString()
        })
      });

      if (!createResponse.ok) {
        throw new Error('Failed to create gym on server');
      }

      const gymData = await createResponse.json();
      poolId = gymData._id;
      const depositAddress = gymData.depositAddress;
      
      if (!depositAddress) {
        throw new Error('No deposit address returned from server');
      }
      
      // Step 2: Prepare transaction to deposit address
      currentStep = 'extracting';
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
      
      // Create a transfer transaction (1 SOL)
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: $walletStore.publicKey,
          toPubkey: new PublicKey(depositAddress),
          lamports: 1 * LAMPORTS_PER_SOL
        })
      );

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = $walletStore.publicKey;

      // Step 3: Send transaction
      currentStep = 'engineering';
      const signature = await $walletStore.sendTransaction(
        transaction,
        connection,
        { maxRetries: 5 }
      );

      // Step 4: Confirm transaction
      currentStep = 'designing';
      await connection.confirmTransaction(signature, 'confirmed');
      
      // Step 5: Refresh pool to update balance
      currentStep = 'notifying';
      
      const refreshResponse = await fetch('/api/forge/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: poolId
        })
      });
      
      if (!refreshResponse.ok) {
        console.warn('Failed to refresh pool balance, but gym was created');
      }
      
      // Step 6: Finalize
      currentStep = 'finalizing';
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
      
      success = true;
    } catch (err: any) {
      console.error('Error creating gym:', err);
      error = err?.message || 'An unknown error occurred';
    } finally {
      loading = false;
      currentStep = '';
    }
  }
</script>

<!-- Quick Info Banner -->
<div class="border-b border-purple-900/20 bg-gradient-to-r from-purple-600/10 to-blue-600/10">
  <div class="mx-auto max-w-6xl px-4 py-3 text-center">
    <div class="flex items-center justify-center gap-2 text-sm">
      <Sparkles class="h-4 w-4 text-purple-400" />
      <span class="text-gray-300">Create your own AI agent training gym for just 1 SOL</span>
    </div>
  </div>
</div>

<div class="min-h-screen bg-black pb-24 text-white">
  <div class="mx-auto max-w-3xl px-4 pt-16">
    <!-- Hero Section -->
    <div class="mb-12 text-center">
      <h1
        class="mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-5xl font-bold text-transparent md:text-6xl"
      >
        Create AI Agent Gym
      </h1>
      <p class="mx-auto mb-8 max-w-2xl text-xl text-gray-400">
        Build your own training environment to collect demonstrations for your AI agents.
      </p>
    </div>

    {#if !success}
      <!-- Processing Steps -->
      {#if loading}
        <Card class="mb-8">
          <h3 class="text-xl font-semibold mb-4 text-purple-400">Creating Your Gym</h3>
          <div class="space-y-4">
            {#each steps as step}
              <div class="flex items-center gap-3">
                {#if currentStep === step.id}
                  <div class="h-5 w-5 flex-shrink-0">
                    <Loader2 class="animate-spin h-5 w-5 text-purple-400" />
                  </div>
                  <p class="text-purple-300">{step.message}</p>
                {:else if steps.findIndex(s => s.id === currentStep) > steps.findIndex(s => s.id === step.id)}
                  <div class="h-5 w-5 flex-shrink-0">
                    <CheckCircle class="h-5 w-5 text-green-400" />
                  </div>
                  <p class="text-gray-400">{step.message}</p>
                {:else}
                  <div class="h-5 w-5 flex-shrink-0">
                    <div class="h-3 w-3 rounded-full bg-gray-700 mx-auto my-1"></div>
                  </div>
                  <p class="text-gray-600">{step.message}</p>
                {/if}
              </div>
            {/each}
          </div>
        </Card>
      {/if}

      <Card class="mb-8">
        <div class="mb-8">
          <h3 class="mb-6 flex items-center gap-2 text-xl font-bold">
            <Dumbbell class="h-6 w-6 text-purple-400" />
            Gym Details
          </h3>
          
          <!-- Gym Name Input -->
          <label class="block text-sm font-medium mb-4 text-gray-300">
            Gym Name
            <input
              type="text"
              bind:value={gymName}
              placeholder="Enter a name for your gym"
              class="mt-2 block w-full rounded-md bg-black/50 border border-purple-900/30 text-gray-100 
                    focus:border-purple-500 focus:ring-purple-500 focus:ring-1 focus:outline-none
                    placeholder-gray-500 appearance-none p-2"
            />
          </label>

          <!-- Skills Textarea -->
          <label class="block text-sm font-medium mb-6 text-gray-300">
            Skills to Train
            <textarea
              bind:value={skills}
              placeholder="List the skills you want to train your AI agent on (one per line)..."
              rows="6"
              class="mt-2 block w-full rounded-md bg-black/50 border border-purple-900/30 text-gray-100 
                    focus:border-purple-500 focus:ring-purple-500 focus:ring-1 focus:outline-none
                    placeholder-gray-500 appearance-none p-2 resize-none"
            ></textarea>
          </label>
        </div>

        <div class="mb-8">
          <h3 class="mb-6 flex items-center gap-2 text-xl font-bold">
            <Coins class="h-6 w-6 text-purple-400" />
            Treasury Token
          </h3>
          
          <!-- Token Type Selection -->
          <div class="space-y-3 mb-6">
            {#each tokenOptions as option}
              <label class="flex items-center space-x-3 p-3 rounded-lg {!option.disabled ? 'bg-purple-900/20 border border-purple-800/30' : 'opacity-50'}">
                <input 
                  type="radio" 
                  bind:group={tokenType} 
                  value={option.value} 
                  on:change={handleTokenTypeChange}
                  disabled={option.disabled}
                  class="text-purple-600 focus:ring-purple-500 h-4 w-4"
                />
                <span class={option.disabled ? "text-gray-500" : "text-gray-200 font-medium"}>
                  {option.label}
                </span>
              </label>
            {/each}
          </div>
          
          {#if tokenType === 'CUSTOM'}
            <div class="mt-3">
              <label class="block text-sm font-medium mb-2 text-gray-400">
                Custom Token Address
                <input
                  type="text"
                  bind:value={customTokenAddress}
                  placeholder="Enter token address"
                  class="mt-2 block w-full rounded-md bg-black/50 border border-purple-900/30 text-gray-100 
                        focus:border-purple-500 focus:ring-purple-500 focus:ring-1 focus:outline-none
                        placeholder-gray-500 appearance-none p-2"
                />
              </label>
            </div>
          {/if}
        </div>

        <!-- Wallet Status -->
        <div class="bg-black/30 rounded-lg p-4 shadow-xl mb-6 border border-purple-900/30">
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-400">Wallet Status:</span>
            {#if $walletStore.connected}
              <span class="text-sm text-green-400 font-medium">Connected: {$walletStore.publicKey?.toString().slice(0, 6)}...{$walletStore.publicKey?.toString().slice(-4)}</span>
            {:else}
              <span class="text-sm text-red-400 font-medium">Not Connected</span>
            {/if}
          </div>
        </div>

        <!-- Create Button -->
        <button
          on:click={handleCreateGym}
          disabled={loading || !$walletStore.connected}
          class="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full py-3 px-4 
                hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 font-semibold shadow-lg
                transition duration-200 ease-in-out transform hover:scale-[1.02]"
        >
          {#if loading}
            <span class="flex items-center justify-center">
              <Loader2 class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
              Processing...
            </span>
          {:else}
            Create AI Agent Gym for 1 SOL
          {/if}
        </button>

        <!-- Error Message -->
        {#if error}
          <div class="mt-4 p-4 bg-red-900/30 border border-red-800 rounded-md flex items-start gap-3">
            <AlertCircle class="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
            <p class="text-red-300 text-sm">{error}</p>
          </div>
        {/if}
      </Card>

      <!-- Benefits Section -->
      <div class="grid gap-8 mb-8 md:grid-cols-2">
        <Card>
          <h3 class="mb-6 flex items-center gap-2 text-xl font-bold">
            <Dumbbell class="h-6 w-6 text-purple-400" />
            Training & Data
          </h3>
          <ul class="space-y-4 text-gray-300">
            <li class="flex gap-2">
              <ArrowRight class="h-5 w-5 flex-shrink-0 text-purple-400" />
              <span>Collect high-quality demonstrations</span>
            </li>
            <li class="flex gap-2">
              <ArrowRight class="h-5 w-5 flex-shrink-0 text-purple-400" />
              <span>Train agents on specific skills</span>
            </li>
            <li class="flex gap-2">
              <ArrowRight class="h-5 w-5 flex-shrink-0 text-purple-400" />
              <span>Customize training environments</span>
            </li>
          </ul>
        </Card>

        <Card>
          <h3 class="mb-6 flex items-center gap-2 text-xl font-bold">
            <Brain class="h-6 w-6 text-purple-400" />
            AI Development
          </h3>
          <ul class="space-y-4 text-gray-300">
            <li class="flex gap-2">
              <ArrowRight class="h-5 w-5 flex-shrink-0 text-purple-400" />
              <span>Build specialized AI agents</span>
            </li>
            <li class="flex gap-2">
              <ArrowRight class="h-5 w-5 flex-shrink-0 text-purple-400" />
              <span>Access VM-1 training capabilities</span>
            </li>
            <li class="flex gap-2">
              <ArrowRight class="h-5 w-5 flex-shrink-0 text-purple-400" />
              <span>Leverage community demonstrations</span>
            </li>
          </ul>
        </Card>
      </div>

    {:else}
      <!-- Success Message -->
      <Card class="mb-8">
        <div class="flex items-center gap-3 mb-4">
          <CheckCircle class="h-6 w-6 text-green-400" />
          <h3 class="text-xl font-semibold text-green-400">Gym Created Successfully!</h3>
        </div>
        
        <p class="text-gray-300 mb-6">
          Your AI agent gym "{gymName}" has been created successfully. You can now manage it from the dashboard.
        </p>
        
        <div class="bg-black/30 rounded-lg p-4 mb-6 border border-purple-900/30">
          <h4 class="text-sm font-medium text-gray-400 mb-2">Gym ID</h4>
          <p class="font-mono text-purple-300">{poolId}</p>
        </div>
        
        <div class="flex gap-4">
          <a 
            href="/gym" 
            class="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full py-3 px-4 
                  hover:from-purple-700 hover:to-blue-700 font-semibold shadow-lg text-center
                  transition duration-200 ease-in-out transform hover:scale-[1.02]"
          >
            Go to Training Gym
          </a>
          
          <button 
            on:click={() => {
              gymName = '';
              skills = '';
              success = false;
              poolId = '';
            }}
            class="flex-1 bg-black/60 backdrop-blur-sm border-2 border-purple-500/50 text-purple-300 
                  hover:text-white hover:border-purple-400 hover:bg-purple-900/40 rounded-full py-3 px-4
                  font-semibold shadow-lg transition-all hover:scale-105"
          >
            Create Another Gym
          </button>
        </div>
      </Card>
    {/if}
  </div>

  <!-- Background effects -->
  <div class="fixed inset-0 -z-10 bg-gradient-to-b from-purple-900/20 to-black"></div>
  <div
    class="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"
  ></div>
</div>
