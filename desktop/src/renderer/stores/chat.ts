
import { writable } from 'svelte/store';
import { chatWithAgent } from '../lib/api';
import type { AgentMessage, ChatMessage } from '@/shared/types';

// Create a custom store with cleanup
const createChatStore = () => {
  const { subscribe, update } = writable<ChatMessage[]>([]);

  // Set up agent message listener
  const cleanup = window.electronAPI.onAgentMessage((message: AgentMessage) => {
    update(messages => [...messages, {
      role: 'assistant',
      content: message.content,
      action: message.action
    }]);
  });

  return {
    subscribe,
    update,
    destroy: () => {
      cleanup();
    }
  };
};

export const chatMessages = createChatStore();

export const sendMessage = async (message: string, screenshot: string | undefined = undefined) => {
  // Add user message
  chatMessages.update(messages => [...messages, { 
    role: 'user', 
    content: message,
    screenshot 
  }]);

  try {
    // Start agent execution
    await chatWithAgent(message, screenshot);
  } catch (error) {
    console.error('Error sending message:', error);
    chatMessages.update(messages => [...messages, { 
      role: 'assistant', 
      content: 'Sorry, there was an error processing your request.' 
    }]);
  }
};
