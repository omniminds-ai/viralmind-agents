import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
  // Enable runes
  runes: true,
  
  // Enable use:action
  compilerOptions: {
    runes: true
  },

  // Enable Tailwind preprocessing
  preprocess: vitePreprocess()
};