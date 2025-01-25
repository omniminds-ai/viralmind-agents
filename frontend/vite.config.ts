import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [sveltekit()],
  resolve: {
    alias: {
      buffer: 'buffer/'
    }
  },
  optimizeDeps: {
    include: ['buffer']
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true
    },
    proxy: {
      '/socket.io': {
        target: 'http://backend:8001',
        ws: true
      }
    }
  }
});
