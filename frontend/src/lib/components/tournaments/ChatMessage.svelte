<script lang="ts">
  import type { TournamentMessage } from '$lib/types';
  import { renderToolAction } from '$lib/utils/toolActions';

  let {
    messages,
    agentPfp,
    last
  }: { messages: TournamentMessage[]; agentPfp: string; last: boolean } = $props();

  // Convert reactive declarations to derived runes
  const firstMessage = $derived(messages[0]);
  const lastMessage = $derived(messages[messages.length - 1]);
  const isAgent = $derived(firstMessage.role === 'assistant');
  const isPlayer = $derived(firstMessage.role === 'player');

  // Convert the complex reactive declaration to derived
  const allContent = $derived(
    messages.map((msg) => {
      const toolActionRegex = /<(\w+)>([^<]+)<\/\1>/g;
      const toolActions = [...msg.content.matchAll(toolActionRegex)].map((match) => ({
        action: match[1],
        value: match[2]
      }));
      const displayContent = msg.content.replace(toolActionRegex, '').trim();
      return { displayContent, toolActions };
    })
  );

  function getJdenticonUrl(address: string) {
    return `data:image/svg+xml;utf8,${encodeURIComponent(`<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" fill="hsl(${parseInt(address.slice(2, 8), 16) % 360}, 70%, 60%)"/></svg>`)}`;
  }
</script>

<div class={`flex items-start gap-3 `}>
  <!-- Avatar -->
  <div class="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full border border-white">
    {#if isAgent}
      <img
        src={isAgent
          ? 'https://viralmind.ai' + agentPfp
          : getJdenticonUrl(firstMessage.address || '')}
        alt="Agent"
        class="h-full w-full object-cover"
      />
    {:else if isPlayer}
      <img
        src={`https://mc-heads.net/avatar/${firstMessage.display_name}`}
        alt="Agent"
        class="h-full w-full object-cover"
      />
    {:else if firstMessage.address}
      <img src={getJdenticonUrl(firstMessage.address)} alt="User" class="h-full w-full" />
    {/if}
  </div>

  <div class="min-w-0 flex-1">
    <!-- min-w-0 prevents flex item from overflowing -->
    <div
      class="{isAgent
        ? 'bg-purple-800/20' // Agent messages - dark, slightly transparent
        : 'bg-stone-800/30'}
        {last ? 'border-2 border-yellow-500' : ''}
        rounded-xl p-3"
    >
      {#each allContent as content, i}
        {#if content.displayContent}
          <p class="whitespace-pre-wrap break-words {i < allContent.length - 1 ? 'mb-2' : ''}">
            {content.displayContent}
          </p>
        {/if}

        {#if content.toolActions.length > 0}
          <div
            class="space-y-1 rounded-xl bg-black/50 p-1 px-2 text-sm text-gray-400 {i <
            allContent.length - 1
              ? 'mb-2'
              : ''}"
          >
            {#each content.toolActions as { action, value }}
              <div class="break-words">{renderToolAction(action, value)}</div>
            {/each}
          </div>
        {/if}
      {/each}

      {#if lastMessage.screenshot && isAgent}
        <img
          src={'https://viralmind.ai' + lastMessage.screenshot.url}
          alt="Action Screenshot"
          class="mt-2 w-full rounded-lg"
        />
      {/if}
    </div>
    <div class="mt-1 flex items-center gap-2 text-xs text-gray-500">
      <span>{new Date(lastMessage.date).toLocaleTimeString()}</span>
      {#if isAgent}
        <span class="font-mono text-purple-400/70">
          {firstMessage.challenge}
        </span>
      {:else if isPlayer}
        <span class="font-mono text-purple-400/70">
          {firstMessage.display_name}
        </span>
      {:else}
        <span class="font-mono text-purple-400/70">
          {firstMessage.address?.slice(0, 4)}...{firstMessage.address?.slice(-4)}
        </span>
      {/if}
    </div>
  </div>
</div>
