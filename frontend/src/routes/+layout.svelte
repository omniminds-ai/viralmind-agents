<script lang="ts">
  import '../app.css';
  import Navbar from '$lib/components/Navbar.svelte';
  import GymHeader from '$lib/components/GymHeader.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import { page } from '$app/state';
  import WalletProvider from '$lib/components/solana/WalletProvider.svelte';
  import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
  import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';

  let { children } = $props();

  const localStorageKey = 'walletAdapter';
  const walletAdapters = [new PhantomWalletAdapter(), new SolflareWalletAdapter()];

  const isGymRoute = $derived(page.url.pathname.startsWith('/gym'));
  const isTournamentRoute = $derived(page.url.pathname.startsWith('/tournament'));
</script>

<svelte:head>
  <!-- HTML Meta Tags -->
  <title>viralmind.ai</title>
  <meta name="description" content="The Next Meta in Agentic AI." />

  <!-- Facebook Meta Tags -->
  <meta property="og:url" content="https://viralmind.ai" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="viralmind.ai" />
  <meta property="og:description" content="The Next Meta in Agentic AI." />
  <meta property="og:image" content="https://viralmind.ai/favicon.png" />

  <!-- Twitter Meta Tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta property="twitter:domain" content="viralmind.ai" />
  <meta property="twitter:url" content="https://viralmind.ai" />
  <meta name="twitter:title" content="viralmind.ai" />
  <meta name="twitter:description" content="The Next Meta in Agentic AI." />
  <meta name="twitter:image" content="https://viralmind.ai/favicon.png" />
</svelte:head>

<WalletProvider {localStorageKey} wallets={walletAdapters} autoConnect />
<div class="bg-white">
  {#if isGymRoute}
    <GymHeader />
  {:else}
    <Navbar />
  {/if}
  {@render children()}
  {#if !isTournamentRoute}
    <Footer />
  {/if}
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-TQ5Z1BBEGG"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      dataLayer.push(arguments);
    }
    gtag('js', new Date());

    gtag('config', 'G-TQ5Z1BBEGG');
  </script>
</div>
