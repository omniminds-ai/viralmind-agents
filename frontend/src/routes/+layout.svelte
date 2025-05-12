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

  const title = $derived.by(() => {
    let pre = 'OmniMinds.ai';
    const route = page.route.id?.split('/')[1];
    if (route) {
      pre += ' - ' + route[0].toUpperCase() + route.slice(1, route.length);
    }
    return pre;
  });
</script>

<svelte:head>
  <!-- HTML Meta Tags -->
  <title>{title}</title>
  <meta name="description" content="Training the Next AI Workforce." />

  <!-- Facebook Meta Tags -->
  <meta property="og:url" content={page.url.toString()} />
  <meta property="og:type" content="website" />
  <meta property="og:title" content={title} />
  <meta property="og:description" content="Training the Next AI Workforce." />
  <meta property="og:image" content="/favicon.png" />

  <!-- Twitter Meta Tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta property="twitter:domain" content="omnimindsai" />
  <meta property="twitter:url" content={page.url.toString()} />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content="Training the Next AI Workforce." />
  <meta name="twitter:image" content="/favicon.png" />
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
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-YHVTLY9G7H"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      dataLayer.push(arguments);
    }
    gtag('js', new Date());

    gtag('config', 'G-YHVTLY9G7H');
  </script>
</div>
