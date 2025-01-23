import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],

  theme: {
    extend: {
      keyframes: {
        'side-to-side': {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(30%)' }
        }
      },
      animation: {
        'side-to-side': 'side-to-side .70s ease-in-out infinite'
      }
    }
  },

  plugins: [typography]
} satisfies Config;
