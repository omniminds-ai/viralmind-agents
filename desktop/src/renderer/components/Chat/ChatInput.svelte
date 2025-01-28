
<script lang="ts">
import { sendMessage } from '../../stores/chat';
import { Camera, Send } from 'lucide-svelte';

let input = '';
let loading = false;

async function handleSubmit() {
    if (!input.trim()) return;
    
    loading = true;
    try {
        await sendMessage(input);
        input = '';
    } finally {
        loading = false;
    }
}

async function handleScreenshot() {
    loading = true;
    try {
        const result = await window.electronAPI.takeScreenshot();
        if (result.success && result.path) {
            await sendMessage(input || '', result.path);
            input = '';
        }
    } finally {
        loading = false;
    }
}
</script>

<div class="relative p-4 app-region-no-drag">
    <div class="relative flex items-center bg-stone-100/60 dark:bg-stone-800/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/10 overflow-hidden transition-all duration-200 focus-within:shadow-purple-500/25 focus-within:shadow-lg focus-within:border-purple-500/50">
        <input
            class="flex-grow py-3 px-4 bg-transparent border-0 focus:outline-none dark:text-white placeholder-stone-500 dark:placeholder-stone-400 transition-all duration-200"
            bind:value={input}
            placeholder="Type a message..."
            on:keydown={(e) => e.key === 'Enter' && handleScreenshot()}
            disabled={loading}
        />
        <div class="flex items-center gap-2 pr-3">
            <button
                class="p-2 text-stone-500 hover:text-purple-500 disabled:opacity-50 transition-colors duration-200"
                on:click={handleScreenshot}
                disabled={loading}
                title="Take screenshot"
            >
                <Camera size={20} />
            </button>
            <button
                class="p-2 text-stone-500 hover:text-purple-500 disabled:opacity-50 transition-colors duration-200"
                on:click={handleSubmit}
                disabled={loading || !input.trim()}
                title="Send message"
            >
                <Send size={20} />
            </button>
        </div>
    </div>
</div>
