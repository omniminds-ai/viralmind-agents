
<script lang="ts">
  import ChatInput from './ChatInput.svelte';
  import ChatMessage from './ChatMessage.svelte';
  import { chatMessages } from '../../stores/chat';
  import { selectedModel } from '../../stores/settings';
  import type { ChatMessage as ChatMessageType } from '@/shared/types';
  
  let messagesDiv: HTMLDivElement;
  
  $effect(() => {
    if (messagesDiv && $chatMessages) {
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
  });
</script>

<div class="flex flex-col h-screen w-full">
  <div class="flex items-center justify-end p-4 app-region-drag">
    <select
      class="app-region-no-drag bg-stone-100/60 dark:bg-stone-800/60 backdrop-blur-md rounded-xl px-3 py-1.5 text-sm border border-white/10 text-stone-700 dark:text-stone-300 focus:outline-none focus:border-purple-500/50"
      bind:value={$selectedModel}
    >
      <option value="deepseek-viralmind-dpo">DeepSeek-ViralMind-DPO-72B</option>
    </select>
  </div>
<style>
  .messages-container {
    scrollbar-width: thin;
    scrollbar-color: rgba(147, 51, 234, 0.3) transparent;
  }

  .messages-container::-webkit-scrollbar {
    width: 8px;
  }

  .messages-container::-webkit-scrollbar-track {
    background: transparent;
  }

  .messages-container::-webkit-scrollbar-thumb {
    background-color: rgba(147, 51, 234, 0.3);
    border-radius: 20px;
    border: 2px solid transparent;
    background-clip: padding-box;
  }

  .messages-container::-webkit-scrollbar-thumb:hover {
    background-color: rgba(147, 51, 234, 0.5);
  }
</style>

<div 
    class="flex-grow overflow-y-auto px-4 py-6 flex flex-col gap-4 messages-container" 
    bind:this={messagesDiv}
    style="background: linear-gradient(to bottom, rgba(255,255,255,0.3), rgba(255,255,255,0.1)) dark:bg-gradient-to-b dark:from-[rgba(60,60,60,0.3)] dark:to-[rgba(30,30,30,0.1)]"
  >
    {#each $chatMessages as message}
      <ChatMessage {message} />
    {/each}
  </div>
  <ChatInput />
</div>
