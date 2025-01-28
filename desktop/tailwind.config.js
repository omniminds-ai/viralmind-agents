/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/renderer/**/*.{html,js,svelte,ts}'],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: '#4a9eff',
            },
        },
    },
    plugins: [],
}