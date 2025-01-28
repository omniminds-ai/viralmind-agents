
<script lang="ts">
    import type { ChatMessage } from '@/shared/types';
    import { 
        MousePointer2, 
        Type, 
        KeyRound,
        ScrollText,
        Clock,
        UserRound,
        CheckCircle2,
        Command
    } from 'lucide-svelte';
    
    let { message } = $props<{
        message: ChatMessage;
    }>();

    const getActionIcon = (type: string) => {
        switch(type) {
            case 'click':
            case 'left_click':
            case 'right_click':
            case 'left_double':
            case 'drag':
                return MousePointer2;
            case 'type':
                return Type;
            case 'hotkey':
                return KeyRound;
            case 'scroll':
                return ScrollText;
            case 'wait':
                return Clock;
            case 'call_user':
                return UserRound;
            case 'finished':
                return CheckCircle2;
            default:
                return Command;
        }
    };
</script>
  
<div class="message {message.role === 'user' ? 'ml-auto bg-purple-500/80 backdrop-blur-md text-white' : 'mr-auto bg-white/60 dark:bg-stone-800/60 backdrop-blur-md dark:text-white'} p-4 rounded-2xl max-w-[80%] shadow-lg border border-white/10">
    <div class="content text-sm leading-relaxed">
        {#if message.action}
            <div class="flex items-start gap-3 mb-2">
                <div class="p-2 rounded-lg bg-purple-500/20 dark:bg-purple-500/10">
                    <svelte:component 
                        this={getActionIcon(message.action.type)} 
                        size={16} 
                        class="text-purple-500"
                    />
                </div>
                <div class="flex-1">
                    <div class="font-medium text-purple-500 mb-1">
                        {message.action.type}
                    </div>
                    <div class="text-xs opacity-75">
                        {Object.entries(message.action.inputs).map(([key, value]) => `${key}: ${value}`).join(', ')}
                    </div>
                </div>
            </div>
        {/if}
        {message.content}
    </div>
    {#if message.screenshot}
        <img 
        src={message.screenshot} 
        alt="Screenshot" 
        class="max-w-full rounded mt-2"
        />
    {/if}
</div>
