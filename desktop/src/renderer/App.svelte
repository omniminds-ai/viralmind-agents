<script lang="ts">
    import { onDestroy } from 'svelte';
    import ChatWindow from './components/Chat/ChatWindow.svelte';
    import { theme } from './stores/settings';
    import { chatMessages } from './stores/chat';

    onDestroy(() => {
        if ('destroy' in chatMessages) {
            (chatMessages as { destroy: () => void }).destroy();
        }
    });
</script>

<main class={`min-h-screen ${$theme}`}>
    <ChatWindow />
</main>
