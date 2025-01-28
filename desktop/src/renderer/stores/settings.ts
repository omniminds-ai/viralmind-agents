import { writable } from 'svelte/store';

export const selectedModel = writable('deepseek-viralmind-dpo');

export const theme = writable<'light' | 'dark'>('light');
