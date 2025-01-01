<script lang="ts">
  import { Send, AlertCircle, MessageSquare, X } from 'lucide-svelte';
  import ChatMessage from './ChatMessage.svelte';
  import type { Tournament, TournamentMessage } from '$lib/types';
  import { onMount } from 'svelte';
  import { processPayment } from '$lib/solana/chatPayment';
  import { walletStore } from '$lib/walletStore';

  const groupConsecutiveMessages = (messages: TournamentMessage[]) => {
    const groups: TournamentMessage[][] = [];
    let currentGroup: TournamentMessage[] = [];

    messages.forEach((message, index) => {
      const nextMessage = messages[index + 1];

      // Start or add to current group
      currentGroup.push(message);

      // Check if we should end the current group
      const shouldEndGroup =
        !nextMessage ||
        nextMessage.role !== message.role ||
        nextMessage.address !== message.address ||
        // If more than 2 minutes between messages, start new group
        new Date(nextMessage.date).getTime() - new Date(message.date).getTime() > 120000;

      if (shouldEndGroup) {
        groups.push(currentGroup);
        currentGroup = [];
      }
    });

    return groups;
  };

  interface ChatSidebarProps {
    messages: TournamentMessage[];
    messagePrice: number;
    usdMessagePrice: number;
    timeLeft: string;
    actionsPerMessage: number;
    onSendMessage: (message: string) => void;
    agentPfp: string;
    status: Tournament['challenge']['status'];
    tournamentPDA: string;
    programId: string;
    challengeName: string;
  }

  let {
    messages,
    messagePrice,
    usdMessagePrice,
    timeLeft,
    actionsPerMessage,
    onSendMessage,
    agentPfp,
    status,
    tournamentPDA,
    programId,
    challengeName
  }: ChatSidebarProps = $props();
  const groupedMessages = $derived(groupConsecutiveMessages(messages));

  let messageInput = $state('');
  let chatContainer: HTMLDivElement;
  let isMobileOpen = $state(false);
  let paymentError = $state('');
  let isProcessingPayment = $state(false);

  onMount(() => {
    if (status === 'concluded')
      chatContainer.scroll({ top: chatContainer.scrollHeight, behavior: 'smooth' });
  });

  const formatSOL = (amount: number) => amount.toFixed(3);
  const formatUSD = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleSend = async () => {
    if (!messageInput.trim()) return;
    if (!$walletStore.connected) {
      paymentError = 'Please connect your wallet first';
      return;
    }

    const message = messageInput;
    isProcessingPayment = true;
    paymentError = '';

    try {
      await processPayment(message, {
        messagePrice,
        tournamentPDA,
        programId,
        challengeName,
        onSuccess: () => {
          onSendMessage(message);
          messageInput = '';
          setTimeout(() => {
            if (chatContainer) {
              chatContainer.scrollTop = chatContainer.scrollHeight;
            }
          }, 0);
        },
        onError: (error: string) => {
          paymentError = error;
        }
      });
    } catch (err) {
      console.error('Failed to send message:', err);
      paymentError = err instanceof Error ? err.message : 'Failed to send message';
    } finally {
      isProcessingPayment = false;
    }
  };

  const toggleMobileChat = () => {
    isMobileOpen = !isMobileOpen;
  };
</script>

<!-- Mobile Toggle Button -->
<button
  class="fixed bottom-6 right-6 z-50 rounded-full bg-purple-500 p-4 text-white shadow-lg transition-all hover:bg-purple-600 lg:hidden"
  onclick={toggleMobileChat}
>
  {#if isMobileOpen}
    <X class="h-6 w-6" />
  {:else}
    <MessageSquare class="h-6 w-6" />
  {/if}
</button>

<!-- Chat Sidebar -->
<div
  class="fixed bottom-0 right-0 top-[64px] w-[400px] max-w-full transition-all duration-300
           lg:translate-x-0 {isMobileOpen ? 'translate-x-0' : 'translate-x-full'}
           flex flex-col border-l border-white/10 bg-black/50 backdrop-blur-xl"
>
  <!-- Chat Stats -->
  <div class="space-y-4 border-b border-white/10 p-4">
    <div>
      <div class="text-sm font-medium text-gray-400">
        {status === 'upcoming' ? 'TOURNAMENT STARTS IN' : 'TIME REMAINING'}
      </div>
      <div class="mt-1 flex items-baseline gap-2">
        <div class="font-mono text-2xl font-bold">{timeLeft}</div>
        {#if status === 'active'}
          <div class="text-xs text-gray-500">MESSAGES EXTEND TIMER TO 1HR IF UNDER</div>
        {/if}
      </div>
    </div>
    <div>
      <div class="text-sm font-medium text-gray-400">MESSAGE PRICE</div>
      <div class="mt-1 flex items-baseline gap-2">
        <div class="font-mono text-xl font-bold">{formatSOL(messagePrice)} SOL</div>
        <div class="text-gray-500">({formatUSD(usdMessagePrice)})</div>
      </div>
    </div>
    <div>
      <div class="text-sm font-medium text-gray-400">ACTIONS PER MESSAGE</div>
      <div class="mt-1 font-mono text-xl font-bold">{actionsPerMessage}</div>
    </div>
  </div>

  <!-- Messages -->
  <div bind:this={chatContainer} class="chat-container flex-1 space-y-4 overflow-y-auto p-4">
    {#each groupedMessages as grouped, i}
      <ChatMessage messages={grouped} {agentPfp} last={i === groupedMessages.length - 1} />
    {/each}
  </div>

  <!-- Message Input -->
  <div class="border-t border-white/10 p-4">
    <div
      class="flex items-center gap-2 rounded-2xl bg-black/30 px-4 py-3 transition-all focus-within:ring-2 focus-within:ring-purple-400/50"
    >
      {#if status === 'active'}
        <input
          type="text"
          bind:value={messageInput}
          placeholder="Type a message..."
          class="min-w-0 flex-1 bg-transparent text-sm outline-none"
          onkeydown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button
          onclick={handleSend}
          class="p-1 text-purple-400 transition-colors hover:text-purple-300"
        >
          <Send class="h-5 w-5" />
        </button>
      {:else if status === 'upcoming'}
        <div class="flex flex-col">
          <p>Tournament hasn't started yet! 🎮</p>
          <p class="text-sm text-white/50">Come back when the tournament begins.</p>
        </div>
      {:else}
        <div class="flex flex-col">
          <p>Tournament Concluded! 🎉</p>
          <p class="text-sm text-white/50">Stay tuned for more in the future.</p>
        </div>
      {/if}
    </div>
    {#if status === 'active'}
      <div class="mt-2 space-y-2">
        <div class="flex items-center gap-1 px-1 text-xs text-gray-500">
          <AlertCircle class="h-3 w-3" />
          Messages cost {formatSOL(messagePrice)} SOL
        </div>
        {#if paymentError}
          <div class="px-1 text-xs text-red-400">
            {paymentError}
          </div>
        {/if}
        {#if isProcessingPayment}
          <div class="px-1 text-xs text-purple-400">
            Processing payment...
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .chat-container {
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
  }

  .chat-container::-webkit-scrollbar {
    width: 8px;
  }

  .chat-container::-webkit-scrollbar-track {
    background: transparent;
  }

  .chat-container::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    border: 2px solid transparent;
    background-clip: padding-box;
  }

  .chat-container::-webkit-scrollbar-thumb:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }
</style>
