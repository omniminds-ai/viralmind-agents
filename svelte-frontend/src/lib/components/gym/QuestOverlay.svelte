<script lang="ts">
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';

    export let quest: string = '';
    export let hint: string = '';
    export let isHintActive: boolean = true;

    let overlayPosition: 'left' | 'right' = 'left';
    let mouseX = 0;

    let container: HTMLElement;

    function handleMouseMove(e: MouseEvent) {
        if (!container) return;
        
        // Get container bounds
        const rect = container.getBoundingClientRect();
        // Get relative mouse position
        mouseX = e.clientX - rect.left;
        // Move overlay to opposite side when mouse is near
        overlayPosition = mouseX > rect.width / 2 ? 'left' : 'right';
    }

    onMount(() => {
        // Find the VNC stream container
        container = document.querySelector('.relative.w-full.h-full') as HTMLElement;
        if (container) {
            container.addEventListener('mousemove', handleMouseMove);
            return () => {
                container?.removeEventListener('mousemove', handleMouseMove);
            };
        }
    });
</script>

<div 
    class="absolute top-4 {overlayPosition === 'left' ? 'left-4' : 'right-4'} z-50 max-w-[300px] transition-all duration-300 ease-in-out"
    transition:fade
>
    <div class="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg">
        <div class="mb-4">
            <h3 class="text-lg font-semibold text-gray-800 mb-2">Current Quest</h3>
            <p class="text-gray-900">{quest}</p>
        </div>
        
        {#if hint}
            <div class="mt-2">
                <h4 class="text-sm font-medium text-gray-700 mb-1">Hint</h4>
                <p class="text-sm {isHintActive ? 'text-gray-800' : 'text-gray-400'}">
                    {hint}
                </p>
            </div>
        {/if}
    </div>
</div>
